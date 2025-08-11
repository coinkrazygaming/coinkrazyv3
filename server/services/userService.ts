import pool from "../database/neon-db.js";
import bcrypt from "bcryptjs";

export interface User {
  id: number;
  email: string;
  username: string;
  role: "user" | "staff" | "admin";
  is_verified: boolean;
  kyc_status: "pending" | "verified" | "rejected";
  created_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface UserBalance {
  currency: "GC" | "SC";
  balance: number;
  locked_balance: number;
  total_deposited: number;
  total_won: number;
}

export interface Transaction {
  id: number;
  transaction_type:
    | "deposit"
    | "withdrawal"
    | "win"
    | "bet"
    | "bonus"
    | "transfer";
  currency: "GC" | "SC";
  amount: number;
  balance_before: number;
  balance_after: number;
  description?: string;
  game_id?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  created_at: Date;
  metadata?: any;
}

class UserService {
  // Authenticate user
  async authenticateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        SELECT id, email, username, password_hash, role, is_verified, kyc_status, 
               created_at, last_login, is_active
        FROM users 
        WHERE email = $1 AND is_active = true
      `,
        [email],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash,
      );

      if (!isValidPassword) {
        return null;
      }

      // Update last login
      await client.query(
        `
        UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1
      `,
        [user.id],
      );

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        is_verified: user.is_verified,
        kyc_status: user.kyc_status,
        created_at: user.created_at,
        last_login: new Date(),
        is_active: user.is_active,
      };
    } catch (error) {
      console.error("Error authenticating user:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user by ID
  async getUserById(userId: number): Promise<User | null> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        SELECT id, email, username, role, is_verified, kyc_status, 
               created_at, last_login, is_active
        FROM users 
        WHERE id = $1 AND is_active = true
      `,
        [userId],
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user balances
  async getUserBalances(userId: number): Promise<UserBalance[]> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        SELECT currency, balance, locked_balance, total_deposited, total_won
        FROM user_balances 
        WHERE user_id = $1
      `,
        [userId],
      );

      return result.rows;
    } catch (error) {
      console.error("Error getting user balances:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update user balance
  async updateUserBalance(
    userId: number,
    currency: "GC" | "SC",
    amount: number,
    transactionType: Transaction["transaction_type"],
    description?: string,
    gameId?: string,
    sessionId?: string,
  ): Promise<{ newBalance: number; transactionId: number }> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get current balance
      const balanceResult = await client.query(
        `
        SELECT balance FROM user_balances 
        WHERE user_id = $1 AND currency = $2
      `,
        [userId, currency],
      );

      if (balanceResult.rows.length === 0) {
        throw new Error("User balance not found");
      }

      const currentBalance = parseFloat(balanceResult.rows[0].balance);
      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        throw new Error("Insufficient balance");
      }

      // Update balance
      await client.query(
        `
        UPDATE user_balances 
        SET balance = $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2 AND currency = $3
      `,
        [newBalance, userId, currency],
      );

      // Create transaction record
      const transactionResult = await client.query(
        `
        INSERT INTO transactions (
          user_id, transaction_type, currency, amount, 
          balance_before, balance_after, description, game_id, session_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `,
        [
          userId,
          transactionType,
          currency,
          amount,
          currentBalance,
          newBalance,
          description,
          gameId,
          sessionId,
        ],
      );

      await client.query("COMMIT");

      return {
        newBalance,
        transactionId: transactionResult.rows[0].id,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error updating user balance:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user transactions
  async getUserTransactions(
    userId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Transaction[]> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        SELECT id, transaction_type, currency, amount, balance_before, balance_after,
               description, game_id, status, created_at, metadata
        FROM transactions 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [userId, limit, offset],
      );

      return result.rows;
    } catch (error) {
      console.error("Error getting user transactions:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Create new user
  async createUser(
    email: string,
    username: string,
    password: string,
  ): Promise<User> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const userResult = await client.query(
        `
        INSERT INTO users (email, username, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, email, username, role, is_verified, kyc_status, created_at, is_active
      `,
        [email, username, passwordHash],
      );

      const user = userResult.rows[0];

      // Create initial balances
      await client.query(
        `
        INSERT INTO user_balances (user_id, currency, balance, total_deposited)
        VALUES ($1, 'GC', 50000, 50000), ($1, 'SC', 25, 25)
      `,
        [user.id],
      );

      // Create user preferences
      await client.query(
        `
        INSERT INTO user_preferences (user_id) VALUES ($1)
      `,
        [user.id],
      );

      await client.query("COMMIT");

      return user;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error creating user:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user preferences
  async getUserPreferences(userId: number): Promise<any> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        SELECT notification_settings, game_settings, privacy_settings, social_settings
        FROM user_preferences 
        WHERE user_id = $1
      `,
        [userId],
      );

      if (result.rows.length === 0) {
        // Create default preferences if not exist
        await client.query(
          `
          INSERT INTO user_preferences (user_id) VALUES ($1)
        `,
          [userId],
        );

        return {
          notification_settings: { email: true, sms: false, push: true },
          game_settings: { sound: true, autoplay: false, theme: "dark" },
          privacy_settings: { profile_public: false, show_wins: true },
          social_settings: { friend_requests: true, chat_enabled: true },
        };
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error getting user preferences:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update user preferences
  async updateUserPreferences(userId: number, preferences: any): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query(
        `
        UPDATE user_preferences 
        SET notification_settings = $1, game_settings = $2, 
            privacy_settings = $3, social_settings = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $5
      `,
        [
          preferences.notification_settings,
          preferences.game_settings,
          preferences.privacy_settings,
          preferences.social_settings,
          userId,
        ],
      );
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const userService = new UserService();
export default userService;
