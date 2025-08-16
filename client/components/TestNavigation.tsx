import React from "react";

export default function TestNavigation() {
  console.log("🔍 TestNavigation component is rendering...");
  
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-purple-700 text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="text-gold-400 font-bold text-xl">CoinKrazy Test Navigation</div>
          <div className="text-white">Navigation is working!</div>
        </div>
      </div>
    </nav>
  );
}
