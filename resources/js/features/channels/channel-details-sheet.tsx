"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Channel } from '@/types'
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface ChannelDetailsSheetProps {
    channel: Channel
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function ChannelDetailsSheet({ channel, isOpen, onOpenChange }: ChannelDetailsSheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-2xl">{channel?.name}</SheetTitle>
                    <SheetDescription>{channel?.description}</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Información</TabsTrigger>
                            <TabsTrigger value="metrics">Métricas</TabsTrigger>
                            <TabsTrigger value="rules">Reglas</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Estado del Canal</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Estado</span>
                                        <Badge
                                            variant={channel?.status === "active" ? "default" : "secondary"}
                                            className={
                                                channel?.status === "active"
                                                    ? "bg-brand-green"
                                                    : channel?.status === "inactive"
                                                        ? "bg-destructive"
                                                        : ""
                                            }
                                        >
                                            {channel?.status === "active" ? (
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                            ) : (
                                                <AlertCircle className="mr-1 h-3 w-3" />
                                            )}
                                            {channel?.status === "active" ? "Activo" : channel?.status === "inactive" ? "Inactivo" : "Error"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-3">
                                        <span className="text-sm text-muted-foreground">Verificado</span>
                                        <Badge variant="outline">{channel?.status === "active" ? "Sí" : "No"}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-3">
                                        <span className="text-sm text-muted-foreground">Creado el</span>
                                        <span className="text-sm font-medium">{channel?.created_at}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 bg-transparent">
                            Descargar Reporte
                        </Button>
                        <Button className="flex-1 bg-brand-primary">Editar Canal</Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
