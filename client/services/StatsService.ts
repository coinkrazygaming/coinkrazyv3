// Stats service for WebSocket connections and real-time statistics
// Fixed version without getReadyStateText method - Updated: 2025-01-08

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

  private constructor() {
    this.initializeConnection();
  }

  static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService();
    }
    return StatsService.instance;
  }

  private initializeConnection() {
    try {
      // In development, simulate connection
      if (process.env.NODE_ENV === 'development') {
        this.simulateConnection();
        return;
      }

      // Production WebSocket connection would go here
      // this.wsConnection = new WebSocket('wss://your-websocket-server.com');
      // this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to initialize stats connection:', error);
      this.handleConnectionError();
    }
  }

  private simulateConnection() {
    // Simulate successful connection
    setTimeout(() => {
      this.startSimulatedData();
    }, 100);
  }

  private setupEventHandlers() {
    if (!this.wsConnection) return;

    this.wsConnection.onopen = () => {
      console.log('Stats WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data: StatsData = JSON.parse(event.data);
        this.notifySubscribers(data);
      } catch (error) {
        console.error('Error parsing stats data:', error);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error('Stats WebSocket error:', error);
      // Fixed: Using standard WebSocket readyState instead of getReadyStateText
      const readyState = this.wsConnection?.readyState ?? WebSocket.CLOSED;
      const stateText = this.getReadyStateDescription(readyState);
      console.error(`WebSocket state: ${stateText}`);
      this.handleConnectionError();
    };

    this.wsConnection.onclose = () => {
      console.log('Stats WebSocket disconnected');
      this.handleConnectionError();
    };
  }

  private getReadyStateDescription(readyState: number): string {
    switch (readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }

  private handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Reconnecting in ${delay}ms... Attempt ${this.reconnectAttempts}`);
      
      setTimeout(() => {
        this.initializeConnection();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private startSimulatedData() {
    let stats = {
      playersOnline: 2500,
      gamesActive: 150,
      totalWinnings: 1250000,
      jackpotAmount: 2500000
    };

    const updateInterval = setInterval(() => {
      // Simulate realistic stat changes
      stats.playersOnline += Math.floor(Math.random() * 20) - 10;
      stats.playersOnline = Math.max(1000, Math.min(5000, stats.playersOnline));
      
      stats.gamesActive += Math.floor(Math.random() * 10) - 5;
      stats.gamesActive = Math.max(50, Math.min(300, stats.gamesActive));
      
      stats.totalWinnings += Math.random() * 1000;
      stats.jackpotAmount += Math.random() * 500;

      this.notifySubscribers(stats);
    }, 3000);

    // Store interval for cleanup
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
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }

    // Clear simulation interval if exists
    if ((this as any).simulationInterval) {
      clearInterval((this as any).simulationInterval);
    }

    this.subscribers.clear();
  }

  getConnectionState(): string {
    if (!this.wsConnection) return 'DISCONNECTED';
    return this.getReadyStateDescription(this.wsConnection.readyState);
  }
}

// Export singleton instance
export const statsService = StatsService.getInstance();
export type { StatsData };
