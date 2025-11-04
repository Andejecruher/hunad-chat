import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DepartmentException, DepartmentHours } from "@/types/department"
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameMonth, startOfMonth, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { AlertCircle, CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { useState } from "react"

const DAYS_OF_WEEK = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
]

interface CalendarPreviewProps {
    hours: DepartmentHours[]
    exceptions: DepartmentException[]
}

export function CalendarPreview({ hours, exceptions }: CalendarPreviewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const safeHours =
        hours.length === 0
            ? DAYS_OF_WEEK.map((day) => ({
                day_of_week: day.value,
                time_ranges: [{ id: "default", open_time: "09:00", close_time: "18:00" }],
                is_closed: day.value === 0 || day.value === 6,
            }))
            : hours

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const getHourForDay = (date: Date): DepartmentHours | null => {
        const dayOfWeek = date.getDay()
        return safeHours.find((h) => h.day_of_week === dayOfWeek) || null
    }

    const hasExceptionForDate = (date: Date): DepartmentException | null => {
        const dateStr = format(date, "yyyy-MM-dd")
        console.log("[v0] Checking date:", dateStr, "against exceptions:", exceptions)

        for (const exc of exceptions) {
            // Check for specific date exceptions
            if (exc.type === "specific" && exc.start_date === dateStr) {
                console.log("[v0] Found specific exception:", exc)
                return exc
            }

            // Check for annual exceptions (match month-day)
            if (exc.type === "annual") {
                const excDatePart = exc.start_date.substring(5) // Get MM-DD from YYYY-MM-DD
                const currentDatePart = dateStr.substring(5)
                if (excDatePart === currentDatePart) {
                    console.log("[v0] Found annual exception:", exc)
                    return exc
                }
            }

            // Check for monthly exceptions
            if (exc.type === "monthly") {
                // Si tiene monthly_recurrence, usar esa información
                const monthlyConfig = exc.monthly_recurrence || exc.recurrence_pattern

                if (monthlyConfig?.type === "specific_day" && monthlyConfig.day_of_month) {
                    // Tipo: día específico del mes (ej: día 15 de cada mes)
                    const currentDay = date.getDate()
                    if (currentDay === monthlyConfig.day_of_month) {
                        console.log("[v0] Found monthly specific day exception:", exc)
                        return exc
                    }
                } else if (monthlyConfig?.type === "pattern" && monthlyConfig.week_pattern && monthlyConfig.day_of_week !== undefined) {
                    // Tipo: patrón (ej: primer lunes de cada mes)
                    const currentDayOfWeek = date.getDay()

                    // Verificar si el día de la semana coincide
                    if (currentDayOfWeek === monthlyConfig.day_of_week) {
                        // Calcular en qué semana del mes estamos
                        const dayOfMonth = date.getDate()
                        const weekOfMonth = Math.ceil(dayOfMonth / 7)

                        const targetWeek = {
                            'first': 1,
                            'second': 2,
                            'third': 3,
                            'fourth': 4,
                            'last': -1
                        }[monthlyConfig.week_pattern]

                        if (targetWeek === weekOfMonth || (targetWeek === -1 && weekOfMonth >= 4)) {
                            console.log("[v0] Found monthly pattern exception:", exc)
                            return exc
                        }
                    }
                } else {
                    // Fallback: usar día de start_date para retrocompatibilidad
                    const excDay = exc.start_date.substring(8, 10) // Get DD from YYYY-MM-DD
                    const currentDay = dateStr.substring(8, 10)
                    if (excDay === currentDay) {
                        console.log("[v0] Found monthly fallback exception:", exc)
                        return exc
                    }
                }
            }
        }

        return null
    }

    const getDisplayHours = (date: Date) => {
        const exception = hasExceptionForDate(date)

        if (exception) {
            if (exception.behavior === "fully_closed") {
                return { status: "Cerrado", time: "", type: "closed", icon: "🚫" }
            } else if (exception.behavior === "partially_closed") {
                return {
                    status: "Especial",
                    time: `${exception.special_open_time} - ${exception.special_close_time}`,
                    type: "special",
                    icon: "⏱️",
                }
            }
        }

        const dayHour = getHourForDay(date)

        if (!dayHour || dayHour.is_closed) {
            return { status: "Cerrado", time: "", type: "closed", icon: "🚫" }
        }

        if (dayHour.time_ranges.length === 0) {
            return { status: "Cerrado", time: "", type: "closed", icon: "🚫" }
        }

        const timeRangesStr = dayHour.time_ranges.map((r) => `${r.open_time} - ${r.close_time}`).join(", ")

        return {
            status: "Abierto",
            time: timeRangesStr,
            type: "open",
            icon: "✓",
        }
    }

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

    const firstDayOfWeek = monthStart.getDay()
    const previousDays = Array.from({ length: firstDayOfWeek }, (_, i) => ({
        date: new Date(monthStart.getTime() - (firstDayOfWeek - i) * 24 * 60 * 60 * 1000),
        isCurrentMonth: false,
    }))

    const lastDayOfWeek = monthEnd.getDay()
    const nextDays = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => ({
        date: new Date(monthEnd.getTime() + (i + 1) * 24 * 60 * 60 * 1000),
        isCurrentMonth: false,
    }))

    const allDays = [
        ...previousDays.map((d) => ({ ...d, isCurrentMonth: false })),
        ...daysInMonth.map((d) => ({ date: d, isCurrentMonth: true })),
        ...nextDays.map((d) => ({ ...d, isCurrentMonth: false })),
    ]

    return (
        <div className="space-y-4">
            <Card className="border-brand-green/20 shadow-lg">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-green/10 rounded-lg">
                                <CalendarIcon className="h-5 w-5 text-brand-green" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Vista Previa del Calendario</CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {hours.length === 0 && exceptions.length === 0
                                        ? "Configura horarios y excepciones para ver la vista previa"
                                        : `${exceptions.length} excepción${exceptions.length !== 1 ? "es" : ""} aplicada${exceptions.length !== 1 ? "s" : ""}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                className="hover:bg-brand-green/10"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="w-40 text-center font-semibold text-sm">
                                {format(currentDate, "MMMM yyyy", { locale: es }).charAt(0).toUpperCase() +
                                    format(currentDate, "MMMM yyyy", { locale: es }).slice(1)}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                className="hover:bg-brand-green/10"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        {/* Legend */}
                        <div className="flex flex-wrap gap-6 p-4 rounded-lg bg-gradient-to-r from-brand-green/5 to-brand-gold/5 border border-brand-green/10">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-sm font-medium">Abierto</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span className="text-sm font-medium">Horario Especial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-sm font-medium">Cerrado</span>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="border border-brand-green/10 rounded-xl overflow-hidden shadow-sm">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-0 bg-gradient-to-r from-brand-green/5 to-brand-teal/5 border-b border-brand-green/10">
                                {dayNames.map((day) => (
                                    <div key={day} className="p-3 text-center font-semibold text-sm text-foreground/80">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar days */}
                            <div className="grid grid-cols-7 gap-0 bg-background">
                                {allDays.map((day, index) => {
                                    const { status, time, type } = getDisplayHours(day.date)
                                    const isCurrentMonth = isSameMonth(day.date, currentDate)
                                    const exception = hasExceptionForDate(day.date)
                                    const dayNumber = format(day.date, "d")

                                    const getStatusColor = () => {
                                        if (exception) {
                                            return exception.behavior === "fully_closed"
                                                ? "from-red-500 to-red-600"
                                                : "from-amber-500 to-amber-600"
                                        }
                                        return type === "open" ? "from-green-500 to-green-600" : "from-slate-300 to-slate-400"
                                    }

                                    const getBgColor = () => {
                                        if (exception) {
                                            return exception.behavior === "fully_closed"
                                                ? "bg-red-50 hover:bg-red-100/60"
                                                : "bg-amber-50 hover:bg-amber-100/60"
                                        }
                                        return type === "open" ? "bg-green-50 hover:bg-green-100/40" : "bg-slate-50 hover:bg-slate-100/40"
                                    }

                                    return (
                                        <Popover key={index}>
                                            <PopoverTrigger asChild>
                                                <button
                                                    className={`min-h-28 p-3 border-r border-b border-brand-green/10 transition-all ${getBgColor()} ${!isCurrentMonth ? "opacity-40" : ""} cursor-pointer hover:shadow-md group`}
                                                >
                                                    {/* Day number with status indicator */}
                                                    <div className="flex items-start justify-between mb-2">
                                                        <span
                                                            className={`text-lg font-bold ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}
                                                        >
                                                            {dayNumber}
                                                        </span>
                                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${getStatusColor()} shadow-sm`} />
                                                    </div>

                                                    {/* Exception badge if exists */}
                                                    {exception && (
                                                        <div className="mb-2 flex items-start gap-1">
                                                            <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                            <div className="text-xs font-semibold text-left truncate leading-tight">
                                                                <div className="text-amber-900 truncate">{exception.name}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Time info */}
                                                    <div className="text-xs space-y-1">
                                                        <div
                                                            className={`font-semibold ${type === "open"
                                                                ? "text-green-700"
                                                                : type === "special"
                                                                    ? "text-amber-700"
                                                                    : "text-slate-600"
                                                                }`}
                                                        >
                                                            {status}
                                                        </div>
                                                        {time && (
                                                            <div className="text-xs text-foreground/60 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span className="leading-tight">{time}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            </PopoverTrigger>

                                            {/* Detail Popover */}
                                            <PopoverContent className="w-96" align="start">
                                                <div className="space-y-4">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between pb-2 border-b">
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground">
                                                                {format(day.date, "EEEE", { locale: es })}
                                                            </p>
                                                            <h3 className="text-lg font-bold">
                                                                {format(day.date, "dd 'de' MMMM 'de' yyyy", { locale: es })}
                                                            </h3>
                                                        </div>
                                                        <div
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${type === "open"
                                                                ? "bg-green-100 text-green-700"
                                                                : type === "special"
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : "bg-slate-100 text-slate-700"
                                                                }`}
                                                        >
                                                            {status}
                                                        </div>
                                                    </div>

                                                    {/* Exception details if exists */}
                                                    {exception && (
                                                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 space-y-3">
                                                            <div className="flex items-start gap-3">
                                                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-amber-900">{exception.name}</h4>
                                                                    <p className="text-xs text-amber-700 mt-1">Excepción detectada para este día</p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-amber-800/70">Tipo:</span>
                                                                    <span className="font-medium text-amber-900">
                                                                        {exception.type === "annual"
                                                                            ? "Anual"
                                                                            : exception.type === "monthly"
                                                                                ? "Mensual"
                                                                                : "Específica"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-amber-800/70">Comportamiento:</span>
                                                                    <span className="font-medium text-amber-900">
                                                                        {exception.behavior === "fully_closed"
                                                                            ? "Completamente Cerrado"
                                                                            : exception.behavior === "partially_closed"
                                                                                ? "Horario Reducido"
                                                                                : "Parcialmente Abierto"}
                                                                    </span>
                                                                </div>
                                                                {exception.behavior === "partially_closed" && (
                                                                    <div className="flex justify-between pt-2 border-t border-amber-200">
                                                                        <span className="text-amber-800/70">Horario Especial:</span>
                                                                        <span className="font-semibold text-amber-900 flex items-center gap-1">
                                                                            <Clock className="h-3.5 w-3.5" />
                                                                            {exception.special_open_time} - {exception.special_close_time}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Regular hours */}
                                                    {!exception && (
                                                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200 space-y-3">
                                                            <h4 className="font-semibold text-blue-900">Horario Regular</h4>
                                                            {type === "closed" ? (
                                                                <p className="text-sm text-blue-700">Este día está cerrado</p>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    {getHourForDay(day.date)?.time_ranges.map((range, idx) => (
                                                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                                                            <Clock className="h-4 w-4 text-blue-600" />
                                                                            <span className="font-medium text-blue-900">
                                                                                {range.open_time} - {range.close_time}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Info footer */}
                                                    <p className="text-xs text-muted-foreground text-center">
                                                        Haz clic en otra fecha para ver más detalles
                                                    </p>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-700">Días Abiertos</span>
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="text-3xl font-bold text-green-900">{safeHours.filter((h) => !h.is_closed).length}</div>
                            <p className="text-xs text-green-700/70 mt-1">por semana</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-amber-700">Excepciones</span>
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                            </div>
                            <div className="text-3xl font-bold text-amber-900">{exceptions.length}</div>
                            <p className="text-xs text-amber-700/70 mt-1">aplicadas en total</p>
                        </div>

                        <div
                            className={`bg-gradient-to-br p-4 rounded-lg border ${safeHours.some((h) => !h.is_closed)
                                ? "from-blue-50 to-cyan-50 border-blue-200/50"
                                : "from-slate-50 to-gray-50 border-slate-200/50"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className={`text-sm font-medium ${safeHours.some((h) => !h.is_closed) ? "text-blue-700" : "text-slate-700"}`}
                                >
                                    Estado
                                </span>
                                <div
                                    className={`w-3 h-3 rounded-full ${safeHours.some((h) => !h.is_closed) ? "bg-blue-500" : "bg-slate-500"}`}
                                />
                            </div>
                            <div
                                className={`text-3xl font-bold ${safeHours.some((h) => !h.is_closed) ? "text-blue-900" : "text-slate-900"}`}
                            >
                                {safeHours.some((h) => !h.is_closed) ? "Operativo" : "Cerrado"}
                            </div>
                            <p
                                className={`text-xs mt-1 ${safeHours.some((h) => !h.is_closed) ? "text-blue-700/70" : "text-slate-700/70"}`}
                            >
                                departamento
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
