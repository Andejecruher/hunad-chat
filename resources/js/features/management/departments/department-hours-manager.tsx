import {useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { type DepartmentHours, DAYS_OF_WEEK } from "@/types/department"
import { Clock, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface DepartmentHoursManagerProps {
    departmentId: number
    initialHours?: DepartmentHours[]
    onSave: (hours: DepartmentHours[]) => void
}

export function DepartmentHoursManager({ departmentId, initialHours, onSave }: DepartmentHoursManagerProps) {

    const [hours, setHours] = useState<DepartmentHours[]>(() => {
        if (initialHours && initialHours.length > 0) {
            return initialHours
        }

        return DAYS_OF_WEEK.map((day) => ({
            day_of_week: day.value,
            time_ranges: [
                {
                    id: crypto.randomUUID(),
                    open_time: "09:00",
                    close_time: "18:00",
                },
            ],
            is_closed: day.value === 0 || day.value === 6,
        }))
    })

    const [hasChanges, setHasChanges] = useState(false)

    const addTimeRange = (dayOfWeek: number) => {
        setHours((prev) =>
            prev.map((h) => {
                if (h.day_of_week === dayOfWeek) {
                    const lastRange = h.time_ranges[h.time_ranges.length - 1]
                    return {
                        ...h,
                        time_ranges: [
                            ...h.time_ranges,
                            {
                                id: crypto.randomUUID(),
                                open_time: lastRange?.close_time || "09:00",
                                close_time: "18:00",
                            },
                        ],
                    }
                }
                return h
            }),
        )
        setHasChanges(true)
    }

    const removeTimeRange = (dayOfWeek: number, rangeId: string) => {
        setHours((prev) =>
            prev.map((h) => {
                if (h.day_of_week === dayOfWeek) {
                    return {
                        ...h,
                        time_ranges: h.time_ranges.filter((r) => r.id !== rangeId),
                    }
                }
                return h
            }),
        )
        setHasChanges(true)
    }

    const updateTimeRange = (dayOfWeek: number, rangeId: string, field: "open_time" | "close_time", value: string) => {
        setHours((prev) =>
            prev.map((h) => {
                if (h.day_of_week === dayOfWeek) {
                    return {
                        ...h,
                        time_ranges: h.time_ranges.map((r) => (r.id === rangeId ? { ...r, [field]: value } : r)),
                    }
                }
                return h
            }),
        )
        setHasChanges(true)
    }

    const hasOverlap = (dayOfWeek: number): boolean => {
        const hour = hours.find((h) => h.day_of_week === dayOfWeek)
        if (!hour || hour.is_closed || hour.time_ranges.length < 2) return false

        const ranges = hour.time_ranges.sort((a, b) => a.open_time.localeCompare(b.open_time))

        for (let i = 0; i < ranges.length - 1; i++) {
            if (ranges[i].close_time > ranges[i + 1].open_time) {
                return true
            }
        }
        return false
    }

    const validateTime = (dayOfWeek: number): boolean => {
        const hour = hours.find((h) => h.day_of_week === dayOfWeek)
        if (!hour || hour.is_closed) return true

        // Validar que cada rango tenga hora de cierre posterior a apertura
        const allRangesValid = hour.time_ranges.every((r) => r.close_time > r.open_time)

        // Validar que no haya solapamientos
        const noOverlap = !hasOverlap(dayOfWeek)

        return allRangesValid && noOverlap
    }

    const toggleDayClosed = (dayOfWeek: number, isClosed: boolean) => {
        setHours((prev) =>
            prev.map((h) => {
                if (h.day_of_week === dayOfWeek) {
                    // Si se está abriendo el día y no hay rangos, agregar uno por defecto
                    if (!isClosed && h.time_ranges.length === 0) {
                        return {
                            ...h,
                            is_closed: isClosed,
                            time_ranges: [
                                {
                                    id: crypto.randomUUID(),
                                    open_time: "09:00",
                                    close_time: "18:00",
                                },
                            ],
                        }
                    }
                    return { ...h, is_closed: isClosed }
                }
                return h
            }),
        )
        setHasChanges(true)
    }

    const handleSave = () => {
        const allValid = hours.every((h) => validateTime(h.day_of_week))
        if (!allValid) {
            alert(
                "Por favor corrige los horarios inválidos:\n- La hora de cierre debe ser posterior a la de apertura\n- Los rangos de horario no deben solaparse",
            )
            return
        }

        const allOpenDaysHaveRanges = hours.every((h) => h.is_closed || h.time_ranges.length > 0)
        if (!allOpenDaysHaveRanges) {
            alert("Los días abiertos deben tener al menos un rango de horario configurado")
            return
        }

        onSave(hours)
        setHasChanges(false)
    }

    useEffect(()=>{
        console.log(departmentId)
    },[departmentId])

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-green" />
                    <CardTitle>Horario Regular de Atención</CardTitle>
                </div>
                <CardDescription>
                    Configura los horarios de atención para cada día de la semana. Puedes agregar múltiples rangos de horario por
                    día.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {DAYS_OF_WEEK.map((day) => {
                        const dayHour = hours.find((h) => h.day_of_week === day.value)
                        const isValid = validateTime(day.value)
                        const overlap = hasOverlap(day.value)
                        const canBeOpen = dayHour ? dayHour.time_ranges.length > 0 : false

                        if (!dayHour) return null

                        return (
                            <div
                                key={day.value}
                                className={`rounded-lg border p-4 ${!isValid ? "border-destructive bg-destructive/5" : ""}`}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-28">
                                        <Label className="font-medium">{day.label}</Label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={!dayHour.is_closed}
                                            onCheckedChange={(checked) => toggleDayClosed(day.value, !checked)}
                                            disabled={!canBeOpen && !dayHour.is_closed}
                                        />
                                        <span className="text-sm text-muted-foreground">{dayHour.is_closed ? "Cerrado" : "Abierto"}</span>
                                    </div>

                                    {!dayHour.is_closed && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addTimeRange(day.value)}
                                            disabled={dayHour.time_ranges.length >= 3}
                                            className="ml-auto"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Agregar Horario
                                        </Button>
                                    )}
                                </div>

                                {!dayHour.is_closed && (
                                    <div className="space-y-2 pl-32">
                                        {dayHour.time_ranges &&
                                            dayHour.time_ranges.map((range, index) => (
                                                <div key={range.id} className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground w-16">Rango {index + 1}:</span>

                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor={`open-${day.value}-${range.id}`} className="text-sm">
                                                            Apertura:
                                                        </Label>
                                                        <Input
                                                            id={`open-${day.value}-${range.id}`}
                                                            type="time"
                                                            value={range.open_time}
                                                            onChange={(e) => updateTimeRange(day.value, range.id, "open_time", e.target.value)}
                                                            className="w-32"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor={`close-${day.value}-${range.id}`} className="text-sm">
                                                            Cierre:
                                                        </Label>
                                                        <Input
                                                            id={`close-${day.value}-${range.id}`}
                                                            type="time"
                                                            value={range.close_time}
                                                            onChange={(e) => updateTimeRange(day.value, range.id, "close_time", e.target.value)}
                                                            className="w-32"
                                                        />
                                                    </div>

                                                    {dayHour.time_ranges.length > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeTimeRange(day.value, range.id)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}

                                        {overlap && (
                                            <Alert variant="destructive" className="mt-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>Los rangos de horario se solapan. Por favor ajústalos.</AlertDescription>
                                            </Alert>
                                        )}

                                        {!isValid && !overlap && (
                                            <Alert variant="destructive" className="mt-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    La hora de cierre debe ser posterior a la hora de apertura en todos los rangos.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                )}

                                {dayHour.is_closed && dayHour.time_ranges.length === 0 && (
                                    <div className="pl-32">
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Agrega al menos un rango de horario para poder activar este día.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setHours(
                                initialHours && initialHours.length > 0
                                    ? initialHours
                                    : DAYS_OF_WEEK.map((day) => ({
                                        day_of_week: day.value,
                                        time_ranges: [
                                            {
                                                id: crypto.randomUUID(),
                                                open_time: "09:00",
                                                close_time: "18:00",
                                            },
                                        ],
                                        is_closed: day.value === 0 || day.value === 6,
                                    })),
                            )
                            setHasChanges(false)
                        }}
                        disabled={!hasChanges}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!hasChanges}>
                        Guardar Horarios
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
