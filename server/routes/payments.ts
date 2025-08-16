import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { databaseService } from '../services/database';

const router = express.Router();

// Types
interface PayPalOrderRequest {
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

interface PayPalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'your_paypal_client_id';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'your_paypal_client_secret';
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

// Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'your_stripe_publishable_key';

// PayPal access token cache
let paypalAccessToken: string | null = null;
let paypalTokenExpiry: number = 0;

// Helper function to get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (paypalAccessToken && Date.now() < paypalTokenExpiry) {
    return paypalAccessToken;
  }

  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.status}`);
    }

    const data: PayPalAccessTokenResponse = await response.json();
    
    // Cache the token
    paypalAccessToken = data.access_token;
    paypalTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute for safety
    
    return paypalAccessToken;
  } catch (error) {
    console.error('Failed to get PayPal access token:', error);
    throw new Error('PayPal authentication failed');
  }
}

// PayPal Routes

// Create PayPal order
router.post('/paypal/create-order', authenticateToken, async (req, res) => {
  try {
    const { packageId, userId } = req.body;
    const user = (req as any).user;

    // Verify user owns this order
    if (user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get package details from database
    const packageData = await databaseService.getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Create order in database first
    const orderId = `order_${Date.now()}_${userId}_${packageId}`;
    const order = {
      id: orderId,
      userId: userId,
      packageId: packageId,
      packageName: packageData.package_name,
      goldCoins: packageData.gold_coins,
      bonusCoins: packageData.bonus_coins,
      amountUsd: packageData.price_usd,
      paymentMethod: 'paypal',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await databaseService.createPaymentTransaction(order);

    // Create PayPal order
    const paypalOrderRequest: PayPalOrderRequest = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: packageData.price_usd.toFixed(2),
        },
        description: `${packageData.package_name} - ${packageData.gold_coins.toLocaleString()} Gold Coins`,
        custom_id: `pkg_${packageId}_user_${userId}`,
        invoice_id: orderId,
      }],
      application_context: {
        brand_name: 'CoinKrazy',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${req.headers.origin}/payment-success?order_id=${orderId}`,
        cancel_url: `${req.headers.origin}/payment-cancelled?order_id=${orderId}`,
      },
      payer: {
        email_address: user.email,
      },
    };

    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paypalOrderRequest),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('PayPal order creation failed:', errorData);
      throw new Error(`PayPal order creation failed: ${response.status}`);
    }

    const paypalOrder = await response.json();

    // Update order with PayPal order ID
    await databaseService.updatePaymentTransaction(orderId, {
      providerOrderId: paypalOrder.id,
      status: 'processing',
    });

    res.json({
      orderId: orderId,
      paypalOrderId: paypalOrder.id,
      approvalUrl: paypalOrder.links.find((link: any) => link.rel === 'approve')?.href,
    });

  } catch (error) {
    console.error('Create PayPal order error:', error);
    res.status(500).json({ 
      error: 'Failed to create PayPal order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Capture PayPal order
router.post('/paypal/capture-order', authenticateToken, async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body;
    const user = (req as any).user;

    // Get order from database
    const order = await databaseService.getPaymentTransaction(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order
    if (order.user_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Capture payment with PayPal
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('PayPal capture failed:', errorData);
      throw new Error(`PayPal capture failed: ${response.status}`);
    }

    const captureResult = await response.json();

    if (captureResult.status === 'COMPLETED') {
      const paymentId = captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      const payerEmail = captureResult.payer?.email_address;

      // Update order in database
      await databaseService.updatePaymentTransaction(orderId, {
        status: 'completed',
        providerPaymentId: paymentId,
        payerEmail: payerEmail,
        completedAt: new Date().toISOString(),
      });

      // Fulfill the order (add coins to user's wallet)
      await fulfillOrder(order);

      res.json({
        success: true,
        orderId: orderId,
        paymentId: paymentId,
        message: 'Payment completed successfully'
      });

    } else {
      // Payment not completed
      await databaseService.updatePaymentTransaction(orderId, {
        status: 'failed',
        failureReason: `Payment not completed. Status: ${captureResult.status}`,
      });

      res.status(400).json({
        error: 'Payment not completed',
        status: captureResult.status
      });
    }

  } catch (error) {
    console.error('Capture PayPal order error:', error);
    
    // Update order status to failed
    if (req.body.orderId) {
      await databaseService.updatePaymentTransaction(req.body.orderId, {
        status: 'failed',
        failureReason: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    res.status(500).json({ 
      error: 'Failed to capture PayPal payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stripe Routes

// Create Stripe checkout session
router.post('/stripe/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { packageId, userId } = req.body;
    const user = (req as any).user;

    // Verify user owns this order
    if (user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get package details from database
    const packageData = await databaseService.getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Create order in database first
    const orderId = `order_${Date.now()}_${userId}_${packageId}`;
    const order = {
      id: orderId,
      userId: userId,
      packageId: packageId,
      packageName: packageData.package_name,
      goldCoins: packageData.gold_coins,
      bonusCoins: packageData.bonus_coins,
      amountUsd: packageData.price_usd,
      paymentMethod: 'stripe',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await databaseService.createPaymentTransaction(order);

    // Create Stripe checkout session
    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: packageData.package_name,
            description: `${packageData.gold_coins.toLocaleString()} Gold Coins + ${packageData.bonus_coins.toLocaleString()} Bonus`,
            metadata: {
              package_id: packageId,
              gold_coins: packageData.gold_coins.toString(),
              bonus_coins: packageData.bonus_coins.toString(),
            },
          },
          unit_amount: Math.round(packageData.price_usd * 100), // Stripe uses cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment-success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment-cancelled?order_id=${orderId}`,
      customer_email: user.email,
      metadata: {
        order_id: orderId,
        user_id: userId,
        package_id: packageId,
      },
    });

    // Update order with Stripe session ID
    await databaseService.updatePaymentTransaction(orderId, {
      providerOrderId: session.id,
      status: 'processing',
    });

    res.json({
      orderId: orderId,
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Create Stripe session error:', error);
    res.status(500).json({ 
      error: 'Failed to create Stripe checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify Stripe payment
router.get('/stripe/verify-session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { orderId } = req.query;
    const user = (req as any).user;

    // Get order from database
    const order = await databaseService.getPaymentTransaction(orderId as string);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order
    if (order.user_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify session with Stripe
    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update order in database
      await databaseService.updatePaymentTransaction(orderId as string, {
        status: 'completed',
        providerPaymentId: session.payment_intent,
        payerEmail: session.customer_details?.email,
        completedAt: new Date().toISOString(),
      });

      // Fulfill the order
      await fulfillOrder(order);

      res.json({
        success: true,
        orderId: orderId,
        paymentId: session.payment_intent,
        message: 'Payment verified and completed'
      });

    } else {
      res.status(400).json({
        error: 'Payment not completed',
        paymentStatus: session.payment_status
      });
    }

  } catch (error) {
    console.error('Verify Stripe payment error:', error);
    res.status(500).json({ 
      error: 'Failed to verify Stripe payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stripe webhook for handling events
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = require('stripe')(STRIPE_SECRET_KEY);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  if (endpointSecret) {
    const sig = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }
  } else {
    event = req.body;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      
      if (orderId) {
        // Update order status
        await databaseService.updatePaymentTransaction(orderId, {
          status: 'completed',
          providerPaymentId: session.payment_intent,
          payerEmail: session.customer_details?.email,
          completedAt: new Date().toISOString(),
        });

        // Fulfill the order
        const order = await databaseService.getPaymentTransaction(orderId);
        if (order) {
          await fulfillOrder(order);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      // Handle failed payment
      console.log('Payment failed:', paymentIntent.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Common Routes

// Get order status
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = (req as any).user;

    const order = await databaseService.getPaymentTransaction(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order
    if (order.user_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      error: 'Failed to get order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { limit = 50, offset = 0 } = req.query;

    const orders = await databaseService.getUserPaymentHistory(user.id, Number(limit), Number(offset));
    res.json(orders);

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ 
      error: 'Failed to get payment history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel order
router.post('/order/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = (req as any).user;

    const order = await databaseService.getPaymentTransaction(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order
    if (order.user_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Can only cancel pending or processing orders
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    await databaseService.updatePaymentTransaction(orderId, {
      status: 'cancelled',
    });

    res.json({ message: 'Order cancelled successfully' });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to fulfill orders
async function fulfillOrder(order: any): Promise<void> {
  try {
    // Get current user balance
    const currentBalance = await databaseService.getUserBalance(order.user_id);
    
    // Calculate new balance
    const newGoldCoins = currentBalance.gold_coins + order.gold_coins + order.bonus_coins;
    
    // Update user's wallet
    await databaseService.updateUserBalance(order.user_id, {
      gold_coins: newGoldCoins,
    });

    // Create wallet transaction record
    const transaction = {
      transactionId: `txn_${Date.now()}_${order.user_id}`,
      userId: order.user_id,
      transactionType: 'purchase',
      goldCoinsChange: order.gold_coins + order.bonus_coins,
      sweepsCoinsChange: 0,
      goldCoinsAfter: newGoldCoins,
      sweepsCoinsAfter: currentBalance.sweeps_coins,
      description: `Purchase: ${order.package_name}`,
      referenceId: order.id,
      paymentTransactionId: order.provider_payment_id,
    };

    await databaseService.createWalletTransaction(transaction);

    console.log(`Order ${order.id} fulfilled successfully for user ${order.user_id}`);

  } catch (error) {
    console.error('Order fulfillment failed:', error);
    throw error;
  }
}

export default router;
