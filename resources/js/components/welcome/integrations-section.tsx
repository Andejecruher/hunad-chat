import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Instagram, Facebook, Send } from "lucide-react"

const integrations = [
    {
        name: "WhatsApp",
        icon: MessageCircle,
        description: "Múltiples líneas de WhatsApp Business",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
        name: "Instagram",
        icon: Instagram,
        description: "Direct Messages y comentarios",
        color: "text-pink-600 dark:text-pink-400",
        bgColor: "bg-pink-50 dark:bg-pink-950/20",
    },
    {
        name: "Facebook",
        icon: Facebook,
        description: "Messenger y comentarios de página",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
        name: "Telegram",
        icon: Send,
        description: "Bots y canales de atención",
        color: "text-sky-600 dark:text-sky-400",
        bgColor: "bg-sky-50 dark:bg-sky-950/20",
    },
]

export function IntegrationsSection() {
    return (
        <section id="integrations" className="py-20 lg:py-32 bg-muted/30">
            <div className="container m-auto">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance mb-4">
                        Integra tus canales de comunicación
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty mb-8">
                        Conecta todas tus plataformas de comunicación en minutos, no en semanas.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {integrations.map((integration, index) => (
                        <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-6 text-center">
                                <div
                                    className={`h-16 w-16 rounded-full ${integration.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                                >
                                    <integration.icon className={`h-8 w-8 ${integration.color}`} />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{integration.name}</h3>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-lg font-medium text-primary mb-4">⚡ Configuración en menos de 5 minutos</p>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                        Nuestro asistente de configuración te guía paso a paso para conectar todas tus cuentas y comenzar a recibir
                        mensajes inmediatamente.
                    </p>
                </div>
            </div>
        </section>
    )
}
