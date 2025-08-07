import { Pool } from 'pg';

// Database configuration
const DATABASE_URL = 'postgresql://neondb_owner:npg_6y2rgiwaNFJS@ep-curly-sky-aeyyxvyw-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: true,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // User management
  async createUser(userData: {
    email: string;
    password_hash: string;
    username: string;
    first_name?: string;
    last_name?: string;
  }) {
    const query = `
      INSERT INTO users (email, password_hash, username, first_name, last_name, email_verification_token)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, username, created_at
    `;
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const result = await this.query(query, [
      userData.email,
      userData.password_hash,
      userData.username,
      userData.first_name,
      userData.last_name,
      verificationToken
    ]);
    
    // Create initial balance with welcome bonus
    await this.createUserBalance(result.rows[0].id, 10, 10);
    
    return { ...result.rows[0], verification_token: verificationToken };
  }

  async getUserByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query(query, [email]);
    return result.rows[0];
  }

  async getUserByUsername(username: string) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await this.query(query, [username]);
    return result.rows[0];
  }

  async verifyEmail(token: string) {
    const query = `
      UPDATE users 
      SET is_email_verified = TRUE, email_verification_token = NULL, status = 'active'
      WHERE email_verification_token = $1
      RETURNING id, email, username
    `;
    const result = await this.query(query, [token]);
    return result.rows[0];
  }

  // Balance management
  async createUserBalance(userId: number, gc: number = 0, sc: number = 0) {
    const query = `
      INSERT INTO user_balances (user_id, gold_coins, sweeps_coins)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET
        gold_coins = user_balances.gold_coins + $2,
        sweeps_coins = user_balances.sweeps_coins + $3,
        last_updated = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await this.query(query, [userId, gc * 1000, sc]); // Convert to proper units
    return result.rows[0];
  }

  async getUserBalance(userId: number) {
    const query = `
      SELECT ub.*, u.email, u.username 
      FROM user_balances ub
      JOIN users u ON u.id = ub.user_id
      WHERE ub.user_id = $1
    `;
    const result = await this.query(query, [userId]);
    return result.rows[0];
  }

  async updateUserBalance(userId: number, gcChange: number, scChange: number, description: string, gameId?: string) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update balance
      const balanceQuery = `
        UPDATE user_balances 
        SET gold_coins = GREATEST(0, gold_coins + $2),
            sweeps_coins = GREATEST(0, sweeps_coins + $3),
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *
      `;
      const balanceResult = await client.query(balanceQuery, [userId, gcChange * 1000, scChange]);
      
      // Record transactions
      if (gcChange !== 0) {
        const txnQuery = `
          INSERT INTO transactions (user_id, transaction_type, currency, amount, balance_after, description, game_id, status)
          VALUES ($1, $2, 'GC', $3, $4, $5, $6, 'completed')
        `;
        await client.query(txnQuery, [
          userId,
          gcChange > 0 ? 'win' : 'bet',
          Math.abs(gcChange * 1000),
          balanceResult.rows[0].gold_coins,
          description,
          gameId
        ]);
      }
      
      if (scChange !== 0) {
        const txnQuery = `
          INSERT INTO transactions (user_id, transaction_type, currency, amount, balance_after, description, game_id, status)
          VALUES ($1, $2, 'SC', $3, $4, $5, $6, 'completed')
        `;
        await client.query(txnQuery, [
          userId,
          scChange > 0 ? 'win' : 'bet',
          Math.abs(scChange),
          balanceResult.rows[0].sweeps_coins,
          description,
          gameId
        ]);
      }
      
      await client.query('COMMIT');
      return balanceResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Game management
  async getAllGames() {
    const query = `
      SELECT *, 
        (total_profit_gc * 0.45) as current_jackpot_calculated,
        (total_profit_sc * 0.45) as current_jackpot_sc_calculated
      FROM games 
      ORDER BY is_featured DESC, name ASC
    `;
    const result = await this.query(query);
    return result.rows;
  }

  async getActiveGames() {
    const query = `
      SELECT *, 
        (total_profit_gc * 0.45) as current_jackpot_calculated,
        (total_profit_sc * 0.45) as current_jackpot_sc_calculated
      FROM games 
      WHERE is_active = TRUE
      ORDER BY is_featured DESC, name ASC
    `;
    const result = await this.query(query);
    return result.rows;
  }

  async updateGameStats(gameId: string, profitGC: number, profitSC: number) {
    const query = `
      UPDATE games 
      SET total_profit_gc = total_profit_gc + $2,
          total_profit_sc = total_profit_sc + $3,
          current_jackpot_gc = (total_profit_gc + $2) * 0.45,
          current_jackpot_sc = (total_profit_sc + $3) * 0.45,
          total_plays = total_plays + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE game_id = $1
      RETURNING *
    `;
    const result = await this.query(query, [gameId, profitGC * 1000, profitSC]);
    return result.rows[0];
  }

  // Admin methods
  async getAllUsers(limit: number = 50, offset: number = 0) {
    const query = `
      SELECT u.*, ub.gold_coins, ub.sweeps_coins
      FROM users u
      LEFT JOIN user_balances ub ON u.id = ub.user_id
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.query(query, [limit, offset]);
    return result.rows;
  }

  async getRecentTransactions(limit: number = 50) {
    const query = `
      SELECT t.*, u.username, u.email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT $1
    `;
    const result = await this.query(query, [limit]);
    return result.rows;
  }

  async getLiveStats() {
    const query = 'SELECT * FROM live_stats ORDER BY stat_name';
    const result = await this.query(query);
    
    const stats: Record<string, any> = {};
    result.rows.forEach(row => {
      stats[row.stat_name] = {
        value: parseFloat(row.stat_value),
        metadata: row.stat_metadata,
        updated_at: row.updated_at
      };
    });
    
    return stats;
  }

  async updateLiveStat(statName: string, value: number, metadata?: any) {
    const query = `
      INSERT INTO live_stats (stat_name, stat_value, stat_metadata)
      VALUES ($1, $2, $3)
      ON CONFLICT (stat_name) DO UPDATE SET
        stat_value = $2,
        stat_metadata = $3,
        updated_at = CURRENT_TIMESTAMP
    `;
    const result = await this.query(query, [statName, value, metadata || {}]);
    return result.rows[0];
  }

  // AI Employees
  async getAIEmployees() {
    const query = 'SELECT * FROM ai_employees ORDER BY created_at ASC';
    const result = await this.query(query);
    return result.rows;
  }

  async updateAIEmployeeMetrics(id: number, tasksCompleted: number, moneySaved: number) {
    const query = `
      UPDATE ai_employees 
      SET total_tasks_completed = total_tasks_completed + $2,
          money_saved_usd = money_saved_usd + $3,
          last_active = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.query(query, [id, tasksCompleted, moneySaved]);
    return result.rows[0];
  }

  // Notifications
  async createAdminNotification(title: string, message: string, type: string, fromAI?: number, actionRequired: boolean = false, actionUrl?: string) {
    const query = `
      INSERT INTO admin_notifications (title, message, notification_type, from_ai_employee, action_required, action_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await this.query(query, [title, message, type, fromAI, actionRequired, actionUrl]);
    return result.rows[0];
  }

  async getUnreadNotifications() {
    const query = `
      SELECT an.*, ae.name as ai_name
      FROM admin_notifications an
      LEFT JOIN ai_employees ae ON an.from_ai_employee = ae.id
      WHERE an.read_status = FALSE
      ORDER BY an.priority DESC, an.created_at DESC
    `;
    const result = await this.query(query);
    return result.rows;
  }

  async markNotificationRead(id: number) {
    const query = `
      UPDATE admin_notifications 
      SET read_status = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  // Coin packages
  async getCoinPackages() {
    const query = 'SELECT * FROM coin_packages WHERE is_active = TRUE ORDER BY sort_order, price_usd';
    const result = await this.query(query);
    return result.rows;
  }

  // Daily wheel spins
  async getDailyWheelSpin(userId: number, date: string = new Date().toISOString().split('T')[0]) {
    const query = 'SELECT * FROM wheel_spins WHERE user_id = $1 AND spin_date = $2';
    const result = await this.query(query, [userId, date]);
    return result.rows[0];
  }

  async createWheelSpin(userId: number, scWon: number) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create wheel spin record
      const spinQuery = `
        INSERT INTO wheel_spins (user_id, sc_won)
        VALUES ($1, $2)
        RETURNING *
      `;
      const spinResult = await client.query(spinQuery, [userId, scWon]);
      
      // Update user balance
      await this.updateUserBalance(userId, 0, scWon, 'Daily Wheel Spin');
      
      await client.query('COMMIT');
      return spinResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Close pool connection
  async close() {
    await this.pool.end();
  }
}

export const databaseService = DatabaseService.getInstance();
export default databaseService;
