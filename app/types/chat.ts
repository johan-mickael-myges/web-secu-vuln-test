export interface Message {
    _id?: string;
    content: string;
    username: string;
    timestamp: Date;
    room?: string;
}

export interface User {
    _id?: string;
    username: string;
    isOnline: boolean;
    lastSeen?: Date;
}

export interface ChatRoom {
    _id?: string;
    name: string;
    messages: Message[];
    users: User[];
    createdAt: Date;
}

export interface ChatState {
    messages: Message[];
    users: User[];
    currentUser: User | null;
    currentRoom: string;
} 