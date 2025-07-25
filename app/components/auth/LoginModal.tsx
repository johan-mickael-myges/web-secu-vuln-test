'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, User, Lock } from 'lucide-react';

interface LoginModalProps {
    onLogin: (username: string) => void;
}

export function LoginModal({ onLogin }: LoginModalProps) {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            setIsLoading(true);
            // Simuler un délai de connexion
            setTimeout(() => {
                onLogin(username.trim());
                setIsLoading(false);
            }, 500);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Bienvenue sur SecuChat
                        </h1>
                        <p className="text-gray-600">
                            Connectez-vous pour commencer à discuter
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-gray-700">
                                Nom d'utilisateur
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Entrez votre nom d'utilisateur"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !username.trim()}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Connexion...</span>
                                </div>
                            ) : (
                                'Se connecter'
                            )}
                        </Button>
                    </form>

                    {/* Demo Info */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">
                            💡 Démo - Injection NoSQL
                        </h3>
                        <p className="text-xs text-blue-700">
                            Cette application contient des vulnérabilités NoSQL intentionnelles.
                            Essayez des payloads comme: <code className="bg-blue-100 px-1 rounded">{'{"$ne": null}'}</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 