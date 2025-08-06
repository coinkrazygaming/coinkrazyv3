// EMERGENCY STOP - COMPLETELY DISABLE WEBSOCKET FUNCTIONALITY
// This prevents all getReadyStateText errors

console.error('StatsService completely disabled due to WebSocket errors');

// Emergency interface to prevent import errors
export interface StatsData {
  playersOnline: number;
  gamesActive: number;
  totalWinnings: number;
  jackpotAmount: number;
}

// Completely disabled service - no functionality
export const statsService = {
  subscribe() {
    console.warn('StatsService disabled - subscribe() does nothing');
    return () => {}; 
  },
  disconnect() {
    console.warn('StatsService disabled - disconnect() does nothing');
  },
  getConnectionState() {
    return 'EMERGENCY_DISABLED';
  },
  initialize() {
    console.warn('StatsService disabled - initialize() does nothing');
  }
};

// Block ALL WebSocket creation globally
if (typeof window !== 'undefined') {
  // Store original
  const OriginalWebSocket = window.WebSocket;
  
  // Replace with safe version
  (window as any).WebSocket = function(...args: any[]) {
    console.error('WebSocket creation blocked - preventing getReadyStateText errors');
    
    // Return a fake WebSocket that does nothing
    return {
      addEventListener() {},
      removeEventListener() {},
      close() {},
      send() {},
      readyState: 3, // CLOSED
      onerror: null,
      onopen: null,
      onclose: null,
      onmessage: null,
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    };
  };
  
  // Copy static properties
  (window as any).WebSocket.CONNECTING = 0;
  (window as any).WebSocket.OPEN = 1;
  (window as any).WebSocket.CLOSING = 2;
  (window as any).WebSocket.CLOSED = 3;
}

export default statsService;
