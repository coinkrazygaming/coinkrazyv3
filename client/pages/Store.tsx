import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
  Wallet,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { goldStoreService, GoldPackage } from "@/services/goldStoreService";

interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "applepay" | "googlepay" | "crypto";
  name: string;
  icon: any;
  available: boolean;
  processingTime: string;
}

export default function Store() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedPackage, setSelectedPackage] = useState<GoldPackage | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("card");
  const [loading, setLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [userBalance] = useState({ gc: 125000, sc: 450 });

  // Dynamic package state from database
  const [packages, setPackages] = useState<GoldPackage[]>([]);
  const [featuredPackages, setFeaturedPackages] = useState<GoldPackage[]>([]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: "card",
      type: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      available: true,
      processingTime: "Instant",
    },
    {
      id: "paypal",
      type: "paypal",
      name: "PayPal",
      icon: Wallet,
      available: true,
      processingTime: "Instant",
    },
    {
      id: "applepay",
      type: "applepay",
      name: "Apple Pay",
      icon: Smartphone,
      available: true,
      processingTime: "Instant",
    },
    {
      id: "googlepay",
      type: "googlepay",
      name: "Google Pay",
      icon: Smartphone,
      available: true,
      processingTime: "Instant",
    },
  ]);

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Load packages from database
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setPackagesLoading(true);
      const packagesData = await goldStoreService.getAllPackages();

      // Filter active packages
      const activePackages = packagesData.filter((pkg) => pkg.isActive);
      setPackages(activePackages);

      // Filter featured packages
      const featured = activePackages.filter((pkg) => pkg.featured);
      setFeaturedPackages(featured);
    } catch (error) {
      console.error("Failed to load packages:", error);
      toast({
        title: "Error",
        description: "Failed to load store packages. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setPackagesLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setLoading(true);

    try {
      // Use the goldStoreService to process the purchase
      const success = await goldStoreService.purchasePackage(
        selectedPackage.id,
        selectedPaymentMethod,
      );

      if (success) {
        toast({
          title: "Purchase Successful! 🎉",
          description: `Added ${selectedPackage.goldCoins.toLocaleString()} GC and ${selectedPackage.sweepsCoins} SC to your account.`,
          variant: "default",
        });

        // Close modal and redirect
        setShowPaymentModal(false);
        setSelectedPackage(null);
        navigate("/dashboard");
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Payment failed. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? "/" + v.substring(2, 4) : "");
    }
    return v;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "starter":
        return "🌟";
      case "standard":
        return "⚡";
      case "premium":
        return "💎";
      case "elite":
        return "👑";
      case "mega":
        return "🔥";
      case "ultimate":
        return "🚀";
      default:
        return "🎯";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "starter":
        return "from-blue-500/10 to-blue-500/5";
      case "standard":
        return "from-green-500/10 to-green-500/5";
      case "premium":
        return "from-purple-500/10 to-purple-500/5";
      case "elite":
        return "from-orange-500/10 to-orange-500/5";
      case "mega":
        return "from-red-500/10 to-red-500/5";
      case "ultimate":
        return "from-gray-900/10 to-gray-900/5";
      default:
        return "from-casino-blue/10 to-casino-blue/5";
    }
  };

  const renderPackageCard = (pkg: GoldPackage, isFeatured: boolean = false) => {
    const savings = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;

    return (
      <Card
        key={pkg.id}
        className={`relative hover:shadow-lg transition-all duration-300 ${
          pkg.popular
            ? "border-gold-500 bg-gradient-to-br from-gold/5 to-gold/10"
            : `bg-gradient-to-br ${getCategoryColor(pkg.category)}`
        } ${pkg.design?.animation === "pulse" ? "animate-pulse" : ""}`}
        style={
          pkg.design
            ? {
                borderColor: pkg.design.borderColor,
                background: `linear-gradient(${pkg.design.backgroundGradient.direction}, ${pkg.design.backgroundGradient.from}, ${pkg.design.backgroundGradient.to})`,
              }
            : undefined
        }
      >
        {/* Featured Badge */}
        {isFeatured && (
          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white animate-pulse">
            🔥 HOT DEAL
          </Badge>
        )}

        {/* Popular Badge */}
        {pkg.popular && !isFeatured && (
          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gold-500 text-black">
            Most Popular
          </Badge>
        )}

        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">
              {pkg.design?.icon || getCategoryIcon(pkg.category)}
            </span>
            <CardTitle
              className="text-lg"
              style={pkg.design ? { color: pkg.design.textColor } : undefined}
            >
              {pkg.name}
            </CardTitle>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-2xl font-bold"
                style={
                  pkg.design ? { color: pkg.design.accentColor } : undefined
                }
              >
                {pkg.currency === "USD"
                  ? "$"
                  : pkg.currency === "EUR"
                    ? "€"
                    : pkg.currency === "GBP"
                      ? "£"
                      : "C$"}
                {pkg.price.toFixed(2)}
              </span>
              {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {pkg.currency === "USD"
                    ? "$"
                    : pkg.currency === "EUR"
                      ? "€"
                      : pkg.currency === "GBP"
                        ? "£"
                        : "C$"}
                  {pkg.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {savings > 0 && (
              <div className="text-xs text-green-500 font-medium">
                Save{" "}
                {pkg.currency === "USD"
                  ? "$"
                  : pkg.currency === "EUR"
                    ? "€"
                    : pkg.currency === "GBP"
                      ? "£"
                      : "C$"}
                {savings.toFixed(2)}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent
          className="text-center space-y-4"
          style={pkg.design ? { color: pkg.design.textColor } : undefined}
        >
          <p className="text-sm opacity-90">{pkg.description}</p>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1">
              <Coins
                className="w-4 h-4 text-gold-500"
                style={
                  pkg.design ? { color: pkg.design.accentColor } : undefined
                }
              />
              <span className="text-lg font-bold text-gold-400">
                {pkg.goldCoins.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Gold Coins</div>

            {pkg.sweepsCoins > 0 && (
              <>
                <div className="flex items-center justify-center gap-1">
                  <Crown
                    className="w-4 h-4 text-casino-blue"
                    style={
                      pkg.design ? { color: pkg.design.accentColor } : undefined
                    }
                  />
                  <span className="text-lg font-bold text-casino-blue">
                    {pkg.sweepsCoins}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Sweeps Coins
                </div>
              </>
            )}

            {pkg.bonus.enabled && (
              <div className="text-xs text-green-400 font-medium mt-2">
                <Gift className="w-3 h-3 inline mr-1" />
                {pkg.bonus.description}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1 justify-center">
            {pkg.bestValue && (
              <Badge variant="outline" className="text-xs">
                💎 Best Value
              </Badge>
            )}
            {pkg.limitedTime && (
              <Badge variant="destructive" className="text-xs">
                ⏰ Limited
              </Badge>
            )}
          </div>

          <Button
            onClick={() => {
              setSelectedPackage(pkg);
              setShowPaymentModal(true);
            }}
            className={`w-full ${
              pkg.popular || isFeatured
                ? "bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black"
                : ""
            }`}
            style={
              pkg.design?.accentColor
                ? {
                    backgroundColor: pkg.design.accentColor,
                    color: "#000000",
                  }
                : undefined
            }
          >
            {isFeatured ? (
              <Star className="w-4 h-4 mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Purchase
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (packagesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading store packages...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-muted-foreground">
                  Purchase Gold Coins and receive bonus Sweeps Coins
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={loadPackages}
                disabled={packagesLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1 ${packagesLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <div className="text-center">
                <div className="text-xl font-bold text-gold-400">
                  {userBalance.gc.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Gold Coins</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-casino-blue">
                  {userBalance.sc}
                </div>
                <div className="text-sm text-muted-foreground">
                  Sweeps Coins
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Offers */}
        {featuredPackages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">🔥 Limited Time Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPackages.map((pkg) => renderPackageCard(pkg, true))}
            </div>
          </div>
        )}

        {/* All Packages */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Gold Coin Packages</h2>
          {packages.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Packages Available
                </h3>
                <p className="text-muted-foreground">
                  Store packages are currently being updated. Please check back
                  soon.
                </p>
                <Button onClick={loadPackages} className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Store
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {packages.map((pkg) => renderPackageCard(pkg))}
            </div>
          )}
        </div>

        {/* Security & Trust */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              All transactions are encrypted and processed through secure
              payment gateways
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
                  <span className="font-bold">
                    {selectedPackage.currency === "USD"
                      ? "$"
                      : selectedPackage.currency === "EUR"
                        ? "€"
                        : selectedPackage.currency === "GBP"
                          ? "£"
                          : "C$"}
                    {selectedPackage.price.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    • {selectedPackage.goldCoins.toLocaleString()} Gold Coins
                  </div>
                  {selectedPackage.sweepsCoins > 0 && (
                    <div>• {selectedPackage.sweepsCoins} Sweeps Coins</div>
                  )}
                  {selectedPackage.bonus.enabled && (
                    <div className="text-green-400">
                      • {selectedPackage.bonus.description}
                    </div>
                  )}
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
                          ? "border-gold-500 bg-gold-500/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {method.processingTime}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Form */}
              {selectedPaymentMethod === "card" && (
                <div className="space-y-4">
                  <h3 className="font-bold">Card Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Card Number
                      </label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) =>
                          setPaymentData((prev) => ({
                            ...prev,
                            cardNumber: formatCardNumber(e.target.value),
                          }))
                        }
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Expiry Date
                        </label>
                        <Input
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              expiryDate: formatExpiryDate(e.target.value),
                            }))
                          }
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          CVV
                        </label>
                        <Input
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              cvv: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Cardholder Name
                      </label>
                      <Input
                        placeholder="John Doe"
                        value={paymentData.cardholderName}
                        onChange={(e) =>
                          setPaymentData((prev) => ({
                            ...prev,
                            cardholderName: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-400">
                    Secure Payment
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your payment information is encrypted and secure. We never
                  store your card details.
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
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Purchase -{" "}
                    {selectedPackage.currency === "USD"
                      ? "$"
                      : selectedPackage.currency === "EUR"
                        ? "€"
                        : selectedPackage.currency === "GBP"
                          ? "£"
                          : "C$"}
                    {selectedPackage.price.toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By completing this purchase, you agree to our Terms of Service
                and confirm you are 18+ years old.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
