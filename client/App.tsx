import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import the actual pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
