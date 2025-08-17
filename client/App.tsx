import "./global.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

// Simple working navigation
const WorkingNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <nav style={{
      background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
      color: 'white',
      padding: '1rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🎰 CoinKrazy</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate("/")}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: location.pathname === "/" ? '#6d28d9' : '#8b5cf6',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🏠 Home
          </button>
          <button 
            onClick={() => navigate("/games")}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: location.pathname === "/games" ? '#6d28d9' : '#8b5cf6',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🎮 Games
          </button>
          <button 
            onClick={() => navigate("/login")}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: location.pathname === "/login" ? '#6d28d9' : '#8b5cf6',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🔐 Login
          </button>
          <div style={{ 
            padding: '0.5rem',
            backgroundColor: '#10b981',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}>
            💰 GC: 1,000 | SC: 10.00
          </div>
        </div>
      </div>
    </nav>
  );
};

// Simple pages
const HomePage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉 Welcome to CoinKrazy!</h1>
    <p style={{ fontSize: '1.2rem', color: '#666' }}>Your ultimate social casino experience</p>
    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      <div style={{ padding: '1rem', border: '2px solid #7c3aed', borderRadius: '0.5rem' }}>
        <h3>🎰 Slots</h3>
        <p>Spin to win big!</p>
      </div>
      <div style={{ padding: '1rem', border: '2px solid #7c3aed', borderRadius: '0.5rem' }}>
        <h3>🎮 Games</h3>
        <p>Play all your favorites</p>
      </div>
    </div>
  </div>
);

const GamesPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎮 Games</h1>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
      <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
        <h3>🎰 Mega Slots</h3>
        <p>Classic slot machine fun</p>
      </div>
      <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
        <h3>🃏 Poker</h3>
        <p>Texas Hold'em action</p>
      </div>
      <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
        <h3>🎲 Scratch Cards</h3>
        <p>Instant win games</p>
      </div>
    </div>
  </div>
);

const LoginPage = () => (
  <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>🔐 Login</h1>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input 
        type="email" 
        placeholder="Email"
        style={{ 
          padding: '0.75rem', 
          border: '1px solid #ddd', 
          borderRadius: '0.5rem',
          fontSize: '1rem'
        }}
      />
      <input 
        type="password" 
        placeholder="Password"
        style={{ 
          padding: '0.75rem', 
          border: '1px solid #ddd', 
          borderRadius: '0.5rem',
          fontSize: '1rem'
        }}
      />
      <button style={{
        padding: '0.75rem',
        backgroundColor: '#7c3aed',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        cursor: 'pointer'
      }}>
        Login
      </button>
    </div>
  </div>
);

// Ultra-simple working app
const App = () => (
  <BrowserRouter>
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <WorkingNavigation />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Page not found</div>} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);

// Initialize
const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");

const root = ReactDOM.createRoot(container);
root.render(<App />);

console.log("✅ CoinKrazy working app initialized");

if (import.meta.hot) {
  import.meta.hot.accept(() => root.render(<App />));
}
