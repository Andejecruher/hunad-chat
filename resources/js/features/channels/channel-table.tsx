import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Channel } from '@/types'
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2, Edit2, Eye, MoreVertical, ToggleLeft, ToggleRight, Trash2, XCircle } from "lucide-react"

interface ChannelTableProps {
    channels: Channel[]
    onEditChannel: (channel: Channel) => void
    onDetailsClick: (channel: Channel) => void
    onDeleteChannel: (channelId: number) => void
    onChangeStatus: (channelId: number, status: 'active' | 'inactive') => void
}

export function ChannelTable({ channels, onDetailsClick, onEditChannel, onChangeStatus, onDeleteChannel }: ChannelTableProps) {

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "inactive":
                return <XCircle className="h-4 w-4 text-gray-500" />
            case "error":
                return <AlertCircle className="h-4 w-4 text-red-500" />
            default:
                return null
        }
    }

    return (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Plataforma</TableHead>
                        <TableHead>Creado el</TableHead>
                        <TableHead>Actualizado el</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {channels?.map((channel, idx) => (
                        <motion.tr
                            key={channel.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border-b hover:bg-muted/50 transition-colors"
                        >
                            <TableCell className="font-medium text-sm capitalize">
                                {channel.id}
                            </TableCell>
                            <TableCell className="text-sm capitalize">{channel.name}</TableCell>
                            <TableCell className="text-sm capitalize">{channel.type}</TableCell>
                            <TableCell className="text-sm">{new Date(channel.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-sm">{new Date(channel.updated_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(channel.status)}
                                    <Badge
                                        variant={channel.status === "active" ? "default" : "secondary"}
                                        className={
                                            channel.status === "active"
                                                ? "bg-brand-green"
                                                : channel.status === "inactive"
                                                    ? "bg-destructive"
                                                    : ""
                                        }
                                    >
                                        {channel.status === "active" ? "Activo" : channel.status === "inactive" ? "Inactivo" : "Error"}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onDetailsClick(channel)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Ver Detalles
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEditChannel(channel)}>
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        {channel.status === "active" ? (
                                            <DropdownMenuItem
                                                onClick={() => onChangeStatus(channel.id, 'inactive')}
                                                className="text-orange-600"
                                            >
                                                <ToggleLeft className="mr-2 h-4 w-4" />
                                                Deshabilitar Canal
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                onClick={async () => onChangeStatus(channel.id, 'active')}
                                                className="text-green-600"
                                            >
                                                <ToggleRight className="mr-2 h-4 w-4" />
                                                Habilitar Canal
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={async () => onDeleteChannel(channel.id)} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </motion.tr>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
