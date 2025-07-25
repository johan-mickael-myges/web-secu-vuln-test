import { getCollection } from '../lib/mongodb';
import { Message } from '../types/chat';

export class MessageService {
    private static instance: MessageService;
    private collection: any;

    private constructor() { }

    public static getInstance(): MessageService {
        if (!MessageService.instance) {
            MessageService.instance = new MessageService();
        }
        return MessageService.instance;
    }

    private async getCollection() {
        if (!this.collection) {
            this.collection = await getCollection('messages');
        }
        return this.collection;
    }

    async getMessagesByUsername(username: string): Promise<Message[]> {
        const collection = await this.getCollection();

        let query;
        try {
            const parsedUsername = JSON.parse(username);
            query = { username: parsedUsername };
        } catch {
            query = { username: username };
        }

        return await collection.find(query).limit(100).toArray();
    }

    async getMessagesByContent(content: string): Promise<Message[]> {
        const collection = await this.getCollection();

        let query;
        try {
            const parsedContent = JSON.parse(content);
            query = { content: parsedContent };
        } catch {
            query = { content: { $regex: content, $options: 'i' } };
        }

        return await collection.find(query).limit(100).toArray();
    }

    async getMessagesByRoom(room: string): Promise<Message[]> {
        const collection = await this.getCollection();

        let query;
        try {
            const parsedRoom = JSON.parse(room);
            query = { room: parsedRoom };
        } catch {
            query = { room: room };
        }

        return await collection.find(query).limit(100).toArray();
    }

    // Méthode alternative pour la recherche par utilisateur
    async getMessagesByUsernameAlternative(username: string): Promise<Message[]> {
        const collection = await this.getCollection();

        // Validation basique de l'input
        if (typeof username !== 'string' || username.length > 50) {
            throw new Error('Invalid username');
        }

        return await collection.find({ username: username }).toArray();
    }

    async createMessage(message: Omit<Message, '_id' | 'timestamp'>): Promise<Message> {
        const collection = await this.getCollection();

        const newMessage: Message = {
            ...message,
            timestamp: new Date(),
        };



        const result = await collection.insertOne(newMessage);
        return { ...newMessage, _id: result.insertedId.toString() };
    }

    async getAllMessages(): Promise<Message[]> {
        const collection = await this.getCollection();
        return await collection.find({}).sort({ timestamp: -1 }).limit(100).toArray();
    }

    async deleteMessage(messageId: string): Promise<boolean> {
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ _id: messageId });
        return result.deletedCount > 0;
    }
} 