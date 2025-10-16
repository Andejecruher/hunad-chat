import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Mail, Shield, Clock, Calendar, Activity } from "lucide-react"
import { User } from '@/types';

interface UserDetailsDialogProps {
    user: User
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalles del Usuario</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="mt-2 flex gap-2">
                                <Badge variant="outline">
                                    <Shield className="mr-1 h-3 w-3" />
                                    {user.role}
                                </Badge>
                                {getStatusBadge(user.status)}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span className="font-medium">Email:</span>
                            </div>
                            <p className="text-sm">{user.email}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Shield className="h-4 w-4" />
                                <span className="font-medium">Rol:</span>
                            </div>
                            <p className="text-sm">{user.role}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Última Conexión:</span>
                            </div>
                            <p className="text-sm">{user.last_connection}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">Fecha de Registro:</span>
                            </div>
                            <p className="text-sm">15 de Enero, 2025</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Activity className="h-4 w-4" />
                            Estadísticas de Actividad
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-border bg-muted/50 p-3">
                                <p className="text-2xl font-bold text-brand-green">247</p>
                                <p className="text-xs text-muted-foreground">Conversaciones</p>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 p-3">
                                <p className="text-2xl font-bold text-brand-teal">1,834</p>
                                <p className="text-xs text-muted-foreground">Mensajes Enviados</p>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 p-3">
                                <p className="text-2xl font-bold text-brand-gold">4.8</p>
                                <p className="text-xs text-muted-foreground">Calificación Promedio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
