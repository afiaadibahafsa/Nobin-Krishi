import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { ProblemSection } from '@/components/home/ProblemSection';
import { SolutionSection } from '@/components/home/SolutionSection';
import { MarketplaceSection } from '@/components/home/MarketplaceSection';
import { TechStackSection } from '@/components/home/TechStackSection';
import { ImpactSection } from '@/components/home/ImpactSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <MarketplaceSection />
        <TechStackSection />
        <ImpactSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
