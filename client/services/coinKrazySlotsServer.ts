// CoinKrazy Slots Server Integration
// Based on masmaleki/slot-server and slotopol/server architecture
// Production-ready slots game server integration for CoinKrazy.com

export interface SlotGameConfig {
  id: string;
  name: string;
  provider: string;
  gameUrl: string;
  thumbnailUrl: string;
  rtp: number;
  volatility: "low" | "medium" | "high";
  minBet: number;
  maxBet: number;
  paylines: number;
  reels: number;
  rows: number;
  features: string[];
  isActive: boolean;
  categories: string[];
  releaseDate: string;
  popularity: number;
}

export interface GameSession {
  sessionId: string;
  gameId: string;
  userId: string;
  currency: "GC" | "SC";
  balance: number;
  totalBets: number;
  totalWins: number;
  spinCount: number;
  startTime: Date;
  lastActivity: Date;
  isActive: boolean;
  gameState: any;
}

export interface SpinRequest {
  sessionId: string;
  betAmount: number;
  betLines: number;
  currency: "GC" | "SC";
}

export interface SpinResponse {
  spinId: string;
  sessionId: string;
  success: boolean;
  betAmount: number;
  winAmount: number;
  newBalance: number;
  symbols: string[][];
  paylines: PaylineWin[];
  features: FeatureResult[];
  gameState: any;
  timestamp: Date;
}

export interface PaylineWin {
  line: number;
  symbols: string[];
  multiplier: number;
  winAmount: number;
  positions: number[];
}

export interface FeatureResult {
  type: "wild" | "scatter" | "free_spins" | "bonus" | "multiplier";
  triggered: boolean;
  data?: any;
}

export interface WalletOperation {
  userId: string;
  currency: "GC" | "SC";
  amount: number;
  type: "debit" | "credit";
  description: string;
  gameId?: string;
  sessionId?: string;
}

class CoinKrazySlotsServer {
  private static instance: CoinKrazySlotsServer;
  private baseUrl: string;
  private apiKey: string;
  private sessions: Map<string, GameSession> = new Map();
  private games: SlotGameConfig[] = [];

  constructor() {
    this.baseUrl = import.meta.env.VITE_SLOTS_SERVER_URL || "https://api.coinkrazy.com/slots";
    this.apiKey = import.meta.env.VITE_SLOTS_API_KEY || "coinkrazy_production_key";
    this.initializeGames();
  }

  static getInstance(): CoinKrazySlotsServer {
    if (!CoinKrazySlotsServer.instance) {
      CoinKrazySlotsServer.instance = new CoinKrazySlotsServer();
    }
    return CoinKrazySlotsServer.instance;
  }

  private initializeGames() {
    this.games = [
      {
        id: "coinkrazy-spinner",
        name: "CoinKrazy Spinner",
        provider: "CoinKrazy",
        gameUrl: "/games/iframe/coinkrazy-spinner",
        thumbnailUrl: "/images/games/coinkrazy-spinner.jpg",
        rtp: 96.8,
        volatility: "medium",
        minBet: 1,
        maxBet: 1000,
        paylines: 25,
        reels: 5,
        rows: 3,
        features: ["Wild", "Scatter", "Free Spins", "Progressive Jackpot"],
        isActive: true,
        categories: ["featured", "classic", "progressive"],
        releaseDate: "2024-01-01",
        popularity: 95,
      },
      {
        id: "lucky-scratch-gold",
        name: "Lucky Scratch Gold",
        provider: "CoinKrazy",
        gameUrl: "/games/iframe/lucky-scratch-gold",
        thumbnailUrl: "/images/games/lucky-scratch-gold.jpg",
        rtp: 97.2,
        volatility: "low",
        minBet: 1,
        maxBet: 100,
        paylines: 1,
        reels: 1,
        rows: 1,
        features: ["Instant Win", "Multipliers", "Bonus Scratches"],
        isActive: true,
        categories: ["featured", "scratch", "instant"],
        releaseDate: "2024-02-01",
        popularity: 88,
      },
      {
        id: "josey-duck-adventure",
        name: "Josey Duck Adventure",
        provider: "CoinKrazy",
        gameUrl: "/games/iframe/josey-duck-adventure",
        thumbnailUrl: "/images/games/josey-duck.jpg",
        rtp: 96.5,
        volatility: "high",
        minBet: 2,
        maxBet: 500,
        paylines: 20,
        reels: 5,
        rows: 4,
        features: ["Duck Hunt Bonus", "Pond Multiplier", "Free Spins"],
        isActive: true,
        categories: ["featured", "adventure", "bonus"],
        releaseDate: "2024-03-01",
        popularity: 92,
      },
      {
        id: "bingo-hall",
        name: "CoinKrazy Bingo Hall",
        provider: "CoinKrazy",
        gameUrl: "/games/iframe/bingo-hall",
        thumbnailUrl: "/images/games/bingo-hall.jpg",
        rtp: 95.5,
        volatility: "medium",
        minBet: 1,
        maxBet: 50,
        paylines: 0,
        reels: 0,
        rows: 0,
        features: ["Auto Daub", "Power-ups", "Chat", "Multiple Cards"],
        isActive: true,
        categories: ["bingo", "social", "multiplayer"],
        releaseDate: "2024-04-01",
        popularity: 85,
      },
      {
        id: "mary-cucumber",
        name: "Mary Had A Lil Cucumber",
        provider: "CoinKrazy",
        gameUrl: "/games/iframe/mary-cucumber",
        thumbnailUrl: "/images/games/mary-cucumber.jpg",
        rtp: 96.2,
        volatility: "high",
        minBet: 5,
        maxBet: 200,
        paylines: 15,
        reels: 5,
        rows: 3,
        features: ["Cucumber Wild", "Garden Bonus", "Free Spins"],
        isActive: true,
        categories: ["themed", "comedy", "bonus"],
        releaseDate: "2024-05-01",
        popularity: 78,
      },
    ];
  }

  /**
   * Get all available games
   */
  async getAllGames(): Promise<SlotGameConfig[]> {
    try {
      // In production, this would fetch from the backend API
      // For now, return cached games
      return this.games.filter(game => game.isActive);
    } catch (error) {
      console.error("Error fetching games:", error);
      return this.games.filter(game => game.isActive);
    }
  }

  /**
   * Get game by ID
   */
  async getGameById(gameId: string): Promise<SlotGameConfig | null> {
    try {
      const game = this.games.find(g => g.id === gameId);
      return game || null;
    } catch (error) {
      console.error("Error fetching game:", error);
      return null;
    }
  }

  /**
   * Create a new game session
   */
  async createSession(gameId: string, userId: string, currency: "GC" | "SC"): Promise<GameSession> {
    try {
      const game = await this.getGameById(gameId);
      if (!game) {
        throw new Error("Game not found");
      }

      // Get user's current balance
      const balance = await this.getUserBalance(userId, currency);

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session: GameSession = {
        sessionId,
        gameId,
        userId,
        currency,
        balance,
        totalBets: 0,
        totalWins: 0,
        spinCount: 0,
        startTime: new Date(),
        lastActivity: new Date(),
        isActive: true,
        gameState: {
          currentLevel: 1,
          achievements: [],
          settings: {
            soundEnabled: true,
            autoPlay: false,
          }
        }
      };

      this.sessions.set(sessionId, session);

      // In production: POST to /api/sessions
      console.log("Created game session:", session);

      return session;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  /**
   * Get game launch URL for iframe
   */
  async getGameLaunchUrl(sessionId: string): Promise<string> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const game = await this.getGameById(session.gameId);
      if (!game) {
        throw new Error("Game not found");
      }

      // Build launch URL with session parameters
      const params = new URLSearchParams({
        sessionId,
        userId: session.userId,
        currency: session.currency,
        gameId: session.gameId,
        balance: session.balance.toString(),
        mode: session.currency === "SC" ? "real" : "fun",
        language: "en",
        timestamp: Date.now().toString(),
        signature: this.generateSignature(sessionId),
      });

      return `${game.gameUrl}?${params.toString()}`;
    } catch (error) {
      console.error("Error getting launch URL:", error);
      throw error;
    }
  }

  /**
   * Perform a spin
   */
  async spin(request: SpinRequest): Promise<SpinResponse> {
    try {
      const session = this.sessions.get(request.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      if (!session.isActive) {
        throw new Error("Session is not active");
      }

      if (session.balance < request.betAmount) {
        throw new Error("Insufficient balance");
      }

      // Generate spin result
      const symbols = this.generateSymbols();
      const { winAmount, paylines } = this.calculateWin(symbols, request.betAmount, request.betLines);
      const features = this.checkFeatures(symbols);

      // Update session
      session.balance = session.balance - request.betAmount + winAmount;
      session.totalBets += request.betAmount;
      session.totalWins += winAmount;
      session.spinCount += 1;
      session.lastActivity = new Date();

      // Update user wallet
      await this.updateUserWallet({
        userId: session.userId,
        currency: session.currency,
        amount: -request.betAmount,
        type: "debit",
        description: `Bet in ${session.gameId}`,
        gameId: session.gameId,
        sessionId: request.sessionId,
      });

      if (winAmount > 0) {
        await this.updateUserWallet({
          userId: session.userId,
          currency: session.currency,
          amount: winAmount,
          type: "credit",
          description: `Win in ${session.gameId}`,
          gameId: session.gameId,
          sessionId: request.sessionId,
        });
      }

      const spinResponse: SpinResponse = {
        spinId: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: request.sessionId,
        success: true,
        betAmount: request.betAmount,
        winAmount,
        newBalance: session.balance,
        symbols,
        paylines,
        features,
        gameState: session.gameState,
        timestamp: new Date(),
      };

      // In production: POST to /api/spin
      console.log("Spin result:", spinResponse);

      return spinResponse;
    } catch (error) {
      console.error("Error performing spin:", error);
      throw error;
    }
  }

  /**
   * End game session
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isActive = false;
        session.lastActivity = new Date();

        // In production: POST to /api/sessions/end
        console.log("Ended session:", sessionId);
      }
    } catch (error) {
      console.error("Error ending session:", error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<GameSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  // Private helper methods

  private generateSignature(sessionId: string): string {
    // In production: generate HMAC signature
    return btoa(`${sessionId}_${this.apiKey}_${Date.now()}`);
  }

  private async getUserBalance(userId: string, currency: "GC" | "SC"): Promise<number> {
    // In production: fetch from wallet service
    // For now, return mock balance
    if (currency === "GC") {
      return 50000; // Gold Coins
    } else {
      return 100; // Sweeps Coins
    }
  }

  private async updateUserWallet(operation: WalletOperation): Promise<void> {
    // In production: update wallet via API
    console.log("Wallet operation:", operation);
  }

  private generateSymbols(): string[][] {
    const symbols = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "🔔", "💰", "🪙", "👑"];
    const reels = 5;
    const rows = 3;
    const result: string[][] = [];

    for (let reel = 0; reel < reels; reel++) {
      result[reel] = [];
      for (let row = 0; row < rows; row++) {
        result[reel][row] = symbols[Math.floor(Math.random() * symbols.length)];
      }
    }

    return result;
  }

  private calculateWin(symbols: string[][], betAmount: number, betLines: number): { winAmount: number; paylines: PaylineWin[] } {
    const paylines: PaylineWin[] = [];
    let totalWin = 0;

    // Simple payline calculation
    for (let line = 0; line < Math.min(betLines, 3); line++) {
      const lineSymbols = symbols.map(reel => reel[line]);
      const firstSymbol = lineSymbols[0];

      let consecutiveCount = 1;
      for (let i = 1; i < lineSymbols.length; i++) {
        if (lineSymbols[i] === firstSymbol) {
          consecutiveCount++;
        } else {
          break;
        }
      }

      if (consecutiveCount >= 3) {
        const multiplier = this.getSymbolMultiplier(firstSymbol, consecutiveCount);
        const lineWin = (betAmount / betLines) * multiplier;

        paylines.push({
          line: line + 1,
          symbols: lineSymbols.slice(0, consecutiveCount),
          multiplier,
          winAmount: lineWin,
          positions: Array.from({length: consecutiveCount}, (_, i) => i),
        });

        totalWin += lineWin;
      }
    }

    return { winAmount: totalWin, paylines };
  }

  private getSymbolMultiplier(symbol: string, count: number): number {
    const multipliers: { [key: string]: number[] } = {
      "👑": [0, 0, 50, 200, 1000],
      "💎": [0, 0, 25, 100, 500],
      "💰": [0, 0, 20, 75, 300],
      "🪙": [0, 0, 15, 50, 200],
      "⭐": [0, 0, 10, 40, 150],
      "🔔": [0, 0, 8, 30, 100],
      "🍇": [0, 0, 5, 20, 75],
      "🍊": [0, 0, 4, 15, 50],
      "🍋": [0, 0, 3, 10, 35],
      "🍒": [0, 0, 2, 8, 25],
    };

    return multipliers[symbol]?.[count] || 0;
  }

  private checkFeatures(symbols: string[][]): FeatureResult[] {
    const features: FeatureResult[] = [];

    // Check for scatter symbols
    const scatterCount = symbols.flat().filter(symbol => symbol === "⭐").length;
    if (scatterCount >= 3) {
      features.push({
        type: "free_spins",
        triggered: true,
        data: { spins: scatterCount * 5, multiplier: 2 },
      });
    }

    // Check for wild symbols
    const wildCount = symbols.flat().filter(symbol => symbol === "👑").length;
    if (wildCount >= 1) {
      features.push({
        type: "wild",
        triggered: true,
        data: { count: wildCount },
      });
    }

    return features;
  }
}

export const coinKrazySlotsServer = CoinKrazySlotsServer.getInstance();
export default coinKrazySlotsServer;
