import { Toaster } from '@/components/ui/sonner';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    children,
    title,
    description,
    maxWidthClass,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    maxWidthClass?: string; // e.g., "max-w-md", "max-w-lg"
}) {
    return (
        <AuthLayoutTemplate
            title={title}
            description={description}
            maxWidthClass={maxWidthClass}
            {...props}
        >
            {children}
            <Toaster richColors position="top-right" />
        </AuthLayoutTemplate>
    );
}
