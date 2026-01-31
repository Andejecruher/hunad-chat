import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Code, MoreVertical, Plus, Search, Settings, XCircle } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Code, MoreVertical, Plus, Search, Settings, XCircle, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { type Tool, type PaginatedData } from "@/types"
import { router } from '@inertiajs/react'
import { toast } from "sonner"
import { ToolFilter } from "./tool-filter"
import { DeleteToolDialog } from "./delete-tool-dialog"

interface ToolFilters {
    search?: string;
    status?: string;
    type?: string;
    category?: string;
    limit?: string;
}

interface AIToolsListProps {
    toolsData: PaginatedData<Tool[]>;
    filters: ToolFilters;
    categories: string[];
}

export function AIToolsList({ toolsData, filters, categories }: AIToolsListProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || "")
    const [statusFilter, setStatusFilter] = useState(filters.status || "all")
    const [typeFilter, setTypeFilter] = useState(filters.type || "all")
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; tool: Tool | null }>({
        open: false,
        tool: null,
    })

    const handleSearch = (value: string) => {
        setSearchQuery(value)
        router.get(window.location.pathname, { ...filters, search: value || undefined }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleStatusChange = (value: string) => {
        setStatusFilter(value)
        router.get(window.location.pathname, { ...filters, status: value === 'all' ? undefined : value }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleTypeChange = (value: string) => {
        setTypeFilter(value)
        router.get(window.location.pathname, { ...filters, type: value === 'all' ? undefined : value }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleClearFilters = () => {
        setSearchQuery("")
        setStatusFilter("all")
        setTypeFilter("all")
        router.get(window.location.pathname, {}, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleToggleStatus = (tool: Tool) => {
        router.patch(`/configurations/ia-tools/${tool.id}/toggle-status`, {}, {
            preserveState: true,
            onSuccess: () => {
                toast.success(`Herramienta ${tool.enabled ? 'deshabilitada' : 'habilitada'} exitosamente`)
            },
            onError: () => {
                toast.error("Error al cambiar el estado de la herramienta")
            }
        })
    }

    const handleEdit = (tool: Tool) => {
        router.visit(`/configurations/ia-tools/${tool.id}/edit`)
    }

    const handleDelete = (tool: Tool) => {
        setDeleteDialog({ open: true, tool })
    }

    const confirmDelete = () => {
        if (!deleteDialog.tool) return

        router.delete(`/configurations/ia-tools/${deleteDialog.tool.id}`, {
            preserveState: true,
            onSuccess: () => {
                toast.success("Herramienta eliminada exitosamente")
                setDeleteDialog({ open: false, tool: null })
            },
            onError: () => {
                toast.error("Error al eliminar la herramienta")
            }
        })
    }

    const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || typeFilter !== "all"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Herramientas de IA</h1>
                    <p className="text-muted-foreground">
                        Gestiona las herramientas disponibles para tus agentes de IA
                    </p>
                </div>
                <Button
                    onClick={() => router.visit('/configurations/ia-tools/create')}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Crear Herramienta
                </Button>
            </div>

            {/* Filters */}
            <ToolFilter
                searchQuery={searchQuery}
                onSearchChange={handleSearch}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                typeFilter={typeFilter}
                onTypeChange={handleTypeChange}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
            />

            {/* Tools Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {toolsData.data.map((tool) => (
                    <Card key={tool.id} className="relative">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={tool.type === 'internal' ? 'default' : 'secondary'}>
                                            {tool.type === 'internal' ? 'Interno' : 'Externo'}
                                        </Badge>
                                        <Badge 
                                            variant={tool.enabled ? 'default' : 'destructive'}
                                            className={tool.enabled ? 'bg-green-100 text-green-800' : ''}
                                        >
                                            {tool.enabled ? (
                                                <>
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Activa
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                    Inactiva
                                                </>
                                            )}
                                        </Badge>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleEdit(tool)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => handleToggleStatus(tool)}
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            {tool.enabled ? 'Deshabilitar' : 'Habilitar'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            onClick={() => handleDelete(tool)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                {tool.description || 'Sin descripción'}
                            </CardDescription>
                            
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Categoría:</span>
                                    <Badge variant="outline">{tool.category}</Badge>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Ejecuciones:</span>
                                    <span className="font-medium">{tool.executions?.length || 0}</span>
                                </div>
                                
                                {tool.executions && tool.executions.length > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Última ejecución:</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(tool.executions[0].created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {toolsData.data.length === 0 && (
                <Card className="py-12">
                    <CardContent className="text-center">
                        <Code className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No hay herramientas disponibles</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {hasActiveFilters 
                                ? "No se encontraron herramientas con los filtros aplicados."
                                : "Comienza creando tu primera herramienta de IA."
                            }
                        </p>
                        {!hasActiveFilters && (
                            <Button
                                className="mt-4"
                                onClick={() => router.visit('/configurations/ia-tools/create')}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Crear primera herramienta
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Delete Dialog */}
            <DeleteToolDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, tool: open ? deleteDialog.tool : null })}
                toolName={deleteDialog.tool?.name || ""}
                onConfirm={confirmDelete}
            />
        </div>
    )
}
        if (!newTool.name || !newTool.endpoint) return

        const tool: AITool = {
            id: String(tools.length + 1),
            name: newTool.name,
            description: newTool.description,
            endpoint: newTool.endpoint,
            protocol: newTool.protocol,
            status: "active",
            usageCount: 0,
            lastUsed: "Nunca",
        }

        setTools([...tools, tool])
        setNewTool({ name: "", description: "", endpoint: "", protocol: "MCP" })
        setIsCreateOpen(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-brand-green text-white">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Activo
                    </Badge>
                )
            case "inactive":
                return (
                    <Badge variant="secondary">
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactivo
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getProtocolBadge = (protocol: string) => {
        const colors = {
            MCP: "bg-brand-teal",
            REST: "bg-brand-gold",
            GraphQL: "bg-primary",
        }
        return <Badge className={`${colors[protocol as keyof typeof colors]} text-white`}>{protocol}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">Herramientas IA</h1>
                    <p className="text-muted-foreground">Configura herramientas personalizadas para tus agentes de IA</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Herramienta
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Agregar Nueva Herramienta</DialogTitle>
                            <DialogDescription>
                                Configura una nueva herramienta que los agentes de IA podrán usar mediante protocolo MCP
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="toolName">Nombre de la Herramienta</Label>
                                <Input
                                    id="toolName"
                                    placeholder="Ej: Knowledge Base Search"
                                    value={newTool.name}
                                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe qué hace esta herramienta..."
                                    value={newTool.description}
                                    onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endpoint">Endpoint / URL</Label>
                                <Input
                                    id="endpoint"
                                    placeholder="https://api.empresa.com/tool"
                                    value={newTool.endpoint}
                                    onChange={(e) => setNewTool({ ...newTool, endpoint: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Protocolo</Label>
                                <div className="flex gap-2">
                                    {(["MCP", "REST", "GraphQL"] as const).map((protocol) => (
                                        <Button
                                            key={protocol}
                                            type="button"
                                            variant={newTool.protocol === protocol ? "default" : "outline"}
                                            onClick={() => setNewTool({ ...newTool, protocol })}
                                            className="flex-1"
                                        >
                                            {protocol}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCreateTool}>Agregar Herramienta</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Buscar Herramientas</CardTitle>
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

            <div className="space-y-4">
                {filteredTools.map((tool) => (
                    <Card key={tool.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="rounded-lg p-3 bg-brand-teal/10">
                                        <Code className="h-6 w-6 text-brand-teal" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CardTitle className="text-xl">{tool.name}</CardTitle>
                                            {getStatusBadge(tool.status)}
                                            {getProtocolBadge(tool.protocol)}
                                        </div>
                                        <CardDescription className="text-base">{tool.description}</CardDescription>
                                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                <span>Endpoint: {tool.endpoint}</span>
                                            </div>
                                        </div>
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
                                        <DropdownMenuItem>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Configurar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Ver Documentación</DropdownMenuItem>
                                        <DropdownMenuItem>Probar Herramienta</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>{tool.status === "active" ? "Desactivar" : "Activar"}</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-sm text-muted-foreground">Usos Totales</div>
                                    <div className="text-2xl font-bold">{tool.usageCount.toLocaleString()}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm text-muted-foreground">Último Uso</div>
                                    <div className="text-lg font-semibold">{tool.lastUsed}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

