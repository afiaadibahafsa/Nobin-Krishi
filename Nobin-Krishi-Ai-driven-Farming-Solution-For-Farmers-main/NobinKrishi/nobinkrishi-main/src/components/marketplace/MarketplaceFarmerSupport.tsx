import { GraduationCap, Image, MessageCircle, BarChart, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const resources = [
  {
    icon: GraduationCap,
    color: 'info',
    title: 'Seller Training',
    description: 'Free online courses on:',
    items: ['Product photography', 'Pricing strategies', 'Quality maintenance', 'Customer service'],
    cta: 'Enroll Free',
  },
  {
    icon: Image,
    color: 'accent',
    title: 'Marketing Materials',
    description: 'Download free:',
    items: ['Product photo templates', 'Quality guides', 'Packaging labels', 'QR code generators'],
    cta: 'Download Assets',
  },
  {
    icon: MessageCircle,
    color: 'warning',
    title: 'Success Coaching',
    description: 'One-on-one support:',
    items: ['WhatsApp helpline', 'Video call consultations', 'Cooperative meetups', 'Best practice sharing'],
    cta: 'Contact Support',
  },
  {
    icon: BarChart,
    color: 'earth-brown',
    title: 'Market Insights',
    description: 'Access to:',
    items: ['Price trend reports', 'Demand forecasts', 'Competitor analysis', 'Seasonal guides'],
    cta: 'View Reports',
  },
];

export function MarketplaceFarmerSupport() {
  return (
    <section className="section-padding bg-earth-cream">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark mb-4">
            কৃষক সহায়তা ও সম্পদ
          </h2>
          <p className="text-xl text-muted-foreground">
            Farmer Support & Resources
          </p>
        </div>
        
        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {resources.map((resource) => (
            <div
              key={resource.title}
              className="bg-white rounded-2xl p-6 shadow-subtle hover:shadow-medium transition-all duration-300"
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `hsl(var(--${resource.color}) / 0.1)` }}
              >
                <resource.icon 
                  className="w-7 h-7"
                  style={{ color: `hsl(var(--${resource.color}))` }}
                />
              </div>
              <h3 className="font-bold text-earth-dark mb-2">{resource.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
              <ul className="space-y-1 mb-4">
                {resource.items.map((item) => (
                  <li key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                style={{ 
                  borderColor: `hsl(var(--${resource.color}))`,
                  color: `hsl(var(--${resource.color}))`,
                }}
              >
                {resource.cta}
              </Button>
            </div>
          ))}
        </div>
        
        {/* Support Channels */}
        <div className="bg-white rounded-2xl p-8 shadow-subtle">
          <h3 className="text-lg font-bold text-earth-dark text-center mb-6">
            Support Channels
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-semibold text-earth-dark">09678-100-100</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">WhatsApp</div>
                <div className="font-semibold text-earth-dark">+880-1XXX-XXXXXX</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-semibold text-earth-dark">farmers@nobinkrishi.com</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Office</div>
                <div className="font-semibold text-earth-dark">12 locations nationwide</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border text-center">
            <span className="bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
              24/7 Emergency Support • Bangla, English, Hindi
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
