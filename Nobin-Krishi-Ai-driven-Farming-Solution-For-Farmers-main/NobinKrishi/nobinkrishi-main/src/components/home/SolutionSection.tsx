import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const features = (t: (bn: string, en: string) => string) => [
  {
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80',
    title: t('রিয়েল-টাইমে ফসলের স্বাস্থ্য মনিটর করুন', 'Monitor Crop Health in Real-Time'),
    subtitle: t('AI-চালিত ফসল ইন্টেলিজেন্স', 'AI-Powered Crop Intelligence'),
    description: t(
      'স্যাটেলাইট, ড্রোন ও IoT সেন্সর দিয়ে পোকা শনাক্ত, স্বাস্থ্য মূল্যায়ন ও ৯২% নির্ভুলতায় ফলন পূর্বাভাস—মিনিটে হাজারো একর বিশ্লেষণ।',
      'Leverage satellite imagery, drone data, and IoT sensors to detect pests, assess crop health, and predict yields with 92% accuracy. Our computer vision models analyze thousands of acres in minutes.'
    ),
    bullets: [
      t('সেন্টিনেল-২ স্যাটেলাইট ইন্টিগ্রেশন', 'Sentinel-2 satellite integration'),
      t('Llama 3 ভিশন রোগ শনাক্তকরণ', 'Llama 3 vision disease detection'),
      t('মাল্টি-স্পেকট্রাল বিশ্লেষণ', 'Multi-spectral analysis'),
    ],
    cta: t('ক্রপ গ্রিড দেখুন', 'Explore Crop Grid'),
    ctaLink: '/crop-grid',
    reverse: false,
  },
  {
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80',
    title: t('প্রতিটি ক্ষেতের জন্য ব্যক্তিগত ইনসাইট', 'Personalized Insights for Every Field'),
    subtitle: t('বুদ্ধিমান কৃষি সুপারিশ', 'Intelligent Farming Recommendations'),
    description: t(
      'মাটি, আবহাওয়া ও ফসল অনুযায়ী সেচ, সার ও পেস্টিসাইড পরিকল্পনা—ব্যয় বাঁচিয়ে ফলন বাড়ান।',
      'Get customized recommendations for irrigation, fertilization, and pesticide application based on soil composition, weather patterns, and crop type. Save costs while maximizing yield.'
    ),
    bullets: [
      t('মাটি-নির্ভর সার পরিকল্পনা', 'Soil-specific fertilizer plans'),
      t('আবহাওয়া-ভিত্তিক সেচ সময়সূচি', 'Weather-adaptive irrigation schedules'),
      t('বাজার মূল্যের পূর্বাভাস', 'Market price predictions'),
    ],
    cta: t('ড্যাশবোর্ড ডেমো দেখুন', 'See Dashboard Demo'),
    ctaLink: '/dashboard',
    reverse: true,
  },
  {
    image: 'https://images.pexels.com/photos/1391249/pexels-photo-1391249.jpeg',
    title: t('আপনার ভাষায় কৃষি পরামর্শ', 'Agriculture Advice in Your Language'),
    subtitle: t('বাংলা ভয়েস AI সহকারী', 'Bangla Voice AI Assistant'),
    description: t(
      'বাংলা ও আঞ্চলিক উপভাষায় ভয়েস AI—প্রশ্ন করুন, সাথে সাথে উত্তর ও অডিও গাইড পান, টাইপিং ছাড়াই।',
      'Break literacy barriers with our Bangla and regional dialect voice AI. Ask questions, get instant answers, and receive audio guidance — all without typing.'
    ),
    bullets: [
      t('ন্যাচারাল ল্যাঙ্গুয়েজ বোঝে', 'Natural language understanding'),
      t('অফলাইন সক্ষম প্রতিক্রিয়া', 'Offline-capable responses'),
      t('একাধিক উপভাষা সাপোর্ট', 'Multi-dialect support'),
    ],
    cta: t('ভয়েস AI ব্যবহার করুন', 'Try Voice AI'),
    ctaLink: '/voice-ai',
    reverse: false,
  },
];

export function SolutionSection() {
  const { t } = useLanguage();
  return (
    <section className="section-padding bg-white">
      <div className="container-max px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark">
            {t('কীভাবে NobinKrishi কৃষিকে বদলে দেয়', 'How NobinKrishi Transforms Farming')}
          </h2>
          <p className="text-body mt-4 max-w-2xl mx-auto">
            {t('সমগ্র আধুনিক কৃষির জন্য তৈরি সমন্বিত AI সমাধান', 'Comprehensive AI solutions designed for every aspect of modern agriculture')}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-24">
          {features(t).map((feature, index) => (
            <div
              key={feature.title}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                feature.reverse ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image */}
              <div className={`${feature.reverse ? 'lg:order-2' : ''}`}>
                <div className="relative overflow-hidden rounded-3xl shadow-medium group">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-[300px] md:h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-earth-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* Content */}
              <div className={`${feature.reverse ? 'lg:order-1' : ''} space-y-6`}>
                <span className="text-accent font-semibold text-sm uppercase tracking-wider">
                  {feature.subtitle}
                </span>
                <h3 className="heading-card text-earth-dark">
                  {feature.title}
                </h3>
                <p className="text-body leading-relaxed">
                  {feature.description}
                </p>

                {/* Bullet Points */}
                <ul className="space-y-3">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-foreground">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to={feature.ctaLink}>
                  <Button variant="outline" className="group mt-4 border-accent text-accent hover:bg-accent hover:text-white">
                    {feature.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
