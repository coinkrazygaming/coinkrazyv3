// New stats service without any WebSocket issues
// Completely rewritten to avoid cache problems

interface StatsData {
  playersOnline: number;
  gamesActive: number;
  totalWinnings: number;
  jackpotAmount: number;
}

class NewStatsService {
  private static instance: NewStatsService;
  private subscribers: Set<(data: StatsData) => void> = new Set();
  private intervalId: number | null = null;

  private constructor() {
    // Safe constructor - no WebSocket initialization
  }

  static getInstance(): NewStatsService {
    if (!NewStatsService.instance) {
      NewStatsService.instance = new NewStatsService();
    }
    return NewStatsService.instance;
  }

  startSimulation() {
    if (this.intervalId) return; // Already running

    let stats = {
      playersOnline: 2500,
      gamesActive: 150,
      totalWinnings: 1250000,
      jackpotAmount: 2500000
    };

    this.intervalId = window.setInterval(() => {
      stats.playersOnline += Math.floor(Math.random() * 20) - 10;
      stats.playersOnline = Math.max(1000, Math.min(5000, stats.playersOnline));
      
      stats.gamesActive += Math.floor(Math.random() * 10) - 5;
      stats.gamesActive = Math.max(50, Math.min(300, stats.gamesActive));
      
      stats.totalWinnings += Math.random() * 1000;
      stats.jackpotAmount += Math.random() * 500;

      this.notifySubscribers(stats);
    }, 3000);
  }

  private notifySubscribers(data: StatsData) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in stats subscriber callback:', error);
      }
    });
  }

  subscribe(callback: (data: StatsData) => void): () => void {
    this.subscribers.add(callback);
    this.startSimulation(); // Start on first subscription
    
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.stopSimulation();
      }
    };
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  disconnect() {
    this.stopSimulation();
    this.subscribers.clear();
  }
}

// Export new service
export const newStatsService = NewStatsService.getInstance();
export type { StatsData };
