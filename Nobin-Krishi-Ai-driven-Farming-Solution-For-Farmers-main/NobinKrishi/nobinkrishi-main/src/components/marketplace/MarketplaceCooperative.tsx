import { Package, Award, Users, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const cooperativeBenefits = [
  {
    icon: Package,
    title: 'Bulk Order Management',
    description: 'Handle large orders from retailers, institutions, and export buyers',
  },
  {
    icon: Award,
    title: 'Quality Standardization',
    description: 'Collective quality control and certification programs',
  },
  {
    icon: Users,
    title: 'Shared Resources',
    description: 'Access to shared storage, transportation, and processing facilities',
  },
  {
    icon: TrendingUp,
    title: 'Better Negotiation Power',
    description: 'Negotiate better prices as a united group',
  },
  {
    icon: BookOpen,
    title: 'Training & Support',
    description: 'Regular training on quality, packaging, and market trends',
  },
];

export function MarketplaceCooperative() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark mb-4">
            সমবায়ের সাথে অংশীদারিত্ব
          </h2>
          <p className="text-xl text-muted-foreground">
            Cooperative Partnerships — Empowering farmer groups for collective success
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Benefits List */}
          <div className="space-y-4">
            {cooperativeBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 p-5 bg-muted/30 rounded-xl hover:bg-accent/5 transition-colors"
              >
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-earth-dark mb-1">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right: Success Story */}
          <div className="bg-card-gradient rounded-3xl p-8 shadow-medium">
            <div className="mb-6">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80"
                alt="Cooperative members working together"
                className="w-full h-48 object-cover rounded-2xl"
              />
            </div>
            
            <blockquote className="text-lg font-serif italic text-earth-dark mb-6 leading-relaxed">
              "আমাদের সমবায়ের ৮৫ জন কৃষক এখন সরাসরি ঢাকার রিটেইল চেইনে সবজি সরবরাহ করছি। আয় দ্বিগুণ হয়েছে!"
            </blockquote>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">ম</span>
              </div>
              <div>
                <div className="font-bold text-earth-dark">মো. আলী হোসেন</div>
                <div className="text-sm text-muted-foreground">
                  সভাপতি, ময়মনসিংহ কৃষক সমবায় সমিতি
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-accent">85</div>
                <div className="text-xs text-muted-foreground">Member farmers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-accent">৳2.5Cr</div>
                <div className="text-xs text-muted-foreground">Annual revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-accent">18</div>
                <div className="text-xs text-muted-foreground">Retail partnerships</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-earth-dark text-earth-dark hover:bg-earth-dark hover:text-white">
            Partner as Cooperative
          </Button>
        </div>
      </div>
    </section>
  );
}
