import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const farmerFAQs = [
  {
    question: 'নিবন্ধন করতে কী লাগে?',
    answer: 'শুধুমাত্র আপনার জাতীয় পরিচয়পত্র, মোবাইল নম্বর, এবং জমির তথ্য। নিবন্ধন সম্পূর্ণ বিনামূল্যে এবং ৫ মিনিটে সম্পন্ন হয়।',
  },
  {
    question: 'কমিশন কত?',
    answer: 'আমরা মাত্র ৮% প্ল্যাটফর্ম ফি নিই, যা প্রচলিত মধ্যস্বত্বভোগীদের ৩০-৫০% কমিশনের তুলনায় অনেক কম।',
  },
  {
    question: 'পেমেন্ট কখন পাবো?',
    answer: 'ডেলিভারি কনফার্মেশনের ২৪-৪৮ ঘন্টার মধ্যে আপনার bKash/Nagad/ব্যাংক একাউন্টে সরাসরি পেমেন্ট পাবেন।',
  },
  {
    question: 'ডেলিভারি কীভাবে হবে?',
    answer: 'আপনি নিজে ডেলিভার করতে পারেন অথবা আমাদের লজিস্টিক পার্টনারদের ব্যবহার করতে পারেন। উভয় অপশনই উপলব্ধ।',
  },
  {
    question: 'কী কী ফসল বিক্রি করতে পারি?',
    answer: 'সব ধরনের ফসল, সবজি, ফল, দুধ, ডিম, মধু — যেকোনো কৃষিজাত পণ্য বিক্রি করতে পারবেন।',
  },
];

const buyerFAQs = [
  {
    question: 'ডেলিভারি কত দিনে?',
    answer: 'স্থানীয় কৃষকদের থেকে ২৪ ঘন্টার মধ্যে, দূরের এলাকার জন্য ৪৮-৭২ ঘন্টা। প্রি-অর্ডারের ক্ষেত্রে হার্ভেস্ট ডেট অনুযায়ী।',
  },
  {
    question: 'গুণমান খারাপ হলে?',
    answer: '১০০% মানি-ব্যাক গ্যারান্টি। ডেলিভারির সময় প্রোডাক্ট চেক করুন, সমস্যা থাকলে তৎক্ষণাৎ রিটার্ন বা রিফান্ড।',
  },
  {
    question: 'ন্যূনতম অর্ডার কত?',
    answer: 'কোনো ন্যূনতম অর্ডার নেই, তবে কিছু কৃষক বাল্ক অর্ডার পছন্দ করেন। প্রোডাক্ট পেজে উল্লেখ থাকবে।',
  },
  {
    question: 'পেমেন্ট মেথড কী?',
    answer: 'bKash, Nagad, Rocket, ব্যাংক ট্রান্সফার, ক্যাশ অন ডেলিভারি, এবং কার্ড পেমেন্ট সব উপলব্ধ।',
  },
  {
    question: 'অর্গানিক প্রোডাক্ট কীভাবে চিনবো?',
    answer: 'অর্গানিক ব্যাজ দেখুন। আমরা কৃষকের চাষ পদ্ধতি যাচাই করি এবং সার্টিফিকেশন চেক করি।',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden hover:border-accent transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <span className="font-bold text-earth-dark">{question}</span>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div 
        className={cn(
          "px-6 overflow-hidden transition-all duration-300",
          isOpen ? "pb-4 max-h-40" : "max-h-0"
        )}
      >
        <p className="text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export function MarketplaceFAQ() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark mb-4">
            সচরাচর জিজ্ঞাসা
          </h2>
          <p className="text-xl text-muted-foreground">
            Frequently Asked Questions
          </p>
        </div>
        
        {/* FAQ Columns */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* For Farmers */}
          <div>
            <h3 className="text-lg font-bold text-accent mb-6 text-center">
              কৃষকদের জন্য (For Farmers)
            </h3>
            <div className="space-y-3">
              {farmerFAQs.map((faq) => (
                <FAQItem key={faq.question} {...faq} />
              ))}
            </div>
          </div>
          
          {/* For Buyers */}
          <div>
            <h3 className="text-lg font-bold text-warning mb-6 text-center">
              ক্রেতাদের জন্য (For Buyers)
            </h3>
            <div className="space-y-3">
              {buyerFAQs.map((faq) => (
                <FAQItem key={faq.question} {...faq} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
