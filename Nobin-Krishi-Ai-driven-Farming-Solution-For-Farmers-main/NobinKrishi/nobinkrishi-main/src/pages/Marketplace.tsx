import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { MarketplaceHero } from '@/components/marketplace/MarketplaceHero';
import { MarketplaceProblem } from '@/components/marketplace/MarketplaceProblem';
import { MarketplaceSolution } from '@/components/marketplace/MarketplaceSolution';
import { MarketplaceHowItWorks } from '@/components/marketplace/MarketplaceHowItWorks';
import { MarketplaceProducts } from '@/components/marketplace/MarketplaceProducts';
import { MarketplaceImperfect } from '@/components/marketplace/MarketplaceImperfect';
import { MarketplaceCooperative } from '@/components/marketplace/MarketplaceCooperative';
import { MarketplaceQuality } from '@/components/marketplace/MarketplaceQuality';
import { MarketplacePriceCalculator } from '@/components/marketplace/MarketplacePriceCalculator';
import { MarketplaceTestimonials } from '@/components/marketplace/MarketplaceTestimonials';
import { MarketplaceImpact } from '@/components/marketplace/MarketplaceImpact';
import { MarketplaceBusiness } from '@/components/marketplace/MarketplaceBusiness';
import { MarketplaceFarmerSupport } from '@/components/marketplace/MarketplaceFarmerSupport';
import { MarketplaceSecurity } from '@/components/marketplace/MarketplaceSecurity';
import { MarketplaceCTA } from '@/components/marketplace/MarketplaceCTA';
import { MarketplaceFAQ } from '@/components/marketplace/MarketplaceFAQ';

export default function Marketplace() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <MarketplaceHero />
        <MarketplaceProblem />
        <MarketplaceSolution />
        <MarketplaceHowItWorks />
        <MarketplaceProducts />
        <MarketplaceImperfect />
        <MarketplaceCooperative />
        <MarketplaceQuality />
        <MarketplacePriceCalculator />
        <MarketplaceTestimonials />
        <MarketplaceImpact />
        <MarketplaceBusiness />
        <MarketplaceFarmerSupport />
        <MarketplaceSecurity />
        <MarketplaceCTA />
        <MarketplaceFAQ />
      </main>
      <Footer />
    </div>
  );
}
