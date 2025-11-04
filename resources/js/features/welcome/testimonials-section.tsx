import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'María González',
        role: 'Directora de Atención al Cliente',
        company: 'TechSolutions SA',
        content:
            'Desde que implementamos Omnichannel AI Hub, nuestro tiempo de respuesta se redujo en un 70%. Los clientes están más satisfechos y nuestro equipo es más eficiente.',
        rating: 5,
        initials: 'MG',
    },
    {
        name: 'Carlos Mendoza',
        role: 'CEO',
        company: 'Retail Express',
        content:
            'La integración fue sorprendentemente fácil. En menos de una semana teníamos todos nuestros canales centralizados. Los agentes de IA manejan el 80% de las consultas básicas.',
        rating: 5,
        initials: 'CM',
    },
    {
        name: 'Ana Rodríguez',
        role: 'Gerente de Operaciones',
        company: 'ServicePro',
        content:
            'Lo que más me gusta es la flexibilidad. Podemos personalizar completamente la experiencia para cada cliente y los reportes nos dan insights valiosos.',
        rating: 5,
        initials: 'AR',
    },
];

export function TestimonialsSection() {
    return (
        <section className="bg-muted/30 py-20 lg:py-32">
            <div className="container m-auto">
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                        Empresas que ya confían en nosotros
                    </h2>
                    <p className="text-lg text-pretty text-muted-foreground">
                        Descubre cómo otras empresas han transformado su
                        atención al cliente.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <Card
                            key={index}
                            className="group transition-all duration-300 hover:shadow-lg"
                        >
                            <CardContent className="p-6">
                                <div className="mb-4 flex items-center space-x-1">
                                    {[...Array(testimonial.rating)].map(
                                        (_, i) => (
                                            <Star
                                                key={i}
                                                className="h-4 w-4 fill-secondary text-secondary"
                                            />
                                        ),
                                    )}
                                </div>

                                <blockquote className="mb-6 text-sm leading-relaxed text-pretty">
                                    "{testimonial.content}"
                                </blockquote>

                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                            {testimonial.initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {testimonial.role} •{' '}
                                            {testimonial.company}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
