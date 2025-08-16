// Store.tsx - Cache Buster Version 2.0 - {timestamp: 1701234567890}
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// IMPORTANT: This is a redirect-only component - NO PRICE LOGIC HERE
// If you see any pkg.price.toFixed errors, clear your browser cache!

const StoreRedirectComponent: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediate redirect to Gold Coin Store
    const timer = setTimeout(() => {
      navigate("/gold-store", { replace: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-yellow-500" />
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-400">Taking you to the Gold Coin Store</p>
        {/* Cache invalidation marker: STORE_V2_CLEAN */}
      </div>
    </div>
  );
};

export default StoreRedirectComponent;

// NO PRICE FORMATTING CODE BELOW THIS LINE
// NO PKG.PRICE.TOFIXED CALLS
// NO RENDERPACKAGECARD FUNCTION
// THIS IS A CLEAN REDIRECT COMPONENT ONLY
