export interface SeasonalTheme {
  id: string;
  name: string;
  active: boolean;
  startDate: string;
  endDate: string;
  backgroundColor: string;
  accentColor: string;
  description: string;
  gameBoosts: {
    experienceMultiplier: number;
    bonusChance: number;
    jackpotMultiplier: number;
  };
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  gameId?: string;
  target: number;
  progress: number;
  reward: {
    type: 'GC' | 'SC' | 'free_spins';
    amount: number;
  };
  expiresAt: Date;
  completed: boolean;
}

export interface SlotAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'wins' | 'spins' | 'jackpots' | 'games' | 'streaks';
  requirement: number;
  progress: number;
  reward: {
    type: 'GC' | 'SC' | 'badge' | 'title';
    amount?: number;
    title?: string;
  };
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Current seasonal themes
export const SEASONAL_THEMES: SeasonalTheme[] = [
  {
    id: 'winter-wonderland',
    name: 'Winter Wonderland',
    active: true,
    startDate: '2024-12-01',
    endDate: '2024-02-28',
    backgroundColor: 'from-blue-900 to-indigo-900',
    accentColor: 'text-blue-300',
    description: 'Magical winter theme with festive bonuses',
    gameBoosts: {
      experienceMultiplier: 1.25,
      bonusChance: 1.15,
      jackpotMultiplier: 1.1
    }
  },
  {
    id: 'spring-bloom',
    name: 'Spring Bloom',
    active: false,
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    backgroundColor: 'from-green-900 to-emerald-900',
    accentColor: 'text-green-300',
    description: 'Fresh spring theme with blooming rewards',
    gameBoosts: {
      experienceMultiplier: 1.2,
      bonusChance: 1.1,
      jackpotMultiplier: 1.05
    }
  }
];

// Daily challenges
export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'daily-spins',
    title: 'Daily Spinner',
    description: 'Complete 50 spins on any slot machine',
    target: 50,
    progress: 0,
    reward: { type: 'GC', amount: 5000 },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false
  },
  {
    id: 'jackpot-hunter',
    title: 'Jackpot Hunter',
    description: 'Play 3 different jackpot games',
    target: 3,
    progress: 0,
    reward: { type: 'SC', amount: 5 },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false
  },
  {
    id: 'high-roller',
    title: 'High Roller',
    description: 'Win more than 1000 coins in a single spin',
    target: 1,
    progress: 0,
    reward: { type: 'free_spins', amount: 10 },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false
  }
];

// Slot achievements
export const SLOT_ACHIEVEMENTS: SlotAchievement[] = [
  {
    id: 'first-spin',
    title: 'First Spin',
    description: 'Complete your first slot spin',
    icon: '🎰',
    category: 'spins',
    requirement: 1,
    progress: 0,
    reward: { type: 'GC', amount: 1000 },
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'century-spinner',
    title: 'Century Spinner',
    description: 'Complete 100 slot spins',
    icon: '💯',
    category: 'spins',
    requirement: 100,
    progress: 0,
    reward: { type: 'GC', amount: 10000 },
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'jackpot-winner',
    title: 'Jackpot Winner',
    description: 'Win your first jackpot',
    icon: '💰',
    category: 'jackpots',
    requirement: 1,
    progress: 0,
    reward: { type: 'SC', amount: 25 },
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'slots-master',
    title: 'Slots Master',
    description: 'Play all 25 slot games',
    icon: '👑',
    category: 'games',
    requirement: 25,
    progress: 0,
    reward: { type: 'title', title: 'Slots Master' },
    unlocked: false,
    rarity: 'legendary'
  },
  {
    id: 'lucky-streak',
    title: 'Lucky Streak',
    description: 'Win 10 spins in a row',
    icon: '🔥',
    category: 'streaks',
    requirement: 10,
    progress: 0,
    reward: { type: 'SC', amount: 50 },
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'mega-winner',
    title: 'Mega Winner',
    description: 'Win more than 100,000 coins total',
    icon: '💎',
    category: 'wins',
    requirement: 100000,
    progress: 0,
    reward: { type: 'SC', amount: 100 },
    unlocked: false,
    rarity: 'legendary'
  }
];

export interface SlotLeaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category: 'biggest_win' | 'total_wins' | 'most_spins' | 'jackpots_won';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  value: number;
  change: number; // Position change from last update
  badge?: string;
}

// Sample leaderboard data
export const SLOT_LEADERBOARDS: SlotLeaderboard[] = [
  {
    period: 'daily',
    category: 'biggest_win',
    lastUpdated: new Date(),
    entries: [
      { rank: 1, userId: '1', username: 'SlotMaster2024', value: 25000, change: 0, badge: '👑' },
      { rank: 2, userId: '2', username: 'LuckySpinner', value: 18500, change: 1, badge: '🥈' },
      { rank: 3, userId: '3', username: 'JackpotHunter', value: 15200, change: -1, badge: '🥉' },
      { rank: 4, userId: '4', username: 'CoinCollector', value: 12800, change: 2 },
      { rank: 5, userId: '5', username: 'SpinKing', value: 11500, change: 0 }
    ]
  },
  {
    period: 'weekly',
    category: 'total_wins',
    lastUpdated: new Date(),
    entries: [
      { rank: 1, userId: '2', username: 'LuckySpinner', value: 125000, change: 0, badge: '🏆' },
      { rank: 2, userId: '1', username: 'SlotMaster2024', value: 98500, change: 1, badge: '🥈' },
      { rank: 3, userId: '5', username: 'SpinKing', value: 87200, change: -1, badge: '🥉' },
      { rank: 4, userId: '3', username: 'JackpotHunter', value: 76800, change: 1 },
      { rank: 5, userId: '4', username: 'CoinCollector', value: 65500, change: -1 }
    ]
  }
];

// Tournament system
export interface SlotTournament {
  id: string;
  name: string;
  description: string;
  gameId?: string; // Specific game or all games
  startTime: Date;
  endTime: Date;
  entryFee: {
    type: 'GC' | 'SC' | 'free';
    amount: number;
  };
  prizes: TournamentPrize[];
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'active' | 'ended';
  leaderboard: LeaderboardEntry[];
}

export interface TournamentPrize {
  position: number;
  type: 'GC' | 'SC' | 'cash' | 'item';
  amount: number;
  description: string;
}

// Active tournaments
export const ACTIVE_TOURNAMENTS: SlotTournament[] = [
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Compete for the biggest win over the weekend',
    startTime: new Date('2024-12-21T00:00:00'),
    endTime: new Date('2024-12-23T23:59:59'),
    entryFee: { type: 'GC', amount: 1000 },
    prizes: [
      { position: 1, type: 'SC', amount: 500, description: '1st Place: 500 SC' },
      { position: 2, type: 'SC', amount: 250, description: '2nd Place: 250 SC' },
      { position: 3, type: 'SC', amount: 100, description: '3rd Place: 100 SC' },
      { position: 10, type: 'GC', amount: 50000, description: 'Top 10: 50K GC' }
    ],
    participants: 847,
    maxParticipants: 1000,
    status: 'active',
    leaderboard: []
  },
  {
    id: 'jackpot-madness',
    name: 'Jackpot Madness',
    description: 'Most jackpots won in 24 hours',
    startTime: new Date(Date.now()),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    entryFee: { type: 'free', amount: 0 },
    prizes: [
      { position: 1, type: 'cash', amount: 1000, description: '1st Place: $1,000 Cash' },
      { position: 2, type: 'cash', amount: 500, description: '2nd Place: $500 Cash' },
      { position: 3, type: 'cash', amount: 250, description: '3rd Place: $250 Cash' }
    ],
    participants: 234,
    maxParticipants: 500,
    status: 'active',
    leaderboard: []
  }
];

export class SlotsThemeService {
  private static instance: SlotsThemeService;
  private currentTheme: SeasonalTheme | null = null;
  private userChallenges: Map<string, DailyChallenge[]> = new Map();
  private userAchievements: Map<string, SlotAchievement[]> = new Map();

  static getInstance(): SlotsThemeService {
    if (!SlotsThemeService.instance) {
      SlotsThemeService.instance = new SlotsThemeService();
    }
    return SlotsThemeService.instance;
  }

  constructor() {
    this.loadCurrentTheme();
  }

  private loadCurrentTheme() {
    const now = new Date().toISOString();
    this.currentTheme = SEASONAL_THEMES.find(theme => 
      theme.active && theme.startDate <= now && theme.endDate >= now
    ) || null;
  }

  getCurrentTheme(): SeasonalTheme | null {
    return this.currentTheme;
  }

  getUserChallenges(userId: string): DailyChallenge[] {
    if (!this.userChallenges.has(userId)) {
      this.userChallenges.set(userId, [...DAILY_CHALLENGES]);
    }
    return this.userChallenges.get(userId) || [];
  }

  getUserAchievements(userId: string): SlotAchievement[] {
    if (!this.userAchievements.has(userId)) {
      this.userAchievements.set(userId, [...SLOT_ACHIEVEMENTS]);
    }
    return this.userAchievements.get(userId) || [];
  }

  updateChallengeProgress(userId: string, challengeId: string, progress: number) {
    const challenges = this.getUserChallenges(userId);
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      challenge.progress = Math.min(progress, challenge.target);
      challenge.completed = challenge.progress >= challenge.target;
    }
  }

  updateAchievementProgress(userId: string, achievementId: string, progress: number) {
    const achievements = this.getUserAchievements(userId);
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      achievement.progress = Math.min(progress, achievement.requirement);
      achievement.unlocked = achievement.progress >= achievement.requirement;
    }
  }

  getActiveThemeBoosts(): { experienceMultiplier: number; bonusChance: number; jackpotMultiplier: number } {
    return this.currentTheme?.gameBoosts || {
      experienceMultiplier: 1,
      bonusChance: 1,
      jackpotMultiplier: 1
    };
  }
}

export const slotsThemeService = SlotsThemeService.getInstance();
export default slotsThemeService;
