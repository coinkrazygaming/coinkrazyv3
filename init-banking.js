// Banking system initialization script
async function initializeBanking() {
  console.log("🏦 Initializing CoinKrazy banking system...");

  try {
    // Run banking schema initialization
    console.log("📋 Creating banking tables...");
    const bankingResponse = await fetch(
      "http://localhost:8080/api/banking/init",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const bankingResult = await bankingResponse.json();

    if (bankingResult.success) {
      console.log("✅ Banking system initialized successfully!");
      console.log("🎯 Banking features now available:");
      console.log("   1. Payment provider management");
      console.log("   2. Real payment processing");
      console.log("   3. Transaction monitoring");
      console.log("   4. Withdrawal management");
      console.log("   5. Risk assessment & fraud detection");
      console.log("   6. Banking analytics");
      console.log("");
      console.log("🔗 Access at: http://localhost:8080/admin (Banking tab)");
    } else {
      console.log("❌ Banking initialization failed:", bankingResult.error);
    }
  } catch (error) {
    console.error("💥 Banking initialization failed:", error.message);
    console.log("");
    console.log("🔧 Troubleshooting:");
    console.log("   1. Make sure the dev server is running (npm run dev)");
    console.log("   2. Check that the main database is initialized first");
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
  await initializeBanking();
}

main();
