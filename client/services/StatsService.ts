// Stats service for WebSocket connections and real-time statistics
// Safe version - prevents WebSocket initialization until explicitly called

interface StatsData {
  playersOnline: number;
  gamesActive: number;
  totalWinnings: number;
  jackpotAmount: number;
}

class StatsService {
  private static instance: StatsService;
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribers: Set<(data: StatsData) => void> = new Set();
  private isInitialized = false;

  private constructor() {
    // Don't auto-initialize to prevent errors
    console.log('StatsService created but not initialized');
  }

  static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService();
    }
    return StatsService.instance;
  }

  // Safe initialization method
  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    try {
      // Only simulate for now - no actual WebSocket
      this.simulateConnection();
    } catch (error) {
      console.error('Failed to initialize stats connection:', error);
    }
  }

  private simulateConnection() {
    console.log('Starting simulated stats connection');
    setTimeout(() => {
      this.startSimulatedData();
    }, 100);
  }

  private startSimulatedData() {
    let stats = {
      playersOnline: 2500,
      gamesActive: 150,
      totalWinnings: 1250000,
      jackpotAmount: 2500000
    };

    const updateInterval = setInterval(() => {
      stats.playersOnline += Math.floor(Math.random() * 20) - 10;
      stats.playersOnline = Math.max(1000, Math.min(5000, stats.playersOnline));
      
      stats.gamesActive += Math.floor(Math.random() * 10) - 5;
      stats.gamesActive = Math.max(50, Math.min(300, stats.gamesActive));
      
      stats.totalWinnings += Math.random() * 1000;
      stats.jackpotAmount += Math.random() * 500;

      this.notifySubscribers(stats);
    }, 3000);

    (this as any).simulationInterval = updateInterval;
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
    
    // Initialize on first subscription
    if (!this.isInitialized) {
      this.initialize();
    }
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }

    if ((this as any).simulationInterval) {
      clearInterval((this as any).simulationInterval);
    }

    this.subscribers.clear();
    this.isInitialized = false;
  }

  getConnectionState(): string {
    if (!this.isInitialized) return 'NOT_INITIALIZED';
    if (!this.wsConnection) return 'SIMULATED';
    return 'UNKNOWN';
  }
}

// Export singleton instance
export const statsService = StatsService.getInstance();
export type { StatsData };
