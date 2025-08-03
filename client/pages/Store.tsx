import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Coins,
  Crown,
  CreditCard,
  Smartphone,
  DollarSign,
  Shield,
  Star,
  Gift,
  Zap,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Lock,
  X,
  Plus,
  Wallet
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface CoinPackage {
  id: string;
  name: string;
  gc: number;
  sc: number;
  price: number;
  originalPrice?: number;
  popular: boolean;
  bonus: string;
  savings?: number;
  featured?: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'applepay' | 'googlepay' | 'crypto';
  name: string;
  icon: any;
  available: boolean;
  processingTime: string;
}

export default function Store() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [loading, setLoading] = useState(false);
  const [userBalance] = useState({ gc: 125000, sc: 450 });

  const [coinPackages] = useState<CoinPackage[]>([
    {
      id: 'starter',
      name: 'Starter Pack',
      gc: 50000,
      sc: 25,
      price: 9.99,
      originalPrice: 12.99,
      popular: false,
      bonus: '25 Free SC',
      savings: 3
    },
    {
      id: 'popular',
      name: 'Popular Pack',
      gc: 125000,
      sc: 75,
      price: 19.99,
      originalPrice: 29.99,
      popular: true,
      bonus: '75 Free SC + VIP',
      savings: 10,
      featured: true
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      gc: 300000,
      sc: 200,
      price: 49.99,
      originalPrice: 69.99,
      popular: false,
      bonus: '200 Free SC + 7 Days VIP',
      savings: 20
    },
    {
      id: 'vip',
      name: 'VIP Mega Pack',
      gc: 750000,
      sc: 500,
      price: 99.99,
      originalPrice: 139.99,
      popular: false,
      bonus: '500 Free SC + 30 Days VIP',
      savings: 40,
      featured: true
    },
    {
      id: 'ultimate',
      name: 'Ultimate Pack',
      gc: 1500000,
      sc: 1000,
      price: 199.99,
      originalPrice: 299.99,
      popular: false,
      bonus: '1000 Free SC + 3 Months VIP',
      savings: 100,
      featured: true
    }
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      available: true,
      processingTime: 'Instant'
    },
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      icon: Wallet,
      available: true,
      processingTime: 'Instant'
    },
    {
      id: 'applepay',
      type: 'applepay',
      name: 'Apple Pay',
      icon: Smartphone,
      available: true,
      processingTime: 'Instant'
    },
    {
      id: 'googlepay',
      type: 'googlepay',
      name: 'Google Pay',
      icon: Smartphone,
      available: true,
      processingTime: 'Instant'
    }
  ]);

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would integrate with:
      // - Stripe for card payments
      // - PayPal SDK for PayPal payments
      // - Apple Pay API for Apple Pay
      // - Google Pay API for Google Pay
      
      const paymentResult = {
        success: true,
        transactionId: `tx_${Date.now()}`,
        amount: selectedPackage.price,
        currency: 'USD',
        package: selectedPackage
      };

      if (paymentResult.success) {
        // Update user balance (in production, this would be done on the backend)
        alert(`Purchase successful! Added ${selectedPackage.gc.toLocaleString()} GC and ${selectedPackage.sc} SC to your account.`);
        
        // Close modal and redirect
        setShowPaymentModal(false);
        setSelectedPackage(null);
        navigate('/dashboard');
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold/10 via-casino-blue/5 to-gold/10 py-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Gold Coin Store</h1>
                <p className="text-muted-foreground">Purchase Gold Coins and receive bonus Sweeps Coins</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gold-400">{userBalance.gc.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Gold Coins</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-casino-blue">{userBalance.sc}</div>
                <div className="text-sm text-muted-foreground">Sweeps Coins</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Offers */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">🔥 Limited Time Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coinPackages.filter(pkg => pkg.featured).map((pkg) => (
              <Card key={pkg.id} className="relative border-gold-500 bg-gradient-to-br from-gold/10 to-gold/5 hover:shadow-xl transition-all duration-300">
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white animate-pulse">
                  🔥 HOT DEAL
                </Badge>
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-bold">${pkg.price}</span>
                      {pkg.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">${pkg.originalPrice}</span>
                      )}
                    </div>
                    {pkg.savings && (
                      <Badge className="bg-green-500 text-white">
                        Save ${pkg.savings}!
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Coins className="w-6 h-6 text-gold-500" />
                      <span className="text-xl font-bold text-gold-400">
                        {pkg.gc.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">GC</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="w-5 h-5 text-casino-blue" />
                      <span className="text-lg font-bold text-casino-blue">{pkg.sc}</span>
                      <span className="text-muted-foreground">SC</span>
                    </div>
                    <div className="text-sm text-green-400 font-medium">
                      + {pkg.bonus}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowPaymentModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Packages */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Gold Coin Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {coinPackages.map((pkg) => (
              <Card key={pkg.id} className={`relative hover:shadow-lg transition-all duration-300 ${
                pkg.popular ? 'border-gold-500 bg-gradient-to-br from-gold/5 to-gold/10' : ''
              }`}>
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gold-500 text-black">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold">${pkg.price}</span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${pkg.originalPrice}
                        </span>
                      )}
                    </div>
                    {pkg.savings && (
                      <div className="text-xs text-green-500">Save ${pkg.savings}</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1">
                      <Coins className="w-4 h-4 text-gold-500" />
                      <span className="text-lg font-bold text-gold-400">
                        {pkg.gc.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Gold Coins</div>
                    
                    <div className="flex items-center justify-center gap-1">
                      <Crown className="w-4 h-4 text-casino-blue" />
                      <span className="text-lg font-bold text-casino-blue">{pkg.sc}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Sweeps Coins</div>
                    
                    <div className="text-xs text-green-400 font-medium">
                      {pkg.bonus}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowPaymentModal(true);
                    }}
                    className={`w-full ${
                      pkg.popular 
                        ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black' 
                        : ''
                    }`}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security & Trust */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              All transactions are encrypted and processed through secure payment gateways
            </p>
          </Card>
          <Card className="text-center p-6">
            <Zap className="w-12 h-12 text-gold-500 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Instant Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Gold Coins and Sweeps Coins are added to your account immediately
            </p>
          </Card>
          <Card className="text-center p-6">
            <CheckCircle className="w-12 h-12 text-casino-blue mx-auto mb-4" />
            <h3 className="font-bold mb-2">Satisfaction Guaranteed</h3>
            <p className="text-sm text-muted-foreground">
              24/7 customer support and satisfaction guarantee on all purchases
            </p>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Complete Your Purchase</CardTitle>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowPaymentModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="font-bold mb-3">Order Summary</h3>
                <div className="flex items-center justify-between mb-2">
                  <span>{selectedPackage.name}</span>
                  <span className="font-bold">${selectedPackage.price}</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• {selectedPackage.gc.toLocaleString()} Gold Coins</div>
                  <div>• {selectedPackage.sc} Sweeps Coins</div>
                  <div className="text-green-400">• {selectedPackage.bonus}</div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="font-bold mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-3 border rounded-lg flex items-center gap-3 transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-xs text-muted-foreground">{method.processingTime}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Form */}
              {selectedPaymentMethod === 'card' && (
                <div className="space-y-4">
                  <h3 className="font-bold">Card Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number</label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          cardNumber: formatCardNumber(e.target.value) 
                        }))}
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date</label>
                        <Input
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={(e) => setPaymentData(prev => ({ 
                            ...prev, 
                            expiryDate: formatExpiryDate(e.target.value) 
                          }))}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <Input
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData(prev => ({ 
                            ...prev, 
                            cvv: e.target.value.replace(/\D/g, '') 
                          }))}
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                      <Input
                        placeholder="John Doe"
                        value={paymentData.cardholderName}
                        onChange={(e) => setPaymentData(prev => ({ 
                          ...prev, 
                          cardholderName: e.target.value 
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-400">Secure Payment</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>

              {/* Purchase Button */}
              <Button 
                onClick={handlePurchase}
                disabled={loading || !selectedPaymentMethod}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold py-3"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Purchase - ${selectedPackage.price}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By completing this purchase, you agree to our Terms of Service and confirm you are 18+ years old.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
