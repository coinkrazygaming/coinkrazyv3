import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-red-700 mb-4">Error: {this.state.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load components to identify import issues
const LazyApp = React.lazy(async () => {
  try {
    console.log("Loading app components...");
    
    const [
      { Toaster },
      SonnerModule,
      { TooltipProvider },
      { QueryClient, QueryClientProvider },
      { BrowserRouter, Routes, Route },
      Navigation,
      Footer,
      AIAssistant,
      TickerDisplay,
      ComplianceBanner,
      Index
    ] = await Promise.all([
      import("@/components/ui/toaster"),
      import("@/components/ui/sonner"),
      import("@/components/ui/tooltip"),
      import("@tanstack/react-query"),
      import("react-router-dom"),
      import("./components/Navigation"),
      import("./components/Footer"),
      import("./components/AIAssistant"),
      import("./components/TickerDisplay"),
      import("./components/ComplianceBanner"),
      import("./pages/Index")
    ]);

    console.log("✅ All core components loaded successfully");

    const queryClient = new QueryClient();

    const Layout = ({ children }: { children: React.ReactNode }) => (
      <div className="min-h-screen flex flex-col">
        <ComplianceBanner.default />
        <TickerDisplay.default />
        <Navigation.default />
        <main className="flex-1">{children}</main>
        <Footer.default />
        <AIAssistant.default />
      </div>
    );

    const FullApp = () => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <SonnerModule.Toaster />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index.default />} />
                <Route path="*" element={
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                    <p>Loading in progress...</p>
                  </div>
                } />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );

    return { default: FullApp };
  } catch (error) {
    console.error("Failed to load app components:", error);
    
    // Return a fallback component
    const FallbackApp = () => (
      <div className="p-8 bg-yellow-50 border border-yellow-200 rounded">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">Loading Error</h1>
        <p className="text-yellow-700 mb-4">Failed to load app components: {(error as Error).message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Retry
        </button>
      </div>
    );
    
    return { default: FallbackApp };
  }
});

const App = () => (
  <ErrorBoundary>
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading CoinKrazy...</p>
        </div>
      </div>
    }>
      <LazyApp />
    </React.Suspense>
  </ErrorBoundary>
);

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log("✅ App mounted successfully");
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
