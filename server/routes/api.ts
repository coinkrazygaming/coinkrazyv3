import express from "express";
import bcrypt from "bcryptjs";
import databaseService from "../services/database.js";

const router = express.Router();

// Authentication endpoints
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Get user by email
    const user = await databaseService.getUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (user.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "Account has been suspended. Contact support.",
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check email verification
    if (!user.is_email_verified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email address before logging in. Check your inbox for the verification link.",
        requiresEmailVerification: true,
      });
    }

    // Update last login
    await databaseService.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id],
    );

    // Generate session token
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36);

    // Clean user object (remove sensitive data)
    const cleanUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status,
      kyc_status: user.kyc_status,
      is_email_verified: user.is_email_verified,
      vip_expires_at: user.vip_expires_at,
      created_at: user.created_at,
      last_login: new Date(),
      isLoggedIn: true,
      isAdmin: user.role === "admin",
    };

    res.json({
      success: true,
      user: cleanUser,
      token,
      message: "Login successful!",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

router.post("/auth/register", async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, dateOfBirth } =
      req.body;

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, username, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check age requirement (18+)
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        return res.status(400).json({
          success: false,
          message: "You must be 18 or older to register",
        });
      }
    }

    // Check if email already exists
    const existingEmail = await databaseService.getUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email address is already registered",
      });
    }

    // Check if username already exists
    const existingUsername = await databaseService.getUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await databaseService.createUser({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      username: username,
      first_name: firstName,
      last_name: lastName,
    });

    res.json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account and claim your welcome bonus.",
      requiresEmailVerification: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// User management endpoints
router.post("/users", async (req, res) => {
  try {
    const user = await databaseService.createUser(req.body);
    res.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/users/email/:email", async (req, res) => {
  try {
    const user = await databaseService.getUserByEmail(req.params.email);
    res.json(user);
  } catch (error) {
    console.error("Error getting user by email:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.get("/users/username/:username", async (req, res) => {
  try {
    const user = await databaseService.getUserByUsername(req.params.username);
    res.json(user);
  } catch (error) {
    console.error("Error getting user by username:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.post("/users/verify-email", async (req, res) => {
  try {
    const user = await databaseService.verifyEmail(req.body.token);
    res.json(user);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
});

// Balance management endpoints
router.get("/balances/:userId", async (req, res) => {
  try {
    const balance = await databaseService.getUserBalance(
      parseInt(req.params.userId),
    );
    res.json(balance);
  } catch (error) {
    console.error("Error getting user balance:", error);
    res.status(500).json({ error: "Failed to get balance" });
  }
});

router.post("/balances/:userId/update", async (req, res) => {
  try {
    const { gcChange, scChange, description, gameId } = req.body;
    const balance = await databaseService.updateUserBalance(
      parseInt(req.params.userId),
      gcChange,
      scChange,
      description,
      gameId,
    );
    res.json(balance);
  } catch (error) {
    console.error("Error updating balance:", error);
    res.status(500).json({ error: "Failed to update balance" });
  }
});

// Game management endpoints
router.get("/games", async (req, res) => {
  try {
    const games = await databaseService.getAllGames();
    res.json(games);
  } catch (error) {
    console.error("Error getting games:", error);
    res.status(500).json({ error: "Failed to get games" });
  }
});

router.get("/games/active", async (req, res) => {
  try {
    const games = await databaseService.getActiveGames();
    res.json(games);
  } catch (error) {
    console.error("Error getting active games:", error);
    res.status(500).json({ error: "Failed to get active games" });
  }
});

router.post("/games/:gameId/stats", async (req, res) => {
  try {
    const { profitGC, profitSC } = req.body;
    const game = await databaseService.updateGameStats(
      req.params.gameId,
      profitGC,
      profitSC,
    );
    res.json(game);
  } catch (error) {
    console.error("Error updating game stats:", error);
    res.status(500).json({ error: "Failed to update game stats" });
  }
});

// Admin endpoints
router.get("/admin/users", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const users = await databaseService.getAllUsers(limit, offset);
    res.json(users);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

router.get("/admin/transactions", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await databaseService.getRecentTransactions(limit);
    res.json(transactions);
  } catch (error) {
    console.error("Error getting transactions:", error);
    res.status(500).json({ error: "Failed to get transactions" });
  }
});

router.get("/admin/stats", async (req, res) => {
  try {
    const stats = await databaseService.getLiveStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getting live stats:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.post("/admin/stats/:statName", async (req, res) => {
  try {
    const { value, metadata } = req.body;
    const stat = await databaseService.updateLiveStat(
      req.params.statName,
      value,
      metadata,
    );
    res.json(stat);
  } catch (error) {
    console.error("Error updating stat:", error);
    res.status(500).json({ error: "Failed to update stat" });
  }
});

// AI Employee endpoints
router.get("/ai-employees", async (req, res) => {
  try {
    const employees = await databaseService.getAIEmployees();
    res.json(employees);
  } catch (error) {
    console.error("Error getting AI employees:", error);
    res.status(500).json({ error: "Failed to get AI employees" });
  }
});

router.post("/ai-employees/:id/metrics", async (req, res) => {
  try {
    const { tasksCompleted, moneySaved } = req.body;
    const employee = await databaseService.updateAIEmployeeMetrics(
      parseInt(req.params.id),
      tasksCompleted,
      moneySaved,
    );
    res.json(employee);
  } catch (error) {
    console.error("Error updating AI employee metrics:", error);
    res.status(500).json({ error: "Failed to update metrics" });
  }
});

// Notification endpoints
router.post("/notifications", async (req, res) => {
  try {
    const { title, message, type, fromAI, actionRequired, actionUrl } =
      req.body;
    const notification = await databaseService.createAdminNotification(
      title,
      message,
      type,
      fromAI,
      actionRequired,
      actionUrl,
    );
    res.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

router.get("/notifications/unread", async (req, res) => {
  try {
    const notifications = await databaseService.getUnreadNotifications();
    res.json(notifications);
  } catch (error) {
    console.error("Error getting unread notifications:", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

router.post("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await databaseService.markNotificationRead(
      parseInt(req.params.id),
    );
    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Coin package endpoints
router.get("/coin-packages", async (req, res) => {
  try {
    const packages = await databaseService.getCoinPackages();
    res.json(packages);
  } catch (error) {
    console.error("Error getting coin packages:", error);
    res.status(500).json({ error: "Failed to get coin packages" });
  }
});

// Daily wheel spin endpoints
router.get("/wheel-spins/:userId", async (req, res) => {
  try {
    const date = req.query.date as string;
    const spin = await databaseService.getDailyWheelSpin(
      parseInt(req.params.userId),
      date,
    );
    res.json(spin);
  } catch (error) {
    console.error("Error getting wheel spin:", error);
    res.status(500).json({ error: "Failed to get wheel spin" });
  }
});

router.post("/wheel-spins/:userId", async (req, res) => {
  try {
    const { scWon } = req.body;
    const spin = await databaseService.createWheelSpin(
      parseInt(req.params.userId),
      scWon,
    );
    res.json(spin);
  } catch (error) {
    console.error("Error creating wheel spin:", error);
    res.status(500).json({ error: "Failed to create wheel spin" });
  }
});

export default router;
