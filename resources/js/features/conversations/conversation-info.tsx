/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { ConversationInfoProps, ConversationStatus } from "@/types/conversation"
import { Clock, Mail, MapPin, MessageSquare, Phone, Tag, User, X } from "lucide-react"
import { toast } from "sonner"
import { TicketCard } from "./ticket-card"

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
    <Card className="w-full lg:w-80 h-full">
      <CardContent className="p-4 space-y-6 h-full overflow-auto">
        {/* Close Button (mobile) */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <h3 className="font-semibold">Información</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Client Avatar and Name */}
        <div className="text-center">
          <Avatar className="h-20 w-20 mx-auto mb-3">
            <AvatarImage src={conversation.clientAvatar || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl">
              {conversation.clientName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-heading text-lg font-semibold">{conversation.clientName}</h3>
          <p className="text-sm text-muted-foreground">{conversation.clientEmail}</p>
        </div>

        <Separator />

        {/* Status Control */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Estado de Conversación</h4>
          <Select value={conversation.status} onValueChange={(value: ConversationStatus) => onChangeStatus(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Abierta</SelectItem>
              <SelectItem value="pending">En Espera</SelectItem>
              <SelectItem value="closed">Cerrada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Client Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Información del Cliente</h4>
          <div className="space-y-3">
            {conversation.clientEmail && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{conversation.clientEmail}</span>
              </div>
            )}
            {conversation.clientPhone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{conversation.clientPhone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>Ciudad de México, México</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Etiquetas</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toast.info("Agregar etiqueta")
                // TODO: Implement add tag dialog
              }}
              className="h-7 text-xs"
            >
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {conversation.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))}
            {conversation.tags.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin etiquetas</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Ticket Section */}
        {conversation.ticket && (
          <>
            <TicketCard ticket={conversation.ticket} onCloseTicket={onCloseTicket} />
            <Separator />
          </>
        )}

        {/* Agent Assignment */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Asignación</h4>
          {conversation.assignedTo ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={conversation.assignedToAvatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {conversation.assignedTo
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm flex-1">{conversation.assignedTo}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast.info("Reasignar agente")
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
                toast.info("Asignar agente")
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
          <h4 className="font-semibold text-sm">Historial</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">12 conversaciones</div>
                <div className="text-xs text-muted-foreground">Total de interacciones</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Cliente desde hace 6 meses</div>
                <div className="text-xs text-muted-foreground">
                  Primera interacción: {new Date(conversation.createdAt).toLocaleDateString("es-ES")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full bg-transparent">
          Ver perfil completo
        </Button>
      </CardContent>
    </Card>
  )
}
