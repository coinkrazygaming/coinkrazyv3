import { neon, neonConfig } from '@neondatabase/serverless';
import { User } from '../types/auth';

// Configure Neon for edge runtime
neonConfig.fetchConnectionCache = true;

export interface UserData extends User {
  password_hash?: string;
  role?: 'user' | 'admin' | 'vip';
  vip_level?: number;
  total_deposited?: number;
  lifetime_gc_earned?: number;
  lifetime_sc_earned?: number;
  affiliate_code?: string;
  referred_by?: string;
  login_streak?: number;
  last_login_bonus?: Date;
  compliance_verified?: boolean;
  kyc_documents?: Record<string, any>;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_id: string;
  provider: string;
  game_type: 'slot' | 'table' | 'live' | 'sports' | 'bingo' | 'poker';
  start_time: Date;
  end_time?: Date;
  total_wagered_gc: number;
  total_wagered_sc: number;
  total_won_gc: number;
  total_won_sc: number;
  session_length: number;
  ip_address?: string;
  device_info?: Record<string, any>;
  status: 'active' | 'completed' | 'disconnected';
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'game_win' | 'game_loss' | 'bonus' | 'purchase' | 'redemption';
  amount: number;
  currency: 'GC' | 'SC' | 'USD';
  balance_before: number;
  balance_after: number;
  description: string;
  reference_id?: string;
  game_session_id?: string;
  payment_method?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface VIPProgram {
  id: string;
  user_id: string;
  level: number;
  level_name: string;
  points_current: number;
  points_required_next: number;
  benefits: string[];
  cashback_rate: number;
  bonus_multiplier: number;
  priority_support: boolean;
  exclusive_games: boolean;
  monthly_bonus_gc: number;
  monthly_bonus_sc: number;
  withdrawal_limit_increase: number;
  created_at: Date;
  updated_at: Date;
}

export interface AdminAction {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: 'user' | 'transaction' | 'game_session' | 'system';
  target_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: Date;
}

class RealNeonService {
  private sql: any;
  private isConnected: boolean = false;
  private connectionString: string;

  constructor() {
    this.connectionString = process.env.VITE_NEON_CONNECTION_STRING || 
      'postgresql://coinfrazy_user:secure_password@ep-silent-surf-a1b2c3d4.us-east-1.aws.neon.tech/coinfrazy_production?sslmode=require';
    
    this.sql = neon(this.connectionString);
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      console.log('🔗 Connecting to Neon PostgreSQL...');
      
      // Test connection
      await this.sql`SELECT NOW() as current_time`;
      this.isConnected = true;
      console.log('✅ Neon Database connected successfully');

      // Initialize tables
      await this.createTables();
      
      // Insert default data
      await this.insertDefaultData();
      
    } catch (error) {
      console.error('❌ Failed to connect to Neon:', error);
      this.isConnected = false;
    }
  }

  private async createTables() {
    try {
      // Users table
      await this.sql`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(255) UNIQUE,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          password_hash VARCHAR(255),
          email_verified BOOLEAN DEFAULT FALSE,
          status VARCHAR(50) DEFAULT 'pending_verification',
          kyc_status VARCHAR(50) DEFAULT 'none',
          role VARCHAR(50) DEFAULT 'user',
          vip_level INTEGER DEFAULT 0,
          gc_balance DECIMAL(15,2) DEFAULT 0,
          sc_balance DECIMAL(15,4) DEFAULT 0,
          bonus_balance DECIMAL(15,2) DEFAULT 0,
          total_deposited DECIMAL(15,2) DEFAULT 0,
          lifetime_gc_earned DECIMAL(15,2) DEFAULT 0,
          lifetime_sc_earned DECIMAL(15,4) DEFAULT 0,
          affiliate_code VARCHAR(50),
          referred_by VARCHAR(255),
          login_streak INTEGER DEFAULT 0,
          last_login_bonus TIMESTAMP,
          compliance_verified BOOLEAN DEFAULT FALSE,
          kyc_documents JSONB,
          preferences JSONB,
          metadata JSONB,
          join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Transactions table
      await this.sql`
        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          type VARCHAR(50) NOT NULL,
          amount DECIMAL(15,4) NOT NULL,
          currency VARCHAR(10) NOT NULL,
          balance_before DECIMAL(15,4) NOT NULL,
          balance_after DECIMAL(15,4) NOT NULL,
          description TEXT,
          reference_id VARCHAR(255),
          game_session_id VARCHAR(255),
          payment_method VARCHAR(100),
          status VARCHAR(50) DEFAULT 'pending',
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Game sessions table
      await this.sql`
        CREATE TABLE IF NOT EXISTS game_sessions (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          game_id VARCHAR(255) NOT NULL,
          provider VARCHAR(100) NOT NULL,
          game_type VARCHAR(50) NOT NULL,
          start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          end_time TIMESTAMP,
          total_wagered_gc DECIMAL(15,2) DEFAULT 0,
          total_wagered_sc DECIMAL(15,4) DEFAULT 0,
          total_won_gc DECIMAL(15,2) DEFAULT 0,
          total_won_sc DECIMAL(15,4) DEFAULT 0,
          session_length INTEGER DEFAULT 0,
          ip_address VARCHAR(45),
          device_info JSONB,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // VIP programs table
      await this.sql`
        CREATE TABLE IF NOT EXISTS vip_programs (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          level INTEGER DEFAULT 1,
          level_name VARCHAR(100),
          points_current INTEGER DEFAULT 0,
          points_required_next INTEGER DEFAULT 1000,
          benefits TEXT[],
          cashback_rate DECIMAL(5,4) DEFAULT 0.01,
          bonus_multiplier DECIMAL(5,2) DEFAULT 1.0,
          priority_support BOOLEAN DEFAULT FALSE,
          exclusive_games BOOLEAN DEFAULT FALSE,
          monthly_bonus_gc DECIMAL(15,2) DEFAULT 0,
          monthly_bonus_sc DECIMAL(15,4) DEFAULT 0,
          withdrawal_limit_increase DECIMAL(15,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Admin actions table
      await this.sql`
        CREATE TABLE IF NOT EXISTS admin_actions (
          id VARCHAR(255) PRIMARY KEY,
          admin_user_id VARCHAR(255) REFERENCES users(id),
          action VARCHAR(255) NOT NULL,
          target_type VARCHAR(50),
          target_id VARCHAR(255),
          details JSONB,
          ip_address VARCHAR(45),
          user_agent TEXT,
          severity VARCHAR(50) DEFAULT 'info',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create indexes for better performance
      await this.sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
      await this.sql`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`;
      await this.sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`;
      await this.sql`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)`;
      await this.sql`CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id)`;
      await this.sql`CREATE INDEX IF NOT EXISTS idx_game_sessions_start_time ON game_sessions(start_time)`;
      await this.sql`CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at)`;

      console.log('📋 Database tables created/verified successfully');
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  private async insertDefaultData() {
    try {
      // Check if admin user exists
      const adminUser = await this.sql`
        SELECT id FROM users WHERE email = 'coinkrazy00@gmail.com'
      `;

      if (adminUser.length === 0) {
        // Create admin user
        await this.sql`
          INSERT INTO users (
            id, email, username, first_name, last_name, 
            email_verified, status, role, gc_balance, sc_balance,
            preferences, join_date, last_login
          ) VALUES (
            'admin_coinkrazy_001',
            'coinkrazy00@gmail.com',
            'CoinKrazy Admin',
            'CoinKrazy',
            'Admin',
            true,
            'active',
            'admin',
            1000000,
            500.00,
            '{"theme": "dark", "currency": "USD", "notifications": {"email": true, "sms": false}}',
            NOW(),
            NOW()
          )
        `;

        // Create VIP program for admin
        await this.sql`
          INSERT INTO vip_programs (
            id, user_id, level, level_name, points_current, points_required_next,
            benefits, cashback_rate, bonus_multiplier, priority_support,
            exclusive_games, monthly_bonus_gc, monthly_bonus_sc
          ) VALUES (
            'vip_admin_001',
            'admin_coinkrazy_001',
            10,
            'Owner',
            999999,
            999999,
            ARRAY['Unlimited everything', 'Full admin access', 'All features unlocked'],
            0.10,
            5.0,
            true,
            true,
            100000,
            250.00
          )
        `;

        console.log('✅ Default admin user created');
      }

      // Create sample demo user if not exists
      const demoUser = await this.sql`
        SELECT id FROM users WHERE email = 'demo@coinfrazy.com'
      `;

      if (demoUser.length === 0) {
        await this.sql`
          INSERT INTO users (
            id, email, username, first_name, last_name,
            email_verified, status, gc_balance, sc_balance,
            join_date, last_login
          ) VALUES (
            'demo_user_001',
            'demo@coinfrazy.com',
            'DemoUser',
            'Demo',
            'User',
            true,
            'active',
            25000,
            75.50,
            NOW() - INTERVAL '30 days',
            NOW()
          )
        `;

        console.log('✅ Demo user created');
      }

    } catch (error) {
      console.error('Failed to insert default data:', error);
    }
  }

  // User management methods
  async createUser(userData: Partial<UserData>): Promise<UserData> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await this.sql`
      INSERT INTO users (
        id, email, username, first_name, last_name,
        email_verified, status, kyc_status, gc_balance, sc_balance,
        preferences, join_date
      ) VALUES (
        ${id},
        ${userData.email},
        ${userData.username || userData.email?.split('@')[0]},
        ${userData.firstName || ''},
        ${userData.lastName || ''},
        ${userData.emailVerified || false},
        ${userData.status || 'pending_verification'},
        ${userData.kycStatus || 'none'},
        ${userData.gcBalance || 0},
        ${userData.scBalance || 0},
        ${JSON.stringify(userData.preferences || {})},
        NOW()
      ) RETURNING *
    `;

    return this.mapUserFromDb(user);
  }

  async getUserById(id: string): Promise<UserData | null> {
    const [user] = await this.sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    
    return user ? this.mapUserFromDb(user) : null;
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    const [user] = await this.sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    return user ? this.mapUserFromDb(user) : null;
  }

  async updateUser(id: string, updates: Partial<UserData>): Promise<UserData> {
    const setClause = Object.keys(updates).map(key => {
      const dbKey = this.camelToSnake(key);
      return `${dbKey} = $${dbKey}`;
    }).join(', ');

    const values = Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [
        this.camelToSnake(key),
        typeof value === 'object' ? JSON.stringify(value) : value
      ])
    );

    const [user] = await this.sql`
      UPDATE users 
      SET ${this.sql.unsafe(setClause)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `.params(values);

    return this.mapUserFromDb(user);
  }

  async getAllUsers(limit: number = 100, offset: number = 0): Promise<UserData[]> {
    const users = await this.sql`
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return users.map(this.mapUserFromDb);
  }

  // Transaction methods
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [result] = await this.sql`
      INSERT INTO transactions (
        id, user_id, type, amount, currency, balance_before, balance_after,
        description, reference_id, game_session_id, payment_method, status, metadata
      ) VALUES (
        ${id}, ${transaction.user_id}, ${transaction.type}, ${transaction.amount},
        ${transaction.currency}, ${transaction.balance_before}, ${transaction.balance_after},
        ${transaction.description}, ${transaction.reference_id}, ${transaction.game_session_id},
        ${transaction.payment_method}, ${transaction.status}, ${JSON.stringify(transaction.metadata || {})}
      ) RETURNING *
    `;

    return this.mapTransactionFromDb(result);
  }

  async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    const transactions = await this.sql`
      SELECT * FROM transactions 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    
    return transactions.map(this.mapTransactionFromDb);
  }

  // VIP methods
  async getVIPProgram(userId: string): Promise<VIPProgram | null> {
    const [vip] = await this.sql`
      SELECT * FROM vip_programs WHERE user_id = ${userId}
    `;
    
    return vip ? this.mapVIPFromDb(vip) : null;
  }

  async updateVIPProgram(userId: string, updates: Partial<VIPProgram>): Promise<VIPProgram> {
    const [vip] = await this.sql`
      UPDATE vip_programs 
      SET level = ${updates.level}, level_name = ${updates.level_name},
          points_current = ${updates.points_current}, points_required_next = ${updates.points_required_next},
          benefits = ${updates.benefits}, cashback_rate = ${updates.cashback_rate},
          bonus_multiplier = ${updates.bonus_multiplier}, priority_support = ${updates.priority_support},
          exclusive_games = ${updates.exclusive_games}, monthly_bonus_gc = ${updates.monthly_bonus_gc},
          monthly_bonus_sc = ${updates.monthly_bonus_sc}, withdrawal_limit_increase = ${updates.withdrawal_limit_increase},
          updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;

    return this.mapVIPFromDb(vip);
  }

  // Admin methods
  async logAdminAction(action: Omit<AdminAction, 'id' | 'created_at'>): Promise<void> {
    const id = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.sql`
      INSERT INTO admin_actions (
        id, admin_user_id, action, target_type, target_id,
        details, ip_address, user_agent, severity
      ) VALUES (
        ${id}, ${action.admin_user_id}, ${action.action}, ${action.target_type},
        ${action.target_id}, ${JSON.stringify(action.details)}, ${action.ip_address},
        ${action.user_agent}, ${action.severity}
      )
    `;
  }

  async getAdminActions(limit: number = 100): Promise<AdminAction[]> {
    const actions = await this.sql`
      SELECT * FROM admin_actions 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    
    return actions.map(this.mapAdminActionFromDb);
  }

  // Helper methods
  private mapUserFromDb(user: any): UserData {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: user.email_verified,
      status: user.status,
      kycStatus: user.kyc_status,
      role: user.role,
      vipLevel: user.vip_level,
      gcBalance: parseFloat(user.gc_balance),
      scBalance: parseFloat(user.sc_balance),
      bonusBalance: parseFloat(user.bonus_balance),
      totalDeposited: parseFloat(user.total_deposited),
      lifetimeGcEarned: parseFloat(user.lifetime_gc_earned),
      lifetimeScEarned: parseFloat(user.lifetime_sc_earned),
      affiliateCode: user.affiliate_code,
      referredBy: user.referred_by,
      loginStreak: user.login_streak,
      lastLoginBonus: user.last_login_bonus ? new Date(user.last_login_bonus) : undefined,
      complianceVerified: user.compliance_verified,
      kycDocuments: user.kyc_documents || {},
      preferences: user.preferences || {},
      metadata: user.metadata || {},
      joinDate: new Date(user.join_date),
      lastLogin: user.last_login ? new Date(user.last_login) : undefined,
    };
  }

  private mapTransactionFromDb(tx: any): Transaction {
    return {
      id: tx.id,
      user_id: tx.user_id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      currency: tx.currency,
      balance_before: parseFloat(tx.balance_before),
      balance_after: parseFloat(tx.balance_after),
      description: tx.description,
      reference_id: tx.reference_id,
      game_session_id: tx.game_session_id,
      payment_method: tx.payment_method,
      status: tx.status,
      metadata: tx.metadata || {},
      created_at: new Date(tx.created_at),
      updated_at: new Date(tx.updated_at),
    };
  }

  private mapVIPFromDb(vip: any): VIPProgram {
    return {
      id: vip.id,
      user_id: vip.user_id,
      level: vip.level,
      level_name: vip.level_name,
      points_current: vip.points_current,
      points_required_next: vip.points_required_next,
      benefits: vip.benefits || [],
      cashback_rate: parseFloat(vip.cashback_rate),
      bonus_multiplier: parseFloat(vip.bonus_multiplier),
      priority_support: vip.priority_support,
      exclusive_games: vip.exclusive_games,
      monthly_bonus_gc: parseFloat(vip.monthly_bonus_gc),
      monthly_bonus_sc: parseFloat(vip.monthly_bonus_sc),
      withdrawal_limit_increase: parseFloat(vip.withdrawal_limit_increase),
      created_at: new Date(vip.created_at),
      updated_at: new Date(vip.updated_at),
    };
  }

  private mapAdminActionFromDb(action: any): AdminAction {
    return {
      id: action.id,
      admin_user_id: action.admin_user_id,
      action: action.action,
      target_type: action.target_type,
      target_id: action.target_id,
      details: action.details || {},
      ip_address: action.ip_address,
      user_agent: action.user_agent,
      severity: action.severity,
      created_at: new Date(action.created_at),
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  // Status methods
  isConnected(): boolean {
    return this.isConnected;
  }

  async healthCheck(): Promise<{ status: string; timestamp: Date; database: string }> {
    try {
      const result = await this.sql`SELECT NOW() as current_time, current_database() as db_name`;
      return {
        status: 'healthy',
        timestamp: new Date(result[0].current_time),
        database: result[0].db_name
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        database: 'unknown'
      };
    }
  }
}

export const realNeonService = new RealNeonService();
