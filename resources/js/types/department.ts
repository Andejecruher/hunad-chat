export interface Department {
    id: number
    name: string
    description?: string
    timezone: string
    is_active: boolean
    company_id: number
    created_at?: string
    updated_at?: string
    agentsCount: number
    agents: string[]
    color: string
    hours?: DepartmentHours[]
    exceptions?: DepartmentException[]
}

export interface DepartmentFormData {
    name: string
    description?: string
    timezone: string
    is_active: boolean
}

export interface DepartmentHours {
    day_of_week: number // 0-6 (Domingo=0 a Sábado=6)
    open_time: string // formato "HH:MM"
    close_time: string // formato "HH:MM"
    is_closed: boolean
}

export interface DepartmentException {
    id: number
    name: string
    type: "annual" | "monthly" | "specific"
    start_date: string // formato ISO "YYYY-MM-DD"
    end_date?: string // formato ISO "YYYY-MM-DD"
    recurrence_pattern: string
    behavior: "fully_closed" | "partially_closed" | "partially_open" // NUEVO
    special_open_time?: string // formato "HH:MM" - para partially_closed
    special_close_time?: string // formato "HH:MM" - para partially_closed
    partial_hours?: PartialHours[] // NUEVO - para partially_open
    monthly_recurrence?: MonthlyRecurrence // NUEVO - para tipo monthly mejorado
}

export interface PartialHours {
    open_time: string // formato "HH:MM"
    close_time: string // formato "HH:MM"
}

export interface MonthlyRecurrence {
    type: "specific_day" | "pattern"
    day_of_month?: number // 1-31 para specific_day
    week_pattern?: "first" | "second" | "third" | "fourth" | "last"
    day_of_week?: number // 0-6 para pattern (0=Domingo, 6=Sábado)
}

export const TIMEZONES = [
    { value: "UTC", label: "UTC (Tiempo Universal Coordinado)" },
    { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
    { value: "America/New_York", label: "Nueva York (GMT-5)" },
    { value: "America/Los_Angeles", label: "Los Ángeles (GMT-8)" },
    { value: "America/Chicago", label: "Chicago (GMT-6)" },
    { value: "America/Bogota", label: "Bogotá (GMT-5)" },
    { value: "America/Lima", label: "Lima (GMT-5)" },
    { value: "America/Santiago", label: "Santiago (GMT-4)" },
    { value: "America/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
    { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
    { value: "Europe/London", label: "Londres (GMT+0)" },
    { value: "Europe/Paris", label: "París (GMT+1)" },
    { value: "Asia/Tokyo", label: "Tokio (GMT+9)" },
    { value: "Asia/Shanghai", label: "Shanghái (GMT+8)" },
]

export const DAYS_OF_WEEK = [
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
    { value: 0, label: "Domingo" },
]
