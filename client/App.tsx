import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Navigation
import Navigation from "./components/Navigation";

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

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    if (container) {
      const root = createRoot(container);
      root.render(<App />);
    }
  });
}
