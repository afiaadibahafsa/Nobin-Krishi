import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Sparkles, Cpu, Leaf, AlertCircle, Network, CloudSun, Check, ArrowRight, Users, Shield, ShieldCheck, Zap, Globe, Clock, Award, Dna, ClipboardCheck, TrendingUp, Rocket, AlertTriangle, Sprout, Download, FileText, ChevronRight, Quote, Play, Camera, GraduationCap, Star, Building, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
const solutions = {
  "seed-production": {
    title: "Smarter Seed Production with AI",
    titleBn: "AI দিয়ে স্মার্ট বীজ উৎপাদন",
    icon: Sparkles,
    hero: "Smarter seed production with AI, insights, and scalable field intelligence",
    description: "Optimize seed quality, predict germination rates, and ensure genetic purity through computer vision and predictive analytics",
    features: [{
      title: "Computer Vision Quality Control",
      points: ["Image analysis for defect detection", "Automated sorting and grading", "99.7% accuracy in purity testing"]
    }, {
      title: "Predictive Analytics",
      points: ["Germination rate forecasting", "Optimal storage recommendations", "Shelf-life prediction models"]
    }, {
      title: "Traceability & Certification",
      points: ["Blockchain-backed seed tracking", "Digital certification system", "Parentage verification"]
    }],
    stats: [{
      value: "35%",
      label: "Cost Reduction"
    }, {
      value: "99.7%",
      label: "Quality Accuracy"
    }, {
      value: "50%",
      label: "Faster Processing"
    }, {
      value: "Zero",
      label: "Certification Errors"
    }]
  },
  "farm-operations": {
    title: "Digitizing Farm Operations",
    titleBn: "ডিজিটাল কৃষি ব্যবস্থাপনা",
    icon: Cpu,
    hero: "From Traditional to Tech-Enabled Farming",
    description: "Transform traditional farming with IoT sensors, automated records, and real-time field monitoring for enhanced productivity",
    features: [{
      title: "IoT Sensor Network",
      points: ["Soil moisture sensors", "Weather stations", "Automated irrigation systems"]
    }, {
      title: "Digital Record Keeping",
      points: ["Planting & harvest logs", "Input usage tracking", "Labor management"]
    }, {
      title: "Real-Time Monitoring",
      points: ["Mobile app dashboard", "SMS/Email alerts", "GPS field mapping"]
    }],
    stats: [{
      value: "60%",
      label: "Time Saved on Admin"
    }, {
      value: "90%",
      label: "Reduction in Data Errors"
    }, {
      value: "45%",
      label: "Operational Efficiency"
    }, {
      value: "৳150K",
      label: "Annual Savings"
    }]
  },
  "value-digitization": {
    title: "Unlock Value with Digitization & AI",
    titleBn: "ডিজিটাইজেশন ও AI দিয়ে মূল্য সৃষ্টি",
    icon: Leaf,
    hero: "Your Farm Data is Gold",
    description: "Leverage data-driven insights to maximize crop yield, reduce waste, and increase profitability through intelligent automation",
    features: [{
      title: "Yield Optimization",
      points: ["Predictive analytics", "Resource allocation", "Crop rotation planning"]
    }, {
      title: "Cost Reduction",
      points: ["Precision agriculture", "Input optimization", "Waste elimination"]
    }, {
      title: "Market Intelligence",
      points: ["Price forecasting", "Demand prediction", "Optimal selling windows"]
    }],
    stats: [{
      value: "25%",
      label: "Yield Increase"
    }, {
      value: "40%",
      label: "Cost Reduction"
    }, {
      value: "3x",
      label: "ROI"
    }, {
      value: "Real-time",
      label: "Market Insights"
    }]
  },
  "enterprise": {
    title: "Enterprise-Grade Agri Intelligence",
    titleBn: "এন্টারপ্রাইজ কৃষি বুদ্ধিমত্তা",
    icon: Network,
    hero: "Complete Ecosystem for Agri-Food Systems",
    description: "End-to-end AI platform for agri-food systems covering cultivation, supply chain, and market intelligence",
    features: [{
      title: "Multi-Location Management",
      points: ["Centralized dashboard", "Aggregated analytics", "Cross-farm comparisons"]
    }, {
      title: "Supply Chain Integration",
      points: ["Logistics tracking", "Quality assurance", "Inventory management"]
    }, {
      title: "Compliance & Reporting",
      points: ["Regulatory compliance", "ESG reporting", "Audit trails"]
    }],
    stats: [{
      value: "99.9%",
      label: "Uptime SLA"
    }, {
      value: "24/7",
      label: "Support"
    }, {
      value: "Unlimited",
      label: "Scalability"
    }, {
      value: "Enterprise",
      label: "Security"
    }]
  },
  "biological-pest-control": {
    title: "AI-Powered Biological Pest Control",
    titleBn: "AI-চালিত বায়োলজিক্যাল পেস্ট কন্ট্রোল",
    icon: ShieldCheck,
    hero: "Protect crops naturally with AI-guided beneficial insects and biopesticides",
    description: "Identify pests instantly with AI, then use natural enemies and eco-friendly biopesticides to reduce chemicals by 70% while keeping crops, farmers, and soil safe",
    features: [{
      title: "AI Pest & Disease Recognition",
      points: ["15-second photo-based ID", "Bangladesh-specific pest library", "Severity scoring", "Growth stage awareness"]
    }, {
      title: "Natural Enemy Recommendations",
      points: ["Species-specific matches", "Release rate calculator", "Environmental suitability check", "Alternative biopesticides"]
    }, {
      title: "Local Supplier Network",
      points: ["BARI & DAE partners", "Verified IPM suppliers", "Price & availability hints", "Farmer reviews"]
    }],
    stats: [{
      value: "98.5%",
      label: "ID Accuracy"
    }, {
      value: "70%",
      label: "Chemical Reduction"
    }, {
      value: "50+",
      label: "Pests Covered"
    }, {
      value: "100%",
      label: "Bangla Support"
    }]
  },
  "climate-smart": {
    title: "Climate-Smart Agriculture",
    titleBn: "জলবায়ু-স্মার্ট কৃষি",
    icon: CloudSun,
    hero: "Adapt to Climate Change with AI",
    description: "Adapt to climate change with AI-powered weather forecasting, crop recommendations, and sustainable farming practices",
    features: [{
      title: "Weather Intelligence",
      points: ["Hyper-local forecasting", "Extreme weather alerts", "Seasonal predictions"]
    }, {
      title: "Crop Adaptation",
      points: ["Climate-resilient varieties", "Planting calendar optimization", "Risk assessment"]
    }, {
      title: "Sustainability Metrics",
      points: ["Carbon footprint tracking", "Water usage optimization", "Biodiversity monitoring"]
    }],
    stats: [{
      value: "92%",
      label: "Forecast Accuracy"
    }, {
      value: "30%",
      label: "Water Savings"
    }, {
      value: "50%",
      label: "Risk Reduction"
    }, {
      value: "Carbon",
      label: "Neutral Path"
    }]
  }
};
type SolutionKey = keyof typeof solutions;

// Enhanced Seed Production Page Component
const SeedProductionPage = () => {
  const [activeSolution, setActiveSolution] = useState("breeding");
  const [formData, setFormData] = useState({ name: "", email: "", company: "", interest: "" });

  const solutionTabs = {
    breeding: {
      title: "Accelerate Genetic Innovation with AI",
      description: "Transform your breeding programs with NobinKrishi's predictive intelligence platform. Our AI models analyze genetic markers, environmental data, and historical performance to identify climate-resilient traits 60% faster than traditional methods.",
      features: [
        "AI-Powered Trait Prediction & Genetic Matching",
        "Real-Time Trial Performance Monitoring",
        "Predictive Climate Adaptation Modeling",
        "Multi-Generational Digital Traceability",
        "Collaborative Research Portal for Global Teams"
      ],
      metrics: [
        "Reduce R&D cycles by 40%",
        "Increase trait discovery accuracy by 75%",
        "Accelerate time-to-market by 50%",
        "Ensure 100% certification readiness"
      ],
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
    },
    production: {
      title: "Scale Operations with Precision",
      description: "Optimize seed multiplication at scale with intelligent resource allocation, quality control automation, and yield prediction models that ensure consistent quality across all production sites.",
      features: [
        "Yield Optimization & Resource Allocation",
        "Automated Quality Control at Scale",
        "Multi-Location Production Management",
        "Real-Time Inventory Tracking",
        "Predictive Maintenance Scheduling"
      ],
      metrics: [
        "35% increase in production efficiency",
        "50% reduction in quality defects",
        "40% faster processing time",
        "Zero certification errors"
      ],
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80"
    },
    sales: {
      title: "Data-Driven Go-to-Market Strategies",
      description: "Leverage AI-powered market intelligence to optimize seed sales, predict regional demand, and create targeted marketing campaigns that connect the right varieties with the right farmers.",
      features: [
        "Regional Demand Heatmaps & Forecasting",
        "Competitor Analysis & Market Positioning",
        "Digital Seed Catalogs & E-Commerce",
        "Farmer Segmentation & Targeting",
        "Sales Performance Analytics"
      ],
      metrics: [
        "65% improvement in sales forecasting",
        "40% increase in conversion rates",
        "30% reduction in inventory waste",
        "25% growth in market share"
      ],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
    },
    quality: {
      title: "Automated Quality & Compliance Excellence",
      description: "Ensure regulatory compliance and seed quality through automated certification workflows, blockchain-backed traceability, and real-time audit trails that eliminate errors and accelerate approvals.",
      features: [
        "Automated Certification Workflows",
        "Blockchain-Enabled Traceability",
        "Real-Time Compliance Monitoring",
        "Digital Audit Trails",
        "Multi-Standard Regulatory Support"
      ],
      metrics: [
        "92% reduction in certification time",
        "99.7% accuracy in quality testing",
        "Zero compliance violations",
        "100% traceability coverage"
      ],
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"
    },
    sustainability: {
      title: "Climate-Smart & Sustainable Seed Production",
      description: "Track and optimize environmental impact with carbon footprint monitoring, water usage optimization, and biodiversity metrics that support ESG reporting and sustainable agriculture goals.",
      features: [
        "Carbon Footprint Tracking & Reduction",
        "Water Usage Optimization",
        "Biodiversity Monitoring",
        "ESG Reporting & Compliance",
        "Climate Risk Assessment"
      ],
      metrics: [
        "30% reduction in water usage",
        "25% decrease in carbon emissions",
        "40% improvement in biodiversity scores",
        "100% ESG compliance"
      ],
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80"
    }
  };

  const lifecycleStages = [
    { icon: Dna, title: "Genetic Breeding", description: "Identify superior seed varieties using field data analytics and AI-powered trait prediction" },
    { icon: ClipboardCheck, title: "Field Trial Management", description: "Digitize and remotely monitor seed trials for precise performance tracking and validation" },
    { icon: Shield, title: "Certification Automation", description: "Simplify regulatory compliance with real-time, plot-level digital audit trails" },
    { icon: Sparkles, title: "Quality Assurance", description: "Ensure seed quality through AI-enabled defect detection and germination rate prediction" },
    { icon: TrendingUp, title: "Demand Forecasting", description: "Predict regional demand trends and optimize production planning with market-linked AI models" },
    { icon: Rocket, title: "Market Preparation", description: "Accelerate time-to-market with predictive planning and distribution optimization" },
    { icon: AlertTriangle, title: "Risk Mitigation", description: "Reduce climate, pest, and disease risks through early-warning AI alerts" },
    { icon: Sprout, title: "Sustainability Tracking", description: "Monitor carbon footprint, water usage, and environmental impact metrics" }
  ];

  const successStories = [
    {
      company: "Bangladesh Seed Corporation",
      quote: "NobinKrishi reduced our seed certification time from 45 days to 7 days while improving accuracy by 92%.",
      metrics: ["15,000 acres digitized", "40% faster variety selection", "$2.3M operational savings"],
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80",
      logo: "BSC"
    },
    {
      company: "Regional Seed Cooperative",
      quote: "The predictive demand forecasting helped us reduce seed wastage by 65% and increase farmer satisfaction by 80%.",
      metrics: ["8,200 farmers served", "65% waste reduction", "300% ROI in first year"],
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
      logo: "RSC"
    },
    {
      company: "International Agri-Research Institute",
      quote: "Our climate resilience research accelerated dramatically with NobinKrishi's AI models identifying adaptive traits.",
      metrics: ["120+ new varieties tested", "50% faster research cycles", "35 countries data integrated"],
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
      logo: "IARI"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Breadcrumb */}
      <div className="container mx-auto px-6 pt-24 pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/solutions" className="hover:text-primary transition-colors">Solutions</Link>
          <span>/</span>
          <span className="text-primary">Smarter Seed Production with AI</span>
        </div>
      </div>

      {/* SECTION 1: HERO */}
      <section className="relative pt-32 pb-20 min-h-[600px] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80)"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D9488]/95 via-[#0D9488]/80 to-transparent"></div>
        </div>
        
        {/* Floating AI Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Dna className="absolute top-20 right-20 w-16 h-16 text-white/20 animate-float" />
          <Sparkles className="absolute top-40 left-20 w-12 h-12 text-white/20 animate-float" style={{ animationDelay: "1s" }} />
          <TrendingUp className="absolute bottom-40 right-40 w-14 h-14 text-white/20 animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Smarter Seed Production with AI, Insights, and Scalable Field Intelligence
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
              Transforming Seed Science with Artificial Intelligence and Real-Time Data Analytics
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-accent text-white hover:scale-105 transition-transform shadow-lg">
                <Play className="w-5 h-5 mr-2" />
                Book a Demo
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:scale-105 transition-transform">
                <Download className="w-5 h-5 mr-2" />
                Download Whitepaper
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHY AI SEED PRODUCTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" 
                alt="Seed variety collection" 
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-dark">
                Why AI is Revolutionizing Seed Production
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Seed companies operate in an increasingly complex ecosystem—balancing genetic innovation with climate resilience, certification compliance, and market forecasting. As weather patterns become more unpredictable, pest pressures evolve, and global regulations tighten, traditional approaches struggle to maintain pace.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The future belongs to those who embrace digital transformation and make data-driven decisions. NobinKrishi's AI-powered seed intelligence platform provides the agility, precision, and foresight needed to thrive in this new era of agriculture.
              </p>
              <ul className="space-y-4">
                {[
                  "Climate-Resilient Variety Selection",
                  "Automated Certification Workflows",
                  "Real-Time Compliance Monitoring",
                  "Predictive Market Forecasting",
                  "Risk-Mitigated Production Planning"
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-lg">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: OUR AI ADVANTAGE */}
      <section className="py-20 bg-[#F0F9F7]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-dark">
                What Makes NobinKrishi Your Ideal Seed Intelligence Partner?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Modern seed production demands unprecedented precision and speed. NobinKrishi Cloud delivers real-time agricultural intelligence that streamlines operations, enhances seed quality, and accelerates time-to-market. From digital field monitoring to climate-adaptive forecasting, we empower seed companies to cultivate smarter, scale faster, and grow more sustainably.
              </p>
              <ul className="space-y-4">
                {[
                  "AI-Driven Variety Performance Prediction",
                  "Remote Seed Plot Health Monitoring",
                  "Precision Demand Forecasting & Inventory Planning",
                  "Climate & Pest Risk Mitigation Models",
                  "Blockchain-Enabled Certification Tracking",
                  "Multi-Generational Genetic Traceability"
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-muted-foreground text-lg">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80" 
                alt="Seed germination technology" 
                className="rounded-full shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SEED LIFECYCLE INTELLIGENCE */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-dark mb-4">
              Intelligence at Every Stage of the Seed Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From genetic research to market distribution, NobinKrishi accelerates innovation while ensuring quality, compliance, and climate resilience across the entire seed production lifecycle.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {lifecycleStages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <Card 
                  key={i} 
                  className="p-6 hover:shadow-hover transition-all duration-300 hover:-translate-y-2 hover:border-accent cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent group-hover:scale-110 transition-all">
                    <Icon className="w-6 h-6 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">{stage.title}</h3>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: INTERACTIVE SOLUTION SELECTOR */}
      <section className="py-20 bg-gradient-to-br from-[#E8F5F2] to-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-primary-dark mb-12">
            Tailored AI Solutions for Every Seed Production Need
          </h2>
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <div className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-4 md:pb-0">
              {Object.keys(solutionTabs).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveSolution(key)}
                  className={`flex-shrink-0 md:w-full text-left px-6 py-4 rounded-lg transition-all whitespace-nowrap ${
                    activeSolution === key
                      ? "bg-accent text-white shadow-lg"
                      : "bg-white text-muted-foreground hover:bg-primary/5"
                  }`}
                >
                  <span className="font-semibold capitalize">{key === "breeding" ? "Breeding & Research" : key === "production" ? "Production & Multiplication" : key === "sales" ? "Sales & Marketing" : key === "quality" ? "Quality & Compliance" : "Sustainability & ESG"}</span>
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              {activeSolution && solutionTabs[activeSolution as keyof typeof solutionTabs] && (
                <div className="space-y-6 animate-fade-in">
                  <img 
                    src={solutionTabs[activeSolution as keyof typeof solutionTabs].image} 
                    alt={solutionTabs[activeSolution as keyof typeof solutionTabs].title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                  <h3 className="text-2xl font-display font-bold text-primary-dark">
                    {solutionTabs[activeSolution as keyof typeof solutionTabs].title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {solutionTabs[activeSolution as keyof typeof solutionTabs].description}
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-primary-dark">Key Features:</h4>
                      <ul className="space-y-2">
                        {solutionTabs[activeSolution as keyof typeof solutionTabs].features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-primary-dark">Impact Metrics:</h4>
                      <ul className="space-y-2">
                        {solutionTabs[activeSolution as keyof typeof solutionTabs].metrics.map((metric, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Button className="bg-accent text-white">
                    Learn More About Our {activeSolution === "breeding" ? "Breeding" : activeSolution === "production" ? "Production" : activeSolution === "sales" ? "Sales" : activeSolution === "quality" ? "Quality" : "Sustainability"} Solutions
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER LOGOS SECTION */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-primary-dark mb-12">
            Partnering with the World's Most Trusted Seed Companies
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
            {["Bayer", "Savannah", "BASF", "Syngenta", "Limagrain", "Sakata"].map((company, i) => (
              <div key={i} className="text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-xs font-semibold text-primary-dark">{company}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: SUCCESS STORIES */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-primary-dark mb-12">
            Transforming Seed Enterprises with AI Intelligence
          </h2>
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {successStories.map((story, i) => (
                <CarouselItem key={i}>
                  <Card className="p-8 h-full">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <img 
                          src={story.image} 
                          alt={story.company}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <div className="text-center">
                          <div className="inline-block px-4 py-2 bg-primary/10 rounded-lg">
                            <span className="font-bold text-primary-dark">{story.logo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="md:w-2/3 space-y-4">
                        <Quote className="w-12 h-12 text-accent/30" />
                        <p className="text-xl text-muted-foreground italic leading-relaxed">
                          "{story.quote}"
                        </p>
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                          {story.metrics.map((metric, j) => (
                            <div key={j} className="text-center">
                              <p className="text-2xl font-bold text-primary mb-1">{metric.split(" ")[0]}</p>
                              <p className="text-sm text-muted-foreground">{metric.split(" ").slice(1).join(" ")}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </section>

      {/* CASE STUDIES SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-primary-dark mb-4">
            Sector Insights with Real-Life Stories
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Explore our collection of case studies designed for Seed Production companies. Discover NobinKrishi-backed strategies to help you produce seeds smarter and improve overall agri-value chain.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Monitoring a flood resistant rice variety for climate-smart agriculture",
                image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80"
              },
              {
                title: "Savannah seeds and NobinKrishi to enhance rice production",
                image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80"
              },
              {
                title: "Data integration for near real-time insights: producing resilient seeds for global impact",
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80"
              }
            ].map((study, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-hover transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={study.image} 
                    alt={study.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-primary-dark group-hover:text-accent transition-colors">
                    {study.title}
                  </h3>
                  <Button variant="ghost" className="p-0 text-accent hover:text-accent/80">
                    Read Case Study <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
              View all case studies <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-[#F0F9F7]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-dark mb-6">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {[
                "How does NobinKrishi support the seed production lifecycle?",
                "What makes NobinKrishi Cloud unique for seed companies?",
                "How does NobinKrishi help optimize cost and reduce waste in seed production?",
                "How can NobinKrishi help improve seed sales and marketing?",
                "Does NobinKrishi support climate-smart agriculture for seed producers?",
                "Can NobinKrishi help detect and prevent counterfeit goods?"
              ].map((question, i) => (
                <Card key={i} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-primary-dark">{question}</p>
                    <span className="text-2xl text-accent">+</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: CALL TO ACTION */}
      <section className="py-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80)"
          }}
        >
          <div className="absolute inset-0 bg-[#0B6E5E]/70 backdrop-blur-sm"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white mb-4">
              Ready to Redefine Seed Production?
            </h2>
            <p className="text-xl text-center text-white/90 mb-12">
              Join 150+ seed companies already transforming their operations with NobinKrishi AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-accent text-white hover:scale-105 transition-transform shadow-lg">
                Schedule a Personalized Demo
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Download Seed Production Playbook
              </Button>
            </div>
            <Card className="p-8 bg-white/95 backdrop-blur-md">
              <h3 className="text-2xl font-display font-bold text-center text-primary-dark mb-6">
                Get Started Today
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your.email@company.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Company name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="interest">Interested In</Label>
                  <Select value={formData.interest} onValueChange={(value) => setFormData({...formData, interest: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breeding">Breeding</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full bg-accent text-white" size="lg">
                Get Started Today
              </Button>
              <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t text-sm text-muted-foreground">
                <span>ISO 27001 Certified</span>
                <span>•</span>
                <span>GDPR Compliant</span>
                <span>•</span>
                <span>256-bit Encryption</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const BiologicalPestControlPage = () => {
  const heroStats = [
    "98.5% Pest Identification Accuracy",
    "50+ Pests & Natural Solutions",
    "70% Reduction in Chemical Pesticides",
    "Available in Bangla"
  ];

  const problemCards = [
    {
      title: "Health Risks",
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      description: "Chemical exposure causes respiratory problems, skin diseases, and long-term health issues. Over 385 million pesticide poisoning cases occur annually worldwide."
    },
    {
      title: "Environmental Damage",
      icon: Leaf,
      color: "text-orange-600",
      bg: "bg-orange-100",
      description: "Pesticides kill bees and butterflies, contaminate water, destroy soil health, and create resistant super-pests that are harder to control."
    },
    {
      title: "Economic Loss",
      icon: TrendingUp,
      color: "text-amber-700",
      bg: "bg-amber-700/10",
      description: "Farmers spend ৳8,000-12,000 per season on chemicals that often fail, while beneficial insects that could help for free are killed off. Yields drop 20-30% over time."
    }
  ];

  const steps = [
    {
      title: "Instant Pest Identification",
      icon: Camera,
      description: "Snap a photo; AI identifies pests and diseases in 15 seconds with severity and growth-stage impact.",
      bullets: [
        "Whitefly, aphid, stem borer, thrips, caterpillars, +43 more",
        "Disease hints when symptoms match",
        "Severity scoring (low/medium/high)"
      ],
      cta: "Try Disease Scanner →"
    },
    {
      title: "Nature's Perfect Solution",
      icon: ShieldCheck,
      description: "AI recommends the best natural enemy with release rate, timing, and success probability.",
      bullets: [
        "Species match (e.g., Encarsia formosa for whiteflies)",
        "Release rate per area and timing",
        "Environmental suitability and success score"
      ],
      sample: true
    },
    {
      title: "Find Suppliers Near You",
      icon: MapPin,
      description: "Connect to trusted sources for biological control agents and biopesticides.",
      bullets: [
        "BARI, DAE, IPM suppliers, cooperatives",
        "Pricing hints and farmer reviews",
        "Delivery or pickup guidance"
      ],
      cta: "Find Suppliers Near Me →"
    }
  ];

  const naturalEnemies = [
    {
      name: "Encarsia formosa | এনকারসিয়া ফরমোসা",
      targets: "Whiteflies",
      effectiveness: "⭐⭐⭐⭐⭐ (92%)",
      env: "Greenhouse tomato, cucumber, pepper",
      availability: "Contact BARI | Import",
      image: "https://www.koppert.com/content/_processed_/3/9/csm_Enermix_74332a4a2f.jpg"
    },
    {
      name: "Seven-Spotted Ladybug | সাত ফোঁটা লেডিবাগ",
      targets: "Aphids, scale insects, mealybugs",
      effectiveness: "⭐⭐⭐⭐⭐ (88%)",
      env: "Open field & greenhouse",
      availability: "Naturally occurring | Local breeding",
      image: "https://www.koppert.com/content/_processed_/0/1/csm_Aphytis_10000_100ml_-_Koppert_5bdfca0da3.jpg"
    },
    {
      name: "Trichogramma spp. | ট্রাইকোগ্রামা",
      targets: "Moth eggs (stem/fruit borers)",
      effectiveness: "⭐⭐⭐⭐ (85%)",
      env: "Rice, cotton, vegetables",
      availability: "BARI produces | IPM programs",
      image: "https://www.koppert.com/content/_processed_/1/4/csm_Trianum-P_500gr_-_Koppert_c98675e3e6.jpg"
    },
    {
      name: "Bacillus thuringiensis (Bt) | বিটি ব্যাকটেরিয়া",
      targets: "Caterpillars, leaf-eating larvae",
      effectiveness: "⭐⭐⭐⭐ (80-90%)",
      env: "All crops",
      availability: "Widely available",
      image: "https://cdn.pixabay.com/photo/2013/04/23/07/08/bacteria-106583_960_720.jpg"
    }
  ];

  const trainingModules = [
    {
      title: "Introduction to BPC",
      points: ["What is biological pest control?", "Benefits over chemicals", "Bangladesh farmer success stories"],
      duration: "15 minutes | Video + Quiz"
    },
    {
      title: "Handling Beneficial Insects",
      points: ["Storage & release techniques", "Environmental needs", "Common mistakes to avoid"],
      duration: "20 minutes | Video"
    },
    {
      title: "Monitoring & Evaluation",
      points: ["Observe parasitism/predation", "Log pest reduction", "When to release more", "Combine with IPM"],
      duration: "18 minutes | Interactive"
    },
    {
      title: "Species-Specific Guides",
      points: ["Encarsia for whiteflies", "Trichogramma for borers", "Ladybugs for aphids", "Bt for caterpillars"],
      duration: "30 minutes | Guides"
    }
  ];

  const comparisonRows = [
    { factor: "Health Impact", chem: "Toxic; respiratory & skin issues", bio: "Safe; no toxicity" },
    { factor: "Environmental Impact", chem: "Kills beneficials; contaminates water/soil", bio: "Protects biodiversity; zero pollution" },
    { factor: "Pest Resistance", chem: "Resistance builds; stronger doses", bio: "Pests cannot adapt; self-sustaining" },
    { factor: "Cost (per season)", chem: "৳8,000 - 12,000; repeated sprays", bio: "৳2,000 - 4,000; minimal releases" },
    { factor: "Soil Health", chem: "Degrades soil; kills microbes", bio: "Improves soil ecosystem" },
    { factor: "Product Quality", chem: "Residues; export risk", bio: "Residue-free; premium prices" },
    { factor: "Effectiveness", chem: "60-75% temporary", bio: "80-95% lasting control" }
  ];

  const caseStudies = [
    {
      title: "Greenhouse Tomatoes",
      location: "Jessore, Bangladesh",
      quote: "Whitefly reduced by 90% and tomatoes became export-quality with Encarsia wasps.",
      farmer: "মো. করিম",
      image: "https://cdn.pixabay.com/photo/2016/04/06/05/17/tomato-1310961_960_720.jpg",
      results: ["90% whitefly reduction in 4 weeks", "৳15,000 saved", "30% yield increase", "Export certification achieved"]
    },
    {
      title: "Boro Rice",
      location: "Mymensingh, Bangladesh",
      quote: "Trichogramma controlled stem borer—no sprays needed.",
      farmer: "রহিম মিয়া",
      image: "https://cdn.pixabay.com/photo/2018/07/17/04/09/bangladesh-3543464_960_720.jpg",
      results: ["85% stem borer control", "৳6,000 saved", "25% higher yield", "Neighbors adopted"]
    },
    {
      title: "Mixed Vegetables",
      location: "Bogra, Bangladesh",
      quote: "Ladybugs + neem oil gave chemical-free veggies; buyers pay premium.",
      farmer: "ফাতেমা বেগম",
      image: "https://cdn.pixabay.com/photo/2016/02/28/20/35/fruit-1227550_960_720.jpg",
      results: ["100% chemical-free", "88% aphid control", "৳10,000/month extra", "Premium market demand"]
    }
  ];

  const pricing = [
    {
      name: "Free",
      price: "৳0 / month",
      icon: Sprout,
      highlight: false,
      features: [
        "AI pest ID (10 scans/month)",
        "Basic natural enemy recommendations",
        "Educational videos",
        "Community forum",
        "Bangla & English support"
      ],
      cta: "Start Free →"
    },
    {
      name: "Pro",
      price: "৳200 / month",
      icon: Leaf,
      highlight: true,
      subtext: "৳2,000/year — save 17%",
      features: [
        "Unlimited AI scans",
        "Advanced recommendations with release rates",
        "Local supplier database",
        "Step-by-step guides",
        "Monitoring & logging",
        "SMS release alerts",
        "Priority support",
        "BPC certification course"
      ],
      cta: "Start 30-Day Free Trial →"
    },
    {
      name: "Enterprise",
      price: "Custom",
      icon: Building,
      highlight: false,
      features: [
        "Dedicated agronomist support",
        "Custom breeding programs",
        "FMIS integration & API",
        "Bulk supplier negotiations",
        "On-site training",
        "Export certification help"
      ],
      cta: "Contact Sales →"
    }
  ];

  const faqs = [
    {
      q: "বায়োলজিক্যাল পেস্ট কন্ট্রোল কি সত্যিই কাজ করে?",
      a: "হ্যাঁ! বৈজ্ঞানিক গবেষণা দেখায় BPC 80-95% কীট নিয়ন্ত্রণ দিতে পারে। BARI-এর ফলাফল: ট্রাইকোগ্রামা ধানের কান্ড ছিদ্রকারী পোকা 85% কমায়।"
    },
    {
      q: "বাংলাদেশে ন্যাচারাল এনিমি কোথায় পাব?",
      a: "BARI, স্থানীয় উপ-সহকারী কৃষি অফিস, IPM সরবরাহকারী, এবং প্রাকৃতিকভাবে মাঠে—আমরা নিকটতম উৎস দেখাই।"
    },
    {
      q: "খরচ কত হবে?",
      a: "রাসায়নিকের তুলনায় 60-70% কম: রাসায়নিক ৳8-12k/মৌসুম বনাম BPC ৳2-4k/মৌসুম।"
    },
    {
      q: "গ্রীনহাউস ছাড়া কাজ করবে?",
      a: "হ্যাঁ! ট্রাইকোগ্রামা, লেডিবাগ, Bt খোলা মাঠে দারুণ কাজ করে; গ্রীনহাউস Encarsia-এর জন্য সেরা।"
    },
    {
      q: "AI কিভাবে সঠিক পোকা চিনবে?",
      a: "৫০,০০০+ বাংলাদেশ-নির্দিষ্ট ইমেজ দিয়ে ট্রেইনড; 98.5% সঠিকতা; অনিশ্চিত হলে বিশেষজ্ঞ যাচাই।"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section
        className="relative min-h-[80vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(27,77,62,0.9), rgba(46, 204, 112, 0.37)), url(https://images.unsplash.com/photo-1607460694867-af0c6d6f2c52?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200 mb-3">AI-Powered Natural Solutions for Pest Management</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight text-white mb-6">
              Protect Your Crops Naturally with Intelligent Biological Control
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
              Identify pests instantly with AI, get recommendations for natural enemies and eco-friendly solutions — reducing chemical use by 70% while protecting your harvest, health, and environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button size="lg" className="h-14 px-6 text-base bg-white text-emerald-800 hover:scale-[1.01]">
                <Camera className="w-5 h-5 mr-2" /> Scan Pest Now
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-6 text-base border-white text-white hover:bg-white/10">
                <Play className="w-5 h-5 mr-2" /> Watch How It Works
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 text-sm">
              {heroStats.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span className="text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 bg-[#FFF8F0]">
        <div className="container mx-auto px-6 grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3 space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">The Challenge in Modern Agriculture</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1B4D3E] leading-tight">
              Chemical Pesticides Are Harming Farmers, Crops, and Our Planet
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              For decades, farmers relied on chemical pesticides. The hidden costs are severe—health risks, environmental damage, resistant super-pests, and mounting expenses.
            </p>
            <div className="space-y-4">
              {problemCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-md flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg}`}>
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{card.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl shadow-2xl border border-white">
              <div className="h-40 bg-gradient-to-br from-amber-300/70 to-yellow-500/60 flex items-center justify-center">
                <span className="text-white font-semibold">Chemical Spray (Risk)</span>
              </div>
              <div className="h-40 bg-gradient-to-br from-emerald-200/60 to-emerald-500/70 flex items-center justify-center">
                <span className="text-white font-semibold">Beneficial Insects (Safe)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is BPC */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1B4D3E]">The Smarter, Natural Way: Biological Pest Control</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Nature already has the perfect pest control system. NobinKrishi helps you harness it with AI precision.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#E8F8F5] to-[#D5F4E6] p-10 rounded-3xl shadow-lg grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-[#1B4D3E]">What is Biological Pest Control?</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Biological Pest Control (BPC) uses natural enemies—beneficial insects, parasitic wasps, predatory mites, and microbes—to control pests. Instead of chemicals, you let nature do the work with AI guidance on timing, rates, and suitability.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm text-[#1B4D3E] font-semibold">How Nature Controls Pests</p>
              </div>
              <div className="grid grid-cols-5 gap-2 items-center text-center text-xs">
                <div className="bg-white p-3 rounded-xl shadow-sm">1. Pest attacks crop</div>
                <ArrowRight className="mx-auto text-emerald-700" />
                <div className="bg-white p-3 rounded-xl shadow-sm">2. Natural enemy released</div>
                <ArrowRight className="mx-auto text-emerald-700" />
                <div className="bg-white p-3 rounded-xl shadow-sm">3. Pest drops, crop healthy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="container mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1B4D3E]">How NobinKrishi BPC Works</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Three simple steps from scan to natural enemy to local supplier—guided by AI and verified partners.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="bg-white border-l-4 border-emerald-500 rounded-2xl p-8 shadow-sm space-y-4 relative">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-emerald-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1B4D3E]">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {step.bullets.map((b, idx) => (
                      <li key={idx} className="flex gap-2">
                        <Check className="w-4 h-4 text-emerald-600 mt-0.5" /> <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {step.sample && (
                    <div className="border rounded-xl p-4 bg-emerald-50 text-sm text-emerald-900">
                      <p className="font-semibold mb-1">Example Recommendation</p>
                      <p>Detected: Whitefly • Severity: Medium</p>
                      <p>Recommended: Encarsia formosa (Parasitic Wasp)</p>
                      <p>Success: 92% • Release: 500/1000 sq ft • Best: Morning</p>
                    </div>
                  )}
                  {step.cta && <Button variant="ghost" className="px-0 text-emerald-700">{step.cta}</Button>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Natural enemy database */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1B4D3E]">Meet Nature's Pest Controllers</h2>
            <p className="text-muted-foreground text-lg">Our AI knows 100+ beneficial organisms</p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {["All", "Parasitic Wasps", "Predatory Insects", "Beneficial Mites", "Microbial Agents", "Nematodes"].map((tab) => (
                <span key={tab} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">{tab}</span>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {naturalEnemies.map((item, i) => (
              <Card key={i} className="overflow-hidden hover:-translate-y-2 hover:shadow-lg transition-all border border-transparent hover:border-emerald-300">
                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}></div>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-[#1B4D3E]">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Targets: {item.targets}</p>
                  <p className="text-sm text-muted-foreground">Effectiveness: {item.effectiveness}</p>
                  <p className="text-xs text-muted-foreground">Environment: {item.env}</p>
                  <p className="text-xs text-emerald-700 font-medium">Availability: {item.availability}</p>
                  <Button variant="ghost" className="px-0 text-emerald-700">Learn More →</Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">View Complete Database →</Button>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="py-24 bg-[#E8F8F5]">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <GraduationCap className="w-6 h-6" />
              <span className="font-semibold">Learn How to Use Biological Control Effectively</span>
            </div>
            <h3 className="text-3xl font-display font-bold text-[#1B4D3E]">Training in Bangla & English</h3>
            <p className="text-muted-foreground">
              BPC works best when applied correctly. Get guided lessons, quizzes, and certificates recognized by DAE.
            </p>
            <div className="space-y-3">
              {trainingModules.map((m, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{m.title}</p>
                    <span className="text-xs text-muted-foreground">{m.duration}</span>
                  </div>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                    {m.points.map((p, idx) => <li key={idx}>{p}</li>)}
                  </ul>
                </Card>
              ))}
            </div>
            <Badge variant="outline" className="w-fit bg-white text-emerald-700 border-emerald-200">Earn "BPC Practitioner" Certificate</Badge>
          </div>
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1623239260654-329189722b4b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Video preview" className="w-full h-64 object-cover" />
              <button className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play className="w-8 h-8 text-emerald-700" />
                </div>
              </button>
              <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-2 rounded-lg text-sm font-semibold text-[#1B4D3E] shadow">How to Release Encarsia formosa (5:34)</div>
            </div>
            <p className="text-sm text-muted-foreground font-semibold">More Videos:</p>
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map((v) => (
                <div key={v} className="bg-white rounded-xl h-20 flex items-center justify-center text-xs text-muted-foreground shadow-sm">
                  Video {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1B4D3E]">Chemical Pesticides vs Biological Control</h2>
            <p className="text-muted-foreground">The clear winner for your farm</p>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-lg border">
            <div className="grid grid-cols-3 text-sm font-semibold bg-emerald-50">
              <div className="p-4 text-left">Factor</div>
              <div className="p-4 text-left bg-red-50">Chemical Pesticides ❌</div>
              <div className="p-4 text-left bg-[#D5F4E6]">Biological Control ✅</div>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className="grid grid-cols-3 text-sm border-t">
                <div className="p-4 font-medium bg-white">{row.factor}</div>
                <div className="p-4 bg-red-50 text-muted-foreground">{row.chem}</div>
                <div className="p-4 bg-[#E8F8F5] text-emerald-900">{row.bio}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground font-medium">
            BPC is proven to be more effective, safer, and more economical—while protecting your family and environment.
          </p>
        </div>
      </section>

      {/* Case studies */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="container mx-auto px-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1B4D3E]">Real Farmers, Real Results</h2>
            <p className="text-muted-foreground">Stories from across Bangladesh</p>
          </div>
          <Carousel className="w-full">
            <CarouselContent>
              {caseStudies.map((cs, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full flex flex-col overflow-hidden">
                    <img src={cs.image} alt={cs.title} className="h-40 w-full object-cover" />
                    <CardContent className="p-4 space-y-2 flex-1">
                      <p className="text-xs text-muted-foreground">{cs.location}</p>
                      <h3 className="text-lg font-semibold text-[#1B4D3E]">{cs.title}</h3>
                      <p className="text-sm text-muted-foreground italic">"{cs.quote}" — {cs.farmer}</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {cs.results.map((r, idx) => <li key={idx}>• {r}</li>)}
                      </ul>
                      <Button variant="ghost" className="px-0 text-emerald-700">Read Full Story →</Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1B4D3E]">Choose Your BPC Support Plan</h2>
            <p className="text-muted-foreground">Money-back guarantee if pests don’t drop 60% within 30 days.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <Card key={i} className={cn("p-6 flex flex-col gap-4", tier.highlight && "border-emerald-500 shadow-lg bg-emerald-50")}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-emerald-700" />
                    <p className="text-lg font-semibold">{tier.name}</p>
                  </div>
                  <p className="text-2xl font-bold text-[#1B4D3E]">{tier.price}</p>
                  {tier.subtext && <p className="text-xs text-emerald-700">{tier.subtext}</p>}
                  <ul className="text-sm text-muted-foreground space-y-2 flex-1">
                    {tier.features.map((f, idx) => <li key={idx} className="flex gap-2"><Check className="w-4 h-4 text-emerald-600" /> <span>{f}</span></li>)}
                  </ul>
                  <Button className={cn(tier.highlight ? "bg-emerald-700 hover:bg-emerald-800" : "bg-[#1B4D3E] hover:bg-emerald-800", "text-white")}>{tier.cta}</Button>
                </Card>
              );
            })}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            30-day trial. If BPC doesn't reduce pests by 60%, get a full refund — no questions asked.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-[#FFF8F0]">
        <div className="container mx-auto px-6 max-w-4xl space-y-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1B4D3E]">সচরাচর জিজ্ঞাসা (Frequently Asked Questions)</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#1B4D3E]">{item.q}</p>
                  <span className="text-emerald-600 text-xl">+</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1B4D3E] to-[#2ECC71] text-white">
        <div className="container mx-auto px-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold">Ready to Protect Your Crops Naturally?</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Join 12,000+ farmers using biological pest control with NobinKrishi AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-white text-emerald-800 hover:scale-[1.01]">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">Talk to BPC Expert</Button>
          </div>
          <div className="text-sm text-white/80">
            No credit card • 30-day money-back • Free Bangla support
          </div>
          <div className="flex items-center justify-center gap-6 text-xs uppercase tracking-[0.2em] text-white/70">
            <span>BARI</span><span>DAE</span><span>FAO</span><span>IPM Clubs</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const SolutionsIndex = () => {
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary/90 to-accent/80">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
            Our Solutions
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Comprehensive AI-powered solutions for every aspect of modern agriculture
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(solutions).map(([slug, solution]) => <Card key={slug} className="p-6 hover:shadow-hover transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <solution.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{solution.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{solution.titleBn}</p>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{solution.description}</p>
                <Link to={`/solutions/${slug}`}>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>)}
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
const SolutionDetail = () => {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  
  // Use enhanced page for seed-production
  if (slug === "seed-production") {
    return <SeedProductionPage />;
  }
  if (slug === "biological-pest-control") {
    return <BiologicalPestControlPage />;
  }
  
  const solution = slug ? solutions[slug as SolutionKey] : null;
  if (!solution) {
    return <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Solution not found</h1>
          <Link to="/solutions">
            <Button>Back to Solutions</Button>
          </Link>
        </div>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Banner */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-dark/95 to-primary/85">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Link to="/" className="text-primary-glow">Home</Link>
            <span>/</span>
            <Link to="/solutions" className="text-secondary-foreground">Solutions</Link>
            <span>/</span>
            <span className="text-primary">{solution.title}</span>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary-foreground">
              <solution.icon className="w-10 h-10 text-success" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 text-secondary-foreground">
                {solution.title}
              </h1>
              <p className="text-lg text-secondary-foreground">{solution.titleBn}</p>
              <p className="text-xl mt-4 max-w-2xl text-primary">{solution.hero}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <Button size="lg" className="bg-primary text-primary-foreground">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-white hover:bg-white/10 font-serif text-secondary-foreground">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-primary-dark mb-6">
              Why Choose This Solution?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {solution.description}. Our AI-powered platform delivers real-time intelligence 
              that streamlines operations, enhances quality, and accelerates time-to-market.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-center text-primary-dark mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {solution.features.map((feature, i) => <Card key={i} className="p-6">
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <ul className="space-y-3">
                  {feature.points.map((point, j) => <li key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{point}</span>
                    </li>)}
                </ul>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-center text-primary-dark mb-12">
            Results & ROI
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {solution.stats.map((stat, i) => <Card key={i} className="p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5">
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-16 bg-dark text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Why NobinKrishi?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{
            icon: Shield,
            title: "Enterprise Security",
            desc: "Bank-grade encryption and compliance"
          }, {
            icon: Zap,
            title: "Fast Implementation",
            desc: "Get started in days, not months"
          }, {
            icon: Globe,
            title: "Local Support",
            desc: "Bangla-speaking support team"
          }, {
            icon: Clock,
            title: "24/7 Availability",
            desc: "Round-the-clock system uptime"
          }, {
            icon: Users,
            title: "Expert Team",
            desc: "Agricultural scientists & engineers"
          }, {
            icon: Award,
            title: "Proven Results",
            desc: "45,000+ farmers trust us"
          }].map((item, i) => <div key={i} className="flex items-start gap-4 bg-white">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-primary">{item.desc}</p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary-dark to-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary text-center font-serif">
            Ready to Get Started?
          </h2>
          <p className="mb-8 max-w-xl mx-auto text-secondary-foreground">
            Join thousands of farmers and agribusinesses already using NobinKrishi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white bg-earth-dark text-primary-foreground">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export { SolutionsIndex, SolutionDetail };
export default SolutionsIndex;