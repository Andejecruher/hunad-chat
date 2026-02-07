"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ChannelLine, Conversation, ConversationListProps } from "@/types/conversation"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronRight, Filter, Plus, Search } from "lucide-react"
import { useState } from "react"
import { ChannelBadge } from "./channel-badge"

interface ConversationListEnhancedProps extends ConversationListProps {
  onNewConversation: () => void
  channelLines: ChannelLine[]
  selectedLineId: string
  onLineFilterChange: (lineId: string) => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  channelFilter,
  onSearchChange,
  onChannelFilterChange,
  onNewConversation,
  channelLines,
  selectedLineId,
  onLineFilterChange,
}: ConversationListEnhancedProps) {
  const [activeCollapsed, setActiveCollapsed] = useState(false)
  const [inactiveCollapsed, setInactiveCollapsed] = useState(false)

  // Group conversations by status
  const activeConversations = conversations.filter((c) => c.status === "open")
  const inactiveConversations = conversations.filter((c) => c.status === "pending" || c.status === "closed")

  return (
    <Card className="w-full lg:w-80 flex flex-col h-full border-r">
      <CardContent className="flex flex-col h-full p-0">
        {/* Header */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Inbox</h2>
            <Button onClick={onNewConversation} size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Channel Filter Tabs */}
          <Tabs value={channelFilter} onValueChange={onChannelFilterChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 gap-1">
              <TabsTrigger value="all" className="text-xs px-2">
                Todos
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="text-xs px-1">
                WA
              </TabsTrigger>
              <TabsTrigger value="instagram" className="text-xs px-1">
                IG
              </TabsTrigger>
              <TabsTrigger value="facebook" className="text-xs px-1">
                FB
              </TabsTrigger>
              <TabsTrigger value="telegram" className="text-xs px-1">
                TG
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Line Filter */}
          {channelFilter !== "all" && channelLines.filter((l) => l.channelType === channelFilter).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Filter className="h-3 w-3" />
                <span>Línea específica</span>
              </div>
              <Select value={selectedLineId} onValueChange={onLineFilterChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Todas las líneas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las líneas</SelectItem>
                  {channelLines
                    .filter((l) => l.channelType === channelFilter && l.isActive)
                    .map((line) => (
                      <SelectItem key={line.id} value={line.id}>
                        {line.name} {line.phoneNumber && `(${line.phoneNumber})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Conversation Groups */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {/* Active Conversations */}
            <Collapsible open={!activeCollapsed} onOpenChange={() => setActiveCollapsed(!activeCollapsed)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-2 py-1 h-8 hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    {activeCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">Activas</span>
                  </div>
                  <Badge variant="secondary" className="h-5 px-2">
                    {activeConversations.length}
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                <AnimatePresence>
                  {activeConversations.map((conversation, index) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={selectedId === conversation.id}
                      onSelect={onSelect}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
                {activeConversations.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No hay conversaciones activas
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Inactive Conversations */}
            <Collapsible open={!inactiveCollapsed} onOpenChange={() => setInactiveCollapsed(!inactiveCollapsed)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-2 py-1 h-8 hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    {inactiveCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">En Espera / Cerradas</span>
                  </div>
                  <Badge variant="secondary" className="h-5 px-2">
                    {inactiveConversations.length}
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                <AnimatePresence>
                  {inactiveConversations.map((conversation, index) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={selectedId === conversation.id}
                      onSelect={onSelect}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
                {inactiveConversations.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No hay conversaciones inactivas
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Separate component for individual conversation items
function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  index,
}: {
  conversation: Conversation
  isSelected: boolean
  onSelect: (conv: Conversation) => void
  index: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onSelect(conversation)}
      className={`w-full text-left p-3 rounded-lg transition-colors ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with Channel Badge */}
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.clientAvatar || "/placeholder.svg"} />
            <AvatarFallback>
              {conversation.clientName
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1">
            <ChannelBadge channel={conversation.channel} size="sm" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium truncate text-sm">{conversation.clientName}</span>
            {conversation.unreadCount > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Badge className="h-5 min-w-[20px] rounded-full px-1.5 flex items-center justify-center bg-brand-green text-white text-xs ml-2">
                  {conversation.unreadCount}
                </Badge>
              </motion.div>
            )}
          </div>
          <p
            className={`text-xs truncate ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
          >
            {conversation.lastMessage}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs ${isSelected ? "text-primary-foreground/60" : "text-muted-foreground"
                }`}
            >
              {conversation.lastMessageTime}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
