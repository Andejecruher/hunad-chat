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
import type { Channel, ChannelType, TelegramConfig, WhatsAppConfig } from '@/types'
import { platformInfo } from '@/types/channels'
import { router } from "@inertiajs/react"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"

// Subcomponentes para configuraciones específicas por plataforma
// typescript
function WhatsAppConfigEditor({ config, onChange }: { config?: unknown; onChange: (c: unknown) => void }) {
    const cfg = (config as Record<string, unknown>) ?? {}

    const value = (key: string) => String(cfg[key] ?? '')

    const handleChange = (key: string, v: string) => {
        onChange({ ...(cfg as Record<string, unknown>), [key]: v })
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="whatsappAccessToken">API Key (access_token)</Label>
                <Input
                    id="whatsappAccessToken"
                    value={value('access_token')}
                    onChange={(e) => handleChange('access_token', e.target.value)}
                    placeholder="sk_xxx"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsappPhoneNumberId">Phone Number ID (phone_number_id)</Label>
                <Input
                    id="whatsappPhoneNumberId"
                    value={value('phone_number_id')}
                    onChange={(e) => handleChange('phone_number_id', e.target.value)}
                    placeholder="1234567890"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsappBusinessId">Business Account ID (whatsapp_business_id)</Label>
                <Input
                    id="whatsappBusinessId"
                    value={value('whatsapp_business_id')}
                    onChange={(e) => handleChange('whatsapp_business_id', e.target.value)}
                    placeholder="3223188252"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsappPhoneId">WhatsApp Phone ID (whatsapp_phone_number_id)</Label>
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
    // Muestra pares clave-valor simples para configuraciones desconocidas
    const cfg = useMemo(() => (config ?? {}) as Record<string, unknown>, [config])
    const keys = useMemo(() => Object.keys(cfg), [cfg])

    return (
        <div className="space-y-3">
            {keys.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay configuración adicional para este canal.</p>
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

// Helper de validación mínima por tipo
function validateChannel(channel: Partial<Channel>) {
    const errors: Record<string, string> = {}
    if (!channel.name || channel.name.trim().length === 0) {
        errors.name = 'El nombre es requerido'
    }
    if (!channel.type) {
        errors.type = 'El tipo de canal es requerido'
    }

    // Validaciones por tipo
    if (channel.type === 'whatsapp') {
        const cfg = channel.config as Partial<WhatsAppConfig> | undefined
        if (!cfg?.phone_number_id) errors.phone_number_id = 'Número de WhatsApp requerido'
        if (!cfg?.access_token) errors.access_token = 'API Key de WhatsApp requerida'
        if(!cfg?.whatsapp_business_id) errors.whatsapp_business_id = 'Business Account ID requerido'
        if (!cfg?.whatsapp_phone_number_id) errors.whatsapp_phone_number_id = 'Webhook URL requerido'
    }

    if (channel.type === 'telegram') {
        const cfg = channel.config as Partial<TelegramConfig> | undefined
        if (!cfg?.botToken) errors.botToken = 'Bot token requerido'
    }

    // company_id es requerido en el modelo
    if (!channel.company_id) {
        errors.company_id = 'company_id es requerido'
    }

    return errors
}

export function ChannelDetails({ channel }: { channel: Channel }) {
    const [formData, setFormData] = useState<Partial<Channel>>(channel || {})
    const [isSaving, setIsSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // actualizar campo simple
    const updateField = useCallback((key: keyof Channel, value: unknown) => {
        setFormData((prev) => ({ ...(prev || {}), [key]: value }))
    }, [])

    // actualizar config (objeto anidado)
    const updateConfig = useCallback((nextConfig: unknown) => {
        setFormData((prev) => ({
            ...(prev || {}),
            config: ((): Channel['config'] => {
                const base = (prev?.config ?? {}) as Record<string, unknown>
                const merged = { ...base, ...(nextConfig as Record<string, unknown>) }
                return merged as unknown as Channel['config']
            })(),
        }))
    }, [])

    if (!channel) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-lg font-semibold text-foreground mb-4">Canal no encontrado</p>
                <Button onClick={() => router.visit(`/channels`)}>Volver</Button>
            </div>
        )
    }

    const platform = (formData.type ?? channel.type) as ChannelType

    const handleSave = async () => {
        const allData = { ...channel, ...formData } as Channel
        const validation = validateChannel(allData)
        setErrors(validation)
        if (Object.keys(validation).length > 0) {
            toast.error('Corrige los errores antes de guardar')
            return
        }

        setIsSaving(true)
        try {
            // En un flujo real: usar router.post/put con la URL y datos.
            // Ejemplo: router.put(route('channels.update', channel.id), allData)
            await new Promise((resolve) => setTimeout(resolve, 800))
            toast.success('Cambios guardados', { description: 'La configuración del canal ha sido actualizada' })
            // redirigir o refrescar datos si es necesario
        } catch (e) {
            console.error(e)
            toast.error('Error al guardar')
        } finally {
            setIsSaving(false)
        }
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
                        <h1 className="font-heading text-3xl font-bold text-foreground">{formData.name || channel.name}</h1>
                    </div>
                    <p className="text-muted-foreground">{platformInfo[platform].name}</p>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">Información General</TabsTrigger>
                    <TabsTrigger value="config">Configuración</TabsTrigger>
                    <TabsTrigger value="meta">Metadatos</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                            <CardDescription>Detalles básicos del canal</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        value={formData.name ?? ''}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        placeholder="Nombre del canal"
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo de Canal</Label>
                                    <select
                                        id="type"
                                        value={formData.type ?? channel.type}
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
                                    <Label htmlFor="description">Descripción / ID</Label>
                                    <Input
                                        id="description"
                                        value={formData.description ?? channel.description ?? ''}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        placeholder="ID o descripción del canal"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_id">Company ID</Label>
                                    <Input
                                        id="company_id"
                                        type="number"
                                        value={String(formData.company_id ?? channel.company_id ?? '')}
                                        onChange={(e) => updateField('company_id', Number(e.target.value))}
                                        placeholder="Company ID"
                                    />
                                    {errors.company_id && <p className="text-sm text-destructive">{errors.company_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Estado</Label>
                                    <select
                                        id="status"
                                        value={formData.status ?? channel.status}
                                        onChange={(e) => updateField('status', e.target.value as Channel['status'])}
                                        className="w-full rounded-md border bg-background px-3 py-2"
                                    >
                                        <option value="active">Activo</option>
                                        <option value="inactive">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            {/* NOTA: los botones de acción se muestran fuera de las pestañas para tomar en cuenta todos los cambios */}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración</CardTitle>
                            <CardDescription>Configuración específica por plataforma</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Renderizar editor específico según tipo */}
                            {(formData.type ?? channel.type) === 'whatsapp' && (
                                <WhatsAppConfigEditor config={formData.config ?? channel.config} onChange={updateConfig} />
                            )}

                            {(formData.type ?? channel.type) === 'telegram' && (
                                <TelegramConfigEditor config={formData.config ?? channel.config} onChange={updateConfig} />
                            )}

                            {!['whatsapp', 'telegram'].includes((formData.type ?? channel.type) as string) && (
                                <GenericConfigEditor config={formData.config ?? channel.config} onChange={updateConfig} />
                            )}

                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="meta" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadatos</CardTitle>
                            <CardDescription>Fechas y datos inmutables</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Creado</Label>
                                    <p className="text-sm text-foreground">{channel.created_at}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Actualizado</Label>
                                    <p className="text-sm text-foreground">{channel.updated_at}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Barra de acciones global: guarda/cancela fuera de las pestañas */}
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => router.visit(`/channels`)}>
                    Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>

        </div>
    )
}
