import express from 'express';
import databaseService from '../services/database.js';

const router = express.Router();

// User management endpoints
router.post('/users', async (req, res) => {
  try {
    const user = await databaseService.createUser(req.body);
    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.get('/users/email/:email', async (req, res) => {
  try {
    const user = await databaseService.getUserByEmail(req.params.email);
    res.json(user);
  } catch (error) {
    console.error('Error getting user by email:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.get('/users/username/:username', async (req, res) => {
  try {
    const user = await databaseService.getUserByUsername(req.params.username);
    res.json(user);
  } catch (error) {
    console.error('Error getting user by username:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.post('/users/verify-email', async (req, res) => {
  try {
    const user = await databaseService.verifyEmail(req.body.token);
    res.json(user);
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Balance management endpoints
router.get('/balances/:userId', async (req, res) => {
  try {
    const balance = await databaseService.getUserBalance(parseInt(req.params.userId));
    res.json(balance);
  } catch (error) {
    console.error('Error getting user balance:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

router.post('/balances/:userId/update', async (req, res) => {
  try {
    const { gcChange, scChange, description, gameId } = req.body;
    const balance = await databaseService.updateUserBalance(
      parseInt(req.params.userId),
      gcChange,
      scChange,
      description,
      gameId
    );
    res.json(balance);
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

// Game management endpoints
router.get('/games', async (req, res) => {
  try {
    const games = await databaseService.getAllGames();
    res.json(games);
  } catch (error) {
    console.error('Error getting games:', error);
    res.status(500).json({ error: 'Failed to get games' });
  }
});

router.get('/games/active', async (req, res) => {
  try {
    const games = await databaseService.getActiveGames();
    res.json(games);
  } catch (error) {
    console.error('Error getting active games:', error);
    res.status(500).json({ error: 'Failed to get active games' });
  }
});

router.post('/games/:gameId/stats', async (req, res) => {
  try {
    const { profitGC, profitSC } = req.body;
    const game = await databaseService.updateGameStats(req.params.gameId, profitGC, profitSC);
    res.json(game);
  } catch (error) {
    console.error('Error updating game stats:', error);
    res.status(500).json({ error: 'Failed to update game stats' });
  }
});

// Admin endpoints
router.get('/admin/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const users = await databaseService.getAllUsers(limit, offset);
    res.json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.get('/admin/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await databaseService.getRecentTransactions(limit);
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

router.get('/admin/stats', async (req, res) => {
  try {
    const stats = await databaseService.getLiveStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting live stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.post('/admin/stats/:statName', async (req, res) => {
  try {
    const { value, metadata } = req.body;
    const stat = await databaseService.updateLiveStat(req.params.statName, value, metadata);
    res.json(stat);
  } catch (error) {
    console.error('Error updating stat:', error);
    res.status(500).json({ error: 'Failed to update stat' });
  }
});

// AI Employee endpoints
router.get('/ai-employees', async (req, res) => {
  try {
    const employees = await databaseService.getAIEmployees();
    res.json(employees);
  } catch (error) {
    console.error('Error getting AI employees:', error);
    res.status(500).json({ error: 'Failed to get AI employees' });
  }
});

router.post('/ai-employees/:id/metrics', async (req, res) => {
  try {
    const { tasksCompleted, moneySaved } = req.body;
    const employee = await databaseService.updateAIEmployeeMetrics(
      parseInt(req.params.id),
      tasksCompleted,
      moneySaved
    );
    res.json(employee);
  } catch (error) {
    console.error('Error updating AI employee metrics:', error);
    res.status(500).json({ error: 'Failed to update metrics' });
  }
});

// Notification endpoints
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, type, fromAI, actionRequired, actionUrl } = req.body;
    const notification = await databaseService.createAdminNotification(
      title,
      message,
      type,
      fromAI,
      actionRequired,
      actionUrl
    );
    res.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.get('/notifications/unread', async (req, res) => {
  try {
    const notifications = await databaseService.getUnreadNotifications();
    res.json(notifications);
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

router.post('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await databaseService.markNotificationRead(parseInt(req.params.id));
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Coin package endpoints
router.get('/coin-packages', async (req, res) => {
  try {
    const packages = await databaseService.getCoinPackages();
    res.json(packages);
  } catch (error) {
    console.error('Error getting coin packages:', error);
    res.status(500).json({ error: 'Failed to get coin packages' });
  }
});

// Daily wheel spin endpoints
router.get('/wheel-spins/:userId', async (req, res) => {
  try {
    const date = req.query.date as string;
    const spin = await databaseService.getDailyWheelSpin(parseInt(req.params.userId), date);
    res.json(spin);
  } catch (error) {
    console.error('Error getting wheel spin:', error);
    res.status(500).json({ error: 'Failed to get wheel spin' });
  }
});

router.post('/wheel-spins/:userId', async (req, res) => {
  try {
    const { scWon } = req.body;
    const spin = await databaseService.createWheelSpin(parseInt(req.params.userId), scWon);
    res.json(spin);
  } catch (error) {
    console.error('Error creating wheel spin:', error);
    res.status(500).json({ error: 'Failed to create wheel spin' });
  }
});

export default router;
