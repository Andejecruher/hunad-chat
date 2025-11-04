import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { default as departmentRouter, default as departmentsRouter } from '@/routes/departments';
import type { Department, DepartmentException, DepartmentHours } from "@/types/department";
import { toFormData } from '@/utils/form-data-utils';
import { router } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarPreview } from "./calendar-preview";
import { DepartmentHoursManager } from "./department-hours-manager";
import { ExceptionsManager } from "./exceptions-manager";

export function DepartmentSchedule({ department }: { department: Department }) {
    const [hours, setHours] = useState<DepartmentHours[]>(department.hours || [])
    const [exceptions, setExceptions] = useState<DepartmentException[]>(department.exceptions || [])

    const handleSaveHours = (newHours: DepartmentHours[]) => {
        if (!department || !department.id) return;

        setHours(newHours)

        const updateDepartment = {
            ...department,
            hours: newHours,
        };

        const payload = toFormData(updateDepartment, 'PUT');
        // Añadimos el método PUT
        router.post(departmentsRouter.update(department.id).url, payload, {
            preserveState: true,
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Department updated successfully.');
            },
            onError: (error) => {
                toast.error(error.message || 'An error occurred while updating the department.');
            },
        });
    }

    const handleSaveExceptions = (newExceptions: DepartmentException[]) => {

        if (!department || !department.id) return;

        setExceptions(newExceptions)

        const updateDepartment = {
            ...department,
            exceptions: newExceptions,
        };

        const payload = toFormData(updateDepartment, 'PUT');
        // Añadimos el método PUT
        router.post(departmentsRouter.update(department.id).url, payload, {
            preserveState: true,
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Department updated successfully.');
            },
            onError: (error) => {
                toast.error(error.message || 'An error occurred while updating the department.');
            }
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.visit(departmentRouter.index().url)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">Gestión de Horarios</h1>
                    <p className="text-muted-foreground">Configura los horarios de atención y excepciones del departamento</p>
                </div>
            </div>

            <Tabs defaultValue="hours" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="hours">Horario Regular</TabsTrigger>
                    <TabsTrigger value="exceptions">Excepciones</TabsTrigger>
                    <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                </TabsList>

                <TabsContent value="hours" className="space-y-4">
                    <DepartmentHoursManager initialHours={hours} onSave={handleSaveHours} />
                </TabsContent>

                <TabsContent value="exceptions" className="space-y-4">
                    <ExceptionsManager initialExceptions={exceptions} onSave={handleSaveExceptions} />
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                    <CalendarPreview hours={hours} exceptions={exceptions} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
