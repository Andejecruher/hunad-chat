export interface RealtimeMessage {
    id?: string | number;
    content?: string;
    type?: string;
    sender_type?: string;
    created_at?: string;
}

export interface RealtimeConversation {
    id: string | number;
    name?: string;
    title?: string;
}

export interface RealtimePayload {
    message: RealtimeMessage;
    conversation: RealtimeConversation;
}

export const REALTIME_MESSAGE_EVENTS = [
    'v1.message.received',
    'v1.message.sent',
] as const;

export interface EchoChannel {
    listen: (
        event: string,
        callback: (data: RealtimePayload) => void,
    ) => EchoChannel;
    stopListening: (event: string) => void;
}

export interface EchoClient {
    private: (channel: string) => EchoChannel;
}
