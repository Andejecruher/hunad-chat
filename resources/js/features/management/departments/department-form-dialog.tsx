import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { type Department, TIMEZONES } from "@/types/department"
import { useEffect, useState } from "react"

interface DepartmentFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    department?: Department
    onSave: (department: Partial<Department>) => void
}

export function DepartmentFormDialog({ open, onOpenChange, department, onSave }: DepartmentFormDialogProps) {
    const [formData, setFormData] = useState({
        id: department?.id || undefined,
        name: department?.name || "",
        description: department?.description || "",
        timezone: department?.timezone || "America/Mexico_City",
        is_active: department?.is_active ?? true,
        color: department?.color || "bg-brand-green",
    })

    const handleSubmit = () => {
        if (!formData.name) return
        onSave(formData)
        onOpenChange(false)
    }

    useEffect(() => {
        if (department) {
            setFormData({
                id: department.id,
                name: department.name,
                description: department.description || "",
                timezone: department.timezone,
                is_active: department.is_active,
                color: department.color || "bg-brand-green",
            })
        }

        if (!department) {
            setFormData({
                id: undefined,
                name: "",
                description: "",
                timezone: "America/Mexico_City",
                is_active: true,
                color: "bg-brand-green",
            })
        }
    }, [department]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{department ? "Editar Departamento" : "Crear Nuevo Departamento"}</DialogTitle>
                    <DialogDescription>
                        {department
                            ? "Actualiza la información del departamento"
                            : "Organiza tu equipo creando un nuevo departamento especializado"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Departamento *</Label>
                        <Input
                            id="name"
                            placeholder="Ej: Ventas, Soporte, Atención al Cliente"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe las responsabilidades de este departamento..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timezone">Zona Horaria *</Label>
                        <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                            <SelectTrigger id="timezone">
                                <SelectValue placeholder="Selecciona una zona horaria" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIMEZONES.map((tz) => (
                                    <SelectItem key={tz.value} value={tz.value}>
                                        {tz.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_active">Estado del Departamento</Label>
                            <p className="text-sm text-muted-foreground">
                                {formData.is_active
                                    ? "El departamento está activo y puede recibir conversaciones"
                                    : "El departamento está inactivo y no recibirá nuevas conversaciones"}
                            </p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Color del Departamento</Label>
                        <div className="flex gap-2">
                            {["bg-brand-green", "bg-brand-teal", "bg-brand-gold", "bg-primary", "bg-blue-500", "bg-purple-500"].map(
                                (color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`h-10 w-10 rounded-full ${color} ${formData.color === color ? "ring-2 ring-offset-2 ring-foreground" : ""
                                            }`}
                                        onClick={() => setFormData({ ...formData, color })}
                                    />
                                ),
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.name}>
                        {department ? "Guardar Cambios" : "Crear Departamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
