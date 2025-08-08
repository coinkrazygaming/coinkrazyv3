import { databaseService } from "./database";

export interface Bonus {
  id: number;
  user_id: number;
  bonus_type:
    | "welcome"
    | "daily"
    | "deposit"
    | "loyalty"
    | "referral"
    | "social"
    | "vip"
    | "wheel"
    | "birthday";
  gold_coins: number;
  sweeps_coins: number;
  description: string;
  requirements?: string;
  expires_at?: string;
  claimed_at?: string;
  status: "available" | "claimed" | "expired" | "locked";
  created_at: string;
}

export interface BonusProgress {
  type: string;
  current: number;
  required: number;
  percentage: number;
  reward: {
    gc: number;
    sc: number;
  };
  next_claim?: string;
}

export interface VIPTier {
  level: number;
  name: string;
  required_points: number;
  monthly_bonus_gc: number;
  monthly_bonus_sc: number;
  daily_bonus_multiplier: number;
  cashback_percentage: number;
  perks: string[];
  color: string;
}

export const VIP_TIERS: VIPTier[] = [
  {
    level: 0,
    name: "Bronze",
    required_points: 0,
    monthly_bonus_gc: 0,
    monthly_bonus_sc: 0,
    daily_bonus_multiplier: 1,
    cashback_percentage: 0,
    perks: ["Access to all games", "24/7 support"],
    color: "text-amber-600",
  },
  {
    level: 1,
    name: "Silver",
    required_points: 1000,
    monthly_bonus_gc: 50000,
    monthly_bonus_sc: 50,
    daily_bonus_multiplier: 1.2,
    cashback_percentage: 1,
    perks: [
      "Priority support",
      "Exclusive tournaments",
      "Higher daily bonuses",
    ],
    color: "text-gray-400",
  },
  {
    level: 2,
    name: "Gold",
    required_points: 5000,
    monthly_bonus_gc: 150000,
    monthly_bonus_sc: 150,
    daily_bonus_multiplier: 1.5,
    cashback_percentage: 2,
    perks: [
      "VIP support line",
      "Exclusive games",
      "Birthday bonus",
      "Weekly cashback",
    ],
    color: "text-gold-500",
  },
  {
    level: 3,
    name: "Platinum",
    required_points: 15000,
    monthly_bonus_gc: 350000,
    monthly_bonus_sc: 350,
    daily_bonus_multiplier: 2,
    cashback_percentage: 3,
    perks: [
      "Personal account manager",
      "Luxury gifts",
      "Custom bonuses",
      "Instant withdrawals",
    ],
    color: "text-purple-400",
  },
  {
    level: 4,
    name: "Diamond",
    required_points: 50000,
    monthly_bonus_gc: 750000,
    monthly_bonus_sc: 750,
    daily_bonus_multiplier: 3,
    cashback_percentage: 5,
    perks: [
      "Ultra VIP treatment",
      "Exclusive events",
      "Maximum bonuses",
      "White-glove service",
    ],
    color: "text-blue-400",
  },
];

class BonusService {
  private static instance: BonusService;

  static getInstance(): BonusService {
    if (!BonusService.instance) {
      BonusService.instance = new BonusService();
    }
    return BonusService.instance;
  }

  async claimWelcomeBonus(
    userId: number,
  ): Promise<{ success: boolean; message: string; bonus?: Bonus }> {
    try {
      // Check if welcome bonus already claimed
      const existingBonus = await this.getUserBonuses(userId, "welcome");
      if (existingBonus.length > 0) {
        return {
          success: false,
          message: "Welcome bonus already claimed",
        };
      }

      // Create welcome bonus
      const bonus = await this.createBonus(userId, {
        bonus_type: "welcome",
        gold_coins: 10000, // 10,000 Gold Coins
        sweeps_coins: 10, // 10 Sweeps Coins
        description: "Welcome to CoinKrazy! Enjoy your bonus coins.",
        status: "available",
      });

      // Automatically claim it
      const claimResult = await this.claimBonus(bonus.id, userId);

      return {
        success: claimResult.success,
        message: claimResult.success
          ? "Welcome bonus claimed! You received 10,000 Gold Coins and 10 Sweeps Coins!"
          : claimResult.message,
        bonus: claimResult.success ? bonus : undefined,
      };
    } catch (error) {
      console.error("Error claiming welcome bonus:", error);
      return {
        success: false,
        message: "Failed to claim welcome bonus",
      };
    }
  }

  async claimDailyBonus(
    userId: number,
  ): Promise<{ success: boolean; message: string; bonus?: Bonus }> {
    try {
      // Check if daily bonus already claimed today
      const today = new Date().toISOString().split("T")[0];
      const existingDailyBonus = await this.getTodaysDailyBonus(userId);

      if (existingDailyBonus) {
        const nextClaim = new Date();
        nextClaim.setHours(24, 0, 0, 0);
        return {
          success: false,
          message: `Daily bonus already claimed. Next claim available at ${nextClaim.toLocaleTimeString()}`,
        };
      }

      // Get user's VIP tier for bonus multiplier
      const vipTier = await this.getUserVIPTier(userId);
      const multiplier = vipTier.daily_bonus_multiplier;

      // Calculate consecutive days streak
      const streak = await this.getDailyLoginStreak(userId);
      const streakBonus = Math.min(streak, 7) * 0.1; // 10% bonus per consecutive day, max 70%

      const baseGC = 5000;
      const baseSC = 5;

      const finalGC = Math.floor(baseGC * multiplier * (1 + streakBonus));
      const finalSC = Math.floor(baseSC * multiplier * (1 + streakBonus));

      // Create daily bonus
      const bonus = await this.createBonus(userId, {
        bonus_type: "daily",
        gold_coins: finalGC,
        sweeps_coins: finalSC,
        description: `Daily bonus (Day ${streak + 1}) - ${Math.round(streakBonus * 100)}% streak bonus`,
        status: "available",
      });

      // Automatically claim it
      const claimResult = await this.claimBonus(bonus.id, userId);

      return {
        success: claimResult.success,
        message: claimResult.success
          ? `Daily bonus claimed! You received ${finalGC.toLocaleString()} Gold Coins and ${finalSC} Sweeps Coins!`
          : claimResult.message,
        bonus: claimResult.success ? bonus : undefined,
      };
    } catch (error) {
      console.error("Error claiming daily bonus:", error);
      return {
        success: false,
        message: "Failed to claim daily bonus",
      };
    }
  }

  async claimLoyaltyBonus(
    userId: number,
  ): Promise<{ success: boolean; message: string; bonus?: Bonus }> {
    try {
      // Check user's loyalty points and determine bonus
      const loyaltyPoints = await this.getUserLoyaltyPoints(userId);

      if (loyaltyPoints < 100) {
        return {
          success: false,
          message: `You need ${100 - loyaltyPoints} more loyalty points to claim this bonus`,
        };
      }

      // Calculate bonus based on loyalty points
      const tierMultiplier = Math.floor(loyaltyPoints / 1000) + 1;
      const baseGC = 25000;
      const baseSC = 25;

      const finalGC = baseGC * tierMultiplier;
      const finalSC = baseSC * tierMultiplier;

      // Create loyalty bonus
      const bonus = await this.createBonus(userId, {
        bonus_type: "loyalty",
        gold_coins: finalGC,
        sweeps_coins: finalSC,
        description: `Loyalty bonus - Tier ${tierMultiplier} (${loyaltyPoints} points)`,
        status: "available",
      });

      // Deduct loyalty points
      await this.deductLoyaltyPoints(userId, 100);

      // Automatically claim it
      const claimResult = await this.claimBonus(bonus.id, userId);

      return {
        success: claimResult.success,
        message: claimResult.success
          ? `Loyalty bonus claimed! You received ${finalGC.toLocaleString()} Gold Coins and ${finalSC} Sweeps Coins!`
          : claimResult.message,
        bonus: claimResult.success ? bonus : undefined,
      };
    } catch (error) {
      console.error("Error claiming loyalty bonus:", error);
      return {
        success: false,
        message: "Failed to claim loyalty bonus",
      };
    }
  }

  async claimReferralBonus(
    userId: number,
    referredUserId: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify the referred user exists and is new
      const referredUser = await databaseService.getUserBalance(referredUserId);
      if (!referredUser) {
        return {
          success: false,
          message: "Referred user not found",
        };
      }

      // Check if this referral bonus was already claimed
      const existingReferralBonus = await this.getReferralBonus(
        userId,
        referredUserId,
      );
      if (existingReferralBonus) {
        return {
          success: false,
          message: "Referral bonus for this user already claimed",
        };
      }

      // Create referral bonuses for both users
      const referrerBonus = await this.createBonus(userId, {
        bonus_type: "referral",
        gold_coins: 50000,
        sweeps_coins: 50,
        description: `Referral bonus - You referred a new player!`,
        status: "available",
      });

      const referredBonus = await this.createBonus(referredUserId, {
        bonus_type: "referral",
        gold_coins: 25000,
        sweeps_coins: 25,
        description: `Welcome bonus - You were referred by a friend!`,
        status: "available",
      });

      // Claim both bonuses
      await this.claimBonus(referrerBonus.id, userId);
      await this.claimBonus(referredBonus.id, referredUserId);

      return {
        success: true,
        message: "Referral bonuses awarded to both players!",
      };
    } catch (error) {
      console.error("Error claiming referral bonus:", error);
      return {
        success: false,
        message: "Failed to claim referral bonus",
      };
    }
  }

  async claimWheelSpinBonus(
    userId: number,
    scWon: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Create wheel spin bonus
      const bonus = await this.createBonus(userId, {
        bonus_type: "wheel",
        gold_coins: 0,
        sweeps_coins: scWon,
        description: `Lucky wheel spin bonus - ${scWon} Sweeps Coins!`,
        status: "available",
      });

      // Automatically claim it
      const claimResult = await this.claimBonus(bonus.id, userId);

      return {
        success: claimResult.success,
        message: claimResult.success
          ? `Lucky wheel bonus claimed! You won ${scWon} Sweeps Coins!`
          : claimResult.message,
      };
    } catch (error) {
      console.error("Error claiming wheel spin bonus:", error);
      return {
        success: false,
        message: "Failed to claim wheel spin bonus",
      };
    }
  }

  async claimVIPBonus(
    userId: number,
  ): Promise<{ success: boolean; message: string; bonus?: Bonus }> {
    try {
      const vipTier = await this.getUserVIPTier(userId);

      if (vipTier.level === 0) {
        return {
          success: false,
          message: "You need to be a VIP member to claim this bonus",
        };
      }

      // Check if VIP bonus already claimed this month
      const existingVIPBonus = await this.getMonthlyVIPBonus(userId);
      if (existingVIPBonus) {
        return {
          success: false,
          message: "VIP bonus already claimed this month",
        };
      }

      // Create VIP bonus
      const bonus = await this.createBonus(userId, {
        bonus_type: "vip",
        gold_coins: vipTier.monthly_bonus_gc,
        sweeps_coins: vipTier.monthly_bonus_sc,
        description: `${vipTier.name} VIP monthly bonus`,
        status: "available",
      });

      // Automatically claim it
      const claimResult = await this.claimBonus(bonus.id, userId);

      return {
        success: claimResult.success,
        message: claimResult.success
          ? `${vipTier.name} VIP bonus claimed! You received ${vipTier.monthly_bonus_gc.toLocaleString()} Gold Coins and ${vipTier.monthly_bonus_sc} Sweeps Coins!`
          : claimResult.message,
        bonus: claimResult.success ? bonus : undefined,
      };
    } catch (error) {
      console.error("Error claiming VIP bonus:", error);
      return {
        success: false,
        message: "Failed to claim VIP bonus",
      };
    }
  }

  async getBonusProgress(userId: number): Promise<BonusProgress[]> {
    try {
      const progress: BonusProgress[] = [];

      // Daily bonus progress
      const lastDailyBonus = await this.getTodaysDailyBonus(userId);
      const streak = await this.getDailyLoginStreak(userId);

      progress.push({
        type: "daily",
        current: lastDailyBonus ? 1 : 0,
        required: 1,
        percentage: lastDailyBonus ? 100 : 0,
        reward: { gc: 5000, sc: 5 },
        next_claim: lastDailyBonus
          ? this.getNextDailyBonusTime()
          : "Available now",
      });

      // Loyalty bonus progress
      const loyaltyPoints = await this.getUserLoyaltyPoints(userId);
      progress.push({
        type: "loyalty",
        current: loyaltyPoints % 100,
        required: 100,
        percentage: loyaltyPoints % 100,
        reward: { gc: 25000, sc: 25 },
      });

      // VIP progress
      const vipTier = await this.getUserVIPTier(userId);
      const vipPoints = await this.getUserVIPPoints(userId);
      const nextTier = VIP_TIERS[vipTier.level + 1];

      if (nextTier) {
        progress.push({
          type: "vip",
          current: vipPoints,
          required: nextTier.required_points,
          percentage: (vipPoints / nextTier.required_points) * 100,
          reward: {
            gc: nextTier.monthly_bonus_gc,
            sc: nextTier.monthly_bonus_sc,
          },
        });
      }

      return progress;
    } catch (error) {
      console.error("Error getting bonus progress:", error);
      return [];
    }
  }

  // Private helper methods
  private async createBonus(
    userId: number,
    bonusData: Partial<Bonus>,
  ): Promise<Bonus> {
    // In a real implementation, this would make an API call to create the bonus
    const bonus: Bonus = {
      id: Date.now(), // Temporary ID
      user_id: userId,
      bonus_type: bonusData.bonus_type!,
      gold_coins: bonusData.gold_coins || 0,
      sweeps_coins: bonusData.sweeps_coins || 0,
      description: bonusData.description || "",
      status: bonusData.status || "available",
      created_at: new Date().toISOString(),
    };

    return bonus;
  }

  private async claimBonus(
    bonusId: number,
    userId: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, this would make an API call to claim the bonus
      // and update the user's balance
      return {
        success: true,
        message: "Bonus claimed successfully",
      };
    } catch (error) {
      console.error("Error claiming bonus:", error);
      return {
        success: false,
        message: "Failed to claim bonus",
      };
    }
  }

  private async getUserBonuses(
    userId: number,
    type?: string,
  ): Promise<Bonus[]> {
    // In a real implementation, this would fetch from the database
    return [];
  }

  private async getTodaysDailyBonus(userId: number): Promise<Bonus | null> {
    // In a real implementation, this would check if user claimed daily bonus today
    return null;
  }

  private async getDailyLoginStreak(userId: number): Promise<number> {
    // In a real implementation, this would calculate consecutive login days
    return Math.floor(Math.random() * 7) + 1;
  }

  private async getUserVIPTier(userId: number): Promise<VIPTier> {
    // In a real implementation, this would fetch user's VIP tier from database
    const vipPoints = await this.getUserVIPPoints(userId);

    for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
      if (vipPoints >= VIP_TIERS[i].required_points) {
        return VIP_TIERS[i];
      }
    }

    return VIP_TIERS[0];
  }

  private async getUserVIPPoints(userId: number): Promise<number> {
    // In a real implementation, this would fetch from database
    return Math.floor(Math.random() * 10000);
  }

  private async getUserLoyaltyPoints(userId: number): Promise<number> {
    // In a real implementation, this would fetch from database
    return Math.floor(Math.random() * 500) + 50;
  }

  private async deductLoyaltyPoints(
    userId: number,
    points: number,
  ): Promise<void> {
    // In a real implementation, this would update the database
  }

  private async getReferralBonus(
    userId: number,
    referredUserId: number,
  ): Promise<Bonus | null> {
    // In a real implementation, this would check database for existing referral bonus
    return null;
  }

  private async getMonthlyVIPBonus(userId: number): Promise<Bonus | null> {
    // In a real implementation, this would check if VIP bonus claimed this month
    return null;
  }

  private getNextDailyBonusTime(): string {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    return tomorrow.toLocaleTimeString();
  }
}

export const bonusService = BonusService.getInstance();
export default bonusService;
