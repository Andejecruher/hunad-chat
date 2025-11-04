import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertCircle,
    BookOpen,
    CheckCircle,
    Clock,
    ExternalLink,
    Mail,
    MessageCircle,
    Phone,
    Search,
} from 'lucide-react';

export function Support() {
    const supportOptions = [
        {
            title: 'Centro de Ayuda',
            description:
                'Encuentra respuestas rápidas en nuestra base de conocimientos',
            icon: <BookOpen className="h-6 w-6" />,
            action: 'Explorar Artículos',
            available: '24/7',
        },
        {
            title: 'Chat en Vivo',
            description: 'Habla directamente con nuestro equipo de soporte',
            icon: <MessageCircle className="h-6 w-6" />,
            action: 'Iniciar Chat',
            available: 'Lun-Vie 9AM-6PM',
        },
        {
            title: 'Email',
            description: 'Envíanos tu consulta y te responderemos pronto',
            icon: <Mail className="h-6 w-6" />,
            action: 'Enviar Email',
            available: 'Respuesta en 24h',
        },
        {
            title: 'Llamada',
            description: 'Soporte telefónico para clientes Enterprise',
            icon: <Phone className="h-6 w-6" />,
            action: 'Programar Llamada',
            available: 'Solo Enterprise',
        },
    ];

    const popularArticles = [
        'Cómo configurar tu primera integración de WhatsApp',
        'Creando agentes IA con herramientas MCP personalizadas',
        'Gestión de departamentos y asignación de tickets',
        'Configuración de branding personalizado',
        'Métricas y reportes: guía completa',
        'Solución de problemas comunes de conectividad',
    ];

    const systemStatus = [
        { service: 'API Principal', status: 'operational', uptime: '99.9%' },
        {
            service: 'WhatsApp Integration',
            status: 'operational',
            uptime: '99.8%',
        },
        {
            service: 'Instagram Integration',
            status: 'maintenance',
            uptime: '99.5%',
        },
        { service: 'Dashboard', status: 'operational', uptime: '99.9%' },
    ];

    return (
        <main className="container mx-auto px-4 py-16" id="support">
            {/* Hero Section */}
            <div className="mb-16 text-center">
                <h1 className="mb-6 text-4xl font-bold text-balance md:text-5xl">
                    ¿Cómo podemos <span className="text-primary">ayudarte</span>
                    ?
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-xl text-pretty text-muted-foreground">
                    Estamos aquí para resolver tus dudas y ayudarte a aprovechar
                    al máximo tu plataforma omnicanal
                </p>

                {/* Search Bar */}
                <div className="relative mx-auto max-w-md">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                        placeholder="Buscar en la ayuda..."
                        className="h-12 pl-10"
                    />
                </div>
            </div>

            {/* Support Options */}
            <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {supportOptions.map((option, index) => (
                    <Card
                        key={index}
                        className="text-center transition-shadow hover:shadow-lg"
                    >
                        <CardHeader>
                            <div className="mb-4 flex justify-center">
                                <div className="rounded-full bg-primary/10 p-3 text-primary">
                                    {option.icon}
                                </div>
                            </div>
                            <CardTitle className="text-lg">
                                {option.title}
                            </CardTitle>
                            <CardDescription>
                                {option.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {option.available}
                            </div>
                            <Button
                                className="w-full bg-transparent"
                                variant="outline"
                            >
                                {option.action}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mb-16 grid gap-8 lg:grid-cols-3">
                {/* Popular Articles */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Artículos Populares
                            </CardTitle>
                            <CardDescription>
                                Los temas más consultados por nuestros usuarios
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {popularArticles.map((article, index) => (
                                    <div
                                        key={index}
                                        className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <span className="text-sm">
                                            {article}
                                        </span>
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
                            <CardDescription>
                                Monitoreo en tiempo real de nuestros servicios
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {systemStatus.map((service, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="text-sm font-medium">
                                                {service.service}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Uptime: {service.uptime}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                service.status === 'operational'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className={
                                                service.status === 'operational'
                                                    ? 'bg-green-500'
                                                    : 'bg-yellow-500'
                                            }
                                        >
                                            {service.status === 'operational'
                                                ? 'Operativo'
                                                : 'Mantenimiento'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                className="mt-4 w-full bg-transparent"
                                size="sm"
                            >
                                Ver Estado Completo
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Contact Form */}
            <Card className="mx-auto max-w-2xl">
                <CardHeader className="text-center">
                    <CardTitle>¿No encontraste lo que buscabas?</CardTitle>
                    <CardDescription>
                        Envíanos tu consulta y nuestro equipo te responderá
                        pronto
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Nombre
                            </label>
                            <Input placeholder="Tu nombre completo" />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Email
                            </label>
                            <Input type="email" placeholder="tu@empresa.com" />
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Asunto
                        </label>
                        <Input placeholder="¿En qué podemos ayudarte?" />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Mensaje
                        </label>
                        <Textarea
                            placeholder="Describe tu consulta con el mayor detalle posible..."
                            rows={4}
                        />
                    </div>
                    <Button className="w-full" size="lg">
                        Enviar Consulta
                    </Button>
                </CardContent>
            </Card>

            {/* Emergency Contact */}
            <div className="mt-12 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
                <AlertCircle className="mx-auto mb-4 h-8 w-8 text-red-500" />
                <h3 className="mb-2 font-semibold text-red-700 dark:text-red-400">
                    ¿Problema Crítico?
                </h3>
                <p className="mb-4 text-sm text-red-600 dark:text-red-300">
                    Para problemas que afecten tu operación, contacta nuestro
                    soporte de emergencia
                </p>
                <Button variant="destructive">Contacto de Emergencia</Button>
            </div>
        </main>
    );
}
