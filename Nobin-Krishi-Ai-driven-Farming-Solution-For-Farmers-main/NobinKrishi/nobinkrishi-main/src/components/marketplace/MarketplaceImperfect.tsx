import { Leaf, Recycle, PiggyBank, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const benefits = [
  { icon: PiggyBank, label: '40% Cheaper' },
  { icon: Leaf, label: 'Same Nutrition' },
  { icon: Recycle, label: 'Reduce Waste' },
  { icon: Heart, label: 'Support Farmers' },
];

export function MarketplaceImperfect() {
  const navigate = useNavigate();

  return (
    <section className="section-padding bg-[#FEF3E2] border-t-4 border-warning">
      <div className="container-max">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left: Visual */}
          <div className="lg:col-span-2 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-strong">
              <img
                src="https://www.irimigroup.com/wp-content/uploads/2021/03/apple-1024x1024.jpg"
                alt="Imperfect produce"
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <p className="text-white text-xl font-serif font-bold">
                  শুধুমাত্র সুন্দর নয়, সুস্বাদুও!
                  <br />
                  <span className="text-base font-normal opacity-90">
                    Not Just Beautiful, Delicious Too!
                  </span>
                </p>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-strong">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm font-semibold text-earth-dark">Climate Friendly</span>
              </div>
            </div>
          </div>
          
          {/* Right: Content */}
          <div className="lg:col-span-3">
            <h2 className="heading-card text-earth-brown mb-4">
              Fight Food Waste: Buy Imperfect Produce
            </h2>
            
            <p className="text-body mb-8">
              Every year, millions of tons of perfectly nutritious fruits and vegetables are wasted simply because they don't look 'perfect'. These cosmetically imperfect produce are just as fresh, tasty, and healthy — but sold at 40-50% discount.
            </p>
            
            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-subtle"
                >
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-warning" />
                  </div>
                  <span className="font-semibold text-earth-dark">{benefit.label}</span>
                </div>
              ))}
            </div>
            
            {/* Statistics */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-muted-foreground">25% of farm produce rejected for appearance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-muted-foreground">৳450Cr worth of food wasted annually</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-muted-foreground">You save ৳200-400/month buying imperfect</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-warning hover:bg-warning/90 text-warning-foreground font-semibold px-8"
              onClick={() => navigate('/imperfect-produce')}
            >
              Shop Imperfect Produce
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
