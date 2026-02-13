"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import useConversationRealtime from "@/hooks/use-conversation-realtime"
import type { ChatWindowEnhancedProps } from "@/types/conversation"
import { AnimatePresence, motion } from "framer-motion"
import { Archive, ArrowRightLeft, Info, MoreVertical, Phone, Star, Tag, User, Video } from "lucide-react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { ChannelBadge } from "./channel-badge"
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"
import { TypingIndicator } from "./typing-indicator"

export function ChatWindow({ conversation, messages, composer, onSendMessage, onToggleInfo, onTransfer, onAddReaction, onReplyTo, isTyping }: ChatWindowEnhancedProps) {

  useConversationRealtime(Number(conversation?.id), (payload) => {
    console.log("🚀 --------------------------------------🚀");
    console.log("🚀 ~ :28 ~ ChatWindow ~ payload:", payload);
    console.log("🚀 --------------------------------------🚀"
    );
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-brand-green text-white">Abierta</Badge>
      case "pending":
        return <Badge className="bg-brand-gold text-white">En Espera</Badge>
      case "closed":
        return <Badge variant="secondary">Cerrada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="flex h-full min-h-0 flex-1 flex-col">
      <CardContent className="flex h-full min-h-0 flex-col p-0">
        {/* Chat Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={conversation.clientAvatar || "/placeholder.svg"} />
              <AvatarFallback>
                {conversation.clientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{conversation.clientName}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <ChannelBadge channel={conversation.channel} size="sm" />
                {getStatusBadge(conversation.status)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => toast.info("Llamada de voz")}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => toast.info("Videollamada")}>
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggleInfo} className="hidden lg:flex">
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
                <DropdownMenuItem onClick={() => toast.info("Asignar a agente")}>
                  <User className="mr-2 h-4 w-4" />
                  Asignar a agente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Agregar etiqueta")}>
                  <Tag className="mr-2 h-4 w-4" />
                  Agregar etiqueta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTransfer}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Transferir conversación
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Marcada como resuelta")}>
                  <Star className="mr-2 h-4 w-4" />
                  Marcar como resuelta
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.success("Conversación archivada")}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archivar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 min-h-0 bg-muted/20">
          <div className="p-4 space-y-3 flex flex-col">
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="self-start">
                <TypingIndicator name={conversation.clientName} />
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
  )
}
