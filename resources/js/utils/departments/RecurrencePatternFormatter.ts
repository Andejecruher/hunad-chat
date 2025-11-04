import type {
    DepartmentException,
    MonthlyRecurrence,
} from '@/types/department';

// 🔍 Refactor aplicado:
// Patrón: Strategy Pattern
// Motivo: La lógica de formateo de patrones de recurrencia variaba según el tipo, violando Open/Closed Principle
// Beneficio: Se facilita la extensión con nuevos tipos de recurrencia sin modificar el código base

interface RecurrencePatternStrategy {
    format(exception: DepartmentException): string;
}

class SpecificDateStrategy implements RecurrencePatternStrategy {
    format(exception: DepartmentException): string {
        if (!exception.start_date || exception.start_date.trim() === '') {
            return 'Fecha no configurada';
        }
        return new Date(exception.start_date).toLocaleDateString();
    }
}

class AnnualRecurrenceStrategy implements RecurrencePatternStrategy {
    format(exception: DepartmentException): string {
        if (!exception.recurrence_pattern) return 'Sin patrón';

        const { month, day } = exception.recurrence_pattern;
        if (month === undefined || day === undefined) return 'Sin patrón';

        const monthNames = [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre',
        ];
        return `${day} de ${monthNames[month - 1]}`;
    }
}

class MonthlyRecurrenceStrategy implements RecurrencePatternStrategy {
    format(exception: DepartmentException): string {
        // Intentar con monthly_recurrence primero (nueva estructura)
        if (exception.monthly_recurrence) {
            return this.formatMonthlyRecurrence(exception.monthly_recurrence);
        }

        // Fallback a recurrence_pattern (estructura antigua)
        if (exception.recurrence_pattern) {
            return this.formatRecurrencePattern(exception.recurrence_pattern);
        }

        return 'Sin patrón';
    }

    private formatMonthlyRecurrence(
        monthlyRecurrence: MonthlyRecurrence,
    ): string {
        if (monthlyRecurrence.type === 'specific_day') {
            return `Día ${monthlyRecurrence.day_of_month} de cada mes`;
        }

        if (monthlyRecurrence.type === 'pattern') {
            const dayNames = [
                'Domingo',
                'Lunes',
                'Martes',
                'Miércoles',
                'Jueves',
                'Viernes',
                'Sábado',
            ];
            const weekPatterns = {
                first: 'Primer',
                second: 'Segundo',
                third: 'Tercer',
                fourth: 'Cuarto',
                last: 'Último',
            } as const;

            const weekPattern =
                monthlyRecurrence.week_pattern as keyof typeof weekPatterns;
            const dayOfWeek = monthlyRecurrence.day_of_week!;
            return `${weekPatterns[weekPattern]} ${dayNames[dayOfWeek]} de cada mes`;
        }

        return 'Sin patrón';
    }

    private formatRecurrencePattern(
        recurrencePattern: DepartmentException['recurrence_pattern'],
    ): string {
        if (!recurrencePattern) return 'Sin patrón';

        if (recurrencePattern.type === 'specific_day') {
            return `Día ${recurrencePattern.day_of_month} de cada mes`;
        }

        if (recurrencePattern.type === 'pattern') {
            const dayNames = [
                'Domingo',
                'Lunes',
                'Martes',
                'Miércoles',
                'Jueves',
                'Viernes',
                'Sábado',
            ];
            const weekPatterns = {
                first: 'Primer',
                second: 'Segundo',
                third: 'Tercer',
                fourth: 'Cuarto',
                last: 'Último',
            } as const;

            const weekPattern =
                recurrencePattern.week_pattern as keyof typeof weekPatterns;
            const dayOfWeek = recurrencePattern.day_of_week!;
            return `${weekPatterns[weekPattern]} ${dayNames[dayOfWeek]} de cada mes`;
        }

        return 'Sin patrón';
    }
}

export class RecurrencePatternFormatter {
    private strategies: Map<string, RecurrencePatternStrategy> = new Map([
        ['specific', new SpecificDateStrategy()],
        ['annual', new AnnualRecurrenceStrategy()],
        ['monthly', new MonthlyRecurrenceStrategy()],
    ]);

    format(exception: DepartmentException): string {
        const strategy = this.strategies.get(exception.type);
        return strategy ? strategy.format(exception) : 'Sin patrón';
    }
}
