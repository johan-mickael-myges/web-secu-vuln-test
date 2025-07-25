import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { MessageService } from "./services/messageService";
import { seedTestData } from "./lib/seedData";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
    // Ajouter des données de test au démarrage
    try {
        await seedTestData();
    } catch (error) {
        console.error('Erreur lors de l\'ajout des données de test:', error);
    }

    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
        path: '/api/socketio',
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const messageService = MessageService.getInstance();

    io.on("connection", (socket) => {
        console.log('User connected:', socket.id);

        // Rejoindre une salle
        socket.on('join-room', (room: string) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });

        // Envoyer un message
        socket.on('send-message', async (data: { content: string; username: string; room: string }) => {
            try {
                const newMessage = await messageService.createMessage(data);

                // Diffuser le message à tous les utilisateurs de la salle
                io.to(data.room).emit('new-message', newMessage);

                console.log(`Message sent in room ${data.room}:`, newMessage);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', 'Failed to send message');
            }
        });

        // Recherche de messages (vulnérable à l'injection NoSQL)
        socket.on('search-messages', async (query: { type: 'username' | 'content' | 'room'; value: string }) => {
            try {
                let messages: any[] = [];

                switch (query.type) {
                    case 'username':
                        messages = await messageService.getMessagesByUsername(query.value);
                        break;
                    case 'content':
                        messages = await messageService.getMessagesByContent(query.value);
                        break;
                    case 'room':
                        messages = await messageService.getMessagesByRoom(query.value);
                        break;
                    default:
                        messages = [];
                }

                socket.emit('search-results', messages);
            } catch (error) {
                console.error('Error searching messages:', error);
                socket.emit('error', 'Failed to search messages');
            }
        });

        // Déconnexion
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
}); 