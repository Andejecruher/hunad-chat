import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle } from 'lucide-react';

const benefits = [
    'Configuración en menos de 5 minutos',
    'Soporte 24/7 en español',
    'Sin compromisos de permanencia',
    'Prueba gratuita de 14 días',
];

export function CTASection() {
    return (
        <section className="py-20 lg:py-32">
            <div className="container m-auto">
                <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                    <CardContent className="p-12 lg:p-16">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="mb-6 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                                Centraliza tus conversaciones,{' '}
                                <span className="text-primary">
                                    potencia tus agentes
                                </span>
                            </h2>

                            <p className="mb-8 text-lg text-pretty text-muted-foreground">
                                Únete a cientos de empresas que ya están
                                transformando su atención al cliente con nuestra
                                plataforma omnicanal inteligente.
                            </p>

                            <div className="mx-auto mb-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
                                {benefits.map((benefit, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-2 text-sm"
                                    >
                                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="group px-10 py-6 text-lg"
                                >
                                    Empieza gratis
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="bg-transparent px-10 py-6 text-lg"
                                >
                                    Hablar con ventas
                                </Button>
                            </div>

                            <p className="mt-6 text-sm text-muted-foreground">
                                No se requiere tarjeta de crédito •
                                Configuración gratuita • Soporte incluido
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
