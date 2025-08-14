import "./global.css";
import React from "react";
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
import ComplianceBanner from "./components/ComplianceBanner";
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
import Staff from "./pages/Staff";
import HowToPlay from "./pages/HowToPlay";
import SweepstakesRules from "./pages/SweepstakesRules";
import Support from "./pages/Support";
import AdminSetup from "./pages/AdminSetup";
import Social from "./pages/Social";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import DailyRewards from "./pages/DailyRewards";
import Profile from "./pages/Profile";
import ScratchCards from "./pages/ScratchCards";
import Slots from "./pages/Slots";
import SlotsHub from "./pages/SlotsHub";
import GoldCoinStore from "./pages/GoldCoinStore";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <ComplianceBanner />
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
            <Route path="/gold-store" element={<GoldCoinStore />} />
            <Route path="/sportsbook" element={<Sportsbook />} />
            <Route path="/pick-cards" element={<PickCards />} />
            <Route path="/bingo" element={<Bingo />} />
            <Route path="/poker" element={<Poker />} />
            <Route path="/scratch-cards" element={<ScratchCards />} />
            <Route path="/slots" element={<Slots />} />
            <Route path="/slots/hub" element={<SlotsHub />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/sweepstakes-rules" element={<SweepstakesRules />} />
            <Route path="/support" element={<Support />} />
            <Route path="/social" element={<Social />} />
            <Route path="/chat" element={<Chat />} />
            <Route
              path="/daily-rewards"
              element={
                <ProtectedRoute>
                  <DailyRewards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    root.render(<App />);
  });
}
