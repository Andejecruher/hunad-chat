import { Pagination } from '@/components/pagination'
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
import aiTools from "@/routes/ai-tools"
import { type PaginatedData, type Tool } from "@/types"
import { router } from '@inertiajs/react'
import { CheckCircle2, Code, Edit, Eye, MoreVertical, Plus, Settings, Trash2, XCircle } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { DeleteToolDialog } from "./delete-tool-dialog"
import { ToolFilter } from "./tool-filter"

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

export function AIToolsList({ toolsData, filters }: AIToolsListProps) {
    const getUrl = (route: unknown, params?: unknown) => {
        try {
            if (!route) return ''
            if (typeof route === 'function') {
                const res = params !== undefined ? route(params) : route()
                if (!res) return ''
                return typeof res === 'string' ? res : (res as { url?: string }).url ?? String(res)
            }
            if (typeof route === 'object') return (route as { url?: string }).url ?? String(route)
            return String(route)
        } catch {
            return String(route)
        }
    }
    const [searchQuery, setSearchQuery] = useState(filters.search || "")
    const [statusFilter, setStatusFilter] = useState(filters.status || "all")
    const [typeFilter, setTypeFilter] = useState(filters.type || "all")
    const [limitFilter, setLimitFilter] = useState(filters.limit ?? '15')
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; tool: Tool | null }>({
        open: false,
        tool: null,
    })

    const handleSearch = (value: string) => {
        setSearchQuery(value)
        router.get(getUrl(aiTools.index), { ...filters, search: value || undefined }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleStatusChange = (value: string) => {
        setStatusFilter(value)
        router.get(getUrl(aiTools.index), { ...filters, status: value === 'all' ? undefined : value }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleTypeChange = (value: string) => {
        setTypeFilter(value)
        router.get(getUrl(aiTools.index), { ...filters, type: value === 'all' ? undefined : value }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleLimitChange = (value: string) => {
        setLimitFilter(value)
        router.get(getUrl(aiTools.index), { ...filters, limit: value === 'all' ? undefined : value }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleClearFilters = () => {
        setSearchQuery("")
        setStatusFilter("all")
        setTypeFilter("all")
        setLimitFilter(filters.limit ?? '15')
        router.get(getUrl(aiTools.index), {}, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleToggleStatus = (tool: Tool) => {
        router.patch(getUrl(aiTools.toggleStatus, tool.id), {}, {
            preserveState: true,
            onSuccess: () => {
                toast.success(`Herramienta ${!tool.enabled ? 'habilitada' : 'deshabilitada'} exitosamente`)
            },
            onError: () => {
                toast.error("Error al cambiar el estado de la herramienta")
            }
        })
    }

    const handleViewTool = (tool: Tool) => {
        router.visit(getUrl(aiTools.show, tool.id))
    }

    const handleEdit = (tool: Tool) => {
        router.visit(getUrl(aiTools.edit, tool.id))
    }

    const handleDelete = (tool: Tool) => {
        setDeleteDialog({ open: true, tool })
    }

    const confirmDelete = () => {
        if (!deleteDialog.tool) return

        router.delete(getUrl(aiTools.destroy, deleteDialog.tool.id), {
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

    const handlePageChange = useCallback((url?: string) => {
        if (!url) return
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['tools', 'flash'],
        })
    }, [])

    const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || typeFilter !== "all" || limitFilter !== (filters.limit ?? '15')

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
                    onClick={() => router.visit(getUrl(aiTools.create))}
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
                limitFilter={limitFilter}
                onLimitChange={handleLimitChange}
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
                                        <DropdownMenuItem onClick={() => handleViewTool(tool)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Ver
                                        </DropdownMenuItem>
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
                                    <span className="text-muted-foreground">Type:</span>
                                    <Badge variant="outline">{tool.type}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">category:</span>
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

            {/* Pagination */}
            {toolsData.links && toolsData.data.length > 0 && (
                <div>
                    <Pagination
                        links={toolsData.links}
                        onChange={handlePageChange}
                        showInfo={true}
                        position="center"
                        to={toolsData.to}
                        from={toolsData.from}
                        total={toolsData.total}
                    />
                </div>
            )}

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
                                onClick={() => router.visit(getUrl(aiTools.create))}
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