import { Pagination } from '@/components/pagination';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import users from '@/routes/users';
import {PaginatedData, User as UserType, Filters} from '@/types';
import {
    getInitials,
    getRoleBadgeVariant,
    getStatusBadge,
    getStatusConectionBadge,
} from '@/utils/user-utils';
import { router } from '@inertiajs/react';
import { Clock, Loader2, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { UserActions } from './user-actions';
import { UserInvite } from './user-invite';
import {toast} from "sonner";
import { toFormData } from '@/utils/form-data-utils';
export function Users({
    usersData,
    filters,
}: {
    usersData: PaginatedData<UserType[]>;
    filters: Filters;
}) {
    const [searchQuery, setSearchQuery] = useState<string>(
        filters.search ?? '',
    );
    const [roleFilter, setRoleFilter] = useState<string>(filters.role ?? 'all');
    const [statusFilter, setStatusFilter] = useState<string>(
        filters.status ?? 'all',
    );
    const [limitFilter, setLimitFilter] = useState<string>(
        filters.limit ?? '10',
    );
    const [isLoading, setIsLoading] = useState(false);
    // Paginación
    const handlePageChange = useCallback(
        (url: string | undefined) => {
            if (!url) return;
            const params = {
                search: searchQuery,
                role: roleFilter,
                limit: limitFilter,
                status: statusFilter,
            };
            router.get(url, params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['users'],
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            });
        },
        [searchQuery, roleFilter, statusFilter, limitFilter],
    );

    const handleUpdateUser = (userId: number, updates: Partial<UserType>) => {
        setIsLoading(true);
        // Convertimos updates a FormData para cumplir la firma de Inertia
        const payload = toFormData(updates, 'PUT');
        // Añadimos el método PUT
        router.post(users.update(userId).url, payload, {
            preserveState: true,
            preserveScroll: true,
            forceFormData: true,
            onStart: () => setIsLoading(true),
            onSuccess: () => {
                setIsLoading(false);
                toast.success('User updated successfully.');
            },
            onError: (error) => {
                toast.error(error.message);
                setIsLoading(false);
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDeleteUser = (userId: number) => {
        setIsLoading(true);
        router.delete(users.destroy(userId).url, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setIsLoading(true),
            onSuccess: () => {
                setIsLoading(false);
                toast.warning('User deleted successfully.');
            },
            onError: (error   ) => {
                toast.error(error.message);
                setIsLoading(false)
            },
            onFinish: () => setIsLoading(false),
        });
    };

    // Debounce para búsqueda
    useEffect(() => {
        // Evitar ejecución en el primer render si los valores son iguales a los filtros iniciales
        const initial = {
            search: filters.search ?? '',
            role: filters.role ?? 'all',
            limit: filters.limit ?? '10',
            status: filters.status ?? 'all',
        };

        if (
            searchQuery === initial.search &&
            roleFilter === initial.role &&
            limitFilter === initial.limit &&
            statusFilter === initial.status
        ) {
            return;
        }

        // Debounce para búsqueda
        const handler = setTimeout(() => {
            const params = {
                search: searchQuery,
                role: roleFilter,
                limit: limitFilter,
                status: statusFilter,
            };
            const url = users.index.url({ query: params });
            router.get(
                url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['users'],
                    onStart: () => setIsLoading(true),
                    onError: (error) => {
                        toast.error(error.message);
                        setIsLoading(false);
                    },
                    onFinish: () => setIsLoading(false),
                },
            );
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, roleFilter, limitFilter, statusFilter, filters]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">
                        Usuarios
                    </h1>
                    <p className="text-muted-foreground">
                        Gestiona los usuarios de tu plataforma
                    </p>
                </div>
                <UserInvite />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>
                        Busca y filtra usuarios por rol
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 xl:flex-row">
                        <div className="relative block flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={roleFilter}
                            onValueChange={setRoleFilter}
                        >
                            <SelectTrigger className="w-full xl:w-40">
                                <SelectValue placeholder="Rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos los roles
                                </SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="supervisor">
                                    Supervisor
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-full xl:w-40">
                                <SelectValue placeholder="Estatus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos los estatus
                                </SelectItem>
                                <SelectItem value="active">Activo</SelectItem>
                                <SelectItem value="inactive">
                                    Inactivo
                                </SelectItem>
                                <SelectItem value="pending">
                                    Pendiente
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={limitFilter.toString()}
                            onValueChange={setLimitFilter}
                        >
                            <SelectTrigger className="w-full xl:w-40">
                                <SelectValue placeholder="Items Por Pagina" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="all">Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Total de usuarios ({usersData.total})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                    <th className="pb-3 font-medium">
                                        Usuario
                                    </th>
                                    <th className="pb-3 font-medium">Rol</th>
                                    <th className="pb-3 font-medium">Estado</th>
                                    <th className="pb-3 font-medium">
                                        Última Conexión
                                    </th>
                                    <th className="pb-3 font-medium">
                                        Estado Conexión
                                    </th>
                                    <th className="pb-3 text-right font-medium">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            {isLoading ? (
                                <tbody>
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-10 text-center"
                                        >
                                            <div className="flex items-center justify-center py-4 text-gray-500">
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Cargando usuarios...
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody>
                                    {usersData.data.map((user: UserType) => {
                                        return (
                                            <tr
                                                key={user.id}
                                                className="border-b border-border"
                                            >
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            {user.logo_url ? (
                                                                <img
                                                                    src={
                                                                        typeof user.logo_url ===
                                                                            'string' &&
                                                                        user.logo_url.startsWith(
                                                                            'http',
                                                                        )
                                                                            ? user.logo_url
                                                                            : `/storage/logos/${typeof user.logo_url === 'string' ? user.logo_url.replace(/^\/+/, '') : ''}`
                                                                    }
                                                                    alt={`Avatar de ${user.name}`}
                                                                    className="h-full w-full rounded-full object-cover"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                                    {getInitials(
                                                                        user.name,
                                                                    )}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    {getRoleBadgeVariant(
                                                        user.role,
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    {getStatusBadge(
                                                        user.status,
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        {user.last_connection &&
                                                            new Date(
                                                                user.last_connection,
                                                            ).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        {getStatusConectionBadge(
                                                            user.status_connection,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <UserActions
                                                        user={user}
                                                        onUpdate={
                                                            handleUpdateUser
                                                        }
                                                        onDelete={
                                                            handleDeleteUser
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            )}
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="block">
                {usersData.links && (
                    <Pagination
                        links={usersData.links}
                        onChange={handlePageChange}
                        showInfo={true}
                        position="center"
                        to={usersData.to}
                        from={usersData.from}
                        total={usersData.total}
                    />
                )}
            </div>
        </div>
    );
}
