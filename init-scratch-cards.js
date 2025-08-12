// Scratch cards system initialization script
async function initializeScratchCards() {
  console.log("🎰 Initializing CoinKrazy scratch cards system...");

  try {
    // Run scratch cards schema initialization
    console.log("📋 Creating scratch cards tables...");
    const scratchCardsResponse = await fetch(
      "http://localhost:8080/api/scratch-cards/init",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const scratchCardsResult = await scratchCardsResponse.json();

    if (scratchCardsResult.success) {
      console.log("✅ Scratch cards system initialized successfully!");
      console.log("🎯 Scratch card features now available:");
      console.log("   1. Multiple themed scratch card types");
      console.log("   2. Real-time game mechanics with prize calculation");
      console.log("   3. Interactive scratch animations");
      console.log("   4. Admin management interface");
      console.log("   5. Comprehensive analytics and reporting");
      console.log("   6. Prize management and distribution");
      console.log("");
      console.log("🔗 Access at: http://localhost:8080/scratch-cards");
      console.log("🔧 Admin panel: http://localhost:8080/admin (Scratch Cards tab)");
    } else {
      console.log("❌ Scratch cards initialization failed:", scratchCardsResult.error);
    }
  } catch (error) {
    console.error("💥 Scratch cards initialization failed:", error.message);
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
  await initializeScratchCards();
}

main();
