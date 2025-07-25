'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { LoginModal } from '@/components/auth/LoginModal';

export default function Home() {
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
    window.location.href = '/';
  };

  if (!isLoggedIn) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen bg-background">
      <ChatInterface
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
}
