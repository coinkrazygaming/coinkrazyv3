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

// Safe initialization
const container = document.getElementById("root")!;

// Create and render the minimal app
const safeInitialize = () => {
  try {
    if (!React || typeof React.createElement !== 'function') {
      console.log("React not ready, retrying...");
      setTimeout(safeInitialize, 100);
      return;
    }

    const root = createRoot(container);
    root.render(<App />);
    console.log("Minimal app initialized successfully in safe mode");
  } catch (error) {
    console.log("Minimal app initialization error:", error);
    // Show fallback HTML
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">CoinKrazy - Safe Mode</h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">React context is recovering...</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
};

safeInitialize();

// Disable HMR completely to prevent React context corruption
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("HMR disabled in safe mode - refreshing page");
    setTimeout(() => window.location.reload(), 100);
  });
}
