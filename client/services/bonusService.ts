import { databaseService } from './database';
import { authService } from './authService';

export interface Bonus {
  id: number;
  user_id: number;
  bonus_type: 'welcome' | 'deposit' | 'daily' | 'weekly' | 'loyalty' | 'referral' | 'vip' | 'wheel_spin' | 'social';
  title: string;
  description: string;
  gc_amount: number;
  sc_amount: number;
  wagering_requirement: number;
  expires_at?: Date;
  claimed_at?: Date;
  status: 'pending' | 'claimed' | 'expired' | 'cancelled';
  conditions: any;
  created_at: Date;
}

export interface BonusHistory {
  bonuses: Bonus[];
  totalGCAwarded: number;
  totalSCAwarded: number;
  totalClaimed: number;
}

export interface DailyBonus {
  day: number;
  gcAmount: number;
  scAmount: number;
  claimed: boolean;
  available: boolean;
}

class BonusService {
  private static instance: BonusService;

  static getInstance(): BonusService {
    if (!BonusService.instance) {
      BonusService.instance = new BonusService();
    }
    return BonusService.instance;
  }

  // Welcome Bonus System
  async createWelcomeBonus(userId: number): Promise<Bonus> {
    try {
      const bonus = await databaseService.query(`
        INSERT INTO bonuses (user_id, bonus_type, title, description, gc_amount, sc_amount, conditions, status)
        VALUES ($1, 'welcome', 'Welcome Bonus', 'Thank you for joining CoinKrazy! Enjoy your welcome bonus.', $2, $3, $4, 'pending')
        RETURNING *
      `, [userId, 10, 10, JSON.stringify({ requires_email_verification: true })]);

      return bonus.rows[0];
    } catch (error) {
      console.error('Failed to create welcome bonus:', error);
      throw error;
    }
  }

  async claimWelcomeBonus(userId: number): Promise<{ success: boolean; message: string; bonus?: Bonus }> {
    try {
      // Check if user has already claimed welcome bonus
      const existingBonus = await databaseService.query(`
        SELECT * FROM bonuses 
        WHERE user_id = $1 AND bonus_type = 'welcome' AND status = 'claimed'
        LIMIT 1
      `, [userId]);

      if (existingBonus.rows.length > 0) {
        return { success: false, message: 'Welcome bonus already claimed' };
      }

      // Check if user's email is verified
      const user = await databaseService.query('SELECT is_email_verified FROM users WHERE id = $1', [userId]);
      if (!user.rows[0]?.is_email_verified) {
        return { success: false, message: 'Email verification required to claim welcome bonus' };
      }

      // Find or create pending welcome bonus
      let bonus = await databaseService.query(`
        SELECT * FROM bonuses 
        WHERE user_id = $1 AND bonus_type = 'welcome' AND status = 'pending'
        LIMIT 1
      `, [userId]);

      if (bonus.rows.length === 0) {
        // Create welcome bonus if it doesn't exist
        bonus = await databaseService.query(`
          INSERT INTO bonuses (user_id, bonus_type, title, description, gc_amount, sc_amount, conditions, status)
          VALUES ($1, 'welcome', 'Welcome Bonus', 'Thank you for joining CoinKrazy! Enjoy your welcome bonus.', $2, $3, $4, 'pending')
          RETURNING *
        `, [userId, 10, 10, JSON.stringify({ requires_email_verification: true })]);
      }

      const bonusData = bonus.rows[0];

      // Credit the bonus to user's balance
      await databaseService.updateUserBalance(
        userId,
        bonusData.gc_amount,
        bonusData.sc_amount,
        'Welcome Bonus - New User'
      );

      // Mark bonus as claimed
      const claimedBonus = await databaseService.query(`
        UPDATE bonuses 
        SET status = 'claimed', claimed_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [bonusData.id]);

      // Create admin notification
      await databaseService.createAdminNotification(
        'Welcome Bonus Claimed',
        `New user has claimed welcome bonus: ${bonusData.gc_amount} GC + ${bonusData.sc_amount} SC`,
        'success',
        1
      );

      return {
        success: true,
        message: `Welcome bonus claimed! You received ${bonusData.gc_amount} GC + ${bonusData.sc_amount} SC.`,
        bonus: claimedBonus.rows[0]
      };
    } catch (error) {
      console.error('Failed to claim welcome bonus:', error);
      return { success: false, message: 'Failed to claim welcome bonus. Please try again.' };
    }
  }

  // Daily Login Bonus System
  async getDailyLoginBonus(userId: number): Promise<DailyBonus[]> {
    const dailyBonuses: DailyBonus[] = [
      { day: 1, gcAmount: 1000, scAmount: 0.5, claimed: false, available: true },
      { day: 2, gcAmount: 1500, scAmount: 0.75, claimed: false, available: false },
      { day: 3, gcAmount: 2000, scAmount: 1.0, claimed: false, available: false },
      { day: 4, gcAmount: 2500, scAmount: 1.25, claimed: false, available: false },
      { day: 5, gcAmount: 3000, scAmount: 1.5, claimed: false, available: false },
      { day: 6, gcAmount: 4000, scAmount: 2.0, claimed: false, available: false },
      { day: 7, gcAmount: 5000, scAmount: 3.0, claimed: false, available: false }, // Big bonus
    ];

    try {
      // Get user's claimed daily bonuses for this week
      const claimedBonuses = await databaseService.query(`
        SELECT * FROM bonuses 
        WHERE user_id = $1 AND bonus_type = 'daily' 
        AND created_at >= date_trunc('week', CURRENT_DATE)
        ORDER BY created_at ASC
      `, [userId]);

      // Mark claimed bonuses and determine available ones
      claimedBonuses.rows.forEach((bonus, index) => {
        if (index < dailyBonuses.length) {
          dailyBonuses[index].claimed = true;
        }
      });

      // Make next unclaimed bonus available
      const nextDay = claimedBonuses.rows.length;
      if (nextDay < dailyBonuses.length) {
        dailyBonuses[nextDay].available = true;
      }

      return dailyBonuses;
    } catch (error) {
      console.error('Failed to get daily login bonus:', error);
      return dailyBonuses;
    }
  }

  async claimDailyLoginBonus(userId: number, day: number): Promise<{ success: boolean; message: string; bonus?: Bonus }> {
    try {
      const dailyBonuses = await this.getDailyLoginBonus(userId);
      const targetBonus = dailyBonuses[day - 1];

      if (!targetBonus) {
        return { success: false, message: 'Invalid bonus day' };
      }

      if (targetBonus.claimed) {
        return { success: false, message: 'Daily bonus already claimed' };
      }

      if (!targetBonus.available) {
        return { success: false, message: 'Daily bonus not yet available' };
      }

      // Check if user already claimed a daily bonus today
      const todayBonus = await databaseService.query(`
        SELECT * FROM bonuses 
        WHERE user_id = $1 AND bonus_type = 'daily' 
        AND DATE(created_at) = CURRENT_DATE
        LIMIT 1
      `, [userId]);

      if (todayBonus.rows.length > 0) {
        return { success: false, message: 'Daily bonus already claimed today' };
      }

      // Create and claim the daily bonus
      const bonus = await databaseService.query(`
        INSERT INTO bonuses (user_id, bonus_type, title, description, gc_amount, sc_amount, status, claimed_at, conditions)
        VALUES ($1, 'daily', $2, $3, $4, $5, 'claimed', CURRENT_TIMESTAMP, $6)
        RETURNING *
      `, [
        userId,
        `Daily Login Bonus - Day ${day}`,
        `Your daily login bonus for day ${day}`,
        targetBonus.gcAmount,
        targetBonus.scAmount,
        JSON.stringify({ day, week_start: new Date().toISOString() })
      ]);

      // Credit the bonus to user's balance
      await databaseService.updateUserBalance(
        userId,
        targetBonus.gcAmount,
        targetBonus.scAmount,
        `Daily Login Bonus - Day ${day}`
      );

      return {
        success: true,
        message: `Daily bonus claimed! You received ${targetBonus.gcAmount} GC + ${targetBonus.scAmount} SC.`,
        bonus: bonus.rows[0]
      };
    } catch (error) {
      console.error('Failed to claim daily login bonus:', error);
      return { success: false, message: 'Failed to claim daily bonus. Please try again.' };
    }
  }

  // Deposit Bonus System
  async createDepositBonus(userId: number, depositAmount: number, bonusPercentage: number = 100): Promise<Bonus> {
    try {
      const maxBonus = 100; // Maximum $100 bonus
      const bonusAmount = Math.min(depositAmount * (bonusPercentage / 100), maxBonus);
      const scAmount = bonusAmount; // 1:1 ratio for SC

      const bonus = await databaseService.query(`
        INSERT INTO bonuses (user_id, bonus_type, title, description, gc_amount, sc_amount, wagering_requirement, conditions, status)
        VALUES ($1, 'deposit', 'Deposit Bonus', $2, 0, $3, $4, $5, 'pending')
        RETURNING *
      `, [
        userId,
        `${bonusPercentage}% deposit bonus up to $${maxBonus}`,
        scAmount,
        scAmount * 1.5, // 1.5x wagering requirement
        JSON.stringify({ deposit_amount: depositAmount, bonus_percentage: bonusPercentage })
      ]);

      return bonus.rows[0];
    } catch (error) {
      console.error('Failed to create deposit bonus:', error);
      throw error;
    }
  }

  // Loyalty Bonus System
  async checkLoyaltyBonus(userId: number): Promise<{ eligible: boolean; nextTier?: string; progress?: number }> {
    try {
      // Get user's total wagering
      const wageringResult = await databaseService.query(`
        SELECT SUM(amount) as total_wagered
        FROM transactions 
        WHERE user_id = $1 AND transaction_type = 'bet' AND status = 'completed'
      `, [userId]);

      const totalWagered = parseFloat(wageringResult.rows[0]?.total_wagered || '0');

      // Define loyalty tiers
      const loyaltyTiers = [
        { name: 'Bronze', threshold: 1000, bonus: { gc: 5000, sc: 2.5 } },
        { name: 'Silver', threshold: 5000, bonus: { gc: 15000, sc: 7.5 } },
        { name: 'Gold', threshold: 15000, bonus: { gc: 40000, sc: 20 } },
        { name: 'Platinum', threshold: 50000, bonus: { gc: 100000, sc: 50 } },
        { name: 'Diamond', threshold: 150000, bonus: { gc: 300000, sc: 150 } }
      ];

      // Find user's current tier and next tier
      let currentTier = null;
      let nextTier = null;

      for (let i = 0; i < loyaltyTiers.length; i++) {
        if (totalWagered >= loyaltyTiers[i].threshold) {
          currentTier = loyaltyTiers[i];
        } else {
          nextTier = loyaltyTiers[i];
          break;
        }
      }

      if (nextTier) {
        const progress = (totalWagered / nextTier.threshold) * 100;
        return {
          eligible: false,
          nextTier: nextTier.name,
          progress: Math.min(progress, 100)
        };
      }

      return { eligible: false };
    } catch (error) {
      console.error('Failed to check loyalty bonus:', error);
      return { eligible: false };
    }
  }

  // Referral Bonus System
  async createReferralBonus(referrerId: number, referredUserId: number): Promise<{ referrerBonus: Bonus; referredBonus: Bonus }> {
    try {
      // Bonus for the referrer
      const referrerBonus = await databaseService.query(`
        INSERT INTO bonuses (user_id, bonus_type, title, description, gc_amount, sc_amount, conditions, status)
        VALUES ($1, 'referral', 'Referral Bonus - Referrer', 'Thank you for referring a friend to CoinKrazy!', $2, $3, $4, 'pending')
        RETURNING *
      `, [
        referrerId,
        25000, // 25k GC
        12.5,  // 12.5 SC
        JSON.stringify({ referred_user_id: referredUserId, type: 'referrer' })
      ]);

      // Bonus for the referred user
      const referredBonus = await databaseService.query(`
        INSERT INTO bonuses (user_id, bonus_type, title, description, gc_amount, sc_amount, conditions, status)
        VALUES ($1, 'referral', 'Referral Bonus - Welcome', 'Welcome! You were referred by a friend.', $2, $3, $4, 'pending')
        RETURNING *
      `, [
        referredUserId,
        15000, // 15k GC
        7.5,   // 7.5 SC
        JSON.stringify({ referrer_user_id: referrerId, type: 'referred' })
      ]);

      return {
        referrerBonus: referrerBonus.rows[0],
        referredBonus: referredBonus.rows[0]
      };
    } catch (error) {
      console.error('Failed to create referral bonus:', error);
      throw error;
    }
  }

  // Social Media Bonus System
  async createSocialBonus(userId: number, platform: string, action: string): Promise<Bonus> {
    try {
      const socialBonuses = {
        'facebook_like': { gc: 2000, sc: 1, title: 'Facebook Like Bonus' },
        'twitter_follow': { gc: 2000, sc: 1, title: 'Twitter Follow Bonus' },
        'instagram_follow': { gc: 2000, sc: 1, title: 'Instagram Follow Bonus' },
        'facebook_share': { gc: 3000, sc: 1.5, title: 'Facebook Share Bonus' },
        'twitter_retweet': { gc: 3000, sc: 1.5, title: 'Twitter Retweet Bonus' }
      };

      const bonusKey = `${platform}_${action}`;
      const bonusData = socialBonuses[bonusKey as keyof typeof socialBonuses];

      if (!bonusData) {
        throw new Error('Invalid social bonus type');
      }

      // Check if user already claimed this social bonus
      const existingBonus = await databaseService.query(`
        SELECT * FROM bonuses 
        WHERE user_id = $1 AND bonus_type = 'social' 
        AND conditions->>'platform' = $2 AND conditions->>'action' = $3
        LIMIT 1
      `, [userId, platform, action]);

      if (existingBonus.rows.length > 0) {
        throw new Error('Social bonus already claimed');
      }

      const bonus = await databaseService.query(`
        INSERT INTO bonuses (user_id, bonus_type, title, description, gc_amount, sc_amount, conditions, status, claimed_at)
        VALUES ($1, 'social', $2, $3, $4, $5, $6, 'claimed', CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        userId,
        bonusData.title,
        `Bonus for ${action} on ${platform}`,
        bonusData.gc,
        bonusData.sc,
        JSON.stringify({ platform, action })
      ]);

      // Credit the bonus immediately
      await databaseService.updateUserBalance(
        userId,
        bonusData.gc,
        bonusData.sc,
        bonusData.title
      );

      return bonus.rows[0];
    } catch (error) {
      console.error('Failed to create social bonus:', error);
      throw error;
    }
  }

  // User Bonus History
  async getUserBonusHistory(userId: number): Promise<BonusHistory> {
    try {
      const bonusesResult = await databaseService.query(`
        SELECT * FROM bonuses 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `, [userId]);

      const bonuses = bonusesResult.rows;
      const totalGCAwarded = bonuses.reduce((sum, bonus) => sum + (bonus.gc_amount || 0), 0);
      const totalSCAwarded = bonuses.reduce((sum, bonus) => sum + (bonus.sc_amount || 0), 0);
      const totalClaimed = bonuses.filter(bonus => bonus.status === 'claimed').length;

      return {
        bonuses,
        totalGCAwarded,
        totalSCAwarded,
        totalClaimed
      };
    } catch (error) {
      console.error('Failed to get user bonus history:', error);
      return {
        bonuses: [],
        totalGCAwarded: 0,
        totalSCAwarded: 0,
        totalClaimed: 0
      };
    }
  }

  // Available Bonuses
  async getAvailableBonuses(userId: number): Promise<Bonus[]> {
    try {
      const bonusesResult = await databaseService.query(`
        SELECT * FROM bonuses 
        WHERE user_id = $1 AND status = 'pending'
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY created_at ASC
      `, [userId]);

      return bonusesResult.rows;
    } catch (error) {
      console.error('Failed to get available bonuses:', error);
      return [];
    }
  }

  // Claim any bonus
  async claimBonus(userId: number, bonusId: number): Promise<{ success: boolean; message: string; bonus?: Bonus }> {
    try {
      const bonusResult = await databaseService.query(`
        SELECT * FROM bonuses 
        WHERE id = $1 AND user_id = $2 AND status = 'pending'
        LIMIT 1
      `, [bonusId, userId]);

      if (bonusResult.rows.length === 0) {
        return { success: false, message: 'Bonus not found or already claimed' };
      }

      const bonus = bonusResult.rows[0];

      // Check if bonus has expired
      if (bonus.expires_at && new Date(bonus.expires_at) < new Date()) {
        await databaseService.query('UPDATE bonuses SET status = \'expired\' WHERE id = $1', [bonusId]);
        return { success: false, message: 'Bonus has expired' };
      }

      // Credit the bonus to user's balance
      await databaseService.updateUserBalance(
        userId,
        bonus.gc_amount || 0,
        bonus.sc_amount || 0,
        `Bonus: ${bonus.title}`
      );

      // Mark bonus as claimed
      const claimedBonus = await databaseService.query(`
        UPDATE bonuses 
        SET status = 'claimed', claimed_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [bonusId]);

      return {
        success: true,
        message: `Bonus claimed! You received ${bonus.gc_amount || 0} GC + ${bonus.sc_amount || 0} SC.`,
        bonus: claimedBonus.rows[0]
      };
    } catch (error) {
      console.error('Failed to claim bonus:', error);
      return { success: false, message: 'Failed to claim bonus. Please try again.' };
    }
  }

  // Admin Methods
  async getAllBonuses(limit: number = 100): Promise<Bonus[]> {
    try {
      const bonusesResult = await databaseService.query(`
        SELECT b.*, u.username, u.email
        FROM bonuses b
        JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
        LIMIT $1
      `, [limit]);

      return bonusesResult.rows;
    } catch (error) {
      console.error('Failed to get all bonuses:', error);
      return [];
    }
  }

  async getBonusStatistics(): Promise<any> {
    try {
      const statsResult = await databaseService.query(`
        SELECT 
          bonus_type,
          COUNT(*) as total_bonuses,
          SUM(gc_amount) as total_gc,
          SUM(sc_amount) as total_sc,
          COUNT(CASE WHEN status = 'claimed' THEN 1 END) as claimed_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
        FROM bonuses
        GROUP BY bonus_type
      `);

      return statsResult.rows;
    } catch (error) {
      console.error('Failed to get bonus statistics:', error);
      return [];
    }
  }
}

export const bonusService = BonusService.getInstance();
export default bonusService;
