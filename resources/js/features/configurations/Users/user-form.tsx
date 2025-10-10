// resources/js/features/users/UserForm.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail } from "lucide-react";
import { z } from "zod";

const userSchema = z.object({
    email: z.string().email("Email inválido"),
    role: z.enum(["admin", "supervisor", "agent"]),
});

interface UserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInvite: (user: { email: string; role: "admin" | "supervisor" | "agent" }) => void;
}

export function UserForm({ open, onOpenChange, onInvite }: UserFormProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "supervisor" | "agent">("agent");
    const [error, setError] = useState<string | undefined>(undefined);

    const handleSubmit = () => {
        const result = userSchema.safeParse({ email, role });
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }
        setError(undefined);
        onInvite({ email, role });
        setEmail("");
        setRole("agent");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-label="Correo Electrónico"
                            required
                        />
                        {error && <span className="text-destructive text-sm">{error}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as "admin" | "supervisor" | "agent")}>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} aria-label="Enviar invitación">
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Invitación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
