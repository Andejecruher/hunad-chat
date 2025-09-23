import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    { label: 'Conversaciones', icon: 'MessageSquare', path: '/conversations' },
    { label: 'Tickets', icon: 'Ticket', path: '/tickets' },
    { label: 'Ventas', icon: 'ShoppingCart', path: '/sales' },
    {
        label: 'Gestión',
        icon: 'Settings2',
        children: [
            { label: 'Clientes', icon: 'Users', path: '/customers' },
            { label: 'Departamentos', icon: 'Building', path: '/departments' },
            { label: 'Agentes', icon: 'UserCog', path: '/agents' },
            { label: 'Herramientas IA', icon: 'Bot', path: '/tools' },
        ],
    },
    {
        label: 'Canales',
        icon: 'Share2',
        path: '/channels',
    },
    {
        label: 'Configuración',
        icon: 'Settings',
        children: [
            {
                label: 'Compañía',
                icon: 'Briefcase',
                path: '/configurations/company',
            },
            {
                label: 'Suscripción',
                icon: 'CreditCard',
                path: '/company/subscription',
            },
            { label: 'Usuarios', icon: 'UserPlus', path: '/company/users' },
        ],
    },
    {
        label: 'Reportes',
        icon: 'BarChart2',
        children: [
            { label: 'Analíticas', icon: 'TrendingUp', path: '/analytics' },
            { label: 'Reportes IA', icon: 'Cpu', path: '/analytics/ai' },
        ],
        subscriptionRequired: 'pro',
    },
];

const footerNavItems: NavItem[] = [
    {
        label: 'Documentation',
        icon: 'BookOpen',
        path: 'https://laravel.com/docs/starter-kits#react',
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
