import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const produceOptions = [
  { name: 'Tomato (টমেটো)', basePrice: 20 },
  { name: 'Rice (ধান)', basePrice: 25 },
  { name: 'Mango (আম)', basePrice: 35 },
  { name: 'Potato (আলু)', basePrice: 15 },
  { name: 'Onion (পেঁয়াজ)', basePrice: 18 },
];

export function MarketplacePriceCalculator() {
  const [selectedProduce, setSelectedProduce] = useState(produceOptions[0]);
  const [quantity, setQuantity] = useState([10]);

  const basePrice = selectedProduce.basePrice;
  
  // Traditional market calculations
  const middleman1 = Math.round(basePrice * 0.4);
  const middleman2 = Math.round(basePrice * 0.35);
  const wholesaler = Math.round(basePrice * 0.3);
  const retailer = Math.round(basePrice * 0.6);
  const wastage = Math.round(basePrice * 0.25);
  const traditionalTotal = basePrice + middleman1 + middleman2 + wholesaler + retailer + wastage;
  
  // NobinKrishi calculations
  const farmerPrice = Math.round(basePrice * 1.5); // Farmer gets more
  const platformFee = Math.round(farmerPrice * 0.08);
  const logistics = Math.round(basePrice * 0.12);
  const nobinTotal = farmerPrice + platformFee + logistics;
  
  const savings = traditionalTotal - nobinTotal;
  const savingsPercent = Math.round((savings / traditionalTotal) * 100);
  const farmerBenefit = farmerPrice - basePrice;
  const farmerBenefitPercent = Math.round((farmerBenefit / basePrice) * 100);

  return (
    <section className="section-padding bg-cta-gradient text-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-section mb-4">
            দাম স্বচ্ছতা ক্যালকুলেটর
          </h2>
          <p className="text-xl opacity-90">
            Price Transparency Calculator — See exactly where your money goes
          </p>
        </div>
        
        {/* Calculator Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-strong text-foreground">
          {/* Input Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <label className="block text-sm font-semibold text-earth-dark mb-3">
                Select Produce
              </label>
              <Select 
                value={selectedProduce.name}
                onValueChange={(value) => {
                  const produce = produceOptions.find(p => p.name === value);
                  if (produce) setSelectedProduce(produce);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {produceOptions.map((option) => (
                    <SelectItem key={option.name} value={option.name}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-earth-dark mb-3">
                Quantity: {quantity[0]} kg
              </label>
              <Slider
                value={quantity}
                onValueChange={setQuantity}
                min={1}
                max={50}
                step={1}
                className="mt-6"
              />
            </div>
          </div>
          
          {/* Comparison Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Traditional Market */}
            <div className="bg-destructive/5 rounded-2xl p-6">
              <h3 className="font-bold text-destructive mb-4">Traditional Market</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base farm price:</span>
                  <span className="font-medium">৳{basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Middleman 1:</span>
                  <span className="text-destructive">+৳{middleman1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Middleman 2:</span>
                  <span className="text-destructive">+৳{middleman2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wholesaler:</span>
                  <span className="text-destructive">+৳{wholesaler}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retailer markup:</span>
                  <span className="text-destructive">+৳{retailer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage/wastage:</span>
                  <span className="text-destructive">+৳{wastage}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-destructive/20 font-bold text-lg">
                  <span>Final Price:</span>
                  <span className="text-destructive">৳{traditionalTotal}/kg</span>
                </div>
              </div>
            </div>
            
            {/* NobinKrishi */}
            <div className="bg-accent/5 rounded-2xl p-6">
              <h3 className="font-bold text-accent mb-4">NobinKrishi</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Farmer price (fair):</span>
                  <span className="font-medium">৳{farmerPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform fee (8%):</span>
                  <span className="text-accent">+৳{platformFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Logistics:</span>
                  <span className="text-accent">+৳{logistics}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-accent/20 font-bold text-lg">
                  <span>Final Price:</span>
                  <span className="text-accent">৳{nobinTotal}/kg</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-accent/10 rounded-2xl p-6 text-center">
              <div className="text-sm text-muted-foreground mb-2">আপনি সাশ্রয় করছেন (Your Savings)</div>
              <div className="text-4xl font-display font-bold text-accent">
                ৳{savings}/kg ({savingsPercent}%)
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Total for {quantity[0]}kg: ৳{savings * quantity[0]}
              </div>
            </div>
            
            <div className="bg-info/10 rounded-2xl p-6 text-center">
              <div className="text-sm text-muted-foreground mb-2">কৃষক অতিরিক্ত পাচ্ছেন (Farmer Benefit)</div>
              <div className="text-4xl font-display font-bold text-info">
                ৳{farmerBenefit}/kg ({farmerBenefitPercent}%)
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Fair trade, better livelihoods
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
