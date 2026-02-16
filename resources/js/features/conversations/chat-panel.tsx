'use client';

import { ChatWindow } from '@/features/conversations/chat-window';
import { ConversationInfo } from '@/features/conversations/conversation-info';
import { ConversationList } from '@/features/conversations/conversation-list';
import { NewConversationModal } from '@/features/conversations/new-conversation-modal';
import { TransferDialog } from '@/features/conversations/transfer-dialog';
import conversationsRoutes from '@/routes/conversations';
import {
    setChatViewActive,
    setActiveConversation as setGlobalActiveConversation,
} from '@/state/active-conversation';
import type { PaginatedData, SharedData } from '@/types';
import type {
    ChannelLine,
    Conversation,
    ConversationStatus,
    Location,
    Message,
    TransferTarget,
} from '@/types/conversation';
import type { RealtimePayload } from '@/types/realtime-events';
import { REALTIME_MESSAGE_EVENTS } from '@/types/realtime-events';
import { router, useForm, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface ConversationFilters {
    search?: string;
    channel?: string;
    line?: string;
}

interface ChatPanelProps {
    conversations: PaginatedData<Conversation[]>;
    conversationsMeta?: {
        currentPage: number;
        lastPage: number;
        nextPageUrl: string | null;
        prevPageUrl: string | null;
    };
    messages: PaginatedData<Message[]> | null;
    messagesMeta?: {
        currentPage: number;
        lastPage: number;
        nextPageUrl: string | null;
        prevPageUrl: string | null;
    } | null;
    filters: ConversationFilters;
    channelLines: ChannelLine[];
    selectedConversationId?: string | null;
}

interface MessageFormData {
    content: string;
    attachments: File[];
    location: Location | null;
}

const getUrl = (route: unknown, params?: unknown) => {
    try {
        if (!route) return '';
        if (typeof route === 'function') {
            const res = params !== undefined ? route(params) : route();
            if (!res) return '';
            return typeof res === 'string'
                ? res
                : ((res as { url?: string }).url ?? String(res));
        }
        if (typeof route === 'object')
            return (route as { url?: string }).url ?? String(route);
        return String(route);
    } catch {
        return String(route);
    }
};

export function ChatPanel({
    conversations,
    conversationsMeta,
    messages,
    messagesMeta,
    filters,
    channelLines,
    selectedConversationId,
}: ChatPanelProps) {
    const [showInfo, setShowInfo] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileView, setMobileView] = useState<'list' | 'chat' | 'info'>(
        'list',
    );
    const [newConvModalOpen, setNewConvModalOpen] = useState(false);
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const initialConversations = useMemo(
        () => conversations?.data ?? [],
        [conversations],
    );
    const [conversationItems, setConversationItems] =
        useState<Conversation[]>(initialConversations);
    const [isLoadingMoreConversations, setIsLoadingMoreConversations] =
        useState(false);
    const [hasMoreConversations, setHasMoreConversations] = useState<boolean>(
        Boolean(conversationsMeta?.nextPageUrl),
    );

    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(selectedConversationId ?? initialConversations[0]?.id ?? null);

    useEffect(() => {
        setChatViewActive(true);
        return () => setChatViewActive(false);
    }, []);

    useEffect(() => {
        setGlobalActiveConversation(activeConversationId);
    }, [activeConversationId]);

    const normalizedFilters = useMemo(() => {
        return {
            search: filters.search ?? '',
            channel:
                filters.channel && filters.channel !== ''
                    ? filters.channel
                    : 'all',
            line: filters.line && filters.line !== '' ? filters.line : 'all',
        };
    }, [filters.channel, filters.line, filters.search]);

    const filterForm = useForm(normalizedFilters);
    const setFilterData = filterForm.setData;
    const lastAppliedFiltersRef = useRef(normalizedFilters);

    const messageForm = useForm<MessageFormData>({
        content: '',
        attachments: [],
        location: null,
    });

    const selectedConversation = useMemo(() => {
        if (activeConversationId) {
            return (
                conversationItems.find(
                    (conversation) => conversation.id === activeConversationId,
                ) ?? null
            );
        }

        return conversationItems[0] ?? null;
    }, [activeConversationId, conversationItems]);

    const initialMessages = useMemo(() => messages?.data ?? [], [messages]);
    const [messageItems, setMessageItems] =
        useState<Message[]>(initialMessages);
    const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(
        Boolean(messagesMeta?.nextPageUrl),
    );

    const messageList = useMemo(() => {
        const list = messageItems ?? [];
        return list;
    }, [messageItems]);

    const page = usePage<SharedData>();
    const companyId = page.props.auth.user.company_id;

    const upsertConversationSummary = useCallback(
        (payload: RealtimePayload) => {
            const convId = String(payload.conversation.id);
            setConversationItems((prev) => {
                const next = [...prev];
                const idx = next.findIndex((c) => c.id === convId);
                if (idx !== -1) {
                    const wasSelected = activeConversationId === convId;
                    const current = next[idx];
                    const unreadInc =
                        payload.message.sender_type === 'customer' &&
                        !wasSelected
                            ? (current.unreadCount ?? 0) + 1
                            : current.unreadCount;
                    next[idx] = {
                        ...current,
                        lastMessage:
                            payload.message.content ?? current.lastMessage,
                        lastMessageTime: payload.message.created_at
                            ? new Date(
                                  payload.message.created_at,
                              ).toLocaleString()
                            : current.lastMessageTime,
                        unreadCount: unreadInc,
                    };
                }
                return next;
            });
        },
        [activeConversationId],
    );

    const appendToActiveThread = useCallback(
        (payload: RealtimePayload) => {
            const convId = String(payload.conversation.id);
            if (activeConversationId !== convId) return;
            const sender =
                payload.message.sender_type === 'customer'
                    ? 'client'
                    : payload.message.sender_type === 'agent'
                      ? 'agent'
                      : 'ai';
            setMessageItems((prev) => [
                ...prev,
                {
                    id: String(payload.message.id ?? crypto.randomUUID()),
                    conversationId: convId,
                    content: payload.message.content ?? '',
                    sender,
                    senderName:
                        sender === 'client'
                            ? 'Cliente'
                            : sender === 'agent'
                              ? 'Agente'
                              : 'IA Assistant',
                    timestamp:
                        payload.message.created_at ?? new Date().toISOString(),
                    status: sender === 'agent' ? 'sent' : undefined,
                    attachments: [],
                    reactions: [],
                },
            ]);
        },
        [activeConversationId],
    );

    const handleRealtimePayload = useCallback(
        (payload: RealtimePayload) => {
            appendToActiveThread(payload);
            upsertConversationSummary(payload);
        },
        [appendToActiveThread, upsertConversationSummary],
    );

    useEcho<RealtimePayload>(
        `company.${companyId}`,
        REALTIME_MESSAGE_EVENTS as unknown as string[],
        handleRealtimePayload,
        [companyId, handleRealtimePayload],
    );

    useEffect(() => {
        setConversationItems((prev) => {
            const next = conversations?.data ?? [];
            if (prev.length === 0) return next;

            const seen = new Set(prev.map((c) => c.id));
            const merged = [...prev];
            for (const c of next) {
                if (!seen.has(c.id)) merged.push(c);
            }
            return merged;
        });

        const nextPageUrl = conversationsMeta?.nextPageUrl ?? null;
        setHasMoreConversations(Boolean(nextPageUrl));
        setIsLoadingMoreConversations(false);
    }, [conversations, conversationsMeta?.nextPageUrl]);

    useEffect(() => {
        const next = messages?.data ?? [];
        setMessageItems((prev) => {
            if (prev.length === 0) return next;

            const seen = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            for (const m of next) {
                if (!seen.has(m.id)) merged.push(m);
            }
            return merged.sort((a, b) =>
                a.timestamp.localeCompare(b.timestamp),
            );
        });

        setHasMoreMessages(Boolean(messagesMeta?.nextPageUrl));
        setIsLoadingOlderMessages(false);
    }, [messages, messagesMeta?.nextPageUrl]);

    useEffect(() => {
        if (selectedConversationId) {
            setActiveConversationId(selectedConversationId);
        }
    }, [selectedConversationId]);

    useEffect(() => {
        if (selectedConversationId) return;

        if (!activeConversationId && conversationItems.length > 0) {
            setActiveConversationId(conversationItems[0].id);
        }
    }, [activeConversationId, conversationItems, selectedConversationId]);

    useEffect(() => {
        const { search, channel, line } = normalizedFilters;
        const last = lastAppliedFiltersRef.current;

        if (
            last.search === search &&
            last.channel === channel &&
            last.line === line
        ) {
            return;
        }

        lastAppliedFiltersRef.current = normalizedFilters;
        setFilterData({ search, channel, line });
    }, [normalizedFilters, setFilterData]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const submitFilters = useCallback(
        (next?: Partial<typeof filterForm.data>) => {
            const payload = { ...filterForm.data, ...(next ?? {}) };
            router.get(getUrl(conversationsRoutes.index), payload, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: [
                    'conversations',
                    'conversationsMeta',
                    'filters',
                    'selectedConversationId',
                    'messages',
                    'messagesMeta',
                    'channelLines',
                ],
            });
        },
        [filterForm],
    );

    const handleLoadMoreConversations = useCallback(() => {
        if (isLoadingMoreConversations || !hasMoreConversations) return;

        const nextPageUrl = conversationsMeta?.nextPageUrl;
        if (!nextPageUrl) {
            setHasMoreConversations(false);
            return;
        }

        setIsLoadingMoreConversations(true);
        router.get(
            nextPageUrl,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['conversations', 'conversationsMeta'],
                replace: false,
            },
        );
    }, [
        conversationsMeta?.nextPageUrl,
        hasMoreConversations,
        isLoadingMoreConversations,
    ]);

    const handleLoadOlderMessages = useCallback(() => {
        if (isLoadingOlderMessages || !hasMoreMessages) return;

        const nextPageUrl = messagesMeta?.nextPageUrl;

        if (!nextPageUrl) {
            setHasMoreMessages(false);
            return;
        }

        setIsLoadingOlderMessages(true);
        router.get(
            nextPageUrl,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['messages', 'messagesMeta'],
                replace: false,
            },
        );
    }, [hasMoreMessages, isLoadingOlderMessages, messagesMeta?.nextPageUrl]);

    const handleSelectConversation = (conversation: Conversation) => {
        setActiveConversationId(conversation.id);
        if (isMobile) {
            setMobileView('chat');
        }

        router.get(
            getUrl(conversationsRoutes.show, { conversation: conversation.id }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['messages', 'messagesMeta', 'selectedConversationId'],
            },
        );
    };

    const handleSendMessage = () => {
        if (!selectedConversation || messageForm.processing) return;

        const hasContent = messageForm.data.content.trim().length > 0;
        const hasAttachments = messageForm.data.attachments.length > 0;
        const hasLocation = messageForm.data.location !== null;

        if (!hasContent && !hasAttachments && !hasLocation) return;

        messageForm.post(`/conversations/${selectedConversation.id}/messages`, {
            preserveState: true,
            preserveScroll: true,
            only: ['messages', 'conversations', 'selectedConversationId'],
            forceFormData: true,
            onSuccess: () => {
                messageForm.reset();
            },
            onError: () => {
                toast.error('No se pudo enviar el mensaje');
            },
        });
    };

    const handleAddReaction = useCallback(
        (_messageId: string, _emoji: string) => {
            void _messageId;
            void _emoji;
            toast.info('Reaccion agregada');
        },
        [],
    );

    const handleReplyTo = useCallback((_message: Message) => {
        void _message;
        toast.info('Responder mensaje');
    }, []);

    const handleChangeStatus = useCallback((status: ConversationStatus) => {
        toast.success(`Estado cambiado a ${status}`);
    }, []);

    const handleAssignAgent = useCallback(() => {
        toast.info('Asignar agente');
    }, []);

    const handleAddTag = useCallback(() => {
        toast.info('Agregar etiqueta');
    }, []);

    const handleRemoveTag = useCallback(() => {
        toast.info('Eliminar etiqueta');
    }, []);

    const handleTransfer = useCallback(
        async (target: TransferTarget, targetId: string) => {
            console.log('[conversations] Transfer', target, targetId);
            await new Promise((resolve) => setTimeout(resolve, 500));
        },
        [],
    );

    const handleCloseTicket = useCallback(() => {
        toast.info('Cerrar ticket');
    }, []);

    const handleToggleInfo = useCallback(() => {
        if (isMobile) {
            setMobileView('info');
        } else {
            setShowInfo(!showInfo);
        }
    }, [isMobile, showInfo]);

    // Memoized filter handlers
    const handleSearchChange = useCallback(
        (value: string) => {
            filterForm.setData('search', value);
            submitFilters({ search: value });
        },
        [filterForm, submitFilters],
    );

    const handleChannelFilterChange = useCallback(
        (value: string) => {
            filterForm.setData('channel', value);
            filterForm.setData('line', 'all');
            submitFilters({ channel: value, line: 'all' });
        },
        [filterForm, submitFilters],
    );

    const handleLineFilterChange = useCallback(
        (value: string) => {
            filterForm.setData('line', value);
            submitFilters({ line: value });
        },
        [filterForm, submitFilters],
    );

    const handleNewConversation = useCallback(() => {
        setNewConvModalOpen(true);
    }, []);

    const handleOpenTransferDialog = useCallback(() => {
        setTransferDialogOpen(true);
    }, []);

    // Memoized composer object
    const composer = useMemo(
        () => ({
            value: messageForm.data.content,
            attachments: messageForm.data.attachments,
            location: messageForm.data.location,
            onValueChange: (value: string) =>
                messageForm.setData((data) => ({ ...data, content: value })),
            onAttachmentsChange: (files: File[]) =>
                messageForm.setData((data) => ({
                    ...data,
                    attachments: files,
                })),
            onLocationChange: (location: Location | null) =>
                messageForm.setData((data) => ({ ...data, location })),
            isSending: messageForm.processing,
        }),
        [messageForm],
    );

    if (!selectedConversation) {
        return (
            <div className="flex h-full min-h-0 flex-1 gap-0 overflow-hidden">
                {isMobile ? (
                    <div className="flex h-full min-h-0 flex-1">
                        <ConversationList
                            conversations={conversationItems}
                            selectedId={''}
                            onSelect={handleSelectConversation}
                            searchQuery={filterForm.data.search}
                            channelFilter={filterForm.data.channel}
                            onSearchChange={handleSearchChange}
                            onChannelFilterChange={handleChannelFilterChange}
                            onNewConversation={handleNewConversation}
                            channelLines={channelLines}
                            selectedLineId={filterForm.data.line}
                            onLineFilterChange={handleLineFilterChange}
                            onLoadMore={handleLoadMoreConversations}
                            isLoadingMore={isLoadingMoreConversations}
                            hasMore={hasMoreConversations}
                        />
                    </div>
                ) : (
                    <>
                        <ConversationList
                            conversations={conversationItems}
                            selectedId={''}
                            onSelect={handleSelectConversation}
                            searchQuery={filterForm.data.search}
                            channelFilter={filterForm.data.channel}
                            onSearchChange={handleSearchChange}
                            onChannelFilterChange={handleChannelFilterChange}
                            onNewConversation={handleNewConversation}
                            channelLines={channelLines}
                            selectedLineId={filterForm.data.line}
                            onLineFilterChange={handleLineFilterChange}
                            onLoadMore={handleLoadMoreConversations}
                            isLoadingMore={isLoadingMoreConversations}
                            hasMore={hasMoreConversations}
                        />

                        <div className="flex h-full min-h-0 flex-1 items-center justify-center px-6">
                            <div className="text-center">
                                <p className="text-sm text-zinc-600">
                                    Selecciona una conversación o crea una nueva
                                </p>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={handleNewConversation}
                                        className="rounded-md bg-blue-600 px-3 py-1 text-white"
                                    >
                                        Nueva conversación
                                    </button>
                                </div>
                            </div>
                        </div>
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
                    conversationId={''}
                />
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-1 gap-0 overflow-hidden">
            {/* Mobile: List View */}
            {isMobile && mobileView === 'list' && (
                <div className="flex h-full min-h-0 flex-1">
                    <ConversationList
                        conversations={conversationItems}
                        selectedId={selectedConversation.id}
                        onSelect={handleSelectConversation}
                        searchQuery={filterForm.data.search}
                        channelFilter={filterForm.data.channel}
                        onSearchChange={handleSearchChange}
                        onChannelFilterChange={handleChannelFilterChange}
                        onNewConversation={handleNewConversation}
                        channelLines={channelLines}
                        selectedLineId={filterForm.data.line}
                        onLineFilterChange={handleLineFilterChange}
                        onLoadMore={handleLoadMoreConversations}
                        isLoadingMore={isLoadingMoreConversations}
                        hasMore={hasMoreConversations}
                    />
                </div>
            )}

            {/* Mobile: Chat View */}
            {isMobile && mobileView === 'chat' && (
                <div className="flex h-full min-h-0 flex-1">
                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messageList}
                        messagesMeta={messagesMeta}
                        composer={composer}
                        onSendMessage={handleSendMessage}
                        onToggleInfo={handleToggleInfo}
                        onTransfer={handleOpenTransferDialog}
                        onAddReaction={handleAddReaction}
                        onReplyTo={handleReplyTo}
                        isTyping={false}
                        onLoadOlderMessages={handleLoadOlderMessages}
                        hasMoreMessages={hasMoreMessages}
                        isLoadingOlderMessages={isLoadingOlderMessages}
                    />
                </div>
            )}

            {/* Mobile: Info View */}
            {isMobile && mobileView === 'info' && (
                <div className="flex h-full min-h-0 flex-1">
                    <ConversationInfo
                        conversation={selectedConversation}
                        onClose={() => setMobileView('chat')}
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
                        conversations={conversationItems}
                        selectedId={selectedConversation.id}
                        onSelect={handleSelectConversation}
                        searchQuery={filterForm.data.search}
                        channelFilter={filterForm.data.channel}
                        onSearchChange={handleSearchChange}
                        onChannelFilterChange={handleChannelFilterChange}
                        onNewConversation={handleNewConversation}
                        channelLines={channelLines}
                        selectedLineId={filterForm.data.line}
                        onLineFilterChange={handleLineFilterChange}
                        onLoadMore={handleLoadMoreConversations}
                        isLoadingMore={isLoadingMoreConversations}
                        hasMore={hasMoreConversations}
                    />

                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messageList}
                        messagesMeta={messagesMeta}
                        composer={composer}
                        onSendMessage={handleSendMessage}
                        onToggleInfo={handleToggleInfo}
                        onTransfer={handleOpenTransferDialog}
                        onAddReaction={handleAddReaction}
                        onReplyTo={handleReplyTo}
                        isTyping={false}
                        onLoadOlderMessages={handleLoadOlderMessages}
                        hasMoreMessages={hasMoreMessages}
                        isLoadingOlderMessages={isLoadingOlderMessages}
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
    );
}
