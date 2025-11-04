import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Instagram, MessageCircle, Send } from 'lucide-react';

const integrations = [
    {
        name: 'WhatsApp',
        icon: MessageCircle,
        description: 'Múltiples líneas de WhatsApp Business',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
        name: 'Instagram',
        icon: Instagram,
        description: 'Direct Messages y comentarios',
        color: 'text-pink-600 dark:text-pink-400',
        bgColor: 'bg-pink-50 dark:bg-pink-950/20',
    },
    {
        name: 'Facebook',
        icon: Facebook,
        description: 'Messenger y comentarios de página',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
        name: 'Telegram',
        icon: Send,
        description: 'Bots y canales de atención',
        color: 'text-sky-600 dark:text-sky-400',
        bgColor: 'bg-sky-50 dark:bg-sky-950/20',
    },
];

export function IntegrationsSection() {
    return (
        <section id="integrations" className="bg-muted/30 py-20 lg:py-32">
            <div className="container m-auto">
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                        Integra tus canales de comunicación
                    </h2>
                    <p className="mb-8 text-lg text-pretty text-muted-foreground">
                        Conecta todas tus plataformas de comunicación en
                        minutos, no en semanas.
                    </p>
                </div>

                <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {integrations.map((integration, index) => (
                        <Card
                            key={index}
                            className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            <CardContent className="p-6 text-center">
                                <div
                                    className={`h-16 w-16 rounded-full ${integration.bgColor} mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110`}
                                >
                                    <integration.icon
                                        className={`h-8 w-8 ${integration.color}`}
                                    />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">
                                    {integration.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {integration.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <p className="mb-4 text-lg font-medium text-primary">
                        ⚡ Configuración en menos de 5 minutos
                    </p>
                    <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
                        Nuestro asistente de configuración te guía paso a paso
                        para conectar todas tus cuentas y comenzar a recibir
                        mensajes inmediatamente.
                    </p>
                </div>
            </div>
        </section>
    );
}
