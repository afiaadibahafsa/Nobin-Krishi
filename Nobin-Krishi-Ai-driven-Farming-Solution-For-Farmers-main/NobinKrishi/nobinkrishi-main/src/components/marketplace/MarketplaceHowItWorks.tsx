import { Upload, Cpu, CheckCircle, Truck, Banknote, Search, ShoppingCart, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const farmerSteps = [
  {
    number: 1,
    icon: Upload,
    title: 'List Your Produce',
    description: 'Upload photos, quantity, quality grade, and expected harvest date through mobile app or web',
    features: ['Simple 5-minute listing', 'Photo-based quality assessment', 'Bangla & English interface', 'Voice input available'],
  },
  {
    number: 2,
    icon: Cpu,
    title: 'AI Matches Demand',
    description: 'Our intelligent system connects your produce with nearby buyers, cooperatives, and retailers based on location, preferences, and demand',
    features: ['Real-time price suggestions', 'Buyer ratings & history', 'Cooperative bulk orders', 'Market trend insights'],
  },
  {
    number: 3,
    icon: CheckCircle,
    title: 'Accept Orders',
    description: 'Review buyer profiles, negotiate prices fairly, and accept orders with flexible delivery options',
    features: ['Transparent buyer information', 'Price negotiation tools', 'Delivery scheduling', 'Payment terms clarity'],
  },
  {
    number: 4,
    icon: Truck,
    title: 'Deliver & Get Paid',
    description: 'Coordinate pickup/delivery through our logistics partners or self-deliver. Receive payment directly within 24-48 hours',
    features: ['Multiple payment methods', 'Instant payment confirmation', 'No hidden deductions', 'Digital receipts'],
  },
];

const buyerSteps = [
  {
    number: 1,
    icon: Search,
    title: 'Browse Produce',
    description: 'Explore fresh, locally-sourced produce with photos, farmer profiles, quality grades, and transparent pricing',
    features: ['Filter by location, crop, quality', 'See farm details & practices', 'Compare prices', 'Read farmer stories'],
  },
  {
    number: 2,
    icon: ShoppingCart,
    title: 'Place Order',
    description: 'Select quantity, choose delivery date, and place order directly with farmers or cooperatives',
    features: ['Minimum order requirements', 'Bulk discounts available', 'Scheduled deliveries', 'Subscription options'],
  },
  {
    number: 3,
    icon: MapPin,
    title: 'Track Delivery',
    description: 'Real-time tracking of your order from harvest to doorstep with photo updates and ETA notifications',
    features: ['GPS tracking', 'SMS updates', 'Quality photos', 'Contact delivery partner'],
  },
  {
    number: 4,
    icon: Star,
    title: 'Enjoy & Review',
    description: 'Receive farm-fresh produce within 24 hours. Rate your experience to help farmers build reputation',
    features: ['Quality guarantee', 'Easy returns', 'Recipe suggestions', 'Loyalty rewards'],
  },
];

export function MarketplaceHowItWorks() {
  const [activeTab, setActiveTab] = useState<'farmers' | 'buyers'>('farmers');
  const steps = activeTab === 'farmers' ? farmerSteps : buyerSteps;

  return (
    <section className="section-padding bg-marketplace-gradient">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-section text-earth-dark mb-4">
            Simple, Transparent, Empowering
          </h2>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-2xl p-2 shadow-medium">
            <button
              onClick={() => setActiveTab('farmers')}
              className={cn(
                "px-8 py-4 rounded-xl font-semibold transition-all duration-300",
                activeTab === 'farmers' 
                  ? "bg-accent text-white" 
                  : "text-muted-foreground hover:text-earth-dark"
              )}
            >
              কৃষকদের জন্য (For Farmers)
            </button>
            <button
              onClick={() => setActiveTab('buyers')}
              className={cn(
                "px-8 py-4 rounded-xl font-semibold transition-all duration-300",
                activeTab === 'buyers' 
                  ? "bg-warning text-warning-foreground" 
                  : "text-muted-foreground hover:text-earth-dark"
              )}
            >
              ক্রেতাদের জন্য (For Buyers)
            </button>
          </div>
        </div>
        
        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative bg-white rounded-2xl p-6 shadow-medium hover:shadow-strong transition-all duration-300 hover:scale-[1.03]"
            >
              {/* Step Number Badge */}
              <div 
                className={cn(
                  "absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg",
                  activeTab === 'farmers' ? "bg-accent" : "bg-warning"
                )}
              >
                {step.number}
              </div>
              
              {/* Icon */}
              <div className="mt-6 mb-4 flex justify-center">
                <step.icon className={cn(
                  "w-12 h-12",
                  activeTab === 'farmers' ? "text-accent" : "text-warning"
                )} />
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-bold text-earth-dark text-center mb-3">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground text-center mb-4 leading-relaxed">
                {step.description}
              </p>
              
              {/* Features */}
              <ul className="space-y-2">
                {step.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-accent flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {/* Connector Arrow (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-accent z-10">
                  <div className="w-6 h-6 border-t-2 border-r-2 border-dashed border-accent rotate-45" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className={cn(
              "px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform",
              activeTab === 'farmers' 
                ? "bg-accent hover:bg-accent/90 text-white" 
                : "bg-warning hover:bg-warning/90 text-warning-foreground"
            )}
          >
            {activeTab === 'farmers' ? 'Start Selling Today' : 'Shop Fresh Produce'}
          </Button>
        </div>
      </div>
    </section>
  );
}
