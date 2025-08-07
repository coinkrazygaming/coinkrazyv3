import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import AIAssistant from "./components/AIAssistant";
import TickerDisplay from "./components/TickerDisplay";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Store from "./pages/Store";
import Sportsbook from "./pages/Sportsbook";
import PickCards from "./pages/PickCards";
import Bingo from "./pages/Bingo";
import Poker from "./pages/Poker";
import Analytics from "./pages/Analytics";
import Compliance from "./pages/Compliance";
import Admin from "./pages/Admin";
import HowToPlay from "./pages/HowToPlay";
import SweepstakesRules from "./pages/SweepstakesRules";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
import ResponsibleGaming from "./pages/ResponsibleGaming";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <TickerDisplay />
    <Navigation />
    <main className="flex-1">{children}</main>
    <Footer />
    <AIAssistant />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<Games />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/store" element={<Store />} />
            <Route path="/sportsbook" element={<Sportsbook />} />
            <Route path="/pick-cards" element={<PickCards />} />
            <Route path="/bingo" element={<Bingo />} />
            <Route path="/poker" element={<Poker />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/sweepstakes-rules" element={<SweepstakesRules />} />
            <Route path="/support" element={<Support />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
