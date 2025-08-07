import { walletService, CurrencyType } from './walletService';
import { useToast } from '@/hooks/use-toast';

export interface GameBet {
  id: string;
  userId: string;
  gameId: string;
  gameType: 'slots' | 'table' | 'live' | 'bingo' | 'sportsbook';
  currency: CurrencyType;
  betAmount: number;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: GameResult;
}

export interface GameResult {
  id: string;
  betId: string;
  outcome: 'win' | 'lose' | 'push';
  winAmount: number;
  multiplier?: number;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface GameSession {
  id: string;
  userId: string;
  gameType: 'slots' | 'table' | 'live' | 'bingo' | 'sportsbook';
  currency: CurrencyType;
  startTime: Date;
  endTime?: Date;
  totalBets: number;
  totalWins: number;
  netResult: number;
  betCount: number;
  status: 'active' | 'paused' | 'ended';
}

export interface SlotSpinResult {
  reels: string[][];
  paylines: Array<{
    line: number;
    symbols: string[];
    multiplier: number;
    payout: number;
  }>;
  totalWin: number;
  isBonus: boolean;
  isFreeSpins: boolean;
  freeSpinsRemaining?: number;
}

export interface TableGameResult {
  gameType: 'blackjack' | 'roulette' | 'baccarat' | 'poker';
  playerHand?: any;
  dealerHand?: any;
  outcome: string;
  winnings: number;
  details: Record<string, any>;
}

export interface BingoGameResult {
  card: number[][];
  calledNumbers: number[];
  completedLines: string[];
  prize: number;
  gameEnded: boolean;
}

export interface SportsGameResult {
  betType: string;
  selection: string;
  odds: number;
  outcome: 'win' | 'lose' | 'void';
  settlement: number;
}

class GameInterfaceService {
  private static instance: GameInterfaceService;
  private activeSessions: Map<string, GameSession> = new Map();
  private currentCurrency: Map<string, CurrencyType> = new Map();
  private gameCallbacks: Map<string, Set<(result: any) => void>> = new Map();

  static getInstance(): GameInterfaceService {
    if (!GameInterfaceService.instance) {
      GameInterfaceService.instance = new GameInterfaceService();
    }
    return GameInterfaceService.instance;
  }

  constructor() {
    this.loadActiveSessions();
  }

  private loadActiveSessions() {
    try {
      const sessionsData = localStorage.getItem('active_game_sessions');
      if (sessionsData) {
        const sessions = JSON.parse(sessionsData);
        sessions.forEach((session: GameSession) => {
          this.activeSessions.set(session.id, {
            ...session,
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : undefined,
          });
        });
      }
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    }
  }

  private saveSessions() {
    try {
      const sessions = Array.from(this.activeSessions.values());
      localStorage.setItem('active_game_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  }

  // Currency Management
  setUserCurrency(userId: string, currency: CurrencyType, gameType: 'slots' | 'table' | 'live' | 'bingo' | 'sportsbook') {
    // Validate currency for game type
    if (gameType === 'sportsbook' && currency !== 'SC') {
      throw new Error('Sportsbook only accepts Sweeps Coins (SC)');
    }

    this.currentCurrency.set(`${userId}-${gameType}`, currency);
    localStorage.setItem(`currency-${userId}-${gameType}`, currency);
  }

  getUserCurrency(userId: string, gameType: 'slots' | 'table' | 'live' | 'bingo' | 'sportsbook'): CurrencyType {
    const stored = this.currentCurrency.get(`${userId}-${gameType}`) || 
                   localStorage.getItem(`currency-${userId}-${gameType}`) as CurrencyType;
    
    // Default to SC for sportsbook, GC for others
    return stored || (gameType === 'sportsbook' ? 'SC' : 'GC');
  }

  // Session Management
  async startGameSession(
    userId: string,
    gameType: 'slots' | 'table' | 'live' | 'bingo' | 'sportsbook',
    currency?: CurrencyType
  ): Promise<GameSession> {
    const sessionCurrency = currency || this.getUserCurrency(userId, gameType);
    
    const session: GameSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      gameType,
      currency: sessionCurrency,
      startTime: new Date(),
      totalBets: 0,
      totalWins: 0,
      netResult: 0,
      betCount: 0,
      status: 'active',
    };

    this.activeSessions.set(session.id, session);
    this.saveSessions();

    return session;
  }

  async endGameSession(sessionId: string): Promise<GameSession | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    session.endTime = new Date();
    session.status = 'ended';
    
    this.activeSessions.set(sessionId, session);
    this.saveSessions();

    return session;
  }

  getActiveSession(userId: string, gameType: 'slots' | 'table' | 'live' | 'bingo' | 'sportsbook'): GameSession | null {
    const activeSessions = Array.from(this.activeSessions.values()).filter(
      s => s.userId === userId && s.gameType === gameType && s.status === 'active'
    );
    
    return activeSessions[0] || null;
  }

  // Betting Logic
  async placeBet(
    userId: string,
    gameId: string,
    gameType: 'slots' | 'table' | 'live' | 'bingo' | 'sportsbook',
    betAmount: number,
    currency?: CurrencyType
  ): Promise<GameBet> {
    const betCurrency = currency || this.getUserCurrency(userId, gameType);
    
    // Validate minimum bet
    const minBet = this.getMinimumBet(gameType, betCurrency);
    if (betAmount < minBet) {
      throw new Error(`Minimum bet is ${minBet} ${betCurrency}`);
    }

    // Validate maximum bet
    const maxBet = this.getMaximumBet(gameType, betCurrency);
    if (betAmount > maxBet) {
      throw new Error(`Maximum bet is ${maxBet} ${betCurrency}`);
    }

    // Check user balance and place bet
    try {
      await walletService.placeBet(userId, betAmount, betCurrency, gameId, gameType);
    } catch (error) {
      throw new Error(`Failed to place bet: ${error}`);
    }

    const bet: GameBet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      gameId,
      gameType,
      currency: betCurrency,
      betAmount,
      timestamp: new Date(),
      status: 'processing',
    };

    // Update session
    const session = this.getActiveSession(userId, gameType);
    if (session) {
      session.totalBets += betAmount;
      session.betCount += 1;
      session.netResult -= betAmount;
      this.activeSessions.set(session.id, session);
      this.saveSessions();
    }

    return bet;
  }

  async processGameResult(
    bet: GameBet,
    outcome: 'win' | 'lose' | 'push',
    winAmount: number = 0,
    details?: Record<string, any>
  ): Promise<GameResult> {
    const result: GameResult = {
      id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      betId: bet.id,
      outcome,
      winAmount,
      multiplier: winAmount > 0 ? winAmount / bet.betAmount : 0,
      details,
      timestamp: new Date(),
    };

    // Update bet
    bet.result = result;
    bet.status = 'completed';

    // Process winnings
    if (winAmount > 0) {
      await walletService.recordWin(
        bet.userId,
        winAmount,
        bet.currency,
        bet.gameId,
        bet.gameType
      );
    }

    // Update session
    const session = this.getActiveSession(bet.userId, bet.gameType);
    if (session) {
      session.totalWins += winAmount;
      session.netResult += winAmount;
      this.activeSessions.set(session.id, session);
      this.saveSessions();
    }

    // Notify callbacks
    this.notifyGameResult(bet.userId, bet.gameType, result);

    return result;
  }

  // Game-specific methods
  async spinSlots(
    userId: string,
    gameId: string,
    betAmount: number,
    currency?: CurrencyType
  ): Promise<{ bet: GameBet; result: SlotSpinResult }> {
    const bet = await this.placeBet(userId, gameId, 'slots', betAmount, currency);
    
    // Simulate slot spin
    const spinResult = this.generateSlotResult(betAmount);
    
    // Process result
    const gameResult = await this.processGameResult(
      bet,
      spinResult.totalWin > 0 ? 'win' : 'lose',
      spinResult.totalWin,
      { slotResult: spinResult }
    );

    return {
      bet,
      result: spinResult,
    };
  }

  async playTableGame(
    userId: string,
    gameId: string,
    gameSubType: 'blackjack' | 'roulette' | 'baccarat' | 'poker',
    betAmount: number,
    gameAction: any,
    currency?: CurrencyType
  ): Promise<{ bet: GameBet; result: TableGameResult }> {
    const bet = await this.placeBet(userId, gameId, 'table', betAmount, currency);
    
    // Simulate table game
    const gameResult = this.generateTableResult(gameSubType, gameAction);
    
    // Process result
    await this.processGameResult(
      bet,
      gameResult.winnings > 0 ? 'win' : 'lose',
      gameResult.winnings,
      { tableResult: gameResult }
    );

    return {
      bet,
      result: gameResult,
    };
  }

  async playBingo(
    userId: string,
    gameId: string,
    cardCount: number,
    currency?: CurrencyType
  ): Promise<{ bet: GameBet; result: BingoGameResult }> {
    const betAmount = cardCount * this.getBingoCost(currency || 'GC');
    const bet = await this.placeBet(userId, gameId, 'bingo', betAmount, currency);
    
    // Simulate bingo game
    const bingoResult = this.generateBingoResult(cardCount);
    
    // Process result
    await this.processGameResult(
      bet,
      bingoResult.prize > 0 ? 'win' : 'lose',
      bingoResult.prize,
      { bingoResult }
    );

    return {
      bet,
      result: bingoResult,
    };
  }

  async placeSportsBet(
    userId: string,
    gameId: string,
    betType: string,
    selection: string,
    odds: number,
    betAmount: number
  ): Promise<{ bet: GameBet; pending: boolean }> {
    // Sportsbook only accepts SC
    const bet = await this.placeBet(userId, gameId, 'sportsbook', betAmount, 'SC');
    
    // Sports bets are pending until event completes
    bet.status = 'pending';
    
    return {
      bet,
      pending: true,
    };
  }

  // Game result generators
  private generateSlotResult(betAmount: number): SlotSpinResult {
    const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '🔔'];
    const reels: string[][] = [];
    
    // Generate 5 reels with 3 symbols each
    for (let i = 0; i < 5; i++) {
      const reel: string[] = [];
      for (let j = 0; j < 3; j++) {
        reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      reels.push(reel);
    }

    // Calculate paylines (simplified)
    const paylines: any[] = [];
    let totalWin = 0;

    // Check main payline (middle row)
    const mainLine = [reels[0][1], reels[1][1], reels[2][1], reels[3][1], reels[4][1]];
    const { win, multiplier } = this.calculateLineWin(mainLine, betAmount);
    
    if (win > 0) {
      paylines.push({
        line: 1,
        symbols: mainLine,
        multiplier,
        payout: win,
      });
      totalWin += win;
    }

    // Random chance for bonus features
    const isBonus = Math.random() < 0.05; // 5% chance
    const isFreeSpins = Math.random() < 0.03; // 3% chance

    if (isBonus) {
      totalWin += betAmount * (Math.random() * 5 + 2); // 2-7x bet
    }

    return {
      reels,
      paylines,
      totalWin,
      isBonus,
      isFreeSpins,
      freeSpinsRemaining: isFreeSpins ? Math.floor(Math.random() * 10) + 5 : undefined,
    };
  }

  private calculateLineWin(line: string[], betAmount: number): { win: number; multiplier: number } {
    const symbolCounts = new Map<string, number>();
    line.forEach(symbol => {
      symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
    });

    // Check for winning combinations
    for (const [symbol, count] of symbolCounts.entries()) {
      if (count >= 3) {
        const multipliers = { '💎': 100, '7️⃣': 50, '⭐': 25, '🔔': 15, '🍇': 10, '🍊': 8, '🍋': 5, '🍒': 3 };
        const baseMultiplier = (multipliers as any)[symbol] || 2;
        const countMultiplier = count === 5 ? 10 : count === 4 ? 5 : 1;
        const multiplier = baseMultiplier * countMultiplier;
        
        return {
          win: betAmount * multiplier,
          multiplier,
        };
      }
    }

    return { win: 0, multiplier: 0 };
  }

  private generateTableResult(gameType: string, action: any): TableGameResult {
    // Simplified table game simulation
    const isWin = Math.random() < 0.47; // Slightly less than 50% to account for house edge
    const winMultipliers = { blackjack: 2, roulette: 35, baccarat: 2, poker: 5 };
    const multiplier = (winMultipliers as any)[gameType] || 2;

    return {
      gameType: gameType as any,
      playerHand: this.generateHand(gameType),
      dealerHand: gameType === 'blackjack' ? this.generateHand(gameType) : undefined,
      outcome: isWin ? 'win' : 'lose',
      winnings: isWin ? action.betAmount * multiplier : 0,
      details: { action, multiplier },
    };
  }

  private generateHand(gameType: string): any {
    if (gameType === 'blackjack') {
      const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const suits = ['♠', '♥', '♦', '♣'];
      const hand = [];
      
      for (let i = 0; i < 2; i++) {
        const card = cards[Math.floor(Math.random() * cards.length)];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        hand.push(`${card}${suit}`);
      }
      
      return hand;
    }
    
    return {};
  }

  private generateBingoResult(cardCount: number): BingoGameResult {
    // Generate bingo card
    const card: number[][] = [];
    for (let i = 0; i < 5; i++) {
      const column: number[] = [];
      for (let j = 0; j < 5; j++) {
        if (i === 2 && j === 2) {
          column.push(0); // Free space
        } else {
          const min = i * 15 + 1;
          const max = i * 15 + 15;
          column.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
      }
      card.push(column);
    }

    // Simulate called numbers
    const calledNumbers: number[] = [];
    const totalNumbers = Math.floor(Math.random() * 30) + 30; // 30-60 numbers
    
    for (let i = 0; i < totalNumbers; i++) {
      let num;
      do {
        num = Math.floor(Math.random() * 75) + 1;
      } while (calledNumbers.includes(num));
      calledNumbers.push(num);
    }

    // Check for completed lines
    const completedLines: string[] = [];
    let prize = 0;

    // Check horizontal lines
    for (let i = 0; i < 5; i++) {
      if (card[i].every(num => num === 0 || calledNumbers.includes(num))) {
        completedLines.push(`Row ${i + 1}`);
        prize += 50; // Base prize per line
      }
    }

    // Check vertical lines
    for (let j = 0; j < 5; j++) {
      if (card.every(row => row[j] === 0 || calledNumbers.includes(row[j]))) {
        completedLines.push(`Column ${j + 1}`);
        prize += 50;
      }
    }

    // Check diagonals
    if (card.every((row, i) => row[i] === 0 || calledNumbers.includes(row[i]))) {
      completedLines.push('Diagonal 1');
      prize += 100;
    }

    if (card.every((row, i) => row[4 - i] === 0 || calledNumbers.includes(row[4 - i]))) {
      completedLines.push('Diagonal 2');
      prize += 100;
    }

    return {
      card,
      calledNumbers,
      completedLines,
      prize: prize * cardCount,
      gameEnded: completedLines.length > 0,
    };
  }

  // Utility methods
  private getMinimumBet(gameType: string, currency: CurrencyType): number {
    const minimums = {
      slots: { GC: 10, SC: 0.1 },
      table: { GC: 25, SC: 0.25 },
      live: { GC: 50, SC: 0.5 },
      bingo: { GC: 5, SC: 0.05 },
      sportsbook: { GC: 0, SC: 1 },
    };

    return (minimums as any)[gameType]?.[currency] || 1;
  }

  private getMaximumBet(gameType: string, currency: CurrencyType): number {
    const maximums = {
      slots: { GC: 10000, SC: 100 },
      table: { GC: 25000, SC: 250 },
      live: { GC: 50000, SC: 500 },
      bingo: { GC: 5000, SC: 50 },
      sportsbook: { GC: 0, SC: 1000 },
    };

    return (maximums as any)[gameType]?.[currency] || 1000;
  }

  private getBingoCost(currency: CurrencyType): number {
    return currency === 'GC' ? 100 : 1;
  }

  // Event handling
  subscribeToGameResults(
    userId: string,
    gameType: 'slots' | 'table' | 'live' | 'bingo' | 'sportsbook',
    callback: (result: GameResult) => void
  ): () => void {
    const key = `${userId}-${gameType}`;
    
    if (!this.gameCallbacks.has(key)) {
      this.gameCallbacks.set(key, new Set());
    }

    this.gameCallbacks.get(key)!.add(callback);

    return () => {
      this.gameCallbacks.get(key)?.delete(callback);
    };
  }

  private notifyGameResult(userId: string, gameType: string, result: GameResult) {
    const key = `${userId}-${gameType}`;
    const callbacks = this.gameCallbacks.get(key);
    
    if (callbacks) {
      callbacks.forEach(callback => callback(result));
    }
  }

  // Admin methods
  getAllActiveSessions(): GameSession[] {
    return Array.from(this.activeSessions.values()).filter(s => s.status === 'active');
  }

  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    totalBets: number;
    totalWins: number;
    netResult: number;
  } {
    const sessions = Array.from(this.activeSessions.values());
    
    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      totalBets: sessions.reduce((sum, s) => sum + s.totalBets, 0),
      totalWins: sessions.reduce((sum, s) => sum + s.totalWins, 0),
      netResult: sessions.reduce((sum, s) => sum + s.netResult, 0),
    };
  }
}

export const gameInterfaceService = GameInterfaceService.getInstance();
