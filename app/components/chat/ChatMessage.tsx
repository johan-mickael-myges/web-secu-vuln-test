'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
    message: Message;
    isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={cn(
            "flex items-start space-x-3",
            isOwn && "flex-row-reverse space-x-reverse"
        )}>
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs">
                    {message.username.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className={cn(
                "flex flex-col max-w-[70%]",
                isOwn && "items-end"
            )}>
                <div className={cn(
                    "flex items-center space-x-2 mb-1",
                    isOwn && "flex-row-reverse space-x-reverse"
                )}>
                    <span className="text-xs font-medium text-muted-foreground">
                        {message.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                    </span>
                </div>

                <div className={cn(
                    "px-4 py-2 rounded-2xl text-sm",
                    isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                )}>
                    {message.content}
                </div>
            </div>
        </div>
    );
} 