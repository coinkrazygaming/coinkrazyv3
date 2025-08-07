import { walletService, CurrencyType } from './walletService';

export interface SlotSymbol {
  id: string;
  name: string;
  value: number;
  rarity: number; // 1-100, higher is rarer
  isWild?: boolean;
  isScatter?: boolean;
  isBonus?: boolean;
  multiplier?: number;
  animation?: string;
  sound?: string;
}

export interface PaylineConfig {
  id: number;
  pattern: number[][]; // [reel][position] mapping
  isActive: boolean;
}

export interface SlotGameConfig {
  id: string;
  name: string;
  theme: string;
  reels: number;
  rows: number;
  paylines: PaylineConfig[];
  symbols: SlotSymbol[];
  rtp: number; // Return to Player percentage
  volatility: 'low' | 'medium' | 'high';
  minBet: { GC: number; SC: number };
  maxBet: { GC: number; SC: number };
  maxWin: number;
  bonusFeatures: BonusFeature[];
  jackpots?: Jackpot[];
  autoPlayOptions: number[];
  turboMode: boolean;
  mobileOptimized: boolean;
  sounds: GameSounds;
}

export interface BonusFeature {
  id: string;
  type: 'free_spins' | 'bonus_game' | 'multiplier' | 'expanding_wilds' | 'cascading_reels' | 'pick_bonus';
  name: string;
  description: string;
  triggerCondition: TriggerCondition;
  rewards: BonusReward[];
  isActive: boolean;
}

export interface TriggerCondition {
  type: 'symbol_combination' | 'random' | 'consecutive_wins' | 'special_symbol';
  symbols?: string[];
  count?: number;
  probability?: number;
  positions?: number[][];
}

export interface BonusReward {
  type: 'free_spins' | 'multiplier' | 'coin_prize' | 'jackpot_trigger';
  value: number;
  duration?: number; // for temporary effects
  applies_to?: 'next_spin' | 'free_spins' | 'session';
}

export interface Jackpot {
  id: string;
  type: 'progressive' | 'fixed' | 'local';
  name: string;
  currentAmount: number;
  seedAmount: number;
  contributionRate: number; // percentage of each bet
  triggerCondition: TriggerCondition;
  currency: CurrencyType;
}

export interface GameSounds {
  spin: string;
  win: string;
  bigWin: string;
  megaWin: string;
  bonus: string;
  jackpot: string;
  ambient: string;
}

export interface SpinResult {
  reels: string[][];
  paylines: PaylineWin[];
  totalWin: number;
  bonusTriggered?: BonusFeature;
  jackpotWin?: Jackpot;
  freeSpinsAwarded?: number;
  multiplier?: number;
  cascades?: CascadeResult[];
  symbols_destroyed?: number[][];
  isCompleteScreenWin?: boolean;
  winningSymbols?: number[][];
}

export interface PaylineWin {
  paylineId: number;
  symbols: string[];
  count: number;
  multiplier: number;
  payout: number;
  positions: number[][];
  isWild: boolean;
}

export interface CascadeResult {
  iteration: number;
  symbolsRemoved: number[][];
  symbolsAdded: string[][];
  wins: PaylineWin[];
  totalWin: number;
}

export interface GameSession {
  sessionId: string;
  userId: string;
  gameId: string;
  startTime: Date;
  endTime?: Date;
  currency: CurrencyType;
  totalSpins: number;
  totalBet: number;
  totalWin: number;
  netResult: number;
  bonusRounds: number;
  freeSpinsTriggered: number;
  biggestWin: number;
  winningSpins: number;
  losingSpins: number;
  averageBet: number;
  sessionTime: number;
  rtp: number;
  volatilityExperienced: number;
  features_triggered: string[];
}

export interface SlotGameState {
  currentBet: number;
  selectedPaylines: number[];
  autoPlay: {
    isActive: boolean;
    remainingSpins: number;
    stopConditions: {
      maxLoss?: number;
      maxWin?: number;
      bonusTriggered?: boolean;
      freeSpinsTriggered?: boolean;
    };
  };
  bonusState?: {
    type: string;
    spinsRemaining?: number;
    multiplier?: number;
    picksRemaining?: number;
    prizes?: any[];
  };
  jackpotContributions: number;
  quickSpin: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  backgroundMusic: boolean;
}

class SlotGameEngine {
  private gameConfigs: Map<string, SlotGameConfig> = new Map();
  private activeSessions: Map<string, GameSession> = new Map();
  private gameStates: Map<string, SlotGameState> = new Map();
  private jackpotPools: Map<string, number> = new Map();
  private rngSeeds: Map<string, number> = new Map();

  constructor() {
    this.initializeGameConfigs();
    this.loadJackpotPools();
    this.startJackpotUpdates();
  }

  private initializeGameConfigs(): void {
    // CoinKrazy Special - High RTP Progressive Slot
    this.gameConfigs.set('coinfrazy-special', {
      id: 'coinfrazy-special',
      name: 'CoinKrazy Special',
      theme: 'classic_casino',
      reels: 5,
      rows: 3,
      paylines: this.generateStandardPaylines(),
      symbols: this.createCoinKrazySymbols(),
      rtp: 97.2,
      volatility: 'medium',
      minBet: { GC: 5, SC: 0.05 },
      maxBet: { GC: 10000, SC: 100 },
      maxWin: 10000,
      bonusFeatures: this.createCoinKrazyBonusFeatures(),
      jackpots: this.createProgressiveJackpots(),
      autoPlayOptions: [10, 25, 50, 100, 250, 500],
      turboMode: true,
      mobileOptimized: true,
      sounds: this.createGameSounds(),
    });

    // Sweet Bonanza Clone - High Volatility
    this.gameConfigs.set('sweet-bonanza-pro', {
      id: 'sweet-bonanza-pro',
      name: 'Sweet Bonanza Pro',
      theme: 'candy',
      reels: 6,
      rows: 5,
      paylines: this.generateClusterPaylines(),
      symbols: this.createSweetSymbols(),
      rtp: 96.48,
      volatility: 'high',
      minBet: { GC: 10, SC: 0.1 },
      maxBet: { GC: 5000, SC: 50 },
      maxWin: 21100,
      bonusFeatures: this.createSweetBonusFeatures(),
      jackpots: [],
      autoPlayOptions: [10, 25, 50, 100],
      turboMode: true,
      mobileOptimized: true,
      sounds: this.createGameSounds(),
    });

    // Gates of Olympus Clone - Multiplier Heavy
    this.gameConfigs.set('gates-olympus-pro', {
      id: 'gates-olympus-pro',
      name: 'Gates of Olympus Pro',
      theme: 'mythology',
      reels: 6,
      rows: 5,
      paylines: this.generateClusterPaylines(),
      symbols: this.createOlympusSymbols(),
      rtp: 96.5,
      volatility: 'high',
      minBet: { GC: 10, SC: 0.1 },
      maxBet: { GC: 5000, SC: 50 },
      maxWin: 5000,
      bonusFeatures: this.createOlympusBonusFeatures(),
      jackpots: [],
      autoPlayOptions: [10, 25, 50, 100],
      turboMode: true,
      mobileOptimized: true,
      sounds: this.createGameSounds(),
    });

    // Classic 777 - Low Volatility Traditional
    this.gameConfigs.set('classic-777-deluxe', {
      id: 'classic-777-deluxe',
      name: 'Classic 777 Deluxe',
      theme: 'classic',
      reels: 3,
      rows: 3,
      paylines: this.generateClassicPaylines(),
      symbols: this.createClassicSymbols(),
      rtp: 96.8,
      volatility: 'low',
      minBet: { GC: 1, SC: 0.01 },
      maxBet: { GC: 100, SC: 1 },
      maxWin: 1000,
      bonusFeatures: this.createClassicBonusFeatures(),
      jackpots: this.createFixedJackpots(),
      autoPlayOptions: [10, 25, 50],
      turboMode: true,
      mobileOptimized: true,
      sounds: this.createGameSounds(),
    });

    // Megaways Style Game
    this.gameConfigs.set('cosmic-megaways', {
      id: 'cosmic-megaways',
      name: 'Cosmic Megaways',
      theme: 'space',
      reels: 6,
      rows: 7, // Variable with Megaways
      paylines: this.generateMegawaysPaylines(),
      symbols: this.createCosmicSymbols(),
      rtp: 96.1,
      volatility: 'high',
      minBet: { GC: 20, SC: 0.2 },
      maxBet: { GC: 10000, SC: 100 },
      maxWin: 50000,
      bonusFeatures: this.createMegawaysBonusFeatures(),
      jackpots: [],
      autoPlayOptions: [10, 25, 50, 100],
      turboMode: true,
      mobileOptimized: true,
      sounds: this.createGameSounds(),
    });
  }

  private createCoinKrazySymbols(): SlotSymbol[] {
    return [
      { id: '💎', name: 'Diamond', value: 500, rarity: 5, multiplier: 1 },
      { id: '🎰', name: 'Slot Machine', value: 250, rarity: 8 },
      { id: '🍀', name: 'Lucky Clover', value: 100, rarity: 12, isWild: true },
      { id: '⭐', name: 'Star', value: 75, rarity: 15, isScatter: true },
      { id: '🎯', name: 'Target', value: 50, rarity: 20, isBonus: true },
      { id: '🔔', name: 'Bell', value: 40, rarity: 25 },
      { id: '🍒', name: 'Cherry', value: 25, rarity: 30 },
      { id: '🍋', name: 'Lemon', value: 20, rarity: 35 },
      { id: '🍊', name: 'Orange', value: 15, rarity: 40 },
      { id: '🍇', name: 'Grape', value: 10, rarity: 45 },
      { id: 'A', name: 'Ace', value: 8, rarity: 50 },
      { id: 'K', name: 'King', value: 6, rarity: 55 },
      { id: 'Q', name: 'Queen', value: 5, rarity: 60 },
      { id: 'J', name: 'Jack', value: 4, rarity: 65 },
      { id: '10', name: 'Ten', value: 3, rarity: 70 },
      { id: '9', name: 'Nine', value: 2, rarity: 75 },
    ];
  }

  private createSweetSymbols(): SlotSymbol[] {
    return [
      { id: '🍭', name: 'Lollipop', value: 100, rarity: 8, isScatter: true },
      { id: '🍬', name: 'Candy', value: 50, rarity: 12 },
      { id: '🧁', name: 'Cupcake', value: 40, rarity: 15 },
      { id: '🍪', name: 'Cookie', value: 30, rarity: 18 },
      { id: '🎂', name: 'Cake', value: 25, rarity: 20 },
      { id: '🍩', name: 'Donut', value: 20, rarity: 25 },
      { id: '🍰', name: 'Cake Slice', value: 15, rarity: 30 },
      { id: '🧊', name: 'Ice', value: 10, rarity: 35 },
      { id: '🟣', name: 'Purple Gem', value: 8, rarity: 40 },
      { id: '🔵', name: 'Blue Gem', value: 6, rarity: 45 },
      { id: '🟢', name: 'Green Gem', value: 4, rarity: 50 },
      { id: '🟡', name: 'Yellow Gem', value: 3, rarity: 55 },
      { id: '🔴', name: 'Red Gem', value: 2, rarity: 60 },
    ];
  }

  private createOlympusSymbols(): SlotSymbol[] {
    return [
      { id: '⚡', name: 'Zeus Lightning', value: 200, rarity: 5, multiplier: 2 },
      { id: '🏛️', name: 'Temple', value: 100, rarity: 8 },
      { id: '👑', name: 'Crown', value: 75, rarity: 12 },
      { id: '⚖️', name: 'Scales', value: 50, rarity: 15 },
      { id: '🗲', name: 'Thunder', value: 40, rarity: 18, isScatter: true },
      { id: '💍', name: 'Ring', value: 30, rarity: 22 },
      { id: '🏺', name: 'Urn', value: 25, rarity: 25 },
      { id: '🍇', name: 'Grapes', value: 20, rarity: 30 },
      { id: '🟣', name: 'Purple Orb', value: 15, rarity: 35 },
      { id: '🔵', name: 'Blue Orb', value: 12, rarity: 40 },
      { id: '🟢', name: 'Green Orb', value: 10, rarity: 45 },
      { id: '🟡', name: 'Yellow Orb', value: 8, rarity: 50 },
      { id: '🔴', name: 'Red Orb', value: 6, rarity: 55 },
    ];
  }

  private createClassicSymbols(): SlotSymbol[] {
    return [
      { id: '7️⃣', name: 'Lucky Seven', value: 777, rarity: 2 },
      { id: '💎', name: 'Diamond', value: 500, rarity: 5 },
      { id: '⭐', name: 'Star', value: 250, rarity: 8 },
      { id: '🔔', name: 'Bell', value: 100, rarity: 12 },
      { id: '🍒', name: 'Cherry', value: 50, rarity: 20 },
      { id: '🍋', name: 'Lemon', value: 30, rarity: 25 },
      { id: '🍊', name: 'Orange', value: 20, rarity: 30 },
      { id: '🍇', name: 'Grape', value: 15, rarity: 35 },
      { id: 'BAR', name: 'Bar', value: 10, rarity: 40 },
    ];
  }

  private createCosmicSymbols(): SlotSymbol[] {
    return [
      { id: '🚀', name: 'Rocket', value: 1000, rarity: 3, isWild: true },
      { id: '🛸', name: 'UFO', value: 500, rarity: 6, isScatter: true },
      { id: '🌌', name: 'Galaxy', value: 300, rarity: 8 },
      { id: '⭐', name: 'Star', value: 200, rarity: 12 },
      { id: '🌟', name: 'Bright Star', value: 150, rarity: 15 },
      { id: '🪐', name: 'Saturn', value: 100, rarity: 18 },
      { id: '🌙', name: 'Moon', value: 75, rarity: 22 },
      { id: '☄️', name: 'Comet', value: 50, rarity: 25 },
      { id: '🔮', name: 'Crystal', value: 40, rarity: 30 },
      { id: '💫', name: 'Shooting Star', value: 30, rarity: 35 },
      { id: 'A', name: 'Ace', value: 20, rarity: 40 },
      { id: 'K', name: 'King', value: 15, rarity: 45 },
      { id: 'Q', name: 'Queen', value: 12, rarity: 50 },
      { id: 'J', name: 'Jack', value: 10, rarity: 55 },
    ];
  }

  private generateStandardPaylines(): PaylineConfig[] {
    const paylines: PaylineConfig[] = [];
    // Standard 5x3 slot paylines
    const patterns = [
      [[1,1,1,1,1]], // Middle row
      [[0,0,0,0,0]], // Top row
      [[2,2,2,2,2]], // Bottom row
      [[0,1,2,1,0]], // V shape
      [[2,1,0,1,2]], // Inverse V
      [[0,0,1,2,2]], // Ascending
      [[2,2,1,0,0]], // Descending
      [[1,0,1,2,1]], // W shape
      [[1,2,1,0,1]], // M shape
      [[0,1,0,1,0]], // Zigzag top
    ];

    patterns.forEach((pattern, index) => {
      paylines.push({
        id: index + 1,
        pattern: pattern.map(row => row),
        isActive: true
      });
    });

    return paylines;
  }

  private generateClusterPaylines(): PaylineConfig[] {
    // For cluster pays games like Sweet Bonanza
    return [{
      id: 1,
      pattern: [], // Cluster pays don't use traditional paylines
      isActive: true
    }];
  }

  private generateClassicPaylines(): PaylineConfig[] {
    // Simple 3x3 paylines
    return [
      { id: 1, pattern: [[1,1,1]], isActive: true }, // Middle
      { id: 2, pattern: [[0,0,0]], isActive: true }, // Top
      { id: 3, pattern: [[2,2,2]], isActive: true }, // Bottom
      { id: 4, pattern: [[0,1,2]], isActive: true }, // Diagonal
      { id: 5, pattern: [[2,1,0]], isActive: true }, // Diagonal
    ];
  }

  private generateMegawaysPaylines(): PaylineConfig[] {
    // Megaways can have up to 117,649 ways to win
    return [{
      id: 1,
      pattern: [], // Megaways uses adjacent symbol matching
      isActive: true
    }];
  }

  private createCoinKrazyBonusFeatures(): BonusFeature[] {
    return [
      {
        id: 'free-spins',
        type: 'free_spins',
        name: 'Lucky Free Spins',
        description: 'Get 10-25 free spins with multipliers up to 5x',
        triggerCondition: {
          type: 'symbol_combination',
          symbols: ['⭐'],
          count: 3,
        },
        rewards: [
          { type: 'free_spins', value: 15, applies_to: 'free_spins' },
          { type: 'multiplier', value: 3, applies_to: 'free_spins' },
        ],
        isActive: true,
      },
      {
        id: 'coin-bonus',
        type: 'pick_bonus',
        name: 'Coin Collector Bonus',
        description: 'Pick coins to reveal instant prizes',
        triggerCondition: {
          type: 'symbol_combination',
          symbols: ['🎯'],
          count: 3,
        },
        rewards: [
          { type: 'coin_prize', value: 500 },
          { type: 'multiplier', value: 10 },
        ],
        isActive: true,
      },
      {
        id: 'expanding-wilds',
        type: 'expanding_wilds',
        name: 'Lucky Clover Expansion',
        description: 'Wild symbols expand to cover entire reels',
        triggerCondition: {
          type: 'symbol_combination',
          symbols: ['🍀'],
          count: 1,
          probability: 0.25,
        },
        rewards: [
          { type: 'multiplier', value: 2, applies_to: 'next_spin' },
        ],
        isActive: true,
      }
    ];
  }

  private createSweetBonusFeatures(): BonusFeature[] {
    return [
      {
        id: 'tumble-feature',
        type: 'cascading_reels',
        name: 'Tumble Feature',
        description: 'Winning symbols disappear and new ones fall down',
        triggerCondition: {
          type: 'symbol_combination',
          symbols: [], // Triggers on any win
          count: 1,
        },
        rewards: [
          { type: 'free_spins', value: 1, applies_to: 'next_spin' },
        ],
        isActive: true,
      },
      {
        id: 'ante-bet',
        type: 'multiplier',
        name: 'Ante Bet',
        description: 'Double your bet for better bonus chances',
        triggerCondition: {
          type: 'random',
          probability: 1.0, // Always available as option
        },
        rewards: [
          { type: 'multiplier', value: 2, applies_to: 'session' },
        ],
        isActive: true,
      },
      {
        id: 'free-spins-sweet',
        type: 'free_spins',
        name: 'Sweet Free Spins',
        description: 'Get 10 free spins with multiplier bombs',
        triggerCondition: {
          type: 'symbol_combination',
          symbols: ['🍭'],
          count: 4,
        },
        rewards: [
          { type: 'free_spins', value: 10, applies_to: 'free_spins' },
          { type: 'multiplier', value: 5, applies_to: 'free_spins' },
        ],
        isActive: true,
      }
    ];
  }

  private createOlympusBonusFeatures(): BonusFeature[] {
    return [
      {
        id: 'divine-multipliers',
        type: 'multiplier',
        name: 'Divine Multipliers',
        description: 'Random multipliers up to 500x can appear',
        triggerCondition: {
          type: 'random',
          probability: 0.15,
        },
        rewards: [
          { type: 'multiplier', value: 500, applies_to: 'next_spin' },
        ],
        isActive: true,
      },
      {
        id: 'olympus-free-spins',
        type: 'free_spins',
        name: 'Gates of Olympus Free Spins',
        description: '15 free spins with persistent multipliers',
        triggerCondition: {
          type: 'symbol_combination',
          symbols: ['🗲'],
          count: 4,
        },
        rewards: [
          { type: 'free_spins', value: 15, applies_to: 'free_spins' },
          { type: 'multiplier', value: 15, applies_to: 'free_spins' },
        ],
        isActive: true,
      }
    ];
  }

  private createClassicBonusFeatures(): BonusFeature[] {
    return [
      {
        id: 'classic-jackpot',
        type: 'bonus_game',
        name: 'Lucky Seven Jackpot',
        description: 'Three 7s triggers the jackpot',
        triggerCondition: {
          type: 'symbol_combination',
          symbols: ['7️⃣'],
          count: 3,
        },
        rewards: [
          { type: 'jackpot_trigger', value: 1 },
        ],
        isActive: true,
      }
    ];
  }

  private createMegawaysBonusFeatures(): BonusFeature[] {
    return [
      {
        id: 'megaways-multiplier',
        type: 'multiplier',
        name: 'Cosmic Multiplier',
        description: 'Win multiplier increases with each cascade',
        triggerCondition: {
          type: 'consecutive_wins',
          count: 1,
        },
        rewards: [
          { type: 'multiplier', value: 2, applies_to: 'session' },
        ],
        isActive: true,
      },
      {
        id: 'megaways-free-spins',
        type: 'free_spins',
        name: 'Cosmic Free Spins',
        description: 'Unlimited retriggers with increasing multipliers',
        triggerCondition: {
          type: 'symbol_combination',
          symbols: ['🛸'],
          count: 4,
        },
        rewards: [
          { type: 'free_spins', value: 12, applies_to: 'free_spins' },
          { type: 'multiplier', value: 1, applies_to: 'free_spins' },
        ],
        isActive: true,
      }
    ];
  }

  private createProgressiveJackpots(): Jackpot[] {
    return [
      {
        id: 'mega-jackpot',
        type: 'progressive',
        name: 'Mega Jackpot',
        currentAmount: 125847.92,
        seedAmount: 50000,
        contributionRate: 0.01,
        triggerCondition: {
          type: 'symbol_combination',
          symbols: ['💎'],
          count: 5,
        },
        currency: 'SC',
      },
      {
        id: 'major-jackpot',
        type: 'progressive',
        name: 'Major Jackpot',
        currentAmount: 15247.50,
        seedAmount: 5000,
        contributionRate: 0.005,
        triggerCondition: {
          type: 'random',
          probability: 0.0001,
        },
        currency: 'SC',
      },
      {
        id: 'minor-jackpot',
        type: 'progressive',
        name: 'Minor Jackpot',
        currentAmount: 2847.25,
        seedAmount: 1000,
        contributionRate: 0.002,
        triggerCondition: {
          type: 'random',
          probability: 0.001,
        },
        currency: 'SC',
      }
    ];
  }

  private createFixedJackpots(): Jackpot[] {
    return [
      {
        id: 'classic-jackpot',
        type: 'fixed',
        name: 'Classic Jackpot',
        currentAmount: 1000,
        seedAmount: 1000,
        contributionRate: 0,
        triggerCondition: {
          type: 'symbol_combination',
          symbols: ['7️⃣'],
          count: 3,
        },
        currency: 'GC',
      }
    ];
  }

  private createGameSounds(): GameSounds {
    return {
      spin: '/sounds/slot_spin.mp3',
      win: '/sounds/slot_win.mp3',
      bigWin: '/sounds/big_win.mp3',
      megaWin: '/sounds/mega_win.mp3',
      bonus: '/sounds/bonus_trigger.mp3',
      jackpot: '/sounds/jackpot_win.mp3',
      ambient: '/sounds/casino_ambient.mp3',
    };
  }

  private loadJackpotPools(): void {
    // Load jackpot amounts from persistent storage
    this.gameConfigs.forEach((config, gameId) => {
      config.jackpots?.forEach(jackpot => {
        const savedAmount = localStorage.getItem(`jackpot_${jackpot.id}`);
        if (savedAmount) {
          jackpot.currentAmount = parseFloat(savedAmount);
        }
        this.jackpotPools.set(jackpot.id, jackpot.currentAmount);
      });
    });
  }

  private startJackpotUpdates(): void {
    // Update progressive jackpots every 5 seconds
    setInterval(() => {
      this.gameConfigs.forEach(config => {
        config.jackpots?.forEach(jackpot => {
          if (jackpot.type === 'progressive') {
            // Simulate other players contributing
            const contribution = Math.random() * 50 + 10; // $10-60
            jackpot.currentAmount += contribution;
            this.jackpotPools.set(jackpot.id, jackpot.currentAmount);
            localStorage.setItem(`jackpot_${jackpot.id}`, jackpot.currentAmount.toString());
          }
        });
      });
    }, 5000);
  }

  // Public API Methods

  getGameConfig(gameId: string): SlotGameConfig | null {
    return this.gameConfigs.get(gameId) || null;
  }

  getAllGameConfigs(): SlotGameConfig[] {
    return Array.from(this.gameConfigs.values());
  }

  async startGameSession(userId: string, gameId: string, currency: CurrencyType): Promise<GameSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: GameSession = {
      sessionId,
      userId,
      gameId,
      startTime: new Date(),
      currency,
      totalSpins: 0,
      totalBet: 0,
      totalWin: 0,
      netResult: 0,
      bonusRounds: 0,
      freeSpinsTriggered: 0,
      biggestWin: 0,
      winningSpins: 0,
      losingSpins: 0,
      averageBet: 0,
      sessionTime: 0,
      rtp: 0,
      volatilityExperienced: 0,
      features_triggered: [],
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  async spin(
    userId: string, 
    gameId: string, 
    betAmount: number, 
    currency: CurrencyType,
    selectedPaylines?: number[]
  ): Promise<SpinResult> {
    const config = this.gameConfigs.get(gameId);
    if (!config) {
      throw new Error(`Game ${gameId} not found`);
    }

    // Validate bet
    if (betAmount < config.minBet[currency] || betAmount > config.maxBet[currency]) {
      throw new Error(`Invalid bet amount. Must be between ${config.minBet[currency]} and ${config.maxBet[currency]} ${currency}`);
    }

    // Deduct bet from wallet
    await walletService.placeBet(userId, betAmount, currency, gameId, 'slots');

    // Contribute to progressive jackpots
    this.contributeToJackpots(config, betAmount, currency);

    // Generate spin result
    const result = this.generateSpinResult(config, betAmount, selectedPaylines);

    // Process winnings
    if (result.totalWin > 0) {
      await walletService.recordWin(userId, result.totalWin, currency, gameId, 'slots');
    }

    // Update session
    this.updateSession(userId, gameId, betAmount, result.totalWin, result);

    return result;
  }

  private generateSpinResult(
    config: SlotGameConfig, 
    betAmount: number, 
    selectedPaylines?: number[]
  ): SpinResult {
    // Generate reel symbols based on RTP and volatility
    const reels = this.generateReels(config);
    
    // Calculate wins based on game type
    let paylines: PaylineWin[] = [];
    let totalWin = 0;

    if (config.theme === 'candy' || config.theme === 'mythology' || config.theme === 'space') {
      // Cluster pays system
      const clusterWins = this.calculateClusterWins(reels, config.symbols, betAmount);
      paylines = clusterWins.wins;
      totalWin = clusterWins.totalWin;
    } else {
      // Traditional payline system
      const paylineWins = this.calculatePaylineWins(reels, config, betAmount, selectedPaylines);
      paylines = paylineWins;
      totalWin = paylineWins.reduce((sum, win) => sum + win.payout, 0);
    }

    // Check for bonus features
    const bonusTriggered = this.checkBonusFeatures(reels, config, betAmount);
    if (bonusTriggered.triggered) {
      totalWin += bonusTriggered.reward;
    }

    // Check for jackpots
    const jackpotWin = this.checkJackpots(reels, config, betAmount);
    if (jackpotWin) {
      totalWin += jackpotWin.currentAmount;
    }

    // Apply cascading reels if applicable
    let cascades: CascadeResult[] = [];
    if (config.bonusFeatures.some(f => f.type === 'cascading_reels')) {
      cascades = this.processCascades(reels, config, betAmount);
      totalWin += cascades.reduce((sum, cascade) => sum + cascade.totalWin, 0);
    }

    return {
      reels,
      paylines,
      totalWin,
      bonusTriggered: bonusTriggered.triggered ? bonusTriggered.feature : undefined,
      jackpotWin,
      freeSpinsAwarded: bonusTriggered.freeSpins,
      multiplier: bonusTriggered.multiplier,
      cascades,
      isCompleteScreenWin: this.isCompleteScreenWin(reels, config),
      winningSymbols: this.getWinningSymbolPositions(paylines),
    };
  }

  private generateReels(config: SlotGameConfig): string[][] {
    const reels: string[][] = [];
    
    for (let reel = 0; reel < config.reels; reel++) {
      const reelSymbols: string[] = [];
      
      for (let row = 0; row < config.rows; row++) {
        // Weight symbols based on rarity for proper RTP
        const symbol = this.selectWeightedSymbol(config.symbols, config.rtp);
        reelSymbols.push(symbol.id);
      }
      
      reels.push(reelSymbols);
    }
    
    return reels;
  }

  private selectWeightedSymbol(symbols: SlotSymbol[], targetRTP: number): SlotSymbol {
    // Create weighted array based on rarity (inverted - lower rarity = higher weight)
    const weightedSymbols: SlotSymbol[] = [];
    
    symbols.forEach(symbol => {
      const weight = Math.max(1, 101 - symbol.rarity); // Invert rarity to weight
      for (let i = 0; i < weight; i++) {
        weightedSymbols.push(symbol);
      }
    });
    
    // Select random symbol from weighted array
    const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
    return weightedSymbols[randomIndex];
  }

  private calculatePaylineWins(
    reels: string[][], 
    config: SlotGameConfig, 
    betAmount: number,
    selectedPaylines?: number[]
  ): PaylineWin[] {
    const wins: PaylineWin[] = [];
    const activePaylines = selectedPaylines || config.paylines.filter(p => p.isActive).map(p => p.id);
    
    activePaylines.forEach(paylineId => {
      const payline = config.paylines.find(p => p.id === paylineId);
      if (!payline) return;
      
      const paylineSymbols = this.getPaylineSymbols(reels, payline.pattern);
      const win = this.calculatePaylineWin(paylineSymbols, config.symbols, betAmount, paylineId);
      
      if (win.payout > 0) {
        wins.push(win);
      }
    });
    
    return wins;
  }

  private getPaylineSymbols(reels: string[][], pattern: number[][]): string[] {
    const symbols: string[] = [];
    
    if (pattern.length === 0) return symbols; // For cluster pays
    
    pattern[0].forEach((row, reelIndex) => {
      if (reelIndex < reels.length && row < reels[reelIndex].length) {
        symbols.push(reels[reelIndex][row]);
      }
    });
    
    return symbols;
  }

  private calculatePaylineWin(
    symbols: string[], 
    gameSymbols: SlotSymbol[], 
    betAmount: number, 
    paylineId: number
  ): PaylineWin {
    // Find matching symbols from left to right
    let count = 0;
    let matchingSymbol = symbols[0];
    let isWild = false;
    
    // Check for wilds
    const firstSymbol = gameSymbols.find(s => s.id === symbols[0]);
    if (firstSymbol?.isWild) {
      isWild = true;
      // Find the next non-wild symbol as the match
      for (let i = 1; i < symbols.length; i++) {
        const sym = gameSymbols.find(s => s.id === symbols[i]);
        if (!sym?.isWild) {
          matchingSymbol = symbols[i];
          break;
        }
      }
    }
    
    // Count consecutive matching symbols (including wilds)
    for (let i = 0; i < symbols.length; i++) {
      const currentSymbol = gameSymbols.find(s => s.id === symbols[i]);
      if (symbols[i] === matchingSymbol || currentSymbol?.isWild) {
        count++;
      } else {
        break;
      }
    }
    
    // Calculate payout
    let payout = 0;
    if (count >= 3) { // Minimum 3 symbols for win
      const symbolData = gameSymbols.find(s => s.id === matchingSymbol);
      if (symbolData) {
        const baseWin = symbolData.value;
        const multiplier = count === 5 ? 10 : count === 4 ? 5 : 1;
        const wildMultiplier = isWild ? 2 : 1;
        payout = (baseWin * multiplier * wildMultiplier * betAmount) / 100;
      }
    }
    
    return {
      paylineId,
      symbols: symbols.slice(0, count),
      count,
      multiplier: isWild ? 2 : 1,
      payout,
      positions: this.getWinPositions(paylineId, count),
      isWild,
    };
  }

  private calculateClusterWins(
    reels: string[][],
    gameSymbols: SlotSymbol[],
    betAmount: number
  ): { wins: PaylineWin[]; totalWin: number } {
    const wins: PaylineWin[] = [];
    const visited = reels.map(reel => reel.map(() => false));
    let totalWin = 0;
    
    // Find clusters of 8+ matching symbols
    for (let reel = 0; reel < reels.length; reel++) {
      for (let row = 0; row < reels[reel].length; row++) {
        if (!visited[reel][row]) {
          const cluster = this.findCluster(reels, reel, row, reels[reel][row], visited);
          
          if (cluster.length >= 8) { // Minimum cluster size
            const symbolData = gameSymbols.find(s => s.id === reels[reel][row]);
            if (symbolData) {
              const multiplier = this.getClusterMultiplier(cluster.length);
              const payout = (symbolData.value * multiplier * betAmount) / 100;
              
              wins.push({
                paylineId: wins.length + 1,
                symbols: [reels[reel][row]],
                count: cluster.length,
                multiplier,
                payout,
                positions: cluster,
                isWild: symbolData.isWild || false,
              });
              
              totalWin += payout;
            }
          }
        }
      }
    }
    
    return { wins, totalWin };
  }

  private findCluster(
    reels: string[][],
    startReel: number,
    startRow: number,
    targetSymbol: string,
    visited: boolean[][]
  ): number[][] {
    const cluster: number[][] = [];
    const stack: [number, number][] = [[startReel, startRow]];
    
    while (stack.length > 0) {
      const [reel, row] = stack.pop()!;
      
      if (reel < 0 || reel >= reels.length || 
          row < 0 || row >= reels[reel].length || 
          visited[reel][row] || 
          reels[reel][row] !== targetSymbol) {
        continue;
      }
      
      visited[reel][row] = true;
      cluster.push([reel, row]);
      
      // Check adjacent positions
      stack.push([reel + 1, row], [reel - 1, row], [reel, row + 1], [reel, row - 1]);
    }
    
    return cluster;
  }

  private getClusterMultiplier(clusterSize: number): number {
    if (clusterSize >= 15) return 150;
    if (clusterSize >= 12) return 25;
    if (clusterSize >= 10) return 10;
    if (clusterSize >= 8) return 5;
    return 1;
  }

  private checkBonusFeatures(
    reels: string[][],
    config: SlotGameConfig,
    betAmount: number
  ): { triggered: boolean; feature?: BonusFeature; reward: number; freeSpins?: number; multiplier?: number } {
    for (const feature of config.bonusFeatures) {
      if (this.isBonusTriggered(reels, feature.triggerCondition)) {
        const reward = this.calculateBonusReward(feature, betAmount);
        
        return {
          triggered: true,
          feature,
          reward: reward.coinReward,
          freeSpins: reward.freeSpins,
          multiplier: reward.multiplier,
        };
      }
    }
    
    return { triggered: false, reward: 0 };
  }

  private isBonusTriggered(reels: string[][], condition: TriggerCondition): boolean {
    switch (condition.type) {
      case 'symbol_combination':
        return this.countSymbolOccurrences(reels, condition.symbols![0]) >= (condition.count || 3);
      
      case 'random':
        return Math.random() < (condition.probability || 0.05);
      
      default:
        return false;
    }
  }

  private countSymbolOccurrences(reels: string[][], symbol: string): number {
    let count = 0;
    reels.forEach(reel => {
      reel.forEach(sym => {
        if (sym === symbol) count++;
      });
    });
    return count;
  }

  private calculateBonusReward(
    feature: BonusFeature, 
    betAmount: number
  ): { coinReward: number; freeSpins?: number; multiplier?: number } {
    let coinReward = 0;
    let freeSpins = 0;
    let multiplier = 1;
    
    feature.rewards.forEach(reward => {
      switch (reward.type) {
        case 'coin_prize':
          coinReward += reward.value * betAmount;
          break;
        case 'free_spins':
          freeSpins += reward.value;
          break;
        case 'multiplier':
          multiplier = reward.value;
          break;
      }
    });
    
    return { coinReward, freeSpins, multiplier };
  }

  private checkJackpots(
    reels: string[][],
    config: SlotGameConfig,
    betAmount: number
  ): Jackpot | null {
    for (const jackpot of config.jackpots || []) {
      if (this.isJackpotTriggered(reels, jackpot.triggerCondition, betAmount)) {
        // Reset progressive jackpots
        if (jackpot.type === 'progressive') {
          jackpot.currentAmount = jackpot.seedAmount;
          this.jackpotPools.set(jackpot.id, jackpot.seedAmount);
          localStorage.setItem(`jackpot_${jackpot.id}`, jackpot.seedAmount.toString());
        }
        
        return jackpot;
      }
    }
    
    return null;
  }

  private isJackpotTriggered(
    reels: string[][],
    condition: TriggerCondition,
    betAmount: number
  ): boolean {
    if (condition.type === 'random') {
      // Higher bets increase jackpot chances
      const adjustedProbability = (condition.probability || 0.0001) * Math.min(betAmount / 100, 10);
      return Math.random() < adjustedProbability;
    }
    
    if (condition.type === 'symbol_combination') {
      return this.countSymbolOccurrences(reels, condition.symbols![0]) >= (condition.count || 5);
    }
    
    return false;
  }

  private contributeToJackpots(config: SlotGameConfig, betAmount: number, currency: CurrencyType): void {
    config.jackpots?.forEach(jackpot => {
      if (jackpot.type === 'progressive' && jackpot.currency === currency) {
        const contribution = betAmount * jackpot.contributionRate;
        jackpot.currentAmount += contribution;
        this.jackpotPools.set(jackpot.id, jackpot.currentAmount);
        localStorage.setItem(`jackpot_${jackpot.id}`, jackpot.currentAmount.toString());
      }
    });
  }

  private processCascades(
    reels: string[][],
    config: SlotGameConfig,
    betAmount: number
  ): CascadeResult[] {
    const cascades: CascadeResult[] = [];
    let currentReels = reels.map(reel => [...reel]);
    let iteration = 0;
    
    while (true) {
      const wins = config.theme === 'candy' ? 
        this.calculateClusterWins(currentReels, config.symbols, betAmount) :
        { wins: this.calculatePaylineWins(currentReels, config, betAmount), totalWin: 0 };
      
      if (wins.wins.length === 0) break;
      
      // Remove winning symbols
      const symbolsRemoved = this.removeWinningSymbols(currentReels, wins.wins);
      
      // Drop remaining symbols and fill with new ones
      const symbolsAdded = this.fillReelsAfterCascade(currentReels, config.symbols);
      
      cascades.push({
        iteration: iteration++,
        symbolsRemoved,
        symbolsAdded,
        wins: wins.wins,
        totalWin: wins.wins.reduce((sum, win) => sum + win.payout, 0),
      });
      
      if (iteration >= 10) break; // Prevent infinite loops
    }
    
    return cascades;
  }

  private removeWinningSymbols(reels: string[][], wins: PaylineWin[]): number[][] {
    const removed: number[][] = [];
    
    wins.forEach(win => {
      win.positions.forEach(([reel, row]) => {
        if (reels[reel] && reels[reel][row]) {
          reels[reel][row] = ''; // Mark as removed
          removed.push([reel, row]);
        }
      });
    });
    
    return removed;
  }

  private fillReelsAfterCascade(reels: string[][], symbols: SlotSymbol[]): string[][] {
    const added: string[][] = [];
    
    reels.forEach((reel, reelIndex) => {
      // Remove empty symbols and let remaining fall down
      const filteredReel = reel.filter(symbol => symbol !== '');
      
      // Fill from top with new symbols
      while (filteredReel.length < reel.length) {
        const newSymbol = this.selectWeightedSymbol(symbols, 96.5);
        filteredReel.unshift(newSymbol.id);
        added.push([reelIndex, 0]);
      }
      
      reels[reelIndex] = filteredReel;
    });
    
    return added;
  }

  private isCompleteScreenWin(reels: string[][], config: SlotGameConfig): boolean {
    // Check if all symbols on screen are the same (rare mega win)
    const firstSymbol = reels[0][0];
    
    return reels.every(reel => 
      reel.every(symbol => symbol === firstSymbol)
    );
  }

  private getWinningSymbolPositions(paylines: PaylineWin[]): number[][] {
    const positions: number[][] = [];
    
    paylines.forEach(win => {
      positions.push(...win.positions);
    });
    
    return positions;
  }

  private getWinPositions(paylineId: number, count: number): number[][] {
    // Return positions for the winning symbols on this payline
    const positions: number[][] = [];
    
    for (let i = 0; i < count; i++) {
      positions.push([i, paylineId - 1]); // [reel, row]
    }
    
    return positions;
  }

  private updateSession(
    userId: string,
    gameId: string,
    betAmount: number,
    winAmount: number,
    result: SpinResult
  ): void {
    // Find active session
    const session = Array.from(this.activeSessions.values()).find(
      s => s.userId === userId && s.gameId === gameId && !s.endTime
    );
    
    if (session) {
      session.totalSpins++;
      session.totalBet += betAmount;
      session.totalWin += winAmount;
      session.netResult = session.totalWin - session.totalBet;
      session.biggestWin = Math.max(session.biggestWin, winAmount);
      session.averageBet = session.totalBet / session.totalSpins;
      
      if (winAmount > 0) {
        session.winningSpins++;
      } else {
        session.losingSpins++;
      }
      
      if (result.bonusTriggered) {
        session.bonusRounds++;
        session.features_triggered.push(result.bonusTriggered.id);
      }
      
      if (result.freeSpinsAwarded) {
        session.freeSpinsTriggered++;
      }
      
      // Calculate actual RTP
      session.rtp = session.totalBet > 0 ? (session.totalWin / session.totalBet) * 100 : 0;
      
      this.activeSessions.set(session.sessionId, session);
    }
  }

  // Admin/Management Methods

  updateGameConfig(gameId: string, updates: Partial<SlotGameConfig>): boolean {
    const config = this.gameConfigs.get(gameId);
    if (!config) return false;
    
    Object.assign(config, updates);
    this.gameConfigs.set(gameId, config);
    
    // Save to persistent storage
    localStorage.setItem(`game_config_${gameId}`, JSON.stringify(config));
    
    return true;
  }

  createCustomGame(config: SlotGameConfig): boolean {
    if (this.gameConfigs.has(config.id)) {
      return false; // Game already exists
    }
    
    this.gameConfigs.set(config.id, config);
    localStorage.setItem(`game_config_${config.id}`, JSON.stringify(config));
    
    return true;
  }

  getGameStatistics(gameId: string): any {
    const sessions = Array.from(this.activeSessions.values()).filter(s => s.gameId === gameId);
    
    if (sessions.length === 0) return null;
    
    const totalSpins = sessions.reduce((sum, s) => sum + s.totalSpins, 0);
    const totalBets = sessions.reduce((sum, s) => sum + s.totalBet, 0);
    const totalWins = sessions.reduce((sum, s) => sum + s.totalWin, 0);
    
    return {
      totalSessions: sessions.length,
      totalSpins,
      totalBets,
      totalWins,
      actualRTP: totalBets > 0 ? (totalWins / totalBets) * 100 : 0,
      averageSession: totalSpins / sessions.length,
      biggestWin: Math.max(...sessions.map(s => s.biggestWin)),
      popularFeatures: this.getMostTriggeredFeatures(sessions),
    };
  }

  private getMostTriggeredFeatures(sessions: GameSession[]): { [key: string]: number } {
    const features: { [key: string]: number } = {};
    
    sessions.forEach(session => {
      session.features_triggered.forEach(feature => {
        features[feature] = (features[feature] || 0) + 1;
      });
    });
    
    return features;
  }

  getJackpotStatus(): { [key: string]: number } {
    return Object.fromEntries(this.jackpotPools.entries());
  }

  endSession(sessionId: string): GameSession | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    
    session.endTime = new Date();
    session.sessionTime = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
    
    this.activeSessions.set(sessionId, session);
    return session;
  }
}

export const slotGameEngine = new SlotGameEngine();
