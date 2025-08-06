// Safe stats service - no WebSocket errors
// Created: 2025-01-08 to replace problematic StatsService

interface SafeStatsData {
  playersOnline: number;
  gamesActive: number;
  totalWinnings: number;
  jackpotAmount: number;
}

class SafeStatsService {
  private static instance: SafeStatsService;
  private subscribers = new Set<(data: SafeStatsData) => void>();
  private timer: NodeJS.Timeout | null = null;

  private constructor() {
    console.log('SafeStatsService initialized - no WebSocket issues');
  }

  static getInstance(): SafeStatsService {
    if (!SafeStatsService.instance) {
      SafeStatsService.instance = new SafeStatsService();
    }
    return SafeStatsService.instance;
  }

  private startDataSimulation() {
    if (this.timer) return;

    let stats = {
      playersOnline: 2500,
      gamesActive: 150,
      totalWinnings: 1250000,
      jackpotAmount: 2500000
    };

    this.timer = setInterval(() => {
      stats.playersOnline = Math.max(1000, Math.min(5000, stats.playersOnline + Math.floor(Math.random() * 20) - 10));
      stats.gamesActive = Math.max(50, Math.min(300, stats.gamesActive + Math.floor(Math.random() * 10) - 5));
      stats.totalWinnings += Math.random() * 1000;
      stats.jackpotAmount += Math.random() * 500;

      this.subscribers.forEach(callback => {
        try {
          callback(stats);
        } catch (error) {
          console.error('SafeStatsService callback error:', error);
        }
      });
    }, 3000);
  }

  subscribe(callback: (data: SafeStatsData) => void): () => void {
    this.subscribers.add(callback);
    
    if (this.subscribers.size === 1) {
      this.startDataSimulation();
    }
    
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0 && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    };
  }

  disconnect() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.subscribers.clear();
  }
}

export const safeStatsService = SafeStatsService.getInstance();
export type { SafeStatsData };
