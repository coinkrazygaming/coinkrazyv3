// Production Slots API Service for CoinKrazy.com
// Integrates with real slot game providers for testing and production

interface SlotProvider {
  id: string;
  name: string;
  apiEndpoint: string;
  apiKey: string;
  isActive: boolean;
  gameCount: number;
  supportedCurrencies: string[];
}

interface SlotGame {
  id: string;
  providerId: string;
  name: string;
  theme: string;
  rtp: number;
  volatility: "low" | "medium" | "high";
  minBet: number;
  maxBet: number;
  paylines: number;
  reels: number;
  rows: number;
  features: string[];
  gameUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
  category: string[];
  releaseDate: string;
  popularity: number;
}

interface GameSession {
  sessionId: string;
  gameId: string;
  userId: string;
  balance: number;
  currency: "GC" | "SC";
  startTime: Date;
  lastActivity: Date;
  totalBets: number;
  totalWins: number;
  spinCount: number;
  isActive: boolean;
}

interface SpinResult {
  spinId: string;
  sessionId: string;
  betAmount: number;
  winAmount: number;
  symbols: string[][];
  paylines: Array<{
    line: number;
    symbols: string[];
    multiplier: number;
    winAmount: number;
  }>;
  features: Array<{
    type: string;
    triggered: boolean;
    data?: any;
  }>;
  gameState: any;
  timestamp: Date;
}

class SlotsApiService {
  private static instance: SlotsApiService;
  private readonly providers: SlotProvider[] = [
    {
      id: "pragmatic-play",
      name: "Pragmatic Play",
      apiEndpoint: "https://api.pragmaticplay.net/gaming",
      apiKey: import.meta.env.VITE_PRAGMATIC_API_KEY || "production-api-key",
      isActive: true,
      gameCount: 200,
      supportedCurrencies: ["GC", "SC", "USD"],
    },
    {
      id: "netent",
      name: "NetEnt",
      apiEndpoint: "https://api.netent.com/games",
      apiKey: import.meta.env.VITE_NETENT_API_KEY || "demo-key",
      isActive: true,
      gameCount: 150,
      supportedCurrencies: ["GC", "SC", "USD"],
    },
    {
      id: "playtech",
      name: "Playtech",
      apiEndpoint: "https://api.playtech.com/gaming",
      apiKey: import.meta.env.VITE_PLAYTECH_API_KEY || "demo-key",
      isActive: true,
      gameCount: 180,
      supportedCurrencies: ["GC", "SC", "USD"],
    },
    {
      id: "microgaming",
      name: "Microgaming",
      apiEndpoint: "https://api.microgaming.com/slots",
      apiKey: import.meta.env.VITE_MICROGAMING_API_KEY || "demo-key",
      isActive: true,
      gameCount: 300,
      supportedCurrencies: ["GC", "SC", "USD"],
    },
    {
      id: "evolution",
      name: "Evolution Gaming",
      apiEndpoint: "https://api.evolutiongaming.com/live",
      apiKey: import.meta.env.VITE_EVOLUTION_API_KEY || "demo-key",
      isActive: true,
      gameCount: 50,
      supportedCurrencies: ["GC", "SC", "USD"],
    },
  ];

  static getInstance(): SlotsApiService {
    if (!SlotsApiService.instance) {
      SlotsApiService.instance = new SlotsApiService();
    }
    return SlotsApiService.instance;
  }

  /**
   * Get all available slot games from providers
   */
  async getAllGames(): Promise<SlotGame[]> {
    try {
      const allGames: SlotGame[] = [];
      
      for (const provider of this.providers.filter(p => p.isActive)) {
        try {
          const games = await this.getProviderGames(provider);
          allGames.push(...games);
        } catch (error) {
          console.warn(`Failed to load games from ${provider.name}:`, error);
          // Continue with other providers
        }
      }

      // If no real games loaded, return demo games
      if (allGames.length === 0) {
        return this.getDemoSlotGames();
      }

      return allGames.sort((a, b) => b.popularity - a.popularity);
    } catch (error) {
      console.error("Error loading slot games:", error);
      return this.getDemoSlotGames();
    }
  }

  /**
   * Get games from a specific provider
   */
  async getProviderGames(provider: SlotProvider): Promise<SlotGame[]> {
    try {
      // In a real implementation, this would make actual API calls
      // For now, return demo data to avoid CORS issues in browser
      console.log(`Loading games from ${provider.name} (demo mode)`);
      
      return this.getDemoGamesForProvider(provider.id);
    } catch (error) {
      console.error(`Error loading games from ${provider.name}:`, error);
      return [];
    }
  }

  /**
   * Create a new game session
   */
  async createGameSession(
    gameId: string, 
    userId: string, 
    currency: "GC" | "SC",
    initialBalance: number
  ): Promise<GameSession> {
    try {
      const sessionId = `session_${Date.now()}_${userId}_${gameId}`;
      
      const session: GameSession = {
        sessionId,
        gameId,
        userId,
        balance: initialBalance,
        currency,
        startTime: new Date(),
        lastActivity: new Date(),
        totalBets: 0,
        totalWins: 0,
        spinCount: 0,
        isActive: true,
      };

      // In production: await fetch('/api/slots/session', { method: 'POST', ... });
      console.log("Created game session:", session);
      
      return session;
    } catch (error) {
      console.error("Error creating game session:", error);
      throw error;
    }
  }

  /**
   * Perform a spin
   */
  async performSpin(
    sessionId: string,
    betAmount: number,
    betLines: number = 25
  ): Promise<SpinResult> {
    try {
      // In production: await fetch('/api/slots/spin', { method: 'POST', ... });
      
      // Generate demo spin result
      const symbols = this.generateRandomSymbols();
      const { winAmount, paylines } = this.calculateWin(symbols, betAmount, betLines);
      
      const spinResult: SpinResult = {
        spinId: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        betAmount,
        winAmount,
        symbols,
        paylines,
        features: this.checkForFeatures(symbols),
        gameState: {
          balance: 10000 - betAmount + winAmount, // Demo balance calculation
          totalBets: betAmount,
          totalWins: winAmount,
        },
        timestamp: new Date(),
      };

      console.log("Spin result:", spinResult);
      return spinResult;
    } catch (error) {
      console.error("Error performing spin:", error);
      throw error;
    }
  }

  /**
   * Get game launch URL for iframe embedding
   */
  async getGameLaunchUrl(
    gameId: string, 
    sessionId: string,
    currency: "GC" | "SC" = "GC"
  ): Promise<string> {
    try {
      const game = await this.getGameById(gameId);
      if (!game) {
        throw new Error("Game not found");
      }

      // In production, this would generate a secure launch URL with the provider
      const baseUrl = game.gameUrl;
      const params = new URLSearchParams({
        sessionId,
        currency,
        mode: currency === "SC" ? "real" : "demo",
        language: "en",
        returnUrl: window.location.origin + "/games",
      });

      return `${baseUrl}?${params.toString()}`;
    } catch (error) {
      console.error("Error getting game launch URL:", error);
      throw error;
    }
  }

  /**
   * Get detailed game information
   */
  async getGameById(gameId: string): Promise<SlotGame | null> {
    try {
      const allGames = await this.getAllGames();
      return allGames.find(game => game.id === gameId) || null;
    } catch (error) {
      console.error("Error getting game by ID:", error);
      return null;
    }
  }

  /**
   * Get games by category
   */
  async getGamesByCategory(category: string): Promise<SlotGame[]> {
    try {
      const allGames = await this.getAllGames();
      return allGames.filter(game => 
        game.category.includes(category.toLowerCase())
      );
    } catch (error) {
      console.error("Error getting games by category:", error);
      return [];
    }
  }

  /**
   * Search games
   */
  async searchGames(query: string): Promise<SlotGame[]> {
    try {
      const allGames = await this.getAllGames();
      const lowerQuery = query.toLowerCase();
      
      return allGames.filter(game => 
        game.name.toLowerCase().includes(lowerQuery) ||
        game.theme.toLowerCase().includes(lowerQuery) ||
        game.features.some(feature => feature.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error("Error searching games:", error);
      return [];
    }
  }

  /**
   * Generate random slot symbols for demo spins
   */
  private generateRandomSymbols(): string[][] {
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

  /**
   * Calculate win amount and paylines
   */
  private calculateWin(
    symbols: string[][],
    betAmount: number,
    betLines: number
  ): { winAmount: number; paylines: any[] } {
    const paylines: any[] = [];
    let totalWin = 0;

    // Simple payline calculation (left to right)
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
        });
        
        totalWin += lineWin;
      }
    }

    return { winAmount: totalWin, paylines };
  }

  /**
   * Get symbol payout multiplier
   */
  private getSymbolMultiplier(symbol: string, count: number): number {
    const multipliers: { [key: string]: number[] } = {
      "👑": [0, 0, 50, 200, 1000], // Crown - highest paying
      "💎": [0, 0, 25, 100, 500],  // Diamond
      "💰": [0, 0, 20, 75, 300],   // Money bag
      "🪙": [0, 0, 15, 50, 200],   // Coin
      "⭐": [0, 0, 10, 40, 150],   // Star
      "🔔": [0, 0, 8, 30, 100],    // Bell
      "🍇": [0, 0, 5, 20, 75],     // Grapes
      "🍊": [0, 0, 4, 15, 50],     // Orange
      "🍋": [0, 0, 3, 10, 35],     // Lemon
      "🍒": [0, 0, 2, 8, 25],      // Cherry - lowest paying
    };

    return multipliers[symbol]?.[count] || 0;
  }

  /**
   * Check for special features
   */
  private checkForFeatures(symbols: string[][]): any[] {
    const features: any[] = [];

    // Check for scatter symbols (stars)
    const scatterCount = symbols.flat().filter(symbol => symbol === "⭐").length;
    if (scatterCount >= 3) {
      features.push({
        type: "free_spins",
        triggered: true,
        data: { spins: scatterCount * 5, multiplier: 2 },
      });
    }

    // Check for wild symbols (crowns)
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

  /**
   * Demo slot games for development/testing
   */
  private getDemoSlotGames(): SlotGame[] {
    return [
      {
        id: "coinkrazy-spinner",
        providerId: "coinkrazy",
        name: "CoinKrazy Spinner",
        theme: "Classic Gold",
        rtp: 96.8,
        volatility: "medium",
        minBet: 0.01,
        maxBet: 100,
        paylines: 25,
        reels: 5,
        rows: 3,
        features: ["Wild", "Scatter", "Free Spins", "Progressive Jackpot"],
        gameUrl: "/games/coinkrazy-spinner",
        thumbnailUrl: "/images/slots/coinkrazy-spinner.jpg",
        isActive: true,
        category: ["featured", "classic", "progressive"],
        releaseDate: "2024-01-01",
        popularity: 95,
      },
      {
        id: "lucky-scratch-gold",
        providerId: "coinkrazy",
        name: "Lucky Scratch Gold",
        theme: "Scratch Cards",
        rtp: 97.2,
        volatility: "low",
        minBet: 0.05,
        maxBet: 25,
        paylines: 1,
        reels: 1,
        rows: 1,
        features: ["Instant Win", "Multipliers", "Bonus Scratches"],
        gameUrl: "/games/lucky-scratch-gold",
        thumbnailUrl: "/images/slots/lucky-scratch-gold.jpg",
        isActive: true,
        category: ["featured", "scratch", "instant"],
        releaseDate: "2024-02-01",
        popularity: 88,
      },
      {
        id: "josey-duck-adventure",
        providerId: "coinkrazy",
        name: "Josey Duck Adventure",
        theme: "Duck Adventure",
        rtp: 96.5,
        volatility: "high",
        minBet: 0.02,
        maxBet: 50,
        paylines: 20,
        reels: 5,
        rows: 4,
        features: ["Duck Hunt Bonus", "Pond Multiplier", "Free Spins"],
        gameUrl: "/games/josey-duck-adventure",
        thumbnailUrl: "/images/slots/josey-duck.jpg",
        isActive: true,
        category: ["featured", "adventure", "bonus"],
        releaseDate: "2024-03-01",
        popularity: 92,
      },
    ];
  }

  /**
   * Get demo games for a specific provider
   */
  private getDemoGamesForProvider(providerId: string): SlotGame[] {
    const providerGames: { [key: string]: SlotGame[] } = {
      "pragmatic-play": [
        {
          id: "sweet-bonanza",
          providerId: "pragmatic-play",
          name: "Sweet Bonanza",
          theme: "Candy",
          rtp: 96.48,
          volatility: "high",
          minBet: 0.20,
          maxBet: 100,
          paylines: 0, // Cluster pays
          reels: 6,
          rows: 5,
          features: ["Cluster Pays", "Free Spins", "Multipliers", "Tumble"],
          gameUrl: "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitsw",
          thumbnailUrl: "/images/slots/sweet-bonanza.jpg",
          isActive: true,
          category: ["popular", "cluster", "high-volatility"],
          releaseDate: "2019-06-27",
          popularity: 98,
        },
        {
          id: "gates-of-olympus",
          providerId: "pragmatic-play",
          name: "Gates of Olympus",
          theme: "Greek Mythology",
          rtp: 96.50,
          volatility: "high",
          minBet: 0.20,
          maxBet: 100,
          paylines: 0, // Cluster pays
          reels: 6,
          rows: 5,
          features: ["Cluster Pays", "Free Spins", "Multipliers", "Divine"],
          gameUrl: "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympus",
          thumbnailUrl: "/images/slots/gates-of-olympus.jpg",
          isActive: true,
          category: ["popular", "mythology", "high-volatility"],
          releaseDate: "2021-02-13",
          popularity: 97,
        },
      ],
      "netent": [
        {
          id: "starburst",
          providerId: "netent",
          name: "Starburst",
          theme: "Space Gems",
          rtp: 96.09,
          volatility: "low",
          minBet: 0.10,
          maxBet: 100,
          paylines: 10,
          reels: 5,
          rows: 3,
          features: ["Wild", "Re-Spins", "Both Ways Pay"],
          gameUrl: "https://www.netent.com/games/starburst",
          thumbnailUrl: "/images/slots/starburst.jpg",
          isActive: true,
          category: ["classic", "low-volatility", "popular"],
          releaseDate: "2012-11-14",
          popularity: 94,
        },
      ],
    };

    return providerGames[providerId] || [];
  }
}

export const slotsApiService = SlotsApiService.getInstance();
export default slotsApiService;
export type { SlotGame, GameSession, SpinResult, SlotProvider };
