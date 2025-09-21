import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
    {
        name: "María González",
        role: "Directora de Atención al Cliente",
        company: "TechSolutions SA",
        content:
            "Desde que implementamos Omnichannel AI Hub, nuestro tiempo de respuesta se redujo en un 70%. Los clientes están más satisfechos y nuestro equipo es más eficiente.",
        rating: 5,
        initials: "MG",
    },
    {
        name: "Carlos Mendoza",
        role: "CEO",
        company: "Retail Express",
        content:
            "La integración fue sorprendentemente fácil. En menos de una semana teníamos todos nuestros canales centralizados. Los agentes de IA manejan el 80% de las consultas básicas.",
        rating: 5,
        initials: "CM",
    },
    {
        name: "Ana Rodríguez",
        role: "Gerente de Operaciones",
        company: "ServicePro",
        content:
            "Lo que más me gusta es la flexibilidad. Podemos personalizar completamente la experiencia para cada cliente y los reportes nos dan insights valiosos.",
        rating: 5,
        initials: "AR",
    },
]

export function TestimonialsSection() {
    return (
        <section className="py-20 lg:py-32 bg-muted/30">
            <div className="container m-auto">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance mb-4">
                        Empresas que ya confían en nosotros
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Descubre cómo otras empresas han transformado su atención al cliente.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                                    ))}
                                </div>

                                <blockquote className="text-sm leading-relaxed mb-6 text-pretty">"{testimonial.content}"</blockquote>

                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {testimonial.initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{testimonial.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {testimonial.role} • {testimonial.company}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
