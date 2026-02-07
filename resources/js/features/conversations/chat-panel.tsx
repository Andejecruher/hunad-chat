"use client"

import { ChatWindow } from "@/features/conversations/chat-window"
import { ConversationInfo } from "@/features/conversations/conversation-info"
import { ConversationList } from "@/features/conversations/conversation-list"
import { NewConversationModal } from "@/features/conversations/new-conversation-modal"
import { TransferDialog } from "@/features/conversations/transfer-dialog"
import type { ChannelLine, Conversation, ConversationStatus, Location, Message, TransferTarget } from "@/types/conversation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Mock channel lines
const mockChannelLines: ChannelLine[] = [
    { id: "line-wa-1", name: "WhatsApp Principal", channelType: "whatsapp", phoneNumber: "+52 55 1234 5678", isActive: true },
    { id: "line-wa-2", name: "WhatsApp Ventas", channelType: "whatsapp", phoneNumber: "+52 55 8765 4321", isActive: true },
    { id: "line-ig-1", name: "Instagram Oficial", channelType: "instagram", isActive: true },
    { id: "line-fb-1", name: "Facebook Principal", channelType: "facebook", isActive: true },
    { id: "line-tg-1", name: "Telegram Soporte", channelType: "telegram", isActive: true },
]

// Enhanced mock data with tickets and channel lines
const mockConversations: Conversation[] = [
    {
        id: "1",
        clientId: "c1",
        clientName: "Juan Pérez",
        clientEmail: "juan.perez@email.com",
        clientPhone: "+52 55 1234 5678",
        channelId: "ch-wa-1",
        channelLine: mockChannelLines[0],
        channel: "whatsapp",
        status: "open",
        lastMessage: "Necesito ayuda con mi pedido",
        lastMessageTime: "Hace 2 min",
        unreadCount: 3,
        assignedTo: "Ana García",
        tags: ["urgente", "ventas"],
        ticket: {
            id: "t1",
            conversationId: "1",
            subject: "Consulta sobre pedido #12345",
            status: "open",
            priority: "high",
            assignedTo: "Ana García",
            createdAt: "2024-06-15T10:00:00Z",
            updatedAt: new Date().toISOString(),
        },
        createdAt: "2024-06-15T10:00:00Z",
        updatedAt: new Date().toISOString(),
    },
    {
        id: "2",
        clientId: "c2",
        clientName: "María González",
        clientEmail: "maria.gonzalez@email.com",
        clientPhone: "+52 55 2345 6789",
        channelId: "ch-ig-1",
        channelLine: mockChannelLines[2],
        channel: "instagram",
        status: "pending",
        lastMessage: "¿Cuándo llega mi producto?",
        lastMessageTime: "Hace 15 min",
        unreadCount: 1,
        tags: ["seguimiento"],
        ticket: {
            id: "t2",
            conversationId: "2",
            subject: "Seguimiento de envío",
            status: "in_progress",
            priority: "medium",
            createdAt: "2024-07-20T14:30:00Z",
            updatedAt: new Date().toISOString(),
        },
        createdAt: "2024-07-20T14:30:00Z",
        updatedAt: new Date().toISOString(),
    },
    {
        id: "3",
        clientId: "c3",
        clientName: "Carlos Rodríguez",
        clientEmail: "carlos.rodriguez@email.com",
        clientPhone: "+52 55 3456 7890",
        channelId: "ch-fb-1",
        channelLine: mockChannelLines[3],
        channel: "facebook",
        status: "open",
        lastMessage: "Gracias por la información",
        lastMessageTime: "Hace 1 hora",
        unreadCount: 0,
        assignedTo: "Carlos López",
        tags: ["soporte"],
        createdAt: "2024-08-10T09:15:00Z",
        updatedAt: new Date().toISOString(),
    },
    {
        id: "4",
        clientId: "c4",
        clientName: "Laura Martínez",
        clientEmail: "laura.martinez@email.com",
        clientPhone: "+52 55 4567 8901",
        channelId: "ch-tg-1",
        channelLine: mockChannelLines[4],
        channel: "telegram",
        status: "closed",
        lastMessage: "Perfecto, todo resuelto",
        lastMessageTime: "Hace 3 horas",
        unreadCount: 0,
        assignedTo: "María Rodríguez",
        tags: ["resuelto"],
        ticket: {
            id: "t3",
            conversationId: "4",
            subject: "Soporte técnico",
            status: "resolved",
            priority: "low",
            assignedTo: "María Rodríguez",
            createdAt: "2024-09-05T16:45:00Z",
            updatedAt: new Date().toISOString(),
        },
        createdAt: "2024-09-05T16:45:00Z",
        updatedAt: new Date().toISOString(),
    },
]

const mockMessages: Message[] = [
    {
        id: "1",
        conversationId: "1",
        content: "Hola, necesito ayuda con mi pedido #12345",
        timestamp: "10:30 AM",
        sender: "client",
        senderName: "Juan Pérez",
        status: "read",
    },
    {
        id: "2",
        conversationId: "1",
        content: "Hola Juan, con gusto te ayudo. ¿Podrías darme más detalles sobre tu consulta?",
        timestamp: "10:31 AM",
        sender: "agent",
        senderName: "Ana García",
        status: "read",
    },
    {
        id: "3",
        conversationId: "1",
        content: "Sí, hice un pedido hace 3 días y aún no me llega",
        timestamp: "10:32 AM",
        sender: "client",
        senderName: "Juan Pérez",
        status: "read",
    },
    {
        id: "4",
        conversationId: "1",
        content: "Déjame revisar el estado de tu pedido. Un momento por favor.",
        timestamp: "10:33 AM",
        sender: "agent",
        senderName: "Ana García",
        status: "read",
    },
    {
        id: "5",
        conversationId: "1",
        content: "He verificado tu pedido #12345. Está en camino y debería llegar mañana antes de las 6 PM.",
        timestamp: "10:35 AM",
        sender: "ai",
        senderName: "IA Assistant",
        status: "delivered",
    },
]

export function ChatPanel() {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0])
    const [messages, setMessages] = useState<Message[]>(mockMessages)
    const [searchQuery, setSearchQuery] = useState("")
    const [channelFilter, setChannelFilter] = useState<string>("all")
    const [lineFilter, setLineFilter] = useState<string>("all")
    const [isTyping, setIsTyping] = useState(false)
    const [showInfo, setShowInfo] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [mobileView, setMobileView] = useState<"list" | "chat" | "info">("list")
    const [newConvModalOpen, setNewConvModalOpen] = useState(false)
    const [transferDialogOpen, setTransferDialogOpen] = useState(false)

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Simulate typing indicator
    useEffect(() => {
        if (selectedConversation && Math.random() > 0.7) {
            setIsTyping(true)
            const timeout = setTimeout(() => setIsTyping(false), 3000)
            return () => clearTimeout(timeout)
        }
    }, [selectedConversation])

    // Filter conversations
    const filteredConversations = conversations.filter((conv) => {
        const matchesSearch =
            conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesChannel = channelFilter === "all" || conv.channel === channelFilter
        const matchesLine = lineFilter === "all" || conv.channelLine?.id === lineFilter
        return matchesSearch && matchesChannel && matchesLine
    })

    // Handle conversation selection
    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation)
        if (isMobile) {
            setMobileView("chat")
        }
        // Mark as read
        setConversations(
            conversations.map((c) =>
                c.id === conversation.id
                    ? {
                        ...c,
                        unreadCount: 0,
                    }
                    : c,
            ),
        )
    }

    // Handle send message
    const handleSendMessage = (content: string, files?: File[], location?: Location) => {
        if (!selectedConversation) return

        const newMessage: Message = {
            id: String(messages.length + 1),
            conversationId: selectedConversation.id,
            content,
            timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
            sender: "agent",
            senderName: "Ana García",
            status: "sending",
            location,
            attachments: files?.map((file, idx) => ({
                id: `att-${Date.now()}-${idx}`,
                type: file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : "document",
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
                mimeType: file.type,
            })),
        }

        setMessages([...messages, newMessage])
        toast.success("Mensaje enviado")

        // Simulate status updates
        setTimeout(() => {
            setMessages((prev) => prev.map((m) => (m.id === newMessage.id ? { ...m, status: "sent" } : m)))
        }, 500)
        setTimeout(() => {
            setMessages((prev) => prev.map((m) => (m.id === newMessage.id ? { ...m, status: "delivered" } : m)))
        }, 1000)
        setTimeout(() => {
            setMessages((prev) => prev.map((m) => (m.id === newMessage.id ? { ...m, status: "read" } : m)))
        }, 2000)
    }

    // Handle add reaction
    const handleAddReaction = (messageId: string, emoji: string) => {
        setMessages(
            messages.map((m) =>
                m.id === messageId
                    ? {
                        ...m,
                        reactions: [
                            ...(m.reactions || []),
                            {
                                emoji,
                                userId: "current-user",
                                userName: "Ana García",
                                timestamp: new Date().toISOString(),
                            },
                        ],
                    }
                    : m,
            ),
        )
        toast.success("Reacción agregada")
    }

    // Handle reply to message
    const handleReplyTo = (message: Message) => {
        toast.info(`Respondiendo a: ${message.content.substring(0, 30)}...`)
        // This would set a reply context in the input component
    }

    // Handle change status
    const handleChangeStatus = (status: ConversationStatus) => {
        if (!selectedConversation) return
        setConversations(
            conversations.map((c) =>
                c.id === selectedConversation.id
                    ? {
                        ...c,
                        status,
                        updatedAt: new Date().toISOString(),
                    }
                    : c,
            ),
        )
        setSelectedConversation({ ...selectedConversation, status })
        toast.success(`Estado cambiado a ${status}`)
    }

    // Handle assign agent
    const handleAssignAgent = (agentId: string) => {
        toast.info("Asignar agente: " + agentId)
        // TODO: Implement agent assignment
    }

    // Handle add tag
    const handleAddTag = (tag: string) => {
        if (!selectedConversation) return
        const updatedTags = [...selectedConversation.tags, tag]
        setConversations(
            conversations.map((c) =>
                c.id === selectedConversation.id
                    ? {
                        ...c,
                        tags: updatedTags,
                    }
                    : c,
            ),
        )
        setSelectedConversation({ ...selectedConversation, tags: updatedTags })
        toast.success(`Etiqueta "${tag}" agregada`)
    }

    // Handle remove tag
    const handleRemoveTag = (tag: string) => {
        if (!selectedConversation) return
        const updatedTags = selectedConversation.tags.filter((t) => t !== tag)
        setConversations(
            conversations.map((c) =>
                c.id === selectedConversation.id
                    ? {
                        ...c,
                        tags: updatedTags,
                    }
                    : c,
            ),
        )
        setSelectedConversation({ ...selectedConversation, tags: updatedTags })
        toast.success(`Etiqueta "${tag}" eliminada`)
    }

    // Handle new conversation
    const handleCreateConversation = async (data: {
        clientPhone: string
        channelLineId: string
        message?: string
        templateId?: string
    }) => {
        console.log("[v0] Creating new conversation:", data)
        // TODO: Implement actual conversation creation
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Handle transfer
    const handleTransfer = async (target: TransferTarget, targetId: string) => {
        console.log("[v0] Transferring conversation to:", target, targetId)
        // TODO: Implement actual transfer logic
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Handle close ticket
    const handleCloseTicket = (ticketId: string) => {
        if (!selectedConversation || !selectedConversation.ticket || !ticketId) return

        const updatedTicket = {
            ...selectedConversation.ticket,
            status: "closed" as const,
            updatedAt: new Date().toISOString(),
        }

        setConversations(
            conversations.map((c) =>
                c.id === selectedConversation.id
                    ? {
                        ...c,
                        ticket: updatedTicket,
                        status: "closed",
                        updatedAt: new Date().toISOString(),
                    }
                    : c,
            ),
        )

        setSelectedConversation({
            ...selectedConversation,
            ticket: updatedTicket,
            status: "closed",
        })
    }

    // Mobile: back to list
    // const handleBackToList = () => {
    //   setMobileView("list")
    //}

    // Toggle info sidebar
    const handleToggleInfo = () => {
        if (isMobile) {
            setMobileView("info")
        } else {
            setShowInfo(!showInfo)
        }
    }

    if (!selectedConversation) {
        return <div className="flex items-center justify-center h-screen">Selecciona una conversación</div>
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden">
            {/* Mobile: List View */}
            {isMobile && mobileView === "list" && (
                <div className="w-full h-full">
                    <ConversationList
                        conversations={filteredConversations}
                        selectedId={selectedConversation.id}
                        onSelect={handleSelectConversation}
                        searchQuery={searchQuery}
                        channelFilter={channelFilter}
                        onSearchChange={setSearchQuery}
                        onChannelFilterChange={setChannelFilter}
                        onNewConversation={() => setNewConvModalOpen(true)}
                        channelLines={mockChannelLines}
                        selectedLineId={lineFilter}
                        onLineFilterChange={setLineFilter}
                    />
                </div>
            )}

            {/* Mobile: Chat View */}
            {isMobile && mobileView === "chat" && (
                <div className="w-full h-full">
                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onToggleInfo={handleToggleInfo}
                        onTransfer={() => setTransferDialogOpen(true)}
                        onAddReaction={handleAddReaction}
                        onReplyTo={handleReplyTo}
                        isTyping={isTyping}
                    />
                </div>
            )}

            {/* Mobile: Info View */}
            {isMobile && mobileView === "info" && (
                <div className="w-full h-full">
                    <ConversationInfo
                        conversation={selectedConversation}
                        onClose={() => setMobileView("chat")}
                        onAssignAgent={handleAssignAgent}
                        onChangeStatus={handleChangeStatus}
                        onAddTag={handleAddTag}
                        onRemoveTag={handleRemoveTag}
                        onCloseTicket={handleCloseTicket}
                    />
                </div>
            )}

            {/* Desktop: 3-Column Layout */}
            {!isMobile && (
                <>
                    {/* Left: Conversations List */}
                    <ConversationList
                        conversations={filteredConversations}
                        selectedId={selectedConversation.id}
                        onSelect={handleSelectConversation}
                        searchQuery={searchQuery}
                        channelFilter={channelFilter}
                        onSearchChange={setSearchQuery}
                        onChannelFilterChange={setChannelFilter}
                        onNewConversation={() => setNewConvModalOpen(true)}
                        channelLines={mockChannelLines}
                        selectedLineId={lineFilter}
                        onLineFilterChange={setLineFilter}
                    />

                    {/* Center: Chat Window */}
                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onToggleInfo={handleToggleInfo}
                        onTransfer={() => setTransferDialogOpen(true)}
                        onAddReaction={handleAddReaction}
                        onReplyTo={handleReplyTo}
                        isTyping={isTyping}
                    />

                    {/* Right: Conversation Info (collapsible) */}
                    {showInfo && (
                        <ConversationInfo
                            conversation={selectedConversation}
                            onClose={() => setShowInfo(false)}
                            onAssignAgent={handleAssignAgent}
                            onChangeStatus={handleChangeStatus}
                            onAddTag={handleAddTag}
                            onRemoveTag={handleRemoveTag}
                            onCloseTicket={handleCloseTicket}
                        />
                    )}
                </>
            )}

            {/* Modals */}
            <NewConversationModal
                open={newConvModalOpen}
                onOpenChange={setNewConvModalOpen}
                onCreateConversation={handleCreateConversation}
                channelLines={mockChannelLines}
            />

            <TransferDialog
                open={transferDialogOpen}
                onOpenChange={setTransferDialogOpen}
                onTransfer={handleTransfer}
                conversationId={selectedConversation.id}
            />
        </div>
    )
}
