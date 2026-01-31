import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface ToolFilterProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusChange: (value: string) => void
    typeFilter: string
    onTypeChange: (value: string) => void
    onClearFilters: () => void
    hasActiveFilters: boolean
}

export function ToolFilter({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    typeFilter,
    onTypeChange,
    onClearFilters,
    hasActiveFilters,
}: ToolFilterProps) {
    return (
        <div className="space-y-4 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filtros</h3>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Limpiar
                    </Button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="search"
                            placeholder="Buscar herramientas..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={typeFilter} onValueChange={onTypeChange}>
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="internal">Interna</SelectItem>
                            <SelectItem value="external">Externa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
