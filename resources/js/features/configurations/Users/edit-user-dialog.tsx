import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { Save } from 'lucide-react';
import { useState } from 'react';
interface EditUserDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (userId: number, updates: Partial<User>) => void;
}

export function EditUserDialog({
    user,
    open,
    onOpenChange,
    onSave,
}: EditUserDialogProps) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    const handleSave = () => {
        onSave(user.id, { name, email });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Actualiza la información del usuario
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Nombre Completo</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre del usuario"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-email">Correo Electrónico</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="usuario@empresa.com"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
