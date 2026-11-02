import { TrendingUp, ShoppingBag, Recycle, Shield, ArrowRight } from 'lucide-react';

const benefits = [
  {
    icon: TrendingUp,
    color: 'accent',
    title: 'Fair Farmer Pricing',
    description: 'Farmers earn 40-60% more by selling directly, improving livelihoods and enabling investment in better farming practices',
    stat: '+45% Average Income Increase',
  },
  {
    icon: ShoppingBag,
    color: 'info',
    title: 'Affordable for All',
    description: 'Consumers access fresh, quality produce at 72% lower prices compared to traditional retail markets',
    stat: '৳850/month Average Savings',
  },
  {
    icon: Recycle,
    color: 'accent',
    title: 'Zero Waste Initiative',
    description: 'AI-powered demand matching ensures surplus and visually imperfect produce finds buyers, reducing waste by 65%',
    stat: '1.2M Tons Waste Prevented',
  },
  {
    icon: Shield,
    color: 'warning',
    title: 'Quality Assurance',
    description: 'Multi-point quality checks, photo verification, and cooperative partnerships ensure only fresh, safe produce reaches consumers',
    stat: '98.5% Satisfaction Rate',
  },
];

export function MarketplaceSolution() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark mb-4">
            নবীন কৃষি সমাধান: A Transparent Marketplace
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Technology-powered direct connection eliminating exploitation
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Supply Chain Comparison */}
          <div className="bg-muted/50 rounded-3xl p-8 md:p-10">
            <h3 className="text-xl font-bold text-earth-dark mb-8 text-center">
              Supply Chain Comparison
            </h3>
            
            {/* Traditional */}
            <div className="mb-8">
              <div className="text-sm font-semibold text-destructive mb-4">
                Traditional Market
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg">Farmer ৳10</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg">+৳5</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg">+৳7</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg">+৳8</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg">+৳12</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-destructive text-white px-3 py-2 rounded-lg font-bold">Consumer ৳50</span>
              </div>
            </div>
            
            {/* NobinKrishi */}
            <div>
              <div className="text-sm font-semibold text-accent mb-4">
                NobinKrishi Direct
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-accent/10 text-accent px-3 py-2 rounded-lg">Farmer ৳15</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-accent/10 text-accent px-3 py-2 rounded-lg">+৳3</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-accent text-white px-3 py-2 rounded-lg font-bold">Consumer ৳18</span>
              </div>
            </div>
            
            {/* Summary */}
            <div className="mt-8 p-4 bg-accent/10 rounded-xl">
              <div className="text-center">
                <span className="text-3xl font-display font-bold text-accent">64% Savings</span>
                <p className="text-sm text-muted-foreground mt-1">For consumers + 50% more for farmers</p>
              </div>
            </div>
          </div>
          
          {/* Right: Benefits List */}
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-muted/30 rounded-xl p-6 border-l-4 transition-all duration-300 hover:shadow-medium"
                style={{ 
                  borderColor: benefit.color === 'accent' ? 'hsl(var(--accent))' : 
                               benefit.color === 'info' ? 'hsl(var(--info))' : 
                               'hsl(var(--warning))' 
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: benefit.color === 'accent' ? 'hsl(var(--accent) / 0.1)' : 
                                       benefit.color === 'info' ? 'hsl(var(--info) / 0.1)' : 
                                       'hsl(var(--warning) / 0.1)' 
                    }}
                  >
                    <benefit.icon 
                      className="w-6 h-6"
                      style={{ 
                        color: benefit.color === 'accent' ? 'hsl(var(--accent))' : 
                               benefit.color === 'info' ? 'hsl(var(--info))' : 
                               'hsl(var(--warning))' 
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-earth-dark mb-2">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {benefit.description}
                    </p>
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: benefit.color === 'accent' ? 'hsl(var(--accent) / 0.1)' : 
                                         benefit.color === 'info' ? 'hsl(var(--info) / 0.1)' : 
                                         'hsl(var(--warning) / 0.1)',
                        color: benefit.color === 'accent' ? 'hsl(var(--accent))' : 
                               benefit.color === 'info' ? 'hsl(var(--info))' : 
                               'hsl(var(--warning))' 
                      }}
                    >
                      {benefit.stat}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
