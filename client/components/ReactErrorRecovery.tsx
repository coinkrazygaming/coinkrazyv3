import React from 'react';

interface ReactErrorRecoveryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Simple error boundary specifically for React hooks errors
export class ReactErrorRecovery extends React.Component<
  ReactErrorRecoveryProps,
  { hasError: boolean; errorType: string }
> {
  constructor(props: ReactErrorRecoveryProps) {
    super(props);
    this.state = { hasError: false, errorType: "" };
  }

  static getDerivedStateFromError(error: Error) {
    const isHooksError = error.message.includes("useState") || 
                        error.message.includes("useContext") ||
                        error.message.includes("Invalid hook call");
    
    return { 
      hasError: true, 
      errorType: isHooksError ? "hooks" : "general"
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log("ReactErrorRecovery caught error:", error.message);
    
    if (this.state.errorType === "hooks") {
      console.log("React hooks error caught, attempting auto-recovery...");
      
      // Auto-recovery for hooks errors
      setTimeout(() => {
        this.setState({ hasError: false, errorType: "" });
      }, 100);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.errorType === "hooks") {
        // For hooks errors, show minimal loading state
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        );
      }

      // For other errors, show fallback or error message
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ReactErrorRecovery;
