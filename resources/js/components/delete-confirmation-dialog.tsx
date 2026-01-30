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
import { AlertTriangle, Trash2 } from "lucide-react"

interface DeleteConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title?: string
    description?: string
    actionLabel?: string
}

export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "¿Eliminar elemento?",
    description = "Esta acción no se puede deshacer. El elemento será eliminado permanentemente del sistema.",
    actionLabel = "Eliminar"
}: DeleteConfirmationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader className="space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" aria-hidden="true" />
                    </div>
                    <div className="text-center">
                        <AlertDialogTitle className="text-xl font-semibold">
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="mt-3 text-base">
                            Esta acción <span className="font-semibold text-red-600 dark:text-red-500">no se puede deshacer</span>. {description}
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 sm:gap-2">
                    <AlertDialogCancel className="sm:flex-1">
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600 dark:bg-red-600 dark:hover:bg-red-700 sm:flex-1"
                    >
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        {actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
