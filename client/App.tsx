import "./global.css";
import "./services/globalErrorHandler"; // Load WebSocket error protection

// Emergency error suppression for getReadyStateText and HMR issues
if (typeof window !== "undefined") {
  window.onerror = (msg, url, line, col, error) => {
    const msgStr = msg?.toString() || "";
    if (
      msgStr.includes("getReadyStateText") ||
      msgStr.includes("send was called before connect") ||
      msgStr.includes("WebSocket")
    ) {
      console.log("Emergency: Suppressed HMR/WebSocket error:", msgStr);
      return true; // Prevent default error handling
    }
    return false;
  };
}

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
import Staff from "./pages/Staff";
import HowToPlay from "./pages/HowToPlay";
import SweepstakesRules from "./pages/SweepstakesRules";
import Support from "./pages/Support";
import AdminSetup from "./pages/AdminSetup";
import Social from "./pages/Social";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import DailyRewards from "./pages/DailyRewards";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

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
            <Route path="/staff" element={<Staff />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/sweepstakes-rules" element={<SweepstakesRules />} />
            <Route path="/support" element={<Support />} />
            <Route path="/social" element={<Social />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/daily-rewards" element={
              <ProtectedRoute>
                <DailyRewards />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Ensure root is only created once
const container = document.getElementById("root")!;

// Store root reference globally to persist across HMR updates
declare global {
  var __APP_ROOT__: any;
}

if (!globalThis.__APP_ROOT__) {
  globalThis.__APP_ROOT__ = createRoot(container);
}

globalThis.__APP_ROOT__.render(<App />);

// HMR support with comprehensive error protection
if (import.meta.hot) {
  // Disable HMR errors temporarily
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args) => {
    const message = args.join(" ");
    if (
      message.includes("send was called before connect") ||
      message.includes("WebSocket") ||
      message.includes("HMR")
    ) {
      return; // Suppress HMR-related errors
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(" ");
    if (
      message.includes("send was called before connect") ||
      message.includes("WebSocket") ||
      message.includes("HMR")
    ) {
      return; // Suppress HMR-related warnings
    }
    originalConsoleWarn.apply(console, args);
  };

  import.meta.hot.accept(() => {
    try {
      if (globalThis.__APP_ROOT__) {
        globalThis.__APP_ROOT__.render(<App />);
      }
    } catch (error) {
      // Fallback: recreate root if needed
      if (!globalThis.__APP_ROOT__) {
        globalThis.__APP_ROOT__ = createRoot(container);
        globalThis.__APP_ROOT__.render(<App />);
      }
    }
  });
}
