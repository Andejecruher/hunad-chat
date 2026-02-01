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
        href: (function getUrl(route: unknown) {
            try {
                if (!route) return ''
                if (typeof route === 'function') {
                    const res = route()
                    return typeof res === 'string' ? res : res.url ?? String(res)
                }
                if (typeof route === 'object') return (route as { url?: string }).url ?? String(route)
                return String(route)
            } catch {
                return String(route)
            }
        })(aiToolsRoutes.index),
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
