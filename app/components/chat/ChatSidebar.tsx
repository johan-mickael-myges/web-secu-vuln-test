'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    MessageCircle,
    Users,
    Settings,
    LogOut,
    Search,
    Plus,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ChatSidebarProps {
    currentUser: string;
    currentRoom: string;
    onRoomChange: (room: string) => void;
    onLogout: () => void;
    onSearchToggle: () => void;
}

interface Room {
    id: string;
    name: string;
    icon: any;
}

const defaultRooms: Room[] = [
    { id: 'general', name: 'Général', icon: MessageCircle },
    { id: 'random', name: 'Random', icon: Users },
    { id: 'tech', name: 'Tech', icon: Settings },
];

export function ChatSidebar({
    currentUser,
    currentRoom,
    onRoomChange,
    onLogout,
    onSearchToggle
}: ChatSidebarProps) {
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>(defaultRooms);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');

    const handleAddRoom = () => {
        if (newRoomName.trim()) {
            const newRoom: Room = {
                id: newRoomName.toLowerCase().replace(/\s+/g, '-'),
                name: newRoomName.trim(),
                icon: MessageCircle
            };
            setRooms(prev => [...prev, newRoom]);
            setNewRoomName('');
            setShowAddRoom(false);
            onRoomChange(newRoom.id);
            router.push(`/room/${newRoom.id}`);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddRoom();
        }
    };

    return (
        <div className="w-80 border-r bg-card flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-foreground">SecuChat</h1>
                    <Button variant="ghost" size="sm" onClick={onSearchToggle}>
                        <Search className="h-4 w-4" />
                    </Button>
                </div>

                {/* Current User */}
                <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {currentUser.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                            {currentUser}
                        </p>
                        <p className="text-xs text-muted-foreground">En ligne</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Rooms */}
            <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-foreground">Salles</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddRoom(true)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-1">
                    {rooms.map((room) => {
                        const Icon = room.icon;
                        return (
                            <Button
                                key={room.id}
                                variant={currentRoom === room.id ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start h-12",
                                    currentRoom === room.id && "bg-secondary"
                                )}
                                onClick={() => {
                                    onRoomChange(room.id);
                                    router.push(`/room/${room.id}`);
                                }}
                            >
                                <Icon className="h-4 w-4 mr-3" />
                                <span className="truncate">{room.name}</span>
                            </Button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t">
                <div className="text-xs text-muted-foreground text-center">
                    <p>SecuChat</p>
                </div>
            </div>

            {/* Add Room Modal */}
            {showAddRoom && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card p-6 rounded-lg w-80">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Nouvelle salle</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAddRoom(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Input
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nom de la salle..."
                            className="mb-4"
                            autoFocus
                        />
                        <div className="flex space-x-2">
                            <Button
                                onClick={handleAddRoom}
                                disabled={!newRoomName.trim()}
                                className="flex-1"
                            >
                                Créer
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowAddRoom(false)}
                                className="flex-1"
                            >
                                Annuler
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 