'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { LoginModal } from '@/components/auth/LoginModal';

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<string>('');

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setCurrentUser(savedUser);
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = (username: string) => {
        setCurrentUser(username);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', username);
    };

    const handleLogout = () => {
        setCurrentUser('');
        setIsLoggedIn(false);
        localStorage.removeItem('currentUser');
        router.push('/');
    };

    if (!isLoggedIn) {
        return <LoginModal onLogin={handleLogin} />;
    }

    return (
        <div className="h-screen bg-background">
            <ChatInterface
                currentUser={currentUser}
                onLogout={handleLogout}
                initialRoom={roomId}
            />
        </div>
    );
} 