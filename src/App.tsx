import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PodcastSeries from "./pages/PodcastSeries";
import NotFound from "./pages/NotFound";
import { ConversationProvider } from '@/contexts/ConversationContext';
import { ConversationInitializer } from '@/components/ConversationInitializer';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ConversationProvider>
        <ConversationInitializer />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/series/:id" element={<PodcastSeries />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ConversationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
