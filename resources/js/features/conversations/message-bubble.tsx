'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types/conversation';
// use browser Intl for locale-aware time formatting (supports each user's locale/timezone)
import { motion } from 'framer-motion';
import { Bot, Download, File, MapPin, Reply, Smile } from 'lucide-react';
import { useState } from 'react';
import { MessageStatus } from './message-status';

interface MessageBubbleProps {
    message: Message;
    showAvatar?: boolean;
    onAddReaction?: (messageId: string, emoji: string) => void;
    onReplyTo?: (message: Message) => void;
}

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export function MessageBubble({
    message,
    showAvatar = true,
    onAddReaction,
    onReplyTo,
}: MessageBubbleProps) {
    const [showReactions, setShowReactions] = useState(false);
    const isFromClient = message.sender === 'client';
    const isFromAI = message.sender === 'ai';
    const formattedTime = message.timestamp
        ? (() => {
            const messageDate = new Date(message.timestamp);
            const today = new Date();
            const isToday = messageDate.toDateString() === today.toDateString();

            return new Intl.DateTimeFormat(navigator.language, {
                weekday: !isToday ? 'long' : undefined,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }).format(messageDate);
        })()
        : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex max-w-[85%] gap-2 md:max-w-[70%] ${isFromClient ? 'self-start' : 'self-end'}`}
        >
            {/* Avatar (only for client and AI messages) */}
            {showAvatar && (isFromClient || isFromAI) && (
                <div className="shrink-0">
                    {isFromAI ? (
                        <div className="bg-brand-teal flex h-8 w-8 items-center justify-center rounded-full">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                    ) : (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={message.senderAvatar || ''} />
                            <AvatarFallback className="text-xs">
                                {message.senderName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
            )}

            {/* Message Content */}
            <div
                className={`flex flex-col ${isFromClient ? 'items-start' : 'items-end'}`}
            >
                {/* Bubble */}
                <div
                    className={`group relative rounded-2xl px-4 py-2 ${isFromClient
                        ? 'rounded-tl-none bg-muted text-foreground'
                        : isFromAI
                            ? 'bg-brand-teal rounded-tr-none text-white'
                            : 'rounded-tr-none bg-primary text-primary-foreground'
                        }`}
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                >
                    {/* Sender name for non-client messages */}
                    {!isFromClient && (
                        <div className="mb-1 text-xs font-medium opacity-80">
                            {message.senderName}
                        </div>
                    )}

                    {/* Reply Context */}
                    {message.replyTo && (
                        <div className="mb-2 rounded-lg border-l-2 border-current bg-black/10 p-2">
                            <div className="mb-1 text-xs opacity-70">
                                {message.replyTo.senderName}
                            </div>
                            <div className="truncate text-xs opacity-90">
                                {message.replyTo.content}
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    {message.location && (
                        <div
                            className="mb-2 cursor-pointer rounded-lg bg-black/10 p-3 transition-colors hover:bg-black/20"
                            onClick={() =>
                                window.open(
                                    `https://maps.google.com/?q=${message.location?.latitude},${message.location?.longitude}`,
                                    '_blank',
                                )
                            }
                        >
                            <div className="mb-1 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                    Ubicación compartida
                                </span>
                            </div>
                            {message.location.name && (
                                <div className="text-xs opacity-90">
                                    {message.location.name}
                                </div>
                            )}
                            {message.location.address && (
                                <div className="text-xs opacity-70">
                                    {message.location.address}
                                </div>
                            )}
                            <div className="mt-1 text-xs opacity-60">
                                {message.location.latitude.toFixed(6)},{' '}
                                {message.location.longitude.toFixed(6)}
                            </div>
                        </div>
                    )}

                    {/* Text content */}
                    {message.content && (
                        <p className="wrap-break-words text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                        </p>
                    )}

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment) => (
                                <div key={attachment.id}>
                                    {attachment.type === 'image' ? (
                                        <img
                                            src={attachment.url || ''}
                                            alt={attachment.name}
                                            className="h-auto max-h-64 max-w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90"
                                            onClick={() =>
                                                window.open(
                                                    attachment.url,
                                                    '_blank',
                                                )
                                            }
                                        />
                                    ) : attachment.type === 'audio' ? (
                                        <audio controls className="max-w-full">
                                            <source
                                                src={attachment.url}
                                                type={attachment.mimeType}
                                            />
                                        </audio>
                                    ) : (
                                        <div className="flex cursor-pointer items-center gap-2 rounded-lg bg-black/10 p-2 transition-colors hover:bg-black/20">
                                            <File className="h-4 w-4 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-xs font-medium">
                                                    {attachment.name}
                                                </div>
                                                <div className="text-xs opacity-70">
                                                    {formatFileSize(
                                                        attachment.size,
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                            >
                                                <Download className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {message.reactions.map((reaction, idx) => (
                                <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="px-2 py-0.5 text-xs"
                                >
                                    {reaction.emoji}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Quick action buttons (on hover) */}
                    {showReactions && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`absolute top-0 ${isFromClient ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} flex -translate-y-2 gap-1`}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full bg-background shadow-md"
                                onClick={() =>
                                    onAddReaction?.(message.id, '👍')
                                }
                            >
                                <Smile className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full bg-background shadow-md"
                                onClick={() => onReplyTo?.(message)}
                            >
                                <Reply className="h-3 w-3" />
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Timestamp and Status */}
                <div
                    className={`mt-1 flex items-center gap-1 px-2 text-xs text-muted-foreground`}
                >
                    <span>{formattedTime}</span>
                    {!isFromClient && message.status && (
                        <MessageStatus status={message.status} />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
