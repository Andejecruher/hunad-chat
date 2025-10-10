import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Wrench, Zap, Code } from "lucide-react"

export function AIAgentsSection() {
    return (
        <section className="py-20 lg:py-32">
            <div className="container m-auto">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance mb-4">
                        Agentes de IA con herramientas personalizadas
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Crea tus propios agentes de IA con herramientas específicas usando el protocolo MCP. Potencia infinita,
                        control total.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <Card className="border-primary/20">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Brain className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Agentes Inteligentes</CardTitle>
                                        <Badge variant="secondary" className="mt-1">
                                            IA + Humanos
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    Combina la velocidad de la IA con la empatía humana. Escalado automático según la complejidad de cada
                                    conversación.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-secondary/20">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                                        <Wrench className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Herramientas MCP</CardTitle>
                                        <Badge variant="outline" className="mt-1">
                                            Protocolo Abierto
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    Conecta APIs, bases de datos, CRMs y cualquier herramienta que necesites. Tus agentes pueden hacer
                                    mucho más que solo chatear.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="relative">
                        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Code className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">Ejemplo de Agente</span>
                                    </div>
                                    <Badge className="bg-primary/10 text-primary border-primary/20">
                                        <Zap className="h-3 w-3 mr-1" />
                                        Activo
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-background/50 rounded-lg p-4 border">
                                    <p className="text-sm font-medium mb-2">🤖 Agente de Ventas</p>
                                    <p className="text-sm text-muted-foreground">
                                        "Hola! Veo que estás interesado en nuestro producto. Déjame consultar tu historial y preparar una
                                        oferta personalizada..."
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        📊 Consultar CRM
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        💰 Calcular descuentos
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        📧 Enviar propuesta
                                    </Badge>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Este agente puede acceder a tu CRM, calcular precios dinámicos y generar propuestas automáticamente.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
