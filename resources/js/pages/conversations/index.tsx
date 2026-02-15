import { ChatPanel } from '@/features/conversations/chat-panel.tsx';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import type { ChannelLine, Conversation, Message } from '@/types/conversation';
import { Head } from '@inertiajs/react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Conversations',
        href: '#',
    },
];

interface ConversationFilters {
    search?: string;
    channel?: string;
    line?: string;
}

export default function ConversationsPage(props: {
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
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conversations" />
            <div className="flex h-[calc(100svh-5rem)] max-h-[calc(100svh-5rem)] min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                <div className="relative flex min-h-0 flex-1 overflow-hidden">
                    <ChatPanel
                        conversations={props.conversations}
                        messages={props.messages}
                        conversationsMeta={props.conversationsMeta}
                        messagesMeta={props.messagesMeta}
                        filters={props.filters}
                        channelLines={props.channelLines}
                        selectedConversationId={props.selectedConversationId}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
