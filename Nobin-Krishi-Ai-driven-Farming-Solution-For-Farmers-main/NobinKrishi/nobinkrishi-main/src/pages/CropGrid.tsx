import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Search, Filter, Grid3X3, Droplets, Sun, Thermometer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const crops = [
  { id: 1, name: "Rice", nameBn: "ধান", scientific: "Oryza sativa", category: "cereals", season: "Kharif", water: "High", difficulty: "Medium", image: "🌾" },
  { id: 2, name: "Wheat", nameBn: "গম", scientific: "Triticum aestivum", category: "cereals", season: "Rabi", water: "Medium", difficulty: "Easy", image: "🌾" },
  { id: 3, name: "Potato", nameBn: "আলু", scientific: "Solanum tuberosum", category: "vegetables", season: "Rabi", water: "Medium", difficulty: "Easy", image: "🥔" },
  { id: 4, name: "Maize", nameBn: "ভুট্টা", scientific: "Zea mays", category: "cereals", season: "Kharif/Rabi", water: "Medium", difficulty: "Easy", image: "🌽" },
  { id: 5, name: "Cotton", nameBn: "তুলা", scientific: "Gossypium", category: "cash", season: "Kharif", water: "Medium", difficulty: "Hard", image: "🏵️" },
  { id: 6, name: "Sugarcane", nameBn: "আখ", scientific: "Saccharum officinarum", category: "cash", season: "Year-round", water: "High", difficulty: "Medium", image: "🎋" },
  { id: 7, name: "Mango", nameBn: "আম", scientific: "Mangifera indica", category: "fruits", season: "Summer", water: "Low", difficulty: "Easy", image: "🥭" },
  { id: 8, name: "Banana", nameBn: "কলা", scientific: "Musa", category: "fruits", season: "Year-round", water: "High", difficulty: "Easy", image: "🍌" },
  { id: 9, name: "Tomato", nameBn: "টমেটো", scientific: "Solanum lycopersicum", category: "vegetables", season: "Rabi", water: "Medium", difficulty: "Medium", image: "🍅" },
  { id: 10, name: "Onion", nameBn: "পেঁয়াজ", scientific: "Allium cepa", category: "vegetables", season: "Rabi", water: "Low", difficulty: "Medium", image: "🧅" },
  { id: 11, name: "Jute", nameBn: "পাট", scientific: "Corchorus", category: "cash", season: "Kharif", water: "High", difficulty: "Medium", image: "🌿" },
  { id: 12, name: "Lentil", nameBn: "মসুর", scientific: "Lens culinaris", category: "pulses", season: "Rabi", water: "Low", difficulty: "Easy", image: "🫘" },
  { id: 13, name: "Chickpea", nameBn: "ছোলা", scientific: "Cicer arietinum", category: "pulses", season: "Rabi", water: "Low", difficulty: "Easy", image: "🫛" },
  { id: 14, name: "Turmeric", nameBn: "হলুদ", scientific: "Curcuma longa", category: "spices", season: "Kharif", water: "Medium", difficulty: "Medium", image: "🟡" },
  { id: 15, name: "Chili", nameBn: "মরিচ", scientific: "Capsicum annuum", category: "spices", season: "Year-round", water: "Medium", difficulty: "Easy", image: "🌶️" },
  { id: 16, name: "Grapes", nameBn: "আঙুর", scientific: "Vitis vinifera", category: "fruits", season: "Winter", water: "Medium", difficulty: "Hard", image: "🍇" },
];

const categories = [
  { id: "all", label: "All Crops", labelBn: "সকল ফসল" },
  { id: "cereals", label: "Cereals", labelBn: "শস্য" },
  { id: "pulses", label: "Pulses", labelBn: "ডাল" },
  { id: "vegetables", label: "Vegetables", labelBn: "সবজি" },
  { id: "fruits", label: "Fruits", labelBn: "ফল" },
  { id: "cash", label: "Cash Crops", labelBn: "অর্থকরী ফসল" },
  { id: "spices", label: "Spices", labelBn: "মশলা" },
];

const CropGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCrop, setSelectedCrop] = useState<typeof crops[0] | null>(null);
  const [detailTab, setDetailTab] = useState("overview");

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.nameBn.includes(searchQuery) ||
      crop.scientific.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-primary/90 to-accent/80">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
            Crop Knowledge Grid
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Comprehensive agricultural intelligence for every crop, every region
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-20 z-40 bg-background/95 backdrop-blur-md border-b border-border py-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search crops by name, বাংলা নাম, or scientific name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground hidden md:inline">Filter:</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex flex-wrap justify-start gap-2 bg-transparent h-auto p-0">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full border border-border"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {filteredCrops.map((crop) => (
                  <div
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop)}
                    className="group bg-card rounded-card-lg p-6 border border-border hover:border-primary hover:shadow-hover transition-all duration-300 cursor-pointer hover:-translate-y-2"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                      {crop.image}
                    </div>
                    <h3 className="font-semibold text-foreground text-center mb-1">{crop.name}</h3>
                    <p className="text-sm text-muted-foreground text-center mb-1">{crop.nameBn}</p>
                    <p className="text-xs text-muted-foreground/70 text-center italic">{crop.scientific}</p>
                    
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-secondary/50 px-2 py-1 rounded-full">
                        <Sun className="w-3 h-3" /> {crop.season}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-action/10 text-action px-2 py-1 rounded-full">
                        <Droplets className="w-3 h-3" /> {crop.water}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCrops.length === 0 && (
                <div className="text-center py-16">
                  <Grid3X3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No crops found matching your criteria</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Crop Detail Modal */}
      <Dialog open={!!selectedCrop} onOpenChange={() => setSelectedCrop(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCrop && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-5xl">
                    {selectedCrop.image}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedCrop.name} ({selectedCrop.nameBn})</DialogTitle>
                    <p className="text-sm text-muted-foreground italic">{selectedCrop.scientific}</p>
                  </div>
                </div>
              </DialogHeader>

              <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-6">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="growing">Growing Guide</TabsTrigger>
                  <TabsTrigger value="pests">Pest Management</TabsTrigger>
                  <TabsTrigger value="market">Market Data</TabsTrigger>
                  <TabsTrigger value="ai">AI Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Growing Season</h4>
                      <p className="text-muted-foreground">{selectedCrop.season}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Water Requirements</h4>
                      <p className="text-muted-foreground">{selectedCrop.water}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Difficulty Level</h4>
                      <p className="text-muted-foreground">{selectedCrop.difficulty}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Category</h4>
                      <p className="text-muted-foreground capitalize">{selectedCrop.category}</p>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-6 rounded-lg">
                    <h4 className="font-semibold mb-2">Economic Importance</h4>
                    <p className="text-muted-foreground">
                      {selectedCrop.name} is a vital crop in Bangladesh's agricultural economy, 
                      contributing significantly to food security and farmer livelihoods.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="growing" className="mt-6 space-y-4">
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold">Soil Requirements</h4>
                      <p className="text-muted-foreground">Well-drained loamy soil with pH 6.0-7.0</p>
                    </div>
                    <div className="border-l-4 border-secondary pl-4">
                      <h4 className="font-semibold">Climate Needs</h4>
                      <p className="text-muted-foreground">Temperature: 20-30°C, Humidity: 60-80%</p>
                    </div>
                    <div className="border-l-4 border-action pl-4">
                      <h4 className="font-semibold">Irrigation Schedule</h4>
                      <p className="text-muted-foreground">Regular watering every 3-5 days during growing season</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pests" className="mt-6">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-4 p-4 bg-destructive/5 rounded-lg">
                      <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                        🐛
                      </div>
                      <div>
                        <h4 className="font-semibold text-destructive">Common Pests</h4>
                        <p className="text-muted-foreground">Stem borer, leaf folder, brown planthopper</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      Try AI Disease Detection →
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="market" className="mt-6">
                  <div className="text-center py-8">
                    <Thermometer className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Market data coming soon</p>
                    <p className="text-sm text-muted-foreground/70">Connect to live market prices and forecasts</p>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="mt-6">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-lg text-center">
                    <h4 className="font-semibold mb-2">AI-Powered Insights</h4>
                    <p className="text-muted-foreground mb-4">Get personalized recommendations for {selectedCrop.name} cultivation</p>
                    <Button>Generate AI Report</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CropGrid;
