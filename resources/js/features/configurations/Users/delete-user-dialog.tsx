// resources/js/features/configurations/Users/delete-user-dialog.tsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserX } from "lucide-react"
import { User } from '@/types';

interface DeleteUserDialogProps {
    user: User
    open: boolean
    onOpenChange: (open: boolean) => void
    onDelete: (userId: number) => void
}

export function DeleteUserDialog({ user, open, onOpenChange, onDelete }: DeleteUserDialogProps) {
    const handleDelete = () => {
        onDelete(user.id)
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <UserX className="h-5 w-5 text-destructive" />
                        Eliminar Usuario
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar a <strong>{user.name}</strong> ({user.email})?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="mt-4 text-sm text-muted-foreground">
                    <p className="mb-2">Esta acción no se puede deshacer. Se eliminarán:</p>
                    <ul className="list-inside list-disc space-y-1">
                        <li>Todos los datos del usuario</li>
                        <li>Historial de conversaciones asignadas</li>
                        <li>Estadísticas y métricas asociadas</li>
                    </ul>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Eliminar Usuario
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
