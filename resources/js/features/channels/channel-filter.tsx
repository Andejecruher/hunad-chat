import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface ChannelFilterProps {
    onSearchChange: (search: string) => void
    onStatusChange: (status: string) => void
    onPlatformChange: (platform: string) => void
    onLimitChange: (limit: string) => void
    searchValue: string
    statusValue: string
    platformValue: string
    limitValue: string
}

export function ChannelFilter({
    onSearchChange,
    onStatusChange,
    onPlatformChange,
    onLimitChange,
    limitValue,
    searchValue,
    statusValue,
    platformValue,
}: ChannelFilterProps) {

    return (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o ID..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Select value={platformValue} onValueChange={onPlatformChange}>
                <SelectTrigger className="w-full xl:w-52">
                    <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las plataformas</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                </SelectContent>
            </Select>

            <Select value={statusValue} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full xl:w-40">
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                </SelectContent>
            </Select>
            <Select
                value={limitValue.toString()}
                onValueChange={onLimitChange}
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
    )
}
