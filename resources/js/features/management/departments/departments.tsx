import {useEffect, useState} from "react"
import { router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Users, Layers, Clock, Globe } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { type Department, TIMEZONES } from "@/types/department"
import { DepartmentFormDialog } from "./department-form-dialog"
import {Filters, PaginatedData } from "@/types";

const mockDepartments: Department[] = [
    {
        id: 1,
        name: "Ventas",
        description: "Equipo encargado de gestionar oportunidades comerciales y cerrar ventas",
        timezone: "America/Mexico_City",
        is_active: true,
        agentsCount: 5,
        agents: ["Ana García", "Carlos López", "María Rodríguez"],
        color: "bg-brand-green",
        company_id: 1,
    },
    {
        id: 2,
        name: "Soporte Técnico",
        description: "Resolución de problemas técnicos y asistencia a clientes",
        timezone: "America/Mexico_City",
        is_active: true,
        agentsCount: 8,
        agents: ["Juan Martínez", "Laura Sánchez", "Pedro Gómez"],
        color: "bg-brand-teal",
        company_id: 2
    },
    {
        id: 2,
        name: "Atención al Cliente",
        description: "Atención general y consultas de clientes",
        timezone: "America/New_York",
        is_active: true,
        agentsCount: 12,
        agents: ["Sofia Torres", "Diego Ruiz", "Carmen Díaz"],
        color: "bg-brand-gold",
        company_id: 2
    },
    {
        id: 2,
        name: "Facturación",
        description: "Gestión de pagos, facturas y consultas financieras",
        timezone: "America/Mexico_City",
        is_active: false,
        agentsCount: 3,
        agents: ["Roberto Fernández", "Isabel Castro"],
        color: "bg-primary",
        company_id: 3
    },
]

export function Departments({ departmentsData, filters }: {departmentsData: PaginatedData<Department[]>; filters: Filters;}) {
    const [departments, setDepartments] = useState<Department[]>(mockDepartments)
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingDepartment, setEditingDepartment] = useState<Department | undefined>()

    const filteredDepartments = departments.filter(
        (dept) =>
            dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dept.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleSaveDepartment = (departmentData: Partial<Department>) => {
        if (editingDepartment) {
            setDepartments((prev) => prev.map((d) => (d.id === editingDepartment.id ? { ...d, ...departmentData } : d)))
            setEditingDepartment(undefined)
        } else {
            const newDepartment: Department = {
                id: Number(departments.length + 1),
                name: departmentData.name!,
                description: departmentData.description,
                timezone: departmentData.timezone!,
                is_active: departmentData.is_active ?? true,
                agentsCount: 0,
                agents: [],
                color: departmentData.color!,
                company_id: 1,
            }
            setDepartments([...departments, newDepartment])
        }
        setIsCreateOpen(false)
    }

    const handleDeleteDepartment = (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este departamento?")) {
            setDepartments((prev) => prev.filter((d) => d.id !== id))
        }
    }

    const handleManageSchedule = (id: number) => {
        router.visit(`/management/departments/${id}`)
    }

    const getTimezoneLabel = (timezone: string) => {
        return TIMEZONES.find((tz) => tz.value === timezone)?.label || timezone
    }

    useEffect(() => {
        console.log(departmentsData)
        console.log(filters)
    }, [
        departmentsData,
        filters,
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">Departamentos</h1>
                    <p className="text-muted-foreground">Organiza tu equipo en departamentos especializados</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Departamento
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Buscar Departamentos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o descripción..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDepartments.map((department) => (
                    <Card key={department.id} className="relative overflow-hidden">
                        <div className={`absolute left-0 top-0 h-full w-1 ${department.color}`} />
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`rounded-lg p-2 ${department.color}`}>
                                        <Layers className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg">{department.name}</CardTitle>
                                            <Badge variant={department.is_active ? "default" : "secondary"}>
                                                {department.is_active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </div>
                                        <CardDescription className="mt-1">{department.description}</CardDescription>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEditingDepartment(department)
                                                setIsCreateOpen(true)
                                            }}
                                        >
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleManageSchedule(department.id)}>
                                            Gestionar Horarios
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Asignar Agentes</DropdownMenuItem>
                                        <DropdownMenuItem>Ver Métricas</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleDeleteDepartment(department.id)}
                                        >
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Globe className="h-4 w-4" />
                                <span>{getTimezoneLabel(department.timezone)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{department.agentsCount} agentes</span>
                                </div>
                                <Badge variant="secondary">{department.agentsCount > 5 ? "Grande" : "Pequeño"}</Badge>
                            </div>

                            {department.agents.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Agentes Asignados</div>
                                    <div className="flex -space-x-2">
                                        {department.agents.slice(0, 3).map((agent, index) => (
                                            <Avatar key={index} className="border-2 border-background">
                                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                    {agent
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {department.agentsCount > 3 && (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                                                +{department.agentsCount - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="w-full bg-transparent"
                                onClick={() => handleManageSchedule(department.id)}
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Gestionar Horarios
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <DepartmentFormDialog
                open={isCreateOpen}
                onOpenChange={(open) => {
                    setIsCreateOpen(open)
                    if (!open) setEditingDepartment(undefined)
                }}
                department={editingDepartment}
                onSave={handleSaveDepartment}
            />
        </div>
    )
}
