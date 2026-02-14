import { useEffect, useRef } from 'react';

type MessagePayload = {
    id: number;
    body: string;
    sender_type: string;
    conversation_id: number;
    created_at: string;
    [key: string]: unknown;
};

function normalizePayload(raw: unknown): MessagePayload | undefined {
    if (!raw || typeof raw !== 'object') {
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = raw as any;

    // Some drivers wrap payload inside an event key (e.g., { message: { ... } })
    const source = r.message ?? r;

    const id = Number(source.id ?? source.message_id ?? source.external_id ?? 0);
    const body = (source.body as string | undefined) ?? (source.content as string | undefined) ?? '';
    const sender_type = (source.sender_type as string | undefined) ?? (source.sender as string | undefined) ?? 'agent';
    const conversation_id = Number(source.conversation_id ?? source.conversationId ?? source.conversation?.id ?? 0);
    const created_at = (source.created_at as string | undefined) ?? (source.createdAt as string | undefined) ?? new Date().toISOString();

    if (!conversation_id || !id) {
        return undefined;
    }

    return {
        id,
        body,
        sender_type,
        conversation_id,
        created_at,
    };
}

export default function useConversationRealtime(
    conversationId: number | undefined,
    onMessage?: (payload: MessagePayload) => void,
): void {
    const subscribed = useRef(false);

    useEffect(() => {
        if (conversationId === undefined) {
            return;
        }

        // @laravel/echo-react config in app.tsx sets up window.Echo
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const echo = (window as any).Echo;

        console.log('useConversationRealtime', echo);

        if (!echo || subscribed.current) {
            return;
        }

        const channelName = `conversation.${conversationId}`;
        const privateChannel = echo.private(channelName);

        const handler = (raw: unknown) => {
            try {
                const payload = normalizePayload(raw);

                if (payload && typeof onMessage === 'function') {
                    onMessage(payload);
                }
            } catch (e) {
                // swallow handler errors to avoid breaking the socket listener

                console.warn('useConversationRealtime handler error', e);
            }
        };

        // Listen common event names and variations to avoid mismatch with backend
        privateChannel.listen('message.received', handler);

        subscribed.current = true;

        return () => {
            try {
                privateChannel.stopListening('message.received');
                // Leave the underlying private channel to avoid leaks
                if (typeof echo.leave === 'function') {
                    echo.leave(`private-${channelName}`);
                }
            } finally {
                subscribed.current = false;
            }
        };
    }, [conversationId, onMessage]);
}
