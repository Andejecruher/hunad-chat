import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
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
import channels from '@/routes/channels';
import company from '@/routes/company';
import departments from '@/routes/departments';
import iaTools from '@/routes/ia-tools';
import users from '@/routes/users';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const mainNavItems: NavItem[] = [
        { label: 'Dashboard', icon: 'LayoutDashboard', path: dashboard().url },
        {
            label: 'Conversaciones',
            icon: 'MessageSquare',
            path: '#',
        },
        { label: 'Tickets', icon: 'Ticket', path: '#' },
        { label: 'Ventas', icon: 'ShoppingCart', path: '#' },
        {
            label: 'Gestión',
            icon: 'Settings2',
            children: [
                { label: 'Clientes', icon: 'Users', path: '#' },
                {
                    label: 'Departamentos',
                    icon: 'Building',
                    path: departments.index().url,
                },
                { label: 'Agentes', icon: 'UserCog', path: '#' },
                { label: 'Herramientas IA', icon: 'Bot', path: iaTools.index().url },
            ],
        },
        {
            label: 'Canales',
            icon: 'Share2',
            path: channels.index().url,
        },
        {
            label: 'Configuración',
            icon: 'Settings',
            children: [
                {
                    label: 'Compañía',
                    icon: 'Briefcase',
                    path: company.show({
                        company: auth.user.company_id,
                    }).url,
                },
                {
                    label: 'Suscripción',
                    icon: 'CreditCard',
                    path: '#',
                },
                {
                    label: 'Usuarios',
                    icon: 'UserPlus',
                    path: users.index().url,
                },
            ],
        },
        {
            label: 'Reportes',
            icon: 'BarChart2',
            children: [
                { label: 'Analíticas', icon: 'TrendingUp', path: '#' },
                { label: 'Reportes IA', icon: 'Cpu', path: '#' },
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
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" variant="outline" asChild>
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
            </SidebarFooter>
        </Sidebar>
    );
}
