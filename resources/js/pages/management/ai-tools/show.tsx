import { ShowTool } from "@/features/management/ai-tools/show-tool";
import AppLayout from '@/layouts/app-layout';
import aiToolsRoutes from '@/routes/ai-tools';
import { type BreadcrumbItem, type Tool } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs = (tool: Tool): BreadcrumbItem[] => [
    {
        title: 'Management',
        href: '#',
    },
    {
        title: 'AI Tools',
        href: aiToolsRoutes.index().url,
    },
    {
        title: tool.name,
        href: '#',
    },
];

export default function ShowAIToolPage(props: {
    tool: Tool;
    executionStats: any;
}) {
    const { tool, executionStats } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs(tool)}>
            <Head title={`AI Tool: ${tool.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                <div className="relative min-h-screen flex-1 overflow-x-auto md:min-h-min">
                    <ShowTool tool={tool} executionStats={executionStats} />
                </div>
            </div>
        </AppLayout>
    );
}