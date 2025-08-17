import "./global.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

// Simple Navigation component that uses Router hooks
const SimpleNavigation = () => {
  try {
    const location = useLocation();
    const navigate = useNavigate();
    
    return (
      <nav className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">CoinKrazy</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/")}
              className={`px-3 py-1 rounded ${location.pathname === "/" ? "bg-blue-600" : "bg-gray-600"}`}
            >
              Home
            </button>
            <button 
              onClick={() => navigate("/games")}
              className={`px-3 py-1 rounded ${location.pathname === "/games" ? "bg-blue-600" : "bg-gray-600"}`}
            >
              Games
            </button>
            <button 
              onClick={() => navigate("/login")}
              className={`px-3 py-1 rounded ${location.pathname === "/login" ? "bg-blue-600" : "bg-gray-600"}`}
            >
              Login
            </button>
          </div>
        </div>
      </nav>
    );
  } catch (error) {
    console.error("Navigation error:", error);
    return (
      <nav className="bg-red-800 text-white p-4">
        <h1>Navigation Error - Router Context Missing</h1>
      </nav>
    );
  }
};

// Simple page components to test routing
const HomePage = () => <div className="p-8"><h1>Home Page</h1><p>Welcome to CoinKrazy!</p></div>;
const GamesPage = () => <div className="p-8"><h1>Games Page</h1><p>Choose your games!</p></div>;
const LoginPage = () => <div className="p-8"><h1>Login Page</h1><p>Please login</p></div>;

// Ultra-simple App structure
const App = () => {
  console.log("App rendering...");
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <SimpleNavigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<div className="p-8">Page not found</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

// Initialize app
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

console.log("Initializing app...");
const root = ReactDOM.createRoot(container);
root.render(<App />);
console.log("✅ CoinKrazy minimal app initialized");

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("HMR update...");
    root.render(<App />);
  });
}
