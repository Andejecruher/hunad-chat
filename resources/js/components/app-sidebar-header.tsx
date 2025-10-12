import { Breadcrumbs } from '@/components/breadcrumbs';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/features/welcome/theme-toggle';
import { type BreadcrumbItem } from '@/types';
import { Bell } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItem[];
}) {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex flex-1 items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                </Button>
                <NavUser />
            </div>
        </header>
    );
}
