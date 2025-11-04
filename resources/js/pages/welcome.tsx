import { AIAgentsSection } from '@/features/welcome/ai-agents-section';
import { CTASection } from '@/features/welcome/cta-section';
import { FeaturesSection } from '@/features/welcome/features-section';
import { Footer } from '@/features/welcome/footer';
import { Header } from '@/features/welcome/header';
import { HeroSection } from '@/features/welcome/hero-section';
import { IntegrationsSection } from '@/features/welcome/integrations-section';
import { Pricing } from '@/features/welcome/pricing';
import { Support } from '@/features/welcome/support';
import { TestimonialsSection } from '@/features/welcome/testimonials-section';
import { Head } from '@inertiajs/react';

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
