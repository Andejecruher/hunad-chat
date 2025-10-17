import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
const getRoleBadgeVariant = (role: string) => {
    switch (role) {
        case 'admin':
            return (
                <Badge variant="default">
                    <Shield className="mr-1 h-3 w-3" />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
            );
        case 'agent':
            return (
                <Badge variant="secondary">
                    <Shield className="mr-1 h-3 w-3" />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
            );
        case 'supervisor':
            return (
                <Badge variant="outline">
                    <Shield className="mr-1 h-3 w-3" />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
            );
        case 'super-admin':
            return (
                <Badge className="bg-blue-600 text-white">
                    <Shield className="mr-1 h-3 w-3" />
                    Super Admin
                </Badge>
            );
        default:
            return (
                <Badge variant="outline">
                    <Shield className="mr-1 h-3 w-3" />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
            );
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active':
            return <Badge className="bg-brand-green text-white">Activo</Badge>;
        case 'inactive':
            return <Badge variant="secondary">Inactivo</Badge>;
        case 'pending':
            return (
                <Badge className="bg-brand-gold text-white">Pendiente</Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const getRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
};

const getStatusConectionBadge = (status_connection: boolean) => {
    return (
        <Badge className="flex items-center gap-2">
            <span
                className={`inline-block h-2 w-2 rounded-full ${status_connection ? 'bg-green-500' : 'bg-red-500'}`}
                aria-label={status_connection ? 'Conectado' : 'Desconectado'}
            />
            <span className="hidden sm:inline">
                {status_connection ? 'En línea' : 'Desconectado'}
            </span>
        </Badge>
    );
};

export {
    getInitials,
    getRole,
    getRoleBadgeVariant,
    getStatusBadge,
    getStatusConectionBadge,
};
