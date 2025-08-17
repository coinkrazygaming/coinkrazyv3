import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Safe Navigation component that handles Router context gracefully
const SafeNavigation = () => {
  // Test if Router context is available
  const [hasRouterContext, setHasRouterContext] = React.useState(false);
  const [location, setLocation] = React.useState({ pathname: "/" });
  const [navigate, setNavigate] = React.useState<((path: string) => void) | null>(null);

  React.useEffect(() => {
    try {
      const loc = useLocation();
      const nav = useNavigate();
      setLocation(loc);
      setNavigate(() => nav);
      setHasRouterContext(true);
      console.log("✅ Router context available in Navigation");
    } catch (error) {
      console.error("❌ Router context not available:", error);
      setHasRouterContext(false);
    }
  }, []);

  if (!hasRouterContext) {
    return (
      <nav className="bg-red-800 text-white p-4">
        <div className="text-center">
          <h1>Router Context Error</h1>
          <p>Navigation component cannot access Router context</p>
        </div>
      </nav>
    );
  }

  const handleNavigation = (path: string) => {
    if (navigate) {
      navigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-800 to-purple-900 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold">CoinKrazy</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => handleNavigation("/")}
            className={`px-4 py-2 rounded ${location.pathname === "/" ? "bg-purple-600" : "bg-purple-700 hover:bg-purple-600"}`}
          >
            🏠 Home
          </button>
          <button 
            onClick={() => handleNavigation("/games")}
            className={`px-4 py-2 rounded ${location.pathname === "/games" ? "bg-purple-600" : "bg-purple-700 hover:bg-purple-600"}`}
          >
            🎮 Games
          </button>
          <button 
            onClick={() => handleNavigation("/slots")}
            className={`px-4 py-2 rounded ${location.pathname === "/slots" ? "bg-purple-600" : "bg-purple-700 hover:bg-purple-600"}`}
          >
            🎰 Slots
          </button>
          <button 
            onClick={() => handleNavigation("/login")}
            className={`px-4 py-2 rounded ${location.pathname === "/login" ? "bg-purple-600" : "bg-purple-700 hover:bg-purple-600"}`}
          >
            🔐 Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SafeNavigation;
