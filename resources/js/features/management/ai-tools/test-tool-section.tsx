import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import aiToolsRoutes from '@/routes/ai-tools'
import type { SchemaFieldComplete } from "@/types/tool"
import { router, usePage } from '@inertiajs/react'
import { CheckCircle2, Loader2, PlayCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface TestToolSectionProps {
    toolId: number
    toolName: string
    inputs: SchemaFieldComplete[]
    outputs: SchemaFieldComplete[]
    enabled: boolean
}

type TestStatus = "idle" | "running" | "success" | "error"

interface ToolExecutionResult {
    status?: string
    execution_time: string
    result?: {
        execution_time?: string | number
        [key: string]: unknown
    }
    [key: string]: unknown
}

interface FlashMessages {
    success?: string
    error?: string
}

interface ValidationErrors {
    error?: string
    [key: string]: unknown
}

interface TestToolPageProps {
    flash?: FlashMessages
    errors?: ValidationErrors
    execution?: ToolExecutionResult
    execution_time?: string | number
    [key: string]: unknown
}

export function TestToolSection({ toolId, toolName, inputs, enabled }: TestToolSectionProps) {
    const { props } = usePage<TestToolPageProps>()

    const [inputJson, setInputJson] = useState(
        JSON.stringify(
            inputs.reduce(
                (acc, field) => {
                    if (field.type === "string") acc[field.name] = ""
                    else if (field.type === "number") acc[field.name] = 0
                    else if (field.type === "boolean") acc[field.name] = false
                    else if (field.type === "array") acc[field.name] = []
                    else acc[field.name] = {}
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
    const [executionTime, setExecutionTime] = useState("")

    // Procesar flash messages y objeto de ejecución del backend
    useEffect(() => {
        const flash = props.flash
        const errors = props.errors
        const execution = props.execution

        if (execution?.status === 'success') {
            setTestStatus('success')
            setExecutionTime(execution.execution_time)
            const output = execution.result ?? execution ?? flash?.success
            setOutputJson(JSON.stringify(output, null, 2))

            toast.success('Prueba exitosa', {
                description: flash?.success ?? 'Ejecución exitosa',
            })
            return
        }

        if (errors?.error) {
            setTestStatus('error')
            setExecutionTime(execution?.execution_time || '')
            const output = execution?.result ?? execution ?? { message: flash?.error }
            setOutputJson(JSON.stringify({
                success: false,
                message: flash?.error ?? 'Error en ejecución',
                output
            }, null, 2))

            toast.error('Error en la prueba', {
                description: errors.error,
            })
            return
        }
    }, [props])

    const handleTest = async () => {
        if (!enabled) {
            toast.error("Error", {
                description: "La herramienta debe estar habilitada para realizar pruebas",
            })
            return
        }

        // Limpiar estados previos
        setOutputJson("")
        setExecutionTime('')

        let payload: Record<string, unknown>

        try {
            payload = JSON.parse(inputJson)
        } catch (error) {
            setTestStatus("error")
            const errorDetails = error instanceof SyntaxError
                ? "El JSON de entrada no es válido. Verifica la sintaxis."
                : String(error)

            setOutputJson(JSON.stringify({ success: false, error: errorDetails }, null, 2))
            toast.error("Error en la prueba", { description: errorDetails })
            return
        }

        setTestStatus('running')

        router.post(aiToolsRoutes.test({ tool: toolId }).url, {
            payload: Object.fromEntries(
                Object.entries(payload).map(([key, value]) => [
                    key,
                    value === null || value === undefined ? '' : String(value)
                ])
            )
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['execution', 'tool', 'flash', 'errors'],
            onStart: () => {
                setTestStatus('running')
            },
            onFinish: () => {
                // Aseguramos que el estado no quede en running.
                setTestStatus((prev) => (prev === 'running' ? 'idle' : prev))
            }
        })
    }

    const resetTest = () => {
        setTestStatus("idle")
        setOutputJson("")
        setExecutionTime('')
    }

    const getStatusBadge = () => {
        switch (testStatus) {
            case "running":
                return (
                    <Badge variant="secondary" className="gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Ejecutando...
                    </Badge>
                )
            case "success":
                return (
                    <Badge variant="outline" className="gap-1 border-green-200 text-green-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Exitoso ({executionTime}ms)
                    </Badge>
                )
            case "error":
                return (
                    <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Error ({executionTime}ms)
                    </Badge>
                )
            default:
                return undefined
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <PlayCircle className="h-5 w-5" />
                        Probar Herramienta
                    </CardTitle>
                    {getStatusBadge()}
                </div>
                <CardDescription>
                    Ejecuta la herramienta "{toolName}" de forma REAL usando los ejecutores del sistema.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="input-json">Payload de Entrada (JSON)</Label>
                            <Textarea
                                id="input-json"
                                value={inputJson}
                                onChange={(e) => setInputJson(e.target.value)}
                                placeholder="Ingresa el JSON con los parámetros de entrada"
                                className="min-h-[200px] font-mono text-sm"
                                disabled={testStatus === "running"}
                            />
                            <p className="mt-2 text-sm text-muted-foreground">
                                Modifica los valores según los campos requeridos por la herramienta.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleTest}
                                disabled={!enabled || testStatus === "running"}
                                className="flex-1"
                            >
                                {testStatus === "running" ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Ejecutando...
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Ejecutar Test
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={resetTest}
                                disabled={testStatus === "running"}
                            >
                                Limpiar
                            </Button>
                        </div>

                        {!enabled && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-sm text-amber-700">
                                    ⚠️ La herramienta debe estar habilitada para realizar pruebas
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="output-json">Resultado de Ejecución</Label>
                            <Textarea
                                id="output-json"
                                value={outputJson}
                                readOnly
                                placeholder="El resultado aparecerá aquí después de ejecutar la herramienta..."
                                className="min-h-[200px] font-mono text-sm"
                            />
                            {outputJson && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Resultado REAL de la ejecución de la herramienta.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
