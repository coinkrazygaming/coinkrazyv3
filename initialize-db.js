// Database initialization script
async function initializeDatabase() {
  console.log("🚀 Initializing CoinKrazy database...");

  try {
    // First, seed the database
    console.log("📋 Seeding database tables and data...");
    const seedResponse = await fetch("http://localhost:8080/api/seed-database", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const seedResult = await seedResponse.json();
    
    if (seedResult.success) {
      console.log("✅ Database seeded successfully!");
    } else {
      console.log("❌ Database seeding failed:", seedResult.error);
      return;
    }

    // Then create/verify admin user
    console.log("👑 Creating admin user...");
    const adminResponse = await fetch("http://localhost:8080/api/init-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const adminResult = await adminResponse.json();
    
    if (adminResult.success) {
      console.log("✅ Admin user ready!");
      console.log("🔑 Login Credentials:");
      console.log("   Email: coinkrazy00@gmail.com");
      console.log("   Password: Woot6969!");
      console.log("");
      console.log("🎯 You can now:");
      console.log("   1. Navigate to http://localhost:8080/login");
      console.log("   2. Click 'Create Admin User' (if needed)");
      console.log("   3. Login with the credentials above");
      console.log("   4. Access the admin panel at http://localhost:8080/admin");
    } else {
      console.log("❌ Admin user creation failed:", adminResult.error);
    }

  } catch (error) {
    console.error("�� Database initialization failed:", error.message);
    console.log("");
    console.log("🔧 Troubleshooting:");
    console.log("   1. Make sure the dev server is running (npm run dev)");
    console.log("   2. Check that the Neon DB connection is working");
    console.log("   3. Verify the DATABASE_URL is correct");
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch("http://localhost:8080/api/ping");
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

async function main() {
  console.log("🔍 Checking if server is running...");
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log("❌ Server not running. Please start it first:");
    console.log("   npm run dev");
    return;
  }
  
  console.log("✅ Server is running!");
  await initializeDatabase();
}

main();
