import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Map, Activity, Cloud, TrendingUp, User, Bell, ChevronDown, 
  CheckCircle, AlertTriangle, Plus, Droplets, Wind, Sun, 
  MapPin, Leaf, Globe, Package, Bug, Camera, Mic, ShoppingBag,
  Zap, Sprout, Clock, Info, ShieldCheck, TrendingDown,
  CloudRain, CheckSquare, X, AlertCircle, Search, LogOut,
  Settings, BarChart3, ArrowRight, ArrowUp, ArrowDown, Sparkles,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { useLanguage } from "@/context/LanguageContext";

// Mock Data
const farms = [
  { 
    id: 1, 
    name: "উত্তর মাঠ", 
    nameEn: "North Field", 
    location: "ময়মনসিংহ", 
    locationEn: "Mymensingh", 
    area: "1.2 acres", 
    crop: "ধান (বোরো)", 
    cropEn: "Rice (Boro)", 
    health: 87, 
    plantingDate: "১৮ জানুয়ারি", 
    plantingDateEn: "January 18", 
    growthDays: 45, 
    harvestDays: 70,
    growthStage: "শীষ বের হওয়া",
    growthStageEn: "Panicle Emergence",
    coordinates: { lat: 24.7471, lng: 90.4203 }
  },
  { 
    id: 2, 
    name: "দক্ষিণ মাঠ", 
    nameEn: "South Field", 
    location: "ময়মনসিংহ", 
    locationEn: "Mymensingh", 
    area: "1.3 acres", 
    crop: "টমেটো", 
    cropEn: "Tomato", 
    health: 92, 
    plantingDate: "১৫ ডিসেম্বর", 
    plantingDateEn: "December 15", 
    growthDays: 60, 
    harvestDays: 30,
    growthStage: "ফল ধরার সময়",
    growthStageEn: "Fruiting Stage",
    coordinates: { lat: 24.7471, lng: 90.4203 }
  },
  { 
    id: 3, 
    name: "পূর্ব মাঠ", 
    nameEn: "East Field", 
    location: "ময়মনসিংহ", 
    locationEn: "Mymensingh", 
    area: "0.8 acres", 
    crop: "আলু", 
    cropEn: "Potato", 
    health: 75, 
    plantingDate: "১০ নভেম্বর", 
    plantingDateEn: "November 10", 
    growthDays: 90, 
    harvestDays: 20,
    growthStage: "কন্দ বৃদ্ধি",
    growthStageEn: "Tuber Development",
    coordinates: { lat: 24.7471, lng: 90.4203 }
  },
];

const priorityAlerts = [
  {
    id: 1,
    type: "urgent",
    title: "🚨 সতর্কতা: ব্লাস্ট রোগের ঝুঁকি",
    titleEn: "🚨 Alert: Blast Disease Risk",
    description: "আগামী ২ দিনে ধানে ব্লাস্ট রোগের সম্ভাবনা বেশি। প্রতিরোধ ব্যবস্থা দেখুন →",
    descriptionEn: "High risk of blast disease in next 2 days. View prevention measures →",
    action: "প্রতিরোধ ব্যবস্থা দেখুন",
    actionEn: "View Prevention",
    icon: AlertCircle,
  },
  {
    id: 2,
    type: "action",
    title: "💧 সেচের সময়",
    titleEn: "💧 Irrigation Time",
    description: "উত্তর মাঠে আজ বিকেলে সেচ দিন। মাটির আর্দ্রতা ৪৫%। শিডিউল করুন →",
    descriptionEn: "Irrigate North Field this evening. Soil moisture 45%. Schedule →",
    action: "শিডিউল করুন",
    actionEn: "Schedule",
    icon: Droplets,
  },
  {
    id: 3,
    type: "opportunity",
    title: "💰 বাজারে ভালো দাম",
    titleEn: "💰 Good Market Price",
    description: "টমেটোর দাম ৳৫৫/কেজি (গত সপ্তাহ থেকে ৳১২ বেশি)। এখনই বিক্রি করুন →",
    descriptionEn: "Tomato price ৳55/kg (৳12 more than last week). Sell now →",
    action: "এখনই বিক্রি করুন",
    actionEn: "Sell Now",
    icon: TrendingUp,
  },
];

const tasks = [
  { 
    id: 1, 
    title: "সেচ দিন (উত্তর মাঠ)", 
    titleEn: "Irrigate (North Field)", 
    time: "আজ ৪:০০ PM", 
    timeEn: "Today 4:00 PM", 
    type: "irrigation", 
    location: "উত্তর মাঠ", 
    locationEn: "North Field", 
    quantity: "১৫০ লিটার",
    quantityEn: "150 Liters",
    urgent: true, 
    completed: false 
  },
  { 
    id: 2, 
    title: "সার প্রয়োগ (NPK 20:10:10)", 
    titleEn: "Apply Fertilizer (NPK 20:10:10)", 
    time: "আজ সন্ধ্যা", 
    timeEn: "Today Evening", 
    type: "fertilizer", 
    location: "দক্ষিণ মাঠ", 
    locationEn: "South Field", 
    quantity: "৫ কেজি", 
    quantityEn: "5 kg", 
    urgent: false,
    completed: false 
  },
  { 
    id: 3, 
    title: "পোকা পরীক্ষা করুন", 
    titleEn: "Check for Pests", 
    time: "আগামীকাল সকাল", 
    timeEn: "Tomorrow Morning", 
    type: "inspection", 
    location: "পূর্ব মাঠ",
    locationEn: "East Field",
    completed: false 
  },
  { 
    id: 4, 
    title: "আগাছা পরিষ্কার", 
    titleEn: "Weed Removal", 
    time: "আজ ১০:০০ AM", 
    timeEn: "Today 10:00 AM", 
    type: "maintenance",
    location: "উত্তর মাঠ",
    locationEn: "North Field",
    completed: true 
  },
];

const resources = [
  { 
    type: "water", 
    label: "পানি ব্যবহার", 
    labelEn: "Water Usage", 
    value: "১,৫০০ লিটার", 
    valueEn: "1,500 Liters", 
    progress: 75, 
    target: "২,০০০ লিটার",
    targetEn: "2,000 Liters",
    comparison: -15, 
    comparisonType: "positive",
    cost: "৳৩,০০০",
    costEn: "৳3,000",
    trend: "down"
  },
  { 
    type: "fertilizer", 
    label: "সার প্রয়োগ", 
    labelEn: "Fertilizer Applied", 
    value: "১২ কেজি", 
    valueEn: "12 kg", 
    progress: 60, 
    target: "২০ কেজি",
    targetEn: "20 kg",
    comparison: 0, 
    comparisonType: "neutral",
    cost: "৳২,৪০০",
    costEn: "৳2,400",
    trend: "neutral"
  },
  { 
    type: "pesticide", 
    label: "কীটনাশক", 
    labelEn: "Pesticide", 
    value: "২.৫ লিটার", 
    valueEn: "2.5 Liters", 
    progress: 40, 
    target: "৬ লিটার",
    targetEn: "6 Liters",
    comparison: -30, 
    comparisonType: "positive",
    cost: "৳১,৫০০",
    costEn: "৳1,500",
    trend: "down"
  },
];

const weatherForecast = [
  { day: "আজ", dayEn: "Today", icon: Cloud, high: 32, low: 24, rain: 65, humidity: 78, wind: 12, uv: 7 },
  { day: "আগামীকাল", dayEn: "Tomorrow", icon: CloudRain, high: 30, low: 23, rain: 85, humidity: 82, wind: 15, uv: 5 },
  { day: "রবিবার", dayEn: "Sunday", icon: Sun, high: 33, low: 25, rain: 20, humidity: 65, wind: 8, uv: 9 },
  { day: "সোমবার", dayEn: "Monday", icon: Sun, high: 34, low: 26, rain: 15, humidity: 60, wind: 10, uv: 9 },
  { day: "মঙ্গলবার", dayEn: "Tuesday", icon: Cloud, high: 31, low: 24, rain: 40, humidity: 70, wind: 11, uv: 7 },
  { day: "বুধবার", dayEn: "Wednesday", icon: CloudRain, high: 29, low: 22, rain: 70, humidity: 85, wind: 18, uv: 4 },
  { day: "বৃহস্পতিবার", dayEn: "Thursday", icon: Sun, high: 32, low: 25, rain: 25, humidity: 68, wind: 9, uv: 8 },
];

const aiRecommendations = [
  {
    id: 1,
    priority: "urgent",
    title: "ব্লাস্ট রোগের উচ্চ ঝুঁকি",
    titleEn: "High Blast Disease Risk",
    description: "আগামী ২-৩ দিনে উচ্চ আর্দ্রতা এবং তাপমাত্রা ব্লাস্ট রোগের জন্য আদর্শ। প্রতিরোধমূলক ব্যবস্থা নিন।",
    descriptionEn: "High humidity and temperature in next 2-3 days ideal for blast disease. Take preventive measures.",
    confidence: 92,
    icon: AlertCircle,
    actions: [
      { label: "প্রতিরোধ পরিকল্পনা দেখুন", labelEn: "View Prevention Plan", icon: ShieldCheck, primary: true },
      { label: "আরও জানুন", labelEn: "Learn More", icon: Info, primary: false },
    ],
  },
  {
    id: 2,
    priority: "medium",
    title: "অতিরিক্ত নাইট্রোজেন প্রয়োগ",
    titleEn: "Apply Additional Nitrogen",
    description: "আপনার ফসল গত সপ্তাহে প্রত্যাশিত হারে বৃদ্ধি পায়নি। অতিরিক্ত ১ কেজি ইউরিয়া প্রয়োগ করুন।",
    descriptionEn: "Your crop hasn't grown at expected rate last week. Apply additional 1 kg urea.",
    confidence: 87,
    icon: Sprout,
    actions: [
      { label: "কাজের তালিকায় যোগ করুন", labelEn: "Add to Tasks", icon: Plus, primary: true },
    ],
  },
  {
    id: 3,
    priority: "low",
    title: "বাজারে ভালো দাম",
    titleEn: "Good Market Price",
    description: "টমেটোর বর্তমান বাজার মূল্য গত ২ সপ্তাহের সর্বোচ্চ। ফসল তোলার পরিকল্পনা করুন।",
    descriptionEn: "Current tomato market price is highest in last 2 weeks. Plan harvest.",
    confidence: 78,
    icon: TrendingUp,
    actions: [
      { label: "মার্কেটপ্লেসে তালিকাভুক্ত করুন", labelEn: "List on Marketplace", icon: ShoppingBag, primary: true },
    ],
  },
];

const marketPrices = [
  { crop: "ধান (বোরো)", cropEn: "Rice (Boro)", icon: "🌾", price: "৳৩২/কেজি", priceEn: "৳32/kg", change: "+৳৫ (১৮%)", changeEn: "+৳5 (18%)", trend: "up", time: "২ ঘণ্টা আগে", timeEn: "2 hours ago" },
  { crop: "টমেটো", cropEn: "Tomato", icon: "🍅", price: "৳৫৫/কেজি", priceEn: "৳55/kg", change: "+৳১২ (২৮%)", changeEn: "+৳12 (28%)", trend: "up", time: "১ ঘণ্টা আগে", timeEn: "1 hour ago" },
  { crop: "আলু", cropEn: "Potato", icon: "🥔", price: "৳২৮/কেজি", priceEn: "৳28/kg", change: "-৳৩ (-৯%)", changeEn: "-৳3 (-9%)", trend: "down", time: "৩ ঘণ্টা আগে", timeEn: "3 hours ago" },
  { crop: "পাট", cropEn: "Jute", icon: "🌿", price: "৳৪,৮০০/মণ", priceEn: "৳4,800/maund", change: "±৳০", changeEn: "±৳0", trend: "neutral", time: "৫ ঘণ্টা আগে", timeEn: "5 hours ago" },
];

const recentActivity = [
  { type: "success", icon: CheckCircle, text: "সেচ সম্পন্ন - উত্তর মাঠ", textEn: "Irrigation Completed - North Field", time: "১ ঘণ্টা আগে", timeEn: "1 hour ago" },
  { type: "info", icon: Camera, text: "রোগ স্ক্যান করা হয়েছে - পাতা ঝলসানো (লিফ ব্লাইট)", textEn: "Disease Scanned - Leaf Blight", time: "৩ ঘণ্টা আগে", timeEn: "3 hours ago" },
  { type: "warning", icon: AlertTriangle, text: "সতর্কতা পাঠানো হয়েছে - উচ্চ আর্দ্রতা সতর্কতা", textEn: "Alert Sent - High Humidity Warning", time: "৫ ঘণ্টা আগে", timeEn: "5 hours ago" },
  { type: "success", icon: Package, text: "সার প্রয়োগ করা হয়েছে - NPK ৫ কেজি", textEn: "Fertilizer Applied - NPK 5 kg", time: "১ দিন আগে", timeEn: "1 day ago" },
  { type: "info", icon: ShoppingBag, text: "মার্কেটপ্লেসে তালিকাভুক্ত - টমেটো ৫০ কেজি", textEn: "Listed on Marketplace - Tomato 50 kg", time: "২ দিন আগে", timeEn: "2 days ago" },
];

const marketplaceListings = [
  { id: 1, name: "টমেটো", nameEn: "Tomato", quantity: "৫০ কেজি", quantityEn: "50 kg", price: "৳৫৫/কেজি", priceEn: "৳55/kg", status: "active", image: "🍅" },
  { id: 2, name: "ধান (বোরো)", nameEn: "Rice (Boro)", quantity: "১০০ কেজি", quantityEn: "100 kg", price: "৳৩২/কেজি", priceEn: "৳32/kg", status: "active", image: "🌾" },
  { id: 3, name: "আলু", nameEn: "Potato", quantity: "৭৫ কেজি", quantityEn: "75 kg", price: "৳২৮/কেজি", priceEn: "৳28/kg", status: "pending", image: "🥔" },
];

const aiCropRecommendations = [
  { crop: "ধান", cropEn: "Rice", suitability: 95, reason: "মাটির pH এবং জলবায়ু উপযুক্ত", reasonEn: "Soil pH and climate suitable", icon: "🌾" },
  { crop: "টমেটো", cropEn: "Tomato", suitability: 88, reason: "উচ্চ ফলন সম্ভাবনা", reasonEn: "High yield potential", icon: "🍅" },
  { crop: "আলু", cropEn: "Potato", suitability: 82, reason: "মৌসুম উপযুক্ত", reasonEn: "Season appropriate", icon: "🥔" },
];

const quickActions = [
  { id: "disease", label: "রোগ স্ক্যান", labelEn: "Disease Scanner", icon: Camera, color: "bg-red-500", link: "/disease-scanner" },
  { id: "voice", label: "ভয়েস AI", labelEn: "Voice AI", icon: Mic, color: "bg-blue-500", link: "/voice-ai" },
  { id: "weather", label: "আবহাওয়া", labelEn: "Weather", icon: Cloud, color: "bg-cyan-500", link: "/weather" },
  { id: "market", label: "বাজার", labelEn: "Market", icon: ShoppingBag, color: "bg-green-500", link: "/marketplace" },
  { id: "crops", label: "ফসল", labelEn: "Crops", icon: Sprout, color: "bg-yellow-500", link: "/crop-grid" },
  { id: "sell", label: "বিক্রি করুন", labelEn: "Sell", icon: TrendingUp, color: "bg-purple-500", link: "/marketplace" },
];

const fieldZones = [
  {
    id: "north-zone",
    name: "জোন ১ - উত্তর",
    nameEn: "Zone 1 - North",
    crop: "ধান (বোরো)",
    cropEn: "Rice (Boro)",
    area: "0.6 acres",
    health: 82,
    plantingDate: "১৮ জানুয়ারি",
    plantingDateEn: "January 18",
    status: "healthy",
  },
  {
    id: "south-zone",
    name: "জোন ২ - দক্ষিণ",
    nameEn: "Zone 2 - South",
    crop: "টমেটো",
    cropEn: "Tomato",
    area: "0.7 acres",
    health: 64,
    plantingDate: "১৫ ডিসেম্বর",
    plantingDateEn: "December 15",
    status: "warning",
  },
];

const Dashboard = () => {
  const { language, setLanguage, t } = useLanguage();
  const [selectedFarm, setSelectedFarm] = useState(farms[0]);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [ripple, setRipple] = useState(false);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  const [taskCompletions, setTaskCompletions] = useState<number[]>([]);
  const [activeSection, setActiveSection] = useState<"overview" | "fields" | "monitoring" | "resources" | "labor" | "listings">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<"summer" | "monsoon" | "winter" | "spring">("monsoon");
  const [selectedZone, setSelectedZone] = useState<string>(fieldZones[0].id);

  const handleDismissAlert = (id: number) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const handleMicClick = () => {
    setIsListening(!isListening);
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
  };

  const handleTaskToggle = (taskId: number) => {
    if (taskCompletions.includes(taskId)) {
      setTaskCompletions(taskCompletions.filter(id => id !== taskId));
    } else {
      setTaskCompletions([...taskCompletions, taskId]);
    }
  };

  const currentWeather = weatherForecast[0];
  const activeAlerts = priorityAlerts.filter(alert => !dismissedAlerts.includes(alert.id));
  const visibleTasks = tasks.filter(task => !taskCompletions.includes(task.id) || !task.completed);
  const stats = {
    tasksCompleted: taskCompletions.length,
    tasksPending: tasks.filter(t => !taskCompletions.includes(t.id) && !t.completed).length,
    alertsCount: activeAlerts.length,
  };

  const navItems = [
    { id: "overview", icon: BarChart3, label: "ওভারভিউ", labelEn: "Overview" },
    { id: "fields", icon: Map, label: "আমার জমি", labelEn: "My Fields" },
    { id: "monitoring", icon: Activity, label: "লাইভ মনিটরিং", labelEn: "Live Monitoring" },
    { id: "resources", icon: Droplets, label: "সম্পদ বরাদ্দ", labelEn: "Resource Allocation" },
    { id: "labor", icon: CheckSquare, label: "শ্রম ব্যবস্থাপনা", labelEn: "Labor Management" },
    { id: "listings", icon: ShoppingBag, label: "আমার তালিকা", labelEn: "My Listings" },
  ] as const;

  const renderOverview = () => (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* LEFT COLUMN (30%) */}
            <div className="lg:col-span-3 space-y-6">
              {/* My Farms Overview Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Map className="w-5 h-5 text-primary" />
                      {t("আমার খামার", "My Farms")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Farm Dropdown */}
                  <Select value={selectedFarm.id.toString()} onValueChange={(value) => {
                    const farm = farms.find(f => f.id.toString() === value);
                    if (farm) setSelectedFarm(farm);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id.toString()}>
                          {t(farm.name, farm.nameEn)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Satellite Map Placeholder */}
                  <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden border-2 border-border">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Map className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{t("স্যাটেলাইট ম্যাপ", "Satellite Map")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("ব্যাকএন্ড দ্বারা সংযুক্ত হবে", "Will be integrated by backend")}</p>
                      </div>
                    </div>
                    {/* Health Status Overlay Simulation */}
                    <div className="absolute top-2 right-2">
                      <Badge className={cn(
                        "bg-background/90 backdrop-blur-sm",
                        selectedFarm.health >= 80 && "text-success border-success",
                        selectedFarm.health >= 60 && selectedFarm.health < 80 && "text-warning border-warning",
                        selectedFarm.health < 60 && "text-destructive border-destructive"
                      )}>
                        {t("স্বাস্থ্য", "Health")}: {selectedFarm.health}%
                      </Badge>
                    </div>
                  </div>

                  {/* Farm Stats Grid (2x2) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t("ফসল", "Crop")}</p>
                      <p className="font-semibold text-sm">{t(selectedFarm.crop, selectedFarm.cropEn)}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t("রোপণের তারিখ", "Planting Date")}</p>
                      <p className="font-semibold text-sm">{t(selectedFarm.plantingDate, selectedFarm.plantingDateEn)}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t("বৃদ্ধির পর্যায়", "Growth Stage")}</p>
                      <p className="font-semibold text-sm text-xs">{t(selectedFarm.growthStage, selectedFarm.growthStageEn)}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t("ফসল তোলা", "Harvest")}</p>
                      <p className="font-semibold text-sm">{selectedFarm.harvestDays} {t("দিন", "days")}</p>
                    </div>
                  </div>

                  {/* Health Score Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{t("স্বাস্থ্য স্কোর", "Health Score")}</span>
                      <span className={cn(
                        "font-semibold",
                        selectedFarm.health >= 80 && "text-success",
                        selectedFarm.health >= 60 && selectedFarm.health < 80 && "text-warning",
                        selectedFarm.health < 60 && "text-destructive"
                      )}>
                        {selectedFarm.health}%
                      </span>
                    </div>
                    <Progress 
                      value={selectedFarm.health} 
                      className="h-3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Tasks Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-primary" />
                      {t("আসন্ন কাজ", "Upcoming Tasks")}
                    </span>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      {t("যোগ করুন", "Add")}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {visibleTasks.map((task) => {
                        const isCompleted = taskCompletions.includes(task.id) || task.completed;
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50",
                              isCompleted && "opacity-60"
                            )}
                          >
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => handleTaskToggle(task.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className={cn(
                                  "text-sm font-medium",
                                  isCompleted && "line-through text-muted-foreground"
                                )}>
                                  {t(task.title, task.titleEn)}
                                </p>
                                {task.urgent && (
                                  <Badge variant="destructive" className="text-xs flex-shrink-0">
                                    {t("জরুরি", "Urgent")}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {t(task.time, task.timeEn)}
                                </span>
                                {task.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {t(task.location, task.locationEn)}
                                  </span>
                                )}
                                {task.quantity && (
                                  <span>{t(task.quantity, task.quantityEn)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Resource Tracker Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    {t("সম্পদ ট্র্যাকার", "Resource Tracker")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resources.map((resource) => {
                    const Icon = resource.type === "water" ? Droplets : resource.type === "fertilizer" ? Package : Bug;
                    return (
                      <div key={resource.type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{t(resource.label, resource.labelEn)}</span>
                          </div>
                          <span className="text-sm font-semibold">{t(resource.value, resource.valueEn)}</span>
                        </div>
                        <Progress value={resource.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("লক্ষ্য", "Target")}: {t(resource.target, resource.targetEn)}</span>
                          <span>{t("খরচ", "Cost")}: {t(resource.cost, resource.costEn)}</span>
                        </div>
                        {resource.comparison !== 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            {resource.comparison < 0 ? (
                              <>
                                <TrendingDown className="w-3 h-3 text-success" />
                                <span className="text-success">{Math.abs(resource.comparison)}% {t("কম", "less")} {t("গত মাস", "than last month")}</span>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-3 h-3 text-destructive" />
                                <span className="text-destructive">{resource.comparison}% {t("বেশি", "more")} {t("গত মাস", "than last month")}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* CENTER COLUMN (40%) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Weather Forecast Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-action" />
                    {t("আবহাওয়ার পূর্বাভাস", "Weather Forecast")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Weather Display */}
                  <div className="flex items-center justify-between p-6 bg-gradient-to-br from-action/10 to-primary/10 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-7xl animate-pulse-slow">
                        {currentWeather.icon === Cloud && <Cloud className="w-20 h-20 text-action" />}
                        {currentWeather.icon === CloudRain && <CloudRain className="w-20 h-20 text-action" />}
                        {currentWeather.icon === Sun && <Sun className="w-20 h-20 text-secondary" />}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t(currentWeather.day, currentWeather.dayEn)}</p>
                        <p className="text-7xl font-bold text-foreground">{currentWeather.high}°</p>
                        <p className="text-lg text-muted-foreground">{currentWeather.low}° {t("নিম্ন", "Low")}</p>
                      </div>
                    </div>
                  </div>

                  {/* 4-item Grid: Humidity, Wind, Rain, UV */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <Droplets className="w-5 h-5 text-action mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground mb-1">{t("আর্দ্রতা", "Humidity")}</p>
                      <p className="font-semibold">{currentWeather.humidity}%</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <Wind className="w-5 h-5 text-action mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground mb-1">{t("বাতাস", "Wind")}</p>
                      <p className="font-semibold">{currentWeather.wind} {t("কিমি/ঘ", "km/h")}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <CloudRain className="w-5 h-5 text-action mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground mb-1">{t("বৃষ্টির সম্ভাবনা", "Rain Chance")}</p>
                      <p className="font-semibold">{currentWeather.rain}%</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <Sun className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground mb-1">{t("UV সূচক", "UV Index")}</p>
                      <p className="font-semibold">{currentWeather.uv}</p>
                    </div>
                  </div>

                  {/* 7-Day Forecast Cards (Horizontal Scroll) */}
                  <div>
                    <p className="text-sm font-medium mb-3">{t("৭ দিনের পূর্বাভাস", "7-Day Forecast")}</p>
                    <ScrollArea className="w-full">
                      <div className="flex gap-3 pb-2">
                        {weatherForecast.map((day, index) => {
                          const Icon = day.icon;
                          return (
                            <Card key={index} className="flex-shrink-0 w-24 p-3 text-center hover:shadow-md transition-shadow">
                              <p className="text-xs text-muted-foreground mb-2">{t(day.day, day.dayEn)}</p>
                              <Icon className="w-6 h-6 mx-auto mb-2 text-action" />
                              <p className="font-semibold text-sm">{day.high}°</p>
                              <p className="text-xs text-muted-foreground">{day.low}°</p>
                              <p className="text-xs text-muted-foreground mt-1">{day.rain}%</p>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Agricultural Advisory */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-start gap-2 mb-2">
                      <Sprout className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-primary mb-1">{t("কৃষি পরামর্শ", "Agricultural Advisory")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "আজ আবহাওয়া ফসলের জন্য অনুকূল। আগামীকাল বৃষ্টির সম্ভাবনা থাকায় সেচের পরিকল্পনা করুন।",
                            "Today's weather is favorable for crops. Plan irrigation considering tomorrow's rain chance."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t("AI পরামর্শ", "AI Recommendations")}
                    <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                      AI
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiRecommendations.map((rec) => {
                    const Icon = rec.icon;
                    return (
                      <Card
                        key={rec.id}
                        className={cn(
                          "border-2 transition-all hover:shadow-md",
                          rec.priority === "urgent" && "border-destructive/50 bg-destructive/5",
                          rec.priority === "medium" && "border-warning/50 bg-warning/5",
                          rec.priority === "low" && "border-success/50 bg-success/5"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              rec.priority === "urgent" && "bg-destructive/10",
                              rec.priority === "medium" && "bg-warning/10",
                              rec.priority === "low" && "bg-success/10"
                            )}>
                              <Icon className={cn(
                                "w-5 h-5",
                                rec.priority === "urgent" && "text-destructive",
                                rec.priority === "medium" && "text-warning",
                                rec.priority === "low" && "text-success"
                              )} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-sm">{t(rec.title, rec.titleEn)}</h4>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    rec.priority === "urgent" && "border-destructive text-destructive",
                                    rec.priority === "medium" && "border-warning text-warning",
                                    rec.priority === "low" && "border-success text-success"
                                  )}
                                >
                                  {rec.priority === "urgent" ? t("জরুরি", "Urgent") : 
                                   rec.priority === "medium" ? t("মাঝারি", "Medium") : 
                                   t("নিম্ন", "Low")}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{t(rec.description, rec.descriptionEn)}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {t("আত্মবিশ্বাস", "Confidence")}: {rec.confidence}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {rec.actions.map((action, idx) => {
                              const ActionIcon = action.icon;
                              return (
                                <Button
                                  key={idx}
                                  size="sm"
                                  variant={action.primary ? "default" : "outline"}
                                  className="h-8 text-xs"
                                >
                                  <ActionIcon className="w-3 h-3 mr-1" />
                                  {t(action.label, action.labelEn)}
                                </Button>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN (30%) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Quick Actions Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    {t("দ্রুত কাজ", "Quick Actions")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Link key={action.id} to={action.link}>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-20 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all",
                              action.color
                            )}
                          >
                            <div className={cn("p-2 rounded-lg", action.color, "text-white")}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium">{t(action.label, action.labelEn)}</span>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Market Prices Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      {t("বাজার মূল্য", "Market Prices")}
                    </span>
                    <Select defaultValue="mymensingh">
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mymensingh">{t("ময়মনসিংহ", "Mymensingh")}</SelectItem>
                        <SelectItem value="dhaka">{t("ঢাকা", "Dhaka")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {marketPrices.map((price, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{price.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{t(price.crop, price.cropEn)}</p>
                          <p className="text-xs text-muted-foreground">{t(price.time, price.timeEn)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{t(price.price, price.priceEn)}</p>
                        <div className="flex items-center gap-1 justify-end">
                          {price.trend === "up" && <ArrowUp className="w-3 h-3 text-success" />}
                          {price.trend === "down" && <ArrowDown className="w-3 h-3 text-destructive" />}
                          <span className={cn(
                            "text-xs",
                            price.trend === "up" && "text-success",
                            price.trend === "down" && "text-destructive",
                            price.trend === "neutral" && "text-muted-foreground"
                          )}>
                            {t(price.change, price.changeEn)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Voice AI Quick Access Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    {t("ভয়েস AI", "Voice AI")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <button
                    ref={micButtonRef}
                    onClick={handleMicClick}
                    className={cn(
                      "relative w-30 h-30 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all hover:scale-105 focus:outline-none focus:ring-3 focus:ring-primary focus:ring-offset-2",
                      isListening && "animate-pulse",
                      ripple && "animate-ping"
                    )}
                    style={{ width: "120px", height: "120px" }}
                    aria-label={t("মাইক্রোফোন", "Microphone")}
                  >
                    <Mic className="w-12 h-12" />
                    {ripple && (
                      <span className="absolute inset-0 rounded-full bg-primary opacity-75 animate-ping" />
                    )}
                  </button>
                  <div className="w-full space-y-2">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      {t("আমার ফসলের স্বাস্থ্য কেমন?", "How is my crop health?")}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      {t("আজ কী কাজ করতে হবে?", "What tasks do I need today?")}
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      {t("বাজারে কত দাম?", "What's the market price?")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    {t("সাম্প্রতিক কার্যক্রম", "Recent Activity")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {recentActivity.map((activity, idx) => {
                        const Icon = activity.icon;
                        return (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-full flex-shrink-0",
                              activity.type === "success" && "bg-success/10 text-success",
                              activity.type === "info" && "bg-info/10 text-info",
                              activity.type === "warning" && "bg-warning/10 text-warning"
                            )}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium mb-1">{t(activity.text, activity.textEn)}</p>
                              <p className="text-xs text-muted-foreground">{t(activity.time, activity.timeEn)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Marketplace Listings Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                      {t("আমার তালিকা", "My Listings")}
                    </span>
                    <Link to="/marketplace">
                      <Button size="sm" variant="ghost">
                        {t("সব দেখুন", "View All")} <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {marketplaceListings.map((listing) => (
                    <div key={listing.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <span className="text-3xl">{listing.image}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{t(listing.name, listing.nameEn)}</p>
                        <p className="text-xs text-muted-foreground">
                          {t(listing.quantity, listing.quantityEn)} • {t(listing.price, listing.priceEn)}
                        </p>
                      </div>
                      <Badge variant={listing.status === "active" ? "default" : "outline"} className="text-xs">
                        {listing.status === "active" ? t("সক্রিয়", "Active") : t("অপেক্ষমান", "Pending")}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Crop Recommendation Widget */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t("AI ফসল সুপারিশ", "AI Crop Recommendation")}
                    <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                      AI
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiCropRecommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{rec.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{t(rec.crop, rec.cropEn)}</p>
                          <p className="text-xs text-muted-foreground">{t(rec.reason, rec.reasonEn)}</p>
                        </div>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {rec.suitability}%
                        </Badge>
                      </div>
                      <Progress value={rec.suitability} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
  );

  const renderMyFields = () => {
    const zone = fieldZones.find((z) => z.id === selectedZone) || fieldZones[0];
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                {t("স্যাটেলাইট মানচিত্র", "Satellite Map")}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-success" />
                  {t("স্বাস্থ্যকর", "Healthy")}
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                  {t("সতর্ক", "Warning")}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[420px] bg-muted rounded-lg overflow-hidden border border-border">
              <div className="absolute top-4 left-4 bg-background/90 px-3 py-1 rounded-full text-xs shadow-sm">
                {t("জুম এবং প্যান করুন", "Zoom and pan to explore zones")}
              </div>
              {/* Map placeholder with zones */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-4">
                {fieldZones.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZone(z.id)}
                    className={cn(
                      "rounded-lg border flex items-center justify-center text-center text-sm font-semibold transition-all",
                      z.id === selectedZone && "ring-2 ring-primary",
                      z.health >= 70 ? "bg-success/20 border-success/50" : "bg-warning/20 border-warning/50"
                    )}
                  >
                    <div>
                      <p>{t(z.name, z.nameEn)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t(z.crop, z.cropEn)}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">+</Button>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">-</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              {t("জোন বিবরণ", "Zone Details")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("নাম", "Name")}</span>
              <span className="text-sm font-semibold">{t(zone.name, zone.nameEn)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("ফসল", "Crop")}</span>
              <span className="text-sm font-semibold">{t(zone.crop, zone.cropEn)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("এলাকা", "Area")}</span>
              <span className="text-sm font-semibold">{zone.area}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("রোপণের তারিখ", "Planting Date")}</span>
              <span className="text-sm font-semibold">{t(zone.plantingDate, zone.plantingDateEn)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("স্বাস্থ্য স্কোর", "Health Score")}</span>
              <Badge variant="outline" className={cn(
                zone.health >= 70 ? "border-success text-success" : "border-warning text-warning"
              )}>
                {zone.health}%
              </Badge>
            </div>
            <Button className="w-full" variant="outline">
              {t("প্রজেকশন দেখুন", "View Projection")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMonitoring = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-action" />
              {t("লাইভ আবহাওয়া ও সেন্সর", "Live Weather & Sensors")}
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "summer", label: t("গ্রীষ্ম", "Summer") },
                { id: "monsoon", label: t("বর্ষা", "Monsoon") },
                { id: "winter", label: t("শীত", "Winter") },
                { id: "spring", label: t("বসন্ত", "Spring") },
              ].map((season) => (
                <Button
                  key={season.id}
                  size="sm"
                  variant={selectedSeason === season.id ? "default" : "outline"}
                  onClick={() => setSelectedSeason(season.id as typeof selectedSeason)}
                  className="text-xs"
                >
                  {season.label}
                </Button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">{t("তাপমাত্রা", "Temperature")}</p>
              <p className="text-2xl font-bold">32°C</p>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">{t("আর্দ্রতা", "Humidity")}</p>
              <p className="text-2xl font-bold">78%</p>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">{t("বৃষ্টির পূর্বাভাস", "Rain Forecast")}</p>
              <p className="text-2xl font-bold">3 {t("দিন", "Days")}</p>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">{t("বায়ু প্রবাহ", "Wind Speed")}</p>
              <p className="text-2xl font-bold">12 {t("কিমি/ঘ", "km/h")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weatherForecast.map((day, idx) => {
              const Icon = day.icon;
              return (
                <Card key={idx} className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t(day.day, day.dayEn)}</p>
                  <Icon className="w-6 h-6 mx-auto text-action mb-1" />
                  <p className="font-semibold">{day.high}° / {day.low}°</p>
                  <p className="text-xs text-muted-foreground">{day.rain}% {t("বৃষ্টি", "rain")}</p>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {t("ক্ষেত্র স্বাস্থ্য", "Field Health")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {farms.map((farm) => (
            <div key={farm.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">{t(farm.name, farm.nameEn)}</p>
                <p className="text-xs text-muted-foreground">{t(farm.crop, farm.cropEn)}</p>
              </div>
              <Badge variant="outline" className={cn(
                farm.health >= 80 ? "border-success text-success" : farm.health >= 60 ? "border-warning text-warning" : "border-destructive text-destructive"
              )}>
                {farm.health}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderResources = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            {t("ইনপুট ব্যবহার", "Resource Usage")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resources.map((resource) => {
            const Icon = resource.type === "water" ? Droplets : resource.type === "fertilizer" ? Package : Bug;
            const overTarget = resource.progress >= 90;
            return (
              <div key={resource.type} className={cn("p-3 rounded-lg border", overTarget && "border-warning bg-warning/10")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{t(resource.label, resource.labelEn)}</span>
                  </div>
                  <span className="text-sm font-semibold">{t(resource.value, resource.valueEn)}</span>
                </div>
                <Progress value={resource.progress} className="h-2 mt-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{t("লক্ষ্য", "Target")}: {t(resource.target, resource.targetEn)}</span>
                  <span>{t("খরচ", "Cost")}: {t(resource.cost, resource.costEn)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs mt-1">
                  {resource.comparison < 0 ? (
                    <>
                      <TrendingDown className="w-3 h-3 text-success" />
                      <span className="text-success">{Math.abs(resource.comparison)}% {t("কম", "less")} {t("গত মাস", "than last month")}</span>
                    </>
                  ) : resource.comparison > 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-destructive" />
                      <span className="text-destructive">{resource.comparison}% {t("বেশি", "more")} {t("গত মাস", "than last month")}</span>
                    </>
                  ) : (
                    <span>{t("স্থিতিশীল", "Stable")}</span>
                  )}
                </div>
                {overTarget && (
                  <Badge variant="destructive" className="mt-2 text-xs">
                    {t("সতর্কতা: লক্ষ্য প্রায় শেষ", "Warning: Approaching target")}
                  </Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t("ফসল সুপারিশ ফর্ম", "Crop Recommendation Form")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("নাইট্রোজেন", "Nitrogen"), placeholder: t("মান লিখুন", "Enter value") },
              { label: t("পটাশিয়াম", "Potassium"), placeholder: t("মান লিখুন", "Enter value") },
              { label: t("ফসফরাস", "Phosphorus"), placeholder: t("মান লিখুন", "Enter value") },
              { label: t("তাপমাত্রা", "Temperature"), placeholder: "°C" },
            ].map((field, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
          <Button className="w-full">
            {t("সুপারিশ দেখান", "Get Recommendations")}
          </Button>
          <div className="space-y-2">
            {aiCropRecommendations.map((rec, idx) => (
              <div key={idx} className="p-3 rounded-lg border flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{t(rec.crop, rec.cropEn)}</p>
                  <p className="text-xs text-muted-foreground">{t(rec.reason, rec.reasonEn)}</p>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  {rec.suitability}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLabor = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              {t("কাজের তালিকা", "Task Board")}
            </span>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" /> {t("নতুন কাজ", "New Task")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = taskCompletions.includes(task.id) || task.completed;
            return (
              <div key={task.id} className={cn("p-3 rounded-lg border flex items-start gap-3", isCompleted && "opacity-70")}>
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={() => handleTaskToggle(task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("font-medium text-sm", isCompleted && "line-through text-muted-foreground")}>
                      {t(task.title, task.titleEn)}
                    </p>
                    {task.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        {t("জরুরি", "Urgent")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex gap-2 flex-wrap mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t(task.time, task.timeEn)}
                    </span>
                    {task.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {t(task.location, task.locationEn)}
                      </span>
                    )}
                    {task.quantity && <span>{t(task.quantity, task.quantityEn)}</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t("সংক্ষিপ্তসার", "Summary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">{t("সম্পন্ন", "Completed")}</p>
            <p className="text-xl font-bold">{stats.tasksCompleted}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">{t("বাকি", "Pending")}</p>
            <p className="text-xl font-bold">{stats.tasksPending}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">{t("সতর্কতা", "Alerts")}</p>
            <p className="text-xl font-bold">{stats.alertsCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderListings = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              {t("নতুন পণ্য পোস্ট করুন", "Post a New Product")}
            </span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {t("মার্কেটপ্লেস", "Marketplace")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("পণ্যের নাম", "Product Name")}</p>
              <input className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t("যেমন: টমেটো", "e.g. Tomato")} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("পরিমাণ", "Quantity")}</p>
              <input className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t("যেমন: ৫০ কেজি", "e.g. 50 kg")} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("মূল্য", "Price")}</p>
              <input className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t("৳ প্রতি ইউনিট", "৳ per unit")} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("বিভাগ", "Category")}</p>
              <Select defaultValue="vegetable">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetable">{t("সবজি", "Vegetable")}</SelectItem>
                  <SelectItem value="grain">{t("ধান/শস্য", "Grain")}</SelectItem>
                  <SelectItem value="fruit">{t("ফল", "Fruit")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("বর্ণনা", "Description")}</p>
            <textarea className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder={t("পণ্যের সংক্ষিপ্ত বিবরণ দিন", "Add a short description")} />
          </div>
          <Button className="w-full">{t("মার্কেটপ্লেসে পোস্ট করুন", "Post to Marketplace")}</Button>
          <p className="text-xs text-muted-foreground text-center">{t("প্রকাশের আগে অনুমোদন প্রয়োজন হতে পারে", "May require approval before publishing")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              {t("আমার তালিকা", "My Listings")}
            </span>
            <Link to="/marketplace">
              <Button size="sm" variant="ghost">
                {t("সব দেখুন", "View All")} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {marketplaceListings.map((listing) => (
            <div key={listing.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <span className="text-3xl">{listing.image}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{t(listing.name, listing.nameEn)}</p>
                <p className="text-xs text-muted-foreground">
                  {t(listing.quantity, listing.quantityEn)} • {t(listing.price, listing.priceEn)}
                </p>
              </div>
              <Badge variant={listing.status === "active" ? "default" : "outline"} className="text-xs">
                {listing.status === "active" ? t("সক্রিয়", "Active") : t("অপেক্ষমান", "Pending")}
              </Badge>
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => setActiveSection("overview")}>
            {t("ড্যাশবোর্ডে ফিরে যান", "Back to Overview")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "fields":
        return renderMyFields();
      case "monitoring":
        return renderMonitoring();
      case "resources":
        return renderResources();
      case "labor":
        return renderLabor();
      case "listings":
        return renderListings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Fixed Top Navigation (80px) */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Left: Logo & mobile menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-foreground hidden sm:block">NobinKrishi</span>
            </Link>
          </div>

          {/* Center: Greeting & Weather */}
          <div className="flex-1 flex items-center justify-center gap-4 mx-4">
            <div className="text-center hidden md:block">
              <h1 className="text-sm font-semibold text-foreground">
                {t("শুভ সকাল, রহিম মিয়া 👋", "Good Morning, Rahim Mia 👋")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Weather Mini Widget */}
            <div className="hidden lg:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
              <Cloud className="w-4 h-4 text-action" />
              <span className="font-medium text-sm">32°C</span>
              <span className="text-muted-foreground text-xs">{t("আংশিক মেঘলা", "Partly Cloudy")}</span>
            </div>

            {/* Quick Stats Pills */}
            <div className="hidden xl:flex items-center gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {t("কাজ সম্পন্ন", "Completed")}: {stats.tasksCompleted}
              </Badge>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                {t("বাকি", "Pending")}: {stats.tasksPending}
              </Badge>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="w-4 h-4" />
            </Button>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
              className="gap-2"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "bn" ? "বাংলা" : "English"}</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {stats.alertsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline text-sm">{t("রহিম মিয়া", "Rahim Mia")}</span>
                  <ChevronDown className="w-4 h-4 hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("আমার অ্যাকাউন্ট", "My Account")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  {t("প্রোফাইল", "Profile")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  {t("সেটিংস", "Settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("লগআউট", "Logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-20 left-0 h-[calc(100vh-80px)] w-64 bg-background border-r border-border z-40 transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-muted",
                  active && "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{t(item.label, item.labelEn)}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Priority Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="fixed top-20 left-0 right-0 lg:left-64 z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
          <ScrollArea className="w-full">
            <div className="flex gap-4 px-4 lg:px-6 py-3 overflow-x-auto">
              {activeAlerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <Card
                    key={alert.id}
                    className={cn(
                      "flex-shrink-0 w-full sm:w-96 border-2 animate-fade-in",
                      alert.type === "urgent" && "border-destructive bg-destructive/5",
                      alert.type === "action" && "border-warning bg-warning/5",
                      alert.type === "opportunity" && "border-success bg-success/5"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          alert.type === "urgent" && "bg-destructive/10",
                          alert.type === "action" && "bg-warning/10",
                          alert.type === "opportunity" && "bg-success/10"
                        )}>
                          <Icon className={cn(
                            "w-5 h-5",
                            alert.type === "urgent" && "text-destructive",
                            alert.type === "action" && "text-warning",
                            alert.type === "opportunity" && "text-success"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{t(alert.title, alert.titleEn)}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{t(alert.description, alert.descriptionEn)}</p>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            {t(alert.action, alert.actionEn)}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={() => handleDismissAlert(alert.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20 pb-6 lg:pl-64 transition-all">
        {activeAlerts.length > 0 && <div className="h-24" />}
        
        <div className="container mx-auto px-4 lg:px-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("নেভিগেশন", "Navigation")}</p>
              <h2 className="text-xl font-semibold">
                {t(
                  activeSection === "overview" ? "ওভারভিউ" :
                  activeSection === "fields" ? "আমার জমি" :
                  activeSection === "monitoring" ? "লাইভ মনিটরিং" :
                  activeSection === "resources" ? "সম্পদ বরাদ্দ" :
                  activeSection === "labor" ? "শ্রম ব্যবস্থাপনা" :
                  "আমার তালিকা",
                  activeSection === "overview" ? "Overview" :
                  activeSection === "fields" ? "My Fields" :
                  activeSection === "monitoring" ? "Live Monitoring" :
                  activeSection === "resources" ? "Resource Allocation" :
                  activeSection === "labor" ? "Labor Management" :
                  "My Listings"
                )}
              </h2>
            </div>
          </div>

          {renderSection()}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => setActiveSection("overview")}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg",
              activeSection === "overview" ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-medium">{t("ড্যাশবোর্ড", "Dashboard")}</span>
          </button>
          <button
            onClick={() => setActiveSection("monitoring")}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg",
              activeSection === "monitoring" ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <Cloud className="w-5 h-5" />
            <span className="text-xs">{t("আবহাওয়া", "Weather")}</span>
          </button>
          <button
            onClick={() => setActiveSection("resources")}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg",
              activeSection === "resources" ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs">{t("বাজার", "Market")}</span>
          </button>
          <button
            onClick={() => setActiveSection("labor")}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg",
              activeSection === "labor" ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">{t("প্রোফাইল", "Profile")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
