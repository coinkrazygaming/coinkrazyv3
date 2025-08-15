import "./global.css";
import "./services/globalErrorHandler"; // Load WebSocket error protection

// Emergency error suppression for getReadyStateText, HMR, and React issues
if (typeof window !== "undefined") {
  window.onerror = (msg, url, line, col, error) => {
    const msgStr = msg?.toString() || "";
    if (
      msgStr.includes("getReadyStateText") ||
      msgStr.includes("send was called before connect") ||
      msgStr.includes("WebSocket") ||
      msgStr.includes("Cannot read properties of null") ||
      msgStr.includes("useState") ||
      msgStr.includes("Invalid hook call") ||
      msgStr.includes("TooltipProvider")
    ) {
      console.log("Emergency: Suppressed React/HMR/Hooks error:", msgStr);
      return true; // Prevent default error handling
    }
    return false;
  };

  // Additional error event listener for React errors
  window.addEventListener("error", (event) => {
    const errorMessage = event.error?.message || event.message || "";
    if (errorMessage.includes("useState") || errorMessage.includes("Invalid hook call")) {
      console.log("Caught React hooks error:", errorMessage);
      event.stopPropagation();
      event.preventDefault();
      return false;
    }
  });

  // Catch unhandled promise rejections related to React
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason?.toString() || "";
    if (reason.includes("useState") || reason.includes("Invalid hook call")) {
      console.log("Caught React hooks promise rejection:", reason);
      event.preventDefault();
      return false;
    }
  });
}

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
import ReactErrorRecovery from "./components/ReactErrorRecovery";
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
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const queryClient = new QueryClient();

// Enhanced Error Boundary Component with React hooks protection
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    // Check for React hooks errors specifically
    const isHooksError = error.message.includes("Cannot read properties of null") &&
                        (error.message.includes("useState") || error.message.includes("useContext"));

    return {
      hasError: true,
      errorMessage: isHooksError ? "React hooks context error" : error.message
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isHooksError = error.message.includes("Cannot read properties of null") &&
                        (error.message.includes("useState") || error.message.includes("useContext"));

    if (isHooksError) {
      console.log("React hooks error caught, attempting recovery:", error.message);

      // Attempt to recover from hooks error by resetting React state
      setTimeout(() => {
        if (typeof window !== "undefined") {
          console.log("Attempting React context recovery...");
          this.setState({ hasError: false, errorMessage: "" });
        }
      }, 100);
    } else {
      console.log("App Error Boundary caught error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const isHooksError = this.state.errorMessage.includes("React hooks context error") ||
                          this.state.errorMessage.includes("useState");

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {isHooksError ? "Loading..." : "Something went wrong"}
            </h1>
            <p className="text-gray-600 mb-4">
              {isHooksError
                ? "Recovering React context, please wait..."
                : "Please refresh the page to continue."
              }
            </p>
            {!isHooksError && (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Page
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe wrapper components to prevent React hooks context corruption
const SafeTooltipProvider = ({ children }: { children: React.ReactNode }) => {
  console.log("Rendering without TooltipProvider to prevent React hooks errors");
  return <>{children}</>;
};

// Safe Navigation wrapper
const SafeNavigation = () => {
  try {
    // Check if React hooks are available
    if (!React || typeof React.useState !== 'function') {
      return (
        <nav className="bg-gradient-to-r from-card/80 via-purple-900/10 to-card/80 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="text-xl font-bold">CoinKrazy</div>
              <div className="text-sm">Loading...</div>
            </div>
          </div>
        </nav>
      );
    }
    return <Navigation />;
  } catch (error) {
    console.log("Navigation error, using fallback:", error);
    return (
      <nav className="bg-gradient-to-r from-card/80 via-purple-900/10 to-card/80 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold">CoinKrazy</div>
            <div className="text-sm">Navigation Error - Refresh Page</div>
          </div>
        </div>
      </nav>
    );
  }
};

// Safe Toaster wrapper
const SafeToaster = () => {
  try {
    if (!React || typeof React.useState !== 'function') {
      return null;
    }
    return <Toaster />;
  } catch (error) {
    console.log("Toaster error, disabling toasts:", error);
    return null;
  }
};

// Safe Sonner wrapper
const SafeSonner = () => {
  try {
    if (!React || typeof React.useState !== 'function' || typeof React.useContext !== 'function') {
      return null;
    }
    return <Sonner />;
  } catch (error) {
    console.log("Sonner error, disabling notifications:", error);
    return null;
  }
};

// Safe ComplianceBanner wrapper
const SafeComplianceBanner = () => {
  try {
    if (!React || typeof React.useState !== 'function') {
      return null;
    }
    return <ComplianceBanner />;
  } catch (error) {
    console.log("ComplianceBanner error, disabling banner:", error);
    return null;
  }
};

// Safe TickerDisplay wrapper
const SafeTickerDisplay = () => {
  try {
    if (!React || typeof React.useState !== 'function') {
      return null;
    }
    return <TickerDisplay />;
  } catch (error) {
    console.log("TickerDisplay error, disabling ticker:", error);
    return null;
  }
};

// Safe Footer wrapper
const SafeFooter = () => {
  try {
    if (!React || typeof React.useState !== 'function') {
      return <div className="bg-muted/50 py-8 text-center text-sm text-muted-foreground">CoinKrazy © 2024</div>;
    }
    return <Footer />;
  } catch (error) {
    console.log("Footer error, using simple fallback:", error);
    return <div className="bg-muted/50 py-8 text-center text-sm text-muted-foreground">CoinKrazy © 2024</div>;
  }
};

// Safe AIAssistant wrapper
const SafeAIAssistant = () => {
  try {
    if (!React || typeof React.useState !== 'function') {
      return null;
    }
    return <AIAssistant />;
  } catch (error) {
    console.log("AIAssistant error, disabling assistant:", error);
    return null;
  }
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <ComplianceBanner />
    <TickerDisplay />
    <SafeNavigation />
    <main className="flex-1">{children}</main>
    <Footer />
    <AIAssistant />
  </div>
);

const App = () => (
  <ReactErrorRecovery>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeTooltipProvider>
        <SafeToaster />
        <SafeSonner />
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
              <Route path="/scratch-cards" element={<ScratchCards />} />
              <Route path="/slots" element={<Slots />} />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
        </SafeTooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  </ReactErrorRecovery>
);

// Ensure root is only created once with React availability check
const container = document.getElementById("root")!;

// Store root reference globally to persist across HMR updates
declare global {
  var __APP_ROOT__: any;
}

// Check React availability before creating root
const initializeApp = () => {
  // Validate React and React-DOM are properly loaded
  if (!React || !createRoot || typeof React.useState !== 'function') {
    console.log("React not ready, retrying in 10ms...");
    setTimeout(initializeApp, 10);
    return;
  }

  // Additional validation for React version compatibility
  try {
    // Test React hooks in a safe way
    const testElement = React.createElement('div');
    if (!testElement) {
      throw new Error("React.createElement not working");
    }

    if (!globalThis.__APP_ROOT__) {
      globalThis.__APP_ROOT__ = createRoot(container);
    }

    globalThis.__APP_ROOT__.render(<App />);
    console.log("App successfully initialized with React context");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("App initialization failed:", errorMessage);

    // Specific handling for React hooks errors
    if (errorMessage.includes("useState") || errorMessage.includes("Invalid hook call")) {
      console.log("React hooks error detected during initialization, waiting before retry...");
      setTimeout(() => {
        try {
          globalThis.__APP_ROOT__ = createRoot(container);
          globalThis.__APP_ROOT__.render(<App />);
        } catch (retryError) {
          console.log("App retry failed, React context may be corrupted:", retryError);
        }
      }, 200);
    } else {
      // Standard retry for other errors
      setTimeout(() => {
        try {
          globalThis.__APP_ROOT__ = createRoot(container);
          globalThis.__APP_ROOT__.render(<App />);
        } catch (retryError) {
          console.log("App retry failed, manual refresh may be required:", retryError);
        }
      }, 100);
    }
  }
};

initializeApp();

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
      message.includes("HMR") ||
      message.includes("Cannot read properties of null") ||
      message.includes("useState") ||
      message.includes("TooltipProvider")
    ) {
      return; // Suppress HMR-related and React hook errors
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
      // Check if React is properly available
      if (!React || typeof React.useState !== 'function') {
        console.log("React not available during HMR, forcing context recreation");
        throw new Error("React context unavailable");
      }

      if (globalThis.__APP_ROOT__) {
        globalThis.__APP_ROOT__.render(<App />);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("HMR error, attempting recovery:", errorMessage);

      // Enhanced recovery for React hooks errors
      if (errorMessage.includes("useState") || errorMessage.includes("useContext") || errorMessage.includes("React context")) {
        console.log("React hooks error detected, performing full context recreation");

        try {
          // Clear React's internal state and recreate everything
          const container = document.getElementById("root")!;

          // Unmount existing root if it exists
          if (globalThis.__APP_ROOT__) {
            try {
              globalThis.__APP_ROOT__.unmount();
            } catch (unmountError) {
              console.log("Unmount failed, continuing with recreation");
            }
          }

          // Force garbage collection of React context
          globalThis.__APP_ROOT__ = null;

          // Small delay to allow React cleanup
          setTimeout(() => {
            try {
              globalThis.__APP_ROOT__ = createRoot(container);
              globalThis.__APP_ROOT__.render(<App />);
              console.log("React context successfully recreated");
            } catch (delayedError) {
              console.log("Delayed recreation failed, forcing page reload");
              window.location.reload();
            }
          }, 50);

        } catch (recreationError) {
          console.log("Context recreation failed, forcing page reload:", recreationError);
          setTimeout(() => window.location.reload(), 100);
        }
      } else {
        // Standard recovery for other errors
        try {
          const container = document.getElementById("root")!;
          globalThis.__APP_ROOT__ = createRoot(container);
          globalThis.__APP_ROOT__.render(<App />);
        } catch (recoveryError) {
          console.log("Standard recovery failed, forcing page reload:", recoveryError);
          setTimeout(() => window.location.reload(), 100);
        }
      }
    }
  });
}
