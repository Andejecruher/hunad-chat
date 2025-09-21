import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
    return (
        <section className="relative py-20 lg:py-32 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

            <div className="container relative m-auto">
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

                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-balance mb-6">
                        <span className="text-primary">{import.meta.env.VITE_APP_NAME}</span> AI Hub
                    </h1>

                    <p className="text-xl lg:text-2xl text-muted-foreground mb-8 text-balance">
                        Comunicación centralizada, atención inteligente.
                    </p>

                    <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto text-pretty">
                        Conecta WhatsApp, Instagram, Facebook y Telegram en una sola plataforma. Combina agentes de IA y humanos
                        para brindar la mejor experiencia a tus clientes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button size="lg" className="text-lg px-8 py-6 group">
                            Comenzar ahora
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button variant="outline" size="lg" className="text-lg px-8 py-6 group bg-transparent">
                            <Play className="mr-2 h-5 w-5" />
                            Ver demo
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
