// resources/js/features/users/UserForm.tsx
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ValidationErrors } from '@/types';
import { Mail, UserPlus } from 'lucide-react';
import { useState } from 'react';
export function UserInvite() {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'supervisor' | 'agent'>('agent');
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isInviteOpen, setIsInviteOpen] = useState(open);

    const handleSubmit = () => {
        // Simulate form submission and validation
        const result = { success: true, error: { errors: {} } }; // Replace with actual submission logic

        if (!result.success) {
            setErrors(result.error.errors[0]);
            return;
        }

        setEmail('');
        setRole('agent');
    };

    return (
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
                    <DialogDescription>
                        Envía una invitación por correo electrónico para unirse
                        a tu equipo
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="usuario@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select
                            value={role}
                            onValueChange={(
                                value: 'admin' | 'supervisor' | 'agent',
                            ) => setRole(value)}
                            name="role"
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="supervisor">
                                    Supervisor
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} className="mt-2" />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsInviteOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Invitación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
