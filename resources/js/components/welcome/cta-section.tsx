import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle } from "lucide-react"

const benefits = [
    "Configuración en menos de 5 minutos",
    "Soporte 24/7 en español",
    "Sin compromisos de permanencia",
    "Prueba gratuita de 14 días",
]

export function CTASection() {
    return (
        <section className="py-20 lg:py-32">
            <div className="container m-auto">
                <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
                    <CardContent className="p-12 lg:p-16">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance mb-6">
                                Centraliza tus conversaciones, <span className="text-primary">potencia tus agentes</span>
                            </h2>

                            <p className="text-lg text-muted-foreground mb-8 text-pretty">
                                Únete a cientos de empresas que ya están transformando su atención al cliente con nuestra plataforma
                                omnicanal inteligente.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-sm">
                                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button size="lg" className="text-lg px-10 py-6 group">
                                    Empieza gratis
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button variant="outline" size="lg" className="text-lg px-10 py-6 bg-transparent">
                                    Hablar con ventas
                                </Button>
                            </div>

                            <p className="text-sm text-muted-foreground mt-6">
                                No se requiere tarjeta de crédito • Configuración gratuita • Soporte incluido
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
