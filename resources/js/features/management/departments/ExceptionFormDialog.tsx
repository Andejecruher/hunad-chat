import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { DepartmentException } from '@/types/department';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useExceptionForm } from '../../../hooks/departments/useExceptionForm';

// 🔍 Refactor aplicado:
// Patrón: Single Responsibility
// Motivo: El formulario era demasiado extenso y mezclaba múltiples responsabilidades
// Beneficio: Se mejora la mantenibilidad separando el formulario en un componente específico

interface ExceptionFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exception: DepartmentException | null;
    onSave: (exception: DepartmentException) => void;
}

export function ExceptionFormDialog({
    open,
    onOpenChange,
    exception,
    onSave,
}: ExceptionFormDialogProps) {
    const {
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
    } = useExceptionForm(exception);

    const handleSubmit = () => {
        if (!validateForm()) return;
        const newException = buildException();
        onSave(newException);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {exception
                            ? 'Editar Excepción'
                            : 'Nueva Excepción de Horario'}
                    </DialogTitle>
                    <DialogDescription>
                        Configura una excepción al horario regular de atención
                    </DialogDescription>
                </DialogHeader>

                {errors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <ul className="list-inside list-disc">
                                {errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="exception-name">
                            Nombre de la Excepción *
                        </Label>
                        <Input
                            id="exception-name"
                            placeholder="Ej: Navidad, Black Friday, Mantenimiento"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Excepción *</Label>
                        <RadioGroup
                            value={formData.type}
                            onValueChange={(value: string) =>
                                setFormData({
                                    ...formData,
                                    type: value as
                                        | 'annual'
                                        | 'monthly'
                                        | 'specific',
                                })
                            }
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="specific"
                                    id="specific"
                                />
                                <Label
                                    htmlFor="specific"
                                    className="font-normal"
                                >
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
                                <Label
                                    htmlFor="monthly"
                                    className="font-normal"
                                >
                                    Mensual (patrón recurrente)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {formData.type === 'specific' && (
                        <div className="space-y-2">
                            <Label htmlFor="start-date">Fecha *</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={formData.start_date || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        start_date: e.target.value || '',
                                    })
                                }
                            />
                        </div>
                    )}

                    {formData.type === 'annual' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="month">Mes</Label>
                                <Select
                                    value={String(
                                        formData.recurrence_pattern?.month || 1,
                                    )}
                                    onValueChange={(value: string) =>
                                        setFormData({
                                            ...formData,
                                            recurrence_pattern: {
                                                ...formData.recurrence_pattern,
                                                month: parseInt(value),
                                                day:
                                                    formData.recurrence_pattern
                                                        ?.day || 1,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger id="month">
                                        <SelectValue placeholder="Selecciona mes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
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
                                        ].map((month, index) => (
                                            <SelectItem
                                                key={month}
                                                value={String(index + 1)}
                                            >
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
                                    value={
                                        formData.recurrence_pattern?.day || 1
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            recurrence_pattern: {
                                                ...formData.recurrence_pattern,
                                                month:
                                                    formData.recurrence_pattern
                                                        ?.month || 1,
                                                day: parseInt(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {formData.type === 'monthly' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <Label>Configuración Mensual</Label>
                            <RadioGroup
                                value={monthlyType}
                                onValueChange={(value: string) => {
                                    setMonthlyType(
                                        value as 'specific_day' | 'pattern',
                                    );
                                    setFormData({
                                        ...formData,
                                        monthly_recurrence: {
                                            type: value as
                                                | 'specific_day'
                                                | 'pattern',
                                            day_of_month:
                                                value === 'specific_day'
                                                    ? 1
                                                    : undefined,
                                            week_pattern:
                                                value === 'pattern'
                                                    ? 'first'
                                                    : undefined,
                                            day_of_week:
                                                value === 'pattern'
                                                    ? 1
                                                    : undefined,
                                        },
                                    });
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="specific_day"
                                        id="specific_day"
                                    />
                                    <Label
                                        htmlFor="specific_day"
                                        className="font-normal"
                                    >
                                        Día específico del mes
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="pattern"
                                        id="pattern"
                                    />
                                    <Label
                                        htmlFor="pattern"
                                        className="font-normal"
                                    >
                                        Patrón recurrente
                                    </Label>
                                </div>
                            </RadioGroup>

                            {monthlyType === 'specific_day' && (
                                <div className="space-y-2">
                                    <Label htmlFor="day-of-month">
                                        Día del mes
                                    </Label>
                                    <Select
                                        value={String(
                                            formData.monthly_recurrence
                                                ?.day_of_month || 1,
                                        )}
                                        onValueChange={(value: string) =>
                                            setFormData({
                                                ...formData,
                                                monthly_recurrence: {
                                                    ...formData.monthly_recurrence!,
                                                    day_of_month:
                                                        Number.parseInt(value),
                                                },
                                            })
                                        }
                                    >
                                        <SelectTrigger id="day-of-month">
                                            <SelectValue placeholder="Seleccionar día" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from(
                                                { length: 31 },
                                                (_, i) => (
                                                    <SelectItem
                                                        key={i + 1}
                                                        value={String(i + 1)}
                                                    >
                                                        Día {i + 1}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {monthlyType === 'pattern' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="week-pattern">
                                            Semana
                                        </Label>
                                        <Select
                                            value={
                                                formData.monthly_recurrence
                                                    ?.week_pattern || 'first'
                                            }
                                            onValueChange={(value: string) =>
                                                setFormData({
                                                    ...formData,
                                                    monthly_recurrence: {
                                                        ...formData.monthly_recurrence!,
                                                        week_pattern: value as
                                                            | 'first'
                                                            | 'second'
                                                            | 'third'
                                                            | 'fourth'
                                                            | 'last',
                                                    },
                                                })
                                            }
                                        >
                                            <SelectTrigger id="week-pattern">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="first">
                                                    Primer
                                                </SelectItem>
                                                <SelectItem value="second">
                                                    Segundo
                                                </SelectItem>
                                                <SelectItem value="third">
                                                    Tercer
                                                </SelectItem>
                                                <SelectItem value="fourth">
                                                    Cuarto
                                                </SelectItem>
                                                <SelectItem value="last">
                                                    Último
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="day-of-week">
                                            Día de la semana
                                        </Label>
                                        <Select
                                            value={String(
                                                formData.monthly_recurrence
                                                    ?.day_of_week || 1,
                                            )}
                                            onValueChange={(value: string) =>
                                                setFormData({
                                                    ...formData,
                                                    monthly_recurrence: {
                                                        ...formData.monthly_recurrence!,
                                                        day_of_week:
                                                            Number.parseInt(
                                                                value,
                                                            ),
                                                    },
                                                })
                                            }
                                        >
                                            <SelectTrigger id="day-of-week">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">
                                                    Domingo
                                                </SelectItem>
                                                <SelectItem value="1">
                                                    Lunes
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    Martes
                                                </SelectItem>
                                                <SelectItem value="3">
                                                    Miércoles
                                                </SelectItem>
                                                <SelectItem value="4">
                                                    Jueves
                                                </SelectItem>
                                                <SelectItem value="5">
                                                    Viernes
                                                </SelectItem>
                                                <SelectItem value="6">
                                                    Sábado
                                                </SelectItem>
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
                            onValueChange={(value: string) =>
                                setFormData({
                                    ...formData,
                                    behavior: value as
                                        | 'fully_closed'
                                        | 'partially_closed'
                                        | 'partially_open',
                                })
                            }
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="fully_closed"
                                    id="fully_closed"
                                />
                                <Label
                                    htmlFor="fully_closed"
                                    className="font-normal"
                                >
                                    🟥 Completamente Cerrado
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="partially_closed"
                                    id="partially_closed"
                                />
                                <Label
                                    htmlFor="partially_closed"
                                    className="font-normal"
                                >
                                    🟨 Parcialmente Cerrado (horario reducido)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="partially_open"
                                    id="partially_open"
                                />
                                <Label
                                    htmlFor="partially_open"
                                    className="font-normal"
                                >
                                    🟩 Parcialmente Abierto (múltiples rangos)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {formData.behavior === 'partially_closed' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <Label>Horario Especial</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="special-open">
                                        Hora de Apertura
                                    </Label>
                                    <Input
                                        id="special-open"
                                        type="time"
                                        value={formData.special_open_time}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                special_open_time:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="special-close">
                                        Hora de Cierre
                                    </Label>
                                    <Input
                                        id="special-close"
                                        type="time"
                                        value={formData.special_close_time}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                special_close_time:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.behavior === 'partially_open' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <Label>Horarios Parciales (máximo 3)</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addPartialHour}
                                    disabled={
                                        (formData.partial_hours?.length || 0) >=
                                        3
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar Horario
                                </Button>
                            </div>
                            {formData.partial_hours &&
                                formData.partial_hours.length > 0 ? (
                                <div className="space-y-3">
                                    {formData.partial_hours.map(
                                        (hour, index) => (
                                            <div
                                                key={index}
                                                className="flex items-end gap-2 rounded-lg border p-3"
                                            >
                                                <div className="flex-1 space-y-2">
                                                    <Label
                                                        htmlFor={`open-${index}`}
                                                    >
                                                        Apertura {index + 1}
                                                    </Label>
                                                    <Input
                                                        id={`open-${index}`}
                                                        type="time"
                                                        value={hour.open_time}
                                                        onChange={(e) =>
                                                            updatePartialHour(
                                                                index,
                                                                'open_time',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Label
                                                        htmlFor={`close-${index}`}
                                                    >
                                                        Cierre {index + 1}
                                                    </Label>
                                                    <Input
                                                        id={`close-${index}`}
                                                        type="time"
                                                        value={hour.close_time}
                                                        onChange={(e) =>
                                                            updatePartialHour(
                                                                index,
                                                                'close_time',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        removePartialHour(index)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No hay horarios configurados. Agrega al
                                    menos uno.
                                </p>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.name}>
                        {exception ? 'Guardar Cambios' : 'Crear Excepción'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
