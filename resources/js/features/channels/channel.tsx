"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFlashMessages } from "@/hooks/useFlashMessages"
import channelsRouter from "@/routes/channels"
import type { Channel, ChannelType, FlashPayload, TelegramConfig, WhatsAppConfig } from '@/types'
import { platformInfo } from '@/types/channels'
import { formatDate } from "@/utils/dateFormatter"
import { router, useForm, usePage } from "@inertiajs/react"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"

// Subcomponents for platform-specific configurations
function WhatsAppConfigEditor({ config, onChange }: { config?: unknown; onChange: (c: unknown) => void }) {
    const cfg = (config as Record<string, unknown>) ?? {}
    const value = (key: string) => String(cfg[key] ?? '')

    const handleChange = (key: string, v: string) => {
        onChange({ ...(cfg as Record<string, unknown>), [key]: v })
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="whatsappAccessToken">API Key</Label>
                <Input
                    id="whatsappAccessToken"
                    value={value('access_token')}
                    onChange={(e) => handleChange('access_token', e.target.value)}
                    placeholder="sk_xxx"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsappPhoneNumberId">Phone Number ID</Label>
                <Input
                    id="whatsappPhoneNumberId"
                    value={value('phone_number_id')}
                    onChange={(e) => handleChange('phone_number_id', e.target.value)}
                    placeholder="1234567890"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsappBusinessId">Business Account ID</Label>
                <Input
                    id="whatsappBusinessId"
                    value={value('whatsapp_business_id')}
                    onChange={(e) => handleChange('whatsapp_business_id', e.target.value)}
                    placeholder="3223188252"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsappPhoneId">WhatsApp Phone ID</Label>
                <Input
                    id="whatsappPhoneId"
                    value={value('whatsapp_phone_number_id')}
                    onChange={(e) => handleChange('whatsapp_phone_number_id', e.target.value)}
                    placeholder="3223188252"
                />
            </div>
        </div>
    )
}

function TelegramConfigEditor({ config, onChange }: { config?: unknown; onChange: (c: unknown) => void }) {
    const cfg = (config as Partial<TelegramConfig>) ?? {}
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="telegramBotToken">Bot Token</Label>
                <Input
                    id="telegramBotToken"
                    value={cfg.botToken ?? ''}
                    onChange={(e) => onChange({ ...(cfg as Partial<TelegramConfig>), botToken: e.target.value })}
                    placeholder="123456:ABC-DEF"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="telegramChatId">Chat ID</Label>
                <Input
                    id="telegramChatId"
                    value={cfg.chatId ?? ''}
                    onChange={(e) => onChange({ ...(cfg as Partial<TelegramConfig>), chatId: e.target.value })}
                    placeholder="-123456789"
                />
            </div>
        </div>
    )
}

function GenericConfigEditor({ config, onChange }: { config?: unknown; onChange: (c: unknown) => void }) {
    // Shows simple key-value pairs for unknown configurations
    const cfg = useMemo(() => (config ?? {}) as Record<string, unknown>, [config])
    const keys = useMemo(() => Object.keys(cfg), [cfg])

    return (
        <div className="space-y-3">
            {keys.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No specific configurations for this channel type.
                </p>
            )}
            {keys.map((k) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" key={k}>
                    <div className="space-y-2">
                        <Label>{k}</Label>
                        <Input value={String(cfg[k] ?? '')} onChange={(e) => onChange({ ...cfg, [k]: e.target.value })} />
                    </div>
                </div>
            ))}
        </div>
    )
}

// Minimal validation helper by type
function validateChannel(channel: Partial<Channel>) {
    const errors: Record<string, string> = {}
    if (!channel.name || channel.name.trim().length === 0) {
        errors.name = 'Name is required'
    }
    if (!channel.type) {
        errors.type = 'Channel type is required'
    }

    // Validaciones por tipo
    if (channel.type === 'whatsapp') {
        const cfg = channel.config as Partial<WhatsAppConfig> | undefined
        if (!cfg?.phone_number_id) errors.phone_number_id = 'WhatsApp phone number required'
        if (!cfg?.access_token) errors.access_token = 'WhatsApp API key required'
        if (!cfg?.whatsapp_business_id) errors.whatsapp_business_id = 'Business Account ID required'
        if (!cfg?.whatsapp_phone_number_id) errors.whatsapp_phone_number_id = 'Webhook URL required'
    }

    if (channel.type === 'telegram') {
        const cfg = channel.config as Partial<TelegramConfig> | undefined
        if (!cfg?.botToken) errors.botToken = 'Bot token required'
    }

    // company_id es requerido en el modelo
    if (!channel.company_id) {
        errors.company_id = 'company_id is required'
    }

    return errors
}

function ChannelDetails({ channel }: { channel: Channel }) {
    const { props } = usePage();
    const [isSaving, setIsSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const form = useForm<Partial<Channel>>({ ...channel }) // inicializa con los valores del canal
    // initialize with the channel values

    useFlashMessages(props.flash as FlashPayload['flash']);

    // update simple field using useForm
    const updateField = useCallback((key: keyof Channel, value: unknown) => {
        form.setData(key, String(value))
    }, [form])

    // update config (nested object) using useForm
    const updateConfig = useCallback((nextConfig: unknown) => {
        const base = (form.data.config ?? {}) as Record<string, unknown>
        const merged = { ...base, ...(nextConfig as Record<string, unknown>) }
        form.setData('config', merged as unknown as Channel['config'])
    }, [form])

    if (!channel) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-lg font-semibold text-foreground mb-4">Channel not found</p>
                <Button onClick={() => router.visit(`/channels`)}>Back</Button>
            </div>
        )
    }

    const platform = (form.data.type ?? channel.type) as ChannelType

    // ...existing code...
    const handleSave = async () => {
        const allData = { ...channel, ...form.data } as Partial<Channel>;
        const validation = validateChannel(allData)
        setErrors(validation)

        if (Object.keys(validation).length > 0) {
            toast.error('Fix errors before saving')
            return
        }

        if (!allData) {
            toast.error('No data to save')
            return
        }

        const url = channelsRouter.update.url({ channel: channel.id })

        form.put(url, {
            preserveState: true,
            preserveScroll: true,
            only: ['channel', 'flash'],
            onStart: () => {
                setIsSaving(true)
            },
            onError: (errors) => {
                // Inertia returns validation errors; update local state if needed
                setErrors((errors ?? {}) as Record<string, string>)
            },
            onFinish: () => {
                setIsSaving(false)
            },
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.visit(`/channels`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${platformInfo[platform].color}`} />
                        <h1 className="font-heading text-3xl font-bold text-foreground">{form.data.name || channel.name}</h1>
                    </div>
                    <p className="text-muted-foreground">{platformInfo[platform].name}</p>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General Information</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                    <TabsTrigger value="meta">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Basic channel details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name ?? ''}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        placeholder="Channel name"
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Channel Type</Label>
                                    <select
                                        id="type"
                                        value={form.data.type ?? channel.type}
                                        onChange={(e) => updateField('type', e.target.value as ChannelType)}
                                        className="w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        {(Object.keys(platformInfo) as ChannelType[]).map((p) => (
                                            <option key={p} value={p}>{platformInfo[p].name}</option>
                                        ))}
                                    </select>
                                    {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description / ID</Label>
                                    <Input
                                        id="description"
                                        value={form.data.description ?? channel.description ?? ''}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        placeholder="Channel ID or description"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_id">Company ID</Label>
                                    <Input
                                        id="company_id"
                                        type="string"
                                        value={channel && channel?.company?.name}
                                        placeholder="Company ID"
                                        disabled
                                    />
                                    {errors.company_id && <p className="text-sm text-destructive">{errors.company_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={form.data.status ?? channel.status}
                                        onChange={(e) => updateField('status', e.target.value as Channel['status'])}
                                        className="w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* NOTE: action buttons are shown outside tabs to account for all changes */}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Platform-specific configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Renderizar editor específico según tipo */}
                            {(form.data.type ?? channel.type) === 'whatsapp' && (
                                <WhatsAppConfigEditor config={form.data.config ?? channel.config} onChange={updateConfig} />
                            )}

                            {(form.data.type ?? channel.type) === 'telegram' && (
                                <TelegramConfigEditor config={form.data.config ?? channel.config} onChange={updateConfig} />
                            )}

                            {!['whatsapp', 'telegram'].includes((form.data.type ?? channel.type) as string) && (
                                <GenericConfigEditor config={form.data.config ?? channel.config} onChange={updateConfig} />
                            )}

                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="meta" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadata</CardTitle>
                            <CardDescription>Dates and immutable data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Created</Label>
                                    <p className="text-sm text-foreground">{formatDate(channel.created_at, { timeZone: 'local', dateStyle: 'medium', timeStyle: 'medium', hour12: true })}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Updated</Label>
                                    <p className="text-sm text-foreground">{formatDate(channel.updated_at, { timeZone: 'local', dateStyle: 'medium', timeStyle: 'medium', hour12: true })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Barra de acciones global: guarda/cancela fuera de las pestañas */}
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => router.visit(`/channels`)}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="active:scale-95 transition-transform"
                    aria-busy={isSaving}
                >
                    {isSaving ? (
                        <span className="flex items-center gap-2">
                            <svg
                                className="h-4 w-4 animate-spin text-current"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                            Saving...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Changes
                        </span>
                    )}
                </Button>
            </div>

        </div>
    )
}

export default ChannelDetails
