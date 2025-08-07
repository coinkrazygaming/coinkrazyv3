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
import AuthGuard from "./components/AuthGuard";
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
import EnhancedDashboard from "./pages/EnhancedDashboard";
import GoldCoinStore from "./pages/GoldCoinStore";
import PaymentsPage from "./pages/PaymentsPage";
import DailyLuckyWheel from "./components/DailyLuckyWheel";
import BankingTab from "./components/BankingTab";
import SweepstakesCompliance from "./components/SweepstakesCompliance";
import InHouseCasino from "./components/games/InHouseCasino";
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
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/sweepstakes-rules" element={<SweepstakesRules />} />
            <Route path="/support" element={<Support />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            {/* Protected Routes - Require Authentication */}
            <Route
              path="/games"
              element={
                <AuthGuard>
                  <Games />
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/store"
              element={
                <AuthGuard>
                  <Store />
                </AuthGuard>
              }
            />
            <Route
              path="/sportsbook"
              element={
                <AuthGuard>
                  <Sportsbook />
                </AuthGuard>
              }
            />
            <Route
              path="/pick-cards"
              element={
                <AuthGuard>
                  <PickCards />
                </AuthGuard>
              }
            />
            <Route
              path="/bingo"
              element={
                <AuthGuard>
                  <Bingo />
                </AuthGuard>
              }
            />
            <Route
              path="/poker"
              element={
                <AuthGuard>
                  <Poker />
                </AuthGuard>
              }
            />
            <Route
              path="/enhanced-dashboard"
              element={
                <AuthGuard>
                  <EnhancedDashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/payments"
              element={
                <AuthGuard>
                  <PaymentsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard/wheel"
              element={
                <AuthGuard>
                  <DailyLuckyWheel />
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard/banking"
              element={
                <AuthGuard>
                  <BankingTab />
                </AuthGuard>
              }
            />
            <Route
              path="/casino"
              element={
                <AuthGuard>
                  <InHouseCasino />
                </AuthGuard>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/analytics"
              element={
                <AuthGuard requireAdmin>
                  <Analytics />
                </AuthGuard>
              }
            />
            <Route
              path="/compliance"
              element={
                <AuthGuard requireAdmin>
                  <Compliance />
                </AuthGuard>
              }
            />
            <Route
              path="/admin"
              element={
                <AuthGuard requireAdmin>
                  <Admin />
                </AuthGuard>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
