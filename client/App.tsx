import "./global.css";
import "./services/globalErrorHandler"; // Load WebSocket error protection

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Navigation and other components
import Navigation from "./components/Navigation";
import { AuthProvider } from "./hooks/useAuth";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";

// Import only existing pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Games from "./pages/Games";
import Slots from "./pages/Slots";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AdminSetup from "./pages/AdminSetup";
import GoldCoinStore from "./pages/GoldCoinStore";
import Store from "./pages/Store";
import Bingo from "./pages/Bingo";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import Compliance from "./pages/Compliance";
import DailyRewards from "./pages/DailyRewards";
import Poker from "./pages/Poker";
import Sportsbook from "./pages/Sportsbook";
import Support from "./pages/Support";
import ScratchCards from "./pages/ScratchCards";
import PickCards from "./pages/PickCards";
import Social from "./pages/Social";
import Staff from "./pages/Staff";
import SlotsHub from "./pages/SlotsHub";
import HowToPlay from "./pages/HowToPlay";
import SweepstakesRules from "./pages/SweepstakesRules";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";

// Full-featured app with complete functionality restored
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/games" element={<Games />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/slots-hub" element={<SlotsHub />} />
              <Route path="/scratch-cards" element={<ScratchCards />} />
              <Route path="/pick-cards" element={<PickCards />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-setup" element={<AdminSetup />} />
              <Route path="/store" element={<Store />} />
              <Route path="/gold-store" element={<GoldCoinStore />} />
              <Route path="/bingo" element={<Bingo />} />
              <Route path="/poker" element={<Poker />} />
              <Route path="/sportsbook" element={<Sportsbook />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/social" element={<Social />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/daily-rewards" element={<DailyRewards />} />
              <Route path="/support" element={<Support />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/how-to-play" element={<HowToPlay />} />
              <Route path="/sweepstakes-rules" element={<SweepstakesRules />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster />
          <Sonner />
        </div>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
);

// Initialize the full-featured application
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log("✅ CoinKrazy app initialized successfully - Full functionality restored");
} else {
  console.error("❌ Root container not found");
}

// HMR for development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    if (container) {
      const root = createRoot(container);
      root.render(<App />);
      console.log("🔄 HMR update applied - Full functionality active");
    }
  });
}
