import databaseService from "../services/database.js";

// Database seeding data
const seedData = {
  admin: {
    email: "coinkrazy00@gmail.com",
    password: "Woot6969!",
    username: "admin",
    first_name: "Admin",
    last_name: "User"
  },
  games: [
    {
      game_id: "gates-of-olympus",
      name: "Gates of Olympus",
      provider: "Pragmatic Play",
      category: "slots",
      rtp: 96.5,
      max_win_multiplier: 5000,
      min_bet_gc: 20,
      max_bet_gc: 10000,
      min_bet_sc: 1,
      max_bet_sc: 100,
      image_url: "https://cdn.pragmaticplay.net/game_pic/rec/200/vs20olympgate.png",
      is_active: true,
      is_featured: true
    },
    {
      game_id: "book-of-dead",
      name: "Book of Dead",
      provider: "Play'n GO",
      category: "slots",
      rtp: 96.21,
      max_win_multiplier: 5000,
      min_bet_gc: 20,
      max_bet_gc: 10000,
      min_bet_sc: 1,
      max_bet_sc: 100,
      image_url: "https://www.playngo.com/wp-content/uploads/game-icons/BookofDead.jpg",
      is_active: true,
      is_featured: true
    },
    {
      game_id: "sweet-bonanza",
      name: "Sweet Bonanza",
      provider: "Pragmatic Play",
      category: "slots",
      rtp: 96.48,
      max_win_multiplier: 21100,
      min_bet_gc: 20,
      max_bet_gc: 10000,
      min_bet_sc: 1,
      max_bet_sc: 100,
      image_url: "https://cdn.pragmaticplay.net/game_pic/rec/200/vs20fruitswx.png",
      is_active: true,
      is_featured: true
    },
    {
      game_id: "starburst",
      name: "Starburst",
      provider: "NetEnt",
      category: "slots",
      rtp: 96.09,
      max_win_multiplier: 500,
      min_bet_gc: 10,
      max_bet_gc: 10000,
      min_bet_sc: 1,
      max_bet_sc: 100,
      image_url: "https://www.netent.com/content/uploads/2018/10/starburst_thumbnail.jpg",
      is_active: true,
      is_featured: false
    },
    {
      game_id: "gonzo-quest",
      name: "Gonzo's Quest",
      provider: "NetEnt",
      category: "slots",
      rtp: 95.97,
      max_win_multiplier: 2500,
      min_bet_gc: 20,
      max_bet_gc: 10000,
      min_bet_sc: 1,
      max_bet_sc: 100,
      image_url: "https://www.netent.com/content/uploads/2018/10/gonzos_quest_thumbnail.jpg",
      is_active: true,
      is_featured: false
    }
  ],
  aiEmployees: [
    {
      name: "LuckyAI",
      role: "Customer Support",
      description: "Primary AI assistant for customer support and general inquiries",
      capabilities: "Customer support, game guidance, account assistance",
      status: "active"
    },
    {
      name: "SecurityBot",
      role: "Security Monitor",
      description: "Monitors platform security and fraud detection",
      capabilities: "Fraud detection, security monitoring, risk assessment",
      status: "active"
    },
    {
      name: "GameMaster",
      role: "Game Operations",
      description: "Manages game operations and RTP monitoring",
      capabilities: "Game monitoring, RTP analysis, jackpot management",
      status: "active"
    }
  ],
  coinPackages: [
    {
      name: "Starter Pack",
      description: "Perfect for new players",
      gold_coins: 100000,
      sweeps_coins: 0,
      bonus_gold_coins: 25000,
      bonus_sweeps_coins: 10,
      price_usd: 4.99,
      is_active: true,
      sort_order: 1
    },
    {
      name: "Bronze Pack",
      description: "Great value for regular players",
      gold_coins: 250000,
      sweeps_coins: 0,
      bonus_gold_coins: 75000,
      bonus_sweeps_coins: 25,
      price_usd: 9.99,
      is_active: true,
      sort_order: 2
    },
    {
      name: "Silver Pack",
      description: "Most popular choice",
      gold_coins: 600000,
      sweeps_coins: 0,
      bonus_gold_coins: 200000,
      bonus_sweeps_coins: 60,
      price_usd: 19.99,
      is_active: true,
      sort_order: 3
    },
    {
      name: "Gold Pack",
      description: "Maximum value and bonus",
      gold_coins: 1500000,
      sweeps_coins: 0,
      bonus_gold_coins: 500000,
      bonus_sweeps_coins: 150,
      price_usd: 49.99,
      is_active: true,
      sort_order: 4
    }
  ]
};

async function createTables() {
  console.log("Creating database tables...");
  
  // Users table
  await databaseService.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'vip')),
      status VARCHAR(20) DEFAULT 'pending_verification' CHECK (status IN ('active', 'suspended', 'banned', 'pending_verification')),
      kyc_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'verified', 'rejected')),
      kyc_documents JSONB DEFAULT '{}',
      date_of_birth DATE,
      phone_number VARCHAR(20),
      address JSONB DEFAULT '{}',
      is_email_verified BOOLEAN DEFAULT FALSE,
      email_verification_token VARCHAR(255),
      password_reset_token VARCHAR(255),
      password_reset_expires TIMESTAMP,
      vip_expires_at TIMESTAMP,
      ip_address INET,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User balances table
  await databaseService.query(`
    CREATE TABLE IF NOT EXISTS user_balances (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      gold_coins BIGINT DEFAULT 0,
      sweeps_coins INTEGER DEFAULT 0,
      total_deposited_usd DECIMAL(10,2) DEFAULT 0,
      total_withdrawn_usd DECIMAL(10,2) DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    )
  `);

  // Games table
  await databaseService.query(`
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      game_id VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      provider VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      rtp DECIMAL(5,2) DEFAULT 96.00,
      max_win_multiplier INTEGER DEFAULT 1000,
      min_bet_gc INTEGER DEFAULT 20,
      max_bet_gc INTEGER DEFAULT 10000,
      min_bet_sc INTEGER DEFAULT 1,
      max_bet_sc INTEGER DEFAULT 100,
      image_url TEXT,
      description TEXT,
      total_plays BIGINT DEFAULT 0,
      total_profit_gc BIGINT DEFAULT 0,
      total_profit_sc INTEGER DEFAULT 0,
      current_jackpot_gc BIGINT DEFAULT 0,
      current_jackpot_sc INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // AI employees table
  await databaseService.query(`
    CREATE TABLE IF NOT EXISTS ai_employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(100) NOT NULL,
      description TEXT,
      capabilities TEXT,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'offline')),
      total_tasks_completed INTEGER DEFAULT 0,
      money_saved_usd DECIMAL(10,2) DEFAULT 0,
      performance_score DECIMAL(3,2) DEFAULT 0.00,
      last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Coin packages table
  await databaseService.query(`
    CREATE TABLE IF NOT EXISTS coin_packages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      gold_coins INTEGER NOT NULL,
      sweeps_coins INTEGER DEFAULT 0,
      bonus_gold_coins INTEGER DEFAULT 0,
      bonus_sweeps_coins INTEGER DEFAULT 0,
      price_usd DECIMAL(10,2) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transactions table
  await databaseService.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'bet', 'win', 'bonus', 'refund')),
      currency VARCHAR(5) NOT NULL CHECK (currency IN ('GC', 'SC', 'USD')),
      amount DECIMAL(10,2) NOT NULL,
      balance_after BIGINT,
      description TEXT,
      game_id VARCHAR(100),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
      payment_method VARCHAR(50),
      payment_reference VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admin notifications table
  await databaseService.query(`
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      notification_type VARCHAR(50) DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'error', 'success')),
      from_ai_employee INTEGER REFERENCES ai_employees(id),
      priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
      action_required BOOLEAN DEFAULT FALSE,
      action_url TEXT,
      read_status BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Live stats table
  await databaseService.query(`
    CREATE TABLE IF NOT EXISTS live_stats (
      id SERIAL PRIMARY KEY,
      stat_name VARCHAR(100) UNIQUE NOT NULL,
      stat_value DECIMAL(15,2) NOT NULL,
      stat_metadata JSONB DEFAULT '{}',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Wheel spins table
  await databaseService.query(`
    CREATE TABLE IF NOT EXISTS wheel_spins (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      sc_won INTEGER NOT NULL,
      spin_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, spin_date)
    )
  `);

  console.log("Database tables created successfully!");
}

async function seedAdmin() {
  console.log("Seeding admin user...");
  
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.default.hash(seedData.admin.password, 12);
  
  try {
    const result = await databaseService.query(`
      INSERT INTO users (email, username, password_hash, first_name, last_name, role, status, is_email_verified)
      VALUES ($1, $2, $3, $4, $5, 'admin', 'active', TRUE)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $3,
        role = 'admin',
        status = 'active',
        is_email_verified = TRUE,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      seedData.admin.email,
      seedData.admin.username,
      passwordHash,
      seedData.admin.first_name,
      seedData.admin.last_name
    ]);
    
    const adminId = result.rows[0].id;
    
    // Create admin balance
    await databaseService.query(`
      INSERT INTO user_balances (user_id, gold_coins, sweeps_coins)
      VALUES ($1, 1000000, 1000)
      ON CONFLICT (user_id) DO UPDATE SET
        gold_coins = GREATEST(user_balances.gold_coins, 1000000),
        sweeps_coins = GREATEST(user_balances.sweeps_coins, 1000)
    `, [adminId]);
    
    console.log("Admin user seeded successfully!");
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
}

async function seedGames() {
  console.log("Seeding games...");
  
  for (const game of seedData.games) {
    try {
      await databaseService.query(`
        INSERT INTO games (
          game_id, name, provider, category, rtp, max_win_multiplier,
          min_bet_gc, max_bet_gc, min_bet_sc, max_bet_sc, image_url,
          is_active, is_featured
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (game_id) DO UPDATE SET
          name = $2,
          provider = $3,
          category = $4,
          rtp = $5,
          max_win_multiplier = $6,
          min_bet_gc = $7,
          max_bet_gc = $8,
          min_bet_sc = $9,
          max_bet_sc = $10,
          image_url = $11,
          is_active = $12,
          is_featured = $13,
          updated_at = CURRENT_TIMESTAMP
      `, [
        game.game_id, game.name, game.provider, game.category,
        game.rtp, game.max_win_multiplier, game.min_bet_gc, game.max_bet_gc,
        game.min_bet_sc, game.max_bet_sc, game.image_url,
        game.is_active, game.is_featured
      ]);
    } catch (error) {
      console.error(`Error seeding game ${game.name}:`, error);
    }
  }
  
  console.log("Games seeded successfully!");
}

async function seedAIEmployees() {
  console.log("Seeding AI employees...");
  
  for (const employee of seedData.aiEmployees) {
    try {
      await databaseService.query(`
        INSERT INTO ai_employees (name, role, description, capabilities, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE SET
          role = $2,
          description = $3,
          capabilities = $4,
          status = $5
      `, [
        employee.name, employee.role, employee.description,
        employee.capabilities, employee.status
      ]);
    } catch (error) {
      console.error(`Error seeding AI employee ${employee.name}:`, error);
    }
  }
  
  console.log("AI employees seeded successfully!");
}

async function seedCoinPackages() {
  console.log("Seeding coin packages...");
  
  for (const pkg of seedData.coinPackages) {
    try {
      await databaseService.query(`
        INSERT INTO coin_packages (
          name, description, gold_coins, sweeps_coins,
          bonus_gold_coins, bonus_sweeps_coins, price_usd,
          is_active, sort_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (name) DO UPDATE SET
          description = $2,
          gold_coins = $3,
          sweeps_coins = $4,
          bonus_gold_coins = $5,
          bonus_sweeps_coins = $6,
          price_usd = $7,
          is_active = $8,
          sort_order = $9
      `, [
        pkg.name, pkg.description, pkg.gold_coins, pkg.sweeps_coins,
        pkg.bonus_gold_coins, pkg.bonus_sweeps_coins, pkg.price_usd,
        pkg.is_active, pkg.sort_order
      ]);
    } catch (error) {
      console.error(`Error seeding coin package ${pkg.name}:`, error);
    }
  }
  
  console.log("Coin packages seeded successfully!");
}

async function seedLiveStats() {
  console.log("Seeding live stats...");
  
  const stats = [
    { name: "total_users", value: 1, metadata: { type: "counter" } },
    { name: "active_players", value: 0, metadata: { type: "gauge" } },
    { name: "total_games_played", value: 0, metadata: { type: "counter" } },
    { name: "total_jackpot_gc", value: 0, metadata: { type: "currency", currency: "GC" } },
    { name: "total_jackpot_sc", value: 0, metadata: { type: "currency", currency: "SC" } },
    { name: "platform_rtp", value: 96.5, metadata: { type: "percentage" } }
  ];
  
  for (const stat of stats) {
    try {
      await databaseService.query(`
        INSERT INTO live_stats (stat_name, stat_value, stat_metadata)
        VALUES ($1, $2, $3)
        ON CONFLICT (stat_name) DO UPDATE SET
          stat_value = EXCLUDED.stat_value,
          stat_metadata = EXCLUDED.stat_metadata,
          updated_at = CURRENT_TIMESTAMP
      `, [stat.name, stat.value, JSON.stringify(stat.metadata)]);
    } catch (error) {
      console.error(`Error seeding stat ${stat.name}:`, error);
    }
  }
  
  console.log("Live stats seeded successfully!");
}

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    await createTables();
    await seedAdmin();
    await seedGames();
    await seedAIEmployees();
    await seedCoinPackages();
    await seedLiveStats();
    
    console.log("Database seeding completed successfully!");
    return { success: true, message: "Database seeded successfully" };
  } catch (error) {
    console.error("Database seeding failed:", error);
    return { success: false, error: error.message };
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(result => {
    console.log("Seeding result:", result);
    process.exit(result.success ? 0 : 1);
  });
}
