import { CreditCard, Clock, Globe, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: CreditCard, text: 'No credit card required' },
  { icon: Clock, text: '30-day free trial' },
  { icon: Globe, text: 'Bangla support included' },
  { icon: Wifi, text: 'Works offline' },
];

export function CTASection() {
  return (
    <section className="section-padding bg-cta-gradient">
      <div className="container-max px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto">
          {/* Heading */}
          <h2 className="heading-section text-white text-4xl md:text-5xl lg:text-6xl">
            Ready to Transform Your Farm?
          </h2>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 mt-6 leading-relaxed">
            Join thousands of farmers already using AI to increase yields and income
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Button 
              size="lg"
              className="h-14 text-lg px-10 bg-white text-earth-dark hover:bg-white/90 font-semibold w-full sm:w-auto"
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="h-14 text-lg px-10 border-2 border-white text-white hover:bg-white hover:text-earth-dark font-semibold w-full sm:w-auto bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
            {features.map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-2 text-white/85"
              >
                <feature.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
