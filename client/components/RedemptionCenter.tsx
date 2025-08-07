import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  DollarSign,
  Gift,
  CreditCard,
  Gem,
  Trophy,
  Star,
  Crown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Shield,
  Zap,
  Target,
  Award,
  Package,
  Smartphone,
  Gamepad,
  Headphones,
  Monitor,
  Car,
  Home,
  Plane,
  Coffee,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowRight,
  Download,
  Share2,
  BookOpen,
  FileText
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { walletService, type UserWallet } from '../services/walletService';
import { neonDatabaseService } from '../services/neonDatabaseService';

interface RedemptionOption {
  id: string;
  type: 'cash' | 'gift_card' | 'prize';
  name: string;
  description: string;
  scRequired: number;
  cashValue?: number;
  provider?: string;
  brand?: string;
  category: string;
  image: string;
  popularity: number;
  availability: 'available' | 'limited' | 'out_of_stock';
  deliveryTime: string;
  restrictions?: string[];
  isPhysical: boolean;
  isFeatured: boolean;
  stockLevel?: number;
  redemptionLimit?: number;
}

interface RedemptionRequest {
  id: string;
  userId: string;
  optionId: string;
  scAmount: number;
  cashValue?: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  requestDate: Date;
  processedDate?: Date;
  completedDate?: Date;
  deliveryInfo?: {
    type: 'email' | 'paypal' | 'physical' | 'digital';
    address?: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
  };
  adminNotes?: string;
  rejectionReason?: string;
}

interface UserRedemptionHistory {
  totalRedemptions: number;
  totalSCRedeemed: number;
  totalCashValue: number;
  lifetimeRedemptions: RedemptionRequest[];
  monthlyLimit: number;
  monthlyRedeemed: number;
  verificationLevel: 'basic' | 'verified' | 'premium';
  kycCompleted: boolean;
}

export default function RedemptionCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [redemptionOptions, setRedemptionOptions] = useState<RedemptionOption[]>([]);
  const [userHistory, setUserHistory] = useState<UserRedemptionHistory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState<RedemptionOption | null>(null);
  const [redemptionAmount, setRedemptionAmount] = useState('');
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showRedemptionDialog, setShowRedemptionDialog] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadWallet(),
        loadRedemptionOptions(),
        loadUserHistory()
      ]);
    } catch (error) {
      console.error('Failed to load redemption data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    if (!user?.id) return;
    try {
      const userWallet = await walletService.getUserWallet(user.id);
      setWallet(userWallet);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const loadRedemptionOptions = async () => {
    // In production, this would fetch from API
    const options: RedemptionOption[] = [
      // Cash Redemptions
      {
        id: 'paypal-cash',
        type: 'cash',
        name: 'PayPal Cash',
        description: 'Instant cash to your PayPal account',
        scRequired: 100,
        cashValue: 100,
        provider: 'PayPal',
        category: 'cash',
        image: '/redemption/paypal.png',
        popularity: 95,
        availability: 'available',
        deliveryTime: 'Instant',
        restrictions: ['Verified PayPal account required', 'US residents only'],
        isPhysical: false,
        isFeatured: true
      },
      {
        id: 'bank-transfer',
        type: 'cash',
        name: 'Bank Transfer',
        description: 'Direct deposit to your bank account',
        scRequired: 100,
        cashValue: 100,
        provider: 'ACH Transfer',
        category: 'cash',
        image: '/redemption/bank.png',
        popularity: 85,
        availability: 'available',
        deliveryTime: '1-3 business days',
        restrictions: ['Valid US bank account required', 'Minimum $100'],
        isPhysical: false,
        isFeatured: true
      },
      
      // Gift Cards
      {
        id: 'amazon-gift-card',
        type: 'gift_card',
        name: 'Amazon Gift Card',
        description: '$25 Amazon Gift Card',
        scRequired: 25,
        cashValue: 25,
        brand: 'Amazon',
        category: 'shopping',
        image: '/redemption/amazon.png',
        popularity: 92,
        availability: 'available',
        deliveryTime: '24 hours',
        isPhysical: false,
        isFeatured: true,
        stockLevel: 500
      },
      {
        id: 'walmart-gift-card',
        type: 'gift_card',
        name: 'Walmart Gift Card',
        description: '$50 Walmart Gift Card',
        scRequired: 50,
        cashValue: 50,
        brand: 'Walmart',
        category: 'shopping',
        image: '/redemption/walmart.png',
        popularity: 78,
        availability: 'available',
        deliveryTime: '24 hours',
        isPhysical: false,
        isFeatured: false,
        stockLevel: 250
      },
      {
        id: 'starbucks-gift-card',
        type: 'gift_card',
        name: 'Starbucks Gift Card',
        description: '$10 Starbucks Gift Card',
        scRequired: 10,
        cashValue: 10,
        brand: 'Starbucks',
        category: 'food',
        image: '/redemption/starbucks.png',
        popularity: 88,
        availability: 'available',
        deliveryTime: '12 hours',
        isPhysical: false,
        isFeatured: true,
        stockLevel: 1000
      },
      {
        id: 'google-play-gift-card',
        type: 'gift_card',
        name: 'Google Play Gift Card',
        description: '$25 Google Play Gift Card',
        scRequired: 25,
        cashValue: 25,
        brand: 'Google Play',
        category: 'digital',
        image: '/redemption/google-play.png',
        popularity: 82,
        availability: 'available',
        deliveryTime: '6 hours',
        isPhysical: false,
        isFeatured: false,
        stockLevel: 300
      },
      {
        id: 'netflix-gift-card',
        type: 'gift_card',
        name: 'Netflix Gift Card',
        description: '$15 Netflix Gift Card',
        scRequired: 15,
        cashValue: 15,
        brand: 'Netflix',
        category: 'entertainment',
        image: '/redemption/netflix.png',
        popularity: 85,
        availability: 'available',
        deliveryTime: '12 hours',
        isPhysical: false,
        isFeatured: true,
        stockLevel: 400
      },

      // Physical Prizes
      {
        id: 'iphone-15-pro',
        type: 'prize',
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone 15 Pro 128GB',
        scRequired: 1000,
        cashValue: 999,
        brand: 'Apple',
        category: 'electronics',
        image: '/redemption/iphone15.png',
        popularity: 96,
        availability: 'limited',
        deliveryTime: '5-7 business days',
        restrictions: ['US delivery only', 'Age 18+ required'],
        isPhysical: true,
        isFeatured: true,
        stockLevel: 5,
        redemptionLimit: 1
      },
      {
        id: 'ps5-console',
        type: 'prize',
        name: 'PlayStation 5',
        description: 'Sony PlayStation 5 Console',
        scRequired: 500,
        cashValue: 499,
        brand: 'Sony',
        category: 'gaming',
        image: '/redemption/ps5.png',
        popularity: 94,
        availability: 'limited',
        deliveryTime: '5-7 business days',
        restrictions: ['US delivery only'],
        isPhysical: true,
        isFeatured: true,
        stockLevel: 10,
        redemptionLimit: 1
      },
      {
        id: 'airpods-pro',
        type: 'prize',
        name: 'AirPods Pro',
        description: 'Apple AirPods Pro (2nd Generation)',
        scRequired: 250,
        cashValue: 249,
        brand: 'Apple',
        category: 'electronics',
        image: '/redemption/airpods.png',
        popularity: 89,
        availability: 'available',
        deliveryTime: '3-5 business days',
        isPhysical: true,
        isFeatured: true,
        stockLevel: 25
      },
      {
        id: 'gaming-headset',
        type: 'prize',
        name: 'SteelSeries Gaming Headset',
        description: 'SteelSeries Arctis 7P Wireless Gaming Headset',
        scRequired: 150,
        cashValue: 149,
        brand: 'SteelSeries',
        category: 'gaming',
        image: '/redemption/headset.png',
        popularity: 76,
        availability: 'available',
        deliveryTime: '3-5 business days',
        isPhysical: true,
        isFeatured: false,
        stockLevel: 50
      }
    ];

    setRedemptionOptions(options);
  };

  const loadUserHistory = async () => {
    if (!user?.id) return;
    
    try {
      // Load from localStorage for demo
      const historyData = localStorage.getItem(`redemption_history_${user.id}`);
      if (historyData) {
        const history = JSON.parse(historyData);
        setUserHistory({
          ...history,
          lifetimeRedemptions: history.lifetimeRedemptions.map((req: any) => ({
            ...req,
            requestDate: new Date(req.requestDate),
            processedDate: req.processedDate ? new Date(req.processedDate) : undefined,
            completedDate: req.completedDate ? new Date(req.completedDate) : undefined
          }))
        });
      } else {
        // Initialize new user history
        const newHistory: UserRedemptionHistory = {
          totalRedemptions: 0,
          totalSCRedeemed: 0,
          totalCashValue: 0,
          lifetimeRedemptions: [],
          monthlyLimit: 5000, // 5000 SC per month
          monthlyRedeemed: 0,
          verificationLevel: 'basic',
          kycCompleted: false
        };
        setUserHistory(newHistory);
      }
    } catch (error) {
      console.error('Failed to load user history:', error);
    }
  };

  const saveUserHistory = (history: UserRedemptionHistory) => {
    if (!user?.id) return;
    localStorage.setItem(`redemption_history_${user.id}`, JSON.stringify(history));
  };

  const filteredOptions = redemptionOptions.filter(option => {
    if (selectedCategory !== 'all' && option.category !== selectedCategory) return false;
    if (searchQuery && !option.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return b.popularity - a.popularity;
  });

  const categories = [
    { id: 'all', name: 'All Categories', icon: Target },
    { id: 'cash', name: 'Cash', icon: DollarSign },
    { id: 'shopping', name: 'Shopping', icon: ShoppingBag },
    { id: 'entertainment', name: 'Entertainment', icon: Monitor },
    { id: 'gaming', name: 'Gaming', icon: Gamepad },
    { id: 'electronics', name: 'Electronics', icon: Smartphone },
    { id: 'food', name: 'Food & Drink', icon: Coffee },
    { id: 'digital', name: 'Digital', icon: Download }
  ];

  const handleRedemption = async (option: RedemptionOption) => {
    if (!user?.id || !wallet || !userHistory) {
      toast({
        title: "Login Required",
        description: "Please log in to redeem prizes",
        variant: "destructive"
      });
      return;
    }

    if (wallet.sweepsCoins < option.scRequired) {
      toast({
        title: "Insufficient Sweeps Coins",
        description: `You need ${option.scRequired} SC but only have ${wallet.sweepsCoins.toFixed(2)} SC`,
        variant: "destructive"
      });
      return;
    }

    if (userHistory.monthlyRedeemed + option.scRequired > userHistory.monthlyLimit) {
      toast({
        title: "Monthly Limit Exceeded",
        description: `This redemption would exceed your monthly limit of ${userHistory.monthlyLimit} SC`,
        variant: "destructive"
      });
      return;
    }

    if (option.availability === 'out_of_stock') {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    if (option.redemptionLimit && userHistory.lifetimeRedemptions.filter(r => r.optionId === option.id && r.status === 'completed').length >= option.redemptionLimit) {
      toast({
        title: "Redemption Limit Reached",
        description: `You have reached the limit for this item (${option.redemptionLimit})`,
        variant: "destructive"
      });
      return;
    }

    setSelectedOption(option);
    setRedemptionAmount(option.scRequired.toString());
    setDeliveryEmail(user.email || '');
    setShowRedemptionDialog(true);
  };

  const confirmRedemption = async () => {
    if (!selectedOption || !user?.id || !userHistory || !agreeToTerms) return;

    try {
      setProcessing(true);

      // Create redemption request
      const request: RedemptionRequest = {
        id: `redemption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        optionId: selectedOption.id,
        scAmount: selectedOption.scRequired,
        cashValue: selectedOption.cashValue,
        status: 'pending',
        requestDate: new Date(),
        deliveryInfo: {
          type: selectedOption.isPhysical ? 'physical' : selectedOption.type === 'cash' ? 'paypal' : 'email',
          address: selectedOption.isPhysical ? deliveryAddress : deliveryEmail
        }
      };

      // Deduct Sweeps Coins
      await walletService.updateBalance(
        user.id,
        0, // No GC change
        -selectedOption.scRequired, // Deduct SC
        `Redemption: ${selectedOption.name}`,
        undefined,
        'redemption'
      );

      // Update user history
      const updatedHistory: UserRedemptionHistory = {
        ...userHistory,
        totalRedemptions: userHistory.totalRedemptions + 1,
        totalSCRedeemed: userHistory.totalSCRedeemed + selectedOption.scRequired,
        totalCashValue: userHistory.totalCashValue + (selectedOption.cashValue || 0),
        monthlyRedeemed: userHistory.monthlyRedeemed + selectedOption.scRequired,
        lifetimeRedemptions: [request, ...userHistory.lifetimeRedemptions]
      };

      setUserHistory(updatedHistory);
      saveUserHistory(updatedHistory);

      // Log to admin system
      await neonDatabaseService.logAdminAction(
        'system',
        'redemption_requested',
        user.id,
        'redemption',
        request.id,
        {
          optionName: selectedOption.name,
          scAmount: selectedOption.scRequired,
          cashValue: selectedOption.cashValue,
          deliveryType: request.deliveryInfo?.type
        },
        'info'
      );

      // Update wallet
      await loadWallet();

      toast({
        title: "Redemption Submitted! 🎉",
        description: `Your redemption for ${selectedOption.name} has been submitted and will be processed within ${selectedOption.deliveryTime}`,
      });

      // Simulate processing for instant items
      if (selectedOption.type === 'cash' || !selectedOption.isPhysical) {
        setTimeout(() => {
          simulateRedemptionProcessing(request.id);
        }, 3000);
      }

      setShowRedemptionDialog(false);
      setSelectedOption(null);
      setAgreeToTerms(false);

    } catch (error) {
      console.error('Failed to process redemption:', error);
      toast({
        title: "Redemption Failed",
        description: "Failed to process your redemption. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const simulateRedemptionProcessing = (requestId: string) => {
    if (!userHistory) return;

    const updatedHistory = {
      ...userHistory,
      lifetimeRedemptions: userHistory.lifetimeRedemptions.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'completed' as const,
              processedDate: new Date(),
              completedDate: new Date()
            }
          : req
      )
    };

    setUserHistory(updatedHistory);
    saveUserHistory(updatedHistory);

    toast({
      title: "Redemption Completed! ✅",
      description: "Your redemption has been processed successfully. Check your email for details.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-600', icon: Clock },
      approved: { color: 'bg-blue-600', icon: CheckCircle },
      processing: { color: 'bg-purple-600', icon: RefreshCw },
      completed: { color: 'bg-green-600', icon: CheckCircle },
      rejected: { color: 'bg-red-600', icon: AlertTriangle },
      cancelled: { color: 'bg-gray-600', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getAvailabilityBadge = (availability: string, stockLevel?: number) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-600">Available {stockLevel && `(${stockLevel})`}</Badge>;
      case 'limited':
        return <Badge className="bg-yellow-600">Limited Stock {stockLevel && `(${stockLevel})`}</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-600">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading redemption center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-gold-500 bg-clip-text text-transparent">
              Redemption Center
            </h1>
            <p className="text-muted-foreground">
              Redeem your Sweeps Coins for cash, gift cards, and amazing prizes
            </p>
          </div>
          
          {wallet && (
            <Card className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Gem className="w-6 h-6 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{wallet.sweepsCoins.toFixed(2)} SC</div>
                  <div className="text-sm text-muted-foreground">Available to Redeem</div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* User Stats */}
        {userHistory && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userHistory.totalRedemptions}</div>
                  <div className="text-sm text-muted-foreground">Total Redemptions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userHistory.totalSCRedeemed.toFixed(0)} SC</div>
                  <div className="text-sm text-muted-foreground">SC Redeemed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${userHistory.totalCashValue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Cash Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {userHistory.monthlyRedeemed}/{userHistory.monthlyLimit} SC
                  </div>
                  <div className="text-sm text-muted-foreground">Monthly Limit</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Monthly Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {((userHistory.monthlyRedeemed / userHistory.monthlyLimit) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={(userHistory.monthlyRedeemed / userHistory.monthlyLimit) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compliance Notice */}
        <Alert className="mb-6 border-blue-500 bg-blue-500/10">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Sweepstakes Compliance:</strong> Redemptions are processed according to sweepstakes regulations. 
            Cash redemptions require identity verification. No purchase necessary to participate or win.
            <Button variant="link" className="p-0 ml-2 h-auto text-blue-600" onClick={() => setShowTerms(true)}>
              View Terms & Conditions
            </Button>
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="redeem" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="redeem">Available Redemptions</TabsTrigger>
          <TabsTrigger value="history">My Redemptions</TabsTrigger>
        </TabsList>

        {/* Available Redemptions */}
        <TabsContent value="redeem" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search redemptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-4"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map(category => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category.id)}
                        className="whitespace-nowrap"
                        size="sm"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Redemption Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOptions.map(option => (
              <Card 
                key={option.id} 
                className={`
                  group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden
                  ${option.isFeatured ? 'ring-2 ring-gold-500/50' : ''}
                  ${option.availability === 'out_of_stock' ? 'opacity-50' : ''}
                `}
                onClick={() => option.availability !== 'out_of_stock' && handleRedemption(option)}
              >
                <div className="relative">
                  <img
                    src={option.image}
                    alt={option.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/redemption/placeholder.png';
                    }}
                  />
                  
                  {option.isFeatured && (
                    <Badge className="absolute top-2 left-2 bg-gold-600 text-black">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    {getAvailabilityBadge(option.availability, option.stockLevel)}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{option.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{option.description}</p>
                      {option.brand && (
                        <Badge variant="outline" className="mt-1 text-xs">{option.brand}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gem className="w-4 h-4 text-purple-500" />
                        <span className="font-bold text-lg">{option.scRequired} SC</span>
                      </div>
                      {option.cashValue && (
                        <div className="text-green-600 font-semibold">
                          ${option.cashValue.toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" />
                        Delivery: {option.deliveryTime}
                      </div>
                      {option.isPhysical && (
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Physical delivery required
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full" 
                      disabled={option.availability === 'out_of_stock' || !wallet || wallet.sweepsCoins < option.scRequired}
                    >
                      {option.availability === 'out_of_stock' ? 'Out of Stock' : 'Redeem Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOptions.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No redemptions found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter</p>
            </div>
          )}
        </TabsContent>

        {/* Redemption History */}
        <TabsContent value="history" className="space-y-6">
          {userHistory && userHistory.lifetimeRedemptions.length > 0 ? (
            <div className="space-y-4">
              {userHistory.lifetimeRedemptions.map(request => {
                const option = redemptionOptions.find(opt => opt.id === request.optionId);
                
                return (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <img
                            src={option?.image || '/redemption/placeholder.png'}
                            alt={option?.name || 'Redemption'}
                            className="w-16 h-16 object-cover rounded"
                          />
                          
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-semibold">{option?.name || 'Unknown Item'}</h3>
                              <p className="text-sm text-muted-foreground">{option?.description}</p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Gem className="w-3 h-3 text-purple-500" />
                                {request.scAmount} SC
                              </div>
                              {request.cashValue && (
                                <div className="text-green-600 font-semibold">
                                  ${request.cashValue.toFixed(2)}
                                </div>
                              )}
                              <div className="text-muted-foreground">
                                {request.requestDate.toLocaleDateString()}
                              </div>
                            </div>
                            
                            {request.deliveryInfo && (
                              <div className="text-xs text-muted-foreground">
                                Delivery: {request.deliveryInfo.type === 'physical' ? 'Physical address' : request.deliveryInfo.address}
                                {request.deliveryInfo.trackingNumber && (
                                  <div>Tracking: {request.deliveryInfo.trackingNumber}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {getStatusBadge(request.status)}
                          {request.status === 'completed' && request.completedDate && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Completed: {request.completedDate.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No redemptions yet</h3>
              <p className="text-muted-foreground mb-4">Start redeeming your Sweeps Coins for great rewards!</p>
              <Button onClick={() => setSelectedCategory('all')}>
                Browse Redemptions
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Redemption Confirmation Dialog */}
      <Dialog open={showRedemptionDialog} onOpenChange={setShowRedemptionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Please confirm your redemption details
            </DialogDescription>
          </DialogHeader>
          
          {selectedOption && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedOption.image}
                  alt={selectedOption.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{selectedOption.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedOption.description}</p>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Cost:</span>
                  <span className="font-bold">{selectedOption.scRequired} SC</span>
                </div>
                {selectedOption.cashValue && (
                  <div className="flex justify-between">
                    <span>Value:</span>
                    <span className="text-green-600 font-bold">${selectedOption.cashValue.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Time:</span>
                  <span>{selectedOption.deliveryTime}</span>
                </div>
              </div>
              
              {selectedOption.type === 'cash' || !selectedOption.isPhysical ? (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email for delivery"
                    value={deliveryEmail}
                    onChange={(e) => setDeliveryEmail(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <textarea
                    id="address"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Enter full delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
              )}
              
              {selectedOption.restrictions && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Restrictions:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {selectedOption.restrictions.map((restriction, index) => (
                        <li key={index} className="text-xs">{restriction}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-xs">
                  I agree to the <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setShowTerms(true)}>Terms & Conditions</Button> and understand that redemptions are final.
                </Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRedemptionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRedemption} 
              disabled={!agreeToTerms || processing || !deliveryEmail}
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Redemption'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Redemption Terms & Conditions</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold mb-2">1. Eligibility</h3>
                <p>Redemptions are available to verified users aged 18+ in eligible jurisdictions. Identity verification may be required for cash redemptions.</p>
              </section>
              
              <section>
                <h3 className="font-semibold mb-2">2. Sweeps Coins</h3>
                <p>Sweeps Coins have no cash value except when redeemed through official channels. Redemptions are final and cannot be reversed.</p>
              </section>
              
              <section>
                <h3 className="font-semibold mb-2">3. Processing Time</h3>
                <p>Processing times are estimates. Physical items may take longer due to shipping. Digital items are typically delivered within 24 hours.</p>
              </section>
              
              <section>
                <h3 className="font-semibold mb-2">4. Restrictions</h3>
                <p>Monthly redemption limits apply. Some items have lifetime limits. Availability is subject to change without notice.</p>
              </section>
              
              <section>
                <h3 className="font-semibold mb-2">5. No Purchase Necessary</h3>
                <p>No purchase is necessary to obtain Sweeps Coins or participate in redemptions. Alternative methods of entry are available.</p>
              </section>
              
              <section>
                <h3 className="font-semibold mb-2">6. Tax Responsibility</h3>
                <p>Winners are responsible for all applicable taxes. Tax forms may be required for redemptions over $600.</p>
              </section>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button onClick={() => setShowTerms(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
