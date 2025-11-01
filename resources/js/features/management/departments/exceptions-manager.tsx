import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { DepartmentException } from "@/types/department"
import { Calendar, Plus, Trash2, Edit, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ExceptionsManagerProps {
    initialExceptions?: DepartmentException[]
    onSave: (exceptions: DepartmentException[]) => void
}

export function ExceptionsManager({ initialExceptions = [], onSave }: ExceptionsManagerProps) {
    const [exceptions, setExceptions] = useState<DepartmentException[]>(initialExceptions)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingException, setEditingException] = useState<DepartmentException | null>(null)

    const handleAddException = (exception: DepartmentException) => {
        if (editingException) {
            setExceptions((prev) => prev.map((e) => (e.id === editingException.id ? exception : e)))
        } else {
            setExceptions((prev) => [...prev, exception])
        }
        onSave(exceptions)
        setIsDialogOpen(false)
        setEditingException(null)
    }

    const handleDeleteException = (id: number) => {
        setExceptions((prev) => prev.filter((e) => e.id !== id))
        onSave(exceptions.filter((e) => e.id !== id))
    }

    const handleEditException = (exception: DepartmentException) => {
        setEditingException(exception)
        setIsDialogOpen(true)
    }

    const getExceptionTypeLabel = (type: string) => {
        switch (type) {
            case "annual":
                return "Anual"
            case "monthly":
                return "Mensual"
            case "specific":
                return "Específico"
            default:
                return type
        }
    }

    const getBehaviorBadge = (behavior: string) => {
        switch (behavior) {
            case "fully_closed":
                return <Badge className="bg-red-500">🟥 Completamente Cerrado</Badge>
            case "partially_closed":
                return <Badge className="bg-yellow-500">🟨 Parcialmente Cerrado</Badge>
            case "partially_open":
                return <Badge className="bg-green-500">🟩 Parcialmente Abierto</Badge>
            default:
                return <Badge variant="secondary">Sin definir</Badge>
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-brand-gold" />
                        <CardTitle>Excepciones de Horario</CardTitle>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Excepción
                    </Button>
                </div>
                <CardDescription>Configura días festivos, horarios especiales y excepciones al horario regular</CardDescription>
            </CardHeader>
            <CardContent>
                {exceptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 font-semibold">No hay excepciones configuradas</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Agrega excepciones para días festivos o horarios especiales
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Primera Excepción
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Fecha/Patrón</TableHead>
                                <TableHead>Comportamiento</TableHead>
                                <TableHead>Horarios</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exceptions.map((exception) => (
                                <TableRow key={exception.id}>
                                    <TableCell className="font-medium">{exception.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{getExceptionTypeLabel(exception.type)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {exception.type === "specific"
                                            ? new Date(exception.start_date).toLocaleDateString()
                                            : exception.recurrence_pattern}
                                    </TableCell>
                                    <TableCell>{getBehaviorBadge(exception.behavior)}</TableCell>
                                    <TableCell>
                                        {exception.behavior === "fully_closed" && (
                                            <span className="text-sm text-muted-foreground">Cerrado</span>
                                        )}
                                        {exception.behavior === "partially_closed" && (
                                            <span className="text-sm">
                        {exception.special_open_time} - {exception.special_close_time}
                      </span>
                                        )}
                                        {exception.behavior === "partially_open" && exception.partial_hours && (
                                            <div className="space-y-1">
                                                {exception.partial_hours.map((hour, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        {hour.open_time} - {hour.close_time}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditException(exception)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteException(exception.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <ExceptionFormDialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (!open) setEditingException(null)
                    }}
                    exception={editingException}
                    onSave={handleAddException}
                />
            </CardContent>
        </Card>
    )
}

function ExceptionFormDialog({
                                 open,
                                 onOpenChange,
                                 exception,
                                 onSave,
                             }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    exception: DepartmentException | null
    onSave: (exception: DepartmentException) => void
}) {
    const [formData, setFormData] = useState<Partial<DepartmentException>>({
        name: exception?.name || "",
        type: exception?.type || "specific",
        start_date: exception?.start_date || "",
        end_date: exception?.end_date || "",
        recurrence_pattern: exception?.recurrence_pattern || "",
        behavior: exception?.behavior || "fully_closed",
        special_open_time: exception?.special_open_time || "09:00",
        special_close_time: exception?.special_close_time || "18:00",
        partial_hours: exception?.partial_hours || [],
        monthly_recurrence: exception?.monthly_recurrence || { type: "specific_day", day_of_month: 1 },
    })

    const [monthlyType, setMonthlyType] = useState<"specific_day" | "pattern">(
        exception?.monthly_recurrence?.type || "specific_day",
    )

    const [errors, setErrors] = useState<string[]>([])

    const addPartialHour = () => {
        if ((formData.partial_hours?.length || 0) >= 3) {
            setErrors(["Máximo 3 rangos de horario permitidos"])
            return
        }
        setFormData({
            ...formData,
            partial_hours: [...(formData.partial_hours || []), { open_time: "09:00", close_time: "18:00" }],
        })
        setErrors([])
    }

    const removePartialHour = (index: number) => {
        setFormData({
            ...formData,
            partial_hours: formData.partial_hours?.filter((_, i) => i !== index),
        })
    }

    const updatePartialHour = (index: number, field: "open_time" | "close_time", value: string) => {
        const updated = [...(formData.partial_hours || [])]
        updated[index] = { ...updated[index], [field]: value }
        setFormData({ ...formData, partial_hours: updated })
    }

    const validatePartialHours = (): boolean => {
        if (!formData.partial_hours || formData.partial_hours.length === 0) return true

        const newErrors: string[] = []

        formData.partial_hours.forEach((hour, idx) => {
            if (hour.open_time >= hour.close_time) {
                newErrors.push(`Rango ${idx + 1}: La hora de apertura debe ser antes del cierre`)
            }
        })

        for (let i = 0; i < formData.partial_hours.length; i++) {
            for (let j = i + 1; j < formData.partial_hours.length; j++) {
                const hour1 = formData.partial_hours[i]
                const hour2 = formData.partial_hours[j]

                if (
                    (hour1.open_time <= hour2.open_time && hour2.open_time < hour1.close_time) ||
                    (hour2.open_time <= hour1.open_time && hour1.open_time < hour2.close_time)
                ) {
                    newErrors.push(`Los rangos ${i + 1} y ${j + 1} se solapan`)
                }
            }
        }

        setErrors(newErrors)
        return newErrors.length === 0
    }

    const handleSubmit = () => {
        if (!formData.name) {
            setErrors(["El nombre es requerido"])
            return
        }

        if (formData.behavior === "partially_open") {
            if (!formData.partial_hours || formData.partial_hours.length === 0) {
                setErrors(["Debes agregar al menos un rango de horario"])
                return
            }
            if (!validatePartialHours()) return
        }

        let recurrencePattern = formData.recurrence_pattern || ""
        if (formData.type === "monthly" && formData.monthly_recurrence) {
            if (formData.monthly_recurrence.type === "specific_day") {
                recurrencePattern = `day-${formData.monthly_recurrence.day_of_month}`
            } else if (formData.monthly_recurrence.type === "pattern") {
                const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
                recurrencePattern = `${formData.monthly_recurrence.week_pattern}-${dayNames[formData.monthly_recurrence.day_of_week || 0]}`
            }
        }

        const newException: DepartmentException = {
            id: exception?.id || Number(new Date().getTime()),
            name: formData.name,
            type: formData.type as "annual" | "monthly" | "specific",
            start_date: formData.start_date || "",
            end_date: formData.end_date,
            recurrence_pattern: recurrencePattern,
            behavior: formData.behavior as "fully_closed" | "partially_closed" | "partially_open",
            special_open_time: formData.behavior === "partially_closed" ? formData.special_open_time : undefined,
            special_close_time: formData.behavior === "partially_closed" ? formData.special_close_time : undefined,
            partial_hours: formData.behavior === "partially_open" ? formData.partial_hours : undefined,
            monthly_recurrence: formData.type === "monthly" ? formData.monthly_recurrence : undefined,
        }

        onSave(newException)
        setErrors([])
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{exception ? "Editar Excepción" : "Nueva Excepción de Horario"}</DialogTitle>
                    <DialogDescription>Configura una excepción al horario regular de atención</DialogDescription>
                </DialogHeader>

                {errors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <ul className="list-disc list-inside">
                                {errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="exception-name">Nombre de la Excepción *</Label>
                        <Input
                            id="exception-name"
                            placeholder="Ej: Navidad, Black Friday, Mantenimiento"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Excepción *</Label>
                        <RadioGroup
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value as "annual" | "monthly" | "specific" })}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific" id="specific" />
                                <Label htmlFor="specific" className="font-normal">
                                    Fecha Específica (una sola vez)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="annual" id="annual" />
                                <Label htmlFor="annual" className="font-normal">
                                    Anual (se repite cada año)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <Label htmlFor="monthly" className="font-normal">
                                    Mensual (patrón recurrente)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {formData.type === "specific" && (
                        <div className="space-y-2">
                            <Label htmlFor="start-date">Fecha *</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                    )}

                    {formData.type === "annual" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="month">Mes</Label>
                                <Select
                                    value={formData.recurrence_pattern?.split("-")[0] || ""}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            recurrence_pattern: `${value}-${formData.recurrence_pattern?.split("-")[1] || "01"}`,
                                        })
                                    }
                                >
                                    <SelectTrigger id="month">
                                        <SelectValue placeholder="Selecciona mes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            "Enero",
                                            "Febrero",
                                            "Marzo",
                                            "Abril",
                                            "Mayo",
                                            "Junio",
                                            "Julio",
                                            "Agosto",
                                            "Septiembre",
                                            "Octubre",
                                            "Noviembre",
                                            "Diciembre",
                                        ].map((month, index) => (
                                            <SelectItem key={month} value={String(index + 1).padStart(2, "0")}>
                                                {month}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="day">Día</Label>
                                <Input
                                    id="day"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={formData.recurrence_pattern?.split("-")[1] || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            recurrence_pattern: `${formData.recurrence_pattern?.split("-")[0] || "01"}-${e.target.value.padStart(2, "0")}`,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {formData.type === "monthly" && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <Label>Configuración Mensual</Label>
                            <RadioGroup
                                value={monthlyType}
                                onValueChange={(value) => {
                                    setMonthlyType(value as "specific_day" | "pattern")
                                    setFormData({
                                        ...formData,
                                        monthly_recurrence: {
                                            type: value as "specific_day" | "pattern",
                                            day_of_month: value === "specific_day" ? 1 : undefined,
                                            week_pattern: value === "pattern" ? "first" : undefined,
                                            day_of_week: value === "pattern" ? 1 : undefined,
                                        },
                                    })
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="specific_day" id="specific_day" />
                                    <Label htmlFor="specific_day" className="font-normal">
                                        Día específico del mes
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pattern" id="pattern" />
                                    <Label htmlFor="pattern" className="font-normal">
                                        Patrón recurrente
                                    </Label>
                                </div>
                            </RadioGroup>

                            {monthlyType === "specific_day" && (
                                <div className="space-y-2">
                                    <Label htmlFor="day-of-month">Día del mes</Label>
                                    <Select
                                        value={String(formData.monthly_recurrence?.day_of_month || 1)}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                monthly_recurrence: {
                                                    ...formData.monthly_recurrence!,
                                                    day_of_month: Number.parseInt(value),
                                                },
                                            })
                                        }
                                    >
                                        <SelectTrigger id="day-of-month">
                                            <SelectValue placeholder="Seleccionar día" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 31 }, (_, i) => (
                                                <SelectItem key={i + 1} value={String(i + 1)}>
                                                    Día {i + 1}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {monthlyType === "pattern" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="week-pattern">Semana</Label>
                                        <Select
                                            value={formData.monthly_recurrence?.week_pattern || "first"}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    monthly_recurrence: {
                                                        ...formData.monthly_recurrence!,
                                                        week_pattern: value as "first" | "second" | "third" | "fourth" | "last",
                                                    },
                                                })
                                            }
                                        >
                                            <SelectTrigger id="week-pattern">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="first">Primer</SelectItem>
                                                <SelectItem value="second">Segundo</SelectItem>
                                                <SelectItem value="third">Tercer</SelectItem>
                                                <SelectItem value="fourth">Cuarto</SelectItem>
                                                <SelectItem value="last">Último</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="day-of-week">Día de la semana</Label>
                                        <Select
                                            value={String(formData.monthly_recurrence?.day_of_week || 1)}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    monthly_recurrence: {
                                                        ...formData.monthly_recurrence!,
                                                        day_of_week: Number.parseInt(value),
                                                    },
                                                })
                                            }
                                        >
                                            <SelectTrigger id="day-of-week">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Domingo</SelectItem>
                                                <SelectItem value="1">Lunes</SelectItem>
                                                <SelectItem value="2">Martes</SelectItem>
                                                <SelectItem value="3">Miércoles</SelectItem>
                                                <SelectItem value="4">Jueves</SelectItem>
                                                <SelectItem value="5">Viernes</SelectItem>
                                                <SelectItem value="6">Sábado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Comportamiento *</Label>
                        <RadioGroup
                            value={formData.behavior}
                            onValueChange={(value) =>
                                setFormData({ ...formData, behavior: value as "fully_closed" | "partially_closed" | "partially_open" })
                            }
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fully_closed" id="fully_closed" />
                                <Label htmlFor="fully_closed" className="font-normal">
                                    🟥 Completamente Cerrado
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="partially_closed" id="partially_closed" />
                                <Label htmlFor="partially_closed" className="font-normal">
                                    🟨 Parcialmente Cerrado (horario reducido)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="partially_open" id="partially_open" />
                                <Label htmlFor="partially_open" className="font-normal">
                                    🟩 Parcialmente Abierto (múltiples rangos)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {formData.behavior === "partially_closed" && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <Label>Horario Especial</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="special-open">Hora de Apertura</Label>
                                    <Input
                                        id="special-open"
                                        type="time"
                                        value={formData.special_open_time}
                                        onChange={(e) => setFormData({ ...formData, special_open_time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="special-close">Hora de Cierre</Label>
                                    <Input
                                        id="special-close"
                                        type="time"
                                        value={formData.special_close_time}
                                        onChange={(e) => setFormData({ ...formData, special_close_time: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.behavior === "partially_open" && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <Label>Horarios Parciales (máximo 3)</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addPartialHour}
                                    disabled={(formData.partial_hours?.length || 0) >= 3}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar Horario
                                </Button>
                            </div>
                            {formData.partial_hours && formData.partial_hours.length > 0 ? (
                                <div className="space-y-3">
                                    {formData.partial_hours.map((hour, index) => (
                                        <div key={index} className="flex items-end gap-2 rounded-lg border p-3">
                                            <div className="flex-1 space-y-2">
                                                <Label htmlFor={`open-${index}`}>Apertura {index + 1}</Label>
                                                <Input
                                                    id={`open-${index}`}
                                                    type="time"
                                                    value={hour.open_time}
                                                    onChange={(e) => updatePartialHour(index, "open_time", e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Label htmlFor={`close-${index}`}>Cierre {index + 1}</Label>
                                                <Input
                                                    id={`close-${index}`}
                                                    type="time"
                                                    value={hour.close_time}
                                                    onChange={(e) => updatePartialHour(index, "close_time", e.target.value)}
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removePartialHour(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay horarios configurados. Agrega al menos uno.</p>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.name}>
                        {exception ? "Guardar Cambios" : "Crear Excepción"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
