import { Camera, UserCheck, Star, Shield, ArrowRight } from 'lucide-react';

const qualityFeatures = [
  {
    icon: Camera,
    color: 'info',
    title: 'Photo Verification',
    description: 'Every listing requires multiple photos showing produce quality, packaging, and harvest conditions',
  },
  {
    icon: UserCheck,
    color: 'accent',
    title: 'Farmer Verification',
    description: 'All farmers undergo ID verification, farm location confirmation, and credential checks',
  },
  {
    icon: Star,
    color: 'warning',
    title: 'Quality Grading',
    description: 'AI-powered and manual grading system: Premium, Grade A, Grade B, with clear quality criteria',
  },
  {
    icon: Shield,
    color: 'destructive',
    title: 'Buyer Protection',
    description: 'Money-back guarantee, easy returns, and quality dispute resolution within 24 hours',
  },
];

const processSteps = [
  'Farmer uploads',
  'AI quality scan',
  'Admin review',
  'Approved listing',
  'Buyer confidence',
];

const trustMetrics = [
  { value: '98.7%', label: 'Quality Satisfaction' },
  { value: '< 2%', label: 'Return Rate' },
  { value: '24hr', label: 'Resolution Time' },
  { value: '15,000+', label: 'Verified Farmers' },
];

export function MarketplaceQuality() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark mb-4">
            গুণমান নিশ্চয়তা
          </h2>
          <p className="text-xl text-muted-foreground">
            Our Quality Promise
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {qualityFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 shadow-subtle hover:shadow-medium transition-all duration-300 text-center"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ 
                  backgroundColor: `hsl(var(--${feature.color}) / 0.1)`,
                }}
              >
                <feature.icon 
                  className="w-8 h-8"
                  style={{ color: `hsl(var(--${feature.color}))` }}
                />
              </div>
              <h3 className="font-bold text-earth-dark mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Process Flow */}
        <div className="bg-white rounded-2xl p-8 shadow-subtle mb-12">
          <h3 className="text-lg font-bold text-earth-dark text-center mb-8">
            Quality Assurance Process
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {processSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-earth-dark whitespace-nowrap">
                    {step}
                  </span>
                </div>
                {index < processSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-accent hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Trust Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trustMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-accent/5 rounded-xl p-6 text-center"
            >
              <div className="text-3xl font-display font-bold text-accent mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
