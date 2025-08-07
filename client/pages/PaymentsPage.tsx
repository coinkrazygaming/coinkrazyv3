import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  CreditCard,
  Wallet,
  Coins,
  Crown,
  DollarSign,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Settings,
  History,
  Plus,
  Minus,
  ArrowRight,
  GoogleIcon,
  Info,
  Lock,
  Star,
  Gift
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { walletService } from '../services/walletService';
import { paypalService } from '../services/paypalService';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  type: 'paypal' | 'googlepay' | 'card';
  name: string;
  icon: React.ReactNode;
  isDefault: boolean;
  isEnabled: boolean;
  description: string;
  fees: string;
  processingTime: string;
}

interface UserBalance {
  GC: number;
  SC: number;
  USD: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'bonus' | 'win';
  method: 'paypal' | 'googlepay' | 'card';
  amount: number;
  currency: 'GC' | 'SC' | 'USD';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  description: string;
  reference?: string;
}

interface VIPStatus {
  isVIP: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  expiresAt?: Date;
  benefits: string[];
  monthlyFee: number;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'googlepay'>('paypal');
  const [userBalance, setUserBalance] = useState<UserBalance>({
    GC: 125000,
    SC: 450.75,
    USD: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0
  });

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      icon: <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" className="h-6" />,
      isDefault: true,
      isEnabled: true,
      description: 'Secure payments with PayPal protection',
      fees: 'No additional fees',
      processingTime: 'Instant'
    },
    {
      id: 'googlepay',
      type: 'googlepay',
      name: 'Google Pay',
      icon: <div className="flex items-center gap-1">
        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded flex items-center justify-center text-white text-xs font-bold">G</div>
        <span className="text-sm font-medium">Pay</span>
      </div>,
      isDefault: false,
      isEnabled: true,
      description: 'Fast and secure with Google Pay',
      fees: 'No additional fees',
      processingTime: 'Instant'
    }
  ]);

  const [recentTransactions] = useState<Transaction[]>([
    {
      id: 'tx_001',
      type: 'purchase',
      method: 'paypal',
      amount: 50000,
      currency: 'GC',
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000),
      description: 'Gold Coin Package - Silver',
      reference: 'PP_001'
    },
    {
      id: 'tx_002',
      type: 'win',
      method: 'paypal',
      amount: 25,
      currency: 'SC',
      status: 'completed',
      timestamp: new Date(Date.now() - 7200000),
      description: 'Slot game win - CoinKrazy Special'
    },
    {
      id: 'tx_003',
      type: 'deposit',
      method: 'googlepay',
      amount: 100000,
      currency: 'GC',
      status: 'pending',
      timestamp: new Date(Date.now() - 900000),
      description: 'Gold Coin Package - Gold',
      reference: 'GP_001'
    }
  ]);

  const [vipStatus] = useState<VIPStatus>({
    isVIP: false,
    tier: 'bronze',
    benefits: [
      'Priority customer support',
      'Exclusive game access',
      'Higher daily bonuses',
      'VIP tournaments',
      'Personal account manager'
    ],
    monthlyFee: 20
  });

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const quickAmounts = [
    { amount: 9.99, gc: 50000, sc: 25, bonus: '100% SC Bonus' },
    { amount: 19.99, gc: 100000, sc: 50, bonus: '25% SC Bonus' },
    { amount: 49.99, gc: 250000, sc: 125, bonus: '50% SC Bonus' },
    { amount: 99.99, gc: 500000, sc: 300, bonus: '75% SC Bonus' }
  ];

  useEffect(() => {
    loadUserBalance();
  }, []);

  const loadUserBalance = async () => {
    try {
      if (user?.id) {
        const gcBalance = await walletService.getBalance(user.id, 'GC');
        const scBalance = await walletService.getBalance(user.id, 'SC');
        
        setUserBalance(prev => ({
          ...prev,
          GC: gcBalance,
          SC: scBalance
        }));
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const handlePaymentMethodToggle = (method: 'paypal' | 'googlepay') => {
    setSelectedPaymentMethod(method);
    toast({
      title: "Payment Method Updated",
      description: `${method === 'paypal' ? 'PayPal' : 'Google Pay'} selected as default payment method`,
    });
  };

  const processPayment = async (amount: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to make a purchase",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      if (selectedPaymentMethod === 'paypal') {
        // Process PayPal payment
        await simulatePayPalPayment(amount);
      } else {
        // Process Google Pay payment
        await simulateGooglePayPayment(amount);
      }

      toast({
        title: "Payment Successful!",
        description: `Your ${selectedPaymentMethod === 'paypal' ? 'PayPal' : 'Google Pay'} payment has been processed`,
      });

      setShowPaymentDialog(false);
      await loadUserBalance();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const simulatePayPalPayment = async (amount: number) => {
    // Simulate PayPal payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const packageData = quickAmounts.find(pkg => pkg.amount === amount);
    if (packageData && user?.id) {
      await walletService.addBalance(user.id, packageData.gc, 'GC');
      const bonusSC = packageData.sc * (packageData.bonus.includes('100%') ? 2 : 
                                        packageData.bonus.includes('75%') ? 1.75 :
                                        packageData.bonus.includes('50%') ? 1.5 : 1.25);
      await walletService.addBalance(user.id, bonusSC, 'SC');
    }
  };

  const simulateGooglePayPayment = async (amount: number) => {
    // Simulate Google Pay payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const packageData = quickAmounts.find(pkg => pkg.amount === amount);
    if (packageData && user?.id) {
      await walletService.addBalance(user.id, packageData.gc, 'GC');
      const bonusSC = packageData.sc * (packageData.bonus.includes('100%') ? 2 : 
                                        packageData.bonus.includes('75%') ? 1.75 :
                                        packageData.bonus.includes('50%') ? 1.5 : 1.25);
      await walletService.addBalance(user.id, bonusSC, 'SC');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      case 'cancelled': return 'text-gray-500';
      default: return 'text-muted-foreground';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <Plus className="w-4 h-4 text-green-500" />;
      case 'purchase': return <Coins className="w-4 h-4 text-blue-500" />;
      case 'withdrawal': return <Minus className="w-4 h-4 text-orange-500" />;
      case 'win': return <Crown className="w-4 h-4 text-gold-500" />;
      case 'bonus': return <Gift className="w-4 h-4 text-purple-500" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Payment Center
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your payments, view balances, and purchase Gold Coins
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 border-gold-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gold-400">
              <Coins className="w-5 h-5" />
              Gold Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold-400 mb-2">
              {userBalance.GC.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Available for play</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Crown className="w-5 h-5" />
              Sweep Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {userBalance.SC.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Redeemable for cash</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <DollarSign className="w-5 h-5" />
              Cash Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400 mb-2">
              ${userBalance.USD.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Clock className="w-5 h-5" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Deposits:</span>
                <span className="text-blue-400">${userBalance.pendingDeposits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Withdrawals:</span>
                <span className="text-orange-400">${userBalance.pendingWithdrawals}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose your preferred payment method for all transactions
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedPaymentMethod === method.type
                    ? 'ring-2 ring-primary border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handlePaymentMethodToggle(method.type)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {method.icon}
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPaymentMethod === method.type && (
                        <Badge className="bg-primary">Default</Badge>
                      )}
                      <Switch
                        checked={selectedPaymentMethod === method.type}
                        onCheckedChange={() => handlePaymentMethodToggle(method.type)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fees:</span>
                      <div className="font-medium text-green-500">{method.fees}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Processing:</span>
                      <div className="font-medium">{method.processingTime}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="purchase" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchase">Purchase Gold Coins</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="vip">VIP Membership</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Quick Purchase Options
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Buy Gold Coins with {selectedPaymentMethod === 'paypal' ? 'PayPal' : 'Google Pay'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickAmounts.map((pkg) => (
                  <Card key={pkg.amount} className="border-2 border-dashed border-border hover:border-primary transition-colors">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold mb-2">${pkg.amount}</div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span>Gold Coins:</span>
                          <span className="font-bold text-gold-400">{pkg.gc.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sweep Coins:</span>
                          <span className="font-bold text-purple-400">{pkg.sc}</span>
                        </div>
                        <Badge variant="outline" className="w-full">
                          {pkg.bonus}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedAmount(pkg.amount);
                          setShowPaymentDialog(true);
                        }}
                        className="w-full"
                      >
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.timestamp.toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{transaction.method}</span>
                          {transaction.reference && (
                            <>
                              <span>•</span>
                              <span>{transaction.reference}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      <Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vip" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold-500" />
                VIP Membership
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Unlock exclusive benefits and premium features
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gold-500 mb-2">
                    ${vipStatus.monthlyFee}/month
                  </div>
                  <p className="text-muted-foreground">30-day VIP access</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">VIP Benefits Include:</h3>
                    <ul className="space-y-2">
                      {vipStatus.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-gold-500/20 to-purple-500/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Current Status</h4>
                      <Badge variant={vipStatus.isVIP ? 'default' : 'secondary'}>
                        {vipStatus.isVIP ? 'VIP Active' : 'Not VIP'}
                      </Badge>
                      {vipStatus.expiresAt && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Expires: {vipStatus.expiresAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700"
                      disabled={vipStatus.isVIP}
                    >
                      {vipStatus.isVIP ? 'Already VIP' : 'Upgrade to VIP'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Complete your purchase using {selectedPaymentMethod === 'paypal' ? 'PayPal' : 'Google Pay'}
            </DialogDescription>
          </DialogHeader>

          {selectedAmount && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">${selectedAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium capitalize">{selectedPaymentMethod}</span>
                  </div>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your payment is secured with industry-standard encryption and fraud protection.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedAmount && processPayment(selectedAmount)}
              disabled={isProcessingPayment}
              className="bg-primary"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
