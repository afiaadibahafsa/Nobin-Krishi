import { TrendingDown, Leaf, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const valueProps = [
  { icon: TrendingDown, label: '72% Lower Prices', value: '72%' },
  { icon: Leaf, label: 'Farm Fresh Quality', value: 'Fresh' },
  { icon: Users, label: 'Zero Middlemen', value: '0' },
  { icon: Heart, label: 'Fair Farmer Prices', value: '+45%' },
];

export function MarketplaceHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&q=80')`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-earth-dark/80 via-earth-dark/70 to-accent/70" />
      
      {/* Content */}
      <div className="relative z-10 container-max px-6 lg:px-12 text-center text-white">
        <div className="max-w-4xl mx-auto animate-fade-up">
          {/* Bengali Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            সরাসরি খামার থেকে আপনার দোরগোড়ায়
          </h1>
          
          {/* English Headline */}
          <p className="text-2xl md:text-3xl font-semibold mb-6 opacity-90">
            Direct from Farm to Your Doorstep
          </p>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up-delay-1">
            Connect directly with farmers, enjoy 72% lower prices, and support sustainable agriculture while reducing food waste
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-up-delay-2">
            <Button 
              size="lg" 
              className="bg-warning hover:bg-warning/90 text-warning-foreground font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
            >
              Browse Fresh Produce
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-lg"
            >
              Sell Your Harvest
            </Button>
          </div>
        </div>
        
        {/* Value Props Banner */}
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="container-max">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {valueProps.map((prop) => (
                  <div key={prop.label} className="text-center">
                    <prop.icon className="w-10 h-10 mx-auto mb-3 text-white" />
                    <div className="font-display text-3xl md:text-4xl font-bold mb-1">
                      {prop.value}
                    </div>
                    <div className="text-sm md:text-base opacity-90">
                      {prop.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
