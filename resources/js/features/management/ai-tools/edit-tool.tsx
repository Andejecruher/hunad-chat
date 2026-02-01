import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import aiToolsRoutes from '@/routes/ai-tools';
import {
    type ExternalConfigComplete,
    type InternalConfigComplete,
    type SchemaBuilderStateComplete,
    type Tool,
    type ToolFormComplete,
    type ToolType
} from '@/types';
import { router } from '@inertiajs/react';
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfigBuilder } from "./config-builder";
import { SchemaBuilder } from "./schema-builder";

interface EditToolProps {
    tool: Tool;
    categories: string[];
}

export function EditTool({ tool }: EditToolProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Parse existing data
    const parseSchema = (schemaString: string | SchemaBuilderStateComplete): SchemaBuilderStateComplete => {
        try {
            return typeof schemaString === 'string' ? JSON.parse(schemaString) : schemaString;
        } catch {
            return { inputs: [], outputs: [] };
        }
    };

    const parseConfig = (configString: string | InternalConfigComplete | ExternalConfigComplete) => {
        try {
            return typeof configString === 'string' ? JSON.parse(configString) : configString;
        } catch {
            return tool.type === 'internal'
                ? { action: "create_ticket" } as InternalConfigComplete
                : { method: "POST", url: "", headers: [] } as ExternalConfigComplete;
        }
    };

    const [form, setForm] = useState<ToolFormComplete>({
        name: tool.name,
        type: tool.type as ToolType,
        description: tool.description || "",
        enabled: tool.enabled,
        schema: parseSchema(tool.schema),
        config: parseConfig(tool.config),
    });

    const handleTypeChange = (type: ToolType) => {
        setForm({
            ...form,
            type,
            config:
                type === "internal"
                    ? ({ action: "create_ticket" } as InternalConfigComplete)
                    : ({ method: "POST", url: "", headers: [] } as ExternalConfigComplete),
        });
    };

    const handleSave = async () => {
        // Validaciones básicas
        if (!form.name.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        setIsSaving(true);

        try {
            const formData = {
                name: form.name,
                type: form.type,
                description: form.description,
                category: form.type === 'internal' ? 'automation' : 'integration',
                schema: JSON.stringify(form.schema),
                config: JSON.stringify(form.config),
                enabled: form.enabled,
            };

            router.put(aiToolsRoutes.update({ ai_tool: tool.id }).url, formData, {
                onSuccess: () => {
                    toast.success("Herramienta actualizada exitosamente");
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(typeof firstError === 'string' ? firstError : "Error al actualizar la herramienta");
                },
                onFinish: () => {
                    setIsSaving(false);
                }
            });

        } catch (error) {
            console.error("Error al actualizar tool:", error);
            toast.error("Error al actualizar la herramienta");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        console.log("Tool prop changed:", tool);
        console.log("Form state:", form);
    }, [form, tool]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="font-heading text-3xl font-bold text-foreground">Editar herramienta de IA</h1>
                    <p className="text-muted-foreground">
                        Actualiza la configuración de la herramienta "{tool.name}"
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>

            {/* Información General */}
            <Card>
                <CardHeader>
                    <CardTitle>Información General</CardTitle>
                    <CardDescription>Actualiza los datos básicos de la herramienta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la herramienta</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Crear Ticket"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={form.type} onValueChange={handleTypeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="internal">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Interna</Badge>
                                            <span>Función del sistema</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="external">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Externa</Badge>
                                            <span>API externa</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe qué hace esta herramienta..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="enabled"
                            checked={form.enabled}
                            onCheckedChange={(enabled) => setForm({ ...form, enabled })}
                        />
                        <Label htmlFor="enabled">Herramienta habilitada</Label>
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
                    onClick={() => router.visit(aiToolsRoutes.show({ ai_tool: tool.id }).url)}
                >
                    Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>
        </div>
    );
}