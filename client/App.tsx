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

// Import all pages with full functionality
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Games from "./pages/Games";
import Slots from "./pages/Slots";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import GoldCoinStore from "./pages/GoldCoinStore";
import Bingo from "./pages/Bingo";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import Banking from "./pages/Banking";
import Compliance from "./pages/Compliance";
import DailyRewards from "./pages/DailyRewards";
import LiveGames from "./pages/LiveGames";
import Poker from "./pages/Poker";
import Promotions from "./pages/Promotions";
import Settings from "./pages/Settings";
import SportsBook from "./pages/SportsBook";
import Support from "./pages/Support";
import Tournaments from "./pages/Tournaments";
import VIP from "./pages/VIP";
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
              <Route path="/games" element={<Games />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/gold-store" element={<GoldCoinStore />} />
              <Route path="/bingo" element={<Bingo />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/banking" element={<Banking />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/daily-rewards" element={<DailyRewards />} />
              <Route path="/live-games" element={<LiveGames />} />
              <Route path="/poker" element={<Poker />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/sportsbook" element={<SportsBook />} />
              <Route path="/support" element={<Support />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/vip" element={<VIP />} />
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
