import express from "express";
import { seedDatabase } from "../scripts/seedDatabase.js";

const router = express.Router();

// Database seeding endpoint
router.post("/seed-database", async (req, res) => {
  try {
    console.log("Starting database seeding via API...");
    const result = await seedDatabase();

    if (result.success) {
      res.json({
        success: true,
        message: "Database seeded successfully",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Database seeding failed",
        details: result.error,
      });
    }
  } catch (error) {
    console.error("Seeding API error:", error);
    res.status(500).json({
      success: false,
      error: "Database seeding failed",
      details: error.message,
    });
  }
});

export default router;
