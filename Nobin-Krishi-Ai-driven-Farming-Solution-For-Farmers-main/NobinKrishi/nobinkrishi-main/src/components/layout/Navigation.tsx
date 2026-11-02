import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Leaf, Sprout, BarChart3, Network, ShieldCheck, CloudSun, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';

const navItems = (t: (bn: string, en: string) => string) => [
  { name: t('হোম', 'Home'), path: '/' },
  { name: t('সোলিউশন', 'Solutions'), path: '/solutions', hasDropdown: true },
  { name: t('মার্কেটপ্লেস', 'Marketplace'), path: '/marketplace' },
  { name: t('ক্রপ গ্রিড', 'Crop Grid'), path: '/crop-grid' },
  { name: t('ভয়েস AI', 'Voice AI'), path: '/voice-ai' },
  { name: t('ড্যাশবোর্ড', 'Dashboard'), path: '/dashboard' },
  { name: t('রোগ স্ক্যানার', 'Disease Scanner'), path: '/disease-scanner' },
  { name: t('আবহাওয়া', 'Weather'), path: '/weather' },
];

const solutionItems = (t: (bn: string, en: string) => string) => [
  {
    title: t('AI দিয়ে স্মার্ট বীজ উৎপাদন', 'Smarter Seed Production with AI'),
    description: t('কম্পিউটার ভিশন ও এনালিটিক্স দিয়ে গুণগত বীজ', 'Optimize seed quality, predict germination rates, and ensure genetic purity'),
    icon: Sprout,
    path: '/solutions/seed-production',
  },
  {
    title: t('ডিজিটাল ফার্ম অপারেশন', 'Digitizing Farm Operations'),
    description: t('IoT ও রিয়েল-টাইম মনিটরিং দিয়ে আধুনিক ফার্ম', 'Transform traditional farming with IoT sensors, automated records, and real-time field monitoring'),
    icon: BarChart3,
    path: '/solutions/farm-operations',
  },
  {
    title: t('ডিজিটাইজেশন ও AI দিয়ে মূল্য উন্মুক্ত', 'Unlock Value with Digitization & AI'),
    description: t('ডেটা-চালিত ইনসাইটে ফলন ও মুনাফা বাড়ান', 'Leverage data-driven insights to maximize crop yield, reduce waste, and increase profitability'),
    icon: BarChart3,
    path: '/solutions/digitization',
  },
  {
    title: t('এন্টারপ্রাইজ এগ্রি ইন্টেলিজেন্স', 'Enterprise-Grade Agri Intelligence'),
    description: t('চাষ থেকে সাপ্লাই চেইন পর্যন্ত এন্ড-টু-এন্ড AI প্ল্যাটফর্ম', 'End-to-end AI platform for agri-food systems covering cultivation, supply chain, and market intelligence'),
    icon: Network,
    path: '/solutions/enterprise',
  },
  {
    title: t('AI-চালিত বায়োলজিক্যাল পেস্ট কন্ট্রোল', 'AI-Powered Biological Pest Control'),
    description: t('AI দিয়ে পোকা শনাক্ত করে উপকারী পোকা ও বায়োপেস্টিসাইড ব্যবহার', 'Identify pests with AI, then deploy beneficial insects and biopesticides to cut chemicals by 70%'),
    icon: ShieldCheck,
    path: '/solutions/biological-pest-control',
  },
  {
    title: t('ক্লাইমেট-স্মার্ট কৃষি', 'Climate-Smart Agriculture'),
    description: t('AI আবহাওয়া পূর্বাভাস ও টেকসই চর্চা দিয়ে জলবায়ু মানিয়ে নিন', 'Adapt to climate change with AI-powered weather forecasting, crop recommendations, and sustainable farming practices'),
    icon: CloudSun,
    path: '/solutions/climate-smart',
  },
];

export function Navigation() {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/95 backdrop-blur-md border-b border-earth-dark/10">
      <nav className="container-max h-full flex items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-serif font-bold text-earth-dark">
            NobinKrishi
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems(t).map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => item.hasDropdown && setIsDropdownOpen(true)}
              onMouseLeave={() => item.hasDropdown && setIsDropdownOpen(false)}
            >
              <Link
                to={item.path}
                className={cn(
                  'nav-link flex items-center gap-1 text-base font-medium py-2',
                  isActive(item.path) && 'text-accent font-semibold'
                )}
              >
                {item.name}
                {item.hasDropdown && (
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isDropdownOpen && 'rotate-180'
                  )} />
                )}
              </Link>

              {/* Solutions Dropdown */}
              {item.hasDropdown && isDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[800px]">
                  <div className="bg-white rounded-2xl shadow-strong p-8 grid grid-cols-2 gap-4">
                    {solutionItems(t).map((solution) => (
                      <Link
                        key={solution.title}
                        to={solution.path}
                        className="flex gap-4 p-4 rounded-xl hover:bg-earth-cream transition-all duration-200 hover:scale-[1.02] group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                          <solution.icon className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-bold text-earth-dark text-base mb-1">
                            {solution.title}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {solution.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="font-medium gap-2">
                <Languages className="w-4 h-4" />
                {language === 'bn' ? 'বাংলা' : 'English'}
          </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('bn')}>বাংলা</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-accent hover:bg-accent/90 text-white font-semibold px-6">
            {t('শুরু করুন', 'Get Started')}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-earth-dark z-40 animate-slide-in-right">
          <div className="flex flex-col p-6 gap-2">
            {navItems(t).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'text-white text-lg font-medium py-3 px-4 rounded-lg transition-colors',
                  isActive(item.path) ? 'bg-accent' : 'hover:bg-white/10'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex gap-4 mt-6">
              <Button variant="outline" className="flex-1 border-white text-white hover:bg-white hover:text-earth-dark">
                বাংলা
              </Button>
              <Button className="flex-1 bg-accent hover:bg-accent/90">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
