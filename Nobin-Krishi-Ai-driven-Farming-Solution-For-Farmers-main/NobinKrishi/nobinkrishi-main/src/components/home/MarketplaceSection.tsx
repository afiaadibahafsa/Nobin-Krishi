import { Heart, Leaf, Recycle, Shield, Upload, Brain, Truck, Wallet } from 'lucide-react';

const benefits = [
  { icon: Heart, label: 'Fair Farmer Prices' },
  { icon: Leaf, label: 'Fresh Produce' },
  { icon: Recycle, label: 'Zero Waste' },
  { icon: Shield, label: 'Quality Assured' },
];

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Farmers List Produce',
    description: 'Cooperative members upload available crops with photos and quality grades',
  },
  {
    number: 2,
    icon: Brain,
    title: 'AI Matches Demand',
    description: 'Smart algorithms connect surplus produce with nearby consumers and retailers',
  },
  {
    number: 3,
    icon: Truck,
    title: 'Direct Delivery',
    description: 'Efficient logistics ensure farm-fresh delivery within 24 hours',
  },
  {
    number: 4,
    icon: Wallet,
    title: 'Fair Payment',
    description: 'Farmers receive payment directly, earning 40% more than traditional channels',
  },
];

export function MarketplaceSection() {
  return (
    <section className="section-padding bg-marketplace-gradient">
      <div className="container-max px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark">
            Direct Farm-to-Consumer Connection
          </h2>
          <p className="text-body mt-4 max-w-2xl mx-auto">
            Eliminating middlemen to empower farmers and reduce food costs
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Left: Value Proposition */}
          <div className="lg:col-span-2 space-y-8">
            {/* Big Stat */}
            <div className="bg-white rounded-3xl p-8 shadow-medium">
              <div className="text-stat text-6xl lg:text-7xl text-accent font-bold">
                72%
              </div>
              <p className="text-xl font-semibold text-earth-dark mt-2">
                Cost Reduction
              </p>
              <p className="text-muted-foreground mt-1">
                For consumers compared to traditional retail
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className="bg-white rounded-xl p-4 shadow-subtle flex items-center gap-3 hover:shadow-medium transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-medium text-earth-dark text-sm">
                    {benefit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: How It Works */}
          <div className="lg:col-span-3">
            <h3 className="text-xl font-bold text-earth-dark mb-6">
              How It Works
            </h3>
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-accent/30 hidden md:block" />
              
              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="bg-white rounded-xl p-5 shadow-subtle border-l-4 border-accent hover:shadow-medium transition-all hover:-translate-y-1"
                  >
                    <div className="flex gap-4">
                      {/* Step Number */}
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-bold text-lg">
                          {step.number}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <step.icon className="w-5 h-5 text-earth-dark" />
                          <h4 className="font-bold text-earth-dark">
                            {step.title}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
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
