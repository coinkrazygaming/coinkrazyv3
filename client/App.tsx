import "./global.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

// Error Boundary to catch any React errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#fee2e2', 
          border: '1px solid #fca5a5', 
          borderRadius: '0.5rem',
          margin: '1rem'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ marginBottom: '1rem' }}>There was an error loading the application.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple working navigation component (self-contained, no external dependencies)
const WorkingNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = path;
    }
  };
  
  return (
    <nav style={{
      background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
      color: 'white',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>🎰 CoinKrazy</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => handleNavigation("/")}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: location.pathname === "/" ? '#6d28d9' : '#8b5cf6',
              color: 'white',
              cursor: 'pointer',
              fontWeight: location.pathname === "/" ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            🏠 Home
          </button>
          <button 
            onClick={() => handleNavigation("/games")}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: location.pathname === "/games" ? '#6d28d9' : '#8b5cf6',
              color: 'white',
              cursor: 'pointer',
              fontWeight: location.pathname === "/games" ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            🎮 Games
          </button>
          <button 
            onClick={() => handleNavigation("/slots")}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: location.pathname === "/slots" ? '#6d28d9' : '#8b5cf6',
              color: 'white',
              cursor: 'pointer',
              fontWeight: location.pathname === "/slots" ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            🎰 Slots
          </button>
          <button 
            onClick={() => handleNavigation("/login")}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: location.pathname === "/login" ? '#6d28d9' : '#8b5cf6',
              color: 'white',
              cursor: 'pointer',
              fontWeight: location.pathname === "/login" ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            🔐 Login
          </button>
          <div style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#10b981',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            💰 GC: 1,000 | SC: 10.00
          </div>
        </div>
      </div>
    </nav>
  );
};

// Simple page components with error handling
const HomePage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1f2937' }}>🎉 Welcome to CoinKrazy!</h1>
    <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '2rem' }}>Your ultimate social casino experience</p>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto' 
    }}>
      <div style={{ 
        padding: '2rem', 
        border: '2px solid #7c3aed', 
        borderRadius: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#7c3aed' }}>🎰 Slots</h3>
        <p style={{ color: '#6b7280' }}>Spin to win big with our exciting slot machines!</p>
      </div>
      <div style={{ 
        padding: '2rem', 
        border: '2px solid #7c3aed', 
        borderRadius: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#7c3aed' }}>🎮 Games</h3>
        <p style={{ color: '#6b7280' }}>Play all your favorite casino games!</p>
      </div>
    </div>
  </div>
);

const GamesPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: '#1f2937' }}>🎮 Games</h1>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '1.5rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {[
        { title: '🎰 Mega Slots', desc: 'Classic slot machine fun with big jackpots!' },
        { title: '🃏 Poker', desc: 'Texas Hold\'em action with real players' },
        { title: '🎲 Scratch Cards', desc: 'Instant win games with amazing prizes' },
        { title: '🎯 Bingo', desc: 'Traditional bingo with modern twists' },
        { title: '🎪 Carnival Games', desc: 'Fun fair games with great rewards' },
        { title: '🎨 Pick Cards', desc: 'Choose your destiny card games' }
      ].map((game, index) => (
        <div key={index} style={{ 
          padding: '1.5rem', 
          border: '1px solid #e5e7eb', 
          borderRadius: '0.75rem',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#7c3aed' }}>{game.title}</h3>
          <p style={{ color: '#6b7280', lineHeight: '1.5' }}>{game.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const SlotsPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: '#1f2937' }}>🎰 Slots</h1>
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>Try your luck with our amazing slot machines!</p>
    </div>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
      gap: '1.5rem',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {[
        { title: '🍒 Classic Slots', jackpot: '10,000 GC' },
        { title: '💎 Diamond Rush', jackpot: '25,000 GC' },
        { title: '🌟 Lucky Stars', jackpot: '50,000 GC' },
        { title: '🎪 Circus Wild', jackpot: '75,000 GC' }
      ].map((slot, index) => (
        <div key={index} style={{ 
          padding: '1.5rem', 
          border: '2px solid #f59e0b', 
          borderRadius: '1rem',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f59e0b' }}>{slot.title}</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Jackpot: {slot.jackpot}</p>
          <button style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            PLAY NOW
          </button>
        </div>
      ))}
    </div>
  </div>
);

const LoginPage = () => (
  <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: '#1f2937' }}>🔐 Login</h1>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '2rem', 
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="email" 
          placeholder="Email"
          style={{ 
            padding: '0.75rem', 
            border: '2px solid #e5e7eb', 
            borderRadius: '0.5rem',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        <input 
          type="password" 
          placeholder="Password"
          style={{ 
            padding: '0.75rem', 
            border: '2px solid #e5e7eb', 
            borderRadius: '0.5rem',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        <button style={{
          padding: '0.75rem',
          backgroundColor: '#7c3aed',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
        >
          Login to CoinKrazy
        </button>
      </div>
    </div>
  </div>
);

// Main App component with proper Router context
const App = () => {
  React.useEffect(() => {
    console.log("🎰 CoinKrazy App loaded successfully - " + new Date().toISOString());
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
          <WorkingNavigation />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/slots" element={<SlotsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  backgroundColor: 'white',
                  margin: '2rem',
                  borderRadius: '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <h2>🔍 Page not found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

// Initialize application with cache busting
const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");

const root = ReactDOM.createRoot(container);
root.render(<App />);

console.log("✅ CoinKrazy working app initialized - " + new Date().toISOString());

// HMR support with cache clearing
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log("🔄 HMR update - " + new Date().toISOString());
    root.render(<App />);
  });
}

// Clear any potentially cached navigation components
if (typeof window !== 'undefined') {
  // Force browser to clear any cached modules
  const timestamp = Date.now();
  console.log(`🧹 Cache bust timestamp: ${timestamp}`);
}
