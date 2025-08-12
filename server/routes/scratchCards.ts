import express from 'express';
import { scratchCardService } from '../services/scratchCardService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import databaseService from '../services/database.js';

const router = express.Router();

// ===== SCRATCH CARD INITIALIZATION =====

// Initialize scratch card system (Admin only)
router.post('/init', requireAdmin, async (req, res) => {
  try {
    // Read and execute scratch card schema
    const schemaPath = join(process.cwd(), 'server', 'database', 'scratch-cards-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await databaseService.query(statement);
      }
    }
    
    console.log('Scratch card schema initialized successfully');
    
    res.json({
      success: true,
      message: 'Scratch card system initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing scratch card system:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize scratch card system',
      details: error.message,
    });
  }
});

// ===== PUBLIC ENDPOINTS (User-facing) =====

// Get available scratch card types
router.get('/types', async (req, res) => {
  try {
    const cardTypes = await scratchCardService.getCardTypes(true);
    
    res.json({
      success: true,
      data: cardTypes,
    });
  } catch (error) {
    console.error('Error fetching card types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch card types',
    });
  }
});

// Get specific card type details
router.get('/types/:id', async (req, res) => {
  try {
    const cardTypeId = parseInt(req.params.id);
    const cardType = await scratchCardService.getCardTypeById(cardTypeId);
    
    if (!cardType) {
      return res.status(404).json({
        success: false,
        error: 'Card type not found',
      });
    }

    // Get prizes for this card type
    const prizes = await scratchCardService.getPrizesForCardType(cardTypeId);
    
    res.json({
      success: true,
      data: {
        ...cardType,
        prizes,
      },
    });
  } catch (error) {
    console.error('Error fetching card type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch card type',
    });
  }
});

// Get themes
router.get('/themes', async (req, res) => {
  try {
    const themes = await scratchCardService.getThemes();
    
    res.json({
      success: true,
      data: themes,
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch themes',
    });
  }
});

// ===== AUTHENTICATED USER ENDPOINTS =====

// Purchase a scratch card
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const { cardTypeId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (!cardTypeId) {
      return res.status(400).json({
        success: false,
        error: 'Card type ID is required',
      });
    }

    // Get client information
    const clientInfo = {
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      timestamp: new Date(),
    };

    const cardInstance = await scratchCardService.purchaseCard(userId, cardTypeId, clientInfo);
    
    res.json({
      success: true,
      data: cardInstance,
      message: 'Scratch card purchased successfully',
    });
  } catch (error) {
    console.error('Error purchasing card:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to purchase card',
    });
  }
});

// Scratch an area on a card
router.post('/scratch', authenticateToken, async (req, res) => {
  try {
    const { instanceId, areaIndex } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (!instanceId || areaIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Instance ID and area index are required',
      });
    }

    const result = await scratchCardService.scratchArea(instanceId, areaIndex, userId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error scratching area:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to scratch area',
    });
  }
});

// Claim prize from a winning card
router.post('/claim-prize', authenticateToken, async (req, res) => {
  try {
    const { instanceId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (!instanceId) {
      return res.status(400).json({
        success: false,
        error: 'Instance ID is required',
      });
    }

    const result = await scratchCardService.claimPrize(instanceId, userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Prize claimed successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to claim prize',
      });
    }
  } catch (error) {
    console.error('Error claiming prize:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to claim prize',
    });
  }
});

// Get user's scratch cards
router.get('/my-cards', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const cards = await scratchCardService.getUserCards(userId, status, limit);
    
    res.json({
      success: true,
      data: cards,
    });
  } catch (error) {
    console.error('Error fetching user cards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user cards',
    });
  }
});

// Get specific card instance
router.get('/card/:instanceId', authenticateToken, async (req, res) => {
  try {
    const { instanceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const card = await scratchCardService.getCardInstance(instanceId, userId);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found',
      });
    }

    res.json({
      success: true,
      data: card,
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch card',
    });
  }
});

// ===== ADMIN ENDPOINTS =====

// Get all themes (Admin)
router.get('/admin/themes', requireAdmin, async (req, res) => {
  try {
    const themes = await scratchCardService.getThemes();
    
    res.json({
      success: true,
      data: themes,
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch themes',
    });
  }
});

// Create new theme (Admin)
router.post('/admin/themes', requireAdmin, async (req, res) => {
  try {
    const theme = await scratchCardService.createTheme(req.body);
    
    res.json({
      success: true,
      data: theme,
      message: 'Theme created successfully',
    });
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create theme',
    });
  }
});

// Get all card types (Admin)
router.get('/admin/types', requireAdmin, async (req, res) => {
  try {
    const activeOnly = req.query.active_only === 'true';
    const cardTypes = await scratchCardService.getCardTypes(activeOnly);
    
    res.json({
      success: true,
      data: cardTypes,
    });
  } catch (error) {
    console.error('Error fetching card types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch card types',
    });
  }
});

// Create new card type (Admin)
router.post('/admin/types', requireAdmin, async (req, res) => {
  try {
    const cardType = await scratchCardService.createCardType(req.body);
    
    res.json({
      success: true,
      data: cardType,
      message: 'Card type created successfully',
    });
  } catch (error) {
    console.error('Error creating card type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create card type',
    });
  }
});

// Update card type (Admin)
router.put('/admin/types/:id', requireAdmin, async (req, res) => {
  try {
    const cardTypeId = parseInt(req.params.id);
    const updates = req.body;

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined && key !== 'id') {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
    }

    const query = `
      UPDATE scratch_card_types 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(cardTypeId);
    const result = await databaseService.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Card type not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Card type updated successfully',
    });
  } catch (error) {
    console.error('Error updating card type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update card type',
    });
  }
});

// Get prizes for card type (Admin)
router.get('/admin/types/:id/prizes', requireAdmin, async (req, res) => {
  try {
    const cardTypeId = parseInt(req.params.id);
    const prizes = await scratchCardService.getPrizesForCardType(cardTypeId);
    
    res.json({
      success: true,
      data: prizes,
    });
  } catch (error) {
    console.error('Error fetching prizes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prizes',
    });
  }
});

// Create new prize (Admin)
router.post('/admin/prizes', requireAdmin, async (req, res) => {
  try {
    const prize = await scratchCardService.createPrize(req.body);
    
    res.json({
      success: true,
      data: prize,
      message: 'Prize created successfully',
    });
  } catch (error) {
    console.error('Error creating prize:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create prize',
    });
  }
});

// Get all card instances (Admin)
router.get('/admin/instances', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;
    const cardTypeId = req.query.card_type_id ? parseInt(req.query.card_type_id as string) : null;

    let query = `
      SELECT 
        sci.*,
        ct.display_name as card_name,
        t.display_name as theme_name,
        u.username,
        u.email
      FROM scratch_card_instances sci
      JOIN scratch_card_types ct ON sci.card_type_id = ct.id
      JOIN scratch_card_themes t ON ct.theme_id = t.id
      JOIN users u ON sci.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND sci.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (cardTypeId) {
      query += ` AND sci.card_type_id = $${paramIndex}`;
      values.push(cardTypeId);
      paramIndex++;
    }

    query += ` ORDER BY sci.purchased_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await databaseService.query(query, values);
    
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching card instances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch card instances',
    });
  }
});

// Get scratch card analytics (Admin)
router.get('/admin/analytics', requireAdmin, async (req, res) => {
  try {
    const cardTypeId = req.query.card_type_id ? parseInt(req.query.card_type_id as string) : undefined;
    const days = parseInt(req.query.days as string) || 30;

    const analytics = await scratchCardService.getScratchCardAnalytics(cardTypeId, days);
    
    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
    });
  }
});

// Get top winners (Admin)
router.get('/admin/top-winners', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const topWinners = await scratchCardService.getTopWinners(limit);
    
    res.json({
      success: true,
      data: topWinners,
    });
  } catch (error) {
    console.error('Error fetching top winners:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top winners',
    });
  }
});

// Get scratch card statistics (Admin)
router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_cards_sold,
        COUNT(DISTINCT user_id) as total_players,
        SUM(purchase_cost_gc) as total_revenue_gc,
        SUM(purchase_cost_sc) as total_revenue_sc,
        SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as total_wins,
        SUM(winnings_gc) as total_winnings_gc,
        SUM(winnings_sc) as total_winnings_sc,
        COUNT(CASE WHEN status = 'unscratched' THEN 1 END) as unscratched_cards,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_cards,
        COUNT(CASE WHEN is_winner = true AND prize_claimed = false THEN 1 END) as unclaimed_prizes
      FROM scratch_card_instances
      WHERE purchased_at >= CURRENT_DATE - INTERVAL '24 hours'
    `;

    const result = await databaseService.query(statsQuery);
    const stats = result.rows[0];

    // Get card type breakdown
    const typeStatsQuery = `
      SELECT 
        ct.display_name,
        COUNT(*) as cards_sold,
        SUM(sci.purchase_cost_gc) as revenue_gc,
        SUM(sci.purchase_cost_sc) as revenue_sc,
        SUM(CASE WHEN sci.is_winner THEN 1 ELSE 0 END) as wins
      FROM scratch_card_instances sci
      JOIN scratch_card_types ct ON sci.card_type_id = ct.id
      WHERE sci.purchased_at >= CURRENT_DATE - INTERVAL '24 hours'
      GROUP BY ct.id, ct.display_name
      ORDER BY cards_sold DESC
    `;

    const typeStatsResult = await databaseService.query(typeStatsQuery);

    res.json({
      success: true,
      data: {
        overall: stats,
        by_type: typeStatsResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
});

// Export card instances to CSV (Admin)
router.get('/admin/export', requireAdmin, async (req, res) => {
  try {
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    let query = `
      SELECT 
        sci.instance_id,
        sci.purchased_at,
        sci.completed_at,
        ct.display_name as card_type,
        u.username,
        u.email,
        sci.purchase_cost_gc,
        sci.purchase_cost_sc,
        sci.status,
        sci.is_winner,
        sci.winnings_gc,
        sci.winnings_sc,
        sci.prize_claimed
      FROM scratch_card_instances sci
      JOIN scratch_card_types ct ON sci.card_type_id = ct.id
      JOIN users u ON sci.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (startDate) {
      query += ` AND sci.purchased_at >= $${paramIndex}`;
      values.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND sci.purchased_at <= $${paramIndex}`;
      values.push(endDate);
      paramIndex++;
    }

    query += ' ORDER BY sci.purchased_at DESC';

    const result = await databaseService.query(query, values);
    
    // Convert to CSV
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No data found for export',
      });
    }

    const headers = Object.keys(result.rows[0]);
    const csvContent = [
      headers.join(','),
      ...result.rows.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=scratch-cards-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data',
    });
  }
});

// ===== SYSTEM MANAGEMENT =====

// Cleanup expired cards (Admin)
router.post('/admin/cleanup-expired', requireAdmin, async (req, res) => {
  try {
    const query = `
      UPDATE scratch_card_instances 
      SET status = 'expired'
      WHERE expires_at < CURRENT_TIMESTAMP AND status = 'unscratched'
      RETURNING COUNT(*)
    `;
    
    const result = await databaseService.query(query);
    
    res.json({
      success: true,
      message: `${result.rowCount} expired cards cleaned up`,
    });
  } catch (error) {
    console.error('Error cleaning up expired cards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup expired cards',
    });
  }
});

export default router;
