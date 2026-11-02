import { Handshake, Sprout, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  'বিনামূল্যে নিবন্ধন (Free Registration)',
  'কোনো লুকানো খরচ নেই (No Hidden Costs)',
  '২৪/৭ সহায়তা (24/7 Support)',
  '৩০ দিনের গ্যারান্টি (30-Day Guarantee)',
];

export function MarketplaceCTA() {
  return (
    <section className="section-padding bg-cta-gradient text-white text-center">
      <div className="container-max">
        {/* Icon */}
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Handshake className="w-10 h-10 text-white" />
        </div>
        
        {/* Heading */}
        <h2 className="heading-section mb-4">
          কৃষক ও ভোক্তাদের সংযুক্ত করা
        </h2>
        <p className="text-2xl mb-4 opacity-90">
          Connecting Farmers & Consumers
        </p>
        
        {/* Subheading */}
        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-10">
          Join the revolution for fair, sustainable, and transparent agriculture
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            size="lg" 
            className="bg-white text-earth-dark hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <Sprout className="w-5 h-5 mr-2" />
            আমি কৃষক - বিক্রয় শুরু করুন
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-xl"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            আমি ক্রেতা - কেনাকাটা শুরু করুন
          </Button>
        </div>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {features.map((feature) => (
            <span 
              key={feature}
              className="bg-white/20 px-4 py-2 rounded-full text-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
