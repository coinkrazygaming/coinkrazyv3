import { Pool } from 'pg';
import crypto from 'crypto';
import Stripe from 'stripe';

// Types and interfaces
export interface BankingTransaction {
  id: number;
  transaction_id: string;
  user_id: number;
  payment_method_id: number;
  provider_id: number;
  type: 'deposit' | 'withdrawal' | 'refund' | 'chargeback' | 'fee';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'disputed' | 'reversed';
  amount: number;
  currency: string;
  fee_amount: number;
  net_amount: number;
  provider_transaction_id?: string;
  provider_reference?: string;
  provider_status?: string;
  provider_response?: any;
  payment_details?: any;
  billing_address?: any;
  risk_score: number;
  fraud_flags?: string[];
  compliance_checks?: any;
  aml_status: 'pending' | 'approved' | 'flagged' | 'rejected';
  sanctions_checked: boolean;
  initiated_at: Date;
  processed_at?: Date;
  completed_at?: Date;
  failed_at?: Date;
  failure_reason?: string;
  retry_count: number;
  requires_manual_approval: boolean;
  approved_by?: number;
  approved_at?: Date;
  rejection_reason?: string;
  user_ip?: string;
  user_agent?: string;
  session_id?: string;
  notes?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentProvider {
  id: number;
  name: string;
  type: string;
  status: 'active' | 'disabled' | 'maintenance';
  api_endpoint?: string;
  api_key_encrypted?: string;
  api_secret_encrypted?: string;
  webhook_url?: string;
  supported_currencies: string[];
  supported_countries: string[];
  configuration: any;
  fees: any;
  limits: any;
  processing_times: any;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentMethod {
  id: number;
  provider_id: number;
  name: string;
  type: 'credit_card' | 'crypto' | 'e_wallet' | 'bank_transfer';
  status: 'active' | 'disabled' | 'maintenance';
  icon_url?: string;
  display_order: number;
  min_deposit: number;
  max_deposit: number;
  min_withdrawal: number;
  max_withdrawal: number;
  daily_limit: number;
  deposit_fee_percent: number;
  deposit_fee_fixed: number;
  withdrawal_fee_percent: number;
  withdrawal_fee_fixed: number;
  requires_kyc: boolean;
  requires_documents: boolean;
  auto_approve_deposits: boolean;
  auto_approve_withdrawals: boolean;
  auto_approve_deposit_limit: number;
  auto_approve_withdrawal_limit: number;
  created_at: Date;
  updated_at: Date;
}

export interface WithdrawalRequest {
  id: number;
  user_id: number;
  transaction_id?: number;
  amount: number;
  currency: string;
  method: string;
  destination_details: any;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  requires_approval: boolean;
  approved_by?: number;
  approved_at?: Date;
  rejection_reason?: string;
  processing_fee: number;
  net_amount: number;
  expected_completion?: Date;
  completed_at?: Date;
  kyc_required: boolean;
  documents_required: boolean;
  compliance_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserBankAccount {
  id: number;
  user_id: number;
  account_type: 'checking' | 'savings' | 'business';
  bank_name: string;
  account_holder_name: string;
  account_number_encrypted: string;
  routing_number_encrypted: string;
  swift_code?: string;
  iban?: string;
  currency: string;
  country: string;
  is_verified: boolean;
  is_primary: boolean;
  verification_deposits?: any;
  verification_status: 'pending' | 'verified' | 'failed';
  verification_date?: Date;
  last_used_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface BankingSettings {
  auto_approval: {
    deposits: { enabled: boolean; max_amount: number };
    withdrawals: { enabled: boolean; max_amount: number };
  };
  kyc_requirements: {
    level: string;
    require_documents: boolean;
    deposit_limit_no_kyc: number;
  };
  fraud_detection: {
    enabled: boolean;
    risk_threshold: number;
    velocity_checks: boolean;
    blocked_countries: string[];
  };
  compliance: {
    aml_enabled: boolean;
    sanctions_checking: boolean;
    reporting_threshold: number;
    record_retention: number;
  };
  notifications: {
    large_transactions: { enabled: boolean; threshold: number };
    failed_transactions: boolean;
    chargebacks: boolean;
  };
}

class BankingService {
  private static instance: BankingService;
  private pool: Pool;
  private stripe: Stripe;
  private encryptionKey: string;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Initialize Stripe
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });

    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  public static getInstance(): BankingService {
    if (!BankingService.instance) {
      BankingService.instance = new BankingService();
    }
    return BankingService.instance;
  }

  // Encryption utilities
  private encrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encrypted = textParts.join(':');
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Payment Providers Management
  async getPaymentProviders(): Promise<PaymentProvider[]> {
    const query = `
      SELECT * FROM payment_providers 
      ORDER BY name ASC
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getPaymentProvider(id: number): Promise<PaymentProvider | null> {
    const query = `
      SELECT * FROM payment_providers WHERE id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async createPaymentProvider(provider: Partial<PaymentProvider>): Promise<PaymentProvider> {
    const query = `
      INSERT INTO payment_providers (
        name, type, status, api_endpoint, api_key_encrypted, api_secret_encrypted,
        webhook_url, supported_currencies, supported_countries, configuration,
        fees, limits, processing_times
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const values = [
      provider.name,
      provider.type,
      provider.status || 'active',
      provider.api_endpoint,
      provider.api_key_encrypted ? this.encrypt(provider.api_key_encrypted) : null,
      provider.api_secret_encrypted ? this.encrypt(provider.api_secret_encrypted) : null,
      provider.webhook_url,
      provider.supported_currencies || [],
      provider.supported_countries || [],
      provider.configuration || {},
      provider.fees || {},
      provider.limits || {},
      provider.processing_times || {}
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async updatePaymentProvider(id: number, updates: Partial<PaymentProvider>): Promise<PaymentProvider> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        if (key === 'api_key_encrypted' || key === 'api_secret_encrypted') {
          values.push(this.encrypt(value as string));
        } else {
          values.push(value);
        }
        paramIndex++;
      }
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE payment_providers 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Payment Methods Management
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const query = `
      SELECT pm.*, pp.name as provider_name, pp.type as provider_type
      FROM payment_methods pm
      LEFT JOIN payment_providers pp ON pm.provider_id = pp.id
      ORDER BY pm.display_order ASC, pm.name ASC
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    const query = `
      SELECT pm.*, pp.name as provider_name, pp.type as provider_type
      FROM payment_methods pm
      LEFT JOIN payment_providers pp ON pm.provider_id = pp.id
      WHERE pm.status = 'active' AND pp.status = 'active'
      ORDER BY pm.display_order ASC, pm.name ASC
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async createPaymentMethod(method: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const query = `
      INSERT INTO payment_methods (
        provider_id, name, type, status, icon_url, display_order,
        min_deposit, max_deposit, min_withdrawal, max_withdrawal, daily_limit,
        deposit_fee_percent, deposit_fee_fixed, withdrawal_fee_percent, withdrawal_fee_fixed,
        requires_kyc, requires_documents, auto_approve_deposits, auto_approve_withdrawals,
        auto_approve_deposit_limit, auto_approve_withdrawal_limit
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;
    const values = [
      method.provider_id,
      method.name,
      method.type,
      method.status || 'active',
      method.icon_url,
      method.display_order || 0,
      method.min_deposit || 0,
      method.max_deposit || 999999,
      method.min_withdrawal || 0,
      method.max_withdrawal || 999999,
      method.daily_limit || 999999,
      method.deposit_fee_percent || 0,
      method.deposit_fee_fixed || 0,
      method.withdrawal_fee_percent || 0,
      method.withdrawal_fee_fixed || 0,
      method.requires_kyc !== undefined ? method.requires_kyc : true,
      method.requires_documents || false,
      method.auto_approve_deposits || false,
      method.auto_approve_withdrawals || false,
      method.auto_approve_deposit_limit || 0,
      method.auto_approve_withdrawal_limit || 0
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async updatePaymentMethod(id: number, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE payment_methods 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Transaction Management
  async createTransaction(transaction: Partial<BankingTransaction>): Promise<BankingTransaction> {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO banking_transactions (
        transaction_id, user_id, payment_method_id, provider_id, type, status,
        amount, currency, fee_amount, net_amount, payment_details, billing_address,
        risk_score, user_ip, user_agent, session_id, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      transactionId,
      transaction.user_id,
      transaction.payment_method_id,
      transaction.provider_id,
      transaction.type,
      transaction.status || 'pending',
      transaction.amount,
      transaction.currency || 'USD',
      transaction.fee_amount || 0,
      transaction.net_amount || transaction.amount,
      transaction.payment_details ? JSON.stringify(transaction.payment_details) : null,
      transaction.billing_address ? JSON.stringify(transaction.billing_address) : null,
      transaction.risk_score || 0,
      transaction.user_ip,
      transaction.user_agent,
      transaction.session_id,
      transaction.metadata ? JSON.stringify(transaction.metadata) : null
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getTransactions(filters: {
    user_id?: number;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
    start_date?: Date;
    end_date?: Date;
  } = {}): Promise<BankingTransaction[]> {
    let query = `
      SELECT bt.*, u.username, u.email, pm.name as payment_method_name, pp.name as provider_name
      FROM banking_transactions bt
      LEFT JOIN users u ON bt.user_id = u.id
      LEFT JOIN payment_methods pm ON bt.payment_method_id = pm.id
      LEFT JOIN payment_providers pp ON bt.provider_id = pp.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.user_id) {
      query += ` AND bt.user_id = $${paramIndex}`;
      values.push(filters.user_id);
      paramIndex++;
    }

    if (filters.type) {
      query += ` AND bt.type = $${paramIndex}`;
      values.push(filters.type);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND bt.status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.start_date) {
      query += ` AND bt.created_at >= $${paramIndex}`;
      values.push(filters.start_date);
      paramIndex++;
    }

    if (filters.end_date) {
      query += ` AND bt.created_at <= $${paramIndex}`;
      values.push(filters.end_date);
      paramIndex++;
    }

    query += ` ORDER BY bt.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      values.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      values.push(filters.offset);
    }

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async updateTransactionStatus(
    transactionId: string, 
    status: string, 
    details?: {
      provider_transaction_id?: string;
      provider_status?: string;
      provider_response?: any;
      failure_reason?: string;
      approved_by?: number;
      rejection_reason?: string;
    }
  ): Promise<BankingTransaction> {
    const fields = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [transactionId, status];
    let paramIndex = 3;

    if (details) {
      for (const [key, value] of Object.entries(details)) {
        if (value !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(typeof value === 'object' ? JSON.stringify(value) : value);
          paramIndex++;
        }
      }
    }

    // Set timestamp fields based on status
    if (status === 'processing') {
      fields.push(`processed_at = CURRENT_TIMESTAMP`);
    } else if (status === 'completed') {
      fields.push(`completed_at = CURRENT_TIMESTAMP`);
    } else if (status === 'failed' || status === 'cancelled') {
      fields.push(`failed_at = CURRENT_TIMESTAMP`);
    }

    const query = `
      UPDATE banking_transactions 
      SET ${fields.join(', ')}
      WHERE transaction_id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Deposit Processing
  async processDeposit(userId: number, paymentMethodId: number, amount: number, paymentDetails: any): Promise<BankingTransaction> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get payment method details
      const paymentMethod = await this.getPaymentMethod(paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      // Calculate fees
      const feeAmount = (amount * paymentMethod.deposit_fee_percent / 100) + paymentMethod.deposit_fee_fixed;
      const netAmount = amount - feeAmount;

      // Create transaction record
      const transaction = await this.createTransaction({
        user_id: userId,
        payment_method_id: paymentMethodId,
        provider_id: paymentMethod.provider_id,
        type: 'deposit',
        status: 'pending',
        amount,
        fee_amount: feeAmount,
        net_amount: netAmount,
        payment_details: paymentDetails
      });

      // Process with payment provider
      const provider = await this.getPaymentProvider(paymentMethod.provider_id);
      if (!provider) {
        throw new Error('Payment provider not found');
      }

      let providerResult;
      if (provider.type === 'stripe') {
        providerResult = await this.processStripeDeposit(transaction, paymentDetails);
      } else if (provider.type === 'paypal') {
        providerResult = await this.processPayPalDeposit(transaction, paymentDetails);
      } else if (provider.type === 'crypto') {
        providerResult = await this.processCryptoDeposit(transaction, paymentDetails);
      } else {
        throw new Error('Unsupported payment provider');
      }

      // Update transaction with provider response
      const updatedTransaction = await this.updateTransactionStatus(
        transaction.transaction_id,
        providerResult.status,
        {
          provider_transaction_id: providerResult.transaction_id,
          provider_status: providerResult.provider_status,
          provider_response: providerResult.response
        }
      );

      // If successful, update user balance
      if (providerResult.status === 'completed') {
        await this.updateUserBalance(userId, netAmount, 'deposit', transaction.transaction_id);
      }

      await client.query('COMMIT');
      return updatedTransaction;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Stripe deposit processing
  private async processStripeDeposit(transaction: BankingTransaction, paymentDetails: any) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(transaction.amount * 100), // Convert to cents
        currency: transaction.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          transaction_id: transaction.transaction_id,
          user_id: transaction.user_id.toString()
        }
      });

      return {
        status: 'processing',
        transaction_id: paymentIntent.id,
        provider_status: paymentIntent.status,
        response: paymentIntent
      };
    } catch (error) {
      return {
        status: 'failed',
        transaction_id: null,
        provider_status: 'failed',
        response: error
      };
    }
  }

  // PayPal deposit processing (mock implementation)
  private async processPayPalDeposit(transaction: BankingTransaction, paymentDetails: any) {
    // Mock PayPal processing
    const success = Math.random() > 0.1; // 90% success rate
    
    return {
      status: success ? 'completed' : 'failed',
      transaction_id: success ? `pp_${Date.now()}` : null,
      provider_status: success ? 'completed' : 'failed',
      response: { success, mock: true }
    };
  }

  // Crypto deposit processing (mock implementation)
  private async processCryptoDeposit(transaction: BankingTransaction, paymentDetails: any) {
    // Mock crypto processing
    return {
      status: 'processing',
      transaction_id: `crypto_${Date.now()}`,
      provider_status: 'pending_confirmation',
      response: { confirmations: 0, required_confirmations: 3 }
    };
  }

  // Withdrawal Processing
  async createWithdrawalRequest(userId: number, amount: number, method: string, destinationDetails: any): Promise<WithdrawalRequest> {
    const query = `
      INSERT INTO withdrawal_requests (
        user_id, amount, currency, method, destination_details, status,
        processing_fee, net_amount, kyc_required, documents_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const processingFee = amount * 0.035; // 3.5% withdrawal fee
    const netAmount = amount - processingFee;

    const values = [
      userId,
      amount,
      'USD',
      method,
      JSON.stringify(destinationDetails),
      'pending',
      processingFee,
      netAmount,
      true,
      false
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getWithdrawalRequests(filters: {
    user_id?: number;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<WithdrawalRequest[]> {
    let query = `
      SELECT wr.*, u.username, u.email
      FROM withdrawal_requests wr
      LEFT JOIN users u ON wr.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.user_id) {
      query += ` AND wr.user_id = $${paramIndex}`;
      values.push(filters.user_id);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND wr.status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    query += ` ORDER BY wr.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      values.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      values.push(filters.offset);
    }

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async approveWithdrawal(withdrawalId: number, approvedBy: number): Promise<WithdrawalRequest> {
    const query = `
      UPDATE withdrawal_requests
      SET status = 'approved', approved_by = $2, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.pool.query(query, [withdrawalId, approvedBy]);
    return result.rows[0];
  }

  async rejectWithdrawal(withdrawalId: number, reason: string, rejectedBy: number): Promise<WithdrawalRequest> {
    const query = `
      UPDATE withdrawal_requests
      SET status = 'rejected', rejection_reason = $2, approved_by = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.pool.query(query, [withdrawalId, reason, rejectedBy]);
    return result.rows[0];
  }

  // User Balance Management
  private async updateUserBalance(userId: number, amount: number, type: string, transactionId: string) {
    const query = `
      INSERT INTO user_balances (user_id, currency, balance, total_deposited)
      VALUES ($1, 'USD', $2, $3)
      ON CONFLICT (user_id, currency)
      DO UPDATE SET
        balance = user_balances.balance + $2,
        total_deposited = CASE WHEN $4 = 'deposit' THEN user_balances.total_deposited + $2 ELSE user_balances.total_deposited END,
        updated_at = CURRENT_TIMESTAMP
    `;
    await this.pool.query(query, [userId, amount, type === 'deposit' ? amount : 0, type]);
  }

  // Payment Method Helpers
  private async getPaymentMethod(id: number): Promise<PaymentMethod | null> {
    const query = `SELECT * FROM payment_methods WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Banking Settings
  async getBankingSettings(): Promise<BankingSettings> {
    const query = `SELECT setting_key, setting_value FROM banking_settings`;
    const result = await this.pool.query(query);
    
    const settings: any = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return {
      auto_approval: settings.auto_approval || { deposits: { enabled: false, max_amount: 0 }, withdrawals: { enabled: false, max_amount: 0 } },
      kyc_requirements: settings.kyc_requirements || { level: 'basic', require_documents: false, deposit_limit_no_kyc: 100 },
      fraud_detection: settings.fraud_detection || { enabled: true, risk_threshold: 75, velocity_checks: true, blocked_countries: [] },
      compliance: settings.compliance || { aml_enabled: true, sanctions_checking: true, reporting_threshold: 10000, record_retention: 7 },
      notifications: settings.notifications || { large_transactions: { enabled: true, threshold: 5000 }, failed_transactions: true, chargebacks: true }
    };
  }

  async updateBankingSettings(settingKey: string, settingValue: any, updatedBy: number): Promise<void> {
    const query = `
      INSERT INTO banking_settings (setting_key, setting_value, updated_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (setting_key)
      DO UPDATE SET
        setting_value = $2,
        updated_by = $3,
        updated_at = CURRENT_TIMESTAMP
    `;
    await this.pool.query(query, [settingKey, JSON.stringify(settingValue), updatedBy]);
  }

  // Analytics and Reporting
  async getBankingAnalytics(days: number = 30): Promise<any> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const query = `
      SELECT 
        type,
        status,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        SUM(fee_amount) as total_fees,
        AVG(amount) as average_amount
      FROM banking_transactions
      WHERE created_at >= $1
      GROUP BY type, status
      ORDER BY type, status
    `;

    const result = await this.pool.query(query, [fromDate]);
    return result.rows;
  }

  async getTransactionVolume(days: number = 30): Promise<any> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const query = `
      SELECT 
        DATE(created_at) as date,
        type,
        COUNT(*) as count,
        SUM(amount) as volume
      FROM banking_transactions
      WHERE created_at >= $1
      GROUP BY DATE(created_at), type
      ORDER BY date DESC, type
    `;

    const result = await this.pool.query(query, [fromDate]);
    return result.rows;
  }

  // Risk Assessment
  async calculateRiskScore(userId: number, amount: number, paymentMethodId: number): Promise<number> {
    let riskScore = 0;

    // Check transaction velocity
    const recentTransactions = await this.pool.query(
      `SELECT COUNT(*) as count, SUM(amount) as total 
       FROM banking_transactions 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'`,
      [userId]
    );

    if (recentTransactions.rows[0].count > 5) riskScore += 20;
    if (recentTransactions.rows[0].total > 5000) riskScore += 30;

    // Check amount
    if (amount > 1000) riskScore += 10;
    if (amount > 5000) riskScore += 20;
    if (amount > 10000) riskScore += 30;

    // Check user history
    const userHistory = await this.pool.query(
      `SELECT COUNT(*) as failed_count 
       FROM banking_transactions 
       WHERE user_id = $1 AND status = 'failed'`,
      [userId]
    );

    if (userHistory.rows[0].failed_count > 3) riskScore += 25;

    return Math.min(riskScore, 100);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const bankingService = BankingService.getInstance();
export default bankingService;
