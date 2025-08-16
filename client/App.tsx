import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Navigation
import TestNavigation from "./components/TestNavigation";

// Import pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Games from "./pages/Games";
import Slots from "./pages/Slots";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import GoldCoinStore from "./pages/GoldCoinStore";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-purple-600 text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">CoinKrazy - Header Test</h1>
        </div>
      </header>
      <TestNavigation />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log("✅ CoinKrazy app mounted successfully");
} else {
  console.error("❌ Root container not found");
}
