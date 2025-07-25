'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Message } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { Search, X, AlertTriangle, Zap, Copy, Check } from 'lucide-react';
import { socket } from '@/lib/socket';

interface SearchPanelProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSearch: () => void;
    onClose: () => void;
}



export function SearchPanel({
    searchQuery,
    onSearchChange,
    onSearch,
    onClose
}: SearchPanelProps) {
    const [searchResults, setSearchResults] = useState<Message[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchType, setSearchType] = useState<'content' | 'username' | 'room'>('content');
    const [copiedPayload, setCopiedPayload] = useState<string | null>(null);

    useEffect(() => {
        socket.on('search-results', (results: Message[]) => {
            setSearchResults(results);
            setIsSearching(false);
        });

        return () => {
            socket.off('search-results');
        };
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResults([]);

        socket.emit('search-messages', {
            type: searchType,
            value: searchQuery
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const copyPayload = async (payload: string) => {
        try {
            await navigator.clipboard.writeText(payload);
            setCopiedPayload(payload);
            setTimeout(() => setCopiedPayload(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const usePayload = (payload: string) => {
        onSearchChange(payload);
        setSearchType('content');
    };

    return (
        <div className="w-96 border-l bg-card flex flex-col">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Recherche</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex space-x-1 mb-3">
                    {(['content', 'username', 'room'] as const).map((type) => (
                        <Button
                            key={type}
                            variant={searchType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSearchType(type)}
                            className="flex-1"
                        >
                            {type === 'content' ? 'Contenu' : type === 'username' ? 'Utilisateur' : 'Salle'}
                        </Button>
                    ))}
                </div>

                <div className="flex space-x-2">
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Rechercher dans les ${searchType === 'content' ? 'messages' : searchType === 'username' ? 'utilisateurs' : 'salles'}...`}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        size="sm"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            </div>



            <ScrollArea className="flex-1 p-4">
                {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {searchResults.length} résultat(s) trouvé(s)
                        </p>
                        {searchResults.map((message, index) => (
                            <div key={message._id || index} className="border rounded-lg p-3">
                                <ChatMessage
                                    message={message}
                                    isOwn={false}
                                />
                            </div>
                        ))}
                    </div>
                ) : searchQuery && !isSearching ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Aucun résultat trouvé</p>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Aucun résultat trouvé
                        </p>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
} 