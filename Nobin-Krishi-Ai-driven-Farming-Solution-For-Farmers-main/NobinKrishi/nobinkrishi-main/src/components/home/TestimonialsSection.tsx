import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "NobinKrishi এর পরামর্শে আমার ধান উৎপাদন ৩৫% বেড়েছে। রোগ শনাক্তকরণ ব্যবস্থা অসাধারণ!",
    name: 'রহিম মিয়া',
    location: 'ময়মনসিংহ',
    crop: 'ধান চাষী',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: "The voice AI helps me get instant advice in Bangla. I saved ₹40,000 on fertilizers this season!",
    name: 'Fatema Begum',
    location: 'Rajshahi',
    crop: 'Jute & Rice Farmer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: "Disease scanner caught blight early. Without NobinKrishi, I would have lost my entire mango harvest.",
    name: 'কামাল হোসেন',
    location: 'চাঁপাইনবাবগঞ্জ',
    crop: 'আম চাষী',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-earth-cream">
      <div className="container-max px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-earth-dark">
            Voices from the Field
          </h2>
          <p className="text-body mt-4 max-w-2xl mx-auto">
            Real stories from farmers transforming their lives with NobinKrishi
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="testimonial-card hover-lift"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="w-12 h-12 text-accent/20 mb-4" />

              {/* Quote Text */}
              <p className="text-lg text-foreground leading-relaxed italic mb-6">
                "{testimonial.quote}"
              </p>

              {/* Profile */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-accent/20"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-bold text-earth-dark text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location} | {testimonial.crop}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
