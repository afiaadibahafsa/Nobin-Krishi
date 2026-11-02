import { useState, useEffect, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { Mic, Send, Globe, Wifi, WifiOff, MessageSquare, CloudSun, DollarSign, Sprout, Bug, ChevronRight, Leaf, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import ErrorBoundary from "@/components/voice-ai/ErrorBoundary";

// Lazy load heavy Voice AI components to prevent initial page freeze
const LazyVoiceAIInterface = lazy(() => import("@/components/voice-ai/SimpleVoiceAIInterface"));
const LazyLanguageToggle = lazy(() => import("@/components/voice-ai/components/LanguageToggle").then(module => ({ default: module.LanguageToggle })));
const LazyCompatibilityWarning = lazy(() => import("@/components/voice-ai/components/CompatibilityWarning"));

// Lightweight loading component
const VoiceAILoader = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-[#2ECC71]" />
      <span className="text-[#2C3E50] font-medium">{message}</span>
    </div>
  </div>
);

// Quick Action Cards Data
const actionCards = [
  {
    id: "weather",
    icon: CloudSun,
    title: "আবহাওয়ার পূর্বাভাস",
    titleEn: "Weather Forecast",
    questions: [
      "আমার এলাকায় পরবর্তী ৭ দিনের আবহাওয়ার পূর্বাভাস কী?",
      "পরবর্তী ৪৮ ঘন্টায় বৃষ্টি হবে কি? আমি কি স্প্রে করা স্থগিত করব?",
      "এই সপ্তাহে প্রত্যাশিত তাপমাত্রার পরিসীমা কী?",
      "আমার অঞ্চলের জন্য কোনো চরম আবহাওয়া সতর্কতা আছে কি?",
      "আর্দ্রতার মাত্রা কী এবং এটি আমার ফসলকে কীভাবে প্রভাবিত করবে?"
    ]
  },
  {
    id: "market",
    icon: DollarSign,
    title: "বাজার মূল্য",
    titleEn: "Market Prices",
    questions: [
      "আজ ধানের বাজার মূল্য কত?",
      "আলুর সর্বোচ্চ দাম কোন বাজারে?",
      "সপ্তাহে সবজির মূল্য কেমন হবে?",
      "কখন আমার ফসল বিক্রি করলে বেশি লাভ হবে?",
      "আমার এলাকায় সবচেয়ে ভালো দাম কোথায়?"
    ]
  },
  {
    id: "crop",
    icon: Sprout,
    title: "ফসল পরামর্শ",
    titleEn: "Crop Advice",
    questions: [
      "এই মৌসুমে কোন ফসল চাষ করলে ভালো হবে?",
      "আমার জমিতে কি সার দিতে হবে?",
      "কখন বীজ বপন করা উচিত?",
      "ফসলের রোগ হলে কী করব?",
      "সেচ দেওয়ার সঠিক সময় কখন?"
    ]
  },
  {
    id: "pest",
    icon: Bug,
    title: "পোকা নিয়ন্ত্রণ",
    titleEn: "Pest Control",
    questions: [
      "আমার ফসলে কী ধরনের পোকা আক্রমণ করেছে?",
      "পোকা দমনের জন্য কোন ওষুধ ব্যবহার করব?",
      "জৈব উপায়ে কীভাবে পোকা নিয়ন্ত্রণ করব?",
      "কখন কীটনাশক স্প্রে করা উচিত?",
      "পোকা থেকে ফসল রক্ষার সেরা উপায় কী?"
    ]
  }
];

const VoiceAI = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  
  // Progressive loading states
  const [voiceAIInitialized, setVoiceAIInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'bn' | 'en'>('bn');

  // Mobile detection
  const isMobile = useIsMobile();

  // Network connectivity monitoring (Requirements 6.5)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Voice AI components only when user interacts
  const initializeVoiceAI = async () => {
    if (voiceAIInitialized || isInitializing) return;
    
    setIsInitializing(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setVoiceAIInitialized(true);
    setIsInitializing(false);
  };

  const handleCardClick = (cardId: string) => {
    setSelectedCard(selectedCard === cardId ? null : cardId);
    // Initialize Voice AI when user shows interest
    if (!voiceAIInitialized) {
      initializeVoiceAI();
    }
  };

  const handleQuestionClick = (question: string) => {
    setSelectedCard(null);
    setSelectedQuestion(question);
    // Initialize Voice AI and set the question
    if (!voiceAIInitialized) {
      initializeVoiceAI();
    }
  };

  const handleMicClick = () => {
    // Initialize Voice AI when user tries to use microphone
    if (!voiceAIInitialized) {
      initializeVoiceAI();
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Browser Compatibility Warning - Only show if Voice AI is initialized */}
      {voiceAIInitialized && (
        <ErrorBoundary language={currentLanguage}>
          <Suspense fallback={<VoiceAILoader message="Loading compatibility check..." />}>
            <LazyCompatibilityWarning 
              language={currentLanguage}
              onDismiss={() => {}}
              showDetails={false}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Custom Header */}
      <header className={cn(
        "bg-white border-b border-[#E5E7EB] shadow-sm sticky top-0 z-50",
        isMobile ? "px-4 py-3" : "px-6 py-4"
      )}>
        <div className="container mx-auto">
          <div className={cn(
            "flex items-center justify-between",
            isMobile ? "gap-2" : "gap-4"
          )}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className={cn(
                "bg-[#2ECC71] rounded-lg flex items-center justify-center",
                isMobile ? "w-8 h-8" : "w-10 h-10"
              )}>
                <Leaf className={cn(
                  "text-white",
                  isMobile ? "w-5 h-5" : "w-6 h-6"
                )} />
              </div>
              <span className={cn(
                "font-display font-bold text-[#2C3E50]",
                isMobile ? "text-lg" : "text-2xl"
              )}>
                {isMobile ? "NK" : "NobinKrishi"}
              </span>
            </Link>

            {/* Right Controls */}
            <div className={cn(
              "flex items-center",
              isMobile ? "gap-2" : "gap-4"
            )}>
              {/* Language Toggle - Only load when Voice AI is initialized */}
              {voiceAIInitialized ? (
                <ErrorBoundary language={currentLanguage}>
                  <Suspense fallback={<div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />}>
                    <LazyLanguageToggle 
                      currentLanguage={currentLanguage}
                      onLanguageChange={(lang) => setCurrentLanguage(lang)}
                      variant="switch"
                      size="sm"
                      showIcon={!isMobile}
                      showFlag={true}
                      className={cn(
                        isMobile ? "min-w-[120px]" : "min-w-[180px]"
                      )}
                    />
                  </Suspense>
                </ErrorBoundary>
              ) : (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg",
                  isMobile ? "min-w-[120px]" : "min-w-[180px]"
                )}>
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">বাংলা ⇄ English</span>
                </div>
              )}

              {/* Connected Status */}
              {!isMobile && (
                <div className={`flex items-center gap-2 ${isOnline ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}`}>
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {isOnline ? "Connected" : "Offline"}
                  </span>
                </div>
              )}

              {/* Mobile Status Indicator */}
              {isMobile && (
                <div className={`flex items-center gap-1 ${isOnline ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}`}>
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
              )}

              {/* Feedback Button - Hidden on mobile */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#2C3E50] hover:bg-[#F9FAFB]"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Feedback
                </Button>
              )}

              {/* Simple Microphone Button - No heavy features until initialized */}
              {!isMobile && (
                <div className="relative">
                  <button
                    onClick={handleMicClick}
                    className="p-2 rounded-full transition-all text-[#2C3E50] hover:bg-[#F9FAFB]"
                    title="Click to activate voice features"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        isMobile ? "pb-40" : "pb-32"
      )}>
        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="bg-[#E74C3C] text-white py-3 px-6">
            <div className="container mx-auto flex items-center justify-center gap-2">
              <WifiOff className="w-5 h-5" />
              <span className={cn(
                "font-medium",
                isMobile ? "text-sm" : "text-base"
              )}>
                No internet connection. Please check your connection.
              </span>
            </div>
          </div>
        )}
        
        <div className={cn(
          "container mx-auto py-12",
          isMobile ? "px-4 py-6" : "px-6 py-12"
        )}>
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className={cn(
              "font-display font-bold text-[#2C3E50] mb-2",
              isMobile ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
            )}>
              🌾 NobinKrishi Voice Assistant
            </h1>
            <p className={cn(
              "text-[#2C3E50]/80",
              isMobile ? "text-base" : "text-lg"
            )}>
              নবীন কৃষি ভয়েস সহায়ক
            </p>
            <p className={cn(
              "text-[#2C3E50]/70 mt-2",
              isMobile ? "text-sm" : "text-base"
            )}>
              আপনার কৃষি সহায়ক - কথা বলুন, জানুন, বাড়ান
            </p>
          </div>

          {/* Initialization Status */}
          {isInitializing && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <VoiceAILoader message="Initializing Voice AI features..." />
              </Card>
            </div>
          )}

          {/* Quick Action Cards */}
          <div className={cn(
            "grid gap-4 mb-8 max-w-5xl mx-auto",
            isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
          )}>
            {actionCards.map((card, index) => {
              const Icon = card.icon;
              const isSelected = selectedCard === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={cn(
                    "bg-white rounded-2xl flex flex-col items-center transition-all duration-300",
                    isMobile ? "p-4 min-h-[120px]" : "p-6 min-h-[140px]",
                    isSelected
                      ? "border-2 border-[#2ECC71] shadow-md scale-105"
                      : "border border-[#E5E7EB] hover:border-[#2ECC71] hover:scale-[1.02]"
                  )}
                  style={{ 
                    minHeight: isMobile ? '120px' : '140px',
                    minWidth: '44px'
                  }}
                >
                  <Icon className={cn(
                    "text-[#2ECC71] mb-4",
                    isMobile ? "w-12 h-12" : "w-16 h-16"
                  )} />
                  <p className={cn(
                    "font-medium text-[#2C3E50] text-center font-sans",
                    isMobile ? "text-sm" : "text-base"
                  )}>
                    {card.title}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Popular Questions Section */}
          {selectedCard && (
            <div className="max-w-4xl mx-auto animate-fade-up">
              <Card className="bg-white shadow-md rounded-2xl p-6 mb-8">
                <h2 className={cn(
                  "font-display font-bold text-[#2C3E50] mb-6 flex items-center gap-2",
                  isMobile ? "text-lg" : "text-xl"
                )}>
                  🎯 জনপ্রিয় প্রশ্ন
                </h2>
                <div className="space-y-3">
                  {actionCards
                    .find((c) => c.id === selectedCard)
                    ?.questions.map((question, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuestionClick(question)}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border border-[#E5E7EB]",
                          "hover:bg-[#F0F9F7] hover:border-[#2ECC71]",
                          "transition-all duration-300 flex items-center justify-between group",
                          isMobile && "p-3"
                        )}
                        style={{ minHeight: '44px' }}
                      >
                        <span className={cn(
                          "text-[#2C3E50] font-sans leading-relaxed flex-1",
                          isMobile ? "text-sm" : "text-base"
                        )}>
                          {question}
                        </span>
                        <ChevronRight className="w-5 h-5 text-[#2ECC71] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                </div>
              </Card>
            </div>
          )}

          {/* Voice AI Components - Only load when initialized */}
          {voiceAIInitialized && (
            <ErrorBoundary language={currentLanguage}>
              <Suspense fallback={<VoiceAILoader message="Loading Voice AI interface..." />}>
                <LazyVoiceAIInterface 
                  isMobile={isMobile}
                  isOnline={isOnline}
                  currentLanguage={currentLanguage}
                  onLanguageChange={setCurrentLanguage}
                  initialQuestion={selectedQuestion}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </div>
      </main>

      {/* Simple Input Section - Only show complex version when initialized */}
      {!isMobile && !voiceAIInitialized && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-lg z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <Input
                type="text"
                placeholder="Ask about weather, market prices, or farming advice..."
                className="h-12 text-base border-[#E5E7EB] rounded-xl focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                onClick={initializeVoiceAI}
              />
              <Button
                onClick={initializeVoiceAI}
                className="bg-[#2ECC71] hover:bg-[#27AE60] text-white h-12 px-4 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 h-px border-t-2 border-dotted border-[#E5E7EB]"></div>
              <button
                onClick={handleMicClick}
                className="w-16 h-16 bg-[#2ECC71] hover:bg-[#27AE60] text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <Mic className="w-8 h-8" />
              </button>
              <div className="flex-1 h-px border-t-2 border-dotted border-[#E5E7EB]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-4">
        <div className={cn(
          "container mx-auto flex items-center justify-between",
          isMobile ? "px-4" : "px-6"
        )}>
          <Link to="/" className="text-[#2ECC71] hover:text-[#27AE60] font-medium flex items-center">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
          <p className={cn(
            "text-[#2C3E50]/60",
            isMobile ? "text-xs" : "text-sm"
          )}>
            © 2025 NobinKrishi
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VoiceAI;
