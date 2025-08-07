import { walletService, CurrencyType } from './walletService';

export interface Jackpot {
  id: string;
  gameId: string;
  gameName: string;
  type: 'progressive' | 'fixed' | 'local';
  amount: number;
  currency: CurrencyType;
  contributionRate: number; // Percentage of profit that goes to jackpot (45% = 0.45)
  minBet: number; // Minimum bet to qualify for jackpot
  lastWon: Date | null;
  lastWinner: string | null;
  totalContributions: number;
  isActive: boolean;
  maxAmount?: number; // For capped progressives
  seedAmount: number; // Amount jackpot resets to after being won
}

export interface JackpotWin {
  id: string;
  jackpotId: string;
  gameId: string;
  userId: string;
  amount: number;
  currency: CurrencyType;
  wonAt: Date;
  spinNumber: number;
  betAmount: number;
  isVerified: boolean;
}

export interface JackpotContribution {
  id: string;
  jackpotId: string;
  gameId: string;
  userId: string;
  amount: number;
  currency: CurrencyType;
  contributedAt: Date;
  fromProfit: number; // Portion of game profit that contributed
}

class JackpotService {
  private jackpots: Map<string, Jackpot> = new Map();
  private contributions: JackpotContribution[] = [];
  private wins: JackpotWin[] = [];
  private updateCallbacks: ((jackpot: Jackpot) => void)[] = [];

  constructor() {
    this.initializeJackpots();
    this.startRealTimeUpdates();
  }

  private initializeJackpots() {
    // Initialize jackpots for all slot games starting at 0
    const slotGames = [
      { id: 'coinkrazy-special', name: 'CoinKrazy Special' },
      { id: 'sweet-bonanza-pro', name: 'Sweet Bonanza Pro' },
      { id: 'gates-olympus-pro', name: 'Gates of Olympus Pro' },
      { id: 'classic-777', name: 'Classic 777' },
      { id: 'cosmic-megaways', name: 'Cosmic Megaways' }
    ];

    slotGames.forEach(game => {
      const jackpot: Jackpot = {
        id: `jackpot-${game.id}`,
        gameId: game.id,
        gameName: game.name,
        type: 'progressive',
        amount: 0, // Start at 0 as requested
        currency: 'GC',
        contributionRate: 0.45, // 45% of profit
        minBet: 10, // Minimum 10 GC bet to qualify
        lastWon: null,
        lastWinner: null,
        totalContributions: 0,
        isActive: true,
        seedAmount: 0, // Reset to 0 after win
      };
      this.jackpots.set(game.id, jackpot);
    });
  }

  private startRealTimeUpdates() {
    // Update jackpots every 5 seconds with real-time data
    setInterval(() => {
      this.updateJackpotAmounts();
    }, 5000);
  }

  private async updateJackpotAmounts() {
    for (const [gameId, jackpot] of this.jackpots) {
      if (!jackpot.isActive) continue;

      // Get recent game profit for this specific slot game
      const gameProfit = await this.getGameProfit(gameId);
      
      // Calculate jackpot contribution (45% of profit)
      const contribution = gameProfit * jackpot.contributionRate;
      
      if (contribution > 0) {
        const oldAmount = jackpot.amount;
        jackpot.amount += contribution;
        jackpot.totalContributions += contribution;

        // Record the contribution
        this.contributions.push({
          id: `contrib-${Date.now()}-${Math.random()}`,
          jackpotId: jackpot.id,
          gameId,
          userId: 'system', // System contribution from profit
          amount: contribution,
          currency: jackpot.currency,
          contributedAt: new Date(),
          fromProfit: gameProfit
        });

        // Notify subscribers of jackpot update
        this.notifyUpdateCallbacks(jackpot);

        console.log(`Jackpot ${jackpot.gameName}: ${oldAmount.toFixed(2)} → ${jackpot.amount.toFixed(2)} (+${contribution.toFixed(2)})`);
      }
    }
  }

  private async getGameProfit(gameId: string): Promise<number> {
    // This would connect to your actual game session database
    // For real implementation, calculate profit from recent game sessions
    
    // Simulate realistic profit data based on game activity
    const baseProfit = Math.random() * 50; // 0-50 profit per update cycle
    const gameActivity = this.getGameActivityMultiplier(gameId);
    
    return baseProfit * gameActivity;
  }

  private getGameActivityMultiplier(gameId: string): number {
    // Different games have different activity levels
    const activityMap: Record<string, number> = {
      'coinkrazy-special': 1.5, // Most popular
      'sweet-bonanza-pro': 1.3,
      'gates-olympus-pro': 1.2,
      'classic-777': 0.8,
      'cosmic-megaways': 1.0
    };
    return activityMap[gameId] || 1.0;
  }

  public async getJackpot(gameId: string): Promise<Jackpot> {
    const jackpot = this.jackpots.get(gameId);
    if (!jackpot) {
      throw new Error(`Jackpot not found for game: ${gameId}`);
    }
    return { ...jackpot }; // Return copy to prevent external modification
  }

  public async getAllJackpots(): Promise<Jackpot[]> {
    return Array.from(this.jackpots.values()).map(j => ({ ...j }));
  }

  public async contributeToJackpot(
    gameId: string, 
    userId: string, 
    betAmount: number, 
    currency: CurrencyType
  ): Promise<void> {
    const jackpot = this.jackpots.get(gameId);
    if (!jackpot || !jackpot.isActive) return;

    // Only contribute if bet meets minimum requirement
    if (betAmount < jackpot.minBet) return;

    // Calculate contribution based on bet amount (small percentage)
    const contributionRate = 0.01; // 1% of bet goes to jackpot
    const contribution = betAmount * contributionRate;

    jackpot.amount += contribution;
    jackpot.totalContributions += contribution;

    // Record the contribution
    this.contributions.push({
      id: `contrib-${Date.now()}-${Math.random()}`,
      jackpotId: jackpot.id,
      gameId,
      userId,
      amount: contribution,
      currency,
      contributedAt: new Date(),
      fromProfit: 0 // This is from player bet, not profit
    });

    this.notifyUpdateCallbacks(jackpot);
  }

  public async checkJackpotWin(
    gameId: string,
    userId: string,
    spinResult: any,
    betAmount: number,
    currency: CurrencyType
  ): Promise<JackpotWin | null> {
    const jackpot = this.jackpots.get(gameId);
    if (!jackpot || !jackpot.isActive || betAmount < jackpot.minBet) {
      return null;
    }

    // Check if this spin triggers jackpot
    const jackpotTriggered = this.evaluateJackpotWin(spinResult, jackpot);
    
    if (jackpotTriggered) {
      const win: JackpotWin = {
        id: `win-${Date.now()}-${Math.random()}`,
        jackpotId: jackpot.id,
        gameId,
        userId,
        amount: jackpot.amount,
        currency,
        wonAt: new Date(),
        spinNumber: spinResult.spinNumber || 0,
        betAmount,
        isVerified: false
      };

      // Process the jackpot win
      await this.processJackpotWin(win);
      return win;
    }

    return null;
  }

  private evaluateJackpotWin(spinResult: any, jackpot: Jackpot): boolean {
    // Different jackpot trigger conditions based on game type
    if (jackpot.gameId.includes('coinkrazy')) {
      // CoinKrazy: 5 gold coin symbols on payline
      return spinResult.symbols?.includes('gold_coin') && 
             spinResult.winningLines?.length > 0;
    } else if (jackpot.gameId.includes('sweet-bonanza')) {
      // Sweet Bonanza: Scatter combination with multiplier
      return spinResult.scatterCount >= 4 && spinResult.multiplier >= 100;
    } else if (jackpot.gameId.includes('gates-olympus')) {
      // Gates of Olympus: Zeus symbol combination
      return spinResult.symbols?.filter((s: string) => s === 'zeus').length >= 3;
    } else {
      // Generic: Random chance based on bet amount
      const jackpotChance = Math.min(jackpot.amount / 100000, 0.001); // Max 0.1% chance
      return Math.random() < jackpotChance;
    }
  }

  private async processJackpotWin(win: JackpotWin): Promise<void> {
    const jackpot = this.jackpots.get(win.gameId);
    if (!jackpot) return;

    // Award the jackpot to player
    await walletService.addBalance(win.userId, win.amount, win.currency);

    // Record the win
    this.wins.push(win);

    // Reset jackpot to seed amount
    const oldAmount = jackpot.amount;
    jackpot.amount = jackpot.seedAmount;
    jackpot.lastWon = win.wonAt;
    jackpot.lastWinner = win.userId;

    // Verify the win
    win.isVerified = true;

    this.notifyUpdateCallbacks(jackpot);

    console.log(`JACKPOT WON! ${jackpot.gameName}: ${win.userId} won ${win.amount.toFixed(2)} ${win.currency}`);
    console.log(`Jackpot reset: ${oldAmount.toFixed(2)} → ${jackpot.amount.toFixed(2)}`);
  }

  public async getJackpotHistory(gameId?: string): Promise<JackpotWin[]> {
    if (gameId) {
      return this.wins.filter(win => win.gameId === gameId);
    }
    return [...this.wins];
  }

  public async getJackpotContributions(gameId?: string): Promise<JackpotContribution[]> {
    if (gameId) {
      return this.contributions.filter(contrib => contrib.gameId === gameId);
    }
    return [...this.contributions];
  }

  public onJackpotUpdate(callback: (jackpot: Jackpot) => void): void {
    this.updateCallbacks.push(callback);
  }

  public removeJackpotUpdateCallback(callback: (jackpot: Jackpot) => void): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  private notifyUpdateCallbacks(jackpot: Jackpot): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback({ ...jackpot });
      } catch (error) {
        console.error('Error in jackpot update callback:', error);
      }
    });
  }

  public async setJackpotActive(gameId: string, isActive: boolean): Promise<void> {
    const jackpot = this.jackpots.get(gameId);
    if (jackpot) {
      jackpot.isActive = isActive;
      this.notifyUpdateCallbacks(jackpot);
    }
  }

  public async updateJackpotConfig(
    gameId: string, 
    updates: Partial<Pick<Jackpot, 'contributionRate' | 'minBet' | 'maxAmount' | 'seedAmount'>>
  ): Promise<void> {
    const jackpot = this.jackpots.get(gameId);
    if (jackpot) {
      Object.assign(jackpot, updates);
      this.notifyUpdateCallbacks(jackpot);
    }
  }

  // Real-time jackpot display data for thumbnails
  public async getJackpotDisplayData(gameId: string): Promise<{
    amount: number;
    formatted: string;
    lastUpdate: Date;
    isActive: boolean;
    contributionRate: number;
  }> {
    const jackpot = await this.getJackpot(gameId);
    return {
      amount: jackpot.amount,
      formatted: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(jackpot.amount),
      lastUpdate: new Date(),
      isActive: jackpot.isActive,
      contributionRate: jackpot.contributionRate
    };
  }
}

export const jackpotService = new JackpotService();
