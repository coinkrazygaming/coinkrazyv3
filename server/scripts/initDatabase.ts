import { createTables, seedDatabase } from "../database/neon-db.js";

async function initializeDatabase() {
  try {
    console.log("🗄️ Initializing CoinKrazy database...");

    // Create all tables
    console.log("Creating database tables...");
    await createTables();

    // Seed initial data
    console.log("Seeding database with initial data...");
    await seedDatabase();

    console.log("✅ Database initialization completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export default initializeDatabase;
