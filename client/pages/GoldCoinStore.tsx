import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Coins,
  Crown,
  CreditCard,
  Gift,
  Star,
  Trophy,
  DollarSign,
  CheckCircle,
  ShoppingCart,
  Zap,
  Sparkles,
  Heart,
  Target,
  ArrowRight,
  Lock,
  Shield,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { walletService } from '../services/walletService';
import { useToast } from '@/hooks/use-toast';

interface GoldCoinPackage {
  id: string;
  name: string;
  description: string;
  goldCoins: number;
  sweepCoins: number;
  price: number;
  originalPrice?: number;
  isPopular: boolean;
  isBestValue: boolean;
  isNewCustomer: boolean;
  bonusPercentage?: number;
  icon: string;
  features: string[];
  color: string;
}

interface PayPalOrder {
  id: string;
  status: 'created' | 'approved' | 'completed' | 'failed';
  amount: number;
  packageId: string;
}

export default function GoldCoinStore() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [packages, setPackages] = useState<GoldCoinPackage[]>([
    {
      id: 'starter',
      name: 'Starter Pack',
      description: 'Perfect for new players',
      goldCoins: 50000,
      sweepCoins: 25,
      price: 9.99,
      isPopular: false,
      isBestValue: false,
      isNewCustomer: true,
      bonusPercentage: 100,
      icon: '🌟',
      features: ['50,000 Gold Coins', '25 Sweep Coins', '100% Bonus SC', 'New Customer Special'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'bronze',
      name: 'Bronze Package',
      description: 'Great value for casual players',
      goldCoins: 100000,
      sweepCoins: 50,
      price: 19.99,
      originalPrice: 24.99,
      isPopular: false,
      isBestValue: false,
      isNewCustomer: false,
      bonusPercentage: 25,
      icon: '🥉',
      features: ['100,000 Gold Coins', '50 Sweep Coins', '25% Bonus SC', 'Daily Bonus Access'],
      color: 'from-amber-600 to-orange-600'
    },
    {
      id: 'silver',
      name: 'Silver Package',
      description: 'Most popular choice',
      goldCoins: 250000,
      sweepCoins: 125,
      price: 49.99,
      originalPrice: 59.99,
      isPopular: true,
      isBestValue: false,
      isNewCustomer: false,
      bonusPercentage: 50,
      icon: '🥈',
      features: ['250,000 Gold Coins', '125 Sweep Coins', '50% Bonus SC', 'VIP Support', 'Exclusive Games'],
      color: 'from-gray-500 to-slate-600'
    },
    {
      id: 'gold',
      name: 'Gold Package',
      description: 'Best value for serious players',
      goldCoins: 500000,
      sweepCoins: 300,
      price: 99.99,
      originalPrice: 129.99,
      isPopular: false,
      isBestValue: true,
      isNewCustomer: false,
      bonusPercentage: 75,
      icon: '🥇',
      features: ['500,000 Gold Coins', '300 Sweep Coins', '75% Bonus SC', 'VIP Treatment', 'Priority Support', 'Exclusive Tournaments'],
      color: 'from-yellow-500 to-gold-600'
    },
    {
      id: 'platinum',
      name: 'Platinum Elite',
      description: 'Ultimate gaming experience',
      goldCoins: 1000000,
      sweepCoins: 750,
      price: 199.99,
      originalPrice: 249.99,
      isPopular: false,
      isBestValue: false,
      isNewCustomer: false,
      bonusPercentage: 100,
      icon: '💎',
      features: ['1,000,000 Gold Coins', '750 Sweep Coins', '100% Bonus SC', 'Platinum VIP Status', 'Personal Account Manager', 'Exclusive Events', 'Monthly Bonuses'],
      color: 'from-blue-500 to-purple-600'
    }
  ]);

  const [selectedPackage, setSelectedPackage] = useState<GoldCoinPackage | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');

  // Mock PayPal SDK integration
  const initializePayPal = () => {
    // In a real implementation, you would load the PayPal SDK
    console.log('PayPal SDK initialized');
  };

  useEffect(() => {
    initializePayPal();
  }, []);

  const handlePurchaseClick = (pkg: GoldCoinPackage) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase Gold Coins",
        variant: "destructive",
      });
      return;
    }
    setSelectedPackage(pkg);
    setShowPaymentDialog(true);
  };

  const processPayPalPayment = async (pkg: GoldCoinPackage) => {
    setIsProcessingPayment(true);
    
    try {
      // Simulate PayPal payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Add coins to user's account
      await walletService.addBalance(user?.id || 'guest', pkg.goldCoins, 'GC');
      
      // Calculate bonus sweep coins
      const bonusSC = Math.floor(pkg.sweepCoins * (pkg.bonusPercentage || 0) / 100);
      const totalSC = pkg.sweepCoins + bonusSC;
      
      await walletService.addBalance(user?.id || 'guest', totalSC, 'SC');

      // Record transaction
      const transaction = {
        id: `paypal_${Date.now()}`,
        packageId: pkg.id,
        amount: pkg.price,
        goldCoins: pkg.goldCoins,
        sweepCoins: totalSC,
        timestamp: new Date(),
        status: 'completed' as const,
        paymentMethod: 'PayPal'
      };

      // Store transaction (in real app, this would go to your backend)
      localStorage.setItem(`transaction_${transaction.id}`, JSON.stringify(transaction));

      toast({
        title: "Purchase Successful!",
        description: `You received ${pkg.goldCoins.toLocaleString()} GC and ${totalSC} SC`,
        duration: 5000,
      });

      setShowPaymentDialog(false);
      setSelectedPackage(null);

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

  const processCreditCardPayment = async (pkg: GoldCoinPackage) => {
    setIsProcessingPayment(true);
    
    try {
      // Simulate credit card processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Same logic as PayPal for adding coins
      await walletService.addBalance(user?.id || 'guest', pkg.goldCoins, 'GC');
      
      const bonusSC = Math.floor(pkg.sweepCoins * (pkg.bonusPercentage || 0) / 100);
      const totalSC = pkg.sweepCoins + bonusSC;
      
      await walletService.addBalance(user?.id || 'guest', totalSC, 'SC');

      toast({
        title: "Purchase Successful!",
        description: `You received ${pkg.goldCoins.toLocaleString()} GC and ${totalSC} SC`,
        duration: 5000,
      });

      setShowPaymentDialog(false);
      setSelectedPackage(null);

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

  const handlePayment = async () => {
    if (!selectedPackage) return;
    
    if (paymentMethod === 'paypal') {
      await processPayPalPayment(selectedPackage);
    } else {
      await processCreditCardPayment(selectedPackage);
    }
  };

  const getSavingsPercent = (price: number, originalPrice?: number) => {
    if (!originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
          Gold Coin Store
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Purchase Gold Coins to play your favorite games and receive complimentary Sweep Coins for redemption opportunities
        </p>
        
        {/* Security Badges */}
        <div className="flex justify-center items-center gap-6 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            SSL Secured
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-blue-500" />
            PayPal Protected
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-purple-500" />
            Instant Delivery
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <Alert className="border-amber-500/30 bg-amber-500/10">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>No Purchase Necessary:</strong> You can play for free using daily bonuses, promotions, and the lucky wheel. 
          Gold Coin purchases provide additional convenience and Sweep Coins are promotional items given with purchases.
        </AlertDescription>
      </Alert>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              pkg.isPopular ? 'border-purple-500 shadow-lg shadow-purple-500/20' :
              pkg.isBestValue ? 'border-gold-500 shadow-lg shadow-gold-500/20' :
              pkg.isNewCustomer ? 'border-green-500 shadow-lg shadow-green-500/20' :
              'border-border hover:border-primary/50'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${pkg.color} opacity-5`} />
            
            {/* Badge */}
            {(pkg.isPopular || pkg.isBestValue || pkg.isNewCustomer) && (
              <div className="absolute top-0 right-0 z-10">
                <Badge className={`rounded-none rounded-bl-lg ${
                  pkg.isPopular ? 'bg-purple-500' :
                  pkg.isBestValue ? 'bg-gold-500 text-black' :
                  'bg-green-500'
                }`}>
                  {pkg.isPopular ? 'POPULAR' : pkg.isBestValue ? 'BEST VALUE' : 'NEW CUSTOMER'}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="text-4xl mb-2">{pkg.icon}</div>
              <CardTitle className="text-xl">{pkg.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                  {pkg.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${pkg.originalPrice}
                    </span>
                  )}
                </div>
                {pkg.originalPrice && (
                  <Badge variant="outline" className="mt-1 text-green-600 border-green-600">
                    Save {getSavingsPercent(pkg.price, pkg.originalPrice)}%
                  </Badge>
                )}
              </div>

              {/* Coins */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gold Coins:</span>
                  <span className="font-bold text-gold-400">
                    {pkg.goldCoins.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sweep Coins:</span>
                  <span className="font-bold text-purple-400">{pkg.sweepCoins}</span>
                </div>
                {pkg.bonusPercentage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bonus SC:</span>
                    <span className="font-bold text-green-400">
                      +{Math.floor(pkg.sweepCoins * pkg.bonusPercentage / 100)} ({pkg.bonusPercentage}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-1">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Purchase Button */}
              <Button
                onClick={() => handlePurchaseClick(pkg)}
                className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white font-semibold`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Complete Purchase
            </DialogTitle>
            <DialogDescription>
              {selectedPackage && (
                <>Complete your purchase of {selectedPackage.name} for ${selectedPackage.price}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{selectedPackage.goldCoins.toLocaleString()} Gold Coins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{selectedPackage.sweepCoins} Sweep Coins</span>
                  </div>
                  {selectedPackage.bonusPercentage && (
                    <div className="flex justify-between text-green-600">
                      <span>Bonus Sweep Coins ({selectedPackage.bonusPercentage}%)</span>
                      <span>+{Math.floor(selectedPackage.sweepCoins * selectedPackage.bonusPercentage / 100)}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${selectedPackage.price}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <h3 className="font-semibold">Payment Method</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('paypal')}
                    className="h-12"
                  >
                    <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" className="h-6" />
                  </Button>
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                    className="h-12"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Card
                  </Button>
                </div>
              </div>

              {/* Security Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your payment is secured with 256-bit SSL encryption. We never store your payment information.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessingPayment || !selectedPackage}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Purchase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">What are Gold Coins and Sweep Coins?</h3>
            <p className="text-sm text-muted-foreground">
              Gold Coins are virtual currency used for playing games. Sweep Coins are promotional currency that can be redeemed for cash prizes.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How do I redeem Sweep Coins?</h3>
            <p className="text-sm text-muted-foreground">
              You can redeem Sweep Coins for cash through your account dashboard once you meet the minimum redemption requirements.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Are purchases secure?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, all transactions are secured with SSL encryption and processed through trusted payment providers like PayPal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
