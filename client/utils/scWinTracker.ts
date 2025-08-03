import { analyticsService } from '../services/realTimeAnalytics';

// Utility to track Sweeps Coin wins of 0.01 SC and above
export class SCWinTracker {
  private static instance: SCWinTracker;

  private constructor() {}

  static getInstance(): SCWinTracker {
    if (!SCWinTracker.instance) {
      SCWinTracker.instance = new SCWinTracker();
    }
    return SCWinTracker.instance;
  }

  // Track a single SC win
  async trackWin(userId: string, amount: number, gameType: string, gameId?: string) {
    try {
      // Only track wins of 0.01 SC and above
      if (amount >= 0.01) {
        await analyticsService.trackSCWin(userId, amount, gameType);
        
        // Log for debugging
        console.log(`[SC WIN TRACKER] ${amount.toFixed(2)} SC won by ${userId} in ${gameType}`);
        
        // In production, this would also:
        // 1. Update user's wallet balance
        // 2. Send notification to user
        // 3. Update leaderboards
        // 4. Trigger any promotional logic
        
        return true;
      } else {
        console.log(`[SC WIN TRACKER] Win amount ${amount} SC below minimum threshold (0.01 SC)`);
        return false;
      }
    } catch (error) {
      console.error('[SC WIN TRACKER] Failed to track SC win:', error);
      return false;
    }
  }

  // Track multiple wins (for bonus rounds, etc.)
  async trackMultipleWins(userId: string, wins: Array<{ amount: number; gameType: string; gameId?: string }>) {
    const results = await Promise.allSettled(
      wins.map(win => this.trackWin(userId, win.amount, win.gameType, win.gameId))
    );
    
    const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
    const total = wins.reduce((sum, win) => sum + win.amount, 0);
    
    console.log(`[SC WIN TRACKER] Tracked ${successful}/${wins.length} wins, total: ${total.toFixed(2)} SC`);
    
    return { successful, total, attempted: wins.length };
  }

  // Simulate a win for testing purposes
  async simulateWin(userId: string = 'test_user', gameType: string = 'Test Game') {
    // Generate random win amount between 0.01 and 50.00 SC
    const amount = Math.random() * 50 + 0.01;
    return this.trackWin(userId, amount, gameType);
  }

  // Batch simulate wins for stress testing
  async simulateMultipleWins(count: number = 10, userId: string = 'test_user') {
    const wins = Array.from({ length: count }, () => ({
      amount: Math.random() * 50 + 0.01,
      gameType: ['CoinKrazy Spinner', 'Lucky Scratch Gold', 'Wheel of Fortune', 'Number Rush Bingo'][Math.floor(Math.random() * 4)]
    }));
    
    return this.trackMultipleWins(userId, wins);
  }
}

// Export singleton instance
export const scWinTracker = SCWinTracker.getInstance();

// Helper function for easy wins tracking
export const trackSCWin = (userId: string, amount: number, gameType: string, gameId?: string) => {
  return scWinTracker.trackWin(userId, amount, gameType, gameId);
};

// Helper function for testing wins
export const simulateWin = (userId?: string, gameType?: string) => {
  return scWinTracker.simulateWin(userId, gameType);
};
