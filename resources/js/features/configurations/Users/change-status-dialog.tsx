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
import { Power } from "lucide-react"
import { User } from '@/types';

interface ChangeStatusDialogProps {
    user: User
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (userId: number, updates: Partial<User>) => void
}

export function ChangeStatusDialog({ user, open, onOpenChange, onSave }: ChangeStatusDialogProps) {
    const [status, setStatus] = useState<"active" | "inactive" | "pending">(user.status)

    const handleSave = () => {
        onSave(user.id, { status })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cambiar Estado de Usuario</DialogTitle>
                    <DialogDescription>
                        Cambia el estado de <strong>{user.name}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="status-select">Nuevo Estado</Label>
                        <Select value={status} onValueChange={(value: "active" | "inactive" | "pending") => setStatus(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    <div>
                                        <p className="font-medium text-brand-green">Activo</p>
                                        <p className="text-xs text-muted-foreground">Usuario puede acceder al sistema</p>
                                    </div>
                                </SelectItem>
                                <SelectItem value="inactive">
                                    <div>
                                        <p className="font-medium">Inactivo</p>
                                        <p className="text-xs text-muted-foreground">Usuario no puede acceder al sistema</p>
                                    </div>
                                </SelectItem>
                                <SelectItem value="pending">
                                    <div>
                                        <p className="font-medium text-brand-gold">Pendiente</p>
                                        <p className="text-xs text-muted-foreground">Esperando confirmación de invitación</p>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {status === "inactive" && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                            <p className="text-sm text-destructive">
                                Al desactivar este usuario, perderá acceso inmediato al sistema y todas sus sesiones activas se
                                cerrarán.
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        <Power className="mr-2 h-4 w-4" />
                        Cambiar Estado
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
