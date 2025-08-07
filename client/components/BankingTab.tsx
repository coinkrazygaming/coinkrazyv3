import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Wallet,
  CreditCard,
  Bank,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Settings,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Lock,
  Unlock,
  Star,
  Crown,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { walletService } from '../services/walletService';
import { useToast } from '@/hooks/use-toast';

interface BankAccount {
  id: string;
  type: 'checking' | 'savings' | 'crypto' | 'paypal' | 'googlepay';
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  isVerified: boolean;
  isDefault: boolean;
  isActive: boolean;
  balance: number;
  currency: 'USD' | 'BTC' | 'ETH';
  lastUpdated: Date;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'expired';
  monthlyLimit: number;
  dailyLimit: number;
  usedMonthly: number;
  usedDaily: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'purchase' | 'refund';
  amount: number;
  currency: 'USD' | 'GC' | 'SC' | 'BTC' | 'ETH';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  fromAccount?: string;
  toAccount?: string;
  fee: number;
  timestamp: Date;
  confirmations?: number;
  reference: string;
}

interface LiveRates {
  USD: number;
  BTC: number;
  ETH: number;
  lastUpdated: Date;
}

interface AccountAnalytics {
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  averageTransactionSize: number;
  monthlyVolume: number;
  profitLoss: number;
  riskScore: number;
}

export default function BankingTab() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: 'acc_001',
      type: 'checking',
      bankName: 'Chase Bank',
      accountName: 'Primary Checking',
      accountNumber: '****1234',
      routingNumber: '021000021',
      isVerified: true,
      isDefault: true,
      isActive: true,
      balance: 2500.75,
      currency: 'USD',
      lastUpdated: new Date(),
      verificationStatus: 'verified',
      monthlyLimit: 10000,
      dailyLimit: 2500,
      usedMonthly: 1200,
      usedDaily: 0
    },
    {
      id: 'acc_002',
      type: 'paypal',
      bankName: 'PayPal',
      accountName: 'PayPal Wallet',
      accountNumber: 'player@example.com',
      isVerified: true,
      isDefault: false,
      isActive: true,
      balance: 450.00,
      currency: 'USD',
      lastUpdated: new Date(),
      verificationStatus: 'verified',
      monthlyLimit: 5000,
      dailyLimit: 1000,
      usedMonthly: 200,
      usedDaily: 0
    },
    {
      id: 'acc_003',
      type: 'crypto',
      bankName: 'Bitcoin Wallet',
      accountName: 'BTC Wallet',
      accountNumber: '1A1zP1...eP2sh41',
      isVerified: false,
      isDefault: false,
      isActive: true,
      balance: 0.0235,
      currency: 'BTC',
      lastUpdated: new Date(),
      verificationStatus: 'pending',
      monthlyLimit: 100000,
      dailyLimit: 10000,
      usedMonthly: 500,
      usedDaily: 0
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx_001',
      type: 'deposit',
      amount: 100,
      currency: 'USD',
      status: 'completed',
      description: 'Gold Coin Purchase',
      fromAccount: 'acc_001',
      fee: 0,
      timestamp: new Date(Date.now() - 3600000),
      reference: 'TXN_001'
    },
    {
      id: 'tx_002',
      type: 'withdrawal',
      amount: 25.50,
      currency: 'USD',
      status: 'pending',
      description: 'Sweep Coin Redemption',
      toAccount: 'acc_001',
      fee: 2.50,
      timestamp: new Date(Date.now() - 1800000),
      reference: 'TXN_002'
    },
    {
      id: 'tx_003',
      type: 'purchase',
      amount: 50,
      currency: 'USD',
      status: 'completed',
      description: 'VIP Subscription',
      fromAccount: 'acc_002',
      fee: 0,
      timestamp: new Date(Date.now() - 86400000),
      reference: 'TXN_003'
    }
  ]);

  const [liveRates, setLiveRates] = useState<LiveRates>({
    USD: 1,
    BTC: 42500.75,
    ETH: 2650.25,
    lastUpdated: new Date()
  });

  const [analytics, setAnalytics] = useState<AccountAnalytics>({
    totalBalance: 2950.75,
    totalDeposits: 1250.00,
    totalWithdrawals: 325.50,
    averageTransactionSize: 58.50,
    monthlyVolume: 1575.50,
    profitLoss: 924.50,
    riskScore: 2.1
  });

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>('acc_001');
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshLiveRates();
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const refreshLiveRates = async () => {
    try {
      setRefreshing(true);
      
      // Simulate API call to get live rates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLiveRates({
        USD: 1,
        BTC: 42500.75 + (Math.random() - 0.5) * 1000,
        ETH: 2650.25 + (Math.random() - 0.5) * 100,
        lastUpdated: new Date()
      });
      
      // Update account balances
      setAccounts(prev => prev.map(acc => ({
        ...acc,
        lastUpdated: new Date(),
        balance: acc.balance + (Math.random() - 0.5) * 10
      })));
      
    } catch (error) {
      console.error('Failed to refresh rates:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const setDefaultAccount = (accountId: string) => {
    setAccounts(accounts.map(acc => ({
      ...acc,
      isDefault: acc.id === accountId
    })));
    
    toast({
      title: "Default Account Updated",
      description: "Your default account has been changed successfully",
    });
  };

  const toggleAccountStatus = (accountId: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, isActive: !acc.isActive } : acc
    ));
  };

  const initiateWithdrawal = (amount: number, currency: string) => {
    const selectedAcc = accounts.find(acc => acc.id === selectedAccount);
    if (!selectedAcc) return;

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'withdrawal',
      amount,
      currency: currency as any,
      status: 'pending',
      description: `Withdrawal to ${selectedAcc.accountName}`,
      toAccount: selectedAccount,
      fee: amount * 0.025, // 2.5% fee
      timestamp: new Date(),
      reference: `WTH_${Date.now()}`
    };

    setTransactions([newTransaction, ...transactions]);
    
    toast({
      title: "Withdrawal Initiated",
      description: `Your withdrawal of $${amount} is being processed`,
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'BTC') {
      return `₿${amount.toFixed(8)}`;
    } else if (currency === 'ETH') {
      return `Ξ${amount.toFixed(6)}`;
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
      case 'savings':
        return <Bank className="w-5 h-5" />;
      case 'paypal':
        return <Wallet className="w-5 h-5" />;
      case 'googlepay':
        return <CreditCard className="w-5 h-5" />;
      case 'crypto':
        return <DollarSign className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
      case 'expired':
        return 'text-red-500';
      case 'cancelled':
        return 'text-gray-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'transfer':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'purchase':
        return <Minus className="w-4 h-4 text-purple-500" />;
      case 'refund':
        return <Plus className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const calculateUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Banking & Accounts</h3>
          <p className="text-muted-foreground">Manage your payment methods and account balances</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshLiveRates}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsAddingAccount(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Live Rates Card */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Live Exchange Rates
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label className="text-sm">Auto-refresh</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(liveRates.USD, 'USD')}
              </div>
              <div className="text-sm text-muted-foreground">USD</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {formatCurrency(liveRates.BTC, 'USD')}
              </div>
              <div className="text-sm text-muted-foreground">BTC</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {formatCurrency(liveRates.ETH, 'USD')}
              </div>
              <div className="text-sm text-muted-foreground">ETH</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-3 text-center">
            Last updated: {liveRates.lastUpdated.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className={`relative ${!account.isActive ? 'opacity-60' : ''}`}>
                {account.isDefault && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-gold-500 text-black">Default</Badge>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getAccountIcon(account.type)}
                      <div>
                        <CardTitle className="text-lg">{account.accountName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{account.bankName}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={account.verificationStatus === 'verified' ? 'default' : 'secondary'}
                      className={getStatusColor(account.verificationStatus)}
                    >
                      {account.verificationStatus}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Balance:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBalanceVisible(!balanceVisible)}
                      >
                        {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="text-2xl font-bold">
                      {balanceVisible 
                        ? formatCurrency(account.balance, account.currency)
                        : '••••••'
                      }
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Usage:</span>
                      <span>{formatCurrency(account.usedDaily, 'USD')} / {formatCurrency(account.dailyLimit, 'USD')}</span>
                    </div>
                    <Progress value={calculateUsagePercentage(account.usedDaily, account.dailyLimit)} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Usage:</span>
                      <span>{formatCurrency(account.usedMonthly, 'USD')} / {formatCurrency(account.monthlyLimit, 'USD')}</span>
                    </div>
                    <Progress value={calculateUsagePercentage(account.usedMonthly, account.monthlyLimit)} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Account Number:</span>
                    <span className="font-mono">{account.accountNumber}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultAccount(account.id)}
                      disabled={account.isDefault}
                      className="flex-1"
                    >
                      {account.isDefault ? 'Default' : 'Set Default'}
                    </Button>
                    <Switch
                      checked={account.isActive}
                      onCheckedChange={() => toggleAccountStatus(account.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.timestamp.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{transaction.reference}</span>
                          {transaction.fee > 0 && (
                            <>
                              <span>•</span>
                              <span>Fee: {formatCurrency(transaction.fee, 'USD')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.type === 'deposit' || transaction.type === 'refund' 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {transaction.type === 'withdrawal' || transaction.type === 'purchase' ? '-' : '+'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Balance</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.totalBalance, 'USD')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Total Deposits</span>
                </div>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(analytics.totalDeposits, 'USD')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Total Withdrawals</span>
                </div>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(analytics.totalWithdrawals, 'USD')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Profit/Loss</span>
                </div>
                <div className={`text-2xl font-bold ${analytics.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(analytics.profitLoss, 'USD')}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Monthly Volume:</span>
                    <span className="font-bold">{formatCurrency(analytics.monthlyVolume, 'USD')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Transaction:</span>
                    <span className="font-bold">{formatCurrency(analytics.averageTransactionSize, 'USD')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Risk Score:</span>
                    <Badge variant={analytics.riskScore <= 3 ? 'default' : analytics.riskScore <= 6 ? 'secondary' : 'destructive'}>
                      {analytics.riskScore}/10
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Transfer Between Accounts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Banking Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Configure your banking preferences, limits, and security settings.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="BTC">Bitcoin</SelectItem>
                      <SelectItem value="ETH">Ethereum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notification Preferences</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="large">Large Transactions Only</SelectItem>
                      <SelectItem value="none">No Notifications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Auto-refresh Rates</Label>
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Account Balances</Label>
                  <Switch checked={balanceVisible} onCheckedChange={setBalanceVisible} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Two-Factor Authentication</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
