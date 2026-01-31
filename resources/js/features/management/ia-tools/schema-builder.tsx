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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { FieldType, SchemaBuilderStateComplete, SchemaFieldComplete } from "@/types/tool"
import { Code2, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface SchemaBuilderProps {
    value: SchemaBuilderStateComplete
    onChange: (schema: SchemaBuilderStateComplete) => void
}

const FIELD_TYPES: FieldType[] = ["string", "number", "boolean", "object", "array"]

export function SchemaBuilder({ value, onChange }: SchemaBuilderProps) {
    const [showPreview, setShowPreview] = useState(false)

    const addInput = () => {
        onChange({
            ...value,
            inputs: [...value.inputs, { name: "", type: "string", required: false, description: "" }],
        })
    }

    const removeInput = (index: number) => {
        onChange({
            ...value,
            inputs: value.inputs.filter((_: SchemaFieldComplete, i: number) => i !== index),
        })
    }

    const updateInput = (index: number, field: Partial<SchemaFieldComplete>) => {
        onChange({
            ...value,
            inputs: value.inputs.map((input: SchemaFieldComplete, i: number) => (i === index ? { ...input, ...field } : input)),
        })
    }

    const addOutput = () => {
        onChange({
            ...value,
            outputs: [...value.outputs, { name: "", type: "string", required: false, description: "" }],
        })
    }

    const removeOutput = (index: number) => {
        onChange({
            ...value,
            outputs: value.outputs.filter((_: SchemaFieldComplete, i: number) => i !== index),
        })
    }

    const updateOutput = (index: number, field: Partial<SchemaFieldComplete>) => {
        onChange({
            ...value,
            outputs: value.outputs.map((output: SchemaFieldComplete, i: number) => (i === index ? { ...output, ...field } : output)),
        })
    }

    const buildSchemaJSON = () => {
        // TODO: Este JSON se enviará al backend como schema
        return {
            inputs: value.inputs.map((input: SchemaFieldComplete) => ({
                name: input.name,
                type: input.type,
                required: input.required,
                description: input.description,
            })),
            outputs: value.outputs.map((output: SchemaFieldComplete) => ({
                name: output.name,
                type: output.type,
                description: output.description,
            })),
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Schema (Contrato IA)</CardTitle>
                            <CardDescription>Define los inputs y outputs esperados por la herramienta</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                            <Code2 className="mr-2 h-4 w-4" />
                            {showPreview ? "Ocultar" : "Ver"} JSON
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Inputs Esperados</Label>
                            <Button onClick={addInput} size="sm" variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Campo
                            </Button>
                        </div>

                        {value.inputs.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="w-24">Requerido</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead className="w-20"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {value.inputs.map((input: SchemaFieldComplete, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Nombre del campo"
                                                        value={input.name}
                                                        onChange={(e) => updateInput(index, { name: e.target.value })}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select value={input.type} onValueChange={(type) => updateInput(index, { type: type as FieldType })}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {FIELD_TYPES.map((type) => (
                                                                <SelectItem key={type} value={type}>
                                                                    {type}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Switch checked={input.required} onCheckedChange={(checked) => updateInput(index, { required: checked })} />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Descripción"
                                                        value={input.description}
                                                        onChange={(e) => updateInput(index, { description: e.target.value })}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removeInput(index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                                No hay inputs definidos. Haz clic en "Agregar Campo" para comenzar.
                            </div>
                        )}
                    </div>

                    {/* Outputs */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Outputs Esperados</Label>
                            <Button onClick={addOutput} size="sm" variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Campo
                            </Button>
                        </div>

                        {value.outputs.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead className="w-20"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {value.outputs.map((output: SchemaFieldComplete, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Nombre del campo"
                                                        value={output.name}
                                                        onChange={(e) => updateOutput(index, { name: e.target.value })}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select value={output.type} onValueChange={(type) => updateOutput(index, { type: type as FieldType })}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {FIELD_TYPES.map((type) => (
                                                                <SelectItem key={type} value={type}>
                                                                    {type}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Descripción"
                                                        value={output.description}
                                                        onChange={(e) => updateOutput(index, { description: e.target.value })}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removeOutput(index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                                No hay outputs definidos. Haz clic en "Agregar Campo" para comenzar.
                            </div>
                        )}
                    </div>

                    {/* Preview JSON */}
                    {showPreview && (
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Preview JSON (Solo lectura)</Label>
                            <Textarea
                                value={JSON.stringify(buildSchemaJSON(), null, 2)}
                                readOnly
                                rows={12}
                                className="font-mono text-xs"
                            />
                            <p className="text-xs text-muted-foreground">
                                Este JSON representa exactamente lo que se guardará en el campo <code>schema</code>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
