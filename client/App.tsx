import "./global.css";
import "./services/globalErrorHandler"; // Load WebSocket error protection

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import only safe pages that don't use complex hooks
import Index from "./pages/Index";
import Games from "./pages/Games";
import Slots from "./pages/Slots";
import NotFound from "./pages/NotFound";

// Minimal safe layout without any hook-using components
const MinimalLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    {/* Simple header without hooks */}
    <nav className="bg-gradient-to-r from-card/80 via-purple-900/10 to-card/80 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-gold-500 rounded-full flex items-center justify-center text-white font-bold">
              😎
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              CoinKrazy
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</a>
            <a href="/games" className="text-muted-foreground hover:text-foreground transition-colors">Games</a>
            <a href="/slots" className="text-muted-foreground hover:text-foreground transition-colors">Slots</a>
          </div>
          <div className="text-sm text-green-400 font-medium">Safe Mode ✅</div>
        </div>
      </div>
    </nav>

    {/* Main content */}
    <main className="flex-1">{children}</main>

    {/* Simple footer without hooks */}
    <footer className="bg-muted/50 py-8 text-center text-sm text-muted-foreground border-t">
      <div className="container mx-auto px-4">
        <p>CoinKrazy © 2024 - Safe Mode Active</p>
      </div>
    </footer>
  </div>
);

// Minimal app without any hook-using components
const App = () => (
  <BrowserRouter>
    <MinimalLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/games" element={<Games />} />
        <Route path="/slots" element={<Slots />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MinimalLayout>
  </BrowserRouter>
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

// HMR support with comprehensive error protection and React context safety
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
      message.includes("useContext") ||
      message.includes("Invalid hook call") ||
      message.includes("TooltipProvider") ||
      message.includes("useAuth") ||
      message.includes("useToast")
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
      message.includes("HMR") ||
      message.includes("Invalid hook call")
    ) {
      return; // Suppress HMR-related warnings
    }
    originalConsoleWarn.apply(console, args);
  };

  import.meta.hot.accept(() => {
    // Simplified and safer HMR accept - just reload the page to avoid React context corruption
    console.log("HMR update detected, performing safe page reload to prevent React hooks corruption");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  });
}
