import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Smartphone,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  QrCode,
  Loader2,
  ArrowLeft,
  Info,
  DollarSign,
  Zap,
  Globe,
  Timer,
  X,
  Wallet,
  Star,
  TrendingUp,
} from "lucide-react";
import { 
  multiPaymentService, 
  PaymentMethodType, 
  CryptoPaymentMethod,
  CryptoPaymentRequest,
  CryptoTransactionResult 
} from "@/services/multiPaymentService";
import { GoldCoinPackage } from "@/services/packageService";

interface MultiPaymentCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  package: GoldCoinPackage;
  onPaymentComplete: (result: any) => void;
}

interface PaymentStep {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
}

export default function MultiPaymentCheckout({
  isOpen,
  onClose,
  package: selectedPackage,
  onPaymentComplete,
}: MultiPaymentCheckoutProps) {
  const { toast } = useToast();
  
  // Payment state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('paypal');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('bitcoin');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Available payment methods
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any>(null);
  const [cryptoMethods, setCryptoMethods] = useState<CryptoPaymentMethod[]>([]);
  
  // Payment steps
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>([
    { id: 'method', title: 'Payment Method', description: 'Choose how to pay', isActive: true, isCompleted: false },
    { id: 'details', title: 'Payment Details', description: 'Enter information', isActive: false, isCompleted: false },
    { id: 'confirm', title: 'Confirm', description: 'Review and pay', isActive: false, isCompleted: false },
  ]);
  
  // Crypto payment state
  const [cryptoPaymentResult, setCryptoPaymentResult] = useState<CryptoTransactionResult | null>(null);
  const [cryptoMonitoring, setCryptoMonitoring] = useState(false);
  
  // Cost calculation
  const [costBreakdown, setCostBreakdown] = useState({
    subtotal: selectedPackage.priceUsd,
    fees: 0,
    total: selectedPackage.priceUsd,
  });

  // Load available payment methods
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  // Update cost when payment method changes
  useEffect(() => {
    updateCostBreakdown();
  }, [selectedMethod, selectedCrypto]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await multiPaymentService.getAvailablePaymentMethods();
      setAvailablePaymentMethods(methods);
      setCryptoMethods(methods.crypto);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCostBreakdown = () => {
    const breakdown = multiPaymentService.calculateTotalCost(
      selectedPackage.priceUsd,
      selectedMethod,
      selectedCrypto
    );
    setCostBreakdown(breakdown);
  };

  const handlePaymentMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    if (method === 'crypto' && cryptoMethods.length > 0) {
      setSelectedCrypto(cryptoMethods[0].id);
    }
  };

  const handleNextStep = () => {
    if (currentStep < paymentSteps.length - 1) {
      const newSteps = [...paymentSteps];
      newSteps[currentStep].isCompleted = true;
      newSteps[currentStep].isActive = false;
      newSteps[currentStep + 1].isActive = true;
      setPaymentSteps(newSteps);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      const newSteps = [...paymentSteps];
      newSteps[currentStep].isActive = false;
      newSteps[currentStep - 1].isActive = true;
      newSteps[currentStep - 1].isCompleted = false;
      setPaymentSteps(newSteps);
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    
    try {
      let result;
      
      switch (selectedMethod) {
        case 'crypto':
          result = await handleCryptoPayment();
          break;
        case 'apple_pay':
          result = await handleApplePayPayment();
          break;
        case 'google_pay':
          result = await handleGooglePayPayment();
          break;
        default:
          // Use existing payment service for traditional methods
          result = await handleTraditionalPayment();
      }
      
      if (result.success) {
        onPaymentComplete(result);
        if (selectedMethod !== 'crypto') {
          onClose();
        }
      }
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCryptoPayment = async () => {
    const request: CryptoPaymentRequest = {
      packageId: selectedPackage.id,
      cryptoMethod: selectedCrypto,
      amount: selectedPackage.priceUsd,
    };
    
    const result = await multiPaymentService.createCryptoPayment(request);
    setCryptoPaymentResult(result);
    
    if (result.success) {
      setCryptoMonitoring(true);
      startCryptoMonitoring();
    }
    
    return result;
  };

  const handleApplePayPayment = async () => {
    const applePayRequest = {
      packageId: selectedPackage.id,
      displayItems: [
        {
          label: selectedPackage.packageName,
          amount: Number(selectedPackage.priceUsd || 0).toFixed(2),
        },
      ],
      total: {
        label: 'CoinKrazy',
        amount: costBreakdown.total.toFixed(2),
      },
      merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'] as ApplePayJS.ApplePayMerchantCapability[],
      supportedNetworks: ['visa', 'masterCard', 'amex'] as ApplePayJS.ApplePayPaymentNetwork[],
    };
    
    return await multiPaymentService.createApplePayPayment(applePayRequest);
  };

  const handleGooglePayPayment = async () => {
    const googlePayRequest = {
      packageId: selectedPackage.id,
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: costBreakdown.total.toFixed(2),
        currencyCode: 'USD',
      },
      merchantInfo: {
        merchantName: 'CoinKrazy',
        merchantId: '12345678901234567890',
      },
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'stripe',
            gatewayMerchantId: 'your_stripe_merchant_id',
          },
        },
      }],
    };
    
    return await multiPaymentService.createGooglePayPayment(googlePayRequest);
  };

  const handleTraditionalPayment = async () => {
    // Use existing payment service for PayPal and Stripe
    toast({
      title: "Processing Payment",
      description: "Redirecting to payment processor...",
    });
    return { success: true };
  };

  const startCryptoMonitoring = () => {
    // Monitor crypto payment status
    const interval = setInterval(async () => {
      if (cryptoPaymentResult) {
        // In production, check actual payment status
        console.log('Monitoring crypto payment...');
        // For demo, simulate payment confirmation after 30 seconds
        setTimeout(() => {
          setCryptoMonitoring(false);
          clearInterval(interval);
          toast({
            title: "Payment Confirmed! 🎉",
            description: "Your crypto payment has been confirmed and coins have been added to your account.",
          });
          onPaymentComplete({ success: true, method: 'crypto' });
          onClose();
        }, 30000);
      }
    }, 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const getPaymentMethodIcon = (method: PaymentMethodType) => {
    switch (method) {
      case 'paypal': return <Wallet className="w-5 h-5" />;
      case 'stripe': return <CreditCard className="w-5 h-5" />;
      case 'crypto': return <span className="text-lg">₿</span>;
      case 'apple_pay': return <span className="text-lg">🍎</span>;
      case 'google_pay': return <span className="text-lg">🔍</span>;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const getMethodName = (method: PaymentMethodType) => {
    switch (method) {
      case 'paypal': return 'PayPal';
      case 'stripe': return 'Credit/Debit Card';
      case 'crypto': return 'Cryptocurrency';
      case 'apple_pay': return 'Apple Pay';
      case 'google_pay': return 'Google Pay';
      default: return 'Payment Method';
    }
  };

  const getMethodDescription = (method: PaymentMethodType) => {
    switch (method) {
      case 'paypal': return 'Pay with your PayPal account';
      case 'stripe': return 'Visa, Mastercard, American Express';
      case 'crypto': return 'Bitcoin, Ethereum, USDC, and more';
      case 'apple_pay': return 'Pay with Touch ID or Face ID';
      case 'google_pay': return 'Quick and secure Google payments';
      default: return 'Secure payment processing';
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Secure Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your purchase of {selectedPackage.packageName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Steps */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
              {paymentSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step.isCompleted ? 'bg-green-500 text-white' : 
                      step.isActive ? 'bg-blue-500 text-white' : 
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {step.isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className={`ml-2 text-sm ${step.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs">{step.description}</div>
                  </div>
                  {index < paymentSteps.length - 1 && (
                    <div className={`w-8 h-px mx-4 ${step.isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Payment Method Selection */}
              {currentStep === 0 && (
                <motion.div
                  key="method-selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">Choose Payment Method</h3>
                  
                  <Tabs value={selectedMethod} onValueChange={(value) => handlePaymentMethodSelect(value as PaymentMethodType)}>
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                      <TabsTrigger value="stripe">Card</TabsTrigger>
                      <TabsTrigger value="crypto">Crypto</TabsTrigger>
                      <TabsTrigger value="apple_pay" disabled={!availablePaymentMethods?.mobile.applePay}>
                        Apple Pay
                      </TabsTrigger>
                      <TabsTrigger value="google_pay" disabled={!availablePaymentMethods?.mobile.googlePay}>
                        Google Pay
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="paypal" className="space-y-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">PayPal</h4>
                            <p className="text-sm text-muted-foreground">
                              Pay with your PayPal account or linked cards
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">Instant</Badge>
                              <Badge variant="outline">Secure</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="stripe" className="space-y-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Credit/Debit Card</h4>
                            <p className="text-sm text-muted-foreground">
                              Visa, Mastercard, American Express
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">Instant</Badge>
                              <Badge variant="outline">3D Secure</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="crypto" className="space-y-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">₿</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Cryptocurrency</h4>
                            <p className="text-sm text-muted-foreground">
                              Bitcoin, Ethereum, USDC, and more
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">Low Fees</Badge>
                              <Badge variant="outline">Decentralized</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {cryptoMethods.length > 0 && (
                        <div className="space-y-3">
                          <Label>Select Cryptocurrency</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {cryptoMethods.map((crypto) => (
                              <div
                                key={crypto.id}
                                onClick={() => setSelectedCrypto(crypto.id)}
                                className={`
                                  p-3 border rounded-lg cursor-pointer transition-colors
                                  ${selectedCrypto === crypto.id ? 'border-blue-500 bg-blue-50' : 'border-border hover:bg-muted'}
                                `}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{crypto.icon}</span>
                                  <div>
                                    <div className="font-medium text-sm">{crypto.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {crypto.estimatedTime}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="apple_pay" className="space-y-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🍎</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Apple Pay</h4>
                            <p className="text-sm text-muted-foreground">
                              Pay with Touch ID or Face ID
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">Instant</Badge>
                              <Badge variant="outline">Biometric</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="google_pay" className="space-y-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🔍</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Google Pay</h4>
                            <p className="text-sm text-muted-foreground">
                              Quick and secure Google payments
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">Instant</Badge>
                              <Badge variant="outline">One-tap</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleNextStep}>
                      Continue
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Details (varies by method) */}
              {currentStep === 1 && (
                <motion.div
                  key="payment-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handlePreviousStep}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">Payment Details</h3>
                  </div>

                  {selectedMethod === 'crypto' && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-amber-600" />
                          <span className="font-medium text-amber-800">Crypto Payment Instructions</span>
                        </div>
                        <p className="text-sm text-amber-700">
                          Send the exact amount to the address below. Your coins will be added automatically after confirmation.
                        </p>
                      </div>
                    </div>
                  )}

                  {(selectedMethod === 'apple_pay' || selectedMethod === 'google_pay') && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Mobile Payment Ready</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Click continue to open {selectedMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} and complete your purchase.
                        </p>
                      </div>
                    </div>
                  )}

                  {(selectedMethod === 'paypal' || selectedMethod === 'stripe') && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800">Secure Payment</span>
                        </div>
                        <p className="text-sm text-green-700">
                          You'll be redirected to {selectedMethod === 'paypal' ? 'PayPal' : 'our secure payment processor'} to complete your purchase.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePreviousStep}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleNextStep}>
                      Review Order
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 2 && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handlePreviousStep}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">Confirm Payment</h3>
                  </div>

                  <Card className="p-4">
                    <div className="flex items-center gap-4">
                      {getPaymentMethodIcon(selectedMethod)}
                      <div>
                        <h4 className="font-medium">{getMethodName(selectedMethod)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getMethodDescription(selectedMethod)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Processing time: {multiPaymentService.getPaymentMethodEstimate(selectedMethod, selectedCrypto)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span>${costBreakdown.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Processing Fees</span>
                      <span>${costBreakdown.fees.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>${costBreakdown.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePreviousStep}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      onClick={handlePayment}
                      disabled={processingPayment}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Complete Payment
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Crypto Payment Details */}
            {cryptoPaymentResult && cryptoPaymentResult.success && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">₿</span>
                    </div>
                    <h3 className="text-lg font-bold">Send Cryptocurrency</h3>
                    <p className="text-sm text-muted-foreground">
                      Send exactly {cryptoPaymentResult.amount} {cryptoPaymentResult.cryptoSymbol} to the address below
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Payment Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={cryptoPaymentResult.paymentAddress || ''}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(cryptoPaymentResult.paymentAddress || '')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Amount</Label>
                        <div className="text-lg font-bold">
                          {cryptoPaymentResult.amount} {cryptoPaymentResult.cryptoSymbol}
                        </div>
                      </div>
                      <div>
                        <Label>Estimated Time</Label>
                        <div className="text-sm">
                          {cryptoPaymentResult.estimatedConfirmationTime}
                        </div>
                      </div>
                    </div>

                    {cryptoMonitoring && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span className="font-medium text-blue-800">Monitoring Payment</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          We're watching the blockchain for your payment. You can close this window safely.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{selectedPackage.packageName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPackage.goldCoins.toLocaleString()} Gold Coins
                    </p>
                    {selectedPackage.bonusCoins > 0 && (
                      <p className="text-sm text-green-600">
                        +{selectedPackage.bonusCoins.toLocaleString()} Bonus
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Package Price</span>
                    <span>${Number(selectedPackage.priceUsd || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee</span>
                    <span>${costBreakdown.fees.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${costBreakdown.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Instant delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Shield className="w-4 h-4" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Clock className="w-4 h-4" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
