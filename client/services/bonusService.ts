export interface BonusConfig {
  id: string;
  type: 'welcome' | 'deposit' | 'reload' | 'daily' | 'weekly' | 'vip';
  name: string;
  description: string;
  isActive: boolean;
  gcAmount?: number;
  scAmount?: number;
  matchPercentage?: number;
  maxAmount?: number;
  minDeposit?: number;
  cooldownHours?: number;
  requirements: {
    minLevel?: number;
    maxUses?: number;
    expiryDays?: number;
    wagering?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBonus {
  id: string;
  userId: string;
  bonusId: string;
  bonusType: string;
  gcAwarded: number;
  scAwarded: number;
  status: 'pending' | 'active' | 'completed' | 'expired' | 'forfeited';
  awardedAt: Date;
  expiresAt?: Date;
  wageringRequired: number;
  wageringCompleted: number;
  completedAt?: Date;
}

export interface BonusStats {
  totalAwarded: number;
  activeUsers: number;
  completionRate: number;
  totalGCAwarded: number;
  totalSCAwarded: number;
  conversionRate: number;
}

class BonusService {
  private static instance: BonusService;
  private bonuses: Map<string, BonusConfig> = new Map();
  private userBonuses: Map<string, UserBonus[]> = new Map();

  static getInstance(): BonusService {
    if (!BonusService.instance) {
      BonusService.instance = new BonusService();
    }
    return BonusService.instance;
  }

  constructor() {
    this.initializeDefaultBonuses();
  }

  private initializeDefaultBonuses() {
    // Welcome Bonus - 10 GC + 10 SC
    this.createBonus({
      id: 'welcome-bonus-001',
      type: 'welcome',
      name: 'Welcome Bonus',
      description: 'Get 10 Gold Coins + 10 Sweeps Coins when you sign up!',
      isActive: true,
      gcAmount: 10,
      scAmount: 10,
      requirements: {
        maxUses: 1,
        expiryDays: 30,
        wagering: 1
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // First Deposit Bonus - 100% match up to $100
    this.createBonus({
      id: 'first-deposit-bonus-001',
      type: 'deposit',
      name: 'First Deposit Bonus',
      description: '100% match up to $100 on your first deposit!',
      isActive: true,
      matchPercentage: 100,
      maxAmount: 100,
      minDeposit: 10,
      requirements: {
        maxUses: 1,
        expiryDays: 30,
        wagering: 10
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Daily Login Bonus
    this.createBonus({
      id: 'daily-login-bonus-001',
      type: 'daily',
      name: 'Daily Login Bonus',
      description: 'Get free coins every day you log in!',
      isActive: true,
      gcAmount: 1000,
      scAmount: 1,
      cooldownHours: 24,
      requirements: {
        expiryDays: 1,
        wagering: 1
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  createBonus(bonus: Omit<BonusConfig, 'id'> & { id?: string }): string {
    const id = bonus.id || `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullBonus: BonusConfig = {
      ...bonus,
      id,
      createdAt: bonus.createdAt || new Date(),
      updatedAt: new Date()
    };
    this.bonuses.set(id, fullBonus);
    return id;
  }

  updateBonus(id: string, updates: Partial<BonusConfig>): boolean {
    const bonus = this.bonuses.get(id);
    if (!bonus) return false;

    const updatedBonus = {
      ...bonus,
      ...updates,
      updatedAt: new Date()
    };
    this.bonuses.set(id, updatedBonus);
    return true;
  }

  deleteBonus(id: string): boolean {
    return this.bonuses.delete(id);
  }

  getBonus(id: string): BonusConfig | undefined {
    return this.bonuses.get(id);
  }

  getAllBonuses(): BonusConfig[] {
    return Array.from(this.bonuses.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  getBonusesByType(type: BonusConfig['type']): BonusConfig[] {
    return this.getAllBonuses().filter(bonus => bonus.type === type);
  }

  getActiveBonuses(): BonusConfig[] {
    return this.getAllBonuses().filter(bonus => bonus.isActive);
  }

  async awardBonus(userId: string, bonusId: string): Promise<UserBonus | null> {
    const bonus = this.getBonus(bonusId);
    if (!bonus || !bonus.isActive) return null;

    // Check if user already has this bonus (for max uses)
    const userBonusList = this.userBonuses.get(userId) || [];
    const existingCount = userBonusList.filter(ub => ub.bonusId === bonusId).length;
    
    if (bonus.requirements.maxUses && existingCount >= bonus.requirements.maxUses) {
      return null;
    }

    const userBonus: UserBonus = {
      id: `user-bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      bonusId,
      bonusType: bonus.type,
      gcAwarded: bonus.gcAmount || 0,
      scAwarded: bonus.scAmount || 0,
      status: 'active',
      awardedAt: new Date(),
      expiresAt: bonus.requirements.expiryDays ? 
        new Date(Date.now() + bonus.requirements.expiryDays * 24 * 60 * 60 * 1000) : 
        undefined,
      wageringRequired: (bonus.gcAmount || 0) * (bonus.requirements.wagering || 1),
      wageringCompleted: 0
    };

    if (!this.userBonuses.has(userId)) {
      this.userBonuses.set(userId, []);
    }
    this.userBonuses.get(userId)!.push(userBonus);

    return userBonus;
  }

  getUserBonuses(userId: string): UserBonus[] {
    return this.userBonuses.get(userId) || [];
  }

  getActiveBonusesForUser(userId: string): UserBonus[] {
    return this.getUserBonuses(userId).filter(ub => 
      ub.status === 'active' && 
      (!ub.expiresAt || ub.expiresAt > new Date())
    );
  }

  updateWagering(userId: string, userBonusId: string, amount: number): boolean {
    const userBonusList = this.userBonuses.get(userId);
    if (!userBonusList) return false;

    const userBonus = userBonusList.find(ub => ub.id === userBonusId);
    if (!userBonus || userBonus.status !== 'active') return false;

    userBonus.wageringCompleted += amount;
    
    if (userBonus.wageringCompleted >= userBonus.wageringRequired) {
      userBonus.status = 'completed';
      userBonus.completedAt = new Date();
    }

    return true;
  }

  getBonusStats(bonusId?: string): BonusStats {
    let relevantBonuses: UserBonus[] = [];
    
    if (bonusId) {
      for (const userBonusList of this.userBonuses.values()) {
        relevantBonuses.push(...userBonusList.filter(ub => ub.bonusId === bonusId));
      }
    } else {
      for (const userBonusList of this.userBonuses.values()) {
        relevantBonuses.push(...userBonusList);
      }
    }

    const totalAwarded = relevantBonuses.length;
    const activeUsers = new Set(relevantBonuses.map(ub => ub.userId)).size;
    const completedBonuses = relevantBonuses.filter(ub => ub.status === 'completed').length;
    const completionRate = totalAwarded > 0 ? (completedBonuses / totalAwarded) * 100 : 0;
    
    const totalGCAwarded = relevantBonuses.reduce((sum, ub) => sum + ub.gcAwarded, 0);
    const totalSCAwarded = relevantBonuses.reduce((sum, ub) => sum + ub.scAwarded, 0);
    
    const conversionRate = activeUsers > 0 ? (completedBonuses / activeUsers) * 100 : 0;

    return {
      totalAwarded,
      activeUsers,
      completionRate,
      totalGCAwarded,
      totalSCAwarded,
      conversionRate
    };
  }

  expireOldBonuses(): number {
    let expiredCount = 0;
    const now = new Date();

    for (const userBonusList of this.userBonuses.values()) {
      for (const userBonus of userBonusList) {
        if (userBonus.status === 'active' && 
            userBonus.expiresAt && 
            userBonus.expiresAt <= now) {
          userBonus.status = 'expired';
          expiredCount++;
        }
      }
    }

    return expiredCount;
  }

  // Real-time bonus validation
  canClaimBonus(userId: string, bonusId: string): { canClaim: boolean; reason?: string } {
    const bonus = this.getBonus(bonusId);
    if (!bonus) return { canClaim: false, reason: 'Bonus not found' };
    if (!bonus.isActive) return { canClaim: false, reason: 'Bonus is not active' };

    const userBonuses = this.getUserBonuses(userId);
    const bonusUsageCount = userBonuses.filter(ub => ub.bonusId === bonusId).length;

    if (bonus.requirements.maxUses && bonusUsageCount >= bonus.requirements.maxUses) {
      return { canClaim: false, reason: 'Maximum uses exceeded' };
    }

    // Check cooldown for daily/weekly bonuses
    if (bonus.cooldownHours) {
      const lastClaim = userBonuses
        .filter(ub => ub.bonusId === bonusId)
        .sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime())[0];

      if (lastClaim) {
        const cooldownEnd = new Date(lastClaim.awardedAt.getTime() + bonus.cooldownHours * 60 * 60 * 1000);
        if (cooldownEnd > new Date()) {
          return { canClaim: false, reason: `Cooldown active until ${cooldownEnd.toLocaleString()}` };
        }
      }
    }

    return { canClaim: true };
  }
}

export const bonusService = BonusService.getInstance();
