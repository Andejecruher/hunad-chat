import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import channelsRouter from '@/routes/channels'
import { type ChannelConfigMap, type ChannelType, platformInfo } from '@/types/channels'
import { router } from '@inertiajs/react'
import { AlertCircle, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {toFormData} from "@/utils/form-data-utils";



// Definir configuración inicial por tipo
const getInitialConfig = (type: ChannelType): ChannelConfigMap[ChannelType] => {
    switch (type) {
        case 'whatsapp':
            return {  access_token: "", phone_number_id: "", whatsapp_business_id: 0, whatsapp_phone_number_id: 0 }
        // case 'instagram':
        //     return { accessToken: '', pageId: '', appSecret: '', webhookVerifyToken: '' }
        // case 'facebook':
        //     return { pageAccessToken: '', pageId: '', appSecret: '', verifyToken: '' }
        // case 'telegram':
        //     return { botToken: '', chatId: '', parseMode: 'HTML' as const, disableWebPagePreview: false }
        default:
            return {} as ChannelConfigMap[ChannelType]
    }
}

// Validaciones por tipo
const validateChannelConfig = (type: ChannelType, config: ChannelConfigMap[ChannelType]): string[] => {
    const errors: string[] = []

    switch (type) {
        case 'whatsapp': {
            const whatsappConfig = config as ChannelConfigMap['whatsapp']
            if (!whatsappConfig.phone_number_id) errors.push('El número de teléfono es requerido')
            if (!whatsappConfig.access_token) errors.push('La API Key es requerida')
            if(!whatsappConfig.whatsapp_phone_number_id) errors.push('El WhatsApp Phone Number ID es requerido')
            if(!whatsappConfig.whatsapp_business_id) errors.push('El Business Account Id es requerido')
            break
        }
        case 'instagram': {
            const instagramConfig = config as ChannelConfigMap['instagram']
            if (!instagramConfig.accessToken) errors.push('El Access Token es requerido')
            if (!instagramConfig.pageId) errors.push('El Page ID es requerido')
            if (!instagramConfig.appSecret) errors.push('El App Secret es requerido')
            break
        }
        case 'facebook': {
            const facebookConfig = config as ChannelConfigMap['facebook']
            if (!facebookConfig.pageAccessToken) errors.push('El Page Access Token es requerido')
            if (!facebookConfig.pageId) errors.push('El Page ID es requerido')
            if (!facebookConfig.appSecret) errors.push('El App Secret es requerido')
            break
        }
        case 'telegram': {
            const telegramConfig = config as ChannelConfigMap['telegram']
            if (!telegramConfig.botToken) errors.push('El Bot Token es requerido')
            if (!telegramConfig.chatId) errors.push('El Chat ID es requerido')
            break
        }
    }

    return errors
}

interface ChannelFormData {
    name: string
    description: string
    type: ChannelType
    config: ChannelConfigMap[ChannelType]
}

export function ChannelAdd() {
    const [open, setIsOpen] = useState(false)
    const [errors, setErrors] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<ChannelFormData>({
        name: '',
        description: '',
        type: 'whatsapp',
        config: getInitialConfig('whatsapp')
    })

    const renderConfigFields = () => {
        const { type, config } = formData

        switch (type) {
            case 'whatsapp': {
                const whatsappConfig = config as ChannelConfigMap['whatsapp']
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Número de Teléfono *</Label>
                            <Input
                                id="phoneNumber"
                                placeholder="+1234567890"
                                value={whatsappConfig.phone_number_id || ''}
                                onChange={(e) => handleConfigChange('phone_number_id', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apiKey">Meta API Key *</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                placeholder="Tu API Key de WhatsApp"
                                value={whatsappConfig.access_token || ''}
                                onChange={(e) => handleConfigChange('access_token', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="businessAccountId">Business Account ID</Label>
                            <Input
                                id="businessAccountId"
                                placeholder="ID de la cuenta empresarial"
                                value={whatsappConfig.whatsapp_business_id || ''}
                                onChange={(e) => handleConfigChange('whatsapp_business_id', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="businessAccountId">Phone number ID</Label>
                            <Input
                                id="businessAccountId"
                                placeholder="ID de la cuenta empresarial"
                                value={whatsappConfig.whatsapp_phone_number_id || ''}
                                onChange={(e) => handleConfigChange('whatsapp_phone_number_id', e.target.value)}
                            />
                        </div>
                    </>
                )
            }
            case 'instagram': {
                const instagramConfig = config as ChannelConfigMap['instagram']
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="accessToken">Access Token *</Label>
                            <Input
                                id="accessToken"
                                type="password"
                                placeholder="Tu Access Token de Instagram"
                                value={instagramConfig.accessToken || ''}
                                onChange={(e) => handleConfigChange('accessToken', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pageId">Page ID *</Label>
                            <Input
                                id="pageId"
                                placeholder="ID de la página de Instagram"
                                value={instagramConfig.pageId || ''}
                                onChange={(e) => handleConfigChange('pageId', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appSecret">App Secret *</Label>
                            <Input
                                id="appSecret"
                                type="password"
                                placeholder="Tu App Secret"
                                value={instagramConfig.appSecret || ''}
                                onChange={(e) => handleConfigChange('appSecret', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="webhookVerifyToken">Webhook Verify Token (Opcional)</Label>
                            <Input
                                id="webhookVerifyToken"
                                placeholder="Token de verificación del webhook"
                                value={instagramConfig.webhookVerifyToken || ''}
                                onChange={(e) => handleConfigChange('webhookVerifyToken', e.target.value)}
                            />
                        </div>
                    </>
                )
            }
            case 'facebook': {
                const facebookConfig = config as ChannelConfigMap['facebook']
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="pageAccessToken">Page Access Token *</Label>
                            <Input
                                id="pageAccessToken"
                                type="password"
                                placeholder="Tu Page Access Token"
                                value={facebookConfig.pageAccessToken || ''}
                                onChange={(e) => handleConfigChange('pageAccessToken', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pageId">Page ID *</Label>
                            <Input
                                id="pageId"
                                placeholder="ID de la página de Facebook"
                                value={facebookConfig.pageId || ''}
                                onChange={(e) => handleConfigChange('pageId', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appSecret">App Secret *</Label>
                            <Input
                                id="appSecret"
                                type="password"
                                placeholder="Tu App Secret"
                                value={facebookConfig.appSecret || ''}
                                onChange={(e) => handleConfigChange('appSecret', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="verifyToken">Verify Token (Opcional)</Label>
                            <Input
                                id="verifyToken"
                                placeholder="Token de verificación"
                                value={facebookConfig.verifyToken || ''}
                                onChange={(e) => handleConfigChange('verifyToken', e.target.value)}
                            />
                        </div>
                    </>
                )
            }
            case 'telegram': {
                const telegramConfig = config as ChannelConfigMap['telegram']
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="botToken">Bot Token *</Label>
                            <Input
                                id="botToken"
                                type="password"
                                placeholder="Tu Bot Token de Telegram"
                                value={telegramConfig.botToken || ''}
                                onChange={(e) => handleConfigChange('botToken', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chatId">Chat ID *</Label>
                            <Input
                                id="chatId"
                                placeholder="ID del chat"
                                value={telegramConfig.chatId || ''}
                                onChange={(e) => handleConfigChange('chatId', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parseMode">Parse Mode</Label>
                            <Select
                                value={telegramConfig.parseMode || 'HTML'}
                                onValueChange={(value: 'HTML' | 'Markdown') => handleConfigChange('parseMode', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HTML">HTML</SelectItem>
                                    <SelectItem value="Markdown">Markdown</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                id="disableWebPagePreview"
                                type="checkbox"
                                checked={telegramConfig.disableWebPagePreview || false}
                                onChange={(e) => handleConfigChange('disableWebPagePreview', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="disableWebPagePreview">Deshabilitar vista previa de enlaces</Label>
                        </div>
                    </>
                )
            }
            default:
                return null
        }
    }

    const handleClose = () => {
        setIsOpen(false)
        setFormData({
            name: '',
            description: '',
            type: 'whatsapp',
            config: getInitialConfig('whatsapp')
        })
        setErrors([])
    }

    const handleTypeChange = (value: ChannelType) => {
        setFormData(prev => ({ ...prev, type: value }))
    }

    const handleConfigChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            config: { ...prev.config, [field]: value }
        }))
    }
    const handleSubmit = async () => {
        // Validaciones básicas
        const formErrors: string[] = []

        if (!formData.name.trim()) {
            formErrors.push('El nombre del canal es requerido')
        }

        // Validaciones específicas por tipo
        const configErrors = validateChannelConfig(formData.type, formData.config)
        formErrors.push(...configErrors)

        if (formErrors.length > 0) {
            setErrors(formErrors)
            return
        }

        setIsSubmitting(true)
        setErrors([])

        try {
            const backendData = toFormData({...formData}, 'POST');
            // Enviar al backend usando Inertia
            router.post(channelsRouter.store.url(), backendData, {
                preserveState: true,
                preserveScroll: true,
                forceFormData: true,
                onStart: () => setIsSubmitting(true),
                onSuccess: () => {
                    handleClose()
                },
                onFinish: () => {
                    setIsSubmitting(false)
                }
            })

        } catch (error) {
            console.error('Error inesperado:', error)
            setErrors(['Error inesperado al crear el canal'])
            toast.error("Error inesperado", {
                description: "Ocurrió un error inesperado. Intenta nuevamente.",
            })
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            config: getInitialConfig(prev.type)
        }))
        setErrors([])
    }, [formData.type])

    return (
        <Dialog open={open} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Canal
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Agregar Nuevo Canal</DialogTitle>
                    <DialogDescription>
                        Configura una nueva cuenta para tu plataforma de mensajería
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Mostrar errores */}
                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <div className="flex">
                                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                <div className="ml-2">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Corrige los siguientes errores:
                                    </h3>
                                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información básica */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Información Básica</h3>

                        <div className="space-y-2">
                            <Label htmlFor="platform">Plataforma *</Label>
                            <Select value={formData.type} onValueChange={handleTypeChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(platformInfo).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            <div className="flex items-center space-x-2">
                                                <span>{value.icon}</span>
                                                <span>{value.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Canal *</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Ventas Principal"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Input
                                id="description"
                                placeholder="Descripción del canal"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Configuración específica */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Configuración de {platformInfo[formData.type]?.name}
                        </h3>
                        {renderConfigFields()}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creando..." : "Agregar Canal"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
