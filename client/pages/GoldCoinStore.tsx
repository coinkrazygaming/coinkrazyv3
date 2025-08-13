import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AnimatedLogo from "@/components/ui/AnimatedLogo";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Crown,
  Star,
  TrendingUp,
  Package,
  ShoppingCart,
  CreditCard,
  Gift,
  Zap,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Filter,
  Search,
  RefreshCw,
  ArrowLeft,
  Loader2,
  DollarSign,
  Shield,
  Users,
  Calendar,
  Timer,
  Wallet,
  PaypalIcon,
  Info,
  Eye,
  Heart,
  Share2,
  Tag,
  Percent,
  Clock,
  X,
} from "lucide-react";

// Types
interface GoldCoinPackage {
  id: string;
  packageName: string;
  description: string;
  goldCoins: number;
  bonusCoins: number;
  priceUsd: number;
  originalPriceUsd?: number;
  discountPercentage: number;
  packageImageUrl?: string;
  packageIcon: string;
  isFeatured: boolean;
  isPopular: boolean;
  isBestValue: boolean;
  isActive: boolean;
  displayOrder: number;
  maxPurchasesPerUser?: number;
  packageType: 'standard' | 'starter' | 'premium' | 'vip' | 'special';
  tags: string[];
  purchaseCount?: number;
  userPurchaseCount?: number;
  timesSold?: number;
  rating?: number;
  reviews?: number;
}

interface CheckoutDetails {
  package: GoldCoinPackage;
  quantity: number;
  totalPrice: number;
  paymentMethod: 'paypal' | 'stripe' | 'crypto';
  userEmail: string;
  userId: string;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PurchaseHistory {
  id: string;
  packageName: string;
  goldCoins: number;
  bonusCoins: number;
  amountPaid: number;
  purchaseDate: string;
  status: string;
  transactionId: string;
}

const iconComponents = {
  coins: Coins,
  crown: Crown,
  star: Star,
  gift: Gift,
  zap: Zap,
  sparkles: Sparkles,
  package: Package,
  "trending-up": TrendingUp,
};

export default function GoldCoinStore() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<GoldCoinPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<GoldCoinPackage[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  
  // Checkout state
  const [checkoutModal, setCheckoutModal] = useState<CheckoutDetails | null>(null);
  const [purchaseConfirmModal, setPurchaseConfirmModal] = useState<GoldCoinPackage | null>(null);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // UI state
  const [selectedPackage, setSelectedPackage] = useState<GoldCoinPackage | null>(null);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [favoritePackages, setFavoritePackages] = useState<string[]>([]);

  // Load packages on component mount
  useEffect(() => {
    loadPackages();
    loadPurchaseHistory();
    loadFavorites();
  }, []);

  // Filter packages when filters change
  useEffect(() => {
    filterAndSortPackages();
  }, [packages, searchTerm, categoryFilter, priceFilter, sortBy]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      // In production, this would be an API call
      const mockPackages: GoldCoinPackage[] = [
        {
          id: "starter-pack",
          packageName: "Starter Pack",
          description: "Perfect for new players to get started with CoinKrazy! Great value with bonus coins.",
          goldCoins: 1000,
          bonusCoins: 100,
          priceUsd: 9.99,
          originalPriceUsd: 12.99,
          discountPercentage: 23,
          packageImageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400",
          packageIcon: "coins",
          isFeatured: true,
          isPopular: true,
          isBestValue: false,
          isActive: true,
          displayOrder: 1,
          maxPurchasesPerUser: 5,
          packageType: "starter",
          tags: ["beginner", "popular", "limited-time"],
          purchaseCount: 1247,
          userPurchaseCount: 2,
          timesSold: 1247,
          rating: 4.8,
          reviews: 342,
        },
        {
          id: "value-pack",
          packageName: "Value Pack",
          description: "Our most popular package! Great value for regular players with excellent bonus coins.",
          goldCoins: 5000,
          bonusCoins: 750,
          priceUsd: 39.99,
          packageIcon: "star",
          isFeatured: false,
          isPopular: true,
          isBestValue: true,
          isActive: true,
          displayOrder: 2,
          packageType: "standard",
          tags: ["value", "popular", "best-seller"],
          purchaseCount: 2134,
          userPurchaseCount: 1,
          timesSold: 2134,
          rating: 4.9,
          reviews: 567,
        },
        {
          id: "premium-pack",
          packageName: "Premium Pack",
          description: "Maximum coins with fantastic bonus for serious players. Premium experience guaranteed!",
          goldCoins: 15000,
          bonusCoins: 3000,
          priceUsd: 99.99,
          originalPriceUsd: 119.99,
          discountPercentage: 17,
          packageIcon: "crown",
          isFeatured: true,
          isPopular: false,
          isBestValue: false,
          isActive: true,
          displayOrder: 3,
          packageType: "premium",
          tags: ["premium", "bonus", "high-value"],
          purchaseCount: 856,
          userPurchaseCount: 0,
          timesSold: 856,
          rating: 4.7,
          reviews: 189,
        },
        {
          id: "mega-pack",
          packageName: "Mega VIP Pack",
          description: "Ultimate package for VIP players! Massive coin bundle with exclusive bonuses.",
          goldCoins: 50000,
          bonusCoins: 15000,
          priceUsd: 299.99,
          packageIcon: "sparkles",
          isFeatured: true,
          isPopular: false,
          isBestValue: false,
          isActive: true,
          displayOrder: 4,
          maxPurchasesPerUser: 2,
          packageType: "vip",
          tags: ["vip", "exclusive", "mega"],
          purchaseCount: 234,
          userPurchaseCount: 0,
          timesSold: 234,
          rating: 4.6,
          reviews: 67,
        },
        {
          id: "quick-boost",
          packageName: "Quick Boost",
          description: "Small but mighty! Perfect for a quick coin top-up when you need it most.",
          goldCoins: 500,
          bonusCoins: 25,
          priceUsd: 4.99,
          packageIcon: "zap",
          isFeatured: false,
          isPopular: false,
          isBestValue: false,
          isActive: true,
          displayOrder: 0,
          packageType: "starter",
          tags: ["quick", "small", "boost"],
          purchaseCount: 3456,
          userPurchaseCount: 5,
          timesSold: 3456,
          rating: 4.4,
          reviews: 891,
        },
        {
          id: "holiday-special",
          packageName: "Holiday Special",
          description: "Limited time holiday package with amazing bonus coins! Don't miss out!",
          goldCoins: 10000,
          bonusCoins: 2500,
          priceUsd: 59.99,
          originalPriceUsd: 79.99,
          discountPercentage: 25,
          packageIcon: "gift",
          isFeatured: true,
          isPopular: true,
          isBestValue: true,
          isActive: true,
          displayOrder: 1.5,
          maxPurchasesPerUser: 3,
          packageType: "special",
          tags: ["holiday", "limited", "special", "bonus"],
          purchaseCount: 567,
          userPurchaseCount: 0,
          timesSold: 567,
          rating: 4.9,
          reviews: 145,
        },
      ];
      
      setPackages(mockPackages);
    } catch (error) {
      console.error("Failed to load packages:", error);
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseHistory = async () => {
    if (!user) return;
    
    try {
      // Mock purchase history
      const mockHistory: PurchaseHistory[] = [
        {
          id: "hist-1",
          packageName: "Starter Pack",
          goldCoins: 1000,
          bonusCoins: 100,
          amountPaid: 9.99,
          purchaseDate: "2024-01-15T10:30:00Z",
          status: "completed",
          transactionId: "TXN-123456",
        },
        {
          id: "hist-2",
          packageName: "Value Pack",
          goldCoins: 5000,
          bonusCoins: 750,
          amountPaid: 39.99,
          purchaseDate: "2024-01-10T14:20:00Z",
          status: "completed",
          transactionId: "TXN-123455",
        },
      ];
      
      setPurchaseHistory(mockHistory);
    } catch (error) {
      console.error("Failed to load purchase history:", error);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      // Load user's favorite packages from localStorage or API
      const saved = localStorage.getItem(`favorites_${user.id}`);
      if (saved) {
        setFavoritePackages(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  };

  const filterAndSortPackages = () => {
    let filtered = [...packages];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(pkg => pkg.packageType === categoryFilter);
    }

    // Price filter
    if (priceFilter !== "all") {
      switch (priceFilter) {
        case "under-10":
          filtered = filtered.filter(pkg => pkg.priceUsd < 10);
          break;
        case "10-50":
          filtered = filtered.filter(pkg => pkg.priceUsd >= 10 && pkg.priceUsd < 50);
          break;
        case "50-100":
          filtered = filtered.filter(pkg => pkg.priceUsd >= 50 && pkg.priceUsd < 100);
          break;
        case "over-100":
          filtered = filtered.filter(pkg => pkg.priceUsd >= 100);
          break;
      }
    }

    // Sort packages
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => a.priceUsd - b.priceUsd);
        break;
      case "price-high":
        filtered.sort((a, b) => b.priceUsd - a.priceUsd);
        break;
      case "coins-high":
        filtered.sort((a, b) => b.goldCoins - a.goldCoins);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => b.displayOrder - a.displayOrder);
        break;
      default:
        filtered.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    setFilteredPackages(filtered);
  };

  const handlePurchaseClick = (pkg: GoldCoinPackage) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase packages",
        variant: "destructive",
      });
      return;
    }

    // Check purchase limits
    if (pkg.maxPurchasesPerUser && (pkg.userPurchaseCount || 0) >= pkg.maxPurchasesPerUser) {
      toast({
        title: "Purchase Limit Reached",
        description: `You have reached the maximum purchase limit for this package (${pkg.maxPurchasesPerUser})`,
        variant: "destructive",
      });
      return;
    }

    setPurchaseConfirmModal(pkg);
  };

  const confirmPurchase = (pkg: GoldCoinPackage) => {
    setPurchaseConfirmModal(null);
    setCheckoutModal({
      package: pkg,
      quantity: 1,
      totalPrice: pkg.priceUsd,
      paymentMethod: 'paypal',
      userEmail: user?.email || '',
      userId: user?.id || '',
    });
  };

  const handlePayPalCheckout = async () => {
    if (!checkoutModal) return;

    setPaypalLoading(true);
    try {
      // Create PayPal order
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: checkoutModal.totalPrice.toFixed(2),
          },
          description: `${checkoutModal.package.packageName} - ${checkoutModal.package.goldCoins.toLocaleString()} Gold Coins`,
          custom_id: `pkg_${checkoutModal.package.id}_user_${checkoutModal.userId}`,
        }],
        application_context: {
          brand_name: 'CoinKrazy',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/payment-cancelled`,
        }
      };

      // In production, this would be an API call to your backend
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const order: PayPalOrderResponse = await response.json();
      
      // Redirect to PayPal
      const approveLink = order.links.find(link => link.rel === 'approve');
      if (approveLink) {
        window.location.href = approveLink.href;
      } else {
        throw new Error('No approval link found');
      }
      
    } catch (error) {
      console.error('PayPal checkout error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize PayPal payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaypalLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!checkoutModal) return;

    setProcessingPayment(true);
    try {
      // Create Stripe checkout session
      const sessionData = {
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: checkoutModal.package.packageName,
              description: `${checkoutModal.package.goldCoins.toLocaleString()} Gold Coins + ${checkoutModal.package.bonusCoins.toLocaleString()} Bonus`,
              images: checkoutModal.package.packageImageUrl ? [checkoutModal.package.packageImageUrl] : [],
            },
            unit_amount: Math.round(checkoutModal.package.priceUsd * 100),
          },
          quantity: checkoutModal.quantity,
        }],
        mode: 'payment',
        success_url: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/store`,
        metadata: {
          package_id: checkoutModal.package.id,
          user_id: checkoutModal.userId,
          gold_coins: checkoutModal.package.goldCoins.toString(),
          bonus_coins: checkoutModal.package.bonusCoins.toString(),
        },
      };

      // In production, this would be an API call to your backend
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create Stripe session');
      }

      const session = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
      
    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize Stripe payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const toggleFavorite = (packageId: string) => {
    if (!user) return;

    const newFavorites = favoritePackages.includes(packageId)
      ? favoritePackages.filter(id => id !== packageId)
      : [...favoritePackages, packageId];
    
    setFavoritePackages(newFavorites);
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
    
    toast({
      title: favoritePackages.includes(packageId) ? "Removed from Favorites" : "Added to Favorites",
      description: favoritePackages.includes(packageId) 
        ? "Package removed from your favorites"
        : "Package added to your favorites",
    });
  };

  const getIconComponent = (iconName: string) => {
    return iconComponents[iconName as keyof typeof iconComponents] || Coins;
  };

  const getPackageTypeColor = (type: string) => {
    const colors = {
      starter: "bg-green-100 text-green-800",
      standard: "bg-blue-100 text-blue-800", 
      premium: "bg-purple-100 text-purple-800",
      vip: "bg-yellow-100 text-yellow-800",
      special: "bg-red-100 text-red-800",
    };
    return colors[type as keyof typeof colors] || colors.standard;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AnimatedLogo size="lg" showText={true} animated={true} />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gold Coin Store
                </h1>
                <p className="text-muted-foreground">
                  Purchase gold coins to play your favorite games
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseHistory(true)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Purchase History
                </Button>
              )}
              <Button onClick={loadPackages} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">Search Packages</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price Range</Label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-10">Under $10</SelectItem>
                    <SelectItem value="10-50">$10 - $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="over-100">Over $100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="coins-high">Most Coins</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setPriceFilter("all");
                    setSortBy("popular");
                  }}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Packages */}
        {packages.filter(pkg => pkg.isFeatured).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Featured Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages
                .filter(pkg => pkg.isFeatured)
                .slice(0, 3)
                .map((pkg) => {
                  const IconComponent = getIconComponent(pkg.packageIcon);
                  
                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      <Card className="relative overflow-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                        {/* Featured Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <Badge className="bg-yellow-500 text-yellow-50">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>

                        {/* Favorite Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-4 right-4 z-10 h-8 w-8 p-0"
                          onClick={() => toggleFavorite(pkg.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favoritePackages.includes(pkg.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        </Button>

                        <CardHeader className="text-center pb-4 pt-12">
                          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <CardTitle className="text-xl">{pkg.packageName}</CardTitle>
                          <div className="flex justify-center">
                            <Badge className={getPackageTypeColor(pkg.packageType)}>
                              {pkg.packageType}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Package Image */}
                          {pkg.packageImageUrl && (
                            <div className="w-full h-32 rounded-lg overflow-hidden">
                              <img
                                src={pkg.packageImageUrl}
                                alt={pkg.packageName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Description */}
                          <p className="text-sm text-muted-foreground text-center">
                            {pkg.description}
                          </p>

                          {/* Coins Display */}
                          <div className="bg-white/80 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              {pkg.goldCoins.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Gold Coins</div>
                            {pkg.bonusCoins > 0 && (
                              <div className="text-lg font-semibold text-green-600 mt-2">
                                +{pkg.bonusCoins.toLocaleString()} Bonus!
                              </div>
                            )}
                          </div>

                          {/* Rating */}
                          {pkg.rating && (
                            <div className="flex items-center justify-center gap-2">
                              {renderStars(pkg.rating)}
                              <span className="text-sm text-muted-foreground">
                                ({pkg.reviews} reviews)
                              </span>
                            </div>
                          )}

                          {/* Price */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-2xl font-bold">${pkg.priceUsd}</span>
                              {pkg.originalPriceUsd && pkg.originalPriceUsd > pkg.priceUsd && (
                                <>
                                  <span className="text-lg text-muted-foreground line-through">
                                    ${pkg.originalPriceUsd}
                                  </span>
                                  <Badge className="bg-red-100 text-red-800">
                                    {pkg.discountPercentage}% OFF
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Purchase Limit */}
                          {pkg.maxPurchasesPerUser && (
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">
                                Purchased: {pkg.userPurchaseCount || 0} / {pkg.maxPurchasesPerUser}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(((pkg.userPurchaseCount || 0) / pkg.maxPurchasesPerUser) * 100, 100)}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="space-y-2">
                            <Button
                              onClick={() => handlePurchaseClick(pkg)}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              disabled={pkg.maxPurchasesPerUser && (pkg.userPurchaseCount || 0) >= pkg.maxPurchasesPerUser}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {pkg.maxPurchasesPerUser && (pkg.userPurchaseCount || 0) >= pkg.maxPurchasesPerUser
                                ? "Purchase Limit Reached"
                                : "Purchase Now"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedPackage(pkg)}
                              className="w-full"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}

        {/* All Packages */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-500" />
            All Packages ({filteredPackages.length})
          </h2>
          
          {filteredPackages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No packages found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters to see more packages.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setPriceFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredPackages.map((pkg, index) => {
                  const IconComponent = getIconComponent(pkg.packageIcon);
                  
                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="relative overflow-hidden h-full flex flex-col">
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                          {pkg.isPopular && (
                            <Badge className="bg-green-100 text-green-800">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          {pkg.isBestValue && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Zap className="w-3 h-3 mr-1" />
                              Best Value
                            </Badge>
                          )}
                          {pkg.discountPercentage > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              <Percent className="w-3 h-3 mr-1" />
                              {pkg.discountPercentage}% OFF
                            </Badge>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-3 right-3 z-10 h-8 w-8 p-0"
                          onClick={() => toggleFavorite(pkg.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favoritePackages.includes(pkg.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        </Button>

                        <CardHeader className="text-center pb-4 pt-12">
                          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-3">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className="text-lg">{pkg.packageName}</CardTitle>
                          <Badge className={getPackageTypeColor(pkg.packageType)}>
                            {pkg.packageType}
                          </Badge>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col space-y-3">
                          {/* Description */}
                          <p className="text-sm text-muted-foreground text-center line-clamp-2">
                            {pkg.description}
                          </p>

                          {/* Coins */}
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-yellow-600">
                              {pkg.goldCoins.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Gold Coins</div>
                            {pkg.bonusCoins > 0 && (
                              <div className="text-sm font-semibold text-green-600">
                                +{pkg.bonusCoins.toLocaleString()} Bonus
                              </div>
                            )}
                          </div>

                          {/* Rating */}
                          {pkg.rating && (
                            <div className="flex items-center justify-center gap-1">
                              {renderStars(pkg.rating)}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({pkg.reviews})
                              </span>
                            </div>
                          )}

                          {/* Price */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-xl font-bold">${pkg.priceUsd}</span>
                              {pkg.originalPriceUsd && pkg.originalPriceUsd > pkg.priceUsd && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${pkg.originalPriceUsd}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Purchase Count */}
                          <div className="text-center text-xs text-muted-foreground">
                            {pkg.timesSold?.toLocaleString()} sold
                          </div>

                          {/* Actions */}
                          <div className="mt-auto space-y-2">
                            <Button
                              onClick={() => handlePurchaseClick(pkg)}
                              className="w-full"
                              size="sm"
                              disabled={pkg.maxPurchasesPerUser && (pkg.userPurchaseCount || 0) >= pkg.maxPurchasesPerUser}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {pkg.maxPurchasesPerUser && (pkg.userPurchaseCount || 0) >= pkg.maxPurchasesPerUser
                                ? "Limit Reached"
                                : "Buy Now"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedPackage(pkg)}
                              className="w-full"
                              size="sm"
                            >
                              Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {purchaseConfirmModal && (
        <AlertDialog open={!!purchaseConfirmModal} onOpenChange={() => setPurchaseConfirmModal(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-3">
                  <p>You are about to purchase:</p>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="font-semibold">{purchaseConfirmModal.packageName}</div>
                    <div className="text-sm text-muted-foreground">
                      {purchaseConfirmModal.goldCoins.toLocaleString()} Gold Coins
                      {purchaseConfirmModal.bonusCoins > 0 && (
                        <span> + {purchaseConfirmModal.bonusCoins.toLocaleString()} Bonus</span>
                      )}
                    </div>
                    <div className="font-bold text-lg mt-2">${purchaseConfirmModal.priceUsd}</div>
                  </div>
                  {purchaseConfirmModal.maxPurchasesPerUser && (
                    <p className="text-sm text-muted-foreground">
                      This will be purchase {(purchaseConfirmModal.userPurchaseCount || 0) + 1} of {purchaseConfirmModal.maxPurchasesPerUser} allowed.
                    </p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmPurchase(purchaseConfirmModal)}>
                Continue to Payment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Checkout Modal */}
      {checkoutModal && (
        <Dialog open={!!checkoutModal} onOpenChange={() => setCheckoutModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Checkout</DialogTitle>
              <DialogDescription>
                Complete your purchase of {checkoutModal.package.packageName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Package Summary */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  {React.createElement(getIconComponent(checkoutModal.package.packageIcon), {
                    className: "w-8 h-8 text-yellow-600"
                  })}
                  <div>
                    <div className="font-semibold">{checkoutModal.package.packageName}</div>
                    <div className="text-sm text-muted-foreground">
                      {checkoutModal.package.goldCoins.toLocaleString()} + {checkoutModal.package.bonusCoins.toLocaleString()} bonus
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total:</span>
                  <span className="text-xl font-bold">${checkoutModal.totalPrice}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={checkoutModal.paymentMethod}
                  onValueChange={(value: 'paypal' | 'stripe') => 
                    setCheckoutModal(prev => prev ? {...prev, paymentMethod: value} : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        PayPal
                      </div>
                    </SelectItem>
                    <SelectItem value="stripe">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Credit/Debit Card (Stripe)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900">Secure Payment</div>
                  <div className="text-blue-700">
                    Your payment information is encrypted and secure. We never store your payment details.
                  </div>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="space-y-2">
                {checkoutModal.paymentMethod === 'paypal' ? (
                  <Button
                    onClick={handlePayPalCheckout}
                    disabled={paypalLoading}
                    className="w-full bg-[#0070ba] hover:bg-[#005ea6]"
                  >
                    {paypalLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Pay with PayPal
                  </Button>
                ) : (
                  <Button
                    onClick={handleStripeCheckout}
                    disabled={processingPayment}
                    className="w-full bg-[#635bff] hover:bg-[#5a52e8]"
                  >
                    {processingPayment ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Pay with Card
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setCheckoutModal(null)}
                  className="w-full"
                  disabled={paypalLoading || processingPayment}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Package Details Modal */}
      {selectedPackage && (
        <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPackage.packageName}</DialogTitle>
              <DialogDescription>
                Complete package details and information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Package Header */}
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4">
                  {React.createElement(getIconComponent(selectedPackage.packageIcon), {
                    className: "w-10 h-10 text-white"
                  })}
                </div>
                <h3 className="text-2xl font-bold mb-2">{selectedPackage.packageName}</h3>
                <Badge className={getPackageTypeColor(selectedPackage.packageType)}>
                  {selectedPackage.packageType}
                </Badge>
              </div>

              {/* Package Image */}
              {selectedPackage.packageImageUrl && (
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={selectedPackage.packageImageUrl}
                    alt={selectedPackage.packageName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedPackage.description}</p>
              </div>

              {/* Package Contents */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Coins className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedPackage.goldCoins.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Gold Coins</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Gift className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {selectedPackage.bonusCoins.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Bonus Coins</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    ${selectedPackage.priceUsd}
                  </div>
                  <div className="text-sm text-muted-foreground">Price</div>
                </div>
              </div>

              {/* Package Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedPackage.rating && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      {renderStars(selectedPackage.rating)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedPackage.reviews} reviews
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-lg font-bold">{selectedPackage.timesSold?.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Times Sold</div>
                </div>
                
                {selectedPackage.maxPurchasesPerUser && (
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {selectedPackage.userPurchaseCount || 0} / {selectedPackage.maxPurchasesPerUser}
                    </div>
                    <div className="text-sm text-muted-foreground">Your Purchases</div>
                  </div>
                )}
                
                <div className="text-center">
                  <Badge className={selectedPackage.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {selectedPackage.isActive ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>

              {/* Tags */}
              {selectedPackage.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedPackage(null);
                    handlePurchaseClick(selectedPackage);
                  }}
                  className="flex-1"
                  disabled={selectedPackage.maxPurchasesPerUser && (selectedPackage.userPurchaseCount || 0) >= selectedPackage.maxPurchasesPerUser}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Purchase Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleFavorite(selectedPackage.id)}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favoritePackages.includes(selectedPackage.id)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Purchase History Modal */}
      {showPurchaseHistory && (
        <Dialog open={showPurchaseHistory} onOpenChange={setShowPurchaseHistory}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Purchase History</DialogTitle>
              <DialogDescription>
                Your recent package purchases
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-96">
              {purchaseHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground">
                    Your package purchases will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchaseHistory.map((purchase) => (
                    <Card key={purchase.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{purchase.packageName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {purchase.goldCoins.toLocaleString()} Gold Coins + {purchase.bonusCoins.toLocaleString()} Bonus
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(purchase.purchaseDate).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${purchase.amountPaid}</div>
                            <Badge className="bg-green-100 text-green-800">
                              {purchase.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {purchase.transactionId}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
