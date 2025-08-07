import { walletService, CurrencyType } from './walletService';
import { currencyToggleService } from './currencyToggleService';

export interface GameProvider {
  id: string;
  name: string;
  displayName: string;
  type: 'slot' | 'table' | 'live' | 'sports' | 'bingo' | 'poker' | 'proprietary';
  apiEndpoint: string;
  apiKey: string;
  integrationType: 'iframe' | 'sdk' | 'api' | 'proprietary';
  isActive: boolean;
  supportedCurrencies: CurrencyType[];
  jurisdiction: string[];
  rtp: number; // Return to Player percentage
  gameCount: number;
  logoUrl: string;
  description: string;
  features: string[];
  certifications: string[];
  languages: string[];
}

export interface ProviderGame {
  id: string;
  providerId: string;
  name: string;
  category: string;
  type: 'slot' | 'table' | 'live' | 'sports' | 'bingo' | 'poker';
  description: string;
  thumbnailUrl: string;
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  maxWin: number;
  minBet: { GC: number; SC: number };
  maxBet: { GC: number; SC: number };
  features: string[];
  releaseDate: Date;
  isPopular: boolean;
  isFeatured: boolean;
  isNew: boolean;
  playCount: number;
  rating: number;
  tags: string[];
  gameUrl: string;
  mobileOptimized: boolean;
  hasDemo: boolean;
  jurisdiction: string[];
  languages: string[];
}

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  providerId: string;
  currency: CurrencyType;
  startTime: Date;
  endTime?: Date;
  totalBet: number;
  totalWin: number;
  netResult: number;
  sessionToken: string;
  gameUrl: string;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface ProviderStats {
  providerId: string;
  totalGames: number;
  totalSessions: number;
  totalBets: number;
  totalWins: number;
  totalPlayers: number;
  popularGames: ProviderGame[];
  revenue24h: number;
  revenue7d: number;
  revenue30d: number;
  averageRTP: number;
}

class GameProviderService {
  private static instance: GameProviderService;
  private providers: Map<string, GameProvider> = new Map();
  private games: Map<string, ProviderGame> = new Map();
  private activeSessions: Map<string, GameSession> = new Map();
  private gamesByProvider: Map<string, ProviderGame[]> = new Map();
  private gameStats: Map<string, ProviderStats> = new Map();

  static getInstance(): GameProviderService {
    if (!GameProviderService.instance) {
      GameProviderService.instance = new GameProviderService();
    }
    return GameProviderService.instance;
  }

  constructor() {
    this.initializeProviders();
    this.initializeGames();
    this.startStatsTracking();
  }

  private initializeProviders() {
    const providers: GameProvider[] = [
      {
        id: 'pragmatic-play',
        name: 'pragmatic_play',
        displayName: 'Pragmatic Play',
        type: 'slot',
        apiEndpoint: 'https://api.pragmaticplay.net/v1',
        apiKey: process.env.VITE_PRAGMATIC_API_KEY || 'demo_pragmatic_key',
        integrationType: 'iframe',
        isActive: true,
        supportedCurrencies: ['GC', 'SC'],
        jurisdiction: ['US', 'CA', 'UK'],
        rtp: 96.5,
        gameCount: 250,
        logoUrl: '/providers/pragmatic-play.png',
        description: 'Leading provider of premium slots and table games',
        features: ['HTML5', 'Mobile Optimized', 'Bonus Features', 'Progressive Jackpots'],
        certifications: ['GLI', 'eCOGRA', 'QUINEL', 'BMM'],
        languages: ['en', 'es', 'pt', 'fr', 'de']
      },
      {
        id: 'betsoft',
        name: 'betsoft',
        displayName: 'Betsoft',
        type: 'slot',
        apiEndpoint: 'https://api.betsoft.com/v2',
        apiKey: process.env.VITE_BETSOFT_API_KEY || 'demo_betsoft_key',
        integrationType: 'sdk',
        isActive: true,
        supportedCurrencies: ['GC', 'SC'],
        jurisdiction: ['US', 'CA'],
        rtp: 95.8,
        gameCount: 180,
        logoUrl: '/providers/betsoft.png',
        description: '3D slots and innovative gaming experiences',
        features: ['3D Graphics', 'Cinematic Gaming', 'Interactive Bonus Rounds'],
        certifications: ['GLI', 'TST', 'QUINEL'],
        languages: ['en', 'es']
      },
      {
        id: 'netent',
        name: 'netent',
        displayName: 'NetEnt',
        type: 'slot',
        apiEndpoint: 'https://api.netent.com/v1',
        apiKey: process.env.VITE_NETENT_API_KEY || 'demo_netent_key',
        integrationType: 'iframe',
        isActive: true,
        supportedCurrencies: ['GC', 'SC'],
        jurisdiction: ['US', 'CA', 'UK', 'EU'],
        rtp: 96.3,
        gameCount: 220,
        logoUrl: '/providers/netent.png',
        description: 'Premium casino games and innovative features',
        features: ['Avalanche Reels', 'Cluster Pays', 'Megaways'],
        certifications: ['GLI', 'eCOGRA', 'iTechLabs'],
        languages: ['en', 'es', 'pt', 'fr', 'de', 'sv', 'no']
      },
      {
        id: 'coinfrazy-proprietary',
        name: 'coinfrazy_proprietary',
        displayName: 'CoinFrazy Games',
        type: 'proprietary',
        apiEndpoint: 'https://games.coinfrazy.com/api/v1',
        apiKey: 'coinfrazy_internal_api',
        integrationType: 'proprietary',
        isActive: true,
        supportedCurrencies: ['GC', 'SC'],
        jurisdiction: ['US', 'CA'],
        rtp: 96.0,
        gameCount: 50,
        logoUrl: '/providers/coinfrazy.png',
        description: 'Exclusive CoinFrazy sweepstakes games',
        features: ['Sweepstakes Optimized', 'Social Features', 'Daily Challenges'],
        certifications: ['Internal QA', 'Sweepstakes Compliance'],
        languages: ['en']
      },
      {
        id: 'evolution-live',
        name: 'evolution',
        displayName: 'Evolution Gaming',
        type: 'live',
        apiEndpoint: 'https://api.evolution.com/v1',
        apiKey: process.env.VITE_EVOLUTION_API_KEY || 'demo_evolution_key',
        integrationType: 'iframe',
        isActive: true,
        supportedCurrencies: ['GC', 'SC'],
        jurisdiction: ['US', 'CA'],
        rtp: 98.9,
        gameCount: 45,
        logoUrl: '/providers/evolution.png',
        description: 'Live dealer casino games',
        features: ['Live Dealers', 'HD Streaming', 'Multi-Camera', 'Chat'],
        certifications: ['GLI', 'eCOGRA', 'MGA'],
        languages: ['en', 'es']
      },
      {
        id: 'sportsbook-provider',
        name: 'sportsbook',
        displayName: 'CoinFrazy Sportsbook',
        type: 'sports',
        apiEndpoint: 'https://sportsbook.coinfrazy.com/api/v1',
        apiKey: 'coinfrazy_sportsbook_api',
        integrationType: 'proprietary',
        isActive: true,
        supportedCurrencies: ['SC'], // Only sweeps coins for sports betting
        jurisdiction: ['US'],
        rtp: 95.0,
        gameCount: 15000, // Live events
        logoUrl: '/providers/sportsbook.png',
        description: 'Live sports betting and virtual sports',
        features: ['Live Betting', 'Virtual Sports', 'Parlay Builder', 'Cash Out'],
        certifications: ['Sweepstakes Compliance', 'GLI'],
        languages: ['en']
      }
    ];

    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
      this.gamesByProvider.set(provider.id, []);
    });
  }

  private async initializeGames() {
    // Initialize games for each provider
    await Promise.all([
      this.loadPragmaticPlayGames(),
      this.loadBetsoftGames(),
      this.loadNetEntGames(),
      this.loadProprietaryGames(),
      this.loadEvolutionGames(),
      this.loadSportsbookEvents()
    ]);
  }

  private async loadPragmaticPlayGames(): Promise<void> {
    const pragmaticGames: ProviderGame[] = [
      {
        id: 'pp-sweet-bonanza',
        providerId: 'pragmatic-play',
        name: 'Sweet Bonanza',
        category: 'Video Slots',
        type: 'slot',
        description: 'Tumbling reels with multipliers up to 21,100x',
        thumbnailUrl: '/games/sweet-bonanza.jpg',
        rtp: 96.51,
        volatility: 'high',
        maxWin: 21100,
        minBet: { GC: 20, SC: 0.20 },
        maxBet: { GC: 12500, SC: 125 },
        features: ['Tumble Feature', 'Free Spins', 'Multipliers', 'Bonus Buy'],
        releaseDate: new Date('2019-06-27'),
        isPopular: true,
        isFeatured: true,
        isNew: false,
        playCount: 245000,
        rating: 4.8,
        tags: ['fruit', 'candy', 'high-volatility', 'tumbling-reels'],
        gameUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitsw',
        mobileOptimized: true,
        hasDemo: true,
        jurisdiction: ['US', 'CA'],
        languages: ['en', 'es']
      },
      {
        id: 'pp-gates-olympus',
        providerId: 'pragmatic-play',
        name: 'Gates of Olympus',
        category: 'Video Slots',
        type: 'slot',
        description: 'Zeus-powered multipliers and divine wins',
        thumbnailUrl: '/games/gates-olympus.jpg',
        rtp: 96.50,
        volatility: 'high',
        maxWin: 5000,
        minBet: { GC: 20, SC: 0.20 },
        maxBet: { GC: 12500, SC: 125 },
        features: ['Tumble Feature', 'Multiplier Symbols', 'Free Spins', 'Ante Bet'],
        releaseDate: new Date('2021-02-13'),
        isPopular: true,
        isFeatured: true,
        isNew: false,
        playCount: 312000,
        rating: 4.9,
        tags: ['mythology', 'zeus', 'high-volatility', 'multipliers'],
        gameUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate',
        mobileOptimized: true,
        hasDemo: true,
        jurisdiction: ['US', 'CA'],
        languages: ['en', 'es']
      },
      // Add more Pragmatic Play games...
      ...this.generatePragmaticPlayGames(248) // Generate remaining games
    ];

    pragmaticGames.forEach(game => {
      this.games.set(game.id, game);
    });
    this.gamesByProvider.set('pragmatic-play', pragmaticGames);
  }

  private async loadBetsoftGames(): Promise<void> {
    const betsoftGames: ProviderGame[] = [
      {
        id: 'bs-good-girl-bad-girl',
        providerId: 'betsoft',
        name: 'Good Girl Bad Girl',
        category: '3D Slots',
        type: 'slot',
        description: 'Dual personality slot with expanding wilds',
        thumbnailUrl: '/games/good-girl-bad-girl.jpg',
        rtp: 95.82,
        volatility: 'medium',
        maxWin: 1000,
        minBet: { GC: 30, SC: 0.30 },
        maxBet: { GC: 15000, SC: 150 },
        features: ['Expanding Wilds', 'Free Spins', '3D Graphics', 'Dual Mode'],
        releaseDate: new Date('2010-04-15'),
        isPopular: true,
        isFeatured: false,
        isNew: false,
        playCount: 89000,
        rating: 4.6,
        tags: ['3d', 'character', 'expanding-wilds', 'betsoft'],
        gameUrl: 'https://demogames.betsoft.com/good-girl-bad-girl',
        mobileOptimized: true,
        hasDemo: true,
        jurisdiction: ['US', 'CA'],
        languages: ['en']
      },
      // Add more Betsoft games...
      ...this.generateBetsoftGames(179) // Generate remaining games
    ];

    betsoftGames.forEach(game => {
      this.games.set(game.id, game);
    });
    this.gamesByProvider.set('betsoft', betsoftGames);
  }

  private async loadNetEntGames(): Promise<void> {
    const netentGames: ProviderGame[] = [
      {
        id: 'ne-starburst',
        providerId: 'netent',
        name: 'Starburst',
        category: 'Video Slots',
        type: 'slot',
        description: 'Classic gem-themed slot with expanding wilds',
        thumbnailUrl: '/games/starburst.jpg',
        rtp: 96.09,
        volatility: 'low',
        maxWin: 500,
        minBet: { GC: 10, SC: 0.10 },
        maxBet: { GC: 10000, SC: 100 },
        features: ['Expanding Wilds', 'Re-spins', 'Both Ways Wins'],
        releaseDate: new Date('2012-11-01'),
        isPopular: true,
        isFeatured: true,
        isNew: false,
        playCount: 450000,
        rating: 4.7,
        tags: ['classic', 'gems', 'low-volatility', 'expanding-wilds'],
        gameUrl: 'https://www.netent.com/games/starburst',
        mobileOptimized: true,
        hasDemo: true,
        jurisdiction: ['US', 'CA', 'UK'],
        languages: ['en', 'es', 'pt']
      },
      // Add more NetEnt games...
      ...this.generateNetEntGames(219) // Generate remaining games
    ];

    netentGames.forEach(game => {
      this.games.set(game.id, game);
    });
    this.gamesByProvider.set('netent', netentGames);
  }

  private async loadProprietaryGames(): Promise<void> {
    const proprietaryGames: ProviderGame[] = [
      {
        id: 'cf-coinfrazy-fortune',
        providerId: 'coinfrazy-proprietary',
        name: 'CoinFrazy Fortune',
        category: 'Sweepstakes Slots',
        type: 'slot',
        description: 'Exclusive sweepstakes slot with social features',
        thumbnailUrl: '/games/coinfrazy-fortune.jpg',
        rtp: 96.00,
        volatility: 'medium',
        maxWin: 10000,
        minBet: { GC: 25, SC: 0.25 },
        maxBet: { GC: 12500, SC: 125 },
        features: ['Social Sharing', 'Daily Challenges', 'Friend Bonuses', 'Leaderboards'],
        releaseDate: new Date('2024-01-15'),
        isPopular: true,
        isFeatured: true,
        isNew: true,
        playCount: 12500,
        rating: 4.9,
        tags: ['exclusive', 'social', 'sweepstakes', 'coinfrazy'],
        gameUrl: '/games/proprietary/coinfrazy-fortune',
        mobileOptimized: true,
        hasDemo: true,
        jurisdiction: ['US', 'CA'],
        languages: ['en']
      },
      // Add more proprietary games...
      ...this.generateProprietaryGames(49) // Generate remaining games
    ];

    proprietaryGames.forEach(game => {
      this.games.set(game.id, game);
    });
    this.gamesByProvider.set('coinfrazy-proprietary', proprietaryGames);
  }

  private async loadEvolutionGames(): Promise<void> {
    const evolutionGames: ProviderGame[] = [
      {
        id: 'ev-lightning-baccarat',
        providerId: 'evolution-live',
        name: 'Lightning Baccarat',
        category: 'Live Casino',
        type: 'live',
        description: 'Live baccarat with lightning multipliers',
        thumbnailUrl: '/games/lightning-baccarat.jpg',
        rtp: 98.94,
        volatility: 'low',
        maxWin: 512000,
        minBet: { GC: 100, SC: 1.00 },
        maxBet: { GC: 500000, SC: 5000 },
        features: ['Live Dealer', 'Lightning Multipliers', 'Side Bets', 'HD Stream'],
        releaseDate: new Date('2020-05-12'),
        isPopular: true,
        isFeatured: true,
        isNew: false,
        playCount: 78000,
        rating: 4.8,
        tags: ['live', 'baccarat', 'multipliers', 'evolution'],
        gameUrl: 'https://games.evolution.com/lightning-baccarat',
        mobileOptimized: true,
        hasDemo: false,
        jurisdiction: ['US', 'CA'],
        languages: ['en']
      },
      // Add more Evolution games...
      ...this.generateEvolutionGames(44) // Generate remaining games
    ];

    evolutionGames.forEach(game => {
      this.games.set(game.id, game);
    });
    this.gamesByProvider.set('evolution-live', evolutionGames);
  }

  private async loadSportsbookEvents(): Promise<void> {
    // Sportsbook events are dynamic, so we'll create a base structure
    const sportsbookEvents: ProviderGame[] = [
      {
        id: 'sb-nfl-betting',
        providerId: 'sportsbook-provider',
        name: 'NFL Betting',
        category: 'American Football',
        type: 'sports',
        description: 'Live NFL betting with multiple markets',
        thumbnailUrl: '/games/nfl-betting.jpg',
        rtp: 95.00,
        volatility: 'medium',
        maxWin: 1000000,
        minBet: { GC: 0, SC: 1.00 }, // Sports only accepts SC
        maxBet: { GC: 0, SC: 10000 },
        features: ['Live Betting', 'Parlay Builder', 'Cash Out', 'Player Props'],
        releaseDate: new Date('2024-01-01'),
        isPopular: true,
        isFeatured: true,
        isNew: false,
        playCount: 25000,
        rating: 4.7,
        tags: ['nfl', 'american-football', 'live-betting', 'sports'],
        gameUrl: '/sportsbook/nfl',
        mobileOptimized: true,
        hasDemo: false,
        jurisdiction: ['US'],
        languages: ['en']
      }
      // Sports events are loaded dynamically
    ];

    sportsbookEvents.forEach(game => {
      this.games.set(game.id, game);
    });
    this.gamesByProvider.set('sportsbook-provider', sportsbookEvents);
  }

  // Helper methods to generate game libraries
  private generatePragmaticPlayGames(count: number): ProviderGame[] {
    const games: ProviderGame[] = [];
    const gameNames = [
      'Wolf Gold', 'The Dog House', 'Fruit Party', 'Big Bass Bonanza', 'Starlight Princess',
      'Sugar Rush', 'Wild West Gold', 'Book of Tut', 'Fire Strike', 'Golden Beauty',
      'Madame Destiny', 'Joker Jewels', 'Diamond Strike', 'Buffalo King', 'Chilli Heat'
    ];

    for (let i = 0; i < count; i++) {
      const baseName = gameNames[i % gameNames.length];
      games.push({
        id: `pp-${baseName.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        providerId: 'pragmatic-play',
        name: `${baseName} ${i > 14 ? 'Deluxe' : ''}`,
        category: 'Video Slots',
        type: 'slot',
        description: `Premium Pragmatic Play slot with exciting features`,
        thumbnailUrl: `/games/pragmatic/${baseName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        rtp: 95.5 + Math.random() * 2,
        volatility: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        maxWin: 1000 + Math.floor(Math.random() * 20000),
        minBet: { GC: 10 + Math.floor(Math.random() * 20), SC: 0.10 + Math.random() * 0.20 },
        maxBet: { GC: 5000 + Math.floor(Math.random() * 10000), SC: 50 + Math.floor(Math.random() * 100) },
        features: ['Wild Symbols', 'Free Spins', 'Multipliers', 'Bonus Rounds'],
        releaseDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        isPopular: Math.random() > 0.7,
        isFeatured: Math.random() > 0.9,
        isNew: Math.random() > 0.8,
        playCount: Math.floor(Math.random() * 100000),
        rating: 4.0 + Math.random() * 1.0,
        tags: ['pragmatic', 'video-slot', 'bonus-features'],
        gameUrl: `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20${baseName.toLowerCase().replace(/\s+/g, '')}`,
        mobileOptimized: true,
        hasDemo: true,
        jurisdiction: ['US', 'CA'],
        languages: ['en']
      });
    }

    return games;
  }

  private generateBetsoftGames(count: number): ProviderGame[] {
    const games: ProviderGame[] = [];
    const gameNames = [
      'The Slotfather', 'Alkemors Tower', 'Safari Sam', 'Heist', 'Giovanni\'s Gems',
      'At the Copa', 'Greedy Goblins', 'A Christmas Carol', 'The Curious Machine', 'Frankenslots Monster'
    ];

    for (let i = 0; i < count; i++) {
      const baseName = gameNames[i % gameNames.length];
      games.push({
        id: `bs-${baseName.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}-${i}`,
        providerId: 'betsoft',
        name: `${baseName} ${i > 9 ? 'Remastered' : ''}`,
        category: '3D Slots',
        type: 'slot',
        description: `Cinematic 3D slot experience from Betsoft`,
        thumbnailUrl: `/games/betsoft/${baseName.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}.jpg`,
        rtp: 94.5 + Math.random() * 2,
        volatility: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        maxWin: 500 + Math.floor(Math.random() * 5000),
        minBet: { GC: 25 + Math.floor(Math.random() * 25), SC: 0.25 + Math.random() * 0.25 },
        maxBet: { GC: 7500 + Math.floor(Math.random() * 7500), SC: 75 + Math.floor(Math.random() * 75) },
        features: ['3D Graphics', 'Interactive Bonus', 'Character Development', 'Cinematic Experience'],
        releaseDate: new Date(2015 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        isPopular: Math.random() > 0.8,
        isFeatured: Math.random() > 0.85,
        isNew: Math.random() > 0.9,
        playCount: Math.floor(Math.random() * 75000),
        rating: 4.2 + Math.random() * 0.8,
        tags: ['betsoft', '3d-slots', 'cinematic'],
        gameUrl: `https://demogames.betsoft.com/${baseName.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`,
        mobileOptimized: true,
        hasDemo: true,
        jurisdiction: ['US', 'CA'],
        languages: ['en']
      });
    }

    return games;
  }

  private generateNetEntGames(count: number): ProviderGame[] {
    const games: ProviderGame[] = [];
    const gameNames = [
      'Gonzo\'s Quest', 'Dead or Alive', 'Blood Suckers', 'Jack and the Beanstalk', 'Twin Spin',
      'Lights', 'Mega Fortune', 'Hall of Gods', 'Divine Fortune', 'Vikings'
    ];

    for (let i = 0; i < count; i++) {
      const baseName = gameNames[i % gameNames.length];
      games.push({
        id: `ne-${baseName.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}-${i}`,
        providerId: 'netent',
        name: `${baseName} ${i > 9 ? 'Megaways' : ''}`,
        category: 'Video Slots',
        type: 'slot',
        description: `Premium NetEnt slot with innovative mechanics`,
        thumbnailUrl: `/games/netent/${baseName.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}.jpg`,
        rtp: 95.0 + Math.random() * 3,
        volatility: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        maxWin: 1000 + Math.floor(Math.random() * 25000),
        minBet: { GC: 10 + Math.floor(Math.random() * 15), SC: 0.10 + Math.random() * 0.15 },
        maxBet: { GC: 10000 + Math.floor(Math.random() * 15000), SC: 100 + Math.floor(Math.random() * 150) },
        features: ['Avalanche Reels', 'Free Spins', 'Wild Substitutions', 'Bonus Features'],
        releaseDate: new Date(2018 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        isPopular: Math.random() > 0.75,
        isFeatured: Math.random() > 0.85,
        isNew: Math.random() > 0.85,
        playCount: Math.floor(Math.random() * 200000),
        rating: 4.3 + Math.random() * 0.7,
        tags: ['netent', 'premium', 'innovative'],
        gameUrl: `https://www.netent.com/games/${baseName.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`,
        mobileOptimized: true,
        hasDemo: true,
        jurisdiction: ['US', 'CA', 'UK'],
        languages: ['en', 'es']
      });
    }

    return games;
  }

  private generateProprietaryGames(count: number): ProviderGame[] {
    const games: ProviderGame[] = [];
    const gameNames = [
      'Lucky Stars', 'Golden Treasure', 'Diamond Dreams', 'Royal Riches', 'Magic Multiplier',
      'Sweeps Symphony', 'Fortune Wheel', 'Bonus Bonanza', 'Jackpot Journey', 'Prize Palace'
    ];

    for (let i = 0; i < count; i++) {
      const baseName = gameNames[i % gameNames.length];
      games.push({
        id: `cf-${baseName.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        providerId: 'coinfrazy-proprietary',
        name: `${baseName} ${i > 9 ? 'Pro' : ''}`,
        category: 'Sweepstakes Slots',
        type: 'slot',
        description: `Exclusive CoinFrazy sweepstakes slot with social features`,
        thumbnailUrl: `/games/coinfrazy/${baseName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        rtp: 95.5 + Math.random() * 1,
        volatility: ['medium', 'high'][Math.floor(Math.random() * 2)] as any,
        maxWin: 5000 + Math.floor(Math.random() * 15000),
        minBet: { GC: 20 + Math.floor(Math.random() * 30), SC: 0.20 + Math.random() * 0.30 },
        maxBet: { GC: 12500, SC: 125 },
        features: ['Social Sharing', 'Daily Challenges', 'Friend Bonuses', 'Exclusive Features'],
        releaseDate: new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        isPopular: Math.random() > 0.6,
        isFeatured: Math.random() > 0.7,
        isNew: Math.random() > 0.5,
        playCount: Math.floor(Math.random() * 50000),
        rating: 4.5 + Math.random() * 0.5,
        tags: ['exclusive', 'sweepstakes', 'social', 'coinfrazy'],
        gameUrl: `/games/proprietary/${baseName.toLowerCase().replace(/\s+/g, '-')}`,
        mobileOptimized: true,
        hasDemo: true,
        jurisdiction: ['US', 'CA'],
        languages: ['en']
      });
    }

    return games;
  }

  private generateEvolutionGames(count: number): ProviderGame[] {
    const games: ProviderGame[] = [];
    const gameNames = [
      'Lightning Roulette', 'Dream Catcher', 'Crazy Time', 'Monopoly Live', 'Deal or No Deal',
      'Power Blackjack', 'Speed Baccarat', 'Caribbean Stud', 'Three Card Poker', 'Ultimate Texas'
    ];

    for (let i = 0; i < count; i++) {
      const baseName = gameNames[i % gameNames.length];
      games.push({
        id: `ev-${baseName.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        providerId: 'evolution-live',
        name: `${baseName} ${i > 9 ? 'VIP' : ''}`,
        category: 'Live Casino',
        type: 'live',
        description: `Premium live dealer experience from Evolution Gaming`,
        thumbnailUrl: `/games/evolution/${baseName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        rtp: 97.0 + Math.random() * 2,
        volatility: 'low' as any,
        maxWin: 100000 + Math.floor(Math.random() * 900000),
        minBet: { GC: 50 + Math.floor(Math.random() * 100), SC: 0.50 + Math.random() * 1.00 },
        maxBet: { GC: 250000 + Math.floor(Math.random() * 250000), SC: 2500 + Math.floor(Math.random() * 2500) },
        features: ['Live Dealer', 'HD Streaming', 'Multi-Camera', 'Interactive Chat'],
        releaseDate: new Date(2019 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        isPopular: Math.random() > 0.7,
        isFeatured: Math.random() > 0.8,
        isNew: Math.random() > 0.9,
        playCount: Math.floor(Math.random() * 100000),
        rating: 4.6 + Math.random() * 0.4,
        tags: ['live', 'evolution', 'premium', 'dealer'],
        gameUrl: `https://games.evolution.com/${baseName.toLowerCase().replace(/\s+/g, '-')}`,
        mobileOptimized: true,
        hasDemo: false,
        jurisdiction: ['US', 'CA'],
        languages: ['en']
      });
    }

    return games;
  }

  private startStatsTracking() {
    // Update provider statistics every 30 seconds
    setInterval(() => {
      this.updateProviderStats();
    }, 30000);
  }

  private updateProviderStats() {
    this.providers.forEach((provider, providerId) => {
      const games = this.gamesByProvider.get(providerId) || [];
      const stats: ProviderStats = {
        providerId,
        totalGames: games.length,
        totalSessions: Math.floor(Math.random() * 10000),
        totalBets: Math.floor(Math.random() * 1000000),
        totalWins: Math.floor(Math.random() * 800000),
        totalPlayers: Math.floor(Math.random() * 5000),
        popularGames: games.filter(g => g.isPopular).slice(0, 10),
        revenue24h: Math.floor(Math.random() * 100000),
        revenue7d: Math.floor(Math.random() * 500000),
        revenue30d: Math.floor(Math.random() * 2000000),
        averageRTP: provider.rtp
      };
      this.gameStats.set(providerId, stats);
    });
  }

  // Public API methods
  getAllProviders(): GameProvider[] {
    return Array.from(this.providers.values());
  }

  getActiveProviders(): GameProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isActive);
  }

  getProvider(id: string): GameProvider | undefined {
    return this.providers.get(id);
  }

  getGamesByProvider(providerId: string): ProviderGame[] {
    return this.gamesByProvider.get(providerId) || [];
  }

  getAllGames(): ProviderGame[] {
    return Array.from(this.games.values());
  }

  getGame(id: string): ProviderGame | undefined {
    return this.games.get(id);
  }

  getGamesByCategory(category: string): ProviderGame[] {
    return Array.from(this.games.values()).filter(g => g.category === category);
  }

  getGamesByType(type: string): ProviderGame[] {
    return Array.from(this.games.values()).filter(g => g.type === type);
  }

  getPopularGames(limit: number = 20): ProviderGame[] {
    return Array.from(this.games.values())
      .filter(g => g.isPopular)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  getFeaturedGames(limit: number = 10): ProviderGame[] {
    return Array.from(this.games.values())
      .filter(g => g.isFeatured)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  getNewGames(limit: number = 15): ProviderGame[] {
    return Array.from(this.games.values())
      .filter(g => g.isNew)
      .sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime())
      .slice(0, limit);
  }

  searchGames(query: string): ProviderGame[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.games.values()).filter(game =>
      game.name.toLowerCase().includes(searchTerm) ||
      game.description.toLowerCase().includes(searchTerm) ||
      game.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  getProviderStats(providerId: string): ProviderStats | undefined {
    return this.gameStats.get(providerId);
  }

  // Game session management
  async createGameSession(userId: string, gameId: string, currency: CurrencyType): Promise<GameSession> {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const provider = this.getProvider(game.providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    if (!provider.supportedCurrencies.includes(currency)) {
      throw new Error(`Currency ${currency} not supported by provider ${provider.displayName}`);
    }

    const session: GameSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      gameId,
      providerId: game.providerId,
      currency,
      startTime: new Date(),
      totalBet: 0,
      totalWin: 0,
      netResult: 0,
      sessionToken: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameUrl: await this.generateGameUrl(game, userId, currency),
      isActive: true,
      metadata: {
        playerIp: '127.0.0.1', // In production, get real IP
        userAgent: navigator.userAgent,
        sessionStart: new Date().toISOString()
      }
    };

    this.activeSessions.set(session.id, session);
    return session;
  }

  async generateGameUrl(game: ProviderGame, userId: string, currency: CurrencyType): Promise<string> {
    const provider = this.getProvider(game.providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    const baseUrl = game.gameUrl;
    const sessionToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add parameters for different integration types
    switch (provider.integrationType) {
      case 'iframe':
        return `${baseUrl}?currency=${currency}&userId=${userId}&token=${sessionToken}&mode=real`;
      case 'sdk':
        return `${baseUrl}?sdk=true&currency=${currency}&userId=${userId}&token=${sessionToken}`;
      case 'proprietary':
        return `/games/proprietary/${game.id}?currency=${currency}&userId=${userId}&token=${sessionToken}`;
      default:
        return baseUrl;
    }
  }

  getActiveSession(sessionId: string): GameSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  async endGameSession(sessionId: string): Promise<GameSession | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return null;
    }

    session.endTime = new Date();
    session.isActive = false;
    this.activeSessions.delete(sessionId);

    return session;
  }
}

export const gameProviderService = GameProviderService.getInstance();
