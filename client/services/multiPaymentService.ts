import { authService } from "./authService";
import { paymentService, PaymentPackage, PaymentResult } from "./paymentService";

// Extended payment method types
export type PaymentMethodType = 'paypal' | 'stripe' | 'crypto' | 'apple_pay' | 'google_pay' | 'bank_transfer';

// Crypto payment types
export interface CryptoPaymentMethod {
  id: string;
  name: string;
  symbol: string;
  network: string;
  contractAddress?: string;
  decimals: number;
  icon: string;
  isEnabled: boolean;
  processingFee: number;
  confirmationsRequired: number;
  estimatedTime: string;
  usdRate?: number;
}

// Apple Pay configuration
export interface ApplePayConfig {
  merchantId: string;
  merchantCapabilities: string[];
  supportedNetworks: string[];
  countryCode: string;
  currencyCode: string;
  requiredBillingContactFields: string[];
  requiredShippingContactFields: string[];
}

// Google Pay configuration
export interface GooglePayConfig {
  merchantId: string;
  merchantName: string;
  environment: 'TEST' | 'PRODUCTION';
  countryCode: string;
  currencyCode: string;
  allowedCardNetworks: string[];
  allowedCardAuthMethods: string[];
}

// Payment request interfaces
export interface CryptoPaymentRequest {
  packageId: string;
  cryptoMethod: string;
  amount: number;
  userWallet?: string;
}

export interface ApplePayPaymentRequest {
  packageId: string;
  displayItems: ApplePayJS.ApplePayLineItem[];
  total: ApplePayJS.ApplePayLineItem;
  merchantCapabilities: ApplePayJS.ApplePayMerchantCapability[];
  supportedNetworks: ApplePayJS.ApplePayPaymentNetwork[];
}

export interface GooglePayPaymentRequest {
  packageId: string;
  transactionInfo: google.payments.api.TransactionInfo;
  merchantInfo: google.payments.api.MerchantInfo;
  allowedPaymentMethods: google.payments.api.PaymentMethodSpecification[];
}

// Transaction results
export interface CryptoTransactionResult {
  success: boolean;
  transactionHash?: string;
  paymentAddress?: string;
  amount?: number;
  cryptoSymbol?: string;
  estimatedConfirmationTime?: string;
  error?: string;
}

export interface MobilePaymentResult {
  success: boolean;
  paymentToken?: string;
  transactionId?: string;
  billingContact?: any;
  shippingContact?: any;
  error?: string;
}

class MultiPaymentService {
  private static instance: MultiPaymentService;
  private googlePayClient: google.payments.api.PaymentsClient | null = null;
  private applePaySession: ApplePaySession | null = null;

  // Supported crypto currencies
  private cryptoMethods: CryptoPaymentMethod[] = [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      network: 'bitcoin',
      decimals: 8,
      icon: '₿',
      isEnabled: true,
      processingFee: 0.0005,
      confirmationsRequired: 3,
      estimatedTime: '30-60 minutes',
      usdRate: 45000,
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      network: 'ethereum',
      decimals: 18,
      icon: 'Ξ',
      isEnabled: true,
      processingFee: 0.002,
      confirmationsRequired: 12,
      estimatedTime: '5-15 minutes',
      usdRate: 2500,
    },
    {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      network: 'ethereum',
      contractAddress: '0xA0b86a33E6C1f4d1c8F1C0b1b7D8E1C9F2A3B4C5',
      decimals: 6,
      icon: '$',
      isEnabled: true,
      processingFee: 0.01,
      confirmationsRequired: 12,
      estimatedTime: '5-15 minutes',
      usdRate: 1,
    },
    {
      id: 'usdt',
      name: 'Tether USD',
      symbol: 'USDT',
      network: 'ethereum',
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      icon: '₮',
      isEnabled: true,
      processingFee: 0.01,
      confirmationsRequired: 12,
      estimatedTime: '5-15 minutes',
      usdRate: 1,
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      network: 'polygon',
      decimals: 18,
      icon: '🔷',
      isEnabled: true,
      processingFee: 0.1,
      confirmationsRequired: 20,
      estimatedTime: '2-5 minutes',
      usdRate: 0.85,
    },
  ];

  static getInstance(): MultiPaymentService {
    if (!MultiPaymentService.instance) {
      MultiPaymentService.instance = new MultiPaymentService();
    }
    return MultiPaymentService.instance;
  }

  constructor() {
    this.initializeGooglePay();
    this.updateCryptoRates();
    // Update crypto rates every 5 minutes
    setInterval(() => this.updateCryptoRates(), 300000);
  }

  // ===============================
  // CRYPTO PAYMENT METHODS
  // ===============================

  /**
   * Get available crypto payment methods
   */
  getCryptoMethods(): CryptoPaymentMethod[] {
    return this.cryptoMethods.filter(method => method.isEnabled);
  }

  /**
   * Get specific crypto method
   */
  getCryptoMethod(id: string): CryptoPaymentMethod | undefined {
    return this.cryptoMethods.find(method => method.id === id);
  }

  /**
   * Create crypto payment
   */
  async createCryptoPayment(request: CryptoPaymentRequest): Promise<CryptoTransactionResult> {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const cryptoMethod = this.getCryptoMethod(request.cryptoMethod);
      if (!cryptoMethod) {
        throw new Error('Unsupported crypto payment method');
      }

      // Calculate crypto amount
      const cryptoAmount = request.amount / (cryptoMethod.usdRate || 1);
      
      // Generate payment address (in production, use a crypto payment processor)
      const paymentAddress = this.generatePaymentAddress(cryptoMethod);
      
      // Create order in database
      const orderId = `crypto_${Date.now()}_${user.id}_${request.packageId}`;
      
      // Store crypto payment details
      const cryptoOrder = {
        orderId,
        userId: user.id,
        packageId: request.packageId,
        cryptoMethod: request.cryptoMethod,
        cryptoAmount,
        usdAmount: request.amount,
        paymentAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      };

      // Store in localStorage for demo (in production, use database)
      this.storeCryptoOrder(cryptoOrder);

      // Start monitoring blockchain for payment
      this.monitorCryptoPayment(cryptoOrder);

      return {
        success: true,
        paymentAddress,
        amount: cryptoAmount,
        cryptoSymbol: cryptoMethod.symbol,
        estimatedConfirmationTime: cryptoMethod.estimatedTime,
      };

    } catch (error) {
      console.error('Crypto payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check crypto payment status
   */
  async checkCryptoPaymentStatus(orderId: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed' | 'expired';
    confirmations?: number;
    transactionHash?: string;
  }> {
    try {
      // In production, query blockchain APIs or payment processor
      const order = this.getCryptoOrder(orderId);
      if (!order) {
        return { status: 'failed' };
      }

      // Check if expired
      if (new Date() > new Date(order.expiresAt)) {
        return { status: 'expired' };
      }

      // Mock blockchain check (in production, use actual blockchain APIs)
      const mockConfirmations = Math.floor(Math.random() * 15);
      const required = this.getCryptoMethod(order.cryptoMethod)?.confirmationsRequired || 3;
      
      if (mockConfirmations >= required) {
        return {
          status: 'confirmed',
          confirmations: mockConfirmations,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        };
      }

      return {
        status: 'pending',
        confirmations: mockConfirmations,
      };

    } catch (error) {
      console.error('Crypto payment status check failed:', error);
      return { status: 'failed' };
    }
  }

  private generatePaymentAddress(cryptoMethod: CryptoPaymentMethod): string {
    // Generate mock addresses (in production, use actual payment processor)
    switch (cryptoMethod.network) {
      case 'bitcoin':
        return `bc1${Math.random().toString(36).substr(2, 39)}`;
      case 'ethereum':
      case 'polygon':
        return `0x${Math.random().toString(16).substr(2, 40)}`;
      default:
        return `addr_${Math.random().toString(36).substr(2, 32)}`;
    }
  }

  private storeCryptoOrder(order: any): void {
    const orders = JSON.parse(localStorage.getItem('crypto_orders') || '[]');
    orders.push(order);
    localStorage.setItem('crypto_orders', JSON.stringify(orders));
  }

  private getCryptoOrder(orderId: string): any {
    const orders = JSON.parse(localStorage.getItem('crypto_orders') || '[]');
    return orders.find((order: any) => order.orderId === orderId);
  }

  private monitorCryptoPayment(order: any): void {
    // Mock payment monitoring (in production, use webhooks or polling)
    setTimeout(() => {
      console.log(`Crypto payment monitoring started for order ${order.orderId}`);
      // Simulate payment detection after random time
      const detectTime = Math.random() * 300000 + 60000; // 1-5 minutes
      setTimeout(() => {
        console.log(`Crypto payment detected for order ${order.orderId}`);
        // Process the order fulfillment
        this.processCryptoPaymentConfirmation(order);
      }, detectTime);
    }, 1000);
  }

  private async processCryptoPaymentConfirmation(order: any): Promise<void> {
    try {
      // Fulfill the order using existing payment service
      console.log(`Processing crypto payment confirmation for order ${order.orderId}`);
      // In production, this would update the database and add coins to user account
    } catch (error) {
      console.error('Failed to process crypto payment confirmation:', error);
    }
  }

  private async updateCryptoRates(): Promise<void> {
    try {
      // In production, fetch real rates from CoinGecko, CoinMarketCap, etc.
      const mockRates = {
        bitcoin: 45000 + (Math.random() - 0.5) * 2000,
        ethereum: 2500 + (Math.random() - 0.5) * 200,
        usdc: 1,
        usdt: 1,
        polygon: 0.85 + (Math.random() - 0.5) * 0.1,
      };

      this.cryptoMethods.forEach(method => {
        if (mockRates[method.id as keyof typeof mockRates]) {
          method.usdRate = mockRates[method.id as keyof typeof mockRates];
        }
      });

    } catch (error) {
      console.error('Failed to update crypto rates:', error);
    }
  }

  // ===============================
  // APPLE PAY INTEGRATION
  // ===============================

  /**
   * Check if Apple Pay is available
   */
  isApplePayAvailable(): boolean {
    return typeof window !== 'undefined' && 
           'ApplePaySession' in window && 
           ApplePaySession.canMakePayments();
  }

  /**
   * Check if user can make Apple Pay payments
   */
  async canMakeApplePayPayments(): Promise<boolean> {
    if (!this.isApplePayAvailable()) return false;
    
    try {
      return ApplePaySession.canMakePaymentsWithActiveCard('merchant.com.coinkrazy.payments');
    } catch (error) {
      console.error('Apple Pay availability check failed:', error);
      return false;
    }
  }

  /**
   * Create Apple Pay payment session
   */
  async createApplePayPayment(request: ApplePayPaymentRequest): Promise<MobilePaymentResult> {
    try {
      if (!this.isApplePayAvailable()) {
        throw new Error('Apple Pay is not available on this device');
      }

      const paymentRequest: ApplePayJS.ApplePayPaymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: request.merchantCapabilities,
        supportedNetworks: request.supportedNetworks,
        total: request.total,
        lineItems: request.displayItems,
        requiredBillingContactFields: ['postalAddress', 'name'],
        requiredShippingContactFields: [],
      };

      return new Promise((resolve, reject) => {
        const session = new ApplePaySession(3, paymentRequest);
        this.applePaySession = session;

        session.onvalidatemerchant = async (event) => {
          try {
            // Validate merchant with Apple (requires server-side implementation)
            const merchantSession = await this.validateApplePayMerchant(event.validationURL);
            session.completeMerchantValidation(merchantSession);
          } catch (error) {
            session.abort();
            reject(error);
          }
        };

        session.onpaymentauthorized = async (event) => {
          try {
            // Process the payment
            const result = await this.processApplePayPayment(event.payment, request.packageId);
            
            if (result.success) {
              session.completePayment(ApplePaySession.STATUS_SUCCESS);
              resolve({
                success: true,
                paymentToken: event.payment.token.paymentData,
                transactionId: result.transactionId,
                billingContact: event.payment.billingContact,
                shippingContact: event.payment.shippingContact,
              });
            } else {
              session.completePayment(ApplePaySession.STATUS_FAILURE);
              reject(new Error(result.error || 'Payment processing failed'));
            }
          } catch (error) {
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            reject(error);
          }
        };

        session.oncancel = () => {
          resolve({
            success: false,
            error: 'Payment cancelled by user',
          });
        };

        session.begin();
      });

    } catch (error) {
      console.error('Apple Pay payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async validateApplePayMerchant(validationURL: string): Promise<any> {
    // In production, this must be done on your server
    const response = await fetch('/api/payments/apple-pay/validate-merchant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`,
      },
      body: JSON.stringify({ validationURL }),
    });

    if (!response.ok) {
      throw new Error('Merchant validation failed');
    }

    return response.json();
  }

  private async processApplePayPayment(payment: ApplePayJS.ApplePayPayment, packageId: string): Promise<PaymentResult> {
    // Process Apple Pay payment through your payment processor
    const response = await fetch('/api/payments/apple-pay/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`,
      },
      body: JSON.stringify({
        payment,
        packageId,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment processing failed');
    }

    return response.json();
  }

  // ===============================
  // GOOGLE PAY INTEGRATION
  // ===============================

  /**
   * Initialize Google Pay
   */
  private initializeGooglePay(): void {
    if (typeof window === 'undefined' || !window.google?.payments?.api) {
      return;
    }

    const paymentsClient = new google.payments.api.PaymentsClient({
      environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
    });

    this.googlePayClient = paymentsClient;
  }

  /**
   * Check if Google Pay is available
   */
  async isGooglePayAvailable(): Promise<boolean> {
    if (!this.googlePayClient) return false;

    try {
      const isReadyToPayRequest: google.payments.api.IsReadyToPayRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX'],
          },
        }],
      };

      const response = await this.googlePayClient.isReadyToPay(isReadyToPayRequest);
      return response.result;
    } catch (error) {
      console.error('Google Pay availability check failed:', error);
      return false;
    }
  }

  /**
   * Create Google Pay payment
   */
  async createGooglePayPayment(request: GooglePayPaymentRequest): Promise<MobilePaymentResult> {
    try {
      if (!this.googlePayClient) {
        throw new Error('Google Pay is not initialized');
      }

      const paymentDataRequest: google.payments.api.PaymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: request.allowedPaymentMethods,
        transactionInfo: request.transactionInfo,
        merchantInfo: request.merchantInfo,
        callbackIntents: ['PAYMENT_AUTHORIZATION'],
      };

      const paymentData = await this.googlePayClient.loadPaymentData(paymentDataRequest);
      
      // Process the payment
      const result = await this.processGooglePayPayment(paymentData, request.packageId);
      
      if (result.success) {
        return {
          success: true,
          paymentToken: paymentData.paymentMethodData.tokenizationData.token,
          transactionId: result.transactionId,
        };
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }

    } catch (error) {
      console.error('Google Pay payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async processGooglePayPayment(paymentData: google.payments.api.PaymentData, packageId: string): Promise<PaymentResult> {
    // Process Google Pay payment through your payment processor
    const response = await fetch('/api/payments/google-pay/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`,
      },
      body: JSON.stringify({
        paymentData,
        packageId,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment processing failed');
    }

    return response.json();
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Get all available payment methods for a user
   */
  async getAvailablePaymentMethods(): Promise<{
    traditional: string[];
    crypto: CryptoPaymentMethod[];
    mobile: {
      applePay: boolean;
      googlePay: boolean;
    };
  }> {
    const [applePayAvailable, googlePayAvailable] = await Promise.all([
      this.canMakeApplePayPayments(),
      this.isGooglePayAvailable(),
    ]);

    return {
      traditional: ['paypal', 'stripe'],
      crypto: this.getCryptoMethods(),
      mobile: {
        applePay: applePayAvailable,
        googlePay: googlePayAvailable,
      },
    };
  }

  /**
   * Estimate processing time for payment method
   */
  getPaymentMethodEstimate(method: PaymentMethodType, cryptoId?: string): string {
    switch (method) {
      case 'paypal':
      case 'stripe':
      case 'apple_pay':
      case 'google_pay':
        return 'Instant';
      case 'crypto':
        if (cryptoId) {
          const cryptoMethod = this.getCryptoMethod(cryptoId);
          return cryptoMethod?.estimatedTime || '10-30 minutes';
        }
        return '5-60 minutes';
      case 'bank_transfer':
        return '1-3 business days';
      default:
        return 'Unknown';
    }
  }

  /**
   * Calculate total cost including fees
   */
  calculateTotalCost(amount: number, method: PaymentMethodType, cryptoId?: string): {
    subtotal: number;
    fees: number;
    total: number;
  } {
    let fees = 0;

    switch (method) {
      case 'paypal':
        fees = amount * 0.0349 + 0.49; // PayPal standard rates
        break;
      case 'stripe':
        fees = amount * 0.029 + 0.30; // Stripe standard rates
        break;
      case 'crypto':
        if (cryptoId) {
          const cryptoMethod = this.getCryptoMethod(cryptoId);
          fees = cryptoMethod?.processingFee || 0;
        }
        break;
      case 'apple_pay':
      case 'google_pay':
        fees = amount * 0.025; // Mobile payment processor fees
        break;
      case 'bank_transfer':
        fees = 5.00; // Fixed bank transfer fee
        break;
    }

    return {
      subtotal: amount,
      fees: Math.round(fees * 100) / 100,
      total: Math.round((amount + fees) * 100) / 100,
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }

    // For crypto currencies
    const cryptoMethod = this.cryptoMethods.find(m => m.symbol === currency);
    if (cryptoMethod) {
      return `${amount.toFixed(cryptoMethod.decimals > 4 ? 4 : cryptoMethod.decimals)} ${currency}`;
    }

    return `${amount} ${currency}`;
  }

  /**
   * Get payment method icon
   */
  getPaymentMethodIcon(method: PaymentMethodType, cryptoId?: string): string {
    switch (method) {
      case 'paypal':
        return '💙';
      case 'stripe':
        return '💳';
      case 'apple_pay':
        return '🍎';
      case 'google_pay':
        return '🔍';
      case 'bank_transfer':
        return '🏦';
      case 'crypto':
        if (cryptoId) {
          const cryptoMethod = this.getCryptoMethod(cryptoId);
          return cryptoMethod?.icon || '₿';
        }
        return '₿';
      default:
        return '💰';
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.applePaySession) {
      this.applePaySession.abort();
      this.applePaySession = null;
    }
  }
}

export const multiPaymentService = MultiPaymentService.getInstance();
