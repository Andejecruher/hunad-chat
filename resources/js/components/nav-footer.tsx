import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import * as Icons from 'lucide-react';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    const getIcon = (iconName?: string | React.ComponentType | null) => {
        if (!iconName) return null;
        if (typeof iconName === 'string') {
            // @ts-ignore
            const Icon = (Icons as unknown)[iconName];
            return Icon ? <Icon className="h-5 w-5" /> : null;
        }
        if (typeof iconName === 'function') {
            const IconComponent = iconName as React.ComponentType<{
                className?: string;
            }>;
            return <IconComponent className="h-5 w-5" />;
        }
        return null;
    };

    return (
        <SidebarGroup
            {...props}
            className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}
        >
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton
                                asChild
                                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                            >
                                <a
                                    href={
                                        item.path ||
                                        (typeof item.href === 'string'
                                            ? item.href
                                            : item.href?.url) ||
                                        '#'
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {getIcon(item.icon)}
                                    <span>{item.label}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
