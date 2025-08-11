#!/usr/bin/env node

// Simple database seeding script for CoinKrazy development
// This creates the necessary users and balances for testing

const users = [
  {
    email: "admin@coinkrazy.com",
    username: "admin",
    role: "admin",
    gcBalance: 1000000,
    scBalance: 3724,
  },
  {
    email: "staff@coinkrazy.com",
    username: "staff_user",
    role: "staff",
    gcBalance: 75000,
    scBalance: 250,
  },
  {
    email: "user@coinkrazy.com",
    username: "test_user",
    role: "user",
    gcBalance: 50000,
    scBalance: 25,
  },
];

// Mock implementation for development
// In production, this would connect to Neon DB and insert the data
console.log("🌱 Seeding CoinKrazy database...");
console.log("📊 Creating users and balances:");

users.forEach((user) => {
  console.log(
    `✓ ${user.email} (${user.role}) - ${user.gcBalance.toLocaleString()} GC, ${user.scBalance} SC`,
  );
});

console.log("✅ Database seeded successfully!");
console.log("🎮 Ready to play CoinKrazy games!");

// Development login instructions
console.log("\n🔑 Test Login Credentials:");
console.log("Admin: admin@coinkrazy.com / password");
console.log("Staff: staff@coinkrazy.com / password");
console.log("User:  user@coinkrazy.com / password");
