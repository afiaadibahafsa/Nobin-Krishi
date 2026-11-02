import { TrendingDown, DollarSign, Trash2 } from 'lucide-react';

const problems = [
  {
    icon: TrendingDown,
    color: 'destructive',
    stat: '40%',
    statLabel: 'Revenue Lost',
    title: 'Farmer Exploitation',
    description: 'Middlemen capture majority of profits while farmers earn barely enough to sustain their families and reinvest in farming',
  },
  {
    icon: DollarSign,
    color: 'warning',
    stat: '3-4×',
    statLabel: 'Markup',
    title: 'Consumer Overpaying',
    description: 'Consumers pay inflated prices due to multiple intermediaries in the supply chain, making healthy food unaffordable',
  },
  {
    icon: Trash2,
    color: 'earth-brown',
    stat: '30%',
    statLabel: 'Produce Wasted',
    title: 'Massive Food Waste',
    description: 'Inefficient logistics and storage lead to spoilage, methane emissions, and economic losses while millions face hunger',
  },
];

export function MarketplaceProblem() {
  return (
    <section className="section-padding bg-earth-cream">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark mb-4">
            The Broken Food Supply Chain
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Why traditional markets fail farmers and consumers
          </p>
        </div>
        
        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-medium transition-all duration-300 hover:-translate-y-2 hover:shadow-strong"
              style={{ 
                borderTop: `6px solid ${
                  problem.color === 'destructive' ? 'hsl(var(--destructive))' : 
                  problem.color === 'warning' ? 'hsl(var(--warning))' : 
                  'hsl(var(--earth-brown))'
                }` 
              }}
            >
              {/* Icon */}
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{ 
                  backgroundColor: `${
                    problem.color === 'destructive' ? 'hsl(var(--destructive) / 0.1)' : 
                    problem.color === 'warning' ? 'hsl(var(--warning) / 0.1)' : 
                    'hsl(var(--earth-brown) / 0.1)'
                  }` 
                }}
              >
                <problem.icon 
                  className="w-10 h-10"
                  style={{ 
                    color: `${
                      problem.color === 'destructive' ? 'hsl(var(--destructive))' : 
                      problem.color === 'warning' ? 'hsl(var(--warning))' : 
                      'hsl(var(--earth-brown))'
                    }` 
                  }}
                />
              </div>
              
              {/* Stat */}
              <div className="mb-4">
                <span className="text-5xl font-display font-bold text-earth-dark">
                  {problem.stat}
                </span>
                <span className="text-lg font-semibold text-muted-foreground ml-2">
                  {problem.statLabel}
                </span>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-earth-dark mb-3">
                {problem.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
