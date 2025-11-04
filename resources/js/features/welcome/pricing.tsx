import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Building2, Check, Star, Zap } from 'lucide-react';

export function Pricing() {
    const plans = [
        {
            name: 'Starter',
            price: '$29',
            period: '/mes',
            description:
                'Perfecto para pequeñas empresas que inician con atención omnicanal',
            icon: <Zap className="h-6 w-6" />,
            features: [
                'Hasta 2 canales de comunicación',
                '1 agente humano incluido',
                'Agente IA básico',
                '100 conversaciones/mes',
                'Soporte por email',
                'Dashboard básico',
            ],
            popular: false,
        },
        {
            name: 'Professional',
            price: '$89',
            period: '/mes',
            description:
                'Ideal para empresas en crecimiento con múltiples canales',
            icon: <Star className="h-6 w-6" />,
            features: [
                'Todos los canales disponibles',
                'Hasta 5 agentes humanos',
                'Agentes IA avanzados con MCP',
                '1,000 conversaciones/mes',
                'Herramientas personalizadas',
                'Branding personalizado',
                'Métricas avanzadas',
                'Soporte prioritario',
            ],
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Personalizado',
            period: '',
            description: 'Solución completa para grandes organizaciones',
            icon: <Building2 className="h-6 w-6" />,
            features: [
                'Canales ilimitados',
                'Agentes ilimitados',
                'IA personalizada con MCP',
                'Conversaciones ilimitadas',
                'Integración API completa',
                'SSO y seguridad avanzada',
                'Soporte dedicado 24/7',
                'Implementación personalizada',
            ],
            popular: false,
        },
    ];

    return (
        <main className="container mx-auto px-4 py-16" id="pricing">
            {/* Hero Section */}
            <div className="mb-16 text-center">
                <h1 className="mb-6 text-4xl font-bold text-balance md:text-5xl">
                    Planes que se adaptan a tu{' '}
                    <span className="text-primary">crecimiento</span>
                </h1>
                <p className="mx-auto max-w-2xl text-xl text-pretty text-muted-foreground">
                    Desde startups hasta grandes empresas, tenemos el plan
                    perfecto para centralizar tu atención al cliente
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="mx-auto mb-16 grid max-w-6xl gap-8 md:grid-cols-3">
                {plans.map((plan, index) => (
                    <Card
                        key={index}
                        className={`relative ${plan.popular ? 'scale-105 border-primary shadow-lg' : ''}`}
                    >
                        {plan.popular && (
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-primary">
                                Más Popular
                            </Badge>
                        )}

                        <CardHeader className="pb-8 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="rounded-full bg-primary/10 p-3 text-primary">
                                    {plan.icon}
                                </div>
                            </div>
                            <CardTitle className="text-2xl">
                                {plan.name}
                            </CardTitle>
                            <CardDescription className="text-sm">
                                {plan.description}
                            </CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">
                                    {plan.price}
                                </span>
                                <span className="text-muted-foreground">
                                    {plan.period}
                                </span>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <ul className="space-y-3">
                                {plan.features.map((feature, featureIndex) => (
                                    <li
                                        key={featureIndex}
                                        className="flex items-center gap-3"
                                    >
                                        <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                                        <span className="text-sm">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={plan.popular ? 'default' : 'outline'}
                                size="lg"
                            >
                                {plan.name === 'Enterprise'
                                    ? 'Contactar Ventas'
                                    : 'Comenzar Ahora'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="mx-auto max-w-3xl">
                <h2 className="mb-12 text-center text-3xl font-bold">
                    Preguntas Frecuentes
                </h2>
                <div className="space-y-6">
                    <div className="rounded-lg border p-6">
                        <h3 className="mb-2 font-semibold">
                            ¿Puedo cambiar de plan en cualquier momento?
                        </h3>
                        <p className="text-muted-foreground">
                            Sí, puedes actualizar o reducir tu plan en cualquier
                            momento. Los cambios se reflejan en tu próxima
                            facturación.
                        </p>
                    </div>
                    <div className="rounded-lg border p-6">
                        <h3 className="mb-2 font-semibold">
                            ¿Qué incluye el soporte prioritario?
                        </h3>
                        <p className="text-muted-foreground">
                            Respuesta garantizada en menos de 2 horas, acceso a
                            chat en vivo y llamadas de soporte técnico.
                        </p>
                    </div>
                    <div className="rounded-lg border p-6">
                        <h3 className="mb-2 font-semibold">
                            ¿Hay límites en las integraciones personalizadas?
                        </h3>
                        <p className="text-muted-foreground">
                            En el plan Professional puedes crear hasta 10
                            herramientas MCP. En Enterprise no hay límites.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="mt-16 rounded-2xl bg-primary/5 p-8 text-center">
                <h2 className="mb-4 text-2xl font-bold">
                    ¿Necesitas ayuda para elegir?
                </h2>
                <p className="mb-6 text-muted-foreground">
                    Nuestro equipo puede ayudarte a encontrar el plan perfecto
                    para tu empresa
                </p>
                <Button size="lg">Solicitar Consulta Gratuita</Button>
            </div>
        </main>
    );
}
