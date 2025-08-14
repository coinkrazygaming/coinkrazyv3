import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Simple working components first
const Header = () => (
  <header className="bg-blue-600 text-white p-4">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">CoinKrazy</h1>
      <nav className="flex space-x-4">
        <a href="/" className="hover:text-blue-200">Home</a>
        <a href="/games" className="hover:text-blue-200">Games</a>
        <a href="/store" className="hover:text-blue-200">Store</a>
        <a href="/login" className="hover:text-blue-200">Login</a>
      </nav>
    </div>
  </header>
);

const HomePage = () => (
  <div className="p-8">
    <h2 className="text-3xl font-bold mb-4">Welcome to CoinKrazy!</h2>
    <p className="text-lg mb-4">Your premier social casino experience</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-100 p-4 rounded">
        <h3 className="font-bold">🎰 Slots</h3>
        <p>Play exciting slot games</p>
      </div>
      <div className="bg-green-100 p-4 rounded">
        <h3 className="font-bold">🎮 Games</h3>
        <p>Various casino games</p>
      </div>
      <div className="bg-purple-100 p-4 rounded">
        <h3 className="font-bold">🏆 Rewards</h3>
        <p>Daily bonuses & prizes</p>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-gray-800 text-white p-4 text-center">
    <p>&copy; 2024 CoinKrazy. All rights reserved.</p>
  </footer>
);

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <p>Return to <a href="/" className="text-blue-600 underline">homepage</a></p>
          </div>
        } />
      </Routes>
    </Layout>
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
