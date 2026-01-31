import { CreateTool } from "@/features/management/ai-tools/ai-tool";
import AppLayout from '@/layouts/app-layout';
import iaToolsRoutes from '@/routes/ia-tools';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Management',
        href: '#',
    },
    {
        title: 'IA Tools',
        href: iaToolsRoutes.index().url,
    },
    {
        title: 'Name IA Tool',
        href: iaToolsRoutes.index().url,
    },
];

export default function IAToolsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="IA Tools" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    <CreateTool />
                </div>
            </div>
        </AppLayout>
    );
}
