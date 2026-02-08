"use client"

import { ChatWindow } from "@/features/conversations/chat-window"
import { ConversationInfo } from "@/features/conversations/conversation-info"
import { ConversationList } from "@/features/conversations/conversation-list"
import { NewConversationModal } from "@/features/conversations/new-conversation-modal"
import { TransferDialog } from "@/features/conversations/transfer-dialog"
import conversationsRoutes from "@/routes/conversations"
import type { PaginatedData } from "@/types"
import type { ChannelLine, Conversation, ConversationStatus, Location, Message, TransferTarget } from "@/types/conversation"
import { router, useForm } from "@inertiajs/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

interface ConversationFilters {
    search?: string
    channel?: string
    line?: string
}

interface ChatPanelProps {
    conversations: Conversation[]
    messages: PaginatedData<Message[]> | null
    filters: ConversationFilters
    channelLines: ChannelLine[]
    selectedConversationId?: string | null
}

interface MessageFormData {
    content: string
    attachments: File[]
    location: Location | null
}

const getUrl = (route: unknown, params?: unknown) => {
    try {
        if (!route) return ""
        if (typeof route === "function") {
            const res = params !== undefined ? route(params) : route()
            if (!res) return ""
            return typeof res === "string" ? res : (res as { url?: string }).url ?? String(res)
        }
        if (typeof route === "object") return (route as { url?: string }).url ?? String(route)
        return String(route)
    } catch {
        return String(route)
    }
}

export function ChatPanel({ conversations, messages, filters, channelLines, selectedConversationId }: ChatPanelProps) {
    const [showInfo, setShowInfo] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [mobileView, setMobileView] = useState<"list" | "chat" | "info">("list")
    const [newConvModalOpen, setNewConvModalOpen] = useState(false)
    const [transferDialogOpen, setTransferDialogOpen] = useState(false)
    const [activeConversationId, setActiveConversationId] = useState<string | null>(
        selectedConversationId ?? conversations[0]?.id ?? null,
    )

    const normalizedFilters = useMemo(() => {
        return {
            search: filters.search ?? "",
            channel: filters.channel && filters.channel !== "" ? filters.channel : "all",
            line: filters.line && filters.line !== "" ? filters.line : "all",
        }
    }, [filters.channel, filters.line, filters.search])

    const filterForm = useForm(normalizedFilters)
    const setFilterData = filterForm.setData
    const lastAppliedFiltersRef = useRef(normalizedFilters)

    const messageForm = useForm<MessageFormData>({
        content: "",
        attachments: [],
        location: null,
    })

    const selectedConversation = useMemo(() => {
        if (activeConversationId) {
            return conversations.find((conversation) => conversation.id === activeConversationId) ?? null
        }

        return conversations[0] ?? null
    }, [activeConversationId, conversations])

    const messageList = messages?.data ?? []

    useEffect(() => {
        if (selectedConversationId) {
            setActiveConversationId(selectedConversationId)
        }
    }, [selectedConversationId])

    useEffect(() => {
        const { search, channel, line } = normalizedFilters
        const last = lastAppliedFiltersRef.current

        if (last.search === search && last.channel === channel && last.line === line) {
            return
        }

        lastAppliedFiltersRef.current = normalizedFilters
        setFilterData({ search, channel, line })
    }, [normalizedFilters, setFilterData])

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const submitFilters = (next?: Partial<typeof filterForm.data>) => {
        const payload = { ...filterForm.data, ...(next ?? {}) }
        router.get(getUrl(conversationsRoutes.index), payload, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ["conversations", "filters", "selectedConversationId", "messages", "channelLines"],
        })
    }

    const handleSelectConversation = (conversation: Conversation) => {
        setActiveConversationId(conversation.id)
        if (isMobile) {
            setMobileView("chat")
        }

        router.get(getUrl(conversationsRoutes.show, { conversation: conversation.id }), {}, {
            preserveState: true,
            preserveScroll: true,
            only: ["messages", "selectedConversationId"],
        })
    }

    const handleSendMessage = () => {
        if (!selectedConversation || messageForm.processing) return

        const hasContent = messageForm.data.content.trim().length > 0
        const hasAttachments = messageForm.data.attachments.length > 0
        const hasLocation = messageForm.data.location !== null

        if (!hasContent && !hasAttachments && !hasLocation) return

        messageForm.post(`/conversations/${selectedConversation.id}/messages`, {
            preserveState: true,
            preserveScroll: true,
            only: ["messages", "conversations", "selectedConversationId"],
            forceFormData: true,
            onSuccess: () => {
                messageForm.reset()
            },
            onError: () => {
                toast.error("No se pudo enviar el mensaje")
            },
        })
    }

    const handleAddReaction = (_messageId: string, _emoji: string) => {
        void _messageId
        void _emoji
        toast.info("Reaccion agregada")
    }

    const handleReplyTo = (_message: Message) => {
        void _message
        toast.info("Responder mensaje")
    }

    const handleChangeStatus = (status: ConversationStatus) => {
        toast.success(`Estado cambiado a ${status}`)
    }

    const handleAssignAgent = () => {
        toast.info("Asignar agente")
    }

    const handleAddTag = () => {
        toast.info("Agregar etiqueta")
    }

    const handleRemoveTag = () => {
        toast.info("Eliminar etiqueta")
    }

    const handleTransfer = async (target: TransferTarget, targetId: string) => {
        console.log("[conversations] Transfer", target, targetId)
        await new Promise((resolve) => setTimeout(resolve, 500))
    }

    const handleCloseTicket = () => {
        toast.info("Cerrar ticket")
    }

    const handleToggleInfo = () => {
        if (isMobile) {
            setMobileView("info")
        } else {
            setShowInfo(!showInfo)
        }
    }

    if (!selectedConversation) {
        return <div className="flex min-h-0 flex-1 items-center justify-center">Selecciona una conversacion</div>
    }

    const composer = {
        value: messageForm.data.content,
        attachments: messageForm.data.attachments,
        location: messageForm.data.location,
        onValueChange: (value: string) => messageForm.setData((data) => ({ ...data, content: value })),
        onAttachmentsChange: (files: File[]) => messageForm.setData((data) => ({ ...data, attachments: files })),
        onLocationChange: (location: Location | null) => messageForm.setData((data) => ({ ...data, location })),
        isSending: messageForm.processing,
    }

    return (
        <div className="flex h-full min-h-0 flex-1 gap-0 overflow-hidden">
            {/* Mobile: List View */}
            {isMobile && mobileView === "list" && (
                <div className="flex h-full min-h-0 flex-1">
                    <ConversationList
                        conversations={conversations}
                        selectedId={selectedConversation.id}
                        onSelect={handleSelectConversation}
                        searchQuery={filterForm.data.search}
                        channelFilter={filterForm.data.channel}
                        onSearchChange={(value) => {
                            filterForm.setData("search", value)
                            submitFilters({ search: value })
                        }}
                        onChannelFilterChange={(value) => {
                            filterForm.setData("channel", value)
                            filterForm.setData("line", "all")
                            submitFilters({ channel: value, line: "all" })
                        }}
                        onNewConversation={() => setNewConvModalOpen(true)}
                        channelLines={channelLines}
                        selectedLineId={filterForm.data.line}
                        onLineFilterChange={(value) => {
                            filterForm.setData("line", value)
                            submitFilters({ line: value })
                        }}
                    />
                </div>
            )}

            {/* Mobile: Chat View */}
            {isMobile && mobileView === "chat" && (
                <div className="flex h-full min-h-0 flex-1">
                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messageList}
                        composer={composer}
                        onSendMessage={handleSendMessage}
                        onToggleInfo={handleToggleInfo}
                        onTransfer={() => setTransferDialogOpen(true)}
                        onAddReaction={handleAddReaction}
                        onReplyTo={handleReplyTo}
                        isTyping={false}
                    />
                </div>
            )}

            {/* Mobile: Info View */}
            {isMobile && mobileView === "info" && (
                <div className="flex h-full min-h-0 flex-1">
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
                    <ConversationList
                        conversations={conversations}
                        selectedId={selectedConversation.id}
                        onSelect={handleSelectConversation}
                        searchQuery={filterForm.data.search}
                        channelFilter={filterForm.data.channel}
                        onSearchChange={(value) => {
                            filterForm.setData("search", value)
                            submitFilters({ search: value })
                        }}
                        onChannelFilterChange={(value) => {
                            filterForm.setData("channel", value)
                            filterForm.setData("line", "all")
                            submitFilters({ channel: value, line: "all" })
                        }}
                        onNewConversation={() => setNewConvModalOpen(true)}
                        channelLines={channelLines}
                        selectedLineId={filterForm.data.line}
                        onLineFilterChange={(value) => {
                            filterForm.setData("line", value)
                            submitFilters({ line: value })
                        }}
                    />

                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messageList}
                        composer={composer}
                        onSendMessage={handleSendMessage}
                        onToggleInfo={handleToggleInfo}
                        onTransfer={() => setTransferDialogOpen(true)}
                        onAddReaction={handleAddReaction}
                        onReplyTo={handleReplyTo}
                        isTyping={false}
                    />

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

            <NewConversationModal
                open={newConvModalOpen}
                onOpenChange={setNewConvModalOpen}
                channelLines={channelLines}
                createUrl={getUrl(conversationsRoutes.store)}
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
