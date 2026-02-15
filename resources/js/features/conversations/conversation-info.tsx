/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type {
    ConversationInfoProps,
    ConversationStatus,
} from '@/types/conversation';
import {
    Clock,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Tag,
    User,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { TicketCard } from './ticket-card';

export function ConversationInfo({
    conversation,
    onClose,
    onAssignAgent,
    onChangeStatus,
    onAddTag,
    onRemoveTag,
    onCloseTicket,
}: ConversationInfoProps) {
    return (
        <Card className="flex h-full min-h-0 w-full flex-col rounded-none border-t-0 border-r py-0 lg:w-80">
            <CardContent className="flex h-full min-h-0 flex-col p-4">
                <div className="shrink-0 space-y-6">
                    {/* Close Button (mobile) */}
                    <div className="flex items-center justify-between lg:hidden">
                        <h3 className="font-semibold">Información</h3>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Client Avatar and Name */}
                    <div className="text-center">
                        <Avatar className="mx-auto mb-3 h-20 w-20">
                            <AvatarImage
                                src={conversation.clientAvatar || ''}
                            />
                            <AvatarFallback className="text-2xl">
                                {conversation.clientName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="font-heading text-lg font-semibold">
                            {conversation.clientName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {conversation.clientEmail}
                        </p>
                    </div>

                    {/* Status Control */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">
                            Estado de Conversación
                        </h4>
                        <Select
                            value={conversation.status}
                            onValueChange={(value: ConversationStatus) =>
                                onChangeStatus(value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Abierta</SelectItem>
                                <SelectItem value="pending">
                                    En Espera
                                </SelectItem>
                                <SelectItem value="closed">Cerrada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Client Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">
                            Información del Cliente
                        </h4>
                        <div className="space-y-3">
                            {conversation.clientEmail && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="truncate">
                                        {conversation.clientEmail}
                                    </span>
                                </div>
                            )}
                            {conversation.clientPhone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span>{conversation.clientPhone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span>Ciudad de México, México</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-4" />

                <ScrollArea className="min-h-0 flex-1 pr-2">
                    <div className="space-y-6 pb-2">
                        {/* Tags */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">
                                    Etiquetas
                                </h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        toast.info('Agregar etiqueta');
                                        // TODO: Implement add tag dialog
                                    }}
                                    className="h-7 text-xs"
                                >
                                    Agregar
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {conversation.tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-secondary/80"
                                    >
                                        <Tag className="mr-1 h-3 w-3" />
                                        {tag}
                                    </Badge>
                                ))}
                                {conversation.tags.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        Sin etiquetas
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Ticket Section */}
                        {conversation.ticket && (
                            <>
                                <Separator />
                                <TicketCard
                                    ticket={conversation.ticket}
                                    onCloseTicket={onCloseTicket}
                                />
                            </>
                        )}

                        <Separator />

                        {/* Agent Assignment */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold">
                                Asignación
                            </h4>
                            {conversation.assignedTo ? (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={
                                                conversation.assignedToAvatar ||
                                                ''
                                            }
                                        />
                                        <AvatarFallback className="text-xs">
                                            {conversation.assignedTo
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1 text-sm">
                                        {conversation.assignedTo}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            toast.info('Reasignar agente');
                                            // TODO: Implement agent selection
                                        }}
                                        className="h-7 text-xs"
                                    >
                                        Cambiar
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full bg-transparent"
                                    onClick={() => {
                                        toast.info('Asignar agente');
                                        // TODO: Implement agent selection
                                    }}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Asignar agente
                                </Button>
                            )}
                        </div>

                        <Separator />

                        {/* History Statistics */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold">Historial</h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm">
                                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">
                                            12 conversaciones
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Total de interacciones
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">
                                            Cliente desde hace 6 meses
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Primera interacción:{' '}
                                            {new Date(
                                                conversation.createdAt,
                                            ).toLocaleDateString('es-ES')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full bg-transparent"
                        >
                            Ver perfil completo
                        </Button>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
