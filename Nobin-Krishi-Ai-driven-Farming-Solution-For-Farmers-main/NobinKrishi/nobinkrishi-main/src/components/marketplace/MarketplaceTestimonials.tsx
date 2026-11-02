import { useState } from 'react';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

const farmerTestimonials = [
  {
    quote: 'NobinKrishi আমার জীবন বদলে দিয়েছে। এখন আমি সরাসরি ঢাকার বায়ারদের কাছে বিক্রি করি। মধ্যস্বত্বভোগী নেই, আয় ৫০% বেড়েছে!',
    name: 'রফিকুল ইসলাম',
    location: 'টাঙ্গাইল',
    crops: 'ধান ও সবজি',
    memberSince: '২০২৩',
    stat: '+52%',
    statLabel: 'Earnings increase',
  },
  {
    quote: 'আমার বাজার থেকে ৩০ কিমি দূরে। আগে পচনশীল সবজি নিয়ে যেতে পারতাম না। এখন অনলাইনে বিক্রি করি, ক্রেতা এসে নিয়ে যায়!',
    name: 'সালমা বেগম',
    location: 'বগুড়া',
    crops: 'সবজি',
    memberSince: '২০২৩',
    stat: '+৳18,000',
    statLabel: 'per month',
  },
  {
    quote: 'Our cooperative of 45 farmers now supplies directly to 12 restaurants in Dhaka. Revenue tripled in 8 months!',
    name: 'কামরুল হাসান',
    location: 'ফরিদপুর',
    crops: 'Mixed vegetables',
    memberSince: '২০২২',
    stat: '3×',
    statLabel: 'Revenue growth',
  },
];

const buyerTestimonials = [
  {
    quote: 'আমি প্রতি সপ্তাহে তাজা সবজি পাই যা সুপারমার্কেটের চেয়ে অর্ধেক দামে! কৃষকদের সরাসরি সাহায্য করছি এটা ভালো লাগে।',
    name: 'নাহিদা আক্তার',
    location: 'ঢাকা, মিরপুর',
    type: 'Home buyer',
    stat: '৳850',
    statLabel: 'monthly savings',
  },
  {
    quote: 'As a restaurant owner, direct farm sourcing reduced my ingredient costs by 35%. Quality is consistently excellent!',
    name: 'Imran Sheikh',
    location: 'Urban Bistro, Gulshan',
    type: 'Restaurant owner',
    stat: '৳45,000',
    statLabel: 'monthly savings',
  },
  {
    quote: 'সবজি এত টাটকা আসে যে ফ্রিজে রাখতে হয় না। আর দাম এত কম যে পরিবারের পুষ্টি উন্নত হয়েছে।',
    name: 'রুমানা খানম',
    location: 'চট্টগ্রাম',
    type: 'Home buyer',
    stat: 'Fresh',
    statLabel: 'daily delivery',
  },
];

export function MarketplaceTestimonials() {
  const [activeTab, setActiveTab] = useState<'farmers' | 'buyers'>('farmers');
  const testimonials = activeTab === 'farmers' ? farmerTestimonials : buyerTestimonials;

  return (
    <section className="section-padding bg-earth-cream">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-section text-earth-dark mb-4">
            আমাদের সম্প্রদায়ের কথা
          </h2>
          <p className="text-xl text-muted-foreground">
            Community Voices
          </p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-2xl p-2 shadow-subtle">
            <button
              onClick={() => setActiveTab('farmers')}
              className={cn(
                "px-8 py-3 rounded-xl font-semibold transition-all duration-300",
                activeTab === 'farmers' 
                  ? "bg-accent text-white" 
                  : "text-muted-foreground hover:text-earth-dark"
              )}
            >
              Farmers
            </button>
            <button
              onClick={() => setActiveTab('buyers')}
              className={cn(
                "px-8 py-3 rounded-xl font-semibold transition-all duration-300",
                activeTab === 'buyers' 
                  ? "bg-warning text-warning-foreground" 
                  : "text-muted-foreground hover:text-earth-dark"
              )}
            >
              Buyers
            </button>
          </div>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-subtle hover:shadow-medium transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-accent/20 mb-4" />
              
              {/* Quote */}
              <blockquote className="text-earth-dark font-serif italic leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-earth-dark">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                </div>
              </div>
              
              {/* Stat Badge */}
              <div className="bg-accent/10 rounded-lg p-3 flex items-center justify-between">
                <span className="text-2xl font-display font-bold text-accent">
                  {testimonial.stat}
                </span>
                <span className="text-sm text-muted-foreground">
                  {testimonial.statLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
