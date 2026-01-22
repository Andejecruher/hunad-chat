import { Channels } from '@/features/channels/channels';
import AppLayout from '@/layouts/app-layout';
import channels from '@/routes/channels';
import { type BreadcrumbItem, Channel, Filters, PaginatedData } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Channels',
        href: channels.index().url,
    },
];

export default function ChannelsPage(props: {
    channels: PaginatedData<Channel[]>;
    filters: Filters;
}) {
    const { channels, filters } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Channels" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    <Channels channelsData={channels} filters={filters} />
                </div>
            </div>
        </AppLayout>
    );
}
