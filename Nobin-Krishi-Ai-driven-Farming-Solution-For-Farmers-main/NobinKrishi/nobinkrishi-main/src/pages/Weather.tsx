import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { 
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Eye, Gauge, 
  MapPin, Search, Navigation2, AlertTriangle, Calendar, TrendingUp,
  CloudSun, CloudFog, Snowflake, Umbrella
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const hourlyForecast = [
  { time: "Now", temp: 32, icon: Sun, precip: 0 },
  { time: "1PM", temp: 33, icon: CloudSun, precip: 10 },
  { time: "2PM", temp: 34, icon: Sun, precip: 0 },
  { time: "3PM", temp: 33, icon: CloudSun, precip: 20 },
  { time: "4PM", temp: 32, icon: Cloud, precip: 30 },
  { time: "5PM", temp: 30, icon: CloudRain, precip: 60 },
  { time: "6PM", temp: 28, icon: CloudRain, precip: 80 },
  { time: "7PM", temp: 27, icon: Cloud, precip: 40 },
];

const dailyForecast = [
  { day: "Today", high: 34, low: 24, icon: Sun, precip: 20, condition: "Partly Cloudy", suitability: 85 },
  { day: "Tomorrow", high: 32, low: 23, icon: CloudRain, precip: 70, condition: "Rain Expected", suitability: 40 },
  { day: "Wed", high: 30, low: 22, icon: CloudRain, precip: 80, condition: "Heavy Rain", suitability: 20 },
  { day: "Thu", high: 31, low: 23, icon: CloudSun, precip: 30, condition: "Clearing", suitability: 70 },
  { day: "Fri", high: 33, low: 24, icon: Sun, precip: 10, condition: "Sunny", suitability: 95 },
  { day: "Sat", high: 34, low: 25, icon: Sun, precip: 5, condition: "Hot & Sunny", suitability: 90 },
  { day: "Sun", high: 33, low: 24, icon: CloudSun, precip: 15, condition: "Partly Cloudy", suitability: 85 },
];

const alerts = [
  { type: "warning", title: "Heavy Rain Alert", message: "Expected 50-80mm rainfall on Wednesday", time: "In 2 days" },
  { type: "advisory", title: "High Temperature", message: "Temperature may exceed 35°C on Friday", time: "In 4 days" },
];

const Weather = () => {
  const [location, setLocation] = useState("Mymensingh, Bangladesh");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-action/90 to-primary/80 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <CloudSun className="absolute top-20 right-20 w-40 h-40 text-white animate-pulse" />
          <Cloud className="absolute bottom-10 left-10 w-32 h-32 text-white" />
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
            Hyper-Local Weather Intelligence
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Accurate forecasts tailored for agricultural decision-making
          </p>
        </div>
      </section>

      {/* Location Selector */}
      <section className="py-6 -mt-8">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search location..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Navigation2 className="w-4 h-4 mr-2" /> Use GPS
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Weather Dashboard */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Current Weather */}
            <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-action/5 to-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{location}</span>
                <span className="text-sm text-muted-foreground ml-auto">Last updated: 12:00 PM</span>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex items-center gap-4">
                  <Sun className="w-24 h-24 text-secondary" />
                  <div>
                    <p className="text-6xl font-bold">32°C</p>
                    <p className="text-muted-foreground">Feels like 35°C</p>
                    <p className="text-lg mt-1">Partly Cloudy</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <Droplets className="w-5 h-5 text-action" />
                    <div>
                      <p className="text-xs text-muted-foreground">Humidity</p>
                      <p className="font-semibold">68%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <Wind className="w-5 h-5 text-action" />
                    <div>
                      <p className="text-xs text-muted-foreground">Wind</p>
                      <p className="font-semibold">12 km/h NE</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <Gauge className="w-5 h-5 text-action" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pressure</p>
                      <p className="font-semibold">1012 mb</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <Eye className="w-5 h-5 text-action" />
                    <div>
                      <p className="text-xs text-muted-foreground">Visibility</p>
                      <p className="font-semibold">10 km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <Sun className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">UV Index</p>
                      <p className="font-semibold">7 (High)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <Thermometer className="w-5 h-5 text-action" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dew Point</p>
                      <p className="font-semibold">24°C</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agricultural Advisory */}
              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <p className="font-semibold text-primary">Agricultural Advisory</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  ✓ Good day for field work &nbsp; ✓ Irrigation not needed today &nbsp; ⚠ Monitor for pest activity in humid conditions
                </p>
              </div>
            </Card>

            {/* Alerts Panel */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" /> Weather Alerts
              </h3>
              <div className="space-y-4">
                {alerts.map((alert, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-lg ${
                      alert.type === "warning" ? "bg-destructive/10 border border-destructive/20" : "bg-warning/10 border border-warning/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className={`font-semibold text-sm ${alert.type === "warning" ? "text-destructive" : "text-warning"}`}>
                        {alert.title}
                      </p>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No active alerts</p>
                )}
              </div>
            </Card>
          </div>

          {/* Hourly Forecast */}
          <Card className="mt-6 p-6">
            <h3 className="font-semibold text-lg mb-4">48-Hour Forecast</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {hourlyForecast.map((hour, i) => (
                <div key={i} className="flex-shrink-0 text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-w-[80px]">
                  <p className="text-sm text-muted-foreground mb-2">{hour.time}</p>
                  <hour.icon className={`w-8 h-8 mx-auto mb-2 ${
                    hour.icon === Sun ? "text-secondary" : 
                    hour.icon === CloudRain ? "text-action" : "text-muted-foreground"
                  }`} />
                  <p className="font-semibold">{hour.temp}°</p>
                  <p className="text-xs text-action mt-1">{hour.precip}%</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 7-Day Forecast */}
          <Card className="mt-6 p-6">
            <h3 className="font-semibold text-lg mb-4">7-Day Forecast</h3>
            <div className="space-y-3">
              {dailyForecast.map((day, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <p className="w-20 font-medium">{day.day}</p>
                  <day.icon className={`w-8 h-8 ${
                    day.icon === Sun ? "text-secondary" : 
                    day.icon === CloudRain ? "text-action" : "text-muted-foreground"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{day.condition}</p>
                  </div>
                  <div className="flex items-center gap-1 text-action text-sm">
                    <Droplets className="w-4 h-4" />
                    {day.precip}%
                  </div>
                  <div className="w-24 text-right">
                    <span className="font-semibold">{day.high}°</span>
                    <span className="text-muted-foreground"> / {day.low}°</span>
                  </div>
                  <div className={`w-20 text-center text-xs px-2 py-1 rounded-full ${
                    day.suitability >= 80 ? "bg-primary/10 text-primary" :
                    day.suitability >= 50 ? "bg-warning/10 text-warning" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {day.suitability}% Farm
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Metrics Tabs */}
          <Card className="mt-6 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full max-w-lg">
                <TabsTrigger value="overview">Rainfall</TabsTrigger>
                <TabsTrigger value="gdd">GDD</TabsTrigger>
                <TabsTrigger value="soil">Soil Moisture</TabsTrigger>
                <TabsTrigger value="extreme">Extreme</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 bg-action/5 rounded-lg text-center">
                    <CloudRain className="w-12 h-12 mx-auto text-action mb-2" />
                    <p className="text-3xl font-bold">12 mm</p>
                    <p className="text-sm text-muted-foreground">Last 24 hours</p>
                  </div>
                  <div className="p-4 bg-action/5 rounded-lg text-center">
                    <Umbrella className="w-12 h-12 mx-auto text-action mb-2" />
                    <p className="text-3xl font-bold">45 mm</p>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                  </div>
                  <div className="p-4 bg-action/5 rounded-lg text-center">
                    <TrendingUp className="w-12 h-12 mx-auto text-primary mb-2" />
                    <p className="text-3xl font-bold">+15%</p>
                    <p className="text-sm text-muted-foreground">vs. Historical Avg</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gdd" className="mt-6">
                <div className="p-6 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-4">Growing Degree Days (GDD)</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Accumulation</p>
                      <p className="text-3xl font-bold text-primary">1,245 GDD</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Target for Rice Maturity</p>
                      <p className="text-3xl font-bold">2,000 GDD</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>62%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[62%] bg-gradient-to-r from-primary to-accent rounded-full" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Estimated maturity: 25-30 days
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="soil" className="mt-6">
                <div className="p-6 bg-earth/5 rounded-lg">
                  <h4 className="font-semibold mb-4">Estimated Soil Moisture</h4>
                  <div className="flex items-center gap-8">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#e0e0e0" strokeWidth="12" />
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#2E7D32" strokeWidth="12" strokeDasharray="352" strokeDashoffset="105" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-2xl font-bold">70%</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-primary font-semibold mb-2">✓ Adequate moisture levels</p>
                      <p className="text-muted-foreground text-sm">
                        Recommendation: <strong>No irrigation needed</strong> for the next 3 days
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="extreme" className="mt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-action/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Snowflake className="w-5 h-5 text-action" />
                      <span className="font-semibold">Frost Risk</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">None</p>
                    <p className="text-sm text-muted-foreground">No frost expected in next 14 days</p>
                  </div>
                  <div className="p-4 bg-secondary/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-5 h-5 text-secondary" />
                      <span className="font-semibold">Heat Stress</span>
                    </div>
                    <p className="text-2xl font-bold text-warning">Moderate</p>
                    <p className="text-sm text-muted-foreground">Temperature above 35°C on Friday</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Farm Calendar Integration */}
          <Card className="mt-6 p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Weather-Based Farm Calendar
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Best Day for Planting</p>
                <p className="font-semibold text-primary">Friday (Dec 8)</p>
                <p className="text-xs text-muted-foreground">Sunny, moderate temperature</p>
              </div>
              <div className="p-4 border border-secondary/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Best Day for Spraying</p>
                <p className="font-semibold text-secondary">Tomorrow (Dec 4)</p>
                <p className="text-xs text-muted-foreground">Low wind, no rain expected</p>
              </div>
              <div className="p-4 border border-action/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Avoid Field Work</p>
                <p className="font-semibold text-action">Wednesday (Dec 6)</p>
                <p className="text-xs text-muted-foreground">Heavy rain forecast</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Data sources: OpenWeatherMap • NASA • Bangladesh Meteorological Department • IoT Station Network
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Weather;
