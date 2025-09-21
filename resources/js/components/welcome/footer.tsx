import { Link } from '@inertiajs/react';

const footerLinks = {
    product: [
        { name: 'Características', href: '#features' },
        { name: 'Integraciones', href: '#integrations' },
        { name: 'Precios', href: '#pricing' },
        { name: 'API', href: '/api' },
    ],
    company: [
        { name: 'Acerca de', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Carreras', href: '/careers' },
        { name: 'Contacto', href: '/contact' },
    ],
    support: [
        { name: 'Documentación', href: '/docs' },
        { name: 'Soporte', href: '/support' },
        { name: 'Estado del servicio', href: '/status' },
        { name: 'Comunidad', href: '/community' },
    ],
    legal: [
        { name: 'Privacidad', href: '/privacy' },
        { name: 'Términos', href: '/terms' },
        { name: 'Cookies', href: '/cookies' },
        { name: 'Seguridad', href: '/security' },
    ],
};

export function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container m-auto py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
                    <div className="lg:col-span-2">
                        <Link
                            href="/"
                            className="mb-4 flex items-center space-x-2"
                        >
                            <img
                                src="/logos/logo-hunad-chat.png"
                                alt="Omnichannel AI Hub"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                            <span className="text-lg font-bold">
                                {import.meta.env.VITE_APP_NAME}
                            </span>
                        </Link>
                        <p className="mb-4 text-sm text-pretty text-muted-foreground">
                            The omnichannel communication platform that combines
                            AI and human agents to provide the best experience
                            for your customers.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            © 2025 {import.meta.env.VITE_APP_NAME}. Todos los
                            derechos reservados.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Producto</h3>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Empresa</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Soporte</h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
    );
}
