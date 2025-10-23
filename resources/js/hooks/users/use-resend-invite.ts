import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface UseResendInviteReturn {
    isLoading: boolean;
    resendInvite: (userId: string) => Promise<void>;
}

export function useResendInvite(): UseResendInviteReturn {
    const [isLoading, setIsLoading] = useState(false);

    const resendInvite = async (userId: string): Promise<void> => {
        setIsLoading(true);

        return new Promise((resolve, reject) => {
            router.post(
                `/configurations/users/${userId}/resend-invite`,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onSuccess: (page) => {
                        toast.success('Invitación reenviada exitosamente', {
                            description: 'El usuario recibirá un nuevo correo con las credenciales de acceso.',
                        });
                        setIsLoading(false);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error(errors);
                        const errorMessage = errors.error || errors.message || 'Error al reenviar invitación';
                        toast.error('Error al reenviar invitación', {
                            description: errorMessage,
                        });
                        setIsLoading(false);
                        reject(new Error(errorMessage));
                    },
                    onFinish: () => {
                        setIsLoading(false);
                    },
                }
            );
        });
    };

    return {
        isLoading,
        resendInvite,
    };
}
