import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import * as Icons from 'lucide-react';
import { ChevronRight } from 'lucide-react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    const getIcon = (iconName?: string | React.ComponentType | null) => {
        if (!iconName) return null;
        if (typeof iconName === 'string') {
            const Icon = (Icons as unknown)[iconName];
            return Icon ? <Icon className="h-4 w-4" /> : null;
        }
        if (typeof iconName === 'function') {
            const IconComponent = iconName as React.ComponentType<{
                className?: string;
            }>;
            return <IconComponent className="h-4 w-4" />;
        }
        return null;
    };

    const getHref = (item: NavItem) => {
        return item.path || item.href || '#';
    };

    const isItemActive = (item: NavItem) => {
        const href = getHref(item);
        if (typeof href === 'string') {
            return page.url.startsWith(href);
        }
        return page.url.startsWith(href.url || '');
    };

    const renderMenuItem = (item: NavItem) => {
        const hasChildren = item.children && item.children.length > 0;
        const isActive = isItemActive(item);

        if (hasChildren) {
            return (
                <Collapsible key={item.label} asChild defaultOpen={isActive}>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                tooltip={{ children: item.label }}
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                {getIcon(item.icon)}
                                <span>{item.label}</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.children?.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.label}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={isItemActive(subItem)}
                                        >
                                            <Link
                                                href={getHref(subItem)}
                                                prefetch
                                            >
                                                {getIcon(subItem.icon)}
                                                <span>{subItem.label}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            );
        }

        return (
            <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={{ children: item.label }}
                >
                    <Link href={getHref(item)} prefetch>
                        {getIcon(item.icon)}
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>{items.map(renderMenuItem)}</SidebarMenu>
        </SidebarGroup>
    );
}
