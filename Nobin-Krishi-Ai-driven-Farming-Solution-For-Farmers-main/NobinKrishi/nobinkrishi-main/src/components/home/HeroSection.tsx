import { Users, Map, Target, TrendingUp, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

const stats = (t: (bn: string, en: string) => string) => [
  { icon: Users, value: '45,000+', label: t('কৃষক', 'Farmers') },
  { icon: Map, value: '2M+', label: t('একর মনিটরিং', 'Acres Monitored') },
  { icon: Target, value: '92%', label: t('ফলন নির্ভুলতা', 'Yield Accuracy') },
  { icon: TrendingUp, value: '৳500M+', label: t('আর্থিক প্রভাব', 'Revenue Impact') },
];

export function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
  <video
    className="w-full h-full object-cover"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src="https://www.cropin.com//wp-content//uploads//2025//09//home-banner-video-updated-compressed.mp4" type="video/mp4" />
  </video>
</div>

      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-hero-gradient" />
      
      {/* Content */}
      <div className="relative z-10 container-max px-6 lg:px-12 pt-32 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="heading-hero text-white animate-fade-up">
            {t('বুদ্ধিমান কৃষির মাধ্যমে কৃষকদের শক্তিশালী করি', 'Empowering Farmers Through Intelligent Agriculture')}
          </h1>
          
          {/* Subheadline */}
          <p className="mt-6 text-xl md:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto animate-fade-up-delay-1">
            {t(
              'AI-চালিত ইনসাইট দিয়ে ফসল মনিটরিং, ফলন পূর্বাভাস ও রোগ প্রতিরোধ — ডেটা-চালিত সিদ্ধান্তে কৃষি বদলে দিচ্ছি',
              'AI-powered insights for crop monitoring, yield prediction, and disease prevention — transforming agriculture with data-driven decisions'
            )}
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-2">
            <Button 
              size="lg" 
              className="btn-cta h-14 text-lg px-8 w-full sm:w-auto"
            >
              {t('ফ্রি ট্রায়াল শুরু করুন', 'Start Your Free Trial')}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="h-14 text-lg px-8 border-2 border-white text-white hover:bg-white hover:text-earth-dark w-full sm:w-auto bg-transparent"
            >
              <Play className="w-5 h-5 mr-2" />
              {t('ডেমো দেখুন', 'Watch Demo')}
            </Button>
          </div>
        </div>
        
        {/* Stats Banner */}
        <div className="mt-16 md:mt-24 stats-banner rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats(t).map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center"
                style={{ animationDelay: `${index * 100 + 600}ms` }}
              >
                <stat.icon className="w-8 h-8 text-white/80 mx-auto mb-2" />
                <div className="text-stat text-3xl md:text-4xl text-white">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-white/80 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse-slow">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/80 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
