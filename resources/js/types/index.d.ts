import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface ValidationErrors {
    [key: string]: string;
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    label?: string;
    icon?: string | LucideIcon | null;
    path?: string;
    href?: NonNullable<InertiaLinkProps['href']>;
    children?: NavItem[];
    subscriptionRequired?: string;
    isActive?: boolean;
    title?: string;
    description?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at?: string | null;
    two_factor_enabled?: boolean;
    created_at?: string;
    updated_at?: string;
    role: 'admin' | 'agent' | 'super-admin' | 'supervisor';
    last_connection: number | null;
    status_connection: boolean;
    status: 'active' | 'inactive' | 'pending';
    company_id: number;
    [key: string]: unknown; // This allows for additional properties...
}

export interface BrandingTheme {
    light: {
        colors: {
            primary: string;
            secondary: string;
        };
    };
    dark: {
        colors: {
            primary: string;
            secondary: string;
        };
    };
}

export interface CompanySettings {
    id?: number;
    name: string;
    slug: string;
    subscription_type?: 'free' | 'basic' | 'pro' | 'enterprise';
    branding: {
        theme: BrandingTheme;
        logo_url: string;
        logo_path?: string;
        default_theme: 'light' | 'dark';
    };
}

export interface PaginationLink {
    url: string | undefined;
    label: string;
    active: boolean;
}

export interface PaginatedUsers {
    data: UserType[];
    links: PaginationLink[];
    total: number;
    to: number;
    from: number;
}
