'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Send,
    Search,
    LogOut,
    MessageCircle,
    Users,
    Settings,
    MoreVertical,
    Paperclip,
    Smile
} from 'lucide-react';
import { Message } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { ChatSidebar } from './ChatSidebar';
import { SearchPanel } from './SearchPanel';
import { socket } from '@/lib/socket';

interface ChatInterfaceProps {
    currentUser: string;
    onLogout: () => void;
    initialRoom?: string;
}

export function ChatInterface({ currentUser, onLogout, initialRoom }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentRoom, setCurrentRoom] = useState(initialRoom || 'general');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Socket.IO connection
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
            socket.emit('join-room', currentRoom);
        });

        socket.on('new-message', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        socket.on('search-results', (results: Message[]) => {
            // Handle search results
            console.log('Search results:', results);
        });

        return () => {
            socket.off('connect');
            socket.off('new-message');
            socket.off('search-results');
        };
    }, [currentRoom]);

    // Load initial messages
    useEffect(() => {
        fetchMessages();
    }, [currentRoom]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/messages?room=${currentRoom}`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            content: newMessage.trim(),
            username: currentUser,
            room: currentRoom,
        };

        socket.emit('send-message', messageData);
        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        socket.emit('search-messages', {
            type: 'content',
            value: searchQuery
        });
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <ChatSidebar
                currentUser={currentUser}
                currentRoom={currentRoom}
                onRoomChange={setCurrentRoom}
                onLogout={onLogout}
                onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="h-16 border-b bg-card flex items-center justify-between px-6">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {currentRoom.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold text-foreground">{currentRoom}</h2>
                            <p className="text-xs text-muted-foreground">
                                {messages.length} messages
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex">
                    <div className="flex-1 flex flex-col">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <ChatMessage
                                        key={message._id || index}
                                        message={message}
                                        isOwn={message.username === currentUser}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="border-t bg-card p-4">
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <div className="flex-1 relative">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Tapez votre message..."
                                        className="pr-20"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                    >
                                        <Smile className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    size="sm"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Search Panel */}
                    {isSearchOpen && (
                        <SearchPanel
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onSearch={handleSearch}
                            onClose={() => setIsSearchOpen(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
} 