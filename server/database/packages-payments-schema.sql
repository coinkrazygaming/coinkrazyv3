-- CoinKrazy Packages, Payments & Banking Database Schema
-- Production-ready schema with proper indexing, constraints, and relationships

-- =============================================
-- PACKAGE MANAGEMENT TABLES
-- =============================================

-- Gold Coin Packages
CREATE TABLE IF NOT EXISTS gold_coin_packages (
    id SERIAL PRIMARY KEY,
    package_name VARCHAR(100) NOT NULL,
    description TEXT,
    gold_coins INTEGER NOT NULL CHECK (gold_coins > 0),
    bonus_coins INTEGER DEFAULT 0 CHECK (bonus_coins >= 0),
    price_usd DECIMAL(10,2) NOT NULL CHECK (price_usd > 0),
    original_price_usd DECIMAL(10,2),
    discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    package_image_url TEXT,
    package_icon VARCHAR(50) DEFAULT 'coins',
    is_featured BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_best_value BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    max_purchases_per_user INTEGER, -- NULL means unlimited
    package_type VARCHAR(20) DEFAULT 'standard' CHECK (package_type IN ('standard', 'starter', 'premium', 'vip', 'special')),
    tags TEXT[], -- Array of tags for filtering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Sweeps Coin Packages (if needed)
CREATE TABLE IF NOT EXISTS sweeps_coin_packages (
    id SERIAL PRIMARY KEY,
    package_name VARCHAR(100) NOT NULL,
    description TEXT,
    sweeps_coins DECIMAL(10,2) NOT NULL CHECK (sweeps_coins > 0),
    gold_coins_included INTEGER DEFAULT 0,
    price_usd DECIMAL(10,2) NOT NULL CHECK (price_usd > 0),
    original_price_usd DECIMAL(10,2),
    discount_percentage INTEGER DEFAULT 0,
    package_image_url TEXT,
    package_icon VARCHAR(50) DEFAULT 'crown',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    max_purchases_per_user INTEGER,
    package_type VARCHAR(20) DEFAULT 'sweeps',
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Package Bonuses and Promotions
CREATE TABLE IF NOT EXISTS package_bonuses (
    id SERIAL PRIMARY KEY,
    package_id INTEGER,
    package_type VARCHAR(20) CHECK (package_type IN ('gold', 'sweeps')),
    bonus_type VARCHAR(30) NOT NULL CHECK (bonus_type IN ('percentage', 'fixed_amount', 'free_spins', 'vip_access')),
    bonus_value DECIMAL(10,2) NOT NULL,
    bonus_description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PAYMENT PROCESSING TABLES
-- =============================================

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    method_name VARCHAR(50) NOT NULL UNIQUE,
    method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('paypal', 'stripe', 'crypto', 'bank', 'card')),
    is_enabled BOOLEAN DEFAULT TRUE,
    processing_fee_percentage DECIMAL(5,4) DEFAULT 0,
    processing_fee_fixed DECIMAL(10,2) DEFAULT 0,
    min_amount DECIMAL(10,2) DEFAULT 0,
    max_amount DECIMAL(10,2),
    supported_currencies TEXT[] DEFAULT ARRAY['USD'],
    api_config JSONB, -- Store API keys, endpoints, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    package_id INTEGER,
    package_type VARCHAR(20) CHECK (package_type IN ('gold', 'sweeps')),
    payment_method_id INTEGER REFERENCES payment_methods(id),
    payment_method_type VARCHAR(20) NOT NULL,
    
    -- Transaction amounts
    amount_usd DECIMAL(10,2) NOT NULL,
    processing_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    
    -- Package details
    coins_purchased INTEGER,
    bonus_coins INTEGER DEFAULT 0,
    sweeps_coins_purchased DECIMAL(10,2) DEFAULT 0,
    
    -- Payment provider details
    provider_transaction_id VARCHAR(200),
    provider_payment_id VARCHAR(200),
    provider_payer_id VARCHAR(200),
    provider_email VARCHAR(255),
    provider_status VARCHAR(50),
    provider_response JSONB,
    
    -- Transaction status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'disputed')),
    failure_reason TEXT,
    
    -- Timestamps
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    ip_address INET,
    user_agent TEXT,
    country_code VARCHAR(2),
    
    -- Indexes for fast queries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Refunds
CREATE TABLE IF NOT EXISTS payment_refunds (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES payment_transactions(id),
    refund_transaction_id VARCHAR(100) UNIQUE NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_reason VARCHAR(100),
    refund_description TEXT,
    coins_deducted INTEGER DEFAULT 0,
    sweeps_coins_deducted DECIMAL(10,2) DEFAULT 0,
    provider_refund_id VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    processed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- BANKING & WALLET MANAGEMENT
-- =============================================

-- User Wallets (Enhanced)
CREATE TABLE IF NOT EXISTS user_wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
    gold_coins INTEGER DEFAULT 0 CHECK (gold_coins >= 0),
    sweeps_coins DECIMAL(10,2) DEFAULT 0 CHECK (sweeps_coins >= 0),
    bonus_coins INTEGER DEFAULT 0 CHECK (bonus_coins >= 0),
    
    -- Lifetime stats
    total_purchased_usd DECIMAL(12,2) DEFAULT 0,
    total_coins_purchased INTEGER DEFAULT 0,
    total_sweeps_purchased DECIMAL(10,2) DEFAULT 0,
    total_coins_won INTEGER DEFAULT 0,
    total_sweeps_won DECIMAL(10,2) DEFAULT 0,
    total_coins_spent INTEGER DEFAULT 0,
    total_sweeps_spent DECIMAL(10,2) DEFAULT 0,
    
    -- Status and limits
    wallet_status VARCHAR(20) DEFAULT 'active' CHECK (wallet_status IN ('active', 'suspended', 'frozen', 'closed')),
    daily_purchase_limit DECIMAL(10,2) DEFAULT 1000,
    monthly_purchase_limit DECIMAL(10,2) DEFAULT 10000,
    vip_level INTEGER DEFAULT 0,
    
    -- Audit fields
    last_purchase_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallet Transactions (Enhanced)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
        'purchase', 'bonus', 'win', 'spend', 'refund', 'adjustment', 'promotional', 'referral', 'vip_bonus'
    )),
    
    -- Transaction amounts
    gold_coins_change INTEGER DEFAULT 0,
    sweeps_coins_change DECIMAL(10,2) DEFAULT 0,
    bonus_coins_change INTEGER DEFAULT 0,
    
    -- Balances after transaction
    gold_coins_after INTEGER NOT NULL,
    sweeps_coins_after DECIMAL(10,2) NOT NULL,
    bonus_coins_after INTEGER NOT NULL,
    
    -- Reference information
    reference_type VARCHAR(20), -- 'purchase', 'game', 'admin', etc.
    reference_id VARCHAR(100),
    payment_transaction_id INTEGER REFERENCES payment_transactions(id),
    game_session_id VARCHAR(100),
    
    -- Transaction details
    description TEXT NOT NULL,
    admin_notes TEXT,
    processed_by INTEGER REFERENCES users(id),
    
    -- Audit fields
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BANKING ADMINISTRATION
-- =============================================

-- Banking Settings
CREATE TABLE IF NOT EXISTS banking_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'config',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Analytics
CREATE TABLE IF NOT EXISTS payment_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    payment_method VARCHAR(50),
    package_type VARCHAR(20),
    
    -- Daily metrics
    total_transactions INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    failed_transactions INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_fees DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Conversion metrics
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    average_transaction_value DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(date, payment_method, package_type)
);

-- User Purchase Limits
CREATE TABLE IF NOT EXISTS user_purchase_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    daily_limit DECIMAL(10,2) DEFAULT 1000,
    weekly_limit DECIMAL(10,2) DEFAULT 5000,
    monthly_limit DECIMAL(10,2) DEFAULT 20000,
    yearly_limit DECIMAL(10,2) DEFAULT 100000,
    is_custom BOOLEAN DEFAULT FALSE,
    set_by INTEGER REFERENCES users(id),
    reason TEXT,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Package indexes
CREATE INDEX IF NOT EXISTS idx_gold_packages_active ON gold_coin_packages(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_gold_packages_featured ON gold_coin_packages(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_sweeps_packages_active ON sweeps_coin_packages(is_active, display_order);

-- Payment transaction indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payment_transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payment_transactions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON payment_transactions(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payment_transactions(created_at);

-- Wallet indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type, created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference ON wallet_transactions(reference_type, reference_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_payment_analytics_date ON payment_analytics(date);
CREATE INDEX IF NOT EXISTS idx_payment_analytics_method ON payment_analytics(payment_method, date);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_gold_packages_updated_at BEFORE UPDATE ON gold_coin_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sweeps_packages_updated_at BEFORE UPDATE ON sweeps_coin_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banking_settings_updated_at BEFORE UPDATE ON banking_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default payment methods
INSERT INTO payment_methods (method_name, method_type, is_enabled, processing_fee_percentage, processing_fee_fixed, min_amount, max_amount) 
VALUES 
    ('PayPal', 'paypal', TRUE, 0.0349, 0.49, 1.00, 10000.00),
    ('Stripe Card', 'stripe', TRUE, 0.029, 0.30, 1.00, 10000.00),
    ('Bank Transfer', 'bank', FALSE, 0.01, 0.00, 10.00, 50000.00)
ON CONFLICT (method_name) DO NOTHING;

-- Insert default banking settings
INSERT INTO banking_settings (setting_key, setting_value, description) 
VALUES 
    ('paypal_sandbox_mode', 'true', 'Enable PayPal sandbox for testing'),
    ('default_currency', '"USD"', 'Default currency for transactions'),
    ('max_daily_purchases', '1000.00', 'Maximum daily purchase limit'),
    ('enable_purchase_limits', 'true', 'Enable purchase limit enforcement'),
    ('auto_fulfill_payments', 'true', 'Automatically fulfill successful payments')
ON CONFLICT (setting_key) DO NOTHING;

-- Create default starter packages
INSERT INTO gold_coin_packages (package_name, description, gold_coins, bonus_coins, price_usd, package_type, is_featured, display_order) 
VALUES 
    ('Starter Pack', 'Perfect for new players to get started', 1000, 100, 9.99, 'starter', TRUE, 1),
    ('Value Pack', 'Great value for regular players', 5000, 750, 39.99, 'standard', FALSE, 2),
    ('Premium Pack', 'Maximum coins with best bonus', 15000, 3000, 99.99, 'premium', TRUE, 3),
    ('VIP Mega Pack', 'Ultimate package for serious players', 50000, 15000, 299.99, 'vip', TRUE, 4)
ON CONFLICT DO NOTHING;

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Package summary view
CREATE OR REPLACE VIEW package_summary AS
SELECT 
    p.id,
    p.package_name,
    p.gold_coins,
    p.bonus_coins,
    p.price_usd,
    p.discount_percentage,
    p.is_featured,
    p.is_popular,
    p.is_best_value,
    p.package_type,
    COUNT(pt.id) as total_purchases,
    SUM(pt.amount_usd) as total_revenue
FROM gold_coin_packages p
LEFT JOIN payment_transactions pt ON p.id = pt.package_id AND pt.status = 'completed'
WHERE p.is_active = TRUE
GROUP BY p.id, p.package_name, p.gold_coins, p.bonus_coins, p.price_usd, p.discount_percentage, 
         p.is_featured, p.is_popular, p.is_best_value, p.package_type
ORDER BY p.display_order;

-- User wallet summary view
CREATE OR REPLACE VIEW user_wallet_summary AS
SELECT 
    w.user_id,
    u.email,
    u.username,
    w.gold_coins,
    w.sweeps_coins,
    w.bonus_coins,
    w.total_purchased_usd,
    w.total_coins_purchased,
    w.vip_level,
    w.wallet_status,
    w.last_purchase_at,
    COUNT(pt.id) as total_transactions
FROM user_wallets w
JOIN users u ON w.user_id = u.id
LEFT JOIN payment_transactions pt ON w.user_id = pt.user_id AND pt.status = 'completed'
GROUP BY w.user_id, u.email, u.username, w.gold_coins, w.sweeps_coins, w.bonus_coins, 
         w.total_purchased_usd, w.total_coins_purchased, w.vip_level, w.wallet_status, w.last_purchase_at;

COMMENT ON TABLE gold_coin_packages IS 'Stores all gold coin package configurations for the store';
COMMENT ON TABLE payment_transactions IS 'Records all payment transactions with full audit trail';
COMMENT ON TABLE user_wallets IS 'Manages user wallet balances and purchase limits';
COMMENT ON TABLE wallet_transactions IS 'Detailed transaction log for all wallet changes';
