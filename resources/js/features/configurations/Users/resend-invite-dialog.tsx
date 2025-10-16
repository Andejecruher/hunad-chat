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
import { Mail, CheckCircle } from "lucide-react"
import { User } from '@/types';
interface ResendInviteDialogProps {
    user: User
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ResendInviteDialog({ user, open, onOpenChange }: ResendInviteDialogProps) {
    const [sent, setSent] = useState(false)

    const handleResend = () => {
        // Simulate sending invitation
        setSent(true)
        setTimeout(() => {
            setSent(false)
            onOpenChange(false)
        }, 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reenviar Invitación</DialogTitle>
                    <DialogDescription>
                        Enviar nueva invitación a <strong>{user.email}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {sent ? (
                        <div className="flex items-center justify-center gap-2 rounded-lg border border-brand-green bg-brand-green/10 p-4 text-brand-green">
                            <CheckCircle className="h-5 w-5" />
                            <p className="font-medium">Invitación enviada exitosamente</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Se enviará un nuevo correo de invitación a <strong>{user.email}</strong> con instrucciones para activar
                                su cuenta.
                            </p>
                            <div className="rounded-lg border border-border bg-muted/50 p-3">
                                <p className="text-sm">
                                    <strong>Nota:</strong> El enlace de invitación anterior quedará invalidado.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    {!sent && (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleResend}>
                                <Mail className="mr-2 h-4 w-4" />
                                Reenviar Invitación
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
