"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Ticket as TicketType } from "@/types/conversation"
import { AlertCircle, CheckCircle2, Clock, Ticket, X } from "lucide-react"
import { toast } from "sonner"

interface TicketCardProps {
  ticket: TicketType
  onCloseTicket: (ticketId: string) => void
}

export function TicketCard({ ticket, onCloseTicket }: TicketCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-blue-600 text-white">
            <Clock className="mr-1 h-3 w-3" />
            Abierto
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-brand-gold text-white">
            <AlertCircle className="mr-1 h-3 w-3" />
            En Progreso
          </Badge>
        )
      case "resolved":
        return (
          <Badge className="bg-brand-green text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Resuelto
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="secondary">
            <X className="mr-1 h-3 w-3" />
            Cerrado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-600 text-white">Alta</Badge>
      case "medium":
        return <Badge className="bg-orange-600 text-white">Media</Badge>
      case "low":
        return <Badge variant="secondary">Baja</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const handleCloseTicket = () => {
    onCloseTicket(ticket.id)
    toast.success("Ticket cerrado correctamente")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Ticket Asociado
          </CardTitle>
          {getStatusBadge(ticket.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Asunto</div>
          <div className="font-medium">{ticket.subject}</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Prioridad:</div>
          {getPriorityBadge(ticket.priority)}
        </div>

        {ticket.assignedTo && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Asignado a</div>
            <div className="text-sm font-medium">{ticket.assignedTo}</div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>Creado: {new Date(ticket.createdAt).toLocaleDateString("es-ES")}</span>
          <span>Actualizado: {new Date(ticket.updatedAt).toLocaleDateString("es-ES")}</span>
        </div>

        {ticket.status !== "closed" && (
          <Button onClick={handleCloseTicket} variant="outline" className="w-full mt-2 bg-transparent" size="sm">
            <X className="mr-2 h-4 w-4" />
            Cerrar Ticket
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
