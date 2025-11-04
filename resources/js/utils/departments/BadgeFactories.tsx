import { Badge } from '@/components/ui/badge';
import type { ReactElement } from 'react';

// 🔍 Refactor aplicado:
// Patrón: Factory Pattern
// Motivo: Centralizar la creación de badges de comportamiento con configuraciones específicas
// Beneficio: Se facilita el mantenimiento y la extensión de nuevos tipos de comportamiento

export class BehaviorBadgeFactory {
    private static readonly BEHAVIOR_CONFIGS = {
        fully_closed: {
            className: 'bg-red-500',
            label: '🟥 Completamente Cerrado',
        },
        partially_closed: {
            className: 'bg-yellow-500',
            label: '🟨 Parcialmente Cerrado',
        },
        partially_open: {
            className: 'bg-green-500',
            label: '🟩 Parcialmente Abierto',
        },
    } as const;

    static create(behavior: string): ReactElement {
        const config =
            this.BEHAVIOR_CONFIGS[
                behavior as keyof typeof this.BEHAVIOR_CONFIGS
            ];

        if (config) {
            return <Badge className={config.className}>{config.label}</Badge>;
        }

        return <Badge variant="secondary">Sin definir</Badge>;
    }
}

export class ExceptionTypeLabelFactory {
    private static readonly TYPE_LABELS = {
        annual: 'Anual',
        monthly: 'Mensual',
        specific: 'Específico',
    } as const;

    static getLabel(type: string): string {
        return this.TYPE_LABELS[type as keyof typeof this.TYPE_LABELS] || type;
    }
}
