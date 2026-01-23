import ChannelDetails from '@/features/channels/channel';
import AppLayout from '@/layouts/app-layout';
import channels from '@/routes/channels';
import { type BreadcrumbItem, Channel as ChannelType } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Channels',
        href: channels.index().url,
    },
];

export default function ChannelDetailsPage(props: {
    channel: ChannelType;
}) {
    const { channel } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={channel.name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    <ChannelDetails channel={channel} />
                </div>
            </div>
        </AppLayout>
    );
}
