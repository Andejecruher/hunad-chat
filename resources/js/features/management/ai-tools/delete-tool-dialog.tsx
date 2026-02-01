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
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface DeleteToolDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    toolName: string
    onConfirm: () => void
}

export function DeleteToolDialog({ open, onOpenChange, toolName, onConfirm }: DeleteToolDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleConfirm = async () => {
        setIsDeleting(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular API call
            onConfirm()
            toast.success("Herramienta eliminada", {
                description: `"${toolName}" ha sido eliminada correctamente`,
            })
            onOpenChange(false)
        } catch {
            toast.error("Error al eliminar", {
                description: "No se pudo eliminar la herramienta. Intenta nuevamente.",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la herramienta{" "}
                        <span className="font-semibold text-foreground">{toolName}</span> y todos los datos asociados a ella.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleConfirm()
                        }}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            "Eliminar"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
