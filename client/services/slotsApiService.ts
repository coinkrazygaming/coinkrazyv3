import { authService } from "./authService";

export interface SlotGame {
  id: string;
  name: string;
  provider: string;
  category: string[];
  theme: string;
  rtp: number;
  volatility: "low" | "medium" | "high";
  minBet: number;
  maxBet: number;
  paylines: number;
  reels: number;
  rows: number;
  features: string[];
  imageUrl: string;
  demoUrl: string;
  realUrl: string;
  description: string;
  releaseDate: string;
  popularity: number;
  isJackpot: boolean;
  jackpotAmount?: number;
  isMobile: boolean;
  isDesktop: boolean;
  gameSize: { width: number; height: number };
}

export interface GameSession {
  sessionId: string;
  gameId: string;
  userId: string;
  currency: "GC" | "SC";
  initialBalance: number;
  currentBalance: number;
  totalBet: number;
  totalWin: number;
  spinsCount: number;
  status: "active" | "completed" | "paused";
  startTime: string;
  lastActivity: string;
}

export interface SpinResult {
  spinId: string;
  sessionId: string;
  betAmount: number;
  betLines: number;
  winAmount: number;
  winLines: Array<{
    line: number;
    symbols: string[];
    multiplier: number;
    amount: number;
  }>;
  symbols: string[][];
  isBonus: boolean;
  isFreeSpins: boolean;
  isJackpot: boolean;
  jackpotAmount?: number;
  gameState: {
    balance: number;
    freeSpinsRemaining?: number;
    bonusFeatureActive?: boolean;
  };
  timestamp: string;
}

export interface SlotProvider {
  id: string;
  name: string;
  logo: string;
  gamesCount: number;
  isActive: boolean;
  apiEndpoint: string;
  features: string[];
}

// Free slot game providers/aggregators
const FREE_SLOT_PROVIDERS: SlotProvider[] = [
  {
    id: "pragmatic-play-demo",
    name: "Pragmatic Play Demo",
    logo: "/providers/pragmatic-play.png",
    gamesCount: 250,
    isActive: true,
    apiEndpoint: "https://demo.pragmaticplay.net",
    features: ["Demo Mode", "High RTP", "Mobile Optimized"],
  },
  {
    id: "netent-demo",
    name: "NetEnt Demo",
    logo: "/providers/netent.png",
    gamesCount: 180,
    isActive: true,
    apiEndpoint: "https://demo.netent.com",
    features: ["Touch Support", "HD Graphics", "Bonus Features"],
  },
  {
    id: "microgaming-demo",
    name: "Microgaming Demo",
    logo: "/providers/microgaming.png",
    gamesCount: 320,
    isActive: true,
    apiEndpoint: "https://demo.microgaming.com",
    features: ["Progressive Jackpots", "Free Spins", "Multipliers"],
  },
  {
    id: "play-n-go-demo",
    name: "Play'n GO Demo",
    logo: "/providers/playngo.png",
    gamesCount: 150,
    isActive: true,
    apiEndpoint: "https://demo.playngo.com",
    features: ["Mobile First", "Cluster Pays", "Cascading Reels"],
  },
  {
    id: "quickspin-demo",
    name: "Quickspin Demo",
    logo: "/providers/quickspin.png",
    gamesCount: 80,
    isActive: true,
    apiEndpoint: "https://demo.quickspin.com",
    features: [
      "Achievement Engine",
      "Big Win Potential",
      "Innovative Features",
    ],
  },
];

// Mock slot games database
const MOCK_SLOT_GAMES: SlotGame[] = [
  // Pragmatic Play Games
  {
    id: "gates-of-olympus",
    name: "Gates of Olympus",
    provider: "Pragmatic Play",
    category: ["featured", "popular", "high-rtp"],
    theme: "Greek Mythology",
    rtp: 96.5,
    volatility: "high",
    minBet: 0.2,
    maxBet: 100.0,
    paylines: 0, // Cluster pays
    reels: 6,
    rows: 5,
    features: [
      "Tumble Feature",
      "Multiplier Symbols",
      "Free Spins",
      "Ante Bet",
    ],
    imageUrl: "/games/gates-of-olympus.jpg",
    demoUrl:
      "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20olympgate&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net",
    realUrl: "",
    description:
      "Enter the realm of Zeus and witness the power of the gods in this high volatility slot with multiplier symbols and tumbling reels.",
    releaseDate: "2021-02-13",
    popularity: 98,
    isJackpot: false,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },
  {
    id: "sweet-bonanza",
    name: "Sweet Bonanza",
    provider: "Pragmatic Play",
    category: ["featured", "popular"],
    theme: "Candy & Sweets",
    rtp: 96.48,
    volatility: "high",
    minBet: 0.2,
    maxBet: 100.0,
    paylines: 0, // Cluster pays
    reels: 6,
    rows: 5,
    features: ["Tumble Feature", "Multiplier Bombs", "Free Spins", "Ante Bet"],
    imageUrl: "/games/sweet-bonanza.jpg",
    demoUrl:
      "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20fruitsw&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net",
    realUrl: "",
    description:
      "A colorful candy-themed slot with tumbling reels and multiplier bombs that can lead to massive wins.",
    releaseDate: "2019-06-27",
    popularity: 95,
    isJackpot: false,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },
  {
    id: "wolf-gold",
    name: "Wolf Gold",
    provider: "Pragmatic Play",
    category: ["featured", "jackpot"],
    theme: "Wildlife",
    rtp: 96.01,
    volatility: "medium",
    minBet: 0.25,
    maxBet: 125.0,
    paylines: 25,
    reels: 5,
    rows: 3,
    features: ["Wild Symbol", "Money Respin", "Free Spins", "Jackpot"],
    imageUrl: "/games/wolf-gold.jpg",
    demoUrl:
      "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs25wolf&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net",
    realUrl: "",
    description:
      "Howl with the wolves in this Native American-themed slot featuring three fixed jackpots and money respin feature.",
    releaseDate: "2017-10-01",
    popularity: 92,
    isJackpot: true,
    jackpotAmount: 47582.33,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },
  {
    id: "great-rhino-megaways",
    name: "Great Rhino Megaways",
    provider: "Pragmatic Play",
    category: ["new", "megaways"],
    theme: "Wildlife",
    rtp: 96.58,
    volatility: "high",
    minBet: 0.2,
    maxBet: 100.0,
    paylines: 200704, // Megaways
    reels: 6,
    rows: 7,
    features: ["Megaways", "Tumble Feature", "Free Spins", "Multiplier Wilds"],
    imageUrl: "/games/great-rhino-megaways.jpg",
    demoUrl:
      "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vswaysbbb&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net",
    realUrl: "",
    description:
      "Experience the African savanna with up to 200,704 ways to win in this Megaways adventure.",
    releaseDate: "2020-05-01",
    popularity: 88,
    isJackpot: false,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },

  // NetEnt Games
  {
    id: "starburst",
    name: "Starburst",
    provider: "NetEnt",
    category: ["featured", "classic", "popular"],
    theme: "Space & Gems",
    rtp: 96.09,
    volatility: "low",
    minBet: 0.1,
    maxBet: 100.0,
    paylines: 10,
    reels: 5,
    rows: 3,
    features: ["Expanding Wilds", "Win Both Ways", "Re-Spins"],
    imageUrl: "/games/starburst.jpg",
    demoUrl: "https://www.netent.com/en/games/starburst/",
    realUrl: "",
    description:
      "The iconic space-themed slot that became a classic with its expanding wilds and win both ways feature.",
    releaseDate: "2012-11-01",
    popularity: 99,
    isJackpot: false,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },
  {
    id: "gonzo-quest",
    name: "Gonzo's Quest",
    provider: "NetEnt",
    category: ["featured", "popular", "bonus"],
    theme: "Adventure",
    rtp: 95.97,
    volatility: "medium",
    minBet: 0.2,
    maxBet: 50.0,
    paylines: 20,
    reels: 5,
    rows: 3,
    features: ["Avalanche Feature", "Multiplier", "Free Falls", "Wild Symbol"],
    imageUrl: "/games/gonzo-quest.jpg",
    demoUrl: "https://www.netent.com/en/games/gonzos-quest/",
    realUrl: "",
    description:
      "Join conquistador Gonzo on his quest for gold with cascading symbols and increasing multipliers.",
    releaseDate: "2011-05-01",
    popularity: 94,
    isJackpot: false,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },
  {
    id: "mega-fortune",
    name: "Mega Fortune",
    provider: "NetEnt",
    category: ["jackpot", "luxury"],
    theme: "Luxury",
    rtp: 96.6,
    volatility: "low",
    minBet: 0.25,
    maxBet: 50.0,
    paylines: 25,
    reels: 5,
    rows: 3,
    features: [
      "Progressive Jackpot",
      "Bonus Wheel",
      "Free Spins",
      "Wild Symbol",
    ],
    imageUrl: "/games/mega-fortune.jpg",
    demoUrl: "https://www.netent.com/en/games/mega-fortune/",
    realUrl: "",
    description:
      "The luxury lifestyle awaits in this progressive jackpot slot with a bonus wheel feature.",
    releaseDate: "2009-02-01",
    popularity: 85,
    isJackpot: true,
    jackpotAmount: 3456789.21,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },

  // Microgaming Games
  {
    id: "immortal-romance",
    name: "Immortal Romance",
    provider: "Microgaming",
    category: ["featured", "story", "bonus"],
    theme: "Vampire Romance",
    rtp: 96.86,
    volatility: "medium",
    minBet: 0.3,
    maxBet: 6.0,
    paylines: 243,
    reels: 5,
    rows: 3,
    features: [
      "Chamber of Spins",
      "Wild Desire",
      "Story Mode",
      "Multiple Free Spin Features",
    ],
    imageUrl: "/games/immortal-romance.jpg",
    demoUrl: "https://demo.microgaming.com/immortal-romance",
    realUrl: "",
    description:
      "A dark tale of forbidden love with an innovative Chamber of Spins bonus feature.",
    releaseDate: "2011-12-01",
    popularity: 91,
    isJackpot: false,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },
  {
    id: "mega-moolah",
    name: "Mega Moolah",
    provider: "Microgaming",
    category: ["jackpot", "classic"],
    theme: "African Safari",
    rtp: 88.12,
    volatility: "medium",
    minBet: 0.25,
    maxBet: 6.25,
    paylines: 25,
    reels: 5,
    rows: 3,
    features: [
      "Progressive Jackpot",
      "Jackpot Wheel",
      "Free Spins",
      "Wild Symbol",
    ],
    imageUrl: "/games/mega-moolah.jpg",
    demoUrl: "https://demo.microgaming.com/mega-moolah",
    realUrl: "",
    description:
      "The legendary progressive jackpot slot that has created more millionaires than any other game.",
    releaseDate: "2006-11-01",
    popularity: 96,
    isJackpot: true,
    jackpotAmount: 8765432.1,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },

  // Play'n GO Games
  {
    id: "book-of-dead",
    name: "Book of Dead",
    provider: "Play'n GO",
    category: ["featured", "popular", "bonus"],
    theme: "Ancient Egypt",
    rtp: 96.21,
    volatility: "high",
    minBet: 0.01,
    maxBet: 100.0,
    paylines: 10,
    reels: 5,
    rows: 3,
    features: [
      "Expanding Symbol",
      "Free Spins",
      "Gamble Feature",
      "Scatter Symbol",
    ],
    imageUrl: "/games/book-of-dead.jpg",
    demoUrl: "https://demo.playngo.com/book-of-dead",
    realUrl: "",
    description:
      "Explore ancient Egyptian tombs with Rich Wilde in this high volatility adventure slot.",
    releaseDate: "2016-01-01",
    popularity: 93,
    isJackpot: false,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },
  {
    id: "reactoonz",
    name: "Reactoonz",
    provider: "Play'n GO",
    category: ["cluster", "bonus"],
    theme: "Aliens & Space",
    rtp: 96.51,
    volatility: "high",
    minBet: 0.2,
    maxBet: 100.0,
    paylines: 0, // Cluster pays
    reels: 7,
    rows: 7,
    features: [
      "Cluster Pays",
      "Quantum Features",
      "Gargantoon",
      "Energy Collection",
    ],
    imageUrl: "/games/reactoonz.jpg",
    demoUrl: "https://demo.playngo.com/reactoonz",
    realUrl: "",
    description:
      "Meet the cute alien Reactoonz in this cluster pays slot with cascading wins and quantum features.",
    releaseDate: "2017-10-01",
    popularity: 87,
    isJackpot: false,
    isMobile: true,
    isDesktop: true,
    gameSize: { width: 800, height: 600 },
  },
];

class SlotsApiService {
  private static instance: SlotsApiService;
  private baseUrl = "/api/slots";
  private activeSessions: Map<string, GameSession> = new Map();

  static getInstance(): SlotsApiService {
    if (!SlotsApiService.instance) {
      SlotsApiService.instance = new SlotsApiService();
    }
    return SlotsApiService.instance;
  }

  // Helper method for fetch with timeout
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Get all available slot games
  async getAllGames(): Promise<SlotGame[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/games`);

      if (!response.ok) {
        console.warn(`Slots API returned ${response.status}, using mock data`);
        return this.getMockGames();
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Slots API response is not JSON, using mock data");
        return this.getMockGames();
      }

      const games = await response.json();
      return Array.isArray(games) ? games : this.getMockGames();
    } catch (error) {
      console.warn("Error fetching slot games, using mock data:", error);
      return this.getMockGames();
    }
  }

  // Get games by provider
  async getGamesByProvider(providerId: string): Promise<SlotGame[]> {
    try {
      const allGames = await this.getAllGames();
      return allGames.filter(
        (game) =>
          game.provider.toLowerCase().replace(/[^a-z0-9]/g, "-") === providerId,
      );
    } catch (error) {
      console.warn("Error fetching games by provider:", error);
      return [];
    }
  }

  // Get featured games
  async getFeaturedGames(): Promise<SlotGame[]> {
    try {
      const allGames = await this.getAllGames();
      return allGames
        .filter((game) => game.category.includes("featured"))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 12);
    } catch (error) {
      console.warn("Error fetching featured games:", error);
      return [];
    }
  }

  // Get popular games
  async getPopularGames(): Promise<SlotGame[]> {
    try {
      const allGames = await this.getAllGames();
      return allGames.sort((a, b) => b.popularity - a.popularity).slice(0, 20);
    } catch (error) {
      console.warn("Error fetching popular games:", error);
      return [];
    }
  }

  // Get new games
  async getNewGames(): Promise<SlotGame[]> {
    try {
      const allGames = await this.getAllGames();
      return allGames
        .filter((game) => {
          const releaseDate = new Date(game.releaseDate);
          const monthsAgo = new Date();
          monthsAgo.setMonth(monthsAgo.getMonth() - 6);
          return releaseDate > monthsAgo;
        })
        .sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime(),
        )
        .slice(0, 15);
    } catch (error) {
      console.warn("Error fetching new games:", error);
      return [];
    }
  }

  // Get jackpot games
  async getJackpotGames(): Promise<SlotGame[]> {
    try {
      const allGames = await this.getAllGames();
      return allGames
        .filter((game) => game.isJackpot)
        .sort((a, b) => (b.jackpotAmount || 0) - (a.jackpotAmount || 0));
    } catch (error) {
      console.warn("Error fetching jackpot games:", error);
      return [];
    }
  }

  // Get game details
  async getGameDetails(gameId: string): Promise<SlotGame | null> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/games/${gameId}`,
      );

      if (!response.ok) {
        console.warn(
          `Game details API returned ${response.status}, using mock data`,
        );
        return this.getMockGames().find((game) => game.id === gameId) || null;
      }

      const game = await response.json();
      return game;
    } catch (error) {
      console.warn("Error fetching game details, using mock data:", error);
      return this.getMockGames().find((game) => game.id === gameId) || null;
    }
  }

  // Create game session
  async createGameSession(
    gameId: string,
    userId: string,
    currency: "GC" | "SC",
    initialBalance: number,
  ): Promise<GameSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: GameSession = {
      sessionId,
      gameId,
      userId,
      currency,
      initialBalance,
      currentBalance: initialBalance,
      totalBet: 0,
      totalWin: 0,
      spinsCount: 0,
      status: "active",
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(session),
      });

      if (response.ok) {
        const createdSession = await response.json();
        this.activeSessions.set(sessionId, createdSession);
        return createdSession;
      }
    } catch (error) {
      console.warn(
        "Error creating session on server, using local session:",
        error,
      );
    }

    // Fallback to local session
    this.activeSessions.set(sessionId, session);
    return session;
  }

  // Get game launch URL
  async getGameLaunchUrl(
    gameId: string,
    sessionId: string,
    currency: "GC" | "SC",
  ): Promise<string> {
    try {
      const game = await this.getGameDetails(gameId);
      if (!game) throw new Error("Game not found");

      // For demo mode, return the demo URL with session parameters
      if (currency === "GC" || !game.realUrl) {
        const demoUrl = new URL(game.demoUrl);
        demoUrl.searchParams.set("sessionId", sessionId);
        demoUrl.searchParams.set("currency", currency);
        demoUrl.searchParams.set("mode", "demo");
        return demoUrl.toString();
      }

      // For real money mode, construct real play URL
      const realUrl = new URL(game.realUrl || game.demoUrl);
      realUrl.searchParams.set("sessionId", sessionId);
      realUrl.searchParams.set("currency", currency);
      realUrl.searchParams.set("mode", "real");
      return realUrl.toString();
    } catch (error) {
      console.warn("Error getting game launch URL:", error);
      // Fallback URL for testing
      return `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20olympgate&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&sessionId=${sessionId}&currency=${currency}`;
    }
  }

  // Perform spin
  async performSpin(
    sessionId: string,
    betAmount: number,
    betLines: number,
  ): Promise<SpinResult> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/spin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sessionId,
          betAmount,
          betLines,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(
        "Error performing spin on server, simulating locally:",
        error,
      );
    }

    // Fallback to simulated spin
    return this.simulateSpin(sessionId, betAmount, betLines);
  }

  // Get providers
  async getProviders(): Promise<SlotProvider[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/providers`);

      if (!response.ok) {
        console.warn("Providers API failed, using mock data");
        return FREE_SLOT_PROVIDERS;
      }

      const providers = await response.json();
      return Array.isArray(providers) ? providers : FREE_SLOT_PROVIDERS;
    } catch (error) {
      console.warn("Error fetching providers, using mock data:", error);
      return FREE_SLOT_PROVIDERS;
    }
  }

  // Get session details
  async getSession(sessionId: string): Promise<GameSession | null> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/sessions/${sessionId}`,
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Error fetching session:", error);
    }

    return this.activeSessions.get(sessionId) || null;
  }

  // End game session
  async endSession(sessionId: string): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/sessions/${sessionId}/end`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        this.activeSessions.delete(sessionId);
        return true;
      }
    } catch (error) {
      console.warn("Error ending session on server:", error);
    }

    // Local cleanup
    this.activeSessions.delete(sessionId);
    return true;
  }

  // Private methods
  private getMockGames(): SlotGame[] {
    return MOCK_SLOT_GAMES;
  }

  private simulateSpin(
    sessionId: string,
    betAmount: number,
    betLines: number,
  ): SpinResult {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Simple RNG for demo purposes
    const isWin = Math.random() < 0.3; // 30% win rate
    const winMultiplier = isWin ? Math.random() * 50 + 1 : 0;
    const winAmount = isWin ? betAmount * winMultiplier : 0;
    const newBalance = session.currentBalance - betAmount + winAmount;

    // Update session
    session.currentBalance = Math.max(0, newBalance);
    session.totalBet += betAmount;
    session.totalWin += winAmount;
    session.spinsCount += 1;
    session.lastActivity = new Date().toISOString();

    // Generate random symbols
    const symbols = Array(5)
      .fill(null)
      .map(() =>
        Array(3)
          .fill(null)
          .map(
            () =>
              ["🍒", "🍋", "🔔", "⭐", "💎", "👑"][
                Math.floor(Math.random() * 6)
              ],
          ),
      );

    const result: SpinResult = {
      spinId: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      betAmount,
      betLines,
      winAmount,
      winLines: isWin
        ? [
            {
              line: Math.floor(Math.random() * betLines) + 1,
              symbols: symbols[0],
              multiplier: winMultiplier,
              amount: winAmount,
            },
          ]
        : [],
      symbols,
      isBonus: Math.random() < 0.05, // 5% bonus chance
      isFreeSpins: Math.random() < 0.03, // 3% free spins chance
      isJackpot: Math.random() < 0.001, // 0.1% jackpot chance
      gameState: {
        balance: session.currentBalance,
        freeSpinsRemaining: 0,
        bonusFeatureActive: false,
      },
      timestamp: new Date().toISOString(),
    };

    return result;
  }
}

export const slotsApiService = SlotsApiService.getInstance();
export default slotsApiService;
