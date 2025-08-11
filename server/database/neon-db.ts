import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Neon database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Database schema for CoinKrazy
export const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin')),
        is_verified BOOLEAN DEFAULT false,
        kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // User balances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_balances (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        currency VARCHAR(10) NOT NULL CHECK (currency IN ('GC', 'SC')),
        balance DECIMAL(15, 2) DEFAULT 0,
        locked_balance DECIMAL(15, 2) DEFAULT 0,
        total_deposited DECIMAL(15, 2) DEFAULT 0,
        total_won DECIMAL(15, 2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, currency)
      )
    `);

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'win', 'bet', 'bonus', 'transfer')),
        currency VARCHAR(10) NOT NULL CHECK (currency IN ('GC', 'SC')),
        amount DECIMAL(15, 2) NOT NULL,
        balance_before DECIMAL(15, 2) NOT NULL,
        balance_after DECIMAL(15, 2) NOT NULL,
        description TEXT,
        game_id VARCHAR(100),
        session_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      )
    `);

    // Game sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id VARCHAR(100) NOT NULL,
        currency VARCHAR(10) NOT NULL CHECK (currency IN ('GC', 'SC')),
        start_balance DECIMAL(15, 2) NOT NULL,
        current_balance DECIMAL(15, 2) NOT NULL,
        total_bets DECIMAL(15, 2) DEFAULT 0,
        total_wins DECIMAL(15, 2) DEFAULT 0,
        spin_count INTEGER DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        metadata JSONB
      )
    `);

    // User preferences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        notification_settings JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
        game_settings JSONB DEFAULT '{"sound": true, "autoplay": false, "theme": "dark"}',
        privacy_settings JSONB DEFAULT '{"profile_public": false, "show_wins": true}',
        social_settings JSONB DEFAULT '{"friend_requests": true, "chat_enabled": true}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Daily rewards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_rewards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reward_date DATE NOT NULL,
        currency VARCHAR(10) NOT NULL CHECK (currency IN ('GC', 'SC')),
        amount DECIMAL(15, 2) NOT NULL,
        streak_day INTEGER NOT NULL,
        claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, reward_date)
      )
    `);

    // Chat messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        room_id VARCHAR(100) DEFAULT 'general',
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'win_announcement')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_active ON game_sessions(is_active);
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Seed initial data
export const seedDatabase = async () => {
  const client = await pool.connect();
  
  try {
    // Create default admin user
    const adminResult = await client.query(`
      INSERT INTO users (email, username, password_hash, role, is_verified, kyc_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['admin@coinkrazy.com', 'admin', '$2b$10$hash_here', 'admin', true, 'verified']);

    // Create test staff user
    const staffResult = await client.query(`
      INSERT INTO users (email, username, password_hash, role, is_verified, kyc_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['staff@coinkrazy.com', 'staff_user', '$2b$10$hash_here', 'staff', true, 'verified']);

    // Create test regular user
    const userResult = await client.query(`
      INSERT INTO users (email, username, password_hash, role, is_verified, kyc_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['user@coinkrazy.com', 'test_user', '$2b$10$hash_here', 'user', true, 'verified']);

    // Get user IDs (either newly created or existing)
    const users = await client.query(`
      SELECT id, email FROM users WHERE email IN ($1, $2, $3)
    `, ['admin@coinkrazy.com', 'staff@coinkrazy.com', 'user@coinkrazy.com']);

    // Seed balances for each user
    for (const user of users.rows) {
      // Add GC balance
      await client.query(`
        INSERT INTO user_balances (user_id, currency, balance, total_deposited)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, currency) 
        DO UPDATE SET balance = EXCLUDED.balance, total_deposited = EXCLUDED.total_deposited
      `, [user.id, 'GC', 50000, 50000]);

      // Add SC balance  
      await client.query(`
        INSERT INTO user_balances (user_id, currency, balance, total_won)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, currency)
        DO UPDATE SET balance = EXCLUDED.balance, total_won = EXCLUDED.total_won
      `, [user.id, 'SC', user.email === 'admin@coinkrazy.com' ? 3724 : 25, user.email === 'admin@coinkrazy.com' ? 3724 : 25]);

      // Create user preferences
      await client.query(`
        INSERT INTO user_preferences (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
      `, [user.id]);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
