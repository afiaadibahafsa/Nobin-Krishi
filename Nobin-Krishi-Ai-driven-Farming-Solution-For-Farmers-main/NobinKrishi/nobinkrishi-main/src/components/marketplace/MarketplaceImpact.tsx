import { Wallet, Users, PiggyBank, ShoppingBag, Leaf, Cloud, Recycle, MapPin } from 'lucide-react';

const economicMetrics = [
  {
    icon: Wallet,
    value: '৳850 Cr',
    label: 'Direct revenue to farmers',
    trend: '+45% YoY',
    color: 'accent',
  },
  {
    icon: Users,
    value: '45,000+',
    label: 'Active farmer sellers',
    trend: '+120% growth',
    color: 'info',
  },
  {
    icon: PiggyBank,
    value: '৳340 Cr',
    label: 'Consumer savings',
    trend: '৳850/month avg',
    color: 'warning',
  },
  {
    icon: ShoppingBag,
    value: '2.5 Lakh',
    label: 'Regular buyers',
    trend: '+95% retention',
    color: 'earth-brown',
  },
];

const environmentalMetrics = [
  {
    icon: Leaf,
    value: '1.2M Tons',
    label: 'Food waste prevented',
    comparison: '30% reduction achieved',
    color: 'accent',
  },
  {
    icon: Cloud,
    value: '850K Tons',
    label: 'CO₂ emissions saved',
    comparison: 'Shorter supply chain',
    color: 'info',
  },
  {
    icon: Recycle,
    value: '65%',
    label: 'Imperfect produce sold',
    comparison: 'Reduced farm waste',
    color: 'warning',
  },
  {
    icon: MapPin,
    value: '18 Districts',
    label: 'Active marketplace regions',
    comparison: 'Expanding nationwide',
    color: 'destructive',
  },
];

export function MarketplaceImpact() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark mb-4">
            আমাদের প্রভাব
          </h2>
          <p className="text-xl text-muted-foreground">
            Our Impact
          </p>
        </div>
        
        {/* Economic Impact */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-muted-foreground mb-6 text-center">
            Economic Impact
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {economicMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-card-gradient rounded-2xl p-6 text-center shadow-subtle hover:shadow-medium transition-all duration-300 hover:scale-105 relative overflow-hidden"
                style={{ 
                  borderTop: `6px solid hsl(var(--${metric.color}))` 
                }}
              >
                <metric.icon 
                  className="w-12 h-12 mx-auto mb-4 opacity-20 absolute top-4 right-4"
                  style={{ color: `hsl(var(--${metric.color}))` }}
                />
                <div 
                  className="text-4xl font-display font-bold mb-2"
                  style={{ color: `hsl(var(--${metric.color}))` }}
                >
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-earth-dark mb-1">
                  {metric.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Environmental Impact */}
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-6 text-center">
            Environmental Impact
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {environmentalMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-card-gradient rounded-2xl p-6 text-center shadow-subtle hover:shadow-medium transition-all duration-300 hover:scale-105 relative overflow-hidden"
                style={{ 
                  borderTop: `6px solid hsl(var(--${metric.color}))` 
                }}
              >
                <metric.icon 
                  className="w-12 h-12 mx-auto mb-4 opacity-20 absolute top-4 right-4"
                  style={{ color: `hsl(var(--${metric.color}))` }}
                />
                <div 
                  className="text-4xl font-display font-bold mb-2"
                  style={{ color: `hsl(var(--${metric.color}))` }}
                >
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-earth-dark mb-1">
                  {metric.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.comparison}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
