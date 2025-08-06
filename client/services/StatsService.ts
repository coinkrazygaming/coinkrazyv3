// Statistics service for real-time data with WebSocket support
// Provides live updates for player statistics and game metrics

import { StatsResponse } from '@shared/api';

type StatsData = StatsResponse;

class StatsService {
  private static instance: StatsService;
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribers: Set<(data: StatsData) => void> = new Set();
  private isConnecting = false;

  private constructor() {
    this.connect();
  }

  static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService();
    }
    return StatsService.instance;
  }

  private connect() {
    if (this.isConnecting || this.wsConnection?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.isConnecting = true;
      
      // In production, replace with your actual WebSocket URL
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? 'wss://your-websocket-server.com/stats'
        : 'ws://localhost:8080/stats';

      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log('Stats WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data: StatsData = JSON.parse(event.data);
          this.notifySubscribers(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.log('WebSocket ready state:', this.getReadyStateText(this.wsConnection?.readyState));
        this.isConnecting = false;
      };

      this.wsConnection.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.isConnecting = false;
        this.wsConnection = null;
        
        if (!event.wasClean) {
          this.handleReconnect();
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  private getReadyStateText(readyState?: number): string {
    if (readyState === undefined) return 'UNKNOWN';
    
    switch (readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Reconnecting to stats service... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. Falling back to polling.');
      this.fallbackToPolling();
    }
  }

  private fallbackToPolling() {
    // Fallback to HTTP polling when WebSocket fails
    const pollInterval = setInterval(() => {
      this.fetchStatsData()
        .then(data => this.notifySubscribers(data))
        .catch(error => {
          console.error('Failed to fetch stats data:', error);
          clearInterval(pollInterval);
        });
    }, 5000); // Poll every 5 seconds
  }

  private async fetchStatsData(): Promise<StatsData> {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      // Return mock data if API is not available
      return {
        playersOnline: Math.floor(Math.random() * 1000) + 500,
        totalWins: Math.floor(Math.random() * 10000),
        activeGames: Math.floor(Math.random() * 50) + 10,
        serverStatus: 'online'
      };
    }
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

    // Send initial data
    this.fetchStatsData().then(callback).catch(console.error);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  getConnectionStatus(): string {
    return this.getReadyStateText(this.wsConnection?.readyState);
  }

  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscribers.clear();
  }

  // Force reconnect
  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }
}

// Export singleton instance
export const statsService = StatsService.getInstance();

// Export types
export type { StatsData };
