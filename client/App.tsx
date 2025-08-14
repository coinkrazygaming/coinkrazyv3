import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";

const TestApp = () => (
  <div className="p-8">
    <h1 className="text-4xl font-bold text-blue-600">CoinKrazy Test App</h1>
    <p className="text-lg mt-4">If you can see this, React is working!</p>
    <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
      <p>✅ React is mounted and rendering</p>
      <p>✅ Tailwind CSS is working</p>
      <p>✅ Basic imports are functional</p>
    </div>
  </div>
);

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
  console.log("✅ Test app mounted successfully");
} else {
  console.error("❌ Root container not found");
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    if (container) {
      const root = createRoot(container);
      root.render(<TestApp />);
    }
  });
}
