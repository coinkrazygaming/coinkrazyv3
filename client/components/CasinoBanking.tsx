import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Wallet,
  DollarSign,
  Bitcoin,
  Settings,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Users,
  Globe,
  Lock,
  Unlock,
  Bell,
  Filter,
  Search,
  Calendar,
  FileText,
  BarChart3,
  Banknote,
  Coins,
  Crown,
} from "lucide-react";

export interface PaymentMethod {
  id: string;
  name: string;
  type: "credit_card" | "crypto" | "bank_transfer" | "e_wallet" | "cash";
  status: "active" | "disabled" | "maintenance";
  provider: string;
  fees: {
    deposit: number;
    withdrawal: number;
    processing: number;
  };
  limits: {
    minDeposit: number;
    maxDeposit: number;
    minWithdrawal: number;
    maxWithdrawal: number;
    dailyLimit: number;
  };
  processingTime: {
    deposit: string;
    withdrawal: string;
  };
  currencies: string[];
  regions: string[];
  configuration: Record<string, any>;
  statistics: {
    transactions: number;
    volume: number;
    successRate: number;
    averageAmount: number;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: "deposit" | "withdrawal" | "payout";
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  timestamp: Date;
  reference: string;
  fees: number;
  notes?: string;
}

export interface BankingSettings {
  autoApproval: {
    deposits: { enabled: boolean; maxAmount: number };
    withdrawals: { enabled: boolean; maxAmount: number };
  };
  verification: {
    requireKYC: boolean;
    kycLevel: "basic" | "enhanced" | "complete";
    requireDocuments: boolean;
  };
  fraud: {
    enabled: boolean;
    riskThreshold: number;
    blockedCountries: string[];
    velocityChecks: boolean;
  };
  notifications: {
    largeTransactions: { enabled: boolean; threshold: number };
    failedTransactions: { enabled: boolean };
    chargebacks: { enabled: boolean };
  };
  compliance: {
    amlEnabled: boolean;
    sanctionsChecking: boolean;
    reportingThreshold: number;
    recordRetention: number;
  };
}

export default function CasinoBanking() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankingSettings, setBankingSettings] =
    useState<BankingSettings | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("methods");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadBankingData();
  }, []);

  const loadBankingData = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: "visa-mastercard",
        name: "Visa/Mastercard",
        type: "credit_card",
        status: "active",
        provider: "Stripe",
        fees: { deposit: 2.9, withdrawal: 3.5, processing: 0.3 },
        limits: {
          minDeposit: 10,
          maxDeposit: 5000,
          minWithdrawal: 20,
          maxWithdrawal: 2000,
          dailyLimit: 10000,
        },
        processingTime: { deposit: "Instant", withdrawal: "1-3 business days" },
        currencies: ["USD", "EUR", "GBP", "CAD"],
        regions: ["US", "CA", "UK", "EU"],
        configuration: {
          merchantId: "acct_1234567890",
          webhook: "https://api.coinkrazy.com/webhooks/stripe",
          threeDSecure: true,
        },
        statistics: {
          transactions: 45678,
          volume: 2847563.89,
          successRate: 94.7,
          averageAmount: 234.56,
        },
      },
      {
        id: "bitcoin",
        name: "Bitcoin",
        type: "crypto",
        status: "active",
        provider: "BitPay",
        fees: { deposit: 1.0, withdrawal: 0.5, processing: 0 },
        limits: {
          minDeposit: 25,
          maxDeposit: 10000,
          minWithdrawal: 50,
          maxWithdrawal: 5000,
          dailyLimit: 25000,
        },
        processingTime: {
          deposit: "1-6 confirmations",
          withdrawal: "1-2 hours",
        },
        currencies: ["BTC", "USD"],
        regions: ["Global"],
        configuration: {
          walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          apiKey: "btc_live_abc123def456",
          confirmations: 3,
        },
        statistics: {
          transactions: 12345,
          volume: 897234.56,
          successRate: 98.2,
          averageAmount: 567.89,
        },
      },
      {
        id: "ethereum",
        name: "Ethereum",
        type: "crypto",
        status: "active",
        provider: "Web3",
        fees: { deposit: 0.8, withdrawal: 0.3, processing: 0 },
        limits: {
          minDeposit: 20,
          maxDeposit: 8000,
          minWithdrawal: 40,
          maxWithdrawal: 4000,
          dailyLimit: 20000,
        },
        processingTime: {
          deposit: "12-35 confirmations",
          withdrawal: "30 minutes",
        },
        currencies: ["ETH", "USDT", "USDC"],
        regions: ["Global"],
        configuration: {
          contractAddress: "0x742d35Cc6634C0532925a3b8D",
          gasLimit: 21000,
          chainId: 1,
        },
        statistics: {
          transactions: 8934,
          volume: 654321.98,
          successRate: 97.8,
          averageAmount: 432.1,
        },
      },
      {
        id: "paypal",
        name: "PayPal",
        type: "e_wallet",
        status: "active",
        provider: "PayPal",
        fees: { deposit: 3.5, withdrawal: 2.9, processing: 0.49 },
        limits: {
          minDeposit: 15,
          maxDeposit: 3000,
          minWithdrawal: 25,
          maxWithdrawal: 1500,
          dailyLimit: 5000,
        },
        processingTime: { deposit: "Instant", withdrawal: "24-48 hours" },
        currencies: ["USD", "EUR", "GBP"],
        regions: ["US", "CA", "UK", "EU"],
        configuration: {
          clientId: "AXWtj2iF8H4a4bdDE0",
          clientSecret: "EHl8h3F2dKn7mN9q",
          mode: "live",
        },
        statistics: {
          transactions: 23456,
          volume: 456789.34,
          successRate: 92.4,
          averageAmount: 189.45,
        },
      },
      {
        id: "bank-wire",
        name: "Bank Wire Transfer",
        type: "bank_transfer",
        status: "active",
        provider: "SWIFT",
        fees: { deposit: 0, withdrawal: 25, processing: 15 },
        limits: {
          minDeposit: 500,
          maxDeposit: 50000,
          minWithdrawal: 1000,
          maxWithdrawal: 25000,
          dailyLimit: 100000,
        },
        processingTime: {
          deposit: "3-5 business days",
          withdrawal: "5-7 business days",
        },
        currencies: ["USD", "EUR"],
        regions: ["US", "EU"],
        configuration: {
          routingNumber: "021000021",
          accountNumber: "1234567890",
          swiftCode: "CHASUS33",
        },
        statistics: {
          transactions: 2345,
          volume: 1234567.89,
          successRate: 99.1,
          averageAmount: 2456.78,
        },
      },
    ];

    const mockTransactions: Transaction[] = [
      {
        id: "txn_001",
        userId: "user_123",
        userName: "John Smith",
        type: "deposit",
        amount: 250.0,
        currency: "USD",
        paymentMethod: "Visa",
        status: "completed",
        timestamp: new Date("2024-01-15T10:30:00"),
        reference: "ch_3OkLxX2eZvKYlo2C0gBzC3Mj",
        fees: 7.55,
      },
      {
        id: "txn_002",
        userId: "user_456",
        userName: "Sarah Johnson",
        type: "withdrawal",
        amount: 500.0,
        currency: "USD",
        paymentMethod: "PayPal",
        status: "pending",
        timestamp: new Date("2024-01-15T09:15:00"),
        reference: "wd_3OkLxX2eZvKYlo2C0gBzC3Mk",
        fees: 14.5,
      },
      {
        id: "txn_003",
        userId: "user_789",
        userName: "Mike Davis",
        type: "deposit",
        amount: 1000.0,
        currency: "BTC",
        paymentMethod: "Bitcoin",
        status: "processing",
        timestamp: new Date("2024-01-15T08:45:00"),
        reference: "btc_3OkLxX2eZvKYlo2C0gBzC3Ml",
        fees: 10.0,
      },
      {
        id: "txn_004",
        userId: "user_234",
        userName: "Lisa Wilson",
        type: "payout",
        amount: 1250.0,
        currency: "USD",
        paymentMethod: "Bank Wire",
        status: "completed",
        timestamp: new Date("2024-01-15T07:20:00"),
        reference: "po_3OkLxX2eZvKYlo2C0gBzC3Mm",
        fees: 25.0,
      },
      {
        id: "txn_005",
        userId: "user_567",
        userName: "Tom Brown",
        type: "deposit",
        amount: 75.0,
        currency: "USD",
        paymentMethod: "Mastercard",
        status: "failed",
        timestamp: new Date("2024-01-15T06:10:00"),
        reference: "ch_3OkLxX2eZvKYlo2C0gBzC3Mn",
        fees: 0,
        notes: "Insufficient funds",
      },
    ];

    const mockBankingSettings: BankingSettings = {
      autoApproval: {
        deposits: { enabled: true, maxAmount: 1000 },
        withdrawals: { enabled: false, maxAmount: 500 },
      },
      verification: {
        requireKYC: true,
        kycLevel: "enhanced",
        requireDocuments: true,
      },
      fraud: {
        enabled: true,
        riskThreshold: 75,
        blockedCountries: ["CN", "RU", "KP"],
        velocityChecks: true,
      },
      notifications: {
        largeTransactions: { enabled: true, threshold: 5000 },
        failedTransactions: { enabled: true },
        chargebacks: { enabled: true },
      },
      compliance: {
        amlEnabled: true,
        sanctionsChecking: true,
        reportingThreshold: 10000,
        recordRetention: 7,
      },
    };

    setPaymentMethods(mockPaymentMethods);
    setTransactions(mockTransactions);
    setBankingSettings(mockBankingSettings);
    setIsLoading(false);
  };

  const updatePaymentMethod = (
    methodId: string,
    updates: Partial<PaymentMethod>,
  ) => {
    setPaymentMethods((methods) =>
      methods.map((method) =>
        method.id === methodId ? { ...method, ...updates } : method,
      ),
    );
  };

  const updateBankingSettings = (updates: Partial<BankingSettings>) => {
    setBankingSettings((current) =>
      current ? { ...current, ...updates } : null,
    );
  };

  const processTransaction = (
    transactionId: string,
    action: "approve" | "reject",
  ) => {
    setTransactions((transactions) =>
      transactions.map((txn) =>
        txn.id === transactionId
          ? { ...txn, status: action === "approve" ? "completed" : "failed" }
          : txn,
      ),
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "disabled":
      case "maintenance":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return "bg-green-500";
      case "pending":
      case "processing":
        return "bg-yellow-500";
      case "failed":
      case "cancelled":
        return "bg-red-500";
      case "disabled":
      case "maintenance":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || txn.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading banking system...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Casino Banking & Payments</h1>
          <p className="text-muted-foreground">
            Manage payment methods, transactions, and banking settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-green-500 hover:bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(
                    paymentMethods.reduce(
                      (sum, method) => sum + method.statistics.volume,
                      0,
                    ),
                  )}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Methods</p>
                <p className="text-2xl font-bold text-blue-500">
                  {paymentMethods.filter((m) => m.status === "active").length}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Transactions
                </p>
                <p className="text-2xl font-bold text-yellow-500">
                  {transactions.filter((t) => t.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-purple-500">
                  {(
                    paymentMethods.reduce(
                      (sum, method) => sum + method.statistics.successRate,
                      0,
                    ) / paymentMethods.length || 0
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="methods">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <BarChart3 className="w-4 h-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Methods List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedMethod?.id === method.id
                            ? "border-blue-500 bg-blue-50/50"
                            : ""
                        }`}
                        onClick={() => setSelectedMethod(method)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {method.name[0]}
                            </div>
                            <div>
                              <h3 className="font-semibold">{method.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {method.provider}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(method.status)}>
                              {method.status}
                            </Badge>
                            {getStatusIcon(method.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Volume
                            </span>
                            <div className="font-bold text-green-500">
                              {formatCurrency(method.statistics.volume)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Transactions
                            </span>
                            <div className="font-bold">
                              {formatNumber(method.statistics.transactions)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Success Rate
                            </span>
                            <div className="font-bold text-blue-500">
                              {method.statistics.successRate}%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Avg Amount
                            </span>
                            <div className="font-bold">
                              {formatCurrency(method.statistics.averageAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Method Details */}
            <div>
              {selectedMethod ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedMethod.name}
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <select
                        value={selectedMethod.status}
                        onChange={(e) =>
                          updatePaymentMethod(selectedMethod.id, {
                            status: e.target.value as any,
                          })
                        }
                        className="w-full mt-1 p-2 border rounded"
                      >
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Deposit Fee (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={selectedMethod.fees.deposit}
                        onChange={(e) =>
                          updatePaymentMethod(selectedMethod.id, {
                            fees: {
                              ...selectedMethod.fees,
                              deposit: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Withdrawal Fee (%)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={selectedMethod.fees.withdrawal}
                        onChange={(e) =>
                          updatePaymentMethod(selectedMethod.id, {
                            fees: {
                              ...selectedMethod.fees,
                              withdrawal: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Deposit Limits
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={selectedMethod.limits.minDeposit}
                          onChange={(e) =>
                            updatePaymentMethod(selectedMethod.id, {
                              limits: {
                                ...selectedMethod.limits,
                                minDeposit: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={selectedMethod.limits.maxDeposit}
                          onChange={(e) =>
                            updatePaymentMethod(selectedMethod.id, {
                              limits: {
                                ...selectedMethod.limits,
                                maxDeposit: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Supported Currencies
                      </label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedMethod.currencies.map((currency) => (
                          <Badge key={currency} variant="outline">
                            {currency}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Processing Time
                      </label>
                      <div className="text-sm text-muted-foreground mt-1">
                        <div>
                          Deposit: {selectedMethod.processingTime.deposit}
                        </div>
                        <div>
                          Withdrawal: {selectedMethod.processingTime.withdrawal}
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">Save Changes</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                    Select a payment method to view details
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Method</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b hover:bg-muted/20"
                      >
                        <td className="p-3">
                          <div>
                            <div className="font-medium">
                              {transaction.userName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {transaction.userId}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {transaction.type === "deposit" ? (
                              <ArrowUpRight className="w-4 h-4 text-green-500" />
                            ) : transaction.type === "withdrawal" ? (
                              <ArrowDownLeft className="w-4 h-4 text-red-500" />
                            ) : (
                              <Coins className="w-4 h-4 text-gold-500" />
                            )}
                            <span className="capitalize">
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold">
                            {formatCurrency(transaction.amount)}
                          </div>
                          {transaction.fees > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Fee: {formatCurrency(transaction.fees)}
                            </div>
                          )}
                        </td>
                        <td className="p-3">{transaction.paymentMethod}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transaction.status)}
                            <Badge
                              className={getStatusColor(transaction.status)}
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            {transaction.timestamp.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.timestamp.toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {transaction.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    processTransaction(
                                      transaction.id,
                                      "approve",
                                    )
                                  }
                                  className="text-green-600 border-green-600"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    processTransaction(transaction.id, "reject")
                                  }
                                  className="text-red-600 border-red-600"
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          {bankingSettings && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Approval Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-medium">
                        Auto-approve Deposits
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateBankingSettings({
                            autoApproval: {
                              ...bankingSettings.autoApproval,
                              deposits: {
                                ...bankingSettings.autoApproval.deposits,
                                enabled:
                                  !bankingSettings.autoApproval.deposits
                                    .enabled,
                              },
                            },
                          })
                        }
                      >
                        {bankingSettings.autoApproval.deposits.enabled ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <Input
                      type="number"
                      placeholder="Max amount"
                      value={bankingSettings.autoApproval.deposits.maxAmount}
                      onChange={(e) =>
                        updateBankingSettings({
                          autoApproval: {
                            ...bankingSettings.autoApproval,
                            deposits: {
                              ...bankingSettings.autoApproval.deposits,
                              maxAmount: parseFloat(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      disabled={!bankingSettings.autoApproval.deposits.enabled}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-medium">
                        Auto-approve Withdrawals
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateBankingSettings({
                            autoApproval: {
                              ...bankingSettings.autoApproval,
                              withdrawals: {
                                ...bankingSettings.autoApproval.withdrawals,
                                enabled:
                                  !bankingSettings.autoApproval.withdrawals
                                    .enabled,
                              },
                            },
                          })
                        }
                      >
                        {bankingSettings.autoApproval.withdrawals.enabled ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <Input
                      type="number"
                      placeholder="Max amount"
                      value={bankingSettings.autoApproval.withdrawals.maxAmount}
                      onChange={(e) =>
                        updateBankingSettings({
                          autoApproval: {
                            ...bankingSettings.autoApproval,
                            withdrawals: {
                              ...bankingSettings.autoApproval.withdrawals,
                              maxAmount: parseFloat(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      disabled={
                        !bankingSettings.autoApproval.withdrawals.enabled
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verification Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-medium">Require KYC</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateBankingSettings({
                          verification: {
                            ...bankingSettings.verification,
                            requireKYC:
                              !bankingSettings.verification.requireKYC,
                          },
                        })
                      }
                    >
                      {bankingSettings.verification.requireKYC ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </Button>
                  </div>

                  <div>
                    <label className="font-medium">KYC Level</label>
                    <select
                      value={bankingSettings.verification.kycLevel}
                      onChange={(e) =>
                        updateBankingSettings({
                          verification: {
                            ...bankingSettings.verification,
                            kycLevel: e.target.value as any,
                          },
                        })
                      }
                      className="w-full mt-1 p-2 border rounded"
                    >
                      <option value="basic">Basic</option>
                      <option value="enhanced">Enhanced</option>
                      <option value="complete">Complete</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="font-medium">Require Documents</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateBankingSettings({
                          verification: {
                            ...bankingSettings.verification,
                            requireDocuments:
                              !bankingSettings.verification.requireDocuments,
                          },
                        })
                      }
                    >
                      {bankingSettings.verification.requireDocuments ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fraud Prevention</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-medium">
                      Enable Fraud Detection
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateBankingSettings({
                          fraud: {
                            ...bankingSettings.fraud,
                            enabled: !bankingSettings.fraud.enabled,
                          },
                        })
                      }
                    >
                      {bankingSettings.fraud.enabled ? (
                        <Shield className="w-4 h-4 text-green-500" />
                      ) : (
                        <Shield className="w-4 h-4 text-red-500" />
                      )}
                    </Button>
                  </div>

                  <div>
                    <label className="font-medium">Risk Threshold</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={bankingSettings.fraud.riskThreshold}
                      onChange={(e) =>
                        updateBankingSettings({
                          fraud: {
                            ...bankingSettings.fraud,
                            riskThreshold: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="font-medium">Velocity Checks</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateBankingSettings({
                          fraud: {
                            ...bankingSettings.fraud,
                            velocityChecks:
                              !bankingSettings.fraud.velocityChecks,
                          },
                        })
                      }
                    >
                      {bankingSettings.fraud.velocityChecks ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-medium">AML Monitoring</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateBankingSettings({
                          compliance: {
                            ...bankingSettings.compliance,
                            amlEnabled: !bankingSettings.compliance.amlEnabled,
                          },
                        })
                      }
                    >
                      {bankingSettings.compliance.amlEnabled ? (
                        <Shield className="w-4 h-4 text-green-500" />
                      ) : (
                        <Shield className="w-4 h-4 text-red-500" />
                      )}
                    </Button>
                  </div>

                  <div>
                    <label className="font-medium">Reporting Threshold</label>
                    <Input
                      type="number"
                      value={bankingSettings.compliance.reportingThreshold}
                      onChange={(e) =>
                        updateBankingSettings({
                          compliance: {
                            ...bankingSettings.compliance,
                            reportingThreshold: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="font-medium">
                      Record Retention (years)
                    </label>
                    <Input
                      type="number"
                      value={bankingSettings.compliance.recordRetention}
                      onChange={(e) =>
                        updateBankingSettings({
                          compliance: {
                            ...bankingSettings.compliance,
                            recordRetention: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="font-medium">Report Type</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>Transaction Summary</option>
                    <option>Payment Method Performance</option>
                    <option>Compliance Report</option>
                    <option>Revenue Analysis</option>
                    <option>Fraud Detection Report</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium">Date Range</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input type="date" />
                    <Input type="date" />
                  </div>
                </div>

                <div>
                  <label className="font-medium">Format</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                  </select>
                </div>

                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      name: "January Transaction Summary",
                      date: "2024-02-01",
                      status: "Ready",
                    },
                    {
                      name: "Payment Method Performance Q4",
                      date: "2024-01-15",
                      status: "Ready",
                    },
                    {
                      name: "Compliance Report December",
                      date: "2024-01-01",
                      status: "Ready",
                    },
                    {
                      name: "Revenue Analysis 2023",
                      date: "2023-12-31",
                      status: "Ready",
                    },
                  ].map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">{report.status}</Badge>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
