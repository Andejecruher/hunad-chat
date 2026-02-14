export type ConversationStatus = "open" | "pending" | "closed"
export type MessageSender = "client" | "agent" | "ai"
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed" | "pending"
export type ChannelType = "whatsapp" | "instagram" | "facebook" | "telegram"
export type AttachmentType = "image" | "video" | "audio" | "document" | "sticker" | "location"
export type TransferTarget = "agent" | "ai" | "department"

export interface Location {
    latitude: number
    longitude: number
    address?: string
    name?: string
}

export interface Attachment {
    id: string
    type: AttachmentType
    url: string
    name: string
    size: number
    mimeType: string
    thumbnail?: string
    location?: Location
}

export interface MessageReaction {
    emoji: string
    userId: string
    userName: string
    timestamp: string
}

export interface Ticket {
    id: string
    conversationId: string
    subject: string
    status: "open" | "in_progress" | "resolved" | "closed"
    priority: "low" | "medium" | "high"
    assignedTo?: string
    createdAt: string
    updatedAt: string
}

export interface ChannelLine {
    id: string
    name: string
    channelType: ChannelType
    phoneNumber?: string
    isActive: boolean
}

export interface Message {
    id: string
    conversationId: string
    content: string
    sender: MessageSender
    senderName: string
    senderAvatar?: string
    timestamp: string
    status?: MessageStatus
    attachments?: Attachment[]
    reactions?: MessageReaction[]
    isTemplate?: boolean
    templateData?: Record<string, unknown>
    replyTo?: Message
    location?: Location
}

export interface Conversation {
    id: string
    clientId: string
    clientName: string
    clientEmail?: string
    clientPhone?: string
    clientAvatar?: string
    channelId: string
    channelLine?: ChannelLine
    channel: ChannelType
    status: ConversationStatus
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
    assignedTo?: string
    assignedToAvatar?: string
    tags: string[]
    ticket?: Ticket
    metadata?: Record<string, unknown>
    createdAt: string
    updatedAt: string
}

export interface ConversationListProps {
    conversations: Conversation[]
    selectedId?: string
    onSelect: (conversation: Conversation) => void
    searchQuery: string
    channelFilter: string
    onSearchChange: (query: string) => void
    onChannelFilterChange: (channel: string) => void
    onLoadMore?: () => void
    isLoadingMore?: boolean
    hasMore?: boolean
}

export interface MessageComposerState {
    value: string
    attachments: File[]
    location: Location | null
    onValueChange: (value: string) => void
    onAttachmentsChange: (files: File[]) => void
    onLocationChange: (location: Location | null) => void
    isSending: boolean
}

export interface ChatWindowProps {
    conversation: Conversation
    messages: Message[]
    messagesMeta?: {
        currentPage: number
        lastPage: number
        nextPageUrl: string | null
        prevPageUrl: string | null
    } | null
    composer: MessageComposerState
    onSendMessage: () => void
    onToggleInfo: () => void
    isTyping: boolean
    onLoadOlderMessages?: () => void
    hasMoreMessages?: boolean
    isLoadingOlderMessages?: boolean
}

export interface ConversationInfoProps {
    conversation: Conversation
    onClose: () => void
    onAssignAgent: (agentId: string) => void
    onChangeStatus: (status: ConversationStatus) => void
    onAddTag: (tag: string) => void
    onRemoveTag: (tag: string) => void
    onCloseTicket: (ticketId: string) => void
}

export interface ChatWindowEnhancedProps extends ChatWindowProps {
    onTransfer: () => void
    onAddReaction: (messageId: string, emoji: string) => void
    onReplyTo: (message: Message) => void
}
