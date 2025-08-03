// Real-time analytics service for CoinKrazy.com
// Connects to backend API for live data updates

interface RealTimeData {
  playersOnline: number;
  totalSCWonToday: number;
  totalWinningsUSD: number;
  activeGames: number;
  newSignupsToday: number;
  jackpotTotal: number;
}

interface UserWalletBalance {
  goldCoins: number;
  sweepsCoins: number;
  usdBalance: number;
  currency: 'USD' | 'BTC' | 'ETH';
}

interface UserSession {
  userId: string;
  username: string;
  isAdmin: boolean;
  isOnline: boolean;
  lastActivity: Date;
  location?: string;
}

class RealTimeAnalyticsService {
  private static instance: RealTimeAnalyticsService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribers: Map<string, (data: any) => void> = new Map();

  private constructor() {
    this.connect();
  }

  static getInstance(): RealTimeAnalyticsService {
    if (!RealTimeAnalyticsService.instance) {
      RealTimeAnalyticsService.instance = new RealTimeAnalyticsService();
    }
    return RealTimeAnalyticsService.instance;
  }

  private connect() {
    try {
      // In production, this would connect to your WebSocket server
      // For now, we'll simulate real-time data with intervals
      this.simulateRealTimeData();
    } catch (error) {
      console.error('Failed to connect to analytics service:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // Simulate real-time data until backend is implemented
  private simulateRealTimeData() {
    let playersOnline = 2847;
    let totalSCWonToday = 1254.29; // Real SC amount
    let totalWinningsUSD = 1254029.45;
    let activeGames = 156;
    let newSignupsToday = 234;
    let jackpotTotal = 2847593.67;

    setInterval(() => {
      // Simulate realistic fluctuations
      const playerChange = Math.floor(Math.random() * 20) - 10;
      playersOnline = Math.max(1000, Math.min(5000, playersOnline + playerChange));

      // SC wins increase throughout the day (0.01 SC minimum tracked)
      const scWinIncrease = (Math.random() * 50 + 1) * 0.01; // 0.01 to 0.50 SC per update
      totalSCWonToday += scWinIncrease;

      // USD equivalent
      totalWinningsUSD = totalSCWonToday * 1000; // 1 SC = $1000 for display

      // Active games fluctuation
      activeGames = Math.max(100, Math.min(200, activeGames + Math.floor(Math.random() * 10) - 5));

      // New signups increase slowly
      if (Math.random() > 0.7) newSignupsToday++;

      // Jackpot grows
      jackpotTotal += Math.random() * 1000;

      const data: RealTimeData = {
        playersOnline,
        totalSCWonToday: Math.round(totalSCWonToday * 100) / 100,
        totalWinningsUSD,
        activeGames,
        newSignupsToday,
        jackpotTotal
      };

      // Notify all subscribers
      this.subscribers.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }, 2000); // Update every 2 seconds for real-time feel
  }

  // Subscribe to real-time data updates
  subscribe(id: string, callback: (data: RealTimeData) => void) {
    this.subscribers.set(id, callback);
    
    // Immediately send current data
    this.getCurrentData().then(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(id);
    };
  }

  // Get current analytics data
  async getCurrentData(): Promise<RealTimeData> {
    try {
      // In production, this would be an API call
      // const response = await fetch('/api/analytics/current');
      // return response.json();
      
      // For now, return simulated current data
      return {
        playersOnline: 2847,
        totalSCWonToday: 1254.29,
        totalWinningsUSD: 1254029.45,
        activeGames: 156,
        newSignupsToday: 234,
        jackpotTotal: 2847593.67
      };
    } catch (error) {
      console.error('Failed to fetch current data:', error);
      throw error;
    }
  }

  // Get user wallet balance (real-time)
  async getUserWalletBalance(userId: string): Promise<UserWalletBalance> {
    try {
      // In production: const response = await fetch(`/api/user/${userId}/wallet`);
      // Simulate real wallet data
      return {
        goldCoins: 125000 + Math.floor(Math.random() * 50000),
        sweepsCoins: 45.67 + Math.random() * 100,
        usdBalance: 1234.56 + Math.random() * 500,
        currency: 'USD'
      };
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      throw error;
    }
  }

  // Get real-time online users count
  async getOnlineUsersCount(): Promise<number> {
    try {
      // In production: const response = await fetch('/api/users/online-count');
      // For now, return live count from our real-time data
      const data = await this.getCurrentData();
      return data.playersOnline;
    } catch (error) {
      console.error('Failed to fetch online users count:', error);
      return 0;
    }
  }

  // Get detailed online users (admin only)
  async getOnlineUsers(): Promise<UserSession[]> {
    try {
      // In production: const response = await fetch('/api/admin/users/online');
      // Simulate real online users data
      const userCount = await this.getOnlineUsersCount();
      const users: UserSession[] = [];
      
      for (let i = 0; i < Math.min(userCount, 100); i++) { // Limit to 100 for performance
        users.push({
          userId: `user_${i + 1}`,
          username: `player${1000 + i}`,
          isAdmin: i === 0, // First user is admin
          isOnline: true,
          lastActivity: new Date(Date.now() - Math.random() * 3600000), // Within last hour
          location: ['USA', 'Canada', 'UK', 'Australia'][Math.floor(Math.random() * 4)]
        });
      }
      
      return users;
    } catch (error) {
      console.error('Failed to fetch online users:', error);
      return [];
    }
  }

  // Track SC win (called when user wins)
  async trackSCWin(userId: string, amount: number, gameType: string) {
    try {
      if (amount >= 0.01) { // Only track wins of 0.01 SC and above
        // In production: await fetch('/api/analytics/track-win', { method: 'POST', ... });
        console.log(`Tracked SC win: ${amount} SC for user ${userId} in ${gameType}`);
      }
    } catch (error) {
      console.error('Failed to track SC win:', error);
    }
  }

  // Get today's total SC wins
  async getTodaysSCWins(): Promise<number> {
    try {
      // In production: const response = await fetch('/api/analytics/todays-sc-wins');
      const data = await this.getCurrentData();
      return data.totalSCWonToday;
    } catch (error) {
      console.error('Failed to fetch today\'s SC wins:', error);
      return 0;
    }
  }

  // Check if user is admin
  async checkAdminStatus(userId: string): Promise<boolean> {
    try {
      // In production: const response = await fetch(`/api/user/${userId}/admin-status`);
      // For demo, check against known admin users
      const adminUsers = ['coinkrazy00@gmail.com', 'admin', 'user_1'];
      return adminUsers.includes(userId);
    } catch (error) {
      console.error('Failed to check admin status:', error);
      return false;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.subscribers.clear();
  }
}

// Export singleton instance
export const analyticsService = RealTimeAnalyticsService.getInstance();

// Export types
export type { RealTimeData, UserWalletBalance, UserSession };
