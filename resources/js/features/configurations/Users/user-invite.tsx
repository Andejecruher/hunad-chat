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
import users from '@/routes/users';
import { ValidationErrors } from '@/types';
import { router } from '@inertiajs/react';
import { Mail, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export function UserInvite() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<
        'admin' | 'supervisor' | 'agent' | 'super-admin'
    >('agent');
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Validación básica del frontend
        const newErrors: ValidationErrors = {};
        if (!name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }
        if (!email.trim()) {
            newErrors.email = 'El email es requerido';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        router.post(
            users.store().url,
            { name: name.trim(), email: email.trim(), role },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false);
                    setIsInviteOpen(false);
                    resetForm();
                    toast.success('Invitación enviada correctamente');
                },
                onError: (err) => {
                    setLoading(false);
                    setErrors(err);
                    const errorMessage =
                        err.message || 'Error al invitar usuario';
                    toast.error(errorMessage);
                },
            },
        );
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setRole('agent');
        setErrors({});
        setLoading(false);
    };

    return (
        <Dialog
            open={isInviteOpen}
            onOpenChange={(open) => {
                setIsInviteOpen(open);
                if (!open) resetForm();
            }}
        >
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
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Nombre del usuario"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                required
                                aria-describedby={
                                    errors.name ? 'name-error' : undefined
                                }
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                                id="name-error"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="usuario@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                                aria-describedby={
                                    errors.email ? 'email-error' : undefined
                                }
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                                id="email-error"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Rol</Label>
                            <Select
                                value={role}
                                onValueChange={(
                                    value:
                                        | 'admin'
                                        | 'supervisor'
                                        | 'agent'
                                        | 'super-admin',
                                ) => setRole(value)}
                                name="role"
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="agent">
                                        Agente
                                    </SelectItem>
                                    <SelectItem value="supervisor">
                                        Supervisor
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError
                                message={errors.role}
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setIsInviteOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !name.trim() || !email.trim()}
                        >
                            {loading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Enviar Invitación
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
