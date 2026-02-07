"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Message } from "@/types/conversation"
import { motion } from "framer-motion"
import { Bot, Download, File, MapPin, Reply, Smile } from "lucide-react"
import { useState } from "react"
import { MessageStatus } from "./message-status"

interface MessageBubbleProps {
  message: Message
  showAvatar?: boolean
  onAddReaction?: (messageId: string, emoji: string) => void
  onReplyTo?: (message: Message) => void
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function MessageBubble({ message, showAvatar = true, onAddReaction, onReplyTo }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false)
  const isFromClient = message.sender === "client"
  const isFromAI = message.sender === "ai"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${isFromClient ? "self-start" : "self-end"}`}
    >
      {/* Avatar (only for client and AI messages) */}
      {showAvatar && (isFromClient || isFromAI) && (
        <div className="shrink-0">
          {isFromAI ? (
            <div className="h-8 w-8 rounded-full bg-brand-teal flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {message.senderName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isFromClient ? "items-start" : "items-end"}`}>
        {/* Bubble */}
        <div
          className={`relative group rounded-2xl px-4 py-2 ${isFromClient
            ? "bg-muted text-foreground rounded-tl-none"
            : isFromAI
              ? "bg-brand-teal text-white rounded-tr-none"
              : "bg-primary text-primary-foreground rounded-tr-none"
            }`}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {/* Sender name for non-client messages */}
          {!isFromClient && (
            <div className="text-xs opacity-80 mb-1 font-medium">{message.senderName}</div>
          )}

          {/* Reply Context */}
          {message.replyTo && (
            <div className="mb-2 p-2 rounded-lg bg-black/10 border-l-2 border-current">
              <div className="text-xs opacity-70 mb-1">
                {message.replyTo.senderName}
              </div>
              <div className="text-xs opacity-90 truncate">
                {message.replyTo.content}
              </div>
            </div>
          )}

          {/* Location */}
          {message.location && (
            <div className="mb-2 p-3 rounded-lg bg-black/10 cursor-pointer hover:bg-black/20 transition-colors"
              onClick={() => window.open(`https://maps.google.com/?q=${message.location?.latitude},${message.location?.longitude}`, '_blank')}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-medium">Ubicación compartida</span>
              </div>
              {message.location.name && (
                <div className="text-xs opacity-90">{message.location.name}</div>
              )}
              {message.location.address && (
                <div className="text-xs opacity-70">{message.location.address}</div>
              )}
              <div className="text-xs opacity-60 mt-1">
                {message.location.latitude.toFixed(6)}, {message.location.longitude.toFixed(6)}
              </div>
            </div>
          )}

          {/* Text content */}
          {message.content && <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id}>
                  {attachment.type === "image" ? (
                    <img
                      src={attachment.url || "/placeholder.svg"}
                      alt={attachment.name}
                      className="rounded-lg max-w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(attachment.url, "_blank")}
                    />
                  ) : attachment.type === "audio" ? (
                    <audio controls className="max-w-full">
                      <source src={attachment.url} type={attachment.mimeType} />
                    </audio>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/10 hover:bg-black/20 transition-colors cursor-pointer">
                      <File className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{attachment.name}</div>
                        <div className="text-xs opacity-70">{formatFileSize(attachment.size)}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
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
              className={`absolute top-0 ${isFromClient ? "right-0 translate-x-full" : "left-0 -translate-x-full"} -translate-y-2 flex gap-1`}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-background shadow-md"
                onClick={() => onAddReaction?.(message.id, "👍")}
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
        <div className={`flex items-center gap-1 text-xs text-muted-foreground mt-1 px-2`}>
          <span>{message.timestamp}</span>
          {!isFromClient && message.status && <MessageStatus status={message.status} />}
        </div>
      </div>
    </motion.div>
  )
}
