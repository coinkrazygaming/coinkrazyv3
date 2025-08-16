import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Coins,
  Wallet,
  Shield,
  Activity,
  BarChart3,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  Loader2,
  Ban,
  UserCheck,
} from "lucide-react";

// Types
interface PaymentTransaction {
  id: string;
  transactionId: string;
  userId: string;
  userEmail: string;
  username: string;
  packageId?: string;
  packageName?: string;
  paymentMethod: string;
  amountUsd: number;
  processingFee: number;
  netAmount: number;
  coinsPurchased: number;
  bonusCoins: number;
  sweepsCoinsPurchased: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'disputed';
  providerTransactionId?: string;
  providerStatus?: string;
  failureReason?: string;
  initiatedAt: string;
  completedAt?: string;
  ipAddress?: string;
  country?: string;
}

interface UserWallet {
  userId: string;
  userEmail: string;
  username: string;
  goldCoins: number;
  sweepsCoins: number;
  bonusCoins: number;
  totalPurchasedUsd: number;
  totalCoinsWon: number;
  totalCoinsSpent: number;
  vipLevel: number;
  walletStatus: 'active' | 'suspended' | 'frozen' | 'closed';
  lastPurchaseAt?: string;
  lastActivityAt: string;
}

interface PaymentMethod {
  id: string;
  methodName: string;
  methodType: string;
  isEnabled: boolean;
  processingFeePercentage: number;
  processingFeeFixed: number;
  minAmount: number;
  maxAmount?: number;
  supportedCurrencies: string[];
}

interface PaymentAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalRevenue: number;
  totalFees: number;
  netRevenue: number;
  conversionRate: number;
  averageTransactionValue: number;
  topPaymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    transactions: number;
    revenue: number;
    successRate: number;
  }>;
}

interface BankingSettings {
  paypalSandboxMode: boolean;
  defaultCurrency: string;
  maxDailyPurchases: number;
  enablePurchaseLimits: boolean;
  autoFulfillPayments: boolean;
  minPurchaseAmount: number;
  maxPurchaseAmount: number;
  enableRefunds: boolean;
  requireKycForLargeTransactions: boolean;
}

export default function BankingPaymentsAdmin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  
  // State management
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [settings, setSettings] = useState<BankingSettings | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7d");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  
  // Modal states
  const [editTransactionModal, setEditTransactionModal] = useState<PaymentTransaction | null>(null);
  const [editWalletModal, setEditWalletModal] = useState<UserWallet | null>(null);
  const [editPaymentMethodModal, setEditPaymentMethodModal] = useState<PaymentMethod | null>(null);
  const [viewTransactionModal, setViewTransactionModal] = useState<PaymentTransaction | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTransactions(),
        loadWallets(),
        loadPaymentMethods(),
        loadAnalytics(),
        loadSettings(),
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load banking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    // Mock data - replace with actual API call
    const mockTransactions: PaymentTransaction[] = [
      {
        id: "1",
        transactionId: "TXN-001",
        userId: "user1",
        userEmail: "player1@example.com",
        username: "player1",
        packageId: "pkg1",
        packageName: "Starter Pack",
        paymentMethod: "PayPal",
        amountUsd: 9.99,
        processingFee: 0.62,
        netAmount: 9.37,
        coinsPurchased: 1000,
        bonusCoins: 100,
        sweepsCoinsPurchased: 0,
        status: "completed",
        providerTransactionId: "PAYPAL-TXN-123",
        initiatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        ipAddress: "192.168.1.1",
        country: "US",
      },
      {
        id: "2",
        transactionId: "TXN-002",
        userId: "user2",
        userEmail: "player2@example.com",
        username: "player2",
        packageId: "pkg2",
        packageName: "Value Pack",
        paymentMethod: "Stripe",
        amountUsd: 39.99,
        processingFee: 1.46,
        netAmount: 38.53,
        coinsPurchased: 5000,
        bonusCoins: 750,
        sweepsCoinsPurchased: 0,
        status: "failed",
        failureReason: "Insufficient funds",
        initiatedAt: new Date().toISOString(),
        ipAddress: "192.168.1.2",
        country: "CA",
      },
    ];
    setTransactions(mockTransactions);
  };

  const loadWallets = async () => {
    // Mock data - replace with actual API call
    const mockWallets: UserWallet[] = [
      {
        userId: "user1",
        userEmail: "player1@example.com",
        username: "player1",
        goldCoins: 5500,
        sweepsCoins: 25.5,
        bonusCoins: 200,
        totalPurchasedUsd: 149.97,
        totalCoinsWon: 1200,
        totalCoinsSpent: 800,
        vipLevel: 1,
        walletStatus: "active",
        lastPurchaseAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      },
    ];
    setWallets(mockWallets);
  };

  const loadPaymentMethods = async () => {
    // Mock data - replace with actual API call
    const mockMethods: PaymentMethod[] = [
      {
        id: "1",
        methodName: "PayPal",
        methodType: "paypal",
        isEnabled: true,
        processingFeePercentage: 3.49,
        processingFeeFixed: 0.49,
        minAmount: 1.00,
        maxAmount: 10000.00,
        supportedCurrencies: ["USD", "EUR", "GBP"],
      },
      {
        id: "2",
        methodName: "Stripe Card",
        methodType: "stripe",
        isEnabled: true,
        processingFeePercentage: 2.9,
        processingFeeFixed: 0.30,
        minAmount: 1.00,
        maxAmount: 10000.00,
        supportedCurrencies: ["USD"],
      },
    ];
    setPaymentMethods(mockMethods);
  };

  const loadAnalytics = async () => {
    // Mock data - replace with actual API call
    const mockAnalytics: PaymentAnalytics = {
      totalTransactions: 1245,
      successfulTransactions: 1156,
      failedTransactions: 89,
      totalRevenue: 45692.34,
      totalFees: 1523.45,
      netRevenue: 44168.89,
      conversionRate: 92.85,
      averageTransactionValue: 36.72,
      topPaymentMethods: [
        { method: "PayPal", count: 756, revenue: 28456.78, percentage: 62.3 },
        { method: "Stripe", count: 400, revenue: 17235.56, percentage: 37.7 },
      ],
      dailyStats: [
        { date: "2024-01-01", transactions: 45, revenue: 1567.89, successRate: 94.2 },
        { date: "2024-01-02", transactions: 52, revenue: 1823.45, successRate: 91.8 },
      ],
    };
    setAnalytics(mockAnalytics);
  };

  const loadSettings = async () => {
    // Mock data - replace with actual API call
    const mockSettings: BankingSettings = {
      paypalSandboxMode: true,
      defaultCurrency: "USD",
      maxDailyPurchases: 1000,
      enablePurchaseLimits: true,
      autoFulfillPayments: true,
      minPurchaseAmount: 1.00,
      maxPurchaseAmount: 10000.00,
      enableRefunds: true,
      requireKycForLargeTransactions: false,
    };
    setSettings(mockSettings);
  };

  const handleProcessRefund = async (transactionId: string, amount: number, reason: string) => {
    setLoading(true);
    try {
      // API call to process refund
      toast({
        title: "Refund Processed",
        description: `Refund of $${amount} has been initiated for transaction ${transactionId}`,
      });
      await loadTransactions(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAdjustment = async (userId: string, adjustment: {
    goldCoins?: number;
    sweepsCoins?: number;
    reason: string;
  }) => {
    setLoading(true);
    try {
      // API call to adjust wallet
      toast({
        title: "Wallet Adjusted",
        description: `Wallet adjustment applied for user ${userId}`,
      });
      await loadWallets(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (newSettings: Partial<BankingSettings>) => {
    setLoading(true);
    try {
      // API call to update settings
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      toast({
        title: "Settings Updated",
        description: "Banking settings have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      refunded: "bg-purple-100 text-purple-800",
      disputed: "bg-orange-100 text-orange-800",
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === "all" || tx.paymentMethod === paymentMethodFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Banking & Payments</h1>
          <p className="text-muted-foreground">
            Manage payment processing, user wallets, and financial settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadInitialData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Net: ${analytics.netRevenue.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.successfulTransactions} / {analytics.totalTransactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.averageTransactionValue}</div>
              <p className="text-xs text-muted-foreground">
                Per successful transaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Fees</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((analytics.totalFees / analytics.totalRevenue) * 100).toFixed(1)}% of revenue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {transactions.slice(0, 10).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{tx.username}</p>
                            <p className="text-sm text-muted-foreground">{tx.transactionId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${tx.amountUsd}</p>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Top Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.topPaymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{method.method}</p>
                        <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${method.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{method.percentage}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <Label htmlFor="search">Search Transactions</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by email, transaction ID, or username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="method-filter">Payment Method</Label>
                  <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.transactionId}</p>
                          <p className="text-sm text-muted-foreground">{tx.providerTransactionId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.username}</p>
                          <p className="text-sm text-muted-foreground">{tx.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.packageName || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.coinsPurchased.toLocaleString()} + {tx.bonusCoins} bonus
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{tx.paymentMethod}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${tx.amountUsd}</p>
                          <p className="text-sm text-muted-foreground">
                            Net: ${tx.netAmount.toFixed(2)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{new Date(tx.initiatedAt).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.initiatedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewTransactionModal(tx)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {tx.status === "completed" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ArrowDownRight className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Process Refund</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to refund ${tx.amountUsd} for transaction {tx.transactionId}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleProcessRefund(tx.transactionId, tx.amountUsd, "Admin refund")}
                                  >
                                    Process Refund
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Gold Coins</TableHead>
                    <TableHead>Sweeps Coins</TableHead>
                    <TableHead>Total Purchased</TableHead>
                    <TableHead>VIP Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet) => (
                    <TableRow key={wallet.userId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{wallet.username}</p>
                          <p className="text-sm text-muted-foreground">{wallet.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{wallet.goldCoins.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            +{wallet.bonusCoins} bonus
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{wallet.sweepsCoins}</TableCell>
                      <TableCell>${wallet.totalPurchasedUsd.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {wallet.vipLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          wallet.walletStatus === 'active' ? 'bg-green-100 text-green-800' :
                          wallet.walletStatus === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {wallet.walletStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditWalletModal(wallet)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Activity className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Payment Methods</h3>
            <Button onClick={() => setEditPaymentMethodModal({
              id: "",
              methodName: "",
              methodType: "paypal",
              isEnabled: true,
              processingFeePercentage: 0,
              processingFeeFixed: 0,
              minAmount: 1,
              supportedCurrencies: ["USD"],
            })}>
              <Plus className="w-4 h-4 mr-2" />
              Add Method
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{method.methodName}</CardTitle>
                    <Switch
                      checked={method.isEnabled}
                      onCheckedChange={(checked) => {
                        // Update method status
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Type:</span> {method.methodType}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Fee:</span> {method.processingFeePercentage}% + ${method.processingFeeFixed}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Limits:</span> ${method.minAmount} - ${method.maxAmount?.toLocaleString() || "∞"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Currencies:</span> {method.supportedCurrencies.join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditPaymentMethodModal(method)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Chart component would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Chart component would go here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle>Banking Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sandbox-mode">PayPal Sandbox Mode</Label>
                      <Switch
                        id="sandbox-mode"
                        checked={settings.paypalSandboxMode}
                        onCheckedChange={(checked) =>
                          handleSettingsUpdate({ paypalSandboxMode: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-fulfill">Auto-fulfill Payments</Label>
                      <Switch
                        id="auto-fulfill"
                        checked={settings.autoFulfillPayments}
                        onCheckedChange={(checked) =>
                          handleSettingsUpdate({ autoFulfillPayments: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="purchase-limits">Enable Purchase Limits</Label>
                      <Switch
                        id="purchase-limits"
                        checked={settings.enablePurchaseLimits}
                        onCheckedChange={(checked) =>
                          handleSettingsUpdate({ enablePurchaseLimits: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-refunds">Enable Refunds</Label>
                      <Switch
                        id="enable-refunds"
                        checked={settings.enableRefunds}
                        onCheckedChange={(checked) =>
                          handleSettingsUpdate({ enableRefunds: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="min-amount">Minimum Purchase Amount</Label>
                      <Input
                        id="min-amount"
                        type="number"
                        value={settings.minPurchaseAmount}
                        onChange={(e) =>
                          handleSettingsUpdate({ minPurchaseAmount: parseFloat(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="max-amount">Maximum Purchase Amount</Label>
                      <Input
                        id="max-amount"
                        type="number"
                        value={settings.maxPurchaseAmount}
                        onChange={(e) =>
                          handleSettingsUpdate({ maxPurchaseAmount: parseFloat(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="daily-limit">Default Daily Purchase Limit</Label>
                      <Input
                        id="daily-limit"
                        type="number"
                        value={settings.maxDailyPurchases}
                        onChange={(e) =>
                          handleSettingsUpdate({ maxDailyPurchases: parseFloat(e.target.value) })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select
                        value={settings.defaultCurrency}
                        onValueChange={(value) =>
                          handleSettingsUpdate({ defaultCurrency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSettingsUpdate({})}>
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Transaction Details Modal */}
      {viewTransactionModal && (
        <Dialog open={!!viewTransactionModal} onOpenChange={() => setViewTransactionModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Full details for transaction {viewTransactionModal.transactionId}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Transaction ID</Label>
                <p className="font-mono text-sm">{viewTransactionModal.transactionId}</p>
              </div>
              <div>
                <Label>Provider ID</Label>
                <p className="font-mono text-sm">{viewTransactionModal.providerTransactionId || "N/A"}</p>
              </div>
              <div>
                <Label>User</Label>
                <p>{viewTransactionModal.username} ({viewTransactionModal.userEmail})</p>
              </div>
              <div>
                <Label>Package</Label>
                <p>{viewTransactionModal.packageName || "N/A"}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p>${viewTransactionModal.amountUsd} (Net: ${viewTransactionModal.netAmount})</p>
              </div>
              <div>
                <Label>Payment Method</Label>
                <p>{viewTransactionModal.paymentMethod}</p>
              </div>
              <div>
                <Label>Coins</Label>
                <p>{viewTransactionModal.coinsPurchased.toLocaleString()} + {viewTransactionModal.bonusCoins} bonus</p>
              </div>
              <div>
                <Label>Status</Label>
                <div>{getStatusBadge(viewTransactionModal.status)}</div>
              </div>
              <div>
                <Label>Initiated</Label>
                <p>{new Date(viewTransactionModal.initiatedAt).toLocaleString()}</p>
              </div>
              <div>
                <Label>Completed</Label>
                <p>{viewTransactionModal.completedAt ? new Date(viewTransactionModal.completedAt).toLocaleString() : "N/A"}</p>
              </div>
            </div>
            {viewTransactionModal.failureReason && (
              <div>
                <Label>Failure Reason</Label>
                <p className="text-red-600">{viewTransactionModal.failureReason}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
