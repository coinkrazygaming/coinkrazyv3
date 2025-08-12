import { Pool } from "pg";
import crypto from "crypto";

// Types and Interfaces
export interface ScratchCardTheme {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  background_image?: string;
  scratch_overlay?: string;
  card_design?: any;
  sound_effects?: any;
  animation_config?: any;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface ScratchCardType {
  id: number;
  theme_id: number;
  name: string;
  display_name: string;
  description?: string;
  card_image?: string;
  scratch_area_config?: any;
  game_type: string;
  min_symbols_to_match: number;
  total_scratch_areas: number;
  cost_gc: number;
  cost_sc: number;
  currency_type: string;
  max_prize_gc: number;
  max_prize_sc: number;
  jackpot_enabled: boolean;
  progressive_jackpot: boolean;
  overall_odds: number;
  rtp_percentage: number;
  daily_purchase_limit: number;
  max_instances_per_user: number;
  purchase_requires_kyc: boolean;
  min_age_requirement: number;
  is_active: boolean;
  is_featured: boolean;
  launch_date?: Date;
  end_date?: Date;
  sort_order: number;
  total_sold: number;
  total_winnings_gc: number;
  total_winnings_sc: number;
  created_at: Date;
  updated_at: Date;
}

export interface ScratchCardPrize {
  id: number;
  card_type_id: number;
  prize_tier: string;
  prize_name: string;
  prize_description?: string;
  prize_gc: number;
  prize_sc: number;
  bonus_items?: any;
  win_probability: number;
  max_wins_per_day?: number;
  max_total_wins?: number;
  current_wins_today: number;
  total_wins: number;
  symbol_combination: any;
  is_jackpot: boolean;
  is_bonus_prize: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ScratchCardInstance {
  id: number;
  instance_id: string;
  card_type_id: number;
  user_id: number;
  purchase_cost_gc: number;
  purchase_cost_sc: number;
  purchase_currency: string;
  purchased_at: Date;
  predetermined_outcome: any;
  winning_symbols: any;
  prize_configuration: any;
  status: 'unscratched' | 'partially_scratched' | 'completed' | 'expired';
  scratch_progress: any;
  revealed_symbols: any;
  first_scratch_at?: Date;
  completed_at?: Date;
  total_scratch_time?: number;
  scratch_pattern: any;
  is_winner: boolean;
  prize_id?: number;
  winnings_gc: number;
  winnings_sc: number;
  bonus_items?: any;
  prize_claimed: boolean;
  prize_claimed_at?: Date;
  prize_transaction_id?: number;
  game_seed: string;
  verification_hash: string;
  client_fingerprint?: any;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface GameOutcome {
  isWinner: boolean;
  prizeId?: number;
  winningsGC: number;
  winningSC: number;
  symbols: string[];
  winningCombination?: string[];
  bonusItems?: any;
}

export interface ScratchProgress {
  areaIndex: number;
  timestamp: Date;
  symbol: string;
}

class ScratchCardService {
  private static instance: ScratchCardService;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  public static getInstance(): ScratchCardService {
    if (!ScratchCardService.instance) {
      ScratchCardService.instance = new ScratchCardService();
    }
    return ScratchCardService.instance;
  }

  // ===== THEME MANAGEMENT =====

  async getThemes(): Promise<ScratchCardTheme[]> {
    const query = 'SELECT * FROM scratch_card_themes WHERE is_active = true ORDER BY sort_order, display_name';
    const result = await this.pool.query(query);
    return result.rows;
  }

  async createTheme(theme: Partial<ScratchCardTheme>): Promise<ScratchCardTheme> {
    const query = `
      INSERT INTO scratch_card_themes (
        name, display_name, description, background_image, scratch_overlay,
        card_design, sound_effects, animation_config, is_active, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      theme.name,
      theme.display_name,
      theme.description,
      theme.background_image,
      theme.scratch_overlay,
      theme.card_design ? JSON.stringify(theme.card_design) : null,
      theme.sound_effects ? JSON.stringify(theme.sound_effects) : null,
      theme.animation_config ? JSON.stringify(theme.animation_config) : null,
      theme.is_active !== undefined ? theme.is_active : true,
      theme.sort_order || 0,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // ===== CARD TYPE MANAGEMENT =====

  async getCardTypes(activeOnly: boolean = true): Promise<ScratchCardType[]> {
    let query = `
      SELECT ct.*, t.name as theme_name, t.display_name as theme_display_name
      FROM scratch_card_types ct
      JOIN scratch_card_themes t ON ct.theme_id = t.id
    `;
    if (activeOnly) {
      query += ' WHERE ct.is_active = true AND t.is_active = true';
    }
    query += ' ORDER BY ct.sort_order, ct.display_name';
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getCardTypeById(id: number): Promise<ScratchCardType | null> {
    const query = `
      SELECT ct.*, t.name as theme_name, t.display_name as theme_display_name
      FROM scratch_card_types ct
      JOIN scratch_card_themes t ON ct.theme_id = t.id
      WHERE ct.id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async createCardType(cardType: Partial<ScratchCardType>): Promise<ScratchCardType> {
    const query = `
      INSERT INTO scratch_card_types (
        theme_id, name, display_name, description, card_image, scratch_area_config,
        game_type, min_symbols_to_match, total_scratch_areas, cost_gc, cost_sc, currency_type,
        max_prize_gc, max_prize_sc, jackpot_enabled, progressive_jackpot, overall_odds,
        rtp_percentage, daily_purchase_limit, max_instances_per_user, purchase_requires_kyc,
        min_age_requirement, is_active, is_featured, launch_date, end_date, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *
    `;
    const values = [
      cardType.theme_id,
      cardType.name,
      cardType.display_name,
      cardType.description,
      cardType.card_image,
      cardType.scratch_area_config ? JSON.stringify(cardType.scratch_area_config) : null,
      cardType.game_type || 'match_three',
      cardType.min_symbols_to_match || 3,
      cardType.total_scratch_areas || 9,
      cardType.cost_gc || 1000,
      cardType.cost_sc || 0,
      cardType.currency_type || 'GC',
      cardType.max_prize_gc || 100000,
      cardType.max_prize_sc || 0,
      cardType.jackpot_enabled || false,
      cardType.progressive_jackpot || false,
      cardType.overall_odds || 0.25,
      cardType.rtp_percentage || 85.00,
      cardType.daily_purchase_limit || 50,
      cardType.max_instances_per_user || 100,
      cardType.purchase_requires_kyc || false,
      cardType.min_age_requirement || 18,
      cardType.is_active !== undefined ? cardType.is_active : true,
      cardType.is_featured || false,
      cardType.launch_date,
      cardType.end_date,
      cardType.sort_order || 0,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // ===== PRIZE MANAGEMENT =====

  async getPrizesForCardType(cardTypeId: number): Promise<ScratchCardPrize[]> {
    const query = `
      SELECT * FROM scratch_card_prizes 
      WHERE card_type_id = $1 AND is_active = true 
      ORDER BY win_probability DESC
    `;
    const result = await this.pool.query(query, [cardTypeId]);
    return result.rows;
  }

  async createPrize(prize: Partial<ScratchCardPrize>): Promise<ScratchCardPrize> {
    const query = `
      INSERT INTO scratch_card_prizes (
        card_type_id, prize_tier, prize_name, prize_description, prize_gc, prize_sc,
        bonus_items, win_probability, max_wins_per_day, max_total_wins, symbol_combination,
        is_jackpot, is_bonus_prize, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const values = [
      prize.card_type_id,
      prize.prize_tier,
      prize.prize_name,
      prize.prize_description,
      prize.prize_gc || 0,
      prize.prize_sc || 0,
      prize.bonus_items ? JSON.stringify(prize.bonus_items) : null,
      prize.win_probability,
      prize.max_wins_per_day,
      prize.max_total_wins,
      prize.symbol_combination ? JSON.stringify(prize.symbol_combination) : null,
      prize.is_jackpot || false,
      prize.is_bonus_prize || false,
      prize.is_active !== undefined ? prize.is_active : true,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // ===== GAME LOGIC =====

  async purchaseCard(userId: number, cardTypeId: number, clientInfo?: any): Promise<ScratchCardInstance> {
    const cardType = await this.getCardTypeById(cardTypeId);
    if (!cardType) {
      throw new Error('Card type not found');
    }

    if (!cardType.is_active) {
      throw new Error('Card type is not active');
    }

    // Check purchase limits
    const dailyPurchases = await this.getDailyPurchaseCount(userId, cardTypeId);
    if (dailyPurchases >= cardType.daily_purchase_limit) {
      throw new Error('Daily purchase limit exceeded');
    }

    const totalPurchases = await this.getTotalPurchaseCount(userId, cardTypeId);
    if (totalPurchases >= cardType.max_instances_per_user) {
      throw new Error('Maximum instances per user exceeded');
    }

    // Generate game outcome
    const outcome = await this.generateGameOutcome(cardTypeId);
    const symbols = this.generateSymbols(cardType, outcome);
    const instanceId = this.generateInstanceId();
    const seed = crypto.randomBytes(32).toString('hex');
    const verificationHash = this.generateVerificationHash(instanceId, outcome, seed);

    const query = `
      INSERT INTO scratch_card_instances (
        instance_id, card_type_id, user_id, purchase_cost_gc, purchase_cost_sc, purchase_currency,
        predetermined_outcome, winning_symbols, prize_configuration, status, scratch_progress,
        revealed_symbols, is_winner, prize_id, winnings_gc, winnings_sc, bonus_items,
        game_seed, verification_hash, client_fingerprint, ip_address, user_agent,
        expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;

    const scratchProgress = Array(cardType.total_scratch_areas).fill(null).map((_, i) => ({
      area: i,
      scratched: false,
      symbol: symbols[i],
    }));

    const values = [
      instanceId,
      cardTypeId,
      userId,
      cardType.cost_gc,
      cardType.cost_sc,
      cardType.currency_type,
      JSON.stringify(outcome),
      JSON.stringify(symbols),
      outcome.prizeId ? JSON.stringify(await this.getPrizeById(outcome.prizeId)) : null,
      'unscratched',
      JSON.stringify(scratchProgress),
      JSON.stringify([]),
      outcome.isWinner,
      outcome.prizeId,
      outcome.winningsGC,
      outcome.winningSC,
      outcome.bonusItems ? JSON.stringify(outcome.bonusItems) : null,
      seed,
      verificationHash,
      clientInfo ? JSON.stringify(clientInfo) : null,
      clientInfo?.ip_address,
      clientInfo?.user_agent,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async scratchArea(instanceId: string, areaIndex: number, userId: number): Promise<{
    symbol: string;
    cardComplete: boolean;
    winningsRevealed: boolean;
    cardInstance: ScratchCardInstance;
  }> {
    // Get card instance
    const instance = await this.getCardInstance(instanceId, userId);
    if (!instance) {
      throw new Error('Card instance not found');
    }

    if (instance.status === 'completed' || instance.status === 'expired') {
      throw new Error('Card is already completed or expired');
    }

    // Parse current scratch progress
    const scratchProgress = JSON.parse(instance.scratch_progress || '[]');
    const revealedSymbols = JSON.parse(instance.revealed_symbols || '[]');

    // Check if area is already scratched
    if (scratchProgress[areaIndex]?.scratched) {
      throw new Error('Area already scratched');
    }

    // Mark area as scratched
    const symbol = scratchProgress[areaIndex].symbol;
    scratchProgress[areaIndex].scratched = true;
    scratchProgress[areaIndex].scratchedAt = new Date();

    revealedSymbols.push({
      areaIndex,
      symbol,
      timestamp: new Date(),
    });

    // Check if card is complete
    const totalScratched = scratchProgress.filter((area: any) => area.scratched).length;
    const cardComplete = totalScratched === scratchProgress.length;
    
    // For match-three games, check if winning combination is revealed early
    let winningsRevealed = false;
    if (instance.is_winner) {
      winningsRevealed = this.checkWinningsRevealed(revealedSymbols, instance.predetermined_outcome);
    }

    // Update database
    const updateQuery = `
      UPDATE scratch_card_instances 
      SET 
        scratch_progress = $1,
        revealed_symbols = $2,
        status = $3,
        first_scratch_at = COALESCE(first_scratch_at, CURRENT_TIMESTAMP),
        completed_at = $4,
        total_scratch_time = $5
      WHERE instance_id = $6 AND user_id = $7
      RETURNING *
    `;

    const newStatus = cardComplete ? 'completed' : 'partially_scratched';
    const completedAt = cardComplete ? new Date() : null;
    const totalTime = cardComplete ? this.calculateScratchTime(instance, revealedSymbols) : null;

    const values = [
      JSON.stringify(scratchProgress),
      JSON.stringify(revealedSymbols),
      newStatus,
      completedAt,
      totalTime,
      instanceId,
      userId,
    ];

    const result = await this.pool.query(updateQuery, values);
    const updatedInstance = result.rows[0];

    return {
      symbol,
      cardComplete,
      winningsRevealed,
      cardInstance: updatedInstance,
    };
  }

  async claimPrize(instanceId: string, userId: number): Promise<{
    success: boolean;
    transactionId?: number;
    error?: string;
  }> {
    const instance = await this.getCardInstance(instanceId, userId);
    if (!instance) {
      throw new Error('Card instance not found');
    }

    if (!instance.is_winner) {
      throw new Error('Card is not a winner');
    }

    if (instance.prize_claimed) {
      throw new Error('Prize already claimed');
    }

    if (instance.status !== 'completed') {
      throw new Error('Card must be completed before claiming prize');
    }

    try {
      // Start transaction
      await this.pool.query('BEGIN');

      // Update user balance
      const balanceQuery = `
        UPDATE users 
        SET 
          gold_coins = gold_coins + $1,
          sweeps_coins = sweeps_coins + $2
        WHERE id = $3
        RETURNING gold_coins, sweeps_coins
      `;
      const balanceResult = await this.pool.query(balanceQuery, [
        instance.winnings_gc,
        instance.winnings_sc,
        userId,
      ]);

      // Create transaction record
      const transactionQuery = `
        INSERT INTO transactions (
          user_id, transaction_type, currency, amount, description, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      const transactionResult = await this.pool.query(transactionQuery, [
        userId,
        'scratch_card_win',
        'MIXED',
        instance.winnings_gc + instance.winnings_sc,
        `Scratch card win: ${instance.instance_id}`,
        'completed',
        JSON.stringify({
          instance_id: instance.instance_id,
          winnings_gc: instance.winnings_gc,
          winnings_sc: instance.winnings_sc,
          prize_id: instance.prize_id,
        }),
      ]);

      // Mark prize as claimed
      const claimQuery = `
        UPDATE scratch_card_instances 
        SET 
          prize_claimed = true,
          prize_claimed_at = CURRENT_TIMESTAMP,
          prize_transaction_id = $1
        WHERE instance_id = $2 AND user_id = $3
      `;
      await this.pool.query(claimQuery, [
        transactionResult.rows[0].id,
        instanceId,
        userId,
      ]);

      await this.pool.query('COMMIT');

      return {
        success: true,
        transactionId: transactionResult.rows[0].id,
      };
    } catch (error) {
      await this.pool.query('ROLLBACK');
      console.error('Error claiming prize:', error);
      return {
        success: false,
        error: 'Failed to claim prize',
      };
    }
  }

  // ===== GAME MECHANICS HELPERS =====

  private async generateGameOutcome(cardTypeId: number): Promise<GameOutcome> {
    const prizes = await this.getPrizesForCardType(cardTypeId);
    const random = Math.random();
    let cumulativeProbability = 0;

    // Check each prize tier
    for (const prize of prizes) {
      cumulativeProbability += prize.win_probability;
      if (random <= cumulativeProbability) {
        // Check daily/total win limits
        if (await this.isPrizeAvailable(prize)) {
          return {
            isWinner: true,
            prizeId: prize.id,
            winningsGC: prize.prize_gc,
            winningSC: prize.prize_sc,
            symbols: [],
            winningCombination: prize.symbol_combination?.required || [],
            bonusItems: prize.bonus_items,
          };
        }
      }
    }

    // No prize won
    return {
      isWinner: false,
      winningsGC: 0,
      winningSC: 0,
      symbols: [],
    };
  }

  private generateSymbols(cardType: ScratchCardType, outcome: GameOutcome): string[] {
    const symbols = [];
    const symbolPool = ['symbol1', 'symbol2', 'symbol3', 'bell', 'star', 'diamond', 'seven', 'cherry'];
    
    if (outcome.isWinner && outcome.winningCombination) {
      // Place winning symbols
      const winningSymbol = outcome.winningCombination[0];
      const requiredMatches = cardType.min_symbols_to_match;
      
      // Add winning symbols
      for (let i = 0; i < requiredMatches; i++) {
        symbols.push(winningSymbol);
      }
      
      // Fill remaining areas with random symbols (avoiding winning symbol)
      const nonWinningSymbols = symbolPool.filter(s => s !== winningSymbol);
      while (symbols.length < cardType.total_scratch_areas) {
        const randomSymbol = nonWinningSymbols[Math.floor(Math.random() * nonWinningSymbols.length)];
        symbols.push(randomSymbol);
      }
    } else {
      // Generate losing combination
      while (symbols.length < cardType.total_scratch_areas) {
        const randomSymbol = symbolPool[Math.floor(Math.random() * symbolPool.length)];
        symbols.push(randomSymbol);
      }
      
      // Ensure no winning combinations exist
      this.preventWinningCombinations(symbols, cardType);
    }

    // Shuffle the symbols array
    return this.shuffleArray(symbols);
  }

  private checkWinningsRevealed(revealedSymbols: any[], outcome: any): boolean {
    if (!outcome.winningCombination) return false;
    
    const winningSymbol = outcome.winningCombination[0];
    const revealedWinningSymbols = revealedSymbols.filter(rs => rs.symbol === winningSymbol);
    
    return revealedWinningSymbols.length >= 3; // Minimum matches for most games
  }

  private preventWinningCombinations(symbols: string[], cardType: ScratchCardType) {
    const symbolCounts: { [key: string]: number } = {};
    
    // Count occurrences of each symbol
    symbols.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });
    
    // If any symbol appears 3+ times, replace excess occurrences
    const alternativeSymbols = ['blank1', 'blank2', 'blank3'];
    let altIndex = 0;
    
    Object.keys(symbolCounts).forEach(symbol => {
      if (symbolCounts[symbol] >= cardType.min_symbols_to_match) {
        // Replace excess symbols
        let replacements = symbolCounts[symbol] - (cardType.min_symbols_to_match - 1);
        for (let i = 0; i < symbols.length && replacements > 0; i++) {
          if (symbols[i] === symbol) {
            symbols[i] = alternativeSymbols[altIndex % alternativeSymbols.length];
            altIndex++;
            replacements--;
          }
        }
      }
    });
  }

  // ===== UTILITY METHODS =====

  private generateInstanceId(): string {
    return 'SC_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateVerificationHash(instanceId: string, outcome: GameOutcome, seed: string): string {
    const data = JSON.stringify({ instanceId, outcome, seed });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private calculateScratchTime(instance: ScratchCardInstance, revealedSymbols: any[]): number {
    if (!instance.first_scratch_at || revealedSymbols.length === 0) return 0;
    
    const firstScratch = new Date(instance.first_scratch_at);
    const lastScratch = new Date(revealedSymbols[revealedSymbols.length - 1].timestamp);
    
    return Math.floor((lastScratch.getTime() - firstScratch.getTime()) / 1000);
  }

  // ===== DATA RETRIEVAL =====

  async getCardInstance(instanceId: string, userId?: number): Promise<ScratchCardInstance | null> {
    let query = 'SELECT * FROM scratch_card_instances WHERE instance_id = $1';
    let values = [instanceId];
    
    if (userId) {
      query += ' AND user_id = $2';
      values.push(userId);
    }
    
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async getUserCards(userId: number, status?: string, limit: number = 50): Promise<ScratchCardInstance[]> {
    let query = `
      SELECT sci.*, ct.display_name as card_name, t.display_name as theme_name
      FROM scratch_card_instances sci
      JOIN scratch_card_types ct ON sci.card_type_id = ct.id
      JOIN scratch_card_themes t ON ct.theme_id = t.id
      WHERE sci.user_id = $1
    `;
    let values = [userId];
    
    if (status) {
      query += ' AND sci.status = $2';
      values.push(status);
    }
    
    query += ' ORDER BY sci.purchased_at DESC LIMIT $' + (values.length + 1);
    values.push(limit);
    
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async getDailyPurchaseCount(userId: number, cardTypeId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM scratch_card_instances 
      WHERE user_id = $1 AND card_type_id = $2 AND purchased_at >= CURRENT_DATE
    `;
    const result = await this.pool.query(query, [userId, cardTypeId]);
    return parseInt(result.rows[0].count);
  }

  async getTotalPurchaseCount(userId: number, cardTypeId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM scratch_card_instances 
      WHERE user_id = $1 AND card_type_id = $2
    `;
    const result = await this.pool.query(query, [userId, cardTypeId]);
    return parseInt(result.rows[0].count);
  }

  async getPrizeById(prizeId: number): Promise<ScratchCardPrize | null> {
    const query = 'SELECT * FROM scratch_card_prizes WHERE id = $1';
    const result = await this.pool.query(query, [prizeId]);
    return result.rows[0] || null;
  }

  private async isPrizeAvailable(prize: ScratchCardPrize): Promise<boolean> {
    // Check daily limit
    if (prize.max_wins_per_day) {
      const today = new Date().toISOString().split('T')[0];
      const dailyQuery = `
        SELECT COUNT(*) as count 
        FROM scratch_card_instances 
        WHERE prize_id = $1 AND DATE(completed_at) = $2
      `;
      const dailyResult = await this.pool.query(dailyQuery, [prize.id, today]);
      if (parseInt(dailyResult.rows[0].count) >= prize.max_wins_per_day) {
        return false;
      }
    }
    
    // Check total limit
    if (prize.max_total_wins && prize.total_wins >= prize.max_total_wins) {
      return false;
    }
    
    return true;
  }

  // ===== ANALYTICS =====

  async getScratchCardAnalytics(cardTypeId?: number, days: number = 30): Promise<any> {
    let query = `
      SELECT 
        DATE(purchased_at) as date,
        COUNT(*) as cards_sold,
        SUM(purchase_cost_gc) as revenue_gc,
        SUM(purchase_cost_sc) as revenue_sc,
        SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as total_wins,
        SUM(winnings_gc) as total_winnings_gc,
        SUM(winnings_sc) as total_winnings_sc,
        COUNT(DISTINCT user_id) as unique_players
      FROM scratch_card_instances
      WHERE purchased_at >= CURRENT_DATE - INTERVAL '${days} days'
    `;
    
    if (cardTypeId) {
      query += ' AND card_type_id = $1';
    }
    
    query += ' GROUP BY DATE(purchased_at) ORDER BY date DESC';
    
    const values = cardTypeId ? [cardTypeId] : [];
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async getTopWinners(limit: number = 10): Promise<any[]> {
    const query = `
      SELECT 
        u.username,
        u.email,
        SUM(sci.winnings_gc) as total_winnings_gc,
        SUM(sci.winnings_sc) as total_winnings_sc,
        COUNT(*) as total_wins
      FROM scratch_card_instances sci
      JOIN users u ON sci.user_id = u.id
      WHERE sci.is_winner = true AND sci.completed_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY u.id, u.username, u.email
      ORDER BY (total_winnings_gc + total_winnings_sc) DESC
      LIMIT $1
    `;
    const result = await this.pool.query(query, [limit]);
    return result.rows;
  }
}

// Export singleton instance
export const scratchCardService = ScratchCardService.getInstance();
export default scratchCardService;
