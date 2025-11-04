import type {
    DepartmentException,
    MonthlyRecurrence,
} from '@/types/department';
import { useEffect, useState } from 'react';

// 🔍 Refactor aplicado:
// Patrón: Single Responsibility + Custom Hook
// Motivo: El componente mezclaba lógica de estado, validación y presentación
// Beneficio: Se mejora la mantenibilidad y capacidad de prueba separando las responsabilidades

export function useExceptionForm(exception: DepartmentException | null) {
    const [formData, setFormData] = useState<Partial<DepartmentException>>({
        name: exception?.name || '',
        type: exception?.type || 'specific',
        start_date: exception?.start_date || undefined,
        end_date: exception?.end_date || undefined,
        recurrence_pattern: exception?.recurrence_pattern || {},
        behavior: exception?.behavior || 'fully_closed',
        special_open_time: exception?.special_open_time || '09:00',
        special_close_time: exception?.special_close_time || '18:00',
        partial_hours: exception?.partial_hours || [],
        monthly_recurrence: exception?.monthly_recurrence || {
            type: 'specific_day',
            day_of_month: 1,
        },
    });

    const [monthlyType, setMonthlyType] = useState<'specific_day' | 'pattern'>(
        exception?.monthly_recurrence?.type || 'specific_day',
    );

    const [errors, setErrors] = useState<string[]>([]);

    // Helper para convertir fecha ISO a formato YYYY-MM-DD
    const formatDateForInput = (dateString?: string | null) => {
        if (!dateString || dateString.trim() === '' || dateString === 'null')
            return '';
        try {
            // Si la fecha viene en formato ISO, extraer solo la parte de la fecha
            if (dateString.includes('T')) {
                return dateString.split('T')[0];
            }
            // Si ya está en formato YYYY-MM-DD, devolverla tal como está
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return dateString;
            }
            // Intentar parsear y formatear la fecha
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
            return '';
        } catch (error) {
            console.warn('Error al formatear fecha:', dateString, error);
            return '';
        }
    };

    // Efecto para actualizar el formulario cuando cambia la excepción a editar
    useEffect(() => {
        if (exception) {
            // Determinar el tipo mensual correctamente
            let monthlyRecurrenceType = 'specific_day';
            let monthlyRecurrenceData: Partial<MonthlyRecurrence> = {
                type: 'specific_day',
                day_of_month: 1,
            };

            if (exception.type === 'monthly') {
                if (exception.monthly_recurrence) {
                    monthlyRecurrenceType =
                        exception.monthly_recurrence.type || 'specific_day';
                    monthlyRecurrenceData = exception.monthly_recurrence;
                } else if (exception.recurrence_pattern?.type) {
                    // Migrar datos de recurrence_pattern a monthly_recurrence
                    monthlyRecurrenceType = exception.recurrence_pattern.type;
                    monthlyRecurrenceData = {
                        type: exception.recurrence_pattern.type,
                        day_of_month:
                            exception.recurrence_pattern.day_of_month || 1,
                        week_pattern: exception.recurrence_pattern.week_pattern,
                        day_of_week: exception.recurrence_pattern.day_of_week,
                    };
                }
            }

            setFormData({
                name: exception.name || '',
                type: exception.type || 'specific',
                start_date: formatDateForInput(exception.start_date),
                end_date: formatDateForInput(exception.end_date),
                recurrence_pattern: exception.recurrence_pattern || {},
                behavior: exception.behavior || 'fully_closed',
                special_open_time: exception.special_open_time || '09:00',
                special_close_time: exception.special_close_time || '18:00',
                partial_hours: exception.partial_hours || [],
                monthly_recurrence: monthlyRecurrenceData as MonthlyRecurrence,
            });
            setMonthlyType(monthlyRecurrenceType as 'specific_day' | 'pattern');
        } else {
            // Resetear formulario para nueva excepción
            setFormData({
                name: '',
                type: 'specific',
                start_date: '',
                end_date: '',
                recurrence_pattern: {},
                behavior: 'fully_closed',
                special_open_time: '09:00',
                special_close_time: '18:00',
                partial_hours: [],
                monthly_recurrence: { type: 'specific_day', day_of_month: 1 },
            });
            setMonthlyType('specific_day');
        }
        setErrors([]);
    }, [exception]);

    // Validación de horarios parciales
    const validatePartialHours = (): boolean => {
        if (!formData.partial_hours || formData.partial_hours.length === 0)
            return true;

        const newErrors: string[] = [];

        formData.partial_hours.forEach((hour, idx) => {
            if (hour.open_time >= hour.close_time) {
                newErrors.push(
                    `Rango ${idx + 1}: La hora de apertura debe ser antes del cierre`,
                );
            }
        });

        for (let i = 0; i < formData.partial_hours.length; i++) {
            for (let j = i + 1; j < formData.partial_hours.length; j++) {
                const hour1 = formData.partial_hours[i];
                const hour2 = formData.partial_hours[j];

                if (
                    (hour1.open_time <= hour2.open_time &&
                        hour2.open_time < hour1.close_time) ||
                    (hour2.open_time <= hour1.open_time &&
                        hour1.open_time < hour2.close_time)
                ) {
                    newErrors.push(`Los rangos ${i + 1} y ${j + 1} se solapan`);
                }
            }
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    // Funciones de manipulación de horarios parciales
    const addPartialHour = () => {
        if ((formData.partial_hours?.length || 0) >= 3) {
            setErrors(['Máximo 3 rangos de horario permitidos']);
            return;
        }
        setFormData({
            ...formData,
            partial_hours: [
                ...(formData.partial_hours || []),
                { open_time: '09:00', close_time: '18:00' },
            ],
        });
        setErrors([]);
    };

    const removePartialHour = (index: number) => {
        setFormData({
            ...formData,
            partial_hours: formData.partial_hours?.filter(
                (_, i) => i !== index,
            ),
        });
    };

    const updatePartialHour = (
        index: number,
        field: 'open_time' | 'close_time',
        value: string,
    ) => {
        const updated = [...(formData.partial_hours || [])];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, partial_hours: updated });
    };

    // Función de validación principal
    const validateForm = (): boolean => {
        if (!formData.name) {
            setErrors(['El nombre es requerido']);
            return false;
        }

        if (formData.behavior === 'partially_open') {
            if (
                !formData.partial_hours ||
                formData.partial_hours.length === 0
            ) {
                setErrors(['Debes agregar al menos un rango de horario']);
                return false;
            }
            if (!validatePartialHours()) return false;
        }

        // Para excepciones específicas, la fecha es requerida
        if (
            formData.type === 'specific' &&
            (!formData.start_date || formData.start_date.trim() === '')
        ) {
            setErrors(['La fecha es requerida para excepciones específicas']);
            return false;
        }

        return true;
    };

    // Función para construir la excepción final
    const buildException = (): DepartmentException => {
        let recurrencePattern: DepartmentException['recurrence_pattern'] = {};
        let startDate = formData.start_date;

        // Para excepciones anuales, usar month y day
        if (formData.type === 'annual') {
            const month = formData.recurrence_pattern?.month || 1;
            const day = formData.recurrence_pattern?.day || 1;

            recurrencePattern = { month, day };

            // Si no hay start_date, generar una fecha válida para el año actual
            if (!startDate || startDate.trim() === '') {
                const currentYear = new Date().getFullYear();
                startDate = `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }

        // Para excepciones mensuales, usar la configuración de monthly_recurrence
        if (formData.type === 'monthly' && formData.monthly_recurrence) {
            recurrencePattern = {
                type: formData.monthly_recurrence.type,
                day_of_month: formData.monthly_recurrence.day_of_month,
                week_pattern: formData.monthly_recurrence.week_pattern,
                day_of_week: formData.monthly_recurrence.day_of_week,
            };

            // Para excepciones mensuales, si no hay start_date, usar el primer día del mes actual
            if (!startDate || startDate.trim() === '') {
                const now = new Date();
                startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
            }
        }

        const newException: DepartmentException = {
            id: exception?.id || Number(new Date().getTime()),
            name: formData.name!,
            type: formData.type as 'annual' | 'monthly' | 'specific',
            start_date: startDate || '',
            end_date: formData.end_date || undefined,
            recurrence_pattern: recurrencePattern,
            behavior: formData.behavior as
                | 'fully_closed'
                | 'partially_closed'
                | 'partially_open',
            special_open_time:
                formData.behavior === 'partially_closed'
                    ? formData.special_open_time
                    : undefined,
            special_close_time:
                formData.behavior === 'partially_closed'
                    ? formData.special_close_time
                    : undefined,
            partial_hours:
                formData.behavior === 'partially_open'
                    ? formData.partial_hours
                    : undefined,
            monthly_recurrence:
                formData.type === 'monthly'
                    ? formData.monthly_recurrence
                    : undefined,
        };

        // Crear una copia para enviar al backend que convierta undefined a null
        return {
            ...newException,
            start_date: newException.start_date || null,
            end_date: newException.end_date || null,
            special_open_time: newException.special_open_time || null,
            special_close_time: newException.special_close_time || null,
        } as DepartmentException;
    };

    return {
        formData,
        setFormData,
        monthlyType,
        setMonthlyType,
        errors,
        addPartialHour,
        removePartialHour,
        updatePartialHour,
        validateForm,
        buildException,
    };
}
