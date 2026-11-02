import { AlertTriangle, Bug, DollarSign } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const problems = (t: (bn: string, en: string) => string) => [
  {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    stat: '30%',
    statLabel: t('উৎপাদন নষ্ট', 'Produce Wasted'),
    title: t('খাদ্য অপচয় ও অদক্ষতা', 'Food Waste & Inefficiency'),
    description: t(
      'সাপ্লাই চেইনের অদক্ষতায় বিপুল অপচয়, আর্থিক ক্ষতি এবং মিথেন নির্গমন বাড়ে যখন লাখো মানুষ অভুক্ত থাকে।',
      'Supply chain inefficiencies lead to massive waste, economic losses, and increased methane emissions while millions go hungry'
    ),
  },
  {
    icon: Bug,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    stat: '40%',
    statLabel: t('সম্ভাব্য ফলন ক্ষতি', 'Yield Loss Potential'),
    title: t('অনিশ্চিত ফসলের রোগ', 'Unpredictable Crop Diseases'),
    description: t(
      'পোকা ও রোগ দেরিতে শনাক্ত হলে ফসল নষ্ট হয়। কৃষকদের কাছে রিয়েল-টাইম সনাক্তকরণ ও প্রতিরোধের টুল নেই।',
      'Late detection of pests and diseases devastates harvests. Farmers lack real-time tools to identify and prevent crop damage'
    ),
  },
  {
    icon: DollarSign,
    color: 'text-earth-brown',
    bgColor: 'bg-earth-brown/10',
    stat: '72%',
    statLabel: t('দালালের মূল্যবৃদ্ধি', 'Price Markup by Middlemen'),
    title: t('বাজার শোষণ', 'Market Exploitation'),
    description: t(
      'প্রচলিত সাপ্লাই চেইন কৃষকদের দারিদ্রে আটকে রাখে, ক্রেতারা বেশি দাম দেয়। বাজার তথ্যের অভাবে উপার্জন সীমিত থাকে।',
      'Traditional supply chains trap farmers in poverty while consumers pay inflated prices. Lack of market intelligence limits earning potential'
    ),
  },
];

export function ProblemSection() {
  const { t } = useLanguage();
  return (
    <section className="section-padding bg-earth-cream">
      <div className="container-max px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark">
            {t('কৃষির সংকট: প্রতিদিনের চ্যালেঞ্জ', 'The Agricultural Crisis: Challenges Farmers Face Daily')}
          </h2>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {problems(t).map((problem, index) => (
            <div
              key={problem.title}
              className="problem-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 ${problem.bgColor} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <problem.icon className={`w-8 h-8 ${problem.color}`} />
              </div>

              {/* Stat */}
              <div className="mb-4">
                <span className="text-stat text-4xl lg:text-5xl text-earth-dark">{problem.stat}</span>
                <p className="text-sm text-muted-foreground mt-1">{problem.statLabel}</p>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-earth-dark mb-3">
                {problem.title}
              </h3>
              <p className="text-body">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
