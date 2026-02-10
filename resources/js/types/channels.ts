import { CompanySettings } from '@/types';
export type ChannelType = 'whatsapp' | 'instagram' | 'facebook' | 'telegram';

// Configuraciones específicas por canal
export interface WhatsAppConfig {
    access_token: string,
    phone_number_id: string,
    whatsapp_business_id: number,
    whatsapp_phone_number_id: number
    whatsapp_app_id: number
    whatsapp_app_secret: string
}

export interface InstagramConfig {
    accessToken: string;
    pageId: string;
    appSecret: string;
    webhookVerifyToken?: string;
}

export interface FacebookConfig {
    pageAccessToken: string;
    pageId: string;
    appSecret: string;
    verifyToken?: string;
}

export interface TelegramConfig {
    botToken: string;
    chatId: string;
    parseMode?: 'HTML' | 'Markdown';
    disableWebPagePreview?: boolean;
}

// Mapeo de tipos a configuraciones
export interface ChannelConfigMap {
    whatsapp: WhatsAppConfig;
    instagram: InstagramConfig;
    facebook: FacebookConfig;
    telegram: TelegramConfig;
}

// ✅ INTERFAZ ÚNICA CHANNEL - Se adapta automáticamente al tipo
export interface Channel {
    id: number;
    name: string;
    description?: string;
    company_id: number;
    type: ChannelType;
    status: 'active' | 'inactive';
    config: ChannelConfigMap[ChannelType]; // ← Se adapta según el tipo
    created_at: string;
    updated_at: string;
    company?: CompanySettings;
}

export const platformInfo = {
    whatsapp: { name: "WhatsApp", icon: "💬", color: "bg-green-500" },
    instagram: { name: "Instagram", icon: "📷", color: "bg-pink-500" },
    facebook: { name: "Facebook", icon: "👍", color: "bg-blue-500" },
    telegram: { name: "Telegram", icon: "✈️", color: "bg-sky-500" },
}
