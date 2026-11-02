import { Users, Map, TrendingUp, Target, Leaf, Package } from 'lucide-react';

const metrics = [
  { icon: Users, value: '45,000+', label: 'Active Farmers' },
  { icon: Map, value: '2.1M', label: 'Acres Under Monitoring' },
  { icon: TrendingUp, value: '৳500M+', label: 'Revenue Generated' },
  { icon: Target, value: '92%', label: 'Yield Prediction Accuracy' },
  { icon: Leaf, value: '68%', label: 'Pesticide Usage Reduction' },
  { icon: Package, value: '1.2M', label: 'Tons Food Waste Prevented' },
];

export function ImpactSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark">
            Real Impact, Real Numbers
          </h2>
          <p className="text-body mt-4 max-w-2xl mx-auto">
            Measurable results that transform lives and livelihoods
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="metric-card group cursor-default"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <metric.icon className="w-7 h-7 text-accent" />
              </div>

              {/* Value */}
              <div className="text-stat text-4xl md:text-5xl lg:text-6xl text-earth-dark">
                {metric.value}
              </div>

              {/* Label */}
              <p className="text-muted-foreground mt-2 text-base md:text-lg">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
