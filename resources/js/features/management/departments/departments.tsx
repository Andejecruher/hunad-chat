import {useEffect, useState} from "react"
import { router } from "@inertiajs/react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {Plus, Search, MoreVertical, Users, Layers, Clock, Globe, Loader2} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { type Department, TIMEZONES } from "@/types/department"
import { DepartmentFormDialog } from "./department-form-dialog"
import {Filters, PaginatedData, type SharedData} from "@/types";
import { toast } from "sonner"
import departmentsRouter from "@/routes/departments"
import { toFormData } from '@/utils/form-data-utils';
import { usePage } from '@inertiajs/react';

export function Departments({ departmentsData, filters }: {departmentsData: PaginatedData<Department[]>; filters: Filters;}) {
    const { auth } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>(
        filters.status ?? 'all',
    );
    const [limitFilter, setLimitFilter] = useState<string>(
        filters.limit ?? '10',
    );
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingDepartment, setEditingDepartment] = useState<Department | undefined>()
    const [isLoading, setIsLoading] = useState(false)


    const handleSaveDepartment = (department: Partial<Department>) => {
        if (editingDepartment && department && department.id) {
            const payload = toFormData(department, 'PUT');
            // Añadimos el método PUT
            router.post(departmentsRouter.update(department.id).url, payload, {
                preserveState: true,
                preserveScroll: true,
                forceFormData: true,
                onStart: () => setIsLoading(true),
                onSuccess: () => {
                    setIsLoading(false);
                    toast.success('Department updated successfully.');
                },
                onError: (error) => {
                    toast.error(error.message);
                    setIsLoading(false);
                },
                onFinish: () => {
                    setIsLoading(false)
                    setEditingDepartment(undefined)
                },
            });
        } else {
            const newDepartment = {
                name: department.name!,
                description: department.description,
                timezone: department.timezone!,
                is_active: department.is_active ?? true,
                agentsCount: 0,
                agents: [],
                color: department.color!,
                company_id: auth.user.company_id,
            }
            // Añadimos el método PUT
            router.post(departmentsRouter.store().url, newDepartment, {
                preserveState: true,
                preserveScroll: true,
                forceFormData: true,
                onStart: () => setIsLoading(true),
                onSuccess: () => {
                    setIsLoading(false);
                    toast.success('Department created successfully.');
                },
                onError: (error) => {
                    toast.error(error.message);
                    setIsLoading(false);
                },
                onFinish: () => {
                    setIsLoading(false)
                    setEditingDepartment(undefined)
                },
            });
        }
        setIsCreateOpen(false)
    }

    const handleDeleteDepartment = (id?: number) => {
        if (!id) return;
        setIsLoading(true);
        router.delete(departmentsRouter.destroy(id).url, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setIsLoading(true),
            onSuccess: () => {
                setIsLoading(false);
                toast.warning('Department deleted successfully.');
            },
            onError: (error   ) => {
                toast.error(error.message);
                setIsLoading(false)
            },
            onFinish: () => setIsLoading(false),
        });
    }

    const handleManageSchedule = (id?: number) => {
        if (!id) return;
        router.visit(departmentsRouter.show({id: id}).url)
    }

    const getTimezoneLabel = (timezone: string) => {
        return TIMEZONES.find((tz) => tz.value === timezone)?.label || timezone
    }

    useEffect(()=>{
        // Debounce para búsqueda
        const handler = setTimeout(() => {
            const params = {
                search: searchQuery,
                limit: limitFilter,
                status: statusFilter,
            };
            const url = departmentsRouter.index.url({ query: params });
            router.get(
                url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['departments'],
                    onStart: () => setIsLoading(true),
                    onError: (error) => {
                        toast.error(error.message);
                        setIsLoading(false);
                    },
                    onFinish: () => setIsLoading(false),
                },
            );
        }, 300);

        return () => clearTimeout(handler);
    },[searchQuery, statusFilter, limitFilter])

    useEffect(()=>{

    },[editingDepartment])
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">Departamentos</h1>
                    <p className="text-muted-foreground">Organiza tu equipo en departamentos especializados</p>
                </div>
                <Button onClick={() => {
                    setEditingDepartment(undefined)
                    setIsCreateOpen(true)
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Departamento
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Buscar Departamentos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 xl:flex-row">
                        <div className="relative block flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o descripción..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-full xl:w-40">
                                <SelectValue placeholder="Estatus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos los estatus
                                </SelectItem>
                                <SelectItem value="true">Activo</SelectItem>
                                <SelectItem value="false">
                                    Inactivo
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={limitFilter.toString()}
                            onValueChange={setLimitFilter}
                        >
                            <SelectTrigger className="w-full xl:w-40">
                                <SelectValue placeholder="Items Por Pagina" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="all">Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {isLoading && (
                    <div className="flex items-center justify-center py-4 text-gray-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Cargando departamentos...
                    </div>
                )}

                {!isLoading && departmentsData.data && departmentsData.data.map((department) => (
                    <Card key={department.id} className="relative overflow-hidden flex flex-col h-full">
                        <div className={`absolute left-0 top-0 h-full w-1 ${department.color}`} />
                        <CardHeader className="flex-1">
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
                                        {/*<DropdownMenuItem>Asignar Agentes</DropdownMenuItem>*/}
                                        {/*<DropdownMenuItem>Ver Métricas</DropdownMenuItem>*/}
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
