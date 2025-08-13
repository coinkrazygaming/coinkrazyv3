import { authService } from "./authService";

// Types
export interface PaymentPackage {
  id: string;
  name: string;
  goldCoins: number;
  bonusCoins: number;
  priceUsd: number;
  type: 'gold' | 'sweeps';
}

export interface PaymentOrder {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  goldCoins: number;
  bonusCoins: number;
  amountUsd: number;
  paymentMethod: 'paypal' | 'stripe' | 'crypto';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  providerOrderId?: string;
  providerPaymentId?: string;
  payerEmail?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PayPalOrderRequest {
  intent: 'CAPTURE';
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    description: string;
    custom_id: string;
    invoice_id?: string;
  }>;
  application_context: {
    brand_name: string;
    landing_page: 'BILLING' | 'LOGIN' | 'NO_PREFERENCE';
    user_action: 'PAY_NOW' | 'CONTINUE';
    return_url: string;
    cancel_url: string;
  };
  payer?: {
    email_address?: string;
  };
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  create_time?: string;
  update_time?: string;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
  status: string;
  payment_status: string;
  customer_email?: string;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  transactionId?: string;
  error?: string;
  redirectUrl?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'bonus' | 'win' | 'spend' | 'refund' | 'adjustment';
  goldCoinsChange: number;
  sweepsCoinsChange: number;
  bonusCoinsChange: number;
  goldCoinsAfter: number;
  sweepsCoinsAfter: number;
  bonusCoinsAfter: number;
  description: string;
  referenceId?: string;
  paymentTransactionId?: string;
  createdAt: string;
}

class PaymentService {
  private static instance: PaymentService;
  private orders: Map<string, PaymentOrder> = new Map();
  private transactions: Map<string, WalletTransaction[]> = new Map();

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // PayPal Integration
  async createPayPalOrder(packageData: PaymentPackage, userEmail?: string): Promise<PaymentResult> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate unique order ID
      const orderId = `order_${Date.now()}_${user.id}_${packageData.id}`;
      
      // Create order request
      const orderRequest: PayPalOrderRequest = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: Number(packageData.priceUsd).toFixed(2),
          },
          description: `${packageData.name} - ${packageData.goldCoins.toLocaleString()} Gold Coins`,
          custom_id: `pkg_${packageData.id}_user_${user.id}`,
          invoice_id: orderId,
        }],
        application_context: {
          brand_name: 'CoinKrazy',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${window.location.origin}/payment-success?order_id=${orderId}`,
          cancel_url: `${window.location.origin}/payment-cancelled?order_id=${orderId}`,
        },
      };

      if (userEmail) {
        orderRequest.payer = {
          email_address: userEmail,
        };
      }

      // Create order in our system first
      const order: PaymentOrder = {
        id: orderId,
        userId: user.id,
        packageId: packageData.id,
        packageName: packageData.name,
        goldCoins: packageData.goldCoins,
        bonusCoins: packageData.bonusCoins,
        amountUsd: packageData.priceUsd,
        paymentMethod: 'paypal',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      this.orders.set(orderId, order);

      // Call PayPal API (in production, this would go through your backend)
      const response = await this.callPayPalAPI('/v2/checkout/orders', 'POST', orderRequest);
      
      if (!response.ok) {
        throw new Error(`PayPal API error: ${response.status}`);
      }

      const paypalOrder: PayPalOrderResponse = await response.json();

      // Update order with PayPal details
      order.providerOrderId = paypalOrder.id;
      order.status = 'processing';
      this.orders.set(orderId, order);

      // Find approval URL
      const approveLink = paypalOrder.links.find(link => link.rel === 'approve');
      
      if (!approveLink) {
        throw new Error('No approval link found in PayPal response');
      }

      return {
        success: true,
        orderId: orderId,
        redirectUrl: approveLink.href,
      };

    } catch (error) {
      console.error('PayPal order creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async capturePayPalOrder(orderId: string, paypalOrderId: string): Promise<PaymentResult> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Capture the payment through PayPal
      const response = await this.callPayPalAPI(
        `/v2/checkout/orders/${paypalOrderId}/capture`,
        'POST'
      );

      if (!response.ok) {
        throw new Error(`PayPal capture failed: ${response.status}`);
      }

      const captureResult = await response.json();

      // Process successful payment
      if (captureResult.status === 'COMPLETED') {
        const paymentId = captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        const payerEmail = captureResult.payer?.email_address;

        // Update order
        order.status = 'completed';
        order.providerPaymentId = paymentId;
        order.payerEmail = payerEmail;
        order.completedAt = new Date().toISOString();
        this.orders.set(orderId, order);

        // Add coins to user's wallet
        await this.fulfillOrder(order);

        return {
          success: true,
          orderId: orderId,
          transactionId: paymentId,
        };
      } else {
        throw new Error(`Payment not completed. Status: ${captureResult.status}`);
      }

    } catch (error) {
      console.error('PayPal capture failed:', error);
      
      // Update order status
      const order = this.orders.get(orderId);
      if (order) {
        order.status = 'failed';
        order.failureReason = error instanceof Error ? error.message : 'Unknown error';
        this.orders.set(orderId, order);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment capture failed',
      };
    }
  }

  // Stripe Integration
  async createStripeCheckout(packageData: PaymentPackage): Promise<PaymentResult> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const orderId = `order_${Date.now()}_${user.id}_${packageData.id}`;

      // Create order in our system
      const order: PaymentOrder = {
        id: orderId,
        userId: user.id,
        packageId: packageData.id,
        packageName: packageData.name,
        goldCoins: packageData.goldCoins,
        bonusCoins: packageData.bonusCoins,
        amountUsd: packageData.priceUsd,
        paymentMethod: 'stripe',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      this.orders.set(orderId, order);

      // Create Stripe checkout session
      const sessionData = {
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: packageData.name,
              description: `${packageData.goldCoins.toLocaleString()} Gold Coins + ${packageData.bonusCoins.toLocaleString()} Bonus`,
              metadata: {
                package_id: packageData.id,
                gold_coins: packageData.goldCoins.toString(),
                bonus_coins: packageData.bonusCoins.toString(),
              },
            },
            unit_amount: Math.round(packageData.priceUsd * 100), // Stripe uses cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${window.location.origin}/payment-success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/payment-cancelled?order_id=${orderId}`,
        customer_email: user.email,
        metadata: {
          order_id: orderId,
          user_id: user.id,
          package_id: packageData.id,
        },
      };

      // Call Stripe API (in production, this would go through your backend)
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error(`Stripe API error: ${response.status}`);
      }

      const session: StripeCheckoutSession = await response.json();

      // Update order with Stripe details
      order.providerOrderId = session.id;
      order.status = 'processing';
      this.orders.set(orderId, order);

      return {
        success: true,
        orderId: orderId,
        redirectUrl: session.url,
      };

    } catch (error) {
      console.error('Stripe checkout creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async verifyStripePayment(orderId: string, sessionId: string): Promise<PaymentResult> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Verify payment with Stripe
      const response = await fetch(`/api/stripe/verify-session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Stripe verification failed: ${response.status}`);
      }

      const session = await response.json();

      if (session.payment_status === 'paid') {
        // Update order
        order.status = 'completed';
        order.providerPaymentId = session.payment_intent;
        order.payerEmail = session.customer_details?.email;
        order.completedAt = new Date().toISOString();
        this.orders.set(orderId, order);

        // Add coins to user's wallet
        await this.fulfillOrder(order);

        return {
          success: true,
          orderId: orderId,
          transactionId: session.payment_intent,
        };
      } else {
        throw new Error(`Payment not completed. Status: ${session.payment_status}`);
      }

    } catch (error) {
      console.error('Stripe payment verification failed:', error);
      
      const order = this.orders.get(orderId);
      if (order) {
        order.status = 'failed';
        order.failureReason = error instanceof Error ? error.message : 'Unknown error';
        this.orders.set(orderId, order);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed',
      };
    }
  }

  // Order fulfillment
  private async fulfillOrder(order: PaymentOrder): Promise<void> {
    try {
      // Get current user wallet balance
      const currentBalance = await this.getUserWalletBalance(order.userId);
      
      // Create wallet transaction
      const transaction: WalletTransaction = {
        id: `txn_${Date.now()}_${order.userId}`,
        userId: order.userId,
        type: 'purchase',
        goldCoinsChange: order.goldCoins + order.bonusCoins,
        sweepsCoinsChange: 0,
        bonusCoinsChange: 0,
        goldCoinsAfter: currentBalance.goldCoins + order.goldCoins + order.bonusCoins,
        sweepsCoinsAfter: currentBalance.sweepsCoins,
        bonusCoinsAfter: currentBalance.bonusCoins,
        description: `Purchase: ${order.packageName}`,
        referenceId: order.id,
        paymentTransactionId: order.providerPaymentId,
        createdAt: new Date().toISOString(),
      };

      // Add transaction to user's history
      const userTransactions = this.transactions.get(order.userId) || [];
      userTransactions.push(transaction);
      this.transactions.set(order.userId, userTransactions);

      // Update user's balance (in production, this would update the database)
      await this.updateUserWalletBalance(order.userId, {
        goldCoins: transaction.goldCoinsAfter,
        sweepsCoins: transaction.sweepsCoinsAfter,
        bonusCoins: transaction.bonusCoinsAfter,
      });

      // Send confirmation email (in production)
      await this.sendPurchaseConfirmationEmail(order, transaction);

      console.log(`Order ${order.id} fulfilled successfully`);

    } catch (error) {
      console.error('Order fulfillment failed:', error);
      throw error;
    }
  }

  // Wallet management
  private async getUserWalletBalance(userId: string): Promise<{
    goldCoins: number;
    sweepsCoins: number;
    bonusCoins: number;
  }> {
    // In production, this would fetch from database
    // For now, return mock data
    return {
      goldCoins: 5000,
      sweepsCoins: 25.5,
      bonusCoins: 200,
    };
  }

  private async updateUserWalletBalance(userId: string, balance: {
    goldCoins: number;
    sweepsCoins: number;
    bonusCoins: number;
  }): Promise<void> {
    // In production, this would update the database
    console.log(`Updated wallet for user ${userId}:`, balance);
  }

  private async sendPurchaseConfirmationEmail(order: PaymentOrder, transaction: WalletTransaction): Promise<void> {
    // In production, this would send an email
    console.log(`Sending confirmation email for order ${order.id}`);
  }

  // API helpers
  private async callPayPalAPI(endpoint: string, method: string, data?: any): Promise<Response> {
    const baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';

    // In production, the access token would be managed by your backend
    const accessToken = await this.getPayPalAccessToken();

    return fetch(`${baseURL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async getPayPalAccessToken(): Promise<string> {
    // In production, this would be handled by your backend
    // For now, return a mock token
    return 'mock_paypal_access_token';
  }

  // Public query methods
  getOrder(orderId: string): PaymentOrder | undefined {
    return this.orders.get(orderId);
  }

  getUserOrders(userId: string): PaymentOrder[] {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  getUserTransactions(userId: string): WalletTransaction[] {
    return this.transactions.get(userId) || [];
  }

  // Order status updates
  async cancelOrder(orderId: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) return false;

    if (order.status === 'pending' || order.status === 'processing') {
      order.status = 'cancelled';
      this.orders.set(orderId, order);
      return true;
    }

    return false;
  }

  async refundOrder(orderId: string, reason?: string): Promise<PaymentResult> {
    try {
      const order = this.orders.get(orderId);
      if (!order || order.status !== 'completed') {
        throw new Error('Order not found or not eligible for refund');
      }

      // Process refund through payment provider
      let refundResult;
      if (order.paymentMethod === 'paypal') {
        refundResult = await this.processPayPalRefund(order);
      } else if (order.paymentMethod === 'stripe') {
        refundResult = await this.processStripeRefund(order);
      } else {
        throw new Error('Unsupported payment method for refund');
      }

      if (refundResult.success) {
        // Update order status
        order.status = 'refunded';
        this.orders.set(orderId, order);

        // Deduct coins from user's wallet
        await this.processRefundWalletAdjustment(order, reason);
      }

      return refundResult;

    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }

  private async processPayPalRefund(order: PaymentOrder): Promise<PaymentResult> {
    // In production, this would call PayPal's refund API
    console.log(`Processing PayPal refund for order ${order.id}`);
    return { success: true, transactionId: `refund_${Date.now()}` };
  }

  private async processStripeRefund(order: PaymentOrder): Promise<PaymentResult> {
    // In production, this would call Stripe's refund API
    console.log(`Processing Stripe refund for order ${order.id}`);
    return { success: true, transactionId: `refund_${Date.now()}` };
  }

  private async processRefundWalletAdjustment(order: PaymentOrder, reason?: string): Promise<void> {
    const currentBalance = await this.getUserWalletBalance(order.userId);
    
    const transaction: WalletTransaction = {
      id: `refund_${Date.now()}_${order.userId}`,
      userId: order.userId,
      type: 'refund',
      goldCoinsChange: -(order.goldCoins + order.bonusCoins),
      sweepsCoinsChange: 0,
      bonusCoinsChange: 0,
      goldCoinsAfter: Math.max(0, currentBalance.goldCoins - (order.goldCoins + order.bonusCoins)),
      sweepsCoinsAfter: currentBalance.sweepsCoins,
      bonusCoinsAfter: currentBalance.bonusCoins,
      description: `Refund: ${order.packageName}${reason ? ` - ${reason}` : ''}`,
      referenceId: order.id,
      createdAt: new Date().toISOString(),
    };

    const userTransactions = this.transactions.get(order.userId) || [];
    userTransactions.push(transaction);
    this.transactions.set(order.userId, userTransactions);

    await this.updateUserWalletBalance(order.userId, {
      goldCoins: transaction.goldCoinsAfter,
      sweepsCoins: transaction.sweepsCoinsAfter,
      bonusCoins: transaction.bonusCoinsAfter,
    });
  }

  // Analytics and reporting
  getPaymentAnalytics(startDate?: Date, endDate?: Date) {
    const orders = Array.from(this.orders.values());
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      return true;
    });

    const completedOrders = filteredOrders.filter(order => order.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amountUsd, 0);
    const conversionRate = filteredOrders.length > 0 ? (completedOrders.length / filteredOrders.length) * 100 : 0;

    return {
      totalOrders: filteredOrders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      conversionRate,
      averageOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
      paymentMethodBreakdown: this.getPaymentMethodBreakdown(completedOrders),
    };
  }

  private getPaymentMethodBreakdown(orders: PaymentOrder[]) {
    const breakdown = orders.reduce((acc, order) => {
      const method = order.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, revenue: 0 };
      }
      acc[method].count++;
      acc[method].revenue += order.amountUsd;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return Object.entries(breakdown).map(([method, data]) => ({
      method,
      count: data.count,
      revenue: data.revenue,
      percentage: (data.revenue / orders.reduce((sum, o) => sum + o.amountUsd, 0)) * 100,
    }));
  }
}

export const paymentService = PaymentService.getInstance();
