import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CropGrid from "./pages/CropGrid";
import VoiceAI from "./pages/VoiceAI";
import Dashboard from "./pages/Dashboard";
import DiseaseScanner from "./pages/DiseaseScanner";
import Weather from "./pages/Weather";
import Marketplace from "./pages/Marketplace";
import ImperfectProduce from "./pages/ImperfectProduce";
import { SolutionsIndex, SolutionDetail } from "./pages/Solutions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/imperfect-produce" element={<ImperfectProduce />} />
          <Route path="/crop-grid" element={<CropGrid />} />
          <Route path="/voice-ai" element={<VoiceAI />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/disease-scanner" element={<DiseaseScanner />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/solutions" element={<SolutionsIndex />} />
          <Route path="/solutions/:slug" element={<SolutionDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
