import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useResendInvite } from '@/hooks/users/use-resend-invite';
import { User } from '@/types';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';

interface ResendInviteDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ResendInviteDialog({
    user,
    open,
    onOpenChange,
}: ResendInviteDialogProps) {
    const [sent, setSent] = useState(false);
    const { isLoading, resendInvite } = useResendInvite();

    const handleResend = async () => {
        try {
            await resendInvite(user.id.toString());
            setSent(true);
            setTimeout(() => {
                setSent(false);
                onOpenChange(false);
            }, 2000);
        } catch (error) {
            // El error ya se maneja en el hook con toast
            console.error('Error resending invite:', error);
        }
    };

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
                        <div className="border-brand-green bg-brand-green/10 text-brand-green flex items-center justify-center gap-2 rounded-lg border p-4">
                            <CheckCircle className="h-5 w-5" />
                            <p className="font-medium">
                                Invitación enviada exitosamente
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Se enviará un nuevo correo de invitación a{' '}
                                <strong>{user.email}</strong> con instrucciones
                                para activar su cuenta.
                            </p>
                            <div className="rounded-lg border border-border bg-muted/50 p-3">
                                <p className="text-sm">
                                    <strong>Nota:</strong> El enlace de
                                    invitación anterior quedará invalidado.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    {!sent && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleResend} disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Mail className="mr-2 h-4 w-4" />
                                )}
                                {isLoading
                                    ? 'Enviando...'
                                    : 'Reenviar Invitación'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
