import { TrendingDown, Calendar, Award, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: TrendingDown,
    title: 'Volume Discounts',
    description: 'Order 100kg+ and unlock tiered pricing',
    details: ['5% off (100kg)', '10% off (500kg)', '15% off (1000kg+)', 'Custom contracts available'],
  },
  {
    icon: Calendar,
    title: 'Consistent Supply',
    description: 'Schedule recurring deliveries',
    details: ['Multi-farmer sourcing', 'Seasonal crop planning', 'Weekly/monthly subscriptions', 'Flexible scheduling'],
  },
  {
    icon: Award,
    title: 'Quality Standards',
    description: 'Meet your specification requirements',
    details: ['Grading, sorting, packaging', 'Certification & documentation', 'Quality guarantees', 'Custom specifications'],
  },
];

const benefits = [
  'Direct farmer relationships',
  'Transparent pricing',
  'Flexible payment terms',
  'Dedicated account manager',
  'Custom delivery schedules',
  'Invoice & GST support',
];

export function MarketplaceBusiness() {
  return (
    <section className="section-padding bg-sidebar text-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section mb-4">
            Bulk Procurement for Businesses
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Restaurants, Hotels, Retailers — Source directly at wholesale prices
          </p>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 text-accent mb-6" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/70 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.details.map((detail) => (
                  <li key={detail} className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Benefits List */}
        <div className="bg-white/5 rounded-2xl p-8 md:p-12 border border-white/10 mb-12">
          <h3 className="text-xl font-bold mb-6 text-center">Business Benefits</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-white text-earth-dark hover:bg-white/90 font-semibold px-10 py-6 text-lg"
          >
            Request Business Account
          </Button>
        </div>
      </div>
    </section>
  );
}
