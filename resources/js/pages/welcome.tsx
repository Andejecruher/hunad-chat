
import { Head } from '@inertiajs/react';
import { Header } from "@/components/welcome/header"
import { HeroSection } from "@/components/welcome/hero-section"
import { FeaturesSection } from "@/components/welcome/features-section"
import { IntegrationsSection } from "@/components/welcome/integrations-section"
import { AIAgentsSection } from "@/components/welcome/ai-agents-section"
import { TestimonialsSection } from "@/components/welcome/testimonials-section"
import { CTASection } from "@/components/welcome/cta-section"
import { Support } from "@/components/welcome/support"
import { Pricing } from "@/components/welcome/pricing"
import { Footer } from "@/components/welcome/footer"

export default function Welcome() {
    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="min-h-screen">
            <Header />
                <main>
                    <HeroSection />
                    <FeaturesSection />
                    <IntegrationsSection />
                    <AIAgentsSection />
                    <TestimonialsSection />
                    <CTASection />
                    <Pricing />
                    <Support />
                </main>
            <Footer />
            </div>
        </>
    );
}
