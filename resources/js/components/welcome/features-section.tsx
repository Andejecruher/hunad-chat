import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Bot, Ticket, Palette, BarChart3, Zap } from "lucide-react"

const features = [
    {
        icon: Target,
        title: "Atención Omnicanal",
        description: "WhatsApp, Instagram, Facebook y Telegram en un solo lugar. Centraliza todas tus conversaciones.",
    },
    {
        icon: Bot,
        title: "Agentes Híbridos",
        description: "Combina la eficiencia de la IA con la calidez humana. Escalado automático según la complejidad.",
    },
    {
        icon: Ticket,
        title: "Tickets y Ventas",
        description: "Gestión completa de tickets, seguimiento de ventas y métricas de conversión en tiempo real.",
    },
    {
        icon: Palette,
        title: "Personalización Total",
        description: "Branding único para cada compañía. Colores, logos y experiencia completamente personalizable.",
    },
    {
        icon: BarChart3,
        title: "Métricas en Tiempo Real",
        description: "Dashboards intuitivos con reportes detallados de rendimiento y satisfacción del cliente.",
    },
    {
        icon: Zap,
        title: "Herramientas MCP",
        description: "Crea agentes de IA personalizados con herramientas específicas usando el protocolo MCP.",
    },
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-20 lg:py-32">
            <div className="container m-auto">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance mb-4">
                        Todo lo que necesitas para centralizar tu atención
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Una plataforma completa que transforma la manera en que tu empresa se comunica con sus clientes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
