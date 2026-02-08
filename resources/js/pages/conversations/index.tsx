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
    conversations: Conversation[];
    messages: PaginatedData<Message[]> | null;
    filters: ConversationFilters;
    channelLines: ChannelLine[];
    selectedConversationId?: string | null;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conversations" />
            <div className="flex max-h-[calc(100svh-5rem)] h-[calc(100svh-5rem)] min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-xl">
                <div className="relative flex min-h-0 flex-1 overflow-hidden">
                    <ChatPanel
                        conversations={props.conversations}
                        messages={props.messages}
                        filters={props.filters}
                        channelLines={props.channelLines}
                        selectedConversationId={props.selectedConversationId}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
