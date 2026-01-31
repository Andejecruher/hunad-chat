import { AIToolsList } from "@/features/management/ai-tools/ai-tools";
import AppLayout from '@/layouts/app-layout';
import aiToolsRoutes from '@/routes/ai-tools';
import { type BreadcrumbItem, type PaginatedData, type Tool } from '@/types';
import { Head } from '@inertiajs/react';

interface ToolFilters {
    search?: string;
    status?: string;
    type?: string;
    category?: string;
    limit?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Management',
        href: '#',
    },
    {
        title: 'AI Tools',
        href: aiToolsRoutes.index().url,
    },
];

export default function AIToolsPage(props: {
    tools: PaginatedData<Tool[]>;
    filters: ToolFilters;
    categories: string[];
}) {
    const { tools, filters, categories } = props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AI Tools" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    <AIToolsList
                        toolsData={tools}
                        filters={filters}
                        categories={categories}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
