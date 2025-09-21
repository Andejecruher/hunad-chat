import { Link } from '@inertiajs/react';

const footerLinks = {
    product: [
        { name: "Características", href: "#features" },
        { name: "Integraciones", href: "#integrations" },
        { name: "Precios", href: "#pricing" },
        { name: "API", href: "/api" },
    ],
    company: [
        { name: "Acerca de", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Carreras", href: "/careers" },
        { name: "Contacto", href: "/contact" },
    ],
    support: [
        { name: "Documentación", href: "/docs" },
        { name: "Soporte", href: "/support" },
        { name: "Estado del servicio", href: "/status" },
        { name: "Comunidad", href: "/community" },
    ],
    legal: [
        { name: "Privacidad", href: "/privacy" },
        { name: "Términos", href: "/terms" },
        { name: "Cookies", href: "/cookies" },
        { name: "Seguridad", href: "/security" },
    ],
}

export function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container py-16 m-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <img src="/logos/logo-hunad-chat.png" alt="Omnichannel AI Hub" width={32} height={32} className="h-8 w-8" />
                            <span className="font-bold text-lg">{import.meta.env.VITE_APP_NAME}</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 text-pretty">
                            La plataforma de comunicación omnicanal que combina IA y agentes humanos para brindar la mejor experiencia
                            a tus clientes.
                        </p>
                        <p className="text-xs text-muted-foreground">© 2025 {import.meta.env.VITE_APP_NAME}. Todos los derechos reservados.</p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Producto</h3>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Empresa</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Soporte</h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}
