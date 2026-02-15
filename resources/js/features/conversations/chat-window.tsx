'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatWindowEnhancedProps } from '@/types/conversation';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Archive,
    ArrowRightLeft,
    Info,
    MoreVertical,
    Phone,
    Star,
    Tag,
    User,
    Video,
} from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ChannelBadge } from './channel-badge';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';
export function ChatWindow({
    conversation,
    messages,
    composer,
    onSendMessage,
    onToggleInfo,
    onTransfer,
    onAddReaction,
    onReplyTo,
    isTyping,
    onLoadOlderMessages,
    hasMoreMessages,
    isLoadingOlderMessages,
}: ChatWindowEnhancedProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const shouldStickToBottomRef = useRef(true);
    const pendingPrependRestoreRef = useRef<{
        prevScrollHeight: number;
        prevScrollTop: number;
    } | null>(null);

    const handleViewportScroll = useCallback(() => {
        const el = viewportRef.current;
        if (!el) return;

        const topThreshold = 80;
        const bottomThreshold = 120;

        if (el.scrollTop <= topThreshold) {
            if (
                onLoadOlderMessages &&
                hasMoreMessages &&
                !isLoadingOlderMessages
            ) {
                pendingPrependRestoreRef.current = {
                    prevScrollHeight: el.scrollHeight,
                    prevScrollTop: el.scrollTop,
                };
                onLoadOlderMessages();
            }
        }

        const distanceToBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight;
        shouldStickToBottomRef.current = distanceToBottom <= bottomThreshold;
    }, [hasMoreMessages, isLoadingOlderMessages, onLoadOlderMessages]);

    useLayoutEffect(() => {
        const el = viewportRef.current;
        const pending = pendingPrependRestoreRef.current;
        if (!el || !pending) return;

        const delta = el.scrollHeight - pending.prevScrollHeight;
        el.scrollTop = pending.prevScrollTop + delta;
        pendingPrependRestoreRef.current = null;
    }, [messages]);

    useEffect(() => {
        if (pendingPrependRestoreRef.current) return;

        if (shouldStickToBottomRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return (
                    <Badge className="bg-brand-green text-white">Abierta</Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-brand-gold text-white">
                        En Espera
                    </Badge>
                );
            case 'closed':
                return <Badge variant="secondary">Cerrada</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="flex h-full min-h-0 flex-1 flex-col rounded-none border-t-0 border-r py-0">
            <CardContent className="flex h-full min-h-0 flex-col p-0">
                {/* Chat Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-border bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage
                                src={conversation.clientAvatar || ''}
                            />
                            <AvatarFallback>
                                {conversation.clientName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold">
                                {conversation.clientName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <ChannelBadge
                                    channel={conversation.channel}
                                    size="sm"
                                />
                                {getStatusBadge(conversation.status)}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex shrink-0 items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.info('Llamada de voz')}
                        >
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.info('Videollamada')}
                        >
                            <Video className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleInfo}
                            className="hidden lg:flex"
                        >
                            <Info className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        toast.info('Asignar a agente')
                                    }
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Asignar a agente
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        toast.info('Agregar etiqueta')
                                    }
                                >
                                    <Tag className="mr-2 h-4 w-4" />
                                    Agregar etiqueta
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onTransfer}>
                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                    Transferir conversación
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        toast.success('Marcada como resuelta')
                                    }
                                >
                                    <Star className="mr-2 h-4 w-4" />
                                    Marcar como resuelta
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        toast.success('Conversación archivada')
                                    }
                                >
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archivar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea
                    className="min-h-0 flex-1 bg-muted/20"
                    viewportRef={viewportRef}
                    onViewportScroll={handleViewportScroll}
                >
                    <div className="flex flex-col space-y-3 p-4">
                        {(isLoadingOlderMessages ||
                            hasMoreMessages === false) && (
                            <div className="text-center text-xs text-muted-foreground">
                                {isLoadingOlderMessages
                                    ? 'Cargando mensajes…'
                                    : 'No hay más mensajes para cargar'}
                            </div>
                        )}
                        <AnimatePresence>
                            {messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    showAvatar={true}
                                    onAddReaction={onAddReaction}
                                    onReplyTo={onReplyTo}
                                />
                            ))}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="self-start"
                            >
                                <TypingIndicator
                                    name={conversation.clientName}
                                />
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="shrink-0">
                    <MessageInput
                        value={composer.value}
                        attachments={composer.attachments}
                        location={composer.location}
                        onValueChange={composer.onValueChange}
                        onAttachmentsChange={composer.onAttachmentsChange}
                        onLocationChange={composer.onLocationChange}
                        onSend={onSendMessage}
                        disabled={composer.isSending}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
