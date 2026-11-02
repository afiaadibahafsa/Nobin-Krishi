import { Lock, Scale, ShieldCheck, UserCheck } from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    color: 'accent',
    title: 'Secure Payments',
    items: ['bKash, Nagad, Rocket', 'Bank transfer', 'Cash on delivery', 'Credit/Debit cards'],
    badges: ['SSL encrypted', 'PCI DSS compliant'],
  },
  {
    icon: Scale,
    color: 'info',
    title: 'Dispute Resolution',
    items: ['Fair mediation process', '24-hour response time', 'Transparent investigation', 'Mutual agreement focus'],
    badges: [],
  },
  {
    icon: ShieldCheck,
    color: 'earth-brown',
    title: 'Data Privacy',
    items: ['Your data is never sold', 'GDPR-compliant practices', 'Farmer location protection', 'Buyer anonymity option'],
    badges: [],
  },
  {
    icon: UserCheck,
    color: 'warning',
    title: 'Verified Identities',
    items: ['National ID verification', 'Phone number validation', 'Farm location confirmation', 'Community ratings'],
    badges: [],
  },
];

const trustBadges = [
  'ISO 27001 Certified',
  'PCI DSS Level 1',
  'FSSAI Registered',
  'Bangladesh eCommerce Association Member',
];

export function MarketplaceSecurity() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark mb-4">
            নিরাপত্তা ও বিশ্বাস
          </h2>
          <p className="text-xl text-muted-foreground">
            Security & Trust
          </p>
        </div>
        
        {/* Security Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {securityFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-muted/30 rounded-2xl p-6 hover:shadow-medium transition-all duration-300"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `hsl(var(--${feature.color}) / 0.1)` }}
              >
                <feature.icon 
                  className="w-8 h-8"
                  style={{ color: `hsl(var(--${feature.color}))` }}
                />
              </div>
              <h3 className="font-bold text-earth-dark mb-3">{feature.title}</h3>
              <ul className="space-y-2 mb-4">
                {feature.items.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: `hsl(var(--${feature.color}))` }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              {feature.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {feature.badges.map((badge) => (
                    <span 
                      key={badge}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: `hsl(var(--${feature.color}) / 0.1)`,
                        color: `hsl(var(--${feature.color}))`,
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Trust Badges */}
        <div className="bg-muted/30 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-earth-dark text-center mb-6">
            Trust Certifications
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {trustBadges.map((badge) => (
              <div
                key={badge}
                className="bg-white px-6 py-3 rounded-xl shadow-subtle text-sm font-medium text-earth-dark"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
