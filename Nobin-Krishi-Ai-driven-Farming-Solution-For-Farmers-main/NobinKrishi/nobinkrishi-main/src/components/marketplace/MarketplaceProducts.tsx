import { Star, MapPin, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const categories = ['All Produce', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Eggs', 'Honey'];

const products = [
  {
    id: 1,
    name: 'Organic Rice',
    nameBn: 'ধান',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
    badges: ['Farm Fresh', 'Organic'],
    farmer: 'রহিম মিয়া',
    location: 'ময়মনসিংহ',
    distance: '12 km',
    rating: 4.8,
    reviews: 245,
    marketPrice: 55,
    ourPrice: 20,
    available: '450 kg',
    harvested: '2 days ago',
  },
  {
    id: 2,
    name: 'Fresh Tomatoes',
    nameBn: 'টমেটো',
    image: 'https://cdn.pixabay.com/photo/2016/08/01/17/08/tomatoes-1561565_960_720.jpg',
    badges: ['Chemical-Free'],
    farmer: 'ফাতেমা বেগম',
    location: 'যশোর',
    distance: '8 km',
    rating: 4.9,
    reviews: 189,
    marketPrice: 42,
    ourPrice: 15,
    available: '280 kg',
    harvested: '1 day ago',
  },
  {
    id: 3,
    name: 'Long Beans',
    nameBn: 'বরবটি',
    image: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=400&q=80',
    badges: ['Pesticide-Free'],
    farmer: 'কামাল হোসেন',
    location: 'রাজশাহী',
    distance: '15 km',
    rating: 4.7,
    reviews: 156,
    marketPrice: 45,
    ourPrice: 18,
    available: '120 kg',
    harvested: '3 hours ago',
  },
  {
    id: 4,
    name: 'Leafy Greens',
    nameBn: 'শাক',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
    badges: ['Same Day Harvest'],
    farmer: 'সালমা খাতুন',
    location: 'দিনাজপুর',
    distance: '20 km',
    rating: 4.6,
    reviews: 98,
    marketPrice: 35,
    ourPrice: 12,
    available: '85 kg',
    harvested: 'Today',
  },
  {
    id: 5,
    name: 'Fresh Mangoes',
    nameBn: 'আম',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80',
    badges: ['Seasonal', 'Premium'],
    farmer: 'আবদুল করিম',
    location: 'চাঁপাইনবাবগঞ্জ',
    distance: '25 km',
    rating: 4.9,
    reviews: 312,
    marketPrice: 120,
    ourPrice: 45,
    available: '500 kg',
    harvested: '1 day ago',
  },
  {
    id: 6,
    name: 'Cauliflower',
    nameBn: 'ফুলকপি',
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&q=80',
    badges: ['Fresh'],
    farmer: 'নূর মোহাম্মদ',
    location: 'বগুড়া',
    distance: '18 km',
    rating: 4.5,
    reviews: 134,
    marketPrice: 60,
    ourPrice: 22,
    available: '200 kg',
    harvested: '2 days ago',
  },
  {
    id: 7,
    name: 'Eggplant',
    nameBn: 'বেগুন',
    image: 'https://cdn.pixabay.com/photo/2016/10/17/07/46/aubergine-1747124_960_720.jpg',
    badges: ['Organic'],
    farmer: 'হাসিনা বেগম',
    location: 'নরসিংদী',
    distance: '10 km',
    rating: 4.7,
    reviews: 87,
    marketPrice: 48,
    ourPrice: 16,
    available: '150 kg',
    harvested: '1 day ago',
  },
  {
    id: 8,
    name: 'Green Chili',
    nameBn: 'কাঁচা মরিচ',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&q=80',
    badges: ['Spicy', 'Fresh'],
    farmer: 'জাহাঙ্গীর আলম',
    location: 'কুমিল্লা',
    distance: '14 km',
    rating: 4.8,
    reviews: 201,
    marketPrice: 80,
    ourPrice: 25,
    available: '75 kg',
    harvested: 'Today',
  },
];

export function MarketplaceProducts() {
  const [activeCategory, setActiveCategory] = useState('All Produce');

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-section text-earth-dark mb-2">
            তাজা পণ্য এখন কিনুন
          </h2>
          <p className="text-2xl text-muted-foreground">
            Shop Fresh Now
          </p>
        </div>
        
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === category
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent"
              )}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-strong hover:border-accent group"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
                  {product.badges.map((badge) => (
                    <Badge
                      key={badge}
                      className="bg-accent text-white text-xs"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                {/* Name */}
                <h3 className="font-bold text-earth-dark text-lg">
                  {product.name} <span className="text-muted-foreground">({product.nameBn})</span>
                </h3>
                
                {/* Farmer Info */}
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-accent">
                      {product.farmer.charAt(0)}
                    </span>
                  </div>
                  <span>{product.farmer}</span>
                </div>
                
                {/* Location & Rating */}
                <div className="flex items-center justify-between mt-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {product.location} • {product.distance}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    <span className="font-medium">{product.rating}</span>
                    <span className="text-muted-foreground">({product.reviews})</span>
                  </div>
                </div>
                
                {/* Price */}
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-sm text-muted-foreground line-through">
                    ৳{product.marketPrice}/kg
                  </span>
                  <span className="text-2xl font-display font-bold text-accent">
                    ৳{product.ourPrice}/kg
                  </span>
                </div>
                <div className="text-xs text-destructive font-semibold mt-1">
                  Save ৳{product.marketPrice - product.ourPrice} ({Math.round((1 - product.ourPrice / product.marketPrice) * 100)}%)
                </div>
                
                {/* Stock Info */}
                <div className="text-xs text-muted-foreground mt-2">
                  {product.available} available • Harvested: {product.harvested}
                </div>
                
                {/* Add to Cart */}
                <Button 
                  className="w-full mt-4 bg-warning hover:bg-warning/90 text-warning-foreground font-semibold"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* View All Button */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="border-earth-dark text-earth-dark hover:bg-earth-dark hover:text-white">
            View All Produce
          </Button>
        </div>
      </div>
    </section>
  );
}
