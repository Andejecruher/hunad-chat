import { ChatPanel } from '@/features/conversations/chat-panel';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Conversations',
        href: '#',
    },
];

export default function ConversationsPage() {


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conversations" />
            <div className="flex h-screen flex-1 flex-col gap-4 overflow-hidden rounded-xl">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    {/* Conversations list component would go here */}
                    <ChatPanel />
                </div>
            </div>
        </AppLayout>
    );
}
