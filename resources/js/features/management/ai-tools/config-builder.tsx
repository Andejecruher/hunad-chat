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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
    ExternalConfigComplete,
    HttpHeaderComplete,
    HttpMethod,
    InternalAction,
    InternalConfigComplete,
    ToolType,
} from "@/types/tool"
import { Code2, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface ConfigBuilderProps {
    type: ToolType
    value: InternalConfigComplete | ExternalConfigComplete
    onChange: (config: InternalConfigComplete | ExternalConfigComplete) => void
}

//const INTERNAL_ACTIONS: InternalAction[] = ["create_ticket", "transfer_department", "send_message"]
const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"]

export function ConfigBuilder({ type, value, onChange }: ConfigBuilderProps) {
    const [showPreview, setShowPreview] = useState(false)

    const buildConfigJSON = () => {
        // TODO: Este JSON se enviará al backend como config
        return value
    }

    if (type === "internal") {
        const internalConfig = value as InternalConfigComplete

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Config (Configuración Interna)</CardTitle>
                            <CardDescription>Define cómo se ejecuta la acción interna en el sistema</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                            <Code2 className="mr-2 h-4 w-4" />
                            {showPreview ? "Ocultar" : "Ver"} JSON
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label>Acción Interna</Label>
                            <Select
                                value={internalConfig.action}
                                onValueChange={(action) => onChange({ ...internalConfig, action: action as InternalAction })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="create_ticket">Create Ticket</SelectItem>
                                    <SelectItem value="transfer_department">Transfer Department</SelectItem>
                                    <SelectItem value="send_message">Send Message</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Departamento (opcional)</Label>
                            <Input
                                placeholder="ventas, soporte, etc."
                                value={internalConfig.department || ""}
                                onChange={(e) => onChange({ ...internalConfig, department: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Prioridad (opcional)</Label>
                            <Select
                                value={internalConfig.priority || ""}
                                onValueChange={(priority) =>
                                    onChange({ ...internalConfig, priority: priority as "low" | "medium" | "high" })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar prioridad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baja</SelectItem>
                                    <SelectItem value="medium">Media</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tags (opcional)</Label>
                            <Input
                                placeholder="tag1, tag2, tag3"
                                value={internalConfig.tags?.join(", ") || ""}
                                onChange={(e) =>
                                    onChange({
                                        ...internalConfig,
                                        tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                                    })
                                }
                            />
                            <p className="text-xs text-muted-foreground">Separar con comas</p>
                        </div>
                    </div>

                    {showPreview && (
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Preview JSON (Solo lectura)</Label>
                            <Textarea
                                value={JSON.stringify(buildConfigJSON(), null, 2)}
                                readOnly
                                rows={8}
                                className="font-mono text-xs"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    // External Tool Config
    const externalConfig = value as ExternalConfigComplete
    const headers = externalConfig.headers || []

    const addHeader = () => {
        onChange({
            ...externalConfig,
            headers: [...headers, { key: "", value: "" }],
        })
    }

    const removeHeader = (index: number) => {
        onChange({
            ...externalConfig,
            headers: headers.filter((_, i) => i !== index),
        })
    }

    const updateHeader = (index: number, field: Partial<HttpHeaderComplete>) => {
        onChange({
            ...externalConfig,
            headers: headers.map((header, i) => (i === index ? { ...header, ...field } : header)),
        })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Config (Configuración HTTP)</CardTitle>
                        <CardDescription>Define cómo se llama al endpoint externo</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                        <Code2 className="mr-2 h-4 w-4" />
                        {showPreview ? "Ocultar" : "Ver"} JSON
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Método HTTP</Label>
                        <Select
                            value={externalConfig.method}
                            onValueChange={(method) => onChange({ ...externalConfig, method: method as HttpMethod })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {HTTP_METHODS.map((method) => (
                                    <SelectItem key={method} value={method}>
                                        {method}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                            placeholder="https://api.example.com/endpoint"
                            value={externalConfig.url}
                            onChange={(e) => onChange({ ...externalConfig, url: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Timeout (ms)</Label>
                        <Input
                            type="number"
                            placeholder="5000"
                            value={externalConfig.timeout || ""}
                            onChange={(e) => onChange({ ...externalConfig, timeout: Number(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Reintentos</Label>
                        <Input
                            type="number"
                            placeholder="3"
                            value={externalConfig.retries || ""}
                            onChange={(e) => onChange({ ...externalConfig, retries: Number(e.target.value) })}
                        />
                    </div>
                </div>

                {/* Headers */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Headers</Label>
                        <Button onClick={addHeader} size="sm" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Header
                        </Button>
                    </div>

                    {headers.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead className="w-20"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {headers.map((header: { key: string | number | readonly string[] | undefined; value: string | number | readonly string[] | undefined }, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    placeholder="Authorization"
                                                    value={header.key}
                                                    onChange={(e) => updateHeader(index, { key: e.target.value })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Bearer {{secret.api_key}}"
                                                    value={header.value}
                                                    onChange={(e) => updateHeader(index, { value: e.target.value })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => removeHeader(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No hay headers configurados. Usa el botón de arriba para agregar.
                            <br />
                            Puedes usar variables como <code className="text-xs">{'{{secret.api_key}}'}</code>
                        </div>
                    )}
                </div>

                {showPreview && (
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Preview JSON (Solo lectura)</Label>
                        <Textarea
                            value={JSON.stringify(buildConfigJSON(), null, 2)}
                            readOnly
                            rows={12}
                            className="font-mono text-xs"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
