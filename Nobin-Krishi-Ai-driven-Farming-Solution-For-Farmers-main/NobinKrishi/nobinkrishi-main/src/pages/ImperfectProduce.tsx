import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft, Leaf, Recycle, PiggyBank } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const imperfectProduce = [
  {
    id: 1,
    name: 'Slightly Misshapen Tomatoes',
    nameBn: 'আকৃতিতে সামান্য ভিন্ন টমেটো',
    image: 'https://www.theyoungnonno.com/cdn/shop/articles/Screen_Shot_2020-08-06_at_6.35.17_PM_1090x.png?v=1596753516',
    price: 25,
    originalPrice: 45,
    description: 'Slightly smaller than usual, but fresh and perfectly ripe. Great for cooking and salads.',
    descriptionBn: 'সামান্য ছোট কিন্তু তাজা এবং সম্পূর্ণ পাকা। রান্না এবং সালাদের জন্য চমৎকার।',
    badge: '40% Off',
    available: '120 kg',
  },
  {
    id: 2,
    name: 'Curved Cucumbers',
    nameBn: 'বাঁকা শসা',
    image: 'https://www.epicgardening.com/wp-content/uploads/2024/06/Curve-deformation-of-a-cucumber-as-a-result-of-a-thrips-sucking-insect.jpg',
    price: 30,
    originalPrice: 50,
    description: 'Naturally curved shape, same crisp texture and taste. Perfect for pickling!',
    descriptionBn: 'প্রাকৃতিকভাবে বাঁকা আকৃতি, একই কচকচে টেক্সচার এবং স্বাদ। আচারের জন্য নিখুঁত!',
    badge: '40% Off',
    available: '85 kg',
  },
  {
    id: 3,
    name: 'Smaller Potatoes',
    nameBn: 'ছোট আলু',
    image: 'https://www.veganblueberry.com/wp-content/uploads/2018/07/Roasted-baby-potatoes-11.jpg',
    price: 35,
    originalPrice: 60,
    description: 'Smaller size but same quality. Ideal for roasting whole or making curry.',
    descriptionBn: 'ছোট আকার কিন্তু একই মান। পুরো ভাজা বা তরকারি তৈরির জন্য আদর্শ।',
    badge: '42% Off',
    available: '200 kg',
  },
  {
    id: 4,
    name: 'Irregular Carrots',
    nameBn: 'অনিয়মিত গাজর',
    image: 'https://gardenerspath.com/wp-content/uploads/2020/02/Causes-of-Deformed-Carrots-and-How-to-Prevent-Them.jpg',
    price: 40,
    originalPrice: 70,
    description: 'Forked or twisted shape, but sweet and crunchy. Great for juicing and cooking.',
    descriptionBn: 'কাঁটাযুক্ত বা পাকানো আকৃতি, কিন্তু মিষ্টি এবং কচকচে। রস এবং রান্নার জন্য চমৎকার।',
    badge: '43% Off',
    available: '150 kg',
  },
  {
    id: 5,
    name: 'Blemished Apples',
    nameBn: 'ছোট দাগযুক্ত আপেল',
    image: 'https://images.squarespace-cdn.com/content/v1/51746d4de4b084de29112df8/1530673237441-RVNLSJ65PPO0DCSS7ABY/blemished+apples+make+good+cider',
    price: 80,
    originalPrice: 140,
    description: 'Minor surface blemishes, but sweet and juicy inside. Perfect for eating fresh or baking.',
    descriptionBn: 'সামান্য পৃষ্ঠের দাগ, কিন্তু ভিতরে মিষ্টি এবং রসালো। তাজা খাওয়া বা বেকিংয়ের জন্য নিখুঁত।',
    badge: '43% Off',
    available: '90 kg',
  },
  {
    id: 6,
    name: 'Odd-Shaped Bell Peppers',
    nameBn: 'অস্বাভাবিক আকৃতির ক্যাপসিকাম',
    image: 'https://gardenlady.com/wp-content/uploads/mad-hatter-cutting.jpg',
    price: 50,
    originalPrice: 85,
    description: 'Not perfectly round, but crisp and flavorful. Same nutrition, better price!',
    descriptionBn: 'পুরোপুরি গোল নয়, কিন্তু কচকচে এবং স্বাদযুক্ত। একই পুষ্টি, ভালো দাম!',
    badge: '41% Off',
    available: '75 kg',
  },
];

export default function ImperfectProduce() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Header Section */}
        <section className="section-padding bg-gradient-to-br from-warning/20 via-warning/10 to-background border-b-4 border-warning">
          <div className="container-max">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/marketplace')}
                className="hover:bg-warning/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </div>
            
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="heading-hero text-earth-brown mb-4">
                Imperfect Produce Market
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                Fresh, Affordable, Sustainable
              </p>
              <p className="text-body text-muted-foreground">
                Every year, millions of tons of perfectly nutritious produce are wasted simply because they don't look 'perfect'. 
                These cosmetically imperfect fruits and vegetables are just as fresh, tasty, and healthy — but sold at 40-50% discount.
              </p>
            </div>

            {/* Benefits Pills */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-subtle">
                <PiggyBank className="w-4 h-4 text-warning" />
                <span className="text-sm font-semibold text-earth-dark">40% Cheaper</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-subtle">
                <Leaf className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-earth-dark">Same Nutrition</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-subtle">
                <Recycle className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-earth-dark">Reduce Waste</span>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imperfectProduce.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-subtle hover:shadow-strong transition-all duration-300 hover:-translate-y-1 border border-border/50"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-warning text-warning-foreground font-semibold">
                      {item.badge}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-earth-dark mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.nameBn}
                    </p>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-earth-brown">
                        ৳{item.price}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ৳{item.originalPrice}
                      </span>
                      <span className="text-xs text-destructive font-semibold">
                        Save ৳{item.originalPrice - item.price}
                      </span>
                    </div>

                    {/* Stock Info */}
                    <div className="text-xs text-muted-foreground mb-4">
                      {item.available} available
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full bg-warning hover:bg-warning/90 text-warning-foreground font-semibold"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="section-padding bg-[#FEF3E2] border-t-4 border-warning">
          <div className="container-max">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="heading-card text-earth-brown mb-4">
                Why Choose Imperfect Produce?
              </h2>
              <p className="text-body text-muted-foreground mb-6">
                By choosing imperfect produce, you're not just saving money — you're helping reduce food waste, 
                supporting local farmers, and making a positive impact on the environment. Every purchase counts!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-subtle">
                  <div className="text-3xl font-bold text-warning mb-2">25%</div>
                  <div className="text-sm text-muted-foreground">of produce rejected for appearance</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-subtle">
                  <div className="text-3xl font-bold text-warning mb-2">৳450Cr</div>
                  <div className="text-sm text-muted-foreground">worth of food wasted annually</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-subtle">
                  <div className="text-3xl font-bold text-warning mb-2">৳200-400</div>
                  <div className="text-sm text-muted-foreground">you save per month</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

