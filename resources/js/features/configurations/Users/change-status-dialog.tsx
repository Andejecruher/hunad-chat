import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { User } from '@/types';
import { Power } from 'lucide-react';
import { useState } from 'react';

interface ChangeStatusDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (userId: number, updates: Partial<User>) => void;
}

export function ChangeStatusDialog({
    user,
    open,
    onOpenChange,
    onSave,
}: ChangeStatusDialogProps) {
    const [status, setStatus] = useState<'active' | 'inactive' | 'pending'>(
        user.status,
    );

    const handleSave = () => {
        onSave(user.id, { status });
        onOpenChange(false);
    };

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
                        <Select
                            value={status}
                            onValueChange={(
                                value: 'active' | 'inactive' | 'pending',
                            ) => setStatus(value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    <div className="flex items-center justify-start gap-2">
                                        <p className="text-brand-green font-medium">
                                            Activo
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Usuario puede acceder al sistema
                                        </p>
                                    </div>
                                </SelectItem>
                                <SelectItem value="inactive">
                                    <div className="flex items-center justify-start gap-2">
                                        <p className="font-medium">Inactivo</p>
                                        <p className="text-xs text-muted-foreground">
                                            Usuario no puede acceder al sistema
                                        </p>
                                    </div>
                                </SelectItem>
                                <SelectItem value="pending">
                                    <div className="flex items-center justify-start gap-2">
                                        <p className="text-brand-gold font-medium">
                                            Pendiente
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Esperando confirmación de invitación
                                        </p>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {status === 'inactive' && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                            <p className="text-sm text-destructive">
                                Al desactivar este usuario, perderá acceso
                                inmediato al sistema y todas sus sesiones
                                activas se cerrarán.
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        <Power className="mr-2 h-4 w-4" />
                        Cambiar Estado
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
