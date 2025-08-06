// MINIMAL STATS SERVICE - NO WEBSOCKET CODE AT ALL
// Version: 2025-01-08-FIXED

export interface StatsData {
  playersOnline: number;
  gamesActive: number;
  totalWinnings: number;
  jackpotAmount: number;
}

// Simple stats provider without any WebSocket functionality
export const statsService = {
  subscribers: new Set<(data: StatsData) => void>(),
  intervalId: null as number | null,
  
  subscribe(callback: (data: StatsData) => void) {
    this.subscribers.add(callback);
    
    if (!this.intervalId) {
      this.startSimulation();
    }
    
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0 && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  },
  
  startSimulation() {
    let stats = {
      playersOnline: 2500,
      gamesActive: 150,
      totalWinnings: 1250000,
      jackpotAmount: 2500000
    };

    this.intervalId = setInterval(() => {
      stats.playersOnline = Math.max(1000, Math.min(5000, stats.playersOnline + (Math.random() * 20 - 10)));
      stats.gamesActive = Math.max(50, Math.min(300, stats.gamesActive + (Math.random() * 10 - 5)));
      stats.totalWinnings += Math.random() * 1000;
      stats.jackpotAmount += Math.random() * 500;

      this.subscribers.forEach(callback => callback(stats));
    }, 3000);
  },
  
  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.subscribers.clear();
  }
};
