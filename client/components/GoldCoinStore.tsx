import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Coins,
  Crown,
  Star,
  Gift,
  CreditCard,
  Smartphone,
  Banknote,
  TrendingUp,
  Zap,
  Shield,
  CheckCircle,
} from "lucide-react";
import { realNeonService } from "../services/realNeonService";
import { authService } from "../services/authService";

interface GoldCoinPackage {
  id: string;
  name: string;
  goldCoins: number;
  bonusGC: number;
  sweepsCoins: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  vipOnly?: boolean;
  description: string;
  features: string[];
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  type: "card" | "digital" | "crypto";
  processingTime: string;
  fees: string;
  minAmount: number;
  maxAmount: number;
  available: boolean;
}

const GOLD_COIN_PACKAGES: GoldCoinPackage[] = [
  {
    id: "starter",
    name: "Starter Pack",
    goldCoins: 5000,
    bonusGC: 500,
    sweepsCoins: 5,
    price: 4.99,
    description: "Perfect for new players",
    features: [
      "5,000 Gold Coins",
      "500 Bonus GC",
      "5 Sweeps Coins",
      "Instant delivery",
    ],
  },
  {
    id: "popular",
    name: "Popular Choice",
    goldCoins: 15000,
    bonusGC: 2000,
    sweepsCoins: 15,
    price: 14.99,
    originalPrice: 19.99,
    discount: 25,
    popular: true,
    description: "Most popular package",
    features: [
      "15,000 Gold Coins",
      "2,000 Bonus GC",
      "15 Sweeps Coins",
      "25% Extra Value",
      "Priority support",
    ],
  },
  {
    id: "value",
    name: "Best Value",
    goldCoins: 35000,
    bonusGC: 7000,
    sweepsCoins: 35,
    price: 29.99,
    originalPrice: 39.99,
    discount: 25,
    description: "Maximum value for money",
    features: [
      "35,000 Gold Coins",
      "7,000 Bonus GC",
      "35 Sweeps Coins",
      "25% Extra Value",
      "VIP Support",
      "Exclusive bonuses",
    ],
  },
  {
    id: "premium",
    name: "Premium Pack",
    goldCoins: 75000,
    bonusGC: 20000,
    sweepsCoins: 75,
    price: 59.99,
    originalPrice: 79.99,
    discount: 25,
    description: "For serious players",
    features: [
      "75,000 Gold Coins",
      "20,000 Bonus GC",
      "75 Sweeps Coins",
      "25% Extra Value",
      "VIP Support",
      "Monthly bonus",
      "Exclusive games access",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate Pack",
    goldCoins: 150000,
    bonusGC: 50000,
    sweepsCoins: 150,
    price: 99.99,
    originalPrice: 149.99,
    discount: 33,
    vipOnly: true,
    description: "Ultimate gaming experience",
    features: [
      "150,000 Gold Coins",
      "50,000 Bonus GC",
      "150 Sweeps Coins",
      "33% Extra Value",
      "Dedicated VIP Manager",
      "Weekly bonuses",
      "All exclusive games",
      "Priority withdrawals",
    ],
  },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    type: "card",
    processingTime: "Instant",
    fees: "No fees",
    minAmount: 4.99,
    maxAmount: 500,
    available: true,
  },
  {
    id: "apple_pay",
    name: "Apple Pay",
    icon: Smartphone,
    type: "digital",
    processingTime: "Instant",
    fees: "No fees",
    minAmount: 4.99,
    maxAmount: 500,
    available: true,
  },
  {
    id: "google_pay",
    name: "Google Pay",
    icon: Smartphone,
    type: "digital",
    processingTime: "Instant",
    fees: "No fees",
    minAmount: 4.99,
    maxAmount: 500,
    available: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: Banknote,
    type: "digital",
    processingTime: "Instant",
    fees: "No fees",
    minAmount: 4.99,
    maxAmount: 1000,
    available: true,
  },
];

const GoldCoinStore = () => {
  const [selectedPackage, setSelectedPackage] =
    useState<GoldCoinPackage | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null,
  );
  const [customAmount, setCustomAmount] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userVIP, setUserVIP] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
    loadPurchaseHistory();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const user = authService.getUserByToken(token);
      if (!user) return;

      setCurrentUser(user);

      // Get VIP data
      if (realNeonService.isConnected()) {
        const vipData = await realNeonService.getVIPProgram(user.id);
        setUserVIP(vipData);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const loadPurchaseHistory = async () => {
    try {
      if (!currentUser || !realNeonService.isConnected()) return;

      const transactions = await realNeonService.getUserTransactions(
        currentUser.id,
        20,
      );
      const purchases = transactions.filter(
        (tx) => tx.type === "deposit" || tx.type === "purchase",
      );
      setPurchaseHistory(purchases);
    } catch (error) {
      console.error("Failed to load purchase history:", error);
    }
  };

  const calculateVIPDiscount = (basePrice: number): number => {
    if (!userVIP) return basePrice;

    // VIP members get additional discounts
    const vipDiscountRate = Math.min(userVIP.level * 0.02, 0.15); // Max 15% VIP discount
    return basePrice * (1 - vipDiscountRate);
  };

  const calculateCustomPackage = (amount: number) => {
    const baseRate = 1000; // 1000 GC per $1
    const goldCoins = Math.floor(amount * baseRate);

    // Bonus calculations based on amount
    let bonusGC = 0;
    let sweepsCoins = 0;

    if (amount >= 50) {
      bonusGC = Math.floor(goldCoins * 0.25); // 25% bonus for $50+
      sweepsCoins = Math.floor(amount * 2);
    } else if (amount >= 20) {
      bonusGC = Math.floor(goldCoins * 0.15); // 15% bonus for $20+
      sweepsCoins = Math.floor(amount * 1.5);
    } else if (amount >= 10) {
      bonusGC = Math.floor(goldCoins * 0.1); // 10% bonus for $10+
      sweepsCoins = Math.floor(amount);
    }

    return { goldCoins, bonusGC, sweepsCoins };
  };

  const processPurchase = async () => {
    if (!selectedPackage || !selectedPayment || !currentUser) return;

    try {
      setProcessing(true);

      const finalPrice = calculateVIPDiscount(selectedPackage.price);
      const totalGC = selectedPackage.goldCoins + selectedPackage.bonusGC;

      // Create purchase transaction in Neon
      const transaction = await realNeonService.createTransaction({
        user_id: currentUser.id,
        type: "purchase",
        amount: finalPrice,
        currency: "USD",
        balance_before: currentUser.gcBalance,
        balance_after: currentUser.gcBalance + totalGC,
        description: `Gold Coin Package: ${selectedPackage.name}`,
        payment_method: selectedPayment.name,
        status: "completed",
        metadata: {
          packageId: selectedPackage.id,
          goldCoins: selectedPackage.goldCoins,
          bonusGC: selectedPackage.bonusGC,
          sweepsCoins: selectedPackage.sweepsCoins,
          vipDiscount: userVIP ? selectedPackage.price - finalPrice : 0,
          paymentMethod: selectedPayment.id,
        },
      });

      // Update user balances
      await realNeonService.updateUser(currentUser.id, {
        gcBalance: currentUser.gcBalance + totalGC,
        scBalance: currentUser.scBalance + selectedPackage.sweepsCoins,
        totalDeposited: (currentUser.totalDeposited || 0) + finalPrice,
      });

      // Log admin action
      await realNeonService.logAdminAction({
        admin_user_id: currentUser.id,
        action: "gold_coin_purchase",
        target_type: "user",
        target_id: currentUser.id,
        details: {
          packageName: selectedPackage.name,
          amount: finalPrice,
          goldCoins: selectedPackage.goldCoins,
          bonusGC: selectedPackage.bonusGC,
          sweepsCoins: selectedPackage.sweepsCoins,
          paymentMethod: selectedPayment.name,
          transactionId: transaction.id,
        },
        severity: "info",
      });

      // Add VIP points for purchase
      if (userVIP) {
        const pointsToAdd = Math.floor(finalPrice * 10); // 10 points per dollar
        await realNeonService.updateVIPProgram(currentUser.id, {
          points_current: userVIP.points_current + pointsToAdd,
        });
      }

      // Clear selections and refresh data
      setSelectedPackage(null);
      setSelectedPayment(null);
      await loadUserData();
      await loadPurchaseHistory();

      // Trigger auth change event to update balances
      window.dispatchEvent(new Event("auth-change"));

      alert(
        `Purchase successful! You received ${totalGC.toLocaleString()} Gold Coins and ${selectedPackage.sweepsCoins} Sweeps Coins!`,
      );
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const processCustomPurchase = async () => {
    if (!selectedPayment || !currentUser || !customAmount) return;

    const amount = parseFloat(customAmount);
    if (amount < 5 || amount > 500) {
      alert("Custom amount must be between $5 and $500");
      return;
    }

    try {
      setProcessing(true);

      const { goldCoins, bonusGC, sweepsCoins } =
        calculateCustomPackage(amount);
      const finalPrice = calculateVIPDiscount(amount);
      const totalGC = goldCoins + bonusGC;

      // Create custom purchase transaction
      const transaction = await realNeonService.createTransaction({
        user_id: currentUser.id,
        type: "purchase",
        amount: finalPrice,
        currency: "USD",
        balance_before: currentUser.gcBalance,
        balance_after: currentUser.gcBalance + totalGC,
        description: `Custom Gold Coin Purchase - $${amount}`,
        payment_method: selectedPayment.name,
        status: "completed",
        metadata: {
          customAmount: amount,
          goldCoins,
          bonusGC,
          sweepsCoins,
          vipDiscount: userVIP ? amount - finalPrice : 0,
          paymentMethod: selectedPayment.id,
        },
      });

      // Update user balances
      await realNeonService.updateUser(currentUser.id, {
        gcBalance: currentUser.gcBalance + totalGC,
        scBalance: currentUser.scBalance + sweepsCoins,
        totalDeposited: (currentUser.totalDeposited || 0) + finalPrice,
      });

      // Clear form and refresh
      setCustomAmount("");
      setSelectedPayment(null);
      await loadUserData();
      await loadPurchaseHistory();

      window.dispatchEvent(new Event("auth-change"));

      alert(
        `Custom purchase successful! You received ${totalGC.toLocaleString()} Gold Coins and ${sweepsCoins} Sweeps Coins!`,
      );
    } catch (error) {
      console.error("Custom purchase failed:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-500" />
            Gold Coin Store
          </CardTitle>
          <CardDescription>
            Purchase Gold Coins and Sweeps Coins to enhance your gaming
            experience
          </CardDescription>
        </CardHeader>
      </Card>

      {userVIP && userVIP.level > 1 && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-purple-500" />
              <span className="font-medium">VIP Member Discount</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You get an additional {userVIP.level * 2}% discount on all
              purchases as a Level {userVIP.level} VIP member!
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="custom">Custom Amount</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOLD_COIN_PACKAGES.map((pkg) => {
              const vipDiscountedPrice = calculateVIPDiscount(pkg.price);
              const isVIPDiscounted = vipDiscountedPrice < pkg.price;

              return (
                <Card
                  key={pkg.id}
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    selectedPackage?.id === pkg.id
                      ? "ring-2 ring-purple-500"
                      : ""
                  } ${pkg.popular ? "ring-2 ring-yellow-500" : ""}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500">
                      Most Popular
                    </Badge>
                  )}
                  {pkg.vipOnly && (
                    <Badge className="absolute -top-2 right-4 bg-purple-500">
                      VIP Only
                    </Badge>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      {pkg.name}
                    </CardTitle>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">
                        $
                        {isVIPDiscounted
                          ? vipDiscountedPrice.toFixed(2)
                          : pkg.price.toFixed(2)}
                        {pkg.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through ml-2">
                            ${pkg.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {(pkg.discount || isVIPDiscounted) && (
                        <Badge variant="destructive">
                          {pkg.discount
                            ? `${pkg.discount}% OFF`
                            : "VIP Discount"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {(pkg.goldCoins + pkg.bonusGC).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Gold Coins
                      </div>
                      <div className="text-lg font-medium text-purple-600 mt-2">
                        + {pkg.sweepsCoins} Sweeps Coins
                      </div>
                    </div>

                    <div className="space-y-1">
                      {pkg.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedPackage && (
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
                <CardDescription>
                  Choose how you'd like to pay for {selectedPackage.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PAYMENT_METHODS.filter((method) => method.available).map(
                    (method) => {
                      const MethodIcon = method.icon;
                      return (
                        <Card
                          key={method.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedPayment?.id === method.id
                              ? "ring-2 ring-purple-500"
                              : ""
                          }`}
                          onClick={() => setSelectedPayment(method)}
                        >
                          <CardContent className="flex items-center gap-3 p-4">
                            <MethodIcon className="h-6 w-6" />
                            <div className="flex-1">
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {method.processingTime} • {method.fees}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    },
                  )}
                </div>

                {selectedPayment && (
                  <Button
                    onClick={processPurchase}
                    disabled={processing}
                    className="w-full"
                    size="lg"
                  >
                    {processing
                      ? "Processing..."
                      : `Complete Purchase - $${calculateVIPDiscount(selectedPackage.price).toFixed(2)}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Amount Purchase</CardTitle>
              <CardDescription>
                Enter any amount between $5 and $500 to get Gold Coins and bonus
                rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Enter Amount ($5 - $500)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="5"
                  max="500"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount..."
                />
              </div>

              {customAmount && parseFloat(customAmount) >= 5 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Gold Coins:</span>
                        <span className="font-medium">
                          {calculateCustomPackage(
                            parseFloat(customAmount),
                          ).goldCoins.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus Gold Coins:</span>
                        <span className="font-medium text-green-600">
                          +
                          {calculateCustomPackage(
                            parseFloat(customAmount),
                          ).bonusGC.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sweeps Coins:</span>
                        <span className="font-medium text-purple-600">
                          {
                            calculateCustomPackage(parseFloat(customAmount))
                              .sweepsCoins
                          }
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total Value:</span>
                          <span>
                            {(
                              calculateCustomPackage(parseFloat(customAmount))
                                .goldCoins +
                              calculateCustomPackage(parseFloat(customAmount))
                                .bonusGC
                            ).toLocaleString()}{" "}
                            GC
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {customAmount && parseFloat(customAmount) >= 5 && (
                <div>
                  <h4 className="font-medium mb-3">Select Payment Method</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PAYMENT_METHODS.filter((method) => method.available).map(
                      (method) => {
                        const MethodIcon = method.icon;
                        return (
                          <Card
                            key={method.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedPayment?.id === method.id
                                ? "ring-2 ring-purple-500"
                                : ""
                            }`}
                            onClick={() => setSelectedPayment(method)}
                          >
                            <CardContent className="flex items-center gap-3 p-4">
                              <MethodIcon className="h-6 w-6" />
                              <div className="flex-1">
                                <p className="font-medium">{method.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {method.processingTime} • {method.fees}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      },
                    )}
                  </div>

                  {selectedPayment && (
                    <Button
                      onClick={processCustomPurchase}
                      disabled={processing}
                      className="w-full mt-4"
                      size="lg"
                    >
                      {processing
                        ? "Processing..."
                        : `Complete Purchase - $${calculateVIPDiscount(parseFloat(customAmount)).toFixed(2)}`}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>
                Your recent Gold Coin purchases and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {purchaseHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No purchase history found
                </p>
              ) : (
                <div className="space-y-4">
                  {purchaseHistory.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{purchase.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.created_at).toLocaleDateString()}{" "}
                            • {purchase.payment_method}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${purchase.amount.toFixed(2)}
                        </p>
                        <Badge
                          variant={
                            purchase.status === "completed"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {purchase.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoldCoinStore;
