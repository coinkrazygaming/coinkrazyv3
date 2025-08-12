-- ===========================================
-- SCRATCH CARDS DATABASE SCHEMA
-- ===========================================
-- Production-ready schema for scratch card games
-- Supports multiple card types, prize tiers, and gameplay tracking

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS scratch_card_instances CASCADE;
DROP TABLE IF EXISTS scratch_card_prizes CASCADE;
DROP TABLE IF EXISTS scratch_card_types CASCADE;
DROP TABLE IF EXISTS scratch_card_themes CASCADE;

-- Scratch Card Themes
-- Different visual themes/styles for scratch cards
CREATE TABLE IF NOT EXISTS scratch_card_themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    background_image VARCHAR(255),
    scratch_overlay VARCHAR(255),
    card_design JSONB, -- Design configuration (colors, patterns, etc.)
    sound_effects JSONB, -- Sound configuration
    animation_config JSONB, -- Animation settings
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scratch Card Types
-- Different types of scratch cards with varying mechanics and odds
CREATE TABLE IF NOT EXISTS scratch_card_types (
    id SERIAL PRIMARY KEY,
    theme_id INTEGER REFERENCES scratch_card_themes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    card_image VARCHAR(255),
    scratch_area_config JSONB, -- Configuration for scratchable areas
    
    -- Game Mechanics
    game_type VARCHAR(50) DEFAULT 'match_three', -- match_three, symbol_match, instant_win, progressive
    min_symbols_to_match INTEGER DEFAULT 3,
    total_scratch_areas INTEGER DEFAULT 9,
    
    -- Pricing
    cost_gc INTEGER NOT NULL DEFAULT 1000, -- Gold coin cost
    cost_sc DECIMAL(10,2) DEFAULT 0, -- Sweeps coin cost
    currency_type VARCHAR(10) DEFAULT 'GC', -- GC, SC, or BOTH
    
    -- Prize Configuration
    max_prize_gc INTEGER DEFAULT 1000000,
    max_prize_sc DECIMAL(10,2) DEFAULT 1000.00,
    jackpot_enabled BOOLEAN DEFAULT false,
    progressive_jackpot BOOLEAN DEFAULT false,
    
    -- Odds and RTP
    overall_odds DECIMAL(10,6) DEFAULT 0.250000, -- 25% win rate
    rtp_percentage DECIMAL(5,2) DEFAULT 85.00, -- Return to Player
    
    -- Limits and Availability
    daily_purchase_limit INTEGER DEFAULT 50,
    max_instances_per_user INTEGER DEFAULT 100,
    purchase_requires_kyc BOOLEAN DEFAULT false,
    min_age_requirement INTEGER DEFAULT 18,
    
    -- Status and Metadata
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    launch_date TIMESTAMP,
    end_date TIMESTAMP,
    sort_order INTEGER DEFAULT 0,
    
    -- Analytics
    total_sold INTEGER DEFAULT 0,
    total_winnings_gc BIGINT DEFAULT 0,
    total_winnings_sc DECIMAL(15,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scratch Card Prizes
-- Prize structure for each card type
CREATE TABLE IF NOT EXISTS scratch_card_prizes (
    id SERIAL PRIMARY KEY,
    card_type_id INTEGER REFERENCES scratch_card_types(id) ON DELETE CASCADE,
    
    -- Prize Details
    prize_tier VARCHAR(50) NOT NULL, -- instant, tier1, tier2, tier3, jackpot
    prize_name VARCHAR(100) NOT NULL,
    prize_description TEXT,
    
    -- Prize Values
    prize_gc INTEGER DEFAULT 0,
    prize_sc DECIMAL(10,2) DEFAULT 0,
    bonus_items JSONB, -- Additional bonus items (free cards, multipliers, etc.)
    
    -- Odds and Frequency
    win_probability DECIMAL(10,8) NOT NULL, -- Probability of winning this prize
    max_wins_per_day INTEGER DEFAULT NULL, -- Daily win limit for this prize
    max_total_wins INTEGER DEFAULT NULL, -- Total lifetime wins allowed
    current_wins_today INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    
    -- Prize Configuration
    symbol_combination JSONB, -- Required symbols to win this prize
    is_jackpot BOOLEAN DEFAULT false,
    is_bonus_prize BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scratch Card Instances
-- Individual scratch card purchases and gameplay
CREATE TABLE IF NOT EXISTS scratch_card_instances (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(50) UNIQUE NOT NULL, -- Unique identifier for this card
    card_type_id INTEGER REFERENCES scratch_card_types(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Purchase Information
    purchase_cost_gc INTEGER NOT NULL,
    purchase_cost_sc DECIMAL(10,2) DEFAULT 0,
    purchase_currency VARCHAR(10) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Game Configuration (pre-determined outcome)
    predetermined_outcome JSONB NOT NULL, -- Complete game outcome determined at purchase
    winning_symbols JSONB, -- Symbols that will be revealed
    prize_configuration JSONB, -- Prize details for this specific card
    
    -- Game State
    status VARCHAR(20) DEFAULT 'unscratched', -- unscratched, partially_scratched, completed, expired
    scratch_progress JSONB, -- Track which areas have been scratched
    revealed_symbols JSONB, -- Symbols revealed so far
    
    -- Gameplay Tracking
    first_scratch_at TIMESTAMP,
    completed_at TIMESTAMP,
    total_scratch_time INTEGER, -- Time spent scratching in seconds
    scratch_pattern JSONB, -- Order of scratching areas
    
    -- Prize Information
    is_winner BOOLEAN DEFAULT false,
    prize_id INTEGER REFERENCES scratch_card_prizes(id),
    winnings_gc INTEGER DEFAULT 0,
    winnings_sc DECIMAL(10,2) DEFAULT 0,
    bonus_items JSONB,
    
    -- Prize Collection
    prize_claimed BOOLEAN DEFAULT false,
    prize_claimed_at TIMESTAMP,
    prize_transaction_id INTEGER, -- Reference to balance transaction
    
    -- Security and Validation
    game_seed VARCHAR(64), -- Cryptographic seed for reproducibility
    verification_hash VARCHAR(128), -- Hash for outcome verification
    client_fingerprint JSONB, -- Browser/device information
    ip_address INET,
    user_agent TEXT,
    
    -- Expiration
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics and Statistics Tables
CREATE TABLE IF NOT EXISTS scratch_card_analytics (
    id SERIAL PRIMARY KEY,
    date_recorded DATE DEFAULT CURRENT_DATE,
    card_type_id INTEGER REFERENCES scratch_card_types(id) ON DELETE CASCADE,
    
    -- Daily Statistics
    cards_sold INTEGER DEFAULT 0,
    revenue_gc BIGINT DEFAULT 0,
    revenue_sc DECIMAL(15,2) DEFAULT 0,
    total_winnings_gc BIGINT DEFAULT 0,
    total_winnings_sc DECIMAL(15,2) DEFAULT 0,
    
    -- Player Metrics
    unique_players INTEGER DEFAULT 0,
    new_players INTEGER DEFAULT 0,
    returning_players INTEGER DEFAULT 0,
    
    -- Performance Metrics
    actual_rtp DECIMAL(5,2), -- Actual return to player for the day
    total_game_time INTEGER, -- Total time spent playing in seconds
    average_game_time DECIMAL(8,2), -- Average time per game
    
    -- Win Statistics
    total_wins INTEGER DEFAULT 0,
    jackpot_wins INTEGER DEFAULT 0,
    bonus_wins INTEGER DEFAULT 0,
    
    UNIQUE(date_recorded, card_type_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player Session Tracking
CREATE TABLE IF NOT EXISTS scratch_card_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Information
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Session Statistics
    cards_purchased INTEGER DEFAULT 0,
    total_spent_gc INTEGER DEFAULT 0,
    total_spent_sc DECIMAL(10,2) DEFAULT 0,
    total_winnings_gc INTEGER DEFAULT 0,
    total_winnings_sc DECIMAL(10,2) DEFAULT 0,
    
    -- Behavioral Data
    different_card_types_played INTEGER DEFAULT 0,
    average_scratch_time DECIMAL(8,2),
    session_outcome VARCHAR(20), -- net_positive, net_negative, break_even
    
    -- Technical Information
    device_type VARCHAR(50),
    browser_info JSONB,
    connection_quality VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_scratch_instances_user_id ON scratch_card_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_scratch_instances_card_type ON scratch_card_instances(card_type_id);
CREATE INDEX IF NOT EXISTS idx_scratch_instances_status ON scratch_card_instances(status);
CREATE INDEX IF NOT EXISTS idx_scratch_instances_purchased_at ON scratch_card_instances(purchased_at);

-- Prize and analytics indexes
CREATE INDEX IF NOT EXISTS idx_scratch_prizes_card_type ON scratch_card_prizes(card_type_id);
CREATE INDEX IF NOT EXISTS idx_scratch_analytics_date ON scratch_card_analytics(date_recorded);
CREATE INDEX IF NOT EXISTS idx_scratch_sessions_user_id ON scratch_card_sessions(user_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scratch_instances_user_status ON scratch_card_instances(user_id, status);
CREATE INDEX IF NOT EXISTS idx_scratch_instances_type_status ON scratch_card_instances(card_type_id, status);
CREATE INDEX IF NOT EXISTS idx_scratch_instances_winner_claimed ON scratch_card_instances(is_winner, prize_claimed);

-- Expiration cleanup index
CREATE INDEX IF NOT EXISTS idx_scratch_instances_expires_at ON scratch_card_instances(expires_at) WHERE status = 'unscratched';

-- ===========================================
-- INITIAL DATA SETUP
-- ===========================================

-- Insert default themes
INSERT INTO scratch_card_themes (name, display_name, description, background_image, is_active, sort_order) VALUES
('classic_gold', 'Classic Gold', 'Traditional gold scratch cards with elegant design', '/images/themes/classic_gold.jpg', true, 1),
('neon_nights', 'Neon Nights', 'Futuristic neon-themed scratch cards', '/images/themes/neon_nights.jpg', true, 2),
('treasure_hunt', 'Treasure Hunt', 'Adventure-themed cards with pirate treasures', '/images/themes/treasure_hunt.jpg', true, 3),
('lucky_sevens', 'Lucky Sevens', 'Casino-style cards with lucky number seven theme', '/images/themes/lucky_sevens.jpg', true, 4),
('diamond_rush', 'Diamond Rush', 'Luxury diamond-themed premium cards', '/images/themes/diamond_rush.jpg', true, 5);

-- Insert card types
WITH theme_ids AS (
  SELECT id, name FROM scratch_card_themes WHERE name IN ('classic_gold', 'neon_nights', 'treasure_hunt', 'lucky_sevens', 'diamond_rush')
)
INSERT INTO scratch_card_types (
  theme_id, name, display_name, description, cost_gc, cost_sc, currency_type,
  max_prize_gc, max_prize_sc, overall_odds, rtp_percentage, is_active, sort_order
) VALUES
-- Classic Gold Cards
((SELECT id FROM theme_ids WHERE name = 'classic_gold'), 'gold_standard', 'Gold Standard', 'Match 3 gold symbols to win prizes', 1000, 0, 'GC', 50000, 0, 0.25, 85.00, true, 1),
((SELECT id FROM theme_ids WHERE name = 'classic_gold'), 'gold_deluxe', 'Gold Deluxe', 'Premium gold card with higher prizes', 5000, 0, 'GC', 250000, 0, 0.20, 87.50, true, 2),

-- Neon Nights Cards  
((SELECT id FROM theme_ids WHERE name = 'neon_nights'), 'neon_blast', 'Neon Blast', 'Electrifying neon-themed instant wins', 2000, 0, 'GC', 100000, 0, 0.30, 83.00, true, 3),
((SELECT id FROM theme_ids WHERE name = 'neon_nights'), 'cyber_fortune', 'Cyber Fortune', 'High-tech scratch card with cyber rewards', 10000, 0, 'GC', 500000, 0, 0.15, 90.00, true, 4),

-- Treasure Hunt Cards
((SELECT id FROM theme_ids WHERE name = 'treasure_hunt'), 'pirates_treasure', 'Pirates Treasure', 'Find the hidden treasure for massive wins', 3000, 0, 'GC', 150000, 0, 0.22, 86.00, true, 5),
((SELECT id FROM theme_ids WHERE name = 'treasure_hunt'), 'treasure_map', 'Treasure Map', 'Follow the map to discover riches', 7500, 0, 'GC', 375000, 0, 0.18, 88.50, true, 6),

-- Lucky Sevens Cards
((SELECT id FROM theme_ids WHERE name = 'lucky_sevens'), 'triple_seven', 'Triple Seven', 'Classic casino-style matching game', 2500, 0, 'GC', 125000, 0, 0.28, 84.00, true, 7),
((SELECT id FROM theme_ids WHERE name = 'lucky_sevens'), 'jackpot_sevens', 'Jackpot Sevens', 'Progressive jackpot scratch card', 15000, 0, 'GC', 1000000, 0, 0.12, 92.00, true, 8),

-- Diamond Rush Cards (Premium)
((SELECT id FROM theme_ids WHERE name = 'diamond_rush'), 'diamond_mine', 'Diamond Mine', 'Dig for precious diamonds and gems', 5000, 1.00, 'BOTH', 200000, 100.00, 0.20, 89.00, true, 9),
((SELECT id FROM theme_ids WHERE name = 'diamond_rush'), 'diamond_royale', 'Diamond Royale', 'Ultimate luxury scratch card experience', 25000, 5.00, 'BOTH', 1000000, 500.00, 0.10, 95.00, true, 10);

-- Insert prize structures for each card type
INSERT INTO scratch_card_prizes (card_type_id, prize_tier, prize_name, prize_gc, prize_sc, win_probability, symbol_combination) 
SELECT 
  ct.id,
  'instant',
  'Instant Win',
  ct.cost_gc * 2,
  ct.cost_sc * 2,
  0.100000,
  '{"required": ["instant", "instant", "instant"]}'::jsonb
FROM scratch_card_types ct
WHERE ct.name IN ('gold_standard', 'neon_blast', 'pirates_treasure', 'triple_seven', 'diamond_mine');

INSERT INTO scratch_card_prizes (card_type_id, prize_tier, prize_name, prize_gc, prize_sc, win_probability, symbol_combination)
SELECT 
  ct.id,
  'tier1',
  'Small Prize',
  ct.cost_gc * 5,
  ct.cost_sc * 5,
  0.080000,
  '{"required": ["symbol1", "symbol1", "symbol1"]}'::jsonb
FROM scratch_card_types ct;

INSERT INTO scratch_card_prizes (card_type_id, prize_tier, prize_name, prize_gc, prize_sc, win_probability, symbol_combination)
SELECT 
  ct.id,
  'tier2',
  'Medium Prize',
  ct.cost_gc * 15,
  ct.cost_sc * 15,
  0.040000,
  '{"required": ["symbol2", "symbol2", "symbol2"]}'::jsonb
FROM scratch_card_types ct;

INSERT INTO scratch_card_prizes (card_type_id, prize_tier, prize_name, prize_gc, prize_sc, win_probability, symbol_combination)
SELECT 
  ct.id,
  'tier3',
  'Large Prize',
  ct.cost_gc * 50,
  ct.cost_sc * 50,
  0.015000,
  '{"required": ["symbol3", "symbol3", "symbol3"]}'::jsonb
FROM scratch_card_types ct;

INSERT INTO scratch_card_prizes (card_type_id, prize_tier, prize_name, prize_gc, prize_sc, win_probability, symbol_combination)
SELECT 
  ct.id,
  'jackpot',
  'Jackpot Prize',
  ct.max_prize_gc,
  ct.max_prize_sc,
  0.001000,
  '{"required": ["jackpot", "jackpot", "jackpot"]}'::jsonb
FROM scratch_card_types ct;

-- ===========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ===========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_scratch_card_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER scratch_card_themes_updated_at
    BEFORE UPDATE ON scratch_card_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_scratch_card_timestamp();

CREATE TRIGGER scratch_card_types_updated_at
    BEFORE UPDATE ON scratch_card_types
    FOR EACH ROW
    EXECUTE FUNCTION update_scratch_card_timestamp();

CREATE TRIGGER scratch_card_prizes_updated_at
    BEFORE UPDATE ON scratch_card_prizes
    FOR EACH ROW
    EXECUTE FUNCTION update_scratch_card_timestamp();

CREATE TRIGGER scratch_card_instances_updated_at
    BEFORE UPDATE ON scratch_card_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_scratch_card_timestamp();

-- Function to automatically update daily analytics
CREATE OR REPLACE FUNCTION update_scratch_card_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics when a card is purchased
    IF TG_OP = 'INSERT' THEN
        INSERT INTO scratch_card_analytics (date_recorded, card_type_id, cards_sold, revenue_gc, revenue_sc, unique_players)
        VALUES (CURRENT_DATE, NEW.card_type_id, 1, NEW.purchase_cost_gc, NEW.purchase_cost_sc, 1)
        ON CONFLICT (date_recorded, card_type_id)
        DO UPDATE SET
            cards_sold = scratch_card_analytics.cards_sold + 1,
            revenue_gc = scratch_card_analytics.revenue_gc + NEW.purchase_cost_gc,
            revenue_sc = scratch_card_analytics.revenue_sc + NEW.purchase_cost_sc;
    END IF;
    
    -- Update analytics when a card is completed with winnings
    IF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.is_winner THEN
        UPDATE scratch_card_analytics 
        SET 
            total_winnings_gc = total_winnings_gc + NEW.winnings_gc,
            total_winnings_sc = total_winnings_sc + NEW.winnings_sc,
            total_wins = total_wins + 1
        WHERE date_recorded = CURRENT_DATE AND card_type_id = NEW.card_type_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply analytics trigger
CREATE TRIGGER scratch_card_analytics_trigger
    AFTER INSERT OR UPDATE ON scratch_card_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_scratch_card_analytics();

-- ===========================================
-- HELPFUL VIEWS FOR REPORTING
-- ===========================================

-- View for active scratch cards with theme information
CREATE OR REPLACE VIEW scratch_cards_active AS
SELECT 
    ct.id,
    ct.name,
    ct.display_name,
    ct.description,
    ct.cost_gc,
    ct.cost_sc,
    ct.currency_type,
    ct.max_prize_gc,
    ct.max_prize_sc,
    ct.overall_odds,
    ct.rtp_percentage,
    ct.is_featured,
    ct.total_sold,
    t.name as theme_name,
    t.display_name as theme_display_name,
    t.background_image,
    t.card_design
FROM scratch_card_types ct
JOIN scratch_card_themes t ON ct.theme_id = t.id
WHERE ct.is_active = true AND t.is_active = true
ORDER BY ct.sort_order, ct.id;

-- View for player scratch card history
CREATE OR REPLACE VIEW player_scratch_history AS
SELECT 
    sci.id,
    sci.instance_id,
    sci.user_id,
    u.username,
    u.email,
    ct.display_name as card_name,
    t.display_name as theme_name,
    sci.purchase_cost_gc,
    sci.purchase_cost_sc,
    sci.status,
    sci.is_winner,
    sci.winnings_gc,
    sci.winnings_sc,
    sci.purchased_at,
    sci.completed_at,
    sci.prize_claimed
FROM scratch_card_instances sci
JOIN scratch_card_types ct ON sci.card_type_id = ct.id
JOIN scratch_card_themes t ON ct.theme_id = t.id
JOIN users u ON sci.user_id = u.id
ORDER BY sci.purchased_at DESC;

-- ===========================================
-- SCHEMA SETUP COMPLETE
-- ===========================================
