import { SlotGameConfig, SlotSymbol } from './slotsGamesConfig';
import { balanceService } from './balanceService';

export interface SpinResult {
  reels: string[][];
  winLines: WinLine[];
  totalWin: number;
  netWin: number;
  multiplier: number;
  isJackpot: boolean;
  bonusTriggered: boolean;
  freeSpinsAwarded: number;
  features: string[];
  symbols: SlotSymbol[][];
}

export interface WinLine {
  lineIndex: number;
  symbols: string[];
  count: number;
  multiplier: number;
  payout: number;
  positions: number[][];
}

export interface GameSession {
  sessionId: string;
  gameId: string;
  userId: string;
  currency: 'GC' | 'SC';
  totalBet: number;
  totalWin: number;
  spinsCount: number;
  startTime: Date;
  lastSpinTime: Date;
  isActive: boolean;
  gameConfig: SlotGameConfig;
}

export interface BetLimits {
  min: number;
  max: number;
  suggestions: number[];
}

export class SlotsGameEngine {
  private sessions: Map<string, GameSession> = new Map();
  private jackpotAmounts: Map<string, number> = new Map();
  private rngSeed: number = Date.now();

  constructor() {
    this.initializeJackpots();
    this.startJackpotProgression();
  }

  // Initialize progressive jackpots
  private initializeJackpots() {
    const jackpotGames = [
      { id: 'golden-fortune', amount: 45000 },
      { id: 'diamond-deluxe', amount: 125000 },
      { id: 'cosmic-crystals', amount: 350000 },
      { id: 'viking-voyage', amount: 85000 },
      { id: 'royal-gems', amount: 200000 },
      { id: 'mega-multiplier', amount: 1500000 }
    ];

    jackpotGames.forEach(({ id, amount }) => {
      this.jackpotAmounts.set(id, amount);
    });
  }

  // Progressively increase jackpots
  private startJackpotProgression() {
    setInterval(() => {
      this.jackpotAmounts.forEach((amount, gameId) => {
        const increase = Math.random() * 50 + 10; // $10-$60 per minute
        this.jackpotAmounts.set(gameId, amount + increase);
      });
    }, 60000); // Every minute
  }

  // Pseudo-random number generator with seed
  private random(seed?: number): number {
    if (seed !== undefined) this.rngSeed = seed;
    this.rngSeed = (this.rngSeed * 9301 + 49297) % 233280;
    return this.rngSeed / 233280;
  }

  // Create a new game session
  createSession(gameConfig: SlotGameConfig, userId: string, currency: 'GC' | 'SC'): GameSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: GameSession = {
      sessionId,
      gameId: gameConfig.id,
      userId,
      currency,
      totalBet: 0,
      totalWin: 0,
      spinsCount: 0,
      startTime: new Date(),
      lastSpinTime: new Date(),
      isActive: true,
      gameConfig
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // Get bet limits for a game and currency
  getBetLimits(gameConfig: SlotGameConfig, currency: 'GC' | 'SC'): BetLimits {
    const min = gameConfig.minBet[currency];
    const max = gameConfig.maxBet[currency];
    
    // Generate reasonable bet suggestions
    const suggestions: number[] = [];
    const multiplier = currency === 'GC' ? 10 : 0.1;
    
    suggestions.push(min);
    suggestions.push(min * 2);
    suggestions.push(min * 5);
    suggestions.push(min * 10);
    suggestions.push(Math.floor(max / 10));
    suggestions.push(Math.floor(max / 4));
    suggestions.push(max);

    return {
      min,
      max,
      suggestions: [...new Set(suggestions)].sort((a, b) => a - b)
    };
  }

  // Generate paylines for different game types
  private generatePaylines(reels: number, rows: number, paylines: number): number[][] {
    const lines: number[][] = [];
    
    if (paylines === 1) {
      // Single payline (middle row)
      lines.push(new Array(reels).fill(Math.floor(rows / 2)));
    } else if (paylines <= 25) {
      // Standard paylines
      for (let i = 0; i < Math.min(paylines, rows); i++) {
        lines.push(new Array(reels).fill(i)); // Horizontal lines
      }
      
      // Add diagonal and zigzag patterns
      if (paylines > rows) {
        // Diagonal down
        const diagDown = [];
        for (let i = 0; i < reels; i++) {
          diagDown.push(Math.min(i, rows - 1));
        }
        lines.push(diagDown);
        
        // Diagonal up
        const diagUp = [];
        for (let i = 0; i < reels; i++) {
          diagUp.push(Math.max(rows - 1 - i, 0));
        }
        lines.push(diagUp);
        
        // V shapes and W shapes
        if (reels >= 5 && rows >= 3) {
          lines.push([0, 1, 2, 1, 0]); // V
          lines.push([2, 1, 0, 1, 2]); // Inverted V
          lines.push([1, 0, 0, 0, 1]); // W top
          lines.push([1, 2, 2, 2, 1]); // W bottom
        }
      }
    } else {
      // Ways to win (243, 1024, 4096 ways)
      // For ways to win, we check all possible combinations
      return []; // Will be handled differently in checkWins
    }
    
    return lines.slice(0, paylines);
  }

  // Generate reel outcome based on game RTP and volatility
  private generateReelOutcome(gameConfig: SlotGameConfig, betAmount: number, currency: 'GC' | 'SC'): string[][] {
    const { reels, rows, symbols, rtp, volatility } = gameConfig;
    const targetRTP = rtp / 100;
    
    // Adjust win probability based on volatility
    let winProbability: number;
    switch (volatility) {
      case 'low':
        winProbability = 0.35; // 35% chance to win, smaller wins
        break;
      case 'medium':
        winProbability = 0.25; // 25% chance to win, medium wins
        break;
      case 'high':
        winProbability = 0.15; // 15% chance to win, bigger wins
        break;
    }

    const shouldWin = this.random() < winProbability;
    const result: string[][] = [];

    if (shouldWin) {
      // Generate a winning combination
      result.push(...this.generateWinningReels(gameConfig, betAmount));
    } else {
      // Generate random losing combination
      for (let reel = 0; reel < reels; reel++) {
        const reelSymbols: string[] = [];
        for (let row = 0; row < rows; row++) {
          const randomSymbol = this.getRandomSymbol(symbols);
          reelSymbols.push(randomSymbol.id);
        }
        result.push(reelSymbols);
      }
    }

    return result;
  }

  // Generate winning reels based on game configuration
  private generateWinningReels(gameConfig: SlotGameConfig, betAmount: number): string[][] {
    const { reels, rows, symbols, volatility } = gameConfig;
    const result: string[][] = [];
    
    // Choose a winning symbol based on volatility
    let winningSymbol: SlotSymbol;
    const rand = this.random();
    
    if (volatility === 'high') {
      // Higher chance for rare symbols in high volatility
      if (rand < 0.1) {
        winningSymbol = symbols.filter(s => s.rarity === 'legendary')[0] || symbols[symbols.length - 1];
      } else if (rand < 0.3) {
        winningSymbol = symbols.filter(s => s.rarity === 'epic')[Math.floor(this.random() * symbols.filter(s => s.rarity === 'epic').length)] || symbols[symbols.length - 2];
      } else if (rand < 0.6) {
        winningSymbol = symbols.filter(s => s.rarity === 'rare')[Math.floor(this.random() * symbols.filter(s => s.rarity === 'rare').length)] || symbols[3];
      } else {
        winningSymbol = symbols.filter(s => s.rarity === 'common')[Math.floor(this.random() * symbols.filter(s => s.rarity === 'common').length)] || symbols[0];
      }
    } else {
      // More common symbols for lower volatility
      if (rand < 0.7) {
        winningSymbol = symbols.filter(s => s.rarity === 'common')[Math.floor(this.random() * symbols.filter(s => s.rarity === 'common').length)] || symbols[0];
      } else if (rand < 0.9) {
        winningSymbol = symbols.filter(s => s.rarity === 'rare')[Math.floor(this.random() * symbols.filter(s => s.rarity === 'rare').length)] || symbols[2];
      } else {
        winningSymbol = symbols.filter(s => s.rarity === 'epic')[Math.floor(this.random() * symbols.filter(s => s.rarity === 'epic').length)] || symbols[4];
      }
    }

    // Determine win length (3, 4, or 5 matching symbols)
    let winLength: number;
    const lengthRand = this.random();
    if (lengthRand < 0.6) {
      winLength = 3; // Most common
    } else if (lengthRand < 0.85) {
      winLength = Math.min(4, reels);
    } else {
      winLength = Math.min(5, reels);
    }

    // Generate the reels
    for (let reel = 0; reel < reels; reel++) {
      const reelSymbols: string[] = [];
      for (let row = 0; row < rows; row++) {
        if (reel < winLength && row === 1) {
          // Place winning symbol in middle row for first 'winLength' reels
          reelSymbols.push(winningSymbol.id);
        } else {
          // Random symbol for other positions
          const randomSymbol = this.getRandomSymbol(symbols);
          reelSymbols.push(randomSymbol.id);
        }
      }
      result.push(reelSymbols);
    }

    return result;
  }

  // Get random symbol based on rarity weights
  private getRandomSymbol(symbols: SlotSymbol[]): SlotSymbol {
    const weights = symbols.map(symbol => {
      switch (symbol.rarity) {
        case 'common': return 40;
        case 'rare': return 25;
        case 'epic': return 15;
        case 'legendary': return 5;
        default: return 20;
      }
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = this.random() * totalWeight;

    for (let i = 0; i < symbols.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return symbols[i];
      }
    }

    return symbols[0]; // Fallback
  }

  // Check for winning combinations
  private checkWins(reels: string[][], gameConfig: SlotGameConfig, betAmount: number): WinLine[] {
    const { paylines, symbols } = gameConfig;
    const wins: WinLine[] = [];
    
    if (paylines === 4096 || paylines === 1024 || paylines === 243) {
      // Ways to win - check all adjacent combinations
      return this.checkWaysToWin(reels, gameConfig, betAmount);
    }

    const paylinePatterns = this.generatePaylines(gameConfig.reels, gameConfig.rows, paylines);

    paylinePatterns.forEach((pattern, lineIndex) => {
      const lineSymbols = pattern.map((row, reel) => reels[reel][row]);
      const winResult = this.checkLineWin(lineSymbols, symbols, betAmount);

      if (winResult.count >= 3) {
        const positions = pattern.map((row, reel) => [reel, row]).slice(0, winResult.count);
        
        wins.push({
          lineIndex,
          symbols: lineSymbols.slice(0, winResult.count),
          count: winResult.count,
          multiplier: winResult.multiplier,
          payout: winResult.payout,
          positions
        });
      }
    });

    return wins;
  }

  // Check ways to win (for 243, 1024, 4096 way games)
  private checkWaysToWin(reels: string[][], gameConfig: SlotGameConfig, betAmount: number): WinLine[] {
    const wins: WinLine[] = [];
    const { symbols } = gameConfig;
    
    // Group symbols by type and find consecutive matches from left to right
    const symbolCounts = new Map<string, number>();
    
    // Count first symbol occurrences
    for (const symbol of reels[0]) {
      symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
    }

    // Check each possible starting symbol
    symbolCounts.forEach((count, symbolId) => {
      let consecutiveReels = 1;
      
      // Check subsequent reels for matches
      for (let reel = 1; reel < reels.length; reel++) {
        if (reels[reel].includes(symbolId)) {
          consecutiveReels++;
        } else {
          break;
        }
      }

      if (consecutiveReels >= 3) {
        const symbol = symbols.find(s => s.id === symbolId);
        if (symbol) {
          const ways = this.calculateWaysCount(reels, symbolId, consecutiveReels);
          const multiplier = symbol.multipliers[consecutiveReels === 3 ? 'three' : consecutiveReels === 4 ? 'four' : 'five'] || symbol.multipliers.three;
          const payout = multiplier * betAmount * ways;

          wins.push({
            lineIndex: 0, // Ways to win don't have traditional line numbers
            symbols: new Array(consecutiveReels).fill(symbolId),
            count: consecutiveReels,
            multiplier,
            payout,
            positions: [] // Would need complex calculation for all ways
          });
        }
      }
    });

    return wins;
  }

  // Calculate number of ways for a symbol combination
  private calculateWaysCount(reels: string[][], symbolId: string, consecutiveReels: number): number {
    let ways = 1;
    
    for (let reel = 0; reel < consecutiveReels; reel++) {
      const symbolsInReel = reels[reel].filter(s => s === symbolId).length;
      ways *= symbolsInReel;
    }
    
    return ways;
  }

  // Check individual line for wins
  private checkLineWin(lineSymbols: string[], symbols: SlotSymbol[], betAmount: number): { count: number; multiplier: number; payout: number } {
    const firstSymbol = lineSymbols[0];
    let count = 1;

    // Count consecutive matching symbols from left to right
    for (let i = 1; i < lineSymbols.length; i++) {
      if (lineSymbols[i] === firstSymbol || lineSymbols[i] === 'wild') {
        count++;
      } else {
        break;
      }
    }

    if (count < 3) {
      return { count: 0, multiplier: 0, payout: 0 };
    }

    const symbol = symbols.find(s => s.id === firstSymbol);
    if (!symbol) {
      return { count: 0, multiplier: 0, payout: 0 };
    }

    const multiplierKey = count === 3 ? 'three' : count === 4 ? 'four' : 'five';
    const multiplier = symbol.multipliers[multiplierKey] || symbol.multipliers.three;
    const payout = multiplier * betAmount;

    return { count, multiplier, payout };
  }

  // Check for bonus features
  private checkBonusFeatures(reels: string[][], gameConfig: SlotGameConfig): { bonusTriggered: boolean; freeSpinsAwarded: number; features: string[] } {
    const features: string[] = [];
    let bonusTriggered = false;
    let freeSpinsAwarded = 0;

    // Check for scatter symbols
    if (gameConfig.scatterSymbol) {
      const scatterCount = this.countSymbolInReels(reels, 'scatter');
      if (scatterCount >= 3) {
        bonusTriggered = true;
        freeSpinsAwarded = scatterCount * 5; // 5 free spins per scatter
        features.push('Free Spins Bonus');
      }
    }

    // Check for bonus round triggers
    if (gameConfig.bonusRounds) {
      const bonusSymbolCount = this.countSymbolInReels(reels, 'bonus');
      if (bonusSymbolCount >= 3) {
        bonusTriggered = true;
        features.push('Bonus Round');
      }
    }

    // Check for wild features
    if (gameConfig.wildSymbol) {
      const wildCount = this.countSymbolInReels(reels, 'wild');
      if (wildCount > 0) {
        features.push('Wild Symbols Active');
      }
    }

    return { bonusTriggered, freeSpinsAwarded, features };
  }

  // Count specific symbol in all reels
  private countSymbolInReels(reels: string[][], symbolId: string): number {
    let count = 0;
    for (const reel of reels) {
      for (const symbol of reel) {
        if (symbol === symbolId) count++;
      }
    }
    return count;
  }

  // Check for jackpot win
  private checkJackpot(gameConfig: SlotGameConfig, totalWin: number, betAmount: number): { isJackpot: boolean; jackpotAmount: number } {
    let isJackpot = false;
    let jackpotAmount = 0;

    if (gameConfig.jackpot.progressive) {
      // Progressive jackpot - very rare trigger
      const jackpotChance = betAmount / 10000; // Higher bets = better jackpot odds
      if (this.random() < jackpotChance) {
        isJackpot = true;
        jackpotAmount = this.jackpotAmounts.get(gameConfig.id) || gameConfig.jackpot.fixed;
        // Reset progressive jackpot to base amount
        this.jackpotAmounts.set(gameConfig.id, gameConfig.jackpot.fixed);
      }
    } else if (totalWin > 0) {
      // Fixed jackpot - rare but higher chance
      if (this.random() < 0.0001) { // 0.01% chance
        isJackpot = true;
        jackpotAmount = gameConfig.jackpot.fixed;
      }
    }

    return { isJackpot, jackpotAmount };
  }

  // Convert symbol IDs to symbol objects
  private getSymbolsFromReels(reels: string[][], symbols: SlotSymbol[]): SlotSymbol[][] {
    return reels.map(reel => 
      reel.map(symbolId => 
        symbols.find(s => s.id === symbolId) || symbols[0]
      )
    );
  }

  // Main spin function
  spin(sessionId: string, betAmount: number): SpinResult {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Invalid or inactive session');
    }

    const { gameConfig, currency, userId } = session;
    
    // Validate bet amount
    const betLimits = this.getBetLimits(gameConfig, currency);
    if (betAmount < betLimits.min || betAmount > betLimits.max) {
      throw new Error(`Bet amount must be between ${betLimits.min} and ${betLimits.max} ${currency}`);
    }

    // Check user balance
    const userBalance = balanceService.getUserBalance(userId);
    const currentBalance = currency === 'GC' ? userBalance.gc : userBalance.sc;
    if (currentBalance < betAmount) {
      throw new Error(`Insufficient ${currency} balance`);
    }

    // Deduct bet amount
    const gcChange = currency === 'GC' ? -betAmount : 0;
    const scChange = currency === 'SC' ? -betAmount : 0;
    balanceService.updateBalance(userId, gcChange, scChange, `Slot Spin - ${gameConfig.name}`, gameConfig.id);

    // Generate spin result
    const reels = this.generateReelOutcome(gameConfig, betAmount, currency);
    const winLines = this.checkWins(reels, gameConfig, betAmount);
    const totalWin = winLines.reduce((sum, line) => sum + line.payout, 0);
    const bonusFeatures = this.checkBonusFeatures(reels, gameConfig);
    const jackpotResult = this.checkJackpot(gameConfig, totalWin, betAmount);
    
    let finalWin = totalWin;
    if (jackpotResult.isJackpot) {
      finalWin += jackpotResult.jackpotAmount;
    }

    const netWin = finalWin - betAmount;
    const multiplier = betAmount > 0 ? Math.floor(finalWin / betAmount) : 0;

    // Award winnings
    if (finalWin > 0) {
      const winGC = currency === 'GC' ? finalWin : 0;
      const winSC = currency === 'SC' ? finalWin : 0;
      balanceService.updateBalance(userId, winGC, winSC, `Slot Win - ${gameConfig.name}`, gameConfig.id);
    }

    // Update session
    session.totalBet += betAmount;
    session.totalWin += finalWin;
    session.spinsCount++;
    session.lastSpinTime = new Date();

    const result: SpinResult = {
      reels,
      winLines,
      totalWin: finalWin,
      netWin,
      multiplier,
      isJackpot: jackpotResult.isJackpot,
      bonusTriggered: bonusFeatures.bonusTriggered,
      freeSpinsAwarded: bonusFeatures.freeSpinsAwarded,
      features: bonusFeatures.features,
      symbols: this.getSymbolsFromReels(reels, gameConfig.symbols)
    };

    return result;
  }

  // End game session
  endSession(sessionId: string): GameSession | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      return session;
    }
    return null;
  }

  // Get session info
  getSession(sessionId: string): GameSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Get current jackpot amount
  getJackpotAmount(gameId: string): number {
    return this.jackpotAmounts.get(gameId) || 0;
  }

  // Get all active sessions for a user
  getUserSessions(userId: string): GameSession[] {
    return Array.from(this.sessions.values()).filter(
      session => session.userId === userId && session.isActive
    );
  }
}

// Singleton instance
export const slotsGameEngine = new SlotsGameEngine();
export default slotsGameEngine;
