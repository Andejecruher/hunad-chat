import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { type DepartmentHours, DAYS_OF_WEEK } from "@/types/department"
import { Clock } from "lucide-react"

interface DepartmentHoursManagerProps {
    departmentId: number
    initialHours?: DepartmentHours[]
    onSave: (hours: DepartmentHours[]) => void
}

export function DepartmentHoursManager({ departmentId, initialHours, onSave }: DepartmentHoursManagerProps) {
    const [hours, setHours] = useState<DepartmentHours[]>(
        initialHours ||
        DAYS_OF_WEEK.map((day) => ({
            day_of_week: day.value,
            open_time: "09:00",
            close_time: "18:00",
            is_closed: day.value === 0 || day.value === 6, // Cerrado sábados y domingos por defecto
        })),
    )

    const [hasChanges, setHasChanges] = useState(false)

    const updateHour = (dayOfWeek: number, field: keyof DepartmentHours, value: string | boolean) => {
        setHours((prev) => prev.map((h) => (h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h)))
        setHasChanges(true)
    }

    const validateTime = (dayOfWeek: number): boolean => {
        const hour = hours.find((h) => h.day_of_week === dayOfWeek)
        if (!hour || hour.is_closed) return true
        return hour.close_time > hour.open_time
    }

    const handleSave = () => {
        const allValid = hours.every((h) => validateTime(h.day_of_week))
        if (!allValid) {
            alert("Por favor corrige los horarios inválidos (la hora de cierre debe ser posterior a la de apertura)")
            return
        }
        onSave(hours)
        setHasChanges(false)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-green" />
                    <CardTitle>Horario Regular de Atención</CardTitle>
                </div>
                <CardDescription>Configura los horarios de atención para cada día de la semana</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {DAYS_OF_WEEK.map((day) => {
                        const dayHour = hours.find((h) => h.day_of_week === day.value)
                        const isValid = validateTime(day.value)

                        return (
                            <div
                                key={day.value}
                                className={`flex items-center gap-4 rounded-lg border p-4 ${
                                    !isValid ? "border-destructive bg-destructive/5" : ""
                                }`}
                            >
                                <div className="w-28">
                                    <Label className="font-medium">{day.label}</Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={!dayHour?.is_closed}
                                        onCheckedChange={(checked) => updateHour(day.value, "is_closed", !checked)}
                                    />
                                    <span className="text-sm text-muted-foreground">{dayHour?.is_closed ? "Cerrado" : "Abierto"}</span>
                                </div>

                                {!dayHour?.is_closed && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`open-${day.value}`} className="text-sm">
                                                Apertura:
                                            </Label>
                                            <Input
                                                id={`open-${day.value}`}
                                                type="time"
                                                value={dayHour?.open_time}
                                                onChange={(e) => updateHour(day.value, "open_time", e.target.value)}
                                                className="w-32"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`close-${day.value}`} className="text-sm">
                                                Cierre:
                                            </Label>
                                            <Input
                                                id={`close-${day.value}`}
                                                type="time"
                                                value={dayHour?.close_time}
                                                onChange={(e) => updateHour(day.value, "close_time", e.target.value)}
                                                className="w-32"
                                            />
                                        </div>

                                        {!isValid && <span className="text-sm text-destructive">Horario inválido</span>}
                                    </>
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
                                initialHours ||
                                DAYS_OF_WEEK.map((day) => ({
                                    day_of_week: day.value,
                                    open_time: "09:00",
                                    close_time: "18:00",
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
