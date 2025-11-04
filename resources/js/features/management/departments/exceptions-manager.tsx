import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { DepartmentException } from '@/types/department';
import { to12HourFormat } from '@/utils/timeFormatter';
import { Calendar, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    BehaviorBadgeFactory,
    ExceptionTypeLabelFactory,
} from '../../../utils/departments/BadgeFactories';
import { RecurrencePatternFormatter } from '../../../utils/departments/RecurrencePatternFormatter';
import { ExceptionFormDialog } from './ExceptionFormDialog';

// 🔍 Refactor aplicado:
// Patrón: Single Responsibility + Dependency Injection
// Motivo: El componente principal mezclaba lógica de formateo, presentación y estado
// Beneficio: Se mejora la mantenibilidad y capacidad de prueba separando las responsabilidades

interface ExceptionsManagerProps {
    initialExceptions?: DepartmentException[];
    onSave: (exceptions: DepartmentException[]) => void;
}

export function ExceptionsManager({
    initialExceptions = [],
    onSave,
}: ExceptionsManagerProps) {
    const [exceptions, setExceptions] =
        useState<DepartmentException[]>(initialExceptions);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingException, setEditingException] =
        useState<DepartmentException | null>(null);

    // Initialize formatters using Factory pattern
    const recurrenceFormatter = new RecurrencePatternFormatter();

    const handleAddException = (exception: DepartmentException) => {
        let updatedExceptions: DepartmentException[];

        if (editingException) {
            updatedExceptions = exceptions.map((e) =>
                e.id === editingException.id ? exception : e,
            );
        } else {
            updatedExceptions = [...exceptions, exception];
        }

        setExceptions(updatedExceptions);
        onSave(updatedExceptions);
        setIsDialogOpen(false);
        setEditingException(null);
    };

    const handleDeleteException = (id: number) => {
        const updatedExceptions = exceptions.filter((e) => e.id !== id);
        setExceptions(updatedExceptions);
        onSave(updatedExceptions);
    };

    const handleEditException = (exception: DepartmentException) => {
        setEditingException(exception);
        setIsDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="text-brand-gold h-5 w-5" />
                        <CardTitle>Excepciones de Horario</CardTitle>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Excepción
                    </Button>
                </div>
                <CardDescription>
                    Configura días festivos, horarios especiales y excepciones
                    al horario regular
                </CardDescription>
            </CardHeader>
            <CardContent>
                {exceptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 font-semibold">
                            No hay excepciones configuradas
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Agrega excepciones para días festivos o horarios
                            especiales
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
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exceptions.map((exception) => (
                                <TableRow key={exception.id}>
                                    <TableCell className="font-medium">
                                        {exception.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {ExceptionTypeLabelFactory.getLabel(
                                                exception.type,
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {recurrenceFormatter.format(exception)}
                                    </TableCell>
                                    <TableCell>
                                        {BehaviorBadgeFactory.create(
                                            exception.behavior,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {exception.behavior ===
                                            'fully_closed' && (
                                                <span className="text-sm text-muted-foreground">
                                                    Cerrado
                                                </span>
                                            )}
                                        {exception.behavior ===
                                            'partially_closed' && (
                                                <span className="text-sm">
                                                    {to12HourFormat(
                                                        exception.special_open_time,
                                                    )}{' '}
                                                    -{' '}
                                                    {to12HourFormat(
                                                        exception.special_close_time,
                                                    )}
                                                </span>
                                            )}
                                        {exception.behavior ===
                                            'partially_open' &&
                                            exception.partial_hours && (
                                                <div className="space-y-1">
                                                    {exception.partial_hours.map(
                                                        (hour, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="text-sm"
                                                            >
                                                                {to12HourFormat(
                                                                    hour.open_time,
                                                                )}{' '}
                                                                -{' '}
                                                                {to12HourFormat(
                                                                    hour.close_time,
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleEditException(
                                                        exception,
                                                    )
                                                }
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleDeleteException(
                                                        exception.id,
                                                    )
                                                }
                                            >
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
                        setIsDialogOpen(open);
                        if (!open) setEditingException(null);
                    }}
                    exception={editingException}
                    onSave={handleAddException}
                />
            </CardContent>
        </Card>
    );
}
