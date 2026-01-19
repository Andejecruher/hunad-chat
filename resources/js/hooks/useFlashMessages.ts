// src/hooks/useFlashMessages.ts
import {
    FlashMessages,
    FlashMessageType,
    ToastTemplatesMap,
} from '@/types';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useFlashMessages(
    flash: FlashMessages,
    templates?: ToastTemplatesMap
): void {
    useEffect(() => {
        if (!flash) return;

        const types: FlashMessageType[] = ['success', 'error', 'warning', 'info'];

        types.forEach((type) => {
            const message = flash[type];

            if (!message) return;

            const template = templates?.[type];

            if (template) {
                toast.custom(() => template({ message }));
                return;
            }

            switch (type) {
                case 'success':
                    toast.success(message);
                    break;
                case 'error':
                    toast.error(message);
                    break;
                case 'warning':
                    toast.warning(message);
                    break;
                case 'info':
                    toast.info(message);
                    break;
            }
        });
    }, [flash, templates]);
}
