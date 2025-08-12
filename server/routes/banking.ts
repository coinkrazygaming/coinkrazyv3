import express from "express";
import { bankingService } from "../services/bankingService.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { readFileSync } from "fs";
import { join } from "path";
import databaseService from "../services/database.js";

const router = express.Router();

// ===== BANKING INITIALIZATION ENDPOINT =====

// Initialize banking system (Admin only)
router.post("/init", requireAdmin, async (req, res) => {
  try {
    // Read and execute banking schema
    const schemaPath = join(
      process.cwd(),
      "server",
      "database",
      "banking-schema.sql",
    );
    const schema = readFileSync(schemaPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = schema
      .split(";")
      .filter((stmt) => stmt.trim().length > 0);

    for (const statement of statements) {
      await databaseService.query(statement);
    }

    console.log("Banking schema initialized successfully");

    res.json({
      success: true,
      message: "Banking system initialized successfully",
    });
  } catch (error) {
    console.error("Error initializing banking system:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initialize banking system",
      details: error.message,
    });
  }
});

// ===== PAYMENT PROVIDERS ENDPOINTS =====

// Get all payment providers (Admin only)
router.get("/providers", requireAdmin, async (req, res) => {
  try {
    const providers = await bankingService.getPaymentProviders();
    res.json({
      success: true,
      data: providers,
    });
  } catch (error) {
    console.error("Error fetching payment providers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment providers",
    });
  }
});

// Get specific payment provider (Admin only)
router.get("/providers/:id", requireAdmin, async (req, res) => {
  try {
    const provider = await bankingService.getPaymentProvider(
      parseInt(req.params.id),
    );
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: "Payment provider not found",
      });
    }

    res.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error("Error fetching payment provider:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment provider",
    });
  }
});

// Create payment provider (Admin only)
router.post("/providers", requireAdmin, async (req, res) => {
  try {
    const provider = await bankingService.createPaymentProvider(req.body);
    res.status(201).json({
      success: true,
      data: provider,
      message: "Payment provider created successfully",
    });
  } catch (error) {
    console.error("Error creating payment provider:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment provider",
    });
  }
});

// Update payment provider (Admin only)
router.put("/providers/:id", requireAdmin, async (req, res) => {
  try {
    const provider = await bankingService.updatePaymentProvider(
      parseInt(req.params.id),
      req.body,
    );
    res.json({
      success: true,
      data: provider,
      message: "Payment provider updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment provider:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update payment provider",
    });
  }
});

// ===== PAYMENT METHODS ENDPOINTS =====

// Get all payment methods (Admin only)
router.get("/methods", requireAdmin, async (req, res) => {
  try {
    const methods = await bankingService.getPaymentMethods();
    res.json({
      success: true,
      data: methods,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment methods",
    });
  }
});

// Get active payment methods (Public)
router.get("/methods/active", async (req, res) => {
  try {
    const methods = await bankingService.getActivePaymentMethods();
    // Remove sensitive information for public endpoint
    const publicMethods = methods.map((method) => ({
      id: method.id,
      name: method.name,
      type: method.type,
      icon_url: method.icon_url,
      min_deposit: method.min_deposit,
      max_deposit: method.max_deposit,
      min_withdrawal: method.min_withdrawal,
      max_withdrawal: method.max_withdrawal,
      deposit_fee_percent: method.deposit_fee_percent,
      deposit_fee_fixed: method.deposit_fee_fixed,
      withdrawal_fee_percent: method.withdrawal_fee_percent,
      withdrawal_fee_fixed: method.withdrawal_fee_fixed,
      requires_kyc: method.requires_kyc,
      requires_documents: method.requires_documents,
    }));

    res.json({
      success: true,
      data: publicMethods,
    });
  } catch (error) {
    console.error("Error fetching active payment methods:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment methods",
    });
  }
});

// Create payment method (Admin only)
router.post("/methods", requireAdmin, async (req, res) => {
  try {
    const method = await bankingService.createPaymentMethod(req.body);
    res.status(201).json({
      success: true,
      data: method,
      message: "Payment method created successfully",
    });
  } catch (error) {
    console.error("Error creating payment method:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment method",
    });
  }
});

// Update payment method (Admin only)
router.put("/methods/:id", requireAdmin, async (req, res) => {
  try {
    const method = await bankingService.updatePaymentMethod(
      parseInt(req.params.id),
      req.body,
    );
    res.json({
      success: true,
      data: method,
      message: "Payment method updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update payment method",
    });
  }
});

// ===== TRANSACTION ENDPOINTS =====

// Get transactions (Admin can see all, users see their own)
router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const filters: any = {
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    // Non-admin users can only see their own transactions
    if (!isAdmin) {
      filters.user_id = req.user?.id;
    } else {
      // Admin can filter by user_id if provided
      if (req.query.user_id) {
        filters.user_id = parseInt(req.query.user_id as string);
      }
    }

    if (req.query.type) filters.type = req.query.type as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.start_date)
      filters.start_date = new Date(req.query.start_date as string);
    if (req.query.end_date)
      filters.end_date = new Date(req.query.end_date as string);

    const transactions = await bankingService.getTransactions(filters);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: transactions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
    });
  }
});

// Process deposit
router.post("/deposit", authenticateToken, async (req, res) => {
  try {
    const { payment_method_id, amount, payment_details } = req.body;
    const userId = req.user?.id;

    if (!userId || !payment_method_id || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid deposit parameters",
      });
    }

    const transaction = await bankingService.processDeposit(
      userId,
      payment_method_id,
      amount,
      payment_details,
    );

    res.json({
      success: true,
      data: transaction,
      message: "Deposit initiated successfully",
    });
  } catch (error) {
    console.error("Error processing deposit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process deposit",
    });
  }
});

// Update transaction status (Admin only)
router.put(
  "/transactions/:transaction_id/status",
  requireAdmin,
  async (req, res) => {
    try {
      const { status, details } = req.body;
      const transactionId = req.params.transaction_id;

      const transaction = await bankingService.updateTransactionStatus(
        transactionId,
        status,
        details,
      );

      res.json({
        success: true,
        data: transaction,
        message: "Transaction status updated successfully",
      });
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update transaction status",
      });
    }
  },
);

// ===== WITHDRAWAL ENDPOINTS =====

// Get withdrawal requests
router.get("/withdrawals", authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const filters: any = {
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    // Non-admin users can only see their own withdrawals
    if (!isAdmin) {
      filters.user_id = req.user?.id;
    } else {
      // Admin can filter by user_id if provided
      if (req.query.user_id) {
        filters.user_id = parseInt(req.query.user_id as string);
      }
    }

    if (req.query.status) filters.status = req.query.status as string;

    const withdrawals = await bankingService.getWithdrawalRequests(filters);

    res.json({
      success: true,
      data: withdrawals,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: withdrawals.length,
      },
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch withdrawal requests",
    });
  }
});

// Create withdrawal request
router.post("/withdrawals", authenticateToken, async (req, res) => {
  try {
    const { amount, method, destination_details } = req.body;
    const userId = req.user?.id;

    if (!userId || !amount || !method || !destination_details || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid withdrawal parameters",
      });
    }

    const withdrawal = await bankingService.createWithdrawalRequest(
      userId,
      amount,
      method,
      destination_details,
    );

    res.status(201).json({
      success: true,
      data: withdrawal,
      message: "Withdrawal request created successfully",
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create withdrawal request",
    });
  }
});

// Approve withdrawal (Admin only)
router.put("/withdrawals/:id/approve", requireAdmin, async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.id);
    const approvedBy = req.user?.id;

    if (!approvedBy) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const withdrawal = await bankingService.approveWithdrawal(
      withdrawalId,
      approvedBy,
    );

    res.json({
      success: true,
      data: withdrawal,
      message: "Withdrawal approved successfully",
    });
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to approve withdrawal",
    });
  }
});

// Reject withdrawal (Admin only)
router.put("/withdrawals/:id/reject", requireAdmin, async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.id);
    const rejectedBy = req.user?.id;
    const { reason } = req.body;

    if (!rejectedBy || !reason) {
      return res.status(400).json({
        success: false,
        error: "Missing rejection reason",
      });
    }

    const withdrawal = await bankingService.rejectWithdrawal(
      withdrawalId,
      reason,
      rejectedBy,
    );

    res.json({
      success: true,
      data: withdrawal,
      message: "Withdrawal rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting withdrawal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reject withdrawal",
    });
  }
});

// ===== BANKING SETTINGS ENDPOINTS =====

// Get banking settings (Admin only)
router.get("/settings", requireAdmin, async (req, res) => {
  try {
    const settings = await bankingService.getBankingSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching banking settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch banking settings",
    });
  }
});

// Update banking settings (Admin only)
router.put("/settings/:setting_key", requireAdmin, async (req, res) => {
  try {
    const settingKey = req.params.setting_key;
    const settingValue = req.body.value;
    const updatedBy = req.user?.id;

    if (!updatedBy) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    await bankingService.updateBankingSettings(
      settingKey,
      settingValue,
      updatedBy,
    );

    res.json({
      success: true,
      message: "Banking settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating banking settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update banking settings",
    });
  }
});

// ===== ANALYTICS ENDPOINTS =====

// Get banking analytics (Admin only)
router.get("/analytics", requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await bankingService.getBankingAnalytics(days);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching banking analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch banking analytics",
    });
  }
});

// Get transaction volume (Admin only)
router.get("/analytics/volume", requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const volume = await bankingService.getTransactionVolume(days);

    res.json({
      success: true,
      data: volume,
    });
  } catch (error) {
    console.error("Error fetching transaction volume:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transaction volume",
    });
  }
});

// ===== RISK ASSESSMENT ENDPOINTS =====

// Calculate risk score for transaction (Admin only)
router.post("/risk/calculate", requireAdmin, async (req, res) => {
  try {
    const { user_id, amount, payment_method_id } = req.body;

    if (!user_id || !amount || !payment_method_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
      });
    }

    const riskScore = await bankingService.calculateRiskScore(
      user_id,
      amount,
      payment_method_id,
    );

    res.json({
      success: true,
      data: {
        user_id,
        amount,
        payment_method_id,
        risk_score: riskScore,
        risk_level: riskScore < 30 ? "low" : riskScore < 70 ? "medium" : "high",
      },
    });
  } catch (error) {
    console.error("Error calculating risk score:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate risk score",
    });
  }
});

export default router;
