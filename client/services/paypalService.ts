import { walletService, CurrencyType, DepositRecord } from './walletService';
import { currencyToggleService } from './currencyToggleService';

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  currency: 'USD';
}

export interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: PayPalPurchaseUnit[];
  payer?: PayPalPayer;
  payment_source?: PayPalPaymentSource;
  create_time: string;
  update_time: string;
  links: PayPalLink[];
}

export interface PayPalPurchaseUnit {
  reference_id: string;
  amount: PayPalAmount;
  payee?: PayPalPayee;
  description?: string;
  custom_id?: string;
  invoice_id?: string;
  soft_descriptor?: string;
  items?: PayPalItem[];
}

export interface PayPalAmount {
  currency_code: string;
  value: string;
  breakdown?: PayPalAmountBreakdown;
}

export interface PayPalAmountBreakdown {
  item_total?: PayPalMoney;
  shipping?: PayPalMoney;
  handling?: PayPalMoney;
  tax_total?: PayPalMoney;
  insurance?: PayPalMoney;
  shipping_discount?: PayPalMoney;
  discount?: PayPalMoney;
}

export interface PayPalMoney {
  currency_code: string;
  value: string;
}

export interface PayPalItem {
  name: string;
  unit_amount: PayPalMoney;
  tax?: PayPalMoney;
  quantity: string;
  description?: string;
  sku?: string;
  category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS';
}

export interface PayPalPayer {
  email_address?: string;
  payer_id?: string;
  name?: PayPalName;
  phone?: PayPalPhone;
  birth_date?: string;
  tax_info?: PayPalTaxInfo;
  address?: PayPalAddress;
}

export interface PayPalName {
  given_name?: string;
  surname?: string;
}

export interface PayPalPhone {
  phone_type?: 'FAX' | 'HOME' | 'MOBILE' | 'OTHER' | 'PAGER';
  phone_number: PayPalPhoneNumber;
}

export interface PayPalPhoneNumber {
  national_number: string;
}

export interface PayPalTaxInfo {
  tax_id: string;
  tax_id_type: 'BR_CPF' | 'BR_CNPJ';
}

export interface PayPalAddress {
  address_line_1?: string;
  address_line_2?: string;
  admin_area_2?: string; // City
  admin_area_1?: string; // State
  postal_code?: string;
  country_code: string;
}

export interface PayPalPayee {
  email_address?: string;
  merchant_id?: string;
}

export interface PayPalPaymentSource {
  paypal?: PayPalWallet;
  card?: PayPalCard;
}

export interface PayPalWallet {
  email_address?: string;
  account_id?: string;
  name?: PayPalName;
  phone?: PayPalPhone;
  birth_date?: string;
  tax_info?: PayPalTaxInfo;
  address?: PayPalAddress;
}

export interface PayPalCard {
  last_digits?: string;
  brand?: string;
  type?: 'CREDIT' | 'DEBIT' | 'PREPAID' | 'UNKNOWN';
}

export interface PayPalLink {
  href: string;
  rel: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'PATCH';
}

export interface PayPalCaptureResponse {
  id: string;
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED';
  amount: PayPalAmount;
  final_capture: boolean;
  seller_protection?: PayPalSellerProtection;
  seller_receivable_breakdown?: PayPalSellerReceivableBreakdown;
  invoice_id?: string;
  custom_id?: string;
  create_time: string;
  update_time: string;
}

export interface PayPalSellerProtection {
  status: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  dispute_categories?: ('ITEM_NOT_RECEIVED' | 'UNAUTHORIZED_TRANSACTION')[];
}

export interface PayPalSellerReceivableBreakdown {
  gross_amount: PayPalMoney;
  paypal_fee?: PayPalMoney;
  net_amount?: PayPalMoney;
  receivable_amount?: PayPalMoney;
  exchange_rate?: PayPalExchangeRate;
}

export interface PayPalExchangeRate {
  source_currency: string;
  target_currency: string;
  value: string;
}

export interface PayPalError {
  name: string;
  message: string;
  debug_id: string;
  details?: PayPalErrorDetail[];
  links?: PayPalLink[];
}

export interface PayPalErrorDetail {
  field?: string;
  value?: string;
  location?: 'body' | 'path' | 'query';
  issue: string;
  description?: string;
}

export interface GoldCoinPackage {
  id: string;
  name: string;
  description: string;
  goldCoins: number;
  sweepCoins: number;
  price: number;
  bonusPercentage?: number;
}

export interface PaymentRequest {
  packageId: string;
  userId: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  captureId?: string;
  error?: string;
  goldCoinsAwarded?: number;
  sweepCoinsAwarded?: number;
}

class PayPalService {
  private config: PayPalConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      clientId: process.env.VITE_PAYPAL_CLIENT_ID || 'demo_client_id',
      clientSecret: process.env.VITE_PAYPAL_CLIENT_SECRET || 'demo_client_secret',
      environment: (process.env.VITE_PAYPAL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      currency: 'USD'
    };
  }

  private get baseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000) - 60000); // Expire 1 min early

      return this.accessToken;
    } catch (error) {
      console.error('PayPal authentication error:', error);
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  public async createOrder(request: PaymentRequest, package_data: GoldCoinPackage): Promise<PayPalOrder> {
    const token = await this.getAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: request.packageId,
        description: `CoinKrazy Gold Coin Package: ${package_data.name}`,
        custom_id: request.userId,
        soft_descriptor: 'CoinKrazy GC',
        amount: {
          currency_code: this.config.currency,
          value: package_data.price.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: this.config.currency,
              value: package_data.price.toFixed(2)
            }
          }
        },
        items: [{
          name: package_data.name,
          description: package_data.description,
          sku: package_data.id,
          unit_amount: {
            currency_code: this.config.currency,
            value: package_data.price.toFixed(2)
          },
          quantity: '1',
          category: 'DIGITAL_GOODS' as const
        }]
      }],
      application_context: {
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        brand_name: 'CoinKrazy',
        locale: 'en-US',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'PayPal-Request-Id': `${Date.now()}-${Math.random().toString(36)}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PayPal order creation error:', errorData);
        throw new Error(`Failed to create PayPal order: ${errorData.message || response.status}`);
      }

      const order: PayPalOrder = await response.json();
      console.log('PayPal order created:', order.id);
      return order;

    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw error;
    }
  }

  public async captureOrder(orderId: string): Promise<PayPalCaptureResponse> {
    const token = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'PayPal-Request-Id': `${Date.now()}-${Math.random().toString(36)}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PayPal capture error:', errorData);
        throw new Error(`Failed to capture PayPal order: ${errorData.message || response.status}`);
      }

      const captureData = await response.json();
      console.log('PayPal order captured:', captureData);
      return captureData.purchase_units[0].payments.captures[0];

    } catch (error) {
      console.error('PayPal capture error:', error);
      throw error;
    }
  }

  public async getOrderDetails(orderId: string): Promise<PayPalOrder> {
    const token = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get order details: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayPal get order error:', error);
      throw error;
    }
  }

  public async processPayment(orderId: string, packageData: GoldCoinPackage, userId: string): Promise<PaymentResult> {
    try {
      // Get order details to verify
      const orderDetails = await this.getOrderDetails(orderId);
      
      if (orderDetails.status !== 'APPROVED') {
        throw new Error('Order is not approved for capture');
      }

      // Capture the payment
      const capture = await this.captureOrder(orderId);
      
      if (capture.status !== 'COMPLETED') {
        throw new Error('Payment capture failed');
      }

      // Calculate bonus amounts
      const bonusGC = Math.floor(packageData.goldCoins * (packageData.bonusPercentage || 0) / 100);
      const bonusSC = Math.floor(packageData.sweepCoins * (packageData.bonusPercentage || 0) / 100);

      // Process deposit through enhanced wallet service
      const deposit = await walletService.processDeposit(
        userId,
        parseFloat(capture.amount.value),
        'PayPal',
        capture.id,
        {
          goldCoins: packageData.goldCoins,
          bonusGC: bonusGC,
          sweepsCoins: packageData.sweepCoins + bonusSC
        },
        `PayPal purchase: Package ${packageData.id} - Order ${orderId}`
      );

      // Update user's preferred currency based on their purchase pattern
      const currentCurrency = currencyToggleService.getUserCurrency(userId);
      if (packageData.goldCoins > packageData.sweepCoins) {
        currencyToggleService.setUserCurrency(userId, 'GC');
      } else if (packageData.sweepCoins > 0) {
        currencyToggleService.setUserCurrency(userId, 'SC');
      }

      console.log('Payment processed successfully:', deposit);

      return {
        success: true,
        transactionId: deposit.id,
        orderId: orderId,
        captureId: capture.id,
        goldCoinsAwarded: packageData.goldCoins + bonusGC,
        sweepCoinsAwarded: packageData.sweepCoins + bonusSC,
        depositRecord: deposit
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  public getApprovalUrl(order: PayPalOrder): string | null {
    const approvalLink = order.links.find(link => link.rel === 'approve');
    return approvalLink ? approvalLink.href : null;
  }

  // Simulate webhook verification (in production, you'd verify PayPal webhooks)
  public async verifyWebhook(webhookData: any): Promise<boolean> {
    try {
      // In production, you would verify the webhook signature
      // For demo purposes, we'll just validate the structure
      return webhookData && 
             webhookData.id && 
             webhookData.event_type && 
             webhookData.resource;
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }

  // Get transaction history (from local storage in demo)
  public getTransactionHistory(userId: string): any[] {
    const transactions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('transaction_')) {
        try {
          const transaction = JSON.parse(localStorage.getItem(key) || '{}');
          if (transaction.userId === userId) {
            transactions.push(transaction);
          }
        } catch (error) {
          console.error('Error parsing transaction:', error);
        }
      }
    }
    return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Refund functionality (for admin use)
  public async refundCapture(captureId: string, amount?: number): Promise<any> {
    const token = await this.getAccessToken();

    const refundData = amount ? {
      amount: {
        value: amount.toFixed(2),
        currency_code: this.config.currency
      }
    } : {}; // Full refund if no amount specified

    try {
      const response = await fetch(`${this.baseUrl}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'PayPal-Request-Id': `${Date.now()}-${Math.random().toString(36)}`
        },
        body: JSON.stringify(refundData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Refund failed: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayPal refund error:', error);
      throw error;
    }
  }
}

export const paypalService = new PayPalService();
export default paypalService;
