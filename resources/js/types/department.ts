export interface Department {
    id?: number;
    name: string;
    description?: string;
    timezone: string;
    is_active: boolean;
    company_id: number;
    color: string;
    created_at?: string;
    updated_at?: string;

    // Relaciones
    company?: Company;
    hours?: DepartmentHours[];
    exceptions?: DepartmentException[];
    agents?: Agent[];
    scheduleAudits?: DepartmentScheduleAudit[];

    // Atributos calculados
    agents_count?: number;
}

export interface Company {
    id: number;
    name: string;
}

export interface Agent {
    id: number;
    user: User;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface DepartmentFormData {
    name: string;
    description?: string;
    timezone: string;
    is_active: boolean;
    color: string;
    hours?: DepartmentHourInput[];
}

export interface DepartmentHour {
    id?: number;
    department_id: number;
    day_of_week: number; // 0-6 (Domingo=0 a Sábado=6)
    open_time?: string; // formato "HH:mm:ss" o null
    close_time?: string; // formato "HH:mm:ss" o null
    is_closed: boolean;
    created_at?: string;
    updated_at?: string;

    // Atributos calculados
    day_name?: string;
    formatted_hours?: string;
}

export interface DepartmentHourInput {
    day_of_week: number;
    open_time?: string; // formato "HH:mm" para formularios
    close_time?: string; // formato "HH:mm" para formularios
    is_closed: boolean;
}

export interface DepartmentException {
    id: number;
    name: string;
    type: 'annual' | 'monthly' | 'specific';
    start_date: string; // formato ISO "YYYY-MM-DD"
    end_date?: string; // formato ISO "YYYY-MM-DD"
    recurrence_pattern: {
        month?: number; // 1-12 para tipo annual
        day?: number; // 1-31 para tipo annual
        // Para tipo monthly mejorado
        type?: 'specific_day' | 'pattern';
        day_of_month?: number; // 1-31 para specific_day
        week_pattern?: 'first' | 'second' | 'third' | 'fourth' | 'last';
        day_of_week?: number; // 0-6 para pattern (0=Domingo, 6=Sábado)
    };
    behavior: 'fully_closed' | 'partially_closed' | 'partially_open'; // NUEVO
    special_open_time?: string; // formato "HH:MM" - para partially_closed
    special_close_time?: string; // formato "HH:MM" - para partially_closed
    partial_hours?: PartialHours[]; // NUEVO - para partially_open
    monthly_recurrence?: MonthlyRecurrence; // NUEVO - para tipo monthly mejorado
}

export interface MonthlyRecurrence {
    type: 'specific_day' | 'pattern';
    day_of_month?: number; // 1-31 para specific_day
    week_pattern?: 'first' | 'second' | 'third' | 'fourth' | 'last';
    day_of_week?: number; // 0-6 para pattern (0=Domingo, 6=Sábado)
}

export interface DepartmentHours {
    day_of_week: number; // 0-6 (Domingo=0 a Sábado=6)
    time_ranges: TimeRange[]; // Cambiado a array de rangos de horario para soportar múltiples horarios por día
    is_closed: boolean;
}

export interface TimeRange {
    id: string;
    open_time: string; // formato "HH:MM"
    close_time: string; // formato "HH:MM"
}

export interface RecurrencePattern {
    // Para tipo 'annual'
    month?: number; // 1-12
    day?: number; // 1-31

    // Para tipo 'monthly'
    type?: 'specific_day' | 'pattern';
    day_of_month?: number; // 1-31 para specific_day
    week_pattern?: 'first' | 'second' | 'third' | 'fourth' | 'last';
    day_of_week?: number; // 0-6 para pattern (0=Domingo, 6=Sábado)
}

export interface PartialHours {
    open_time: string; // formato "HH:mm:ss"
    close_time: string; // formato "HH:mm:ss"
}

export interface DepartmentScheduleAudit {
    id: number;
    department_id: number;
    change_type: string; // 'created', 'updated', 'deleted', 'exception_added'
    previous_data?: Record<string, unknown>;
    new_data?: Record<string, unknown>;
    changed_by?: number;
    created_at: string;
    updated_at: string;

    // Relaciones
    department?: Department;
    changedBy?: User;
}

export interface DepartmentExceptionInput {
    name: string;
    type: 'annual' | 'monthly' | 'specific';
    start_date: string;
    end_date?: string;
    behavior: 'fully_closed' | 'partially_closed' | 'partially_open';
    special_open_time?: string;
    special_close_time?: string;
    partial_hours?: PartialHours[];
    recurrence_pattern?: RecurrencePattern;
}

export interface DepartmentStats {
    total: number;
    active: number;
    inactive: number;
    with_agents: number;
    without_agents: number;
    by_timezone: Record<string, number>;
}

export const TIMEZONES = [
    { value: 'UTC', label: 'UTC (Tiempo Universal Coordinado)' },
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
    { value: 'America/Chicago', label: 'Chicago (GMT-6)' },
    { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
    { value: 'America/Lima', label: 'Lima (GMT-5)' },
    { value: 'America/Santiago', label: 'Santiago (GMT-4)' },
    { value: 'America/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'Europe/London', label: 'Londres (GMT+0)' },
    { value: 'Europe/Paris', label: 'París (GMT+1)' },
    { value: 'Asia/Tokyo', label: 'Tokio (GMT+9)' },
    { value: 'Asia/Shanghai', label: 'Shanghái (GMT+8)' },
] as const;

export const DAYS_OF_WEEK = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
] as const;

export const EXCEPTION_BEHAVIORS = [
    { value: 'fully_closed', label: 'Completamente Cerrado' },
    { value: 'partially_closed', label: 'Parcialmente Cerrado' },
    { value: 'partially_open', label: 'Parcialmente Abierto' },
] as const;

export const EXCEPTION_TYPES = [
    { value: 'specific', label: 'Fecha Específica' },
    { value: 'annual', label: 'Anual (se repite cada año)' },
    { value: 'monthly', label: 'Mensual (se repite cada mes)' },
] as const;

export const WEEK_PATTERNS = [
    { value: 'first', label: 'Primera semana' },
    { value: 'second', label: 'Segunda semana' },
    { value: 'third', label: 'Tercera semana' },
    { value: 'fourth', label: 'Cuarta semana' },
    { value: 'last', label: 'Última semana' },
] as const;

export const DEPARTMENT_COLORS = [
    { value: 'bg-brand-green', label: 'Verde', class: 'bg-green-500' },
    { value: 'bg-brand-blue', label: 'Azul', class: 'bg-blue-500' },
    { value: 'bg-brand-red', label: 'Rojo', class: 'bg-red-500' },
    { value: 'bg-brand-yellow', label: 'Amarillo', class: 'bg-yellow-500' },
    { value: 'bg-brand-purple', label: 'Morado', class: 'bg-purple-500' },
    { value: 'bg-brand-orange', label: 'Naranja', class: 'bg-orange-500' },
    { value: 'bg-brand-pink', label: 'Rosa', class: 'bg-pink-500' },
    { value: 'bg-brand-indigo', label: 'Índigo', class: 'bg-indigo-500' },
    { value: 'bg-brand-teal', label: 'Verde azulado', class: 'bg-teal-500' },
    { value: 'bg-brand-gray', label: 'Gris', class: 'bg-gray-500' },
] as const;
