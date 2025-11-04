import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative overflow-hidden py-20 lg:py-32">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

            <div className="relative container m-auto">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mb-8 flex justify-center">
                        <img
                            src="/logos/logo-hunad-chat.png"
                            alt="Omnichannel AI Hub Logo"
                            width={120}
                            height={120}
                            className="h-24 w-24 lg:h-32 lg:w-32"
                        />
                    </div>

                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                        <span className="text-primary">
                            {import.meta.env.VITE_APP_NAME}
                        </span>{' '}
                        AI Hub
                    </h1>

                    <p className="mb-8 text-xl text-balance text-muted-foreground lg:text-2xl">
                        Comunicación centralizada, atención inteligente.
                    </p>

                    <p className="mx-auto mb-12 max-w-2xl text-lg text-pretty text-muted-foreground">
                        Conecta WhatsApp, Instagram, Facebook y Telegram en una
                        sola plataforma. Combina agentes de IA y humanos para
                        brindar la mejor experiencia a tus clientes.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="lg" className="group px-8 py-6 text-lg">
                            Comenzar ahora
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="group bg-transparent px-8 py-6 text-lg"
                        >
                            <Play className="mr-2 h-5 w-5" />
                            Ver demo
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
