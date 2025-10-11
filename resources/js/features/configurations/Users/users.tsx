import { useState, useEffect, useCallback } from "react";
import { router } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Search, MoreVertical, Mail, Shield, Clock } from "lucide-react";
import { User as UserType } from '@/types';
import { users as usersRoute } from '@/routes/configurations';
import { Loader2 } from "lucide-react";

interface UserFilters {
  search?: string;
  role?: string;
}

interface PaginatedUsers {
  data: UserType[];
  links: { url: string | null; label: string; active: boolean }[];
  total: number;
}

export function Users({ users, filters }: { users: PaginatedUsers; filters: UserFilters }) {
    const [searchQuery, setSearchQuery] = useState<string>(filters.search ?? "");
    const [roleFilter, setRoleFilter] = useState<string>(filters.role ?? "all");
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"admin" | "supervisor" | "agent">("agent");
    const [isLoading, setIsLoading] = useState(false);
    // Debounce para búsqueda
    useEffect(() => {
        const handler = setTimeout(() => {
            const params = { search: searchQuery, role: roleFilter };
            router.get(usersRoute().url, params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['users'],
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            });
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery, roleFilter]);

    // Paginación
    const handlePageChange = useCallback((url: string | null) => {
        if (!url) return;
        const params = { search: searchQuery, role: roleFilter };
        router.get(url, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['users'],
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    }, [searchQuery, roleFilter]);

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "admin":
                return "default"
            case "agent":
                return "secondary"
            case "supervisor":
                return "outline"
            default:
                return "outline"
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-brand-green text-white">Activo</Badge>
            case "inactive":
                return <Badge variant="secondary">Inactivo</Badge>
            case "pending":
                return <Badge className="bg-brand-gold text-white">Pendiente</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">Usuarios</h1>
                    <p className="text-muted-foreground">Gestiona los usuarios de tu plataforma</p>
                </div>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invitar Usuario
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
                            <DialogDescription>Envía una invitación por correo electrónico para unirse a tu equipo</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="usuario@empresa.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol</Label>
                                <Select value={inviteRole} onValueChange={(value: never) => setInviteRole(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="agent">Agent</SelectItem>
                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={() => {
                                // Aquí iría la lógica de invitación real
                                setIsInviteOpen(false)
                            }}>
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar Invitación
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>Busca y filtra usuarios por rol</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Usuarios ({users.total})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                <th className="pb-3 font-medium">Usuario</th>
                                <th className="pb-3 font-medium">Rol</th>
                                <th className="pb-3 font-medium">Estado</th>
                                <th className="pb-3 font-medium">Última Conexión</th>
                                <th className="pb-3 font-medium">Estado Conexión</th>
                                <th className="pb-3 font-medium text-right">Acciones</th>
                            </tr>
                            </thead>
                            {isLoading ? (
                                <tbody>
                                <tr>
                                    <td colSpan={6} className="py-10 text-center">
                                        <div className="flex justify-center items-center py-4 text-gray-500">
                                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                            Cargando usuarios...
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                                ) : (
                                <tbody>
                                {users.data.map((user: UserType) =>{
                                    return (
                                        <tr key={user.id} className="border-b border-border">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        {user.logo_url ? (
                                                            <img
                                                                src={typeof user.logo_url === "string" && user.logo_url.startsWith("http")
                                                                    ? user.logo_url
                                                                    : `/storage/logos/${typeof user.logo_url === "string" ? user.logo_url.replace(/^\/+/, "") : ""}`}
                                                                alt={`Avatar de ${user.name}`}
                                                                className="w-full h-full object-cover rounded-full"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                                    <Shield className="mr-1 h-3 w-3" />
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="py-4">{getStatusBadge(user.status)}</td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    {user.last_connection && new Date(user.last_connection).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Badge className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-block w-2 h-2 rounded-full ${user.status_connection ? "bg-green-500" : "bg-red-500"}`}
                                                        aria-label={user.status_connection ? "Conectado" : "Desconectado"}
                                                    />
                                                        <span className="hidden sm:inline">
                                                        {user.status_connection ? "En línea" : "Desconectado"}
                                                    </span>
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                                                        <DropdownMenuItem>Editar Rol</DropdownMenuItem>
                                                        <DropdownMenuItem>Cambiar Estado</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">Eliminar Usuario</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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

            <div className="flex justify-end">
                <div className="flex items-center gap-2">
                    {users.links.map((link) => {
                        if (link.url) {
                            return (
                                <Button
                                    key={link.label}
                                    variant={link.active ? "default" : "outline"}
                                    onClick={() => handlePageChange(link.url)}
                                >
                                    {link.label}
                                </Button>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    )
}
