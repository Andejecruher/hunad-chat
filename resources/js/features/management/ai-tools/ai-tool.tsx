"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ConfigBuilder } from "@/features/management/ai-tools/config-builder"
import { SchemaBuilder } from "@/features/management/ai-tools/schema-builder"
import {
    ExternalConfigComplete,
    InternalConfigComplete,
    ToolFormComplete,
    ToolType,
} from "@/types/tool"
import { router } from '@inertiajs/react'
import { ArrowLeft, Save } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function CreateTool() {
    const [isSaving, setIsSaving] = useState(false)

    const [form, setForm] = useState<ToolFormComplete>({
        name: "",
        type: "internal",
        description: "",
        enabled: true,
        schema: {
            inputs: [],
            outputs: [],
        },
        config: {
            action: "create_ticket",
        } as InternalConfigComplete,
    })

    const handleTypeChange = (type: ToolType) => {
        setForm({
            ...form,
            type,
            config:
                type === "internal"
                    ? ({ action: "create_ticket" } as InternalConfigComplete)
                    : ({ method: "POST", url: "", headers: [] } as ExternalConfigComplete),
        })
    }

    const handleSave = async () => {
        // Validaciones básicas
        if (!form.name.trim()) {
            toast.error("El nombre es requerido")
            return
        }

        setIsSaving(true)

        try {
            const formData = {
                name: form.name,
                type: form.type,
                description: form.description,
                category: form.type === 'internal' ? 'automation' : 'integration',
                schema: JSON.stringify(form.schema),
                config: JSON.stringify(form.config),
                enabled: form.enabled,
            }

            router.post('/configurations/ia-tools', formData, {
                onSuccess: () => {
                    toast.success("Herramienta creada exitosamente")
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0]
                    toast.error(typeof firstError === 'string' ? firstError : "Error al crear la herramienta")
                },
                onFinish: () => {
                    setIsSaving(false)
                }
            })

        } catch (error) {
            console.error("[v0] Error al crear tool:", error)
            toast.error("Error al crear la herramienta")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                // TODO: Reemplazar navegación mock por router real
                                window.location.href = "/admin/ai-tools"
                            }}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Herramientas de IA
                        </Button>
                        <span>/</span>
                        <span>Crear</span>
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">Crear herramienta de IA</h1>
                    <p className="text-muted-foreground">
                        Configura una nueva herramienta que los agentes de IA podrán usar para realizar acciones
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Guardando..." : "Guardar Herramienta"}
                </Button>
            </div>

            {/* Información General */}
            <Card>
                <CardHeader>
                    <CardTitle>Información General</CardTitle>
                    <CardDescription>Define los datos básicos de la herramienta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la Herramienta *</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Create Support Ticket"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Herramienta *</Label>
                            <Select value={form.type} onValueChange={(value) => handleTypeChange(value as ToolType)}>
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="internal">Interna (Acciones del sistema)</SelectItem>
                                    <SelectItem value="external">Externa (HTTP API)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe qué hace esta herramienta y cuándo usarla..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch id="enabled" checked={form.enabled} onCheckedChange={(checked) => setForm({ ...form, enabled: checked })} />
                        <Label htmlFor="enabled" className="cursor-pointer">
                            Herramienta habilitada
                        </Label>
                    </div>
                </CardContent>
            </Card>

            {/* Schema Builder */}
            <SchemaBuilder
                value={form.schema}
                onChange={(schema) => setForm({ ...form, schema })}
            />

            {/* Config Builder */}
            <ConfigBuilder
                type={form.type}
                value={form.config}
                onChange={(config) => setForm({ ...form, config })}
            />

            {/* Footer Actions */}
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        // TODO: Reemplazar navegación mock por router real
                        window.location.href = "/management/ai-tools"
                    }}
                >
                    Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Guardando..." : "Guardar Herramienta"}
                </Button>
            </div>
        </div>
    )
}
