import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { SchemaFieldComplete } from "@/types/tool"
import { CheckCircle2, Loader2, PlayCircle, XCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface TestToolDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    toolName: string
    inputs: SchemaFieldComplete[]
    outputs: SchemaFieldComplete[]
}

type TestStatus = "idle" | "running" | "success" | "error"

export function TestToolDialog({ open, onOpenChange, toolName, inputs, outputs }: TestToolDialogProps) {
    const [inputJson, setInputJson] = useState(
        JSON.stringify(
            inputs.reduce(
                (acc, field) => {
                    acc[field.name] = field.type === "string" ? "" : field.type === "number" ? 0 : field.type === "boolean" ? false : field.type === "array" ? [] : {}
                    return acc
                },
                {} as Record<string, unknown>,
            ),
            null,
            2,
        ),
    )
    const [outputJson, setOutputJson] = useState("")
    const [testStatus, setTestStatus] = useState<TestStatus>("idle")
    const [executionTime, setExecutionTime] = useState(0)

    const handleTest = async () => {
        setTestStatus("running")
        setOutputJson("")
        const startTime = Date.now()

        try {
            // Validar JSON de entrada
            JSON.parse(inputJson)

            // Simular ejecución de herramienta
            await new Promise((resolve) => setTimeout(resolve, 2000))

            // Generar respuesta mock basada en el schema de outputs
            const mockOutput = outputs.reduce(
                (acc, field) => {
                    acc[field.name] =
                        field.type === "string"
                            ? "Resultado de prueba"
                            : field.type === "number"
                                ? 42
                                : field.type === "boolean"
                                    ? true
                                    : field.type === "array"
                                        ? ["item1", "item2"]
                                        : { key: "value" }
                    return acc
                },
                {} as Record<string, unknown>,
            )

            setOutputJson(JSON.stringify(mockOutput, null, 2))
            setTestStatus("success")
            setExecutionTime(Date.now() - startTime)
            toast.success("Prueba exitosa", {
                description: `La herramienta respondió en ${Date.now() - startTime}ms`,
            })
        } catch (error) {
            setTestStatus("error")
            setOutputJson(JSON.stringify({ error: "Error al ejecutar la herramienta", details: String(error) }, null, 2))
            toast.error("Error en la prueba", {
                description: "Verifica el formato JSON de entrada",
            })
        }
    }

    const getStatusBadge = () => {
        switch (testStatus) {
            case "running":
                return (
                    <Badge className="bg-blue-500">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Ejecutando
                    </Badge>
                )
            case "success":
                return (
                    <Badge className="bg-brand-green">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Exitoso ({executionTime}ms)
                    </Badge>
                )
            case "error":
                return (
                    <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Error
                    </Badge>
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>Probar Herramienta</DialogTitle>
                            <DialogDescription>Ejecuta una prueba de {toolName}</DialogDescription>
                        </div>
                        {getStatusBadge()}
                    </div>
                </DialogHeader>

                <div className="grid gap-6 py-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="input">Entrada (JSON)</Label>
                        <Textarea
                            id="input"
                            value={inputJson}
                            onChange={(e) => setInputJson(e.target.value)}
                            placeholder='{"campo": "valor"}'
                            className="font-mono text-sm"
                            rows={12}
                        />
                        <div className="text-xs text-muted-foreground">
                            <p className="font-semibold mb-1">Campos requeridos:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                {inputs
                                    .filter((f) => f.required)
                                    .map((field) => (
                                        <li key={field.name}>
                                            {field.name} ({field.type})
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="output">Salida (JSON)</Label>
                        <Textarea
                            id="output"
                            value={outputJson}
                            readOnly
                            placeholder="La respuesta aparecerá aquí..."
                            className="font-mono text-sm bg-muted"
                            rows={12}
                        />
                        <div className="text-xs text-muted-foreground">
                            <p className="font-semibold mb-1">Campos esperados:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                {outputs.map((field) => (
                                    <li key={field.name}>
                                        {field.name} ({field.type})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                    <Button onClick={handleTest} disabled={testStatus === "running"}>
                        {testStatus === "running" ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Ejecutando...
                            </>
                        ) : (
                            <>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Ejecutar Prueba
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
