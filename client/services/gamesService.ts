export interface Game {
  id: number;
  game_id: string;
  name: string;
  provider: string;
  category: string;
  rtp: number;
  max_win_multiplier: number;
  min_bet_gc: number;
  max_bet_gc: number;
  min_bet_sc: number;
  max_bet_sc: number;
  image_url: string;
  description: string;
  total_plays: number;
  total_profit_gc: number;
  total_profit_sc: number;
  current_jackpot_gc: number;
  current_jackpot_sc: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  session_id: string;
  user_id: number;
  game_id: string;
  currency: "GC" | "SC";
  initial_balance: number;
  current_balance: number;
  total_bet: number;
  total_win: number;
  status: "active" | "completed" | "paused";
  created_at: string;
}

export interface GameResult {
  success: boolean;
  session_id: string;
  balance_change: number;
  new_balance: number;
  win_amount: number;
  jackpot_win?: number;
  message: string;
}

class GamesService {
  private static instance: GamesService;
  private activeSessions: Map<string, GameSession> = new Map();

  static getInstance(): GamesService {
    if (!GamesService.instance) {
      GamesService.instance = new GamesService();
    }
    return GamesService.instance;
  }

  async getAllGames(): Promise<Game[]> {
    try {
      const response = await fetch("/api/games");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching games:", error);
      return this.getFallbackGames();
    }
  }

  async getActiveGames(): Promise<Game[]> {
    try {
      const response = await fetch("/api/games/active");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching active games:", error);
      return this.getFallbackGames().filter((game) => game.is_active);
    }
  }

  async getFeaturedGames(): Promise<Game[]> {
    const games = await this.getActiveGames();
    return games.filter((game) => game.is_featured);
  }

  async getGamesByCategory(category: string): Promise<Game[]> {
    const games = await this.getActiveGames();
    return games.filter((game) => game.category === category);
  }

  async getGameById(gameId: string): Promise<Game | null> {
    const games = await this.getAllGames();
    return games.find((game) => game.game_id === gameId) || null;
  }

  async startGameSession(
    userId: number,
    gameId: string,
    currency: "GC" | "SC",
  ): Promise<GameSession> {
    const sessionId = `${userId}_${gameId}_${Date.now()}`;
    const session: GameSession = {
      session_id: sessionId,
      user_id: userId,
      game_id: gameId,
      currency,
      initial_balance: currency === "GC" ? 1000000 : 1000,
      current_balance: currency === "GC" ? 1000000 : 1000,
      total_bet: 0,
      total_win: 0,
      status: "active",
      created_at: new Date().toISOString(),
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  async placeBet(sessionId: string, betAmount: number): Promise<GameResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error("Game session not found");
    }

    // Simple RTP-based calculation
    const rtp = 0.96;
    const randomFactor = Math.random();
    const winAmount =
      randomFactor < rtp ? Math.floor(betAmount * (1 + Math.random())) : 0;

    const balanceChange = winAmount - betAmount;
    session.current_balance += balanceChange;
    session.total_bet += betAmount;
    session.total_win += winAmount;

    return {
      success: true,
      session_id: sessionId,
      balance_change: balanceChange,
      new_balance: session.current_balance,
      win_amount: winAmount,
      message:
        winAmount > 0
          ? `You won ${winAmount} ${session.currency}!`
          : `You bet ${betAmount} ${session.currency}`,
    };
  }

  async endGameSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = "completed";
      this.activeSessions.delete(sessionId);
    }
  }

  generateGameUrl(
    gameId: string,
    currency: "GC" | "SC",
    sessionId: string,
  ): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/game-player/${gameId}?currency=${currency}&session=${sessionId}&mode=play`;
  }

  private getFallbackGames(): Game[] {
    return [
      {
        id: 1,
        game_id: "gates-of-olympus",
        name: "Gates of Olympus",
        provider: "Pragmatic Play",
        category: "slots",
        rtp: 96.5,
        max_win_multiplier: 5000,
        min_bet_gc: 20,
        max_bet_gc: 10000,
        min_bet_sc: 1,
        max_bet_sc: 100,
        image_url: "/games/gates-of-olympus.jpg",
        description:
          "Enter the realm of the gods and claim divine rewards in this thrilling slot adventure.",
        total_plays: 12543,
        total_profit_gc: 2847561,
        total_profit_sc: 4821,
        current_jackpot_gc: 1281402,
        current_jackpot_sc: 2169,
        is_active: true,
        is_featured: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        game_id: "sweet-bonanza",
        name: "Sweet Bonanza",
        provider: "Pragmatic Play",
        category: "slots",
        rtp: 96.48,
        max_win_multiplier: 21100,
        min_bet_gc: 20,
        max_bet_gc: 10000,
        min_bet_sc: 1,
        max_bet_sc: 100,
        image_url: "/games/sweet-bonanza.jpg",
        description:
          "Dive into a world of candy and sweets where massive multipliers await.",
        total_plays: 18654,
        total_profit_gc: 4129387,
        total_profit_sc: 7821,
        current_jackpot_gc: 1858222,
        current_jackpot_sc: 3519,
        is_active: true,
        is_featured: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        game_id: "book-of-dead",
        name: "Book of Dead",
        provider: "Play'n GO",
        category: "slots",
        rtp: 96.21,
        max_win_multiplier: 5000,
        min_bet_gc: 20,
        max_bet_gc: 10000,
        min_bet_sc: 1,
        max_bet_sc: 100,
        image_url: "/games/book-of-dead.jpg",
        description:
          "Join Rich Wilde on an Egyptian adventure filled with expanding symbols and big wins.",
        total_plays: 9876,
        total_profit_gc: 1876423,
        total_profit_sc: 3421,
        current_jackpot_gc: 843390,
        current_jackpot_sc: 1539,
        is_active: true,
        is_featured: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
      {
        id: 4,
        game_id: "starburst",
        name: "Starburst",
        provider: "NetEnt",
        category: "slots",
        rtp: 96.09,
        max_win_multiplier: 500,
        min_bet_gc: 10,
        max_bet_gc: 10000,
        min_bet_sc: 1,
        max_bet_sc: 100,
        image_url: "/games/starburst.jpg",
        description:
          "The classic cosmic slot that started it all. Simple, elegant, and rewarding.",
        total_plays: 15432,
        total_profit_gc: 2341876,
        total_profit_sc: 4987,
        current_jackpot_gc: 1053843,
        current_jackpot_sc: 2244,
        is_active: true,
        is_featured: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
      {
        id: 5,
        game_id: "gonzo-quest",
        name: "Gonzo's Quest",
        provider: "NetEnt",
        category: "slots",
        rtp: 95.97,
        max_win_multiplier: 2500,
        min_bet_gc: 20,
        max_bet_gc: 10000,
        min_bet_sc: 1,
        max_bet_sc: 100,
        image_url: "/games/gonzo-quest.jpg",
        description:
          "Follow Gonzo's quest for El Dorado with cascading reels and increasing multipliers.",
        total_plays: 11298,
        total_profit_gc: 2087654,
        total_profit_sc: 4123,
        current_jackpot_gc: 939444,
        current_jackpot_sc: 1855,
        is_active: true,
        is_featured: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

export const gamesService = GamesService.getInstance();
export default gamesService;
