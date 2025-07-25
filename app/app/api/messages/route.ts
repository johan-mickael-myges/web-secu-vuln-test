import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '../../../services/messageService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');
        const content = searchParams.get('content');
        const room = searchParams.get('room');

        const messageService = MessageService.getInstance();

        if (username) {
            // VULNÉRABILITÉ NoSQL: Injection possible
            const messages = await messageService.getMessagesByUsername(username);
            return NextResponse.json(messages);
        }

        if (content) {
            // VULNÉRABILITÉ NoSQL: Injection possible
            const messages = await messageService.getMessagesByContent(content);
            return NextResponse.json(messages);
        }

        if (room) {
            // VULNÉRABILITÉ NoSQL: Injection possible
            const messages = await messageService.getMessagesByRoom(room);
            return NextResponse.json(messages);
        }

        // Récupérer tous les messages
        const messages = await messageService.getAllMessages();
        return NextResponse.json(messages);

    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { content, username, room } = body;

        if (!content || !username) {
            return NextResponse.json(
                { error: 'Content and username are required' },
                { status: 400 }
            );
        }

        const messageService = MessageService.getInstance();
        const newMessage = await messageService.createMessage({
            content,
            username,
            room: room || 'general'
        });

        return NextResponse.json(newMessage, { status: 201 });

    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json(
            { error: 'Failed to create message' },
            { status: 500 }
        );
    }
} 