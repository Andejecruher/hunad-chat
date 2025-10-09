import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserPlus, Search, MoreVertical, Mail, Shield, Clock } from "lucide-react"

interface User {
    id: string
    name: string
    email: string
    role: "Admin" | "Manager" | "Agent"
    status: "active" | "inactive" | "pending"
    lastConnection: string
}

const mockUsers: User[] = [
    {
        id: "1",
        name: "Ana García",
        email: "ana.garcia@empresa.com",
        role: "Admin",
        status: "active",
        lastConnection: "Hace 5 min",
    },
    {
        id: "2",
        name: "Carlos López",
        email: "carlos.lopez@empresa.com",
        role: "Manager",
        status: "active",
        lastConnection: "Hace 1 hora",
    },
    {
        id: "3",
        name: "María Rodríguez",
        email: "maria.rodriguez@empresa.com",
        role: "Agent",
        status: "active",
        lastConnection: "Hace 2 horas",
    },
    {
        id: "4",
        name: "Juan Martínez",
        email: "juan.martinez@empresa.com",
        role: "Agent",
        status: "inactive",
        lastConnection: "Hace 2 días",
    },
    {
        id: "5",
        name: "Laura Sánchez",
        email: "laura.sanchez@empresa.com",
        role: "Agent",
        status: "pending",
        lastConnection: "Nunca",
    },
]

export function Users() {
    const [users, setUsers] = useState<User[]>(mockUsers)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState<"Admin" | "Manager" | "Agent">("Agent")

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === "all" || user.role === roleFilter
        const matchesStatus = statusFilter === "all" || user.status === statusFilter
        return matchesSearch && matchesRole && matchesStatus
    })

    const handleInviteUser = () => {
        if (!inviteEmail) return

        const newUser: User = {
            id: String(users.length + 1),
            name: inviteEmail.split("@")[0],
            email: inviteEmail,
            role: inviteRole,
            status: "pending",
            lastConnection: "Nunca",
        }

        setUsers([...users, newUser])
        setInviteEmail("")
        setInviteRole("Agent")
        setIsInviteOpen(false)
    }

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "Admin":
                return "default"
            case "Manager":
                return "secondary"
            case "Agent":
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
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Agent">Agent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleInviteUser}>
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
                    <CardDescription>Busca y filtra usuarios por rol y estado</CardDescription>
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
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Agent">Agent</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="active">Activo</SelectItem>
                                <SelectItem value="inactive">Inactivo</SelectItem>
                                <SelectItem value="pending">Pendiente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
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
                                <th className="pb-3 font-medium text-right">Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-border">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
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
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="py-4">{getStatusBadge(user.status)}</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            {user.lastConnection}
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
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
