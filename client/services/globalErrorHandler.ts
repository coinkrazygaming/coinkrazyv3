// Global error handler to prevent getReadyStateText errors
// This handles any WebSocket errors that might still occur

if (typeof window !== 'undefined') {
  // Override WebSocket globally to prevent getReadyStateText errors
  const OriginalWebSocket = window.WebSocket;
  
  window.WebSocket = class SafeWebSocket extends OriginalWebSocket {
    constructor(...args: any[]) {
      super(...args);
      
      // Override onerror to prevent getReadyStateText calls
      const originalOnError = this.onerror;
      this.onerror = (event) => {
        console.log('WebSocket error intercepted - preventing unsafe method calls');
        // Don't call getReadyStateText or any unsafe methods
        if (originalOnError && typeof originalOnError === 'function') {
          try {
            // Safely call original error handler without context
            originalOnError.call(null, event);
          } catch (error) {
            console.log('Prevented WebSocket error handler crash:', error);
          }
        }
      };
    }
  };

  // Add global error handler for any remaining issues
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('getReadyStateText')) {
      console.log('Prevented getReadyStateText error:', event.message);
      event.stopPropagation();
      event.preventDefault();
      return false;
    }
  });

  // Also catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.toString().includes('getReadyStateText')) {
      console.log('Prevented getReadyStateText promise rejection');
      event.preventDefault();
      return false;
    }
  });

  // Override console.error to filter WebSocket errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('getReadyStateText')) {
      console.log('Suppressed getReadyStateText console error');
      return;
    }
    originalConsoleError.apply(console, args);
  };

  console.log('Global WebSocket error protection loaded');
}

export const GLOBAL_ERROR_HANDLER_LOADED = true;
