// NEW STATS SERVICE - CACHE BUSTER v2025-01-08
// NO WEBSOCKET CODE - SAFE IMPLEMENTATION

export interface StatsData {
  playersOnline: number;
  gamesActive: number;
  totalWinnings: number;
  jackpotAmount: number;
}

// Completely safe stats service without any WebSocket dependencies
const createStatsService = () => {
  const subscribers = new Set<(data: StatsData) => void>();
  let intervalId: number | null = null;
  
  const startDataUpdates = () => {
    if (intervalId) return;
    
    let currentStats = {
      playersOnline: 2500,
      gamesActive: 150,
      totalWinnings: 1250000,
      jackpotAmount: 2500000
    };

    intervalId = window.setInterval(() => {
      // Update stats with random variations
      currentStats.playersOnline = Math.max(1000, 
        Math.min(5000, currentStats.playersOnline + Math.floor(Math.random() * 20 - 10))
      );
      currentStats.gamesActive = Math.max(50, 
        Math.min(300, currentStats.gamesActive + Math.floor(Math.random() * 10 - 5))
      );
      currentStats.totalWinnings += Math.random() * 1000;
      currentStats.jackpotAmount += Math.random() * 500;

      // Notify all subscribers
      subscribers.forEach(callback => {
        try {
          callback({ ...currentStats });
        } catch (error) {
          console.error('Stats callback error:', error);
        }
      });
    }, 3000);
  };

  return {
    subscribe(callback: (data: StatsData) => void) {
      subscribers.add(callback);
      
      if (subscribers.size === 1) {
        startDataUpdates();
      }
      
      // Return unsubscribe function
      return () => {
        subscribers.delete(callback);
        if (subscribers.size === 0 && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };
    },
    
    disconnect() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      subscribers.clear();
    },
    
    // For debugging - check if service is active
    isActive() {
      return intervalId !== null;
    }
  };
};

// Export the service instance
export const statsService = createStatsService();

// Add a cache-breaking export
export const STATS_SERVICE_VERSION = 'v2025-01-08-nocache';
