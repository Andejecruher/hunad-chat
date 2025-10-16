import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield } from "lucide-react"
import { User } from '@/types';

interface ChangeRoleDialogProps {
    user: User
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (userId: number, updates: Partial<User>) => void
}

export function ChangeRoleDialog({ user, open, onOpenChange, onSave }: ChangeRoleDialogProps) {
    const [role, setRole] = useState<'admin' | 'agent' | 'super-admin' | 'supervisor'>(user.role)

    const handleSave = () => {
        onSave(user.id, { role })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
                    <DialogDescription>
                        Cambia el rol de <strong>{user.name}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-select">Nuevo Rol</Label>
                        <Select value={role} onValueChange={(value: 'admin' | 'agent' | 'super-admin' | 'supervisor') => setRole(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        <div>
                                            <p className="font-medium">Admin</p>
                                            <p className="text-xs text-muted-foreground">Acceso completo al sistema</p>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Manager">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        <div>
                                            <p className="font-medium">Manager</p>
                                            <p className="text-xs text-muted-foreground">Gestión de equipos y reportes</p>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Agent">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        <div>
                                            <p className="font-medium">Agent</p>
                                            <p className="text-xs text-muted-foreground">Atención de conversaciones</p>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground">
                            El usuario recibirá una notificación sobre el cambio de rol y sus nuevos permisos.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        <Shield className="mr-2 h-4 w-4" />
                        Cambiar Rol
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
