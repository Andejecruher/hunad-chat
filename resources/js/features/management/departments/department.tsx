import {useEffect, useState} from "react"
import departmentRouter from '@/routes/departments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DepartmentHoursManager } from "./department-hours-manager"
import { ExceptionsManager } from "./exceptions-manager"
import type { DepartmentHours, DepartmentException, Department } from "@/types/department"

export function DepartmentSchedule({ department }: {department: Department}) {
    const [hours, setHours] = useState<DepartmentHours[]>([])
    const [exceptions, setExceptions] = useState<DepartmentException[]>([])

    const handleSaveHours = (newHours: DepartmentHours[]) => {
        setHours(newHours)
        console.log("[v0] Guardando horarios:", newHours)
        // Aquí iría la llamada a la API
    }

    const handleSaveExceptions = (newExceptions: DepartmentException[]) => {
        setExceptions(newExceptions)
        console.log("[v0] Guardando excepciones:", newExceptions)
        // Aquí iría la llamada a la API
    }

    useEffect(() => {
        // imprimier en consola el departamento recibido
        console.log("Departamento recibido:", department)
        console.log("Horarios iniciales:", department.hours)
        console.log("Excepciones iniciales:", department.exceptions)
        if(department.hours){
            setHours(department.hours)
        }
        if(department.exceptions){
            setExceptions(department.exceptions)
        }
    },[department])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => departmentRouter.index.url()}>
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
                    <DepartmentHoursManager  initialHours={hours} onSave={handleSaveHours} />
                </TabsContent>

                <TabsContent value="exceptions" className="space-y-4">
                    <ExceptionsManager initialExceptions={exceptions} onSave={handleSaveExceptions} />
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                    <div className="rounded-lg border p-8 text-center">
                        <p className="text-muted-foreground">Vista previa del calendario con horarios aplicados (próximamente)</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
