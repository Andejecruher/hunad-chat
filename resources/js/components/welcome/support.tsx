import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    BookOpen,
    MessageCircle,
    Mail,
    Phone,
    Clock,
    CheckCircle,
    AlertCircle,
    Search,
    ExternalLink,
} from "lucide-react"

export function Support() {
    const supportOptions = [
        {
            title: "Centro de Ayuda",
            description: "Encuentra respuestas rápidas en nuestra base de conocimientos",
            icon: <BookOpen className="h-6 w-6" />,
            action: "Explorar Artículos",
            available: "24/7",
        },
        {
            title: "Chat en Vivo",
            description: "Habla directamente con nuestro equipo de soporte",
            icon: <MessageCircle className="h-6 w-6" />,
            action: "Iniciar Chat",
            available: "Lun-Vie 9AM-6PM",
        },
        {
            title: "Email",
            description: "Envíanos tu consulta y te responderemos pronto",
            icon: <Mail className="h-6 w-6" />,
            action: "Enviar Email",
            available: "Respuesta en 24h",
        },
        {
            title: "Llamada",
            description: "Soporte telefónico para clientes Enterprise",
            icon: <Phone className="h-6 w-6" />,
            action: "Programar Llamada",
            available: "Solo Enterprise",
        },
    ]

    const popularArticles = [
        "Cómo configurar tu primera integración de WhatsApp",
        "Creando agentes IA con herramientas MCP personalizadas",
        "Gestión de departamentos y asignación de tickets",
        "Configuración de branding personalizado",
        "Métricas y reportes: guía completa",
        "Solución de problemas comunes de conectividad",
    ]

    const systemStatus = [
        { service: "API Principal", status: "operational", uptime: "99.9%" },
        { service: "WhatsApp Integration", status: "operational", uptime: "99.8%" },
        { service: "Instagram Integration", status: "maintenance", uptime: "99.5%" },
        { service: "Dashboard", status: "operational", uptime: "99.9%" },
    ]

    return (
        <main className="container mx-auto px-4 py-16">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                    ¿Cómo podemos <span className="text-primary">ayudarte</span>?
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty mb-8">
                    Estamos aquí para resolver tus dudas y ayudarte a aprovechar al máximo tu plataforma omnicanal
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Buscar en la ayuda..." className="pl-10 h-12" />
                </div>
            </div>

            {/* Support Options */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {supportOptions.map((option, index) => (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-primary/10 text-primary">{option.icon}</div>
                            </div>
                            <CardTitle className="text-lg">{option.title}</CardTitle>
                            <CardDescription>{option.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {option.available}
                            </div>
                            <Button className="w-full bg-transparent" variant="outline">
                                {option.action}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
                {/* Popular Articles */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Artículos Populares
                            </CardTitle>
                            <CardDescription>Los temas más consultados por nuestros usuarios</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {popularArticles.map((article, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                    >
                                        <span className="text-sm">{article}</span>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Status */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Estado del Sistema
                            </CardTitle>
                            <CardDescription>Monitoreo en tiempo real de nuestros servicios</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {systemStatus.map((service, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-sm">{service.service}</div>
                                            <div className="text-xs text-muted-foreground">Uptime: {service.uptime}</div>
                                        </div>
                                        <Badge
                                            variant={service.status === "operational" ? "default" : "secondary"}
                                            className={service.status === "operational" ? "bg-green-500" : "bg-yellow-500"}
                                        >
                                            {service.status === "operational" ? "Operativo" : "Mantenimiento"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4 bg-transparent" size="sm">
                                Ver Estado Completo
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Contact Form */}
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle>¿No encontraste lo que buscabas?</CardTitle>
                    <CardDescription>Envíanos tu consulta y nuestro equipo te responderá pronto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Nombre</label>
                            <Input placeholder="Tu nombre completo" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Email</label>
                            <Input type="email" placeholder="tu@empresa.com" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Asunto</label>
                        <Input placeholder="¿En qué podemos ayudarte?" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Mensaje</label>
                        <Textarea placeholder="Describe tu consulta con el mayor detalle posible..." rows={4} />
                    </div>
                    <Button className="w-full" size="lg">
                        Enviar Consulta
                    </Button>
                </CardContent>
            </Card>

            {/* Emergency Contact */}
            <div className="text-center mt-12 p-6 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">¿Problema Crítico?</h3>
                <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                    Para problemas que afecten tu operación, contacta nuestro soporte de emergencia
                </p>
                <Button variant="destructive">Contacto de Emergencia</Button>
            </div>
        </main>
    )
}
