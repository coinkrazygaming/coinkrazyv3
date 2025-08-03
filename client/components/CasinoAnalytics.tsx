import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  CreditCard, 
  Gamepad2, 
  Crown, 
  Target, 
  Shield, 
  Zap,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Heart,
  MessageSquare,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Coins,
  Trophy,
  Activity,
  Eye,
  UserPlus,
  Wallet,
  BanknotesIcon,
  CreditCardIcon,
  TrendingDown
} from 'lucide-react';

export interface AnalyticsData {
  revenue: {
    total: number;
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    growth: number;
    byGame: Array<{ name: string; revenue: number; percentage: number }>;
    byPaymentMethod: Array<{ method: string; revenue: number; percentage: number }>;
  };
  banking: {
    deposits: { total: number; count: number; average: number; pending: number };
    withdrawals: { total: number; count: number; average: number; pending: number };
    payouts: { total: number; count: number; average: number };
    chargebacks: { total: number; count: number; amount: number };
    balances: { totalGoldCoins: number; totalSweepsCoins: number; totalCash: number };
  };
  users: {
    total: number;
    active: number;
    new: number;
    retention: { day1: number; day7: number; day30: number };
    demographics: Array<{ country: string; users: number; percentage: number }>;
    vipUsers: number;
    bannedUsers: number;
  };
  games: {
    sessions: number;
    totalBets: number;
    totalWins: number;
    houseEdge: number;
    popularGames: Array<{ name: string; sessions: number; revenue: number }>;
    sportsbook: { activeBets: number; totalVolume: number; profit: number };
    slots: { spins: number; hits: number; jackpots: number };
  };
  socialMedia: {
    posts: { total: number; today: number; engagement: number };
    followers: { total: number; growth: number };
    leads: { generated: number; converted: number; conversionRate: number };
    campaigns: { active: number; clicks: number; ctr: number };
    platforms: Array<{ platform: string; followers: number; engagement: number }>;
  };
  compliance: {
    kyc: { pending: number; approved: number; rejected: number };
    aml: { flagged: number; cleared: number; underReview: number };
    responsible: { selfExcluded: number; limits: number; alerts: number };
    licensing: { status: string; expiryDate: string; compliance: number };
  };
}

export default function CasinoAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setIsRefreshing(true);
    
    // Simulate API call with realistic casino data
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockData: AnalyticsData = {
      revenue: {
        total: 2847563.89,
        daily: 47892.33,
        weekly: 335246.31,
        monthly: 1428567.42,
        yearly: 17142809.88,
        growth: 12.4,
        byGame: [
          { name: 'Slots', revenue: 1994695.32, percentage: 70.1 },
          { name: 'Blackjack', revenue: 426641.83, percentage: 15.0 },
          { name: 'Roulette', revenue: 227756.39, percentage: 8.0 },
          { name: 'Sportsbook', revenue: 198470.35, percentage: 6.9 }
        ],
        byPaymentMethod: [
          { method: 'Credit Card', revenue: 1708694.33, percentage: 60.0 },
          { method: 'Crypto', revenue: 569512.78, percentage: 20.0 },
          { method: 'Bank Transfer', revenue: 341253.67, percentage: 12.0 },
          { method: 'E-Wallet', revenue: 228103.11, percentage: 8.0 }
        ]
      },
      banking: {
        deposits: { total: 3247891.45, count: 12847, average: 252.84, pending: 28 },
        withdrawals: { total: 2891456.23, count: 8934, average: 323.67, pending: 142 },
        payouts: { total: 1847293.67, count: 45678, average: 40.43 },
        chargebacks: { total: 23456.78, count: 89, amount: 263.55 },
        balances: { 
          totalGoldCoins: 78945623, 
          totalSweepsCoins: 234567, 
          totalCash: 4582394.67 
        }
      },
      users: {
        total: 145678,
        active: 34567,
        new: 1847,
        retention: { day1: 78.5, day7: 42.3, day30: 18.7 },
        demographics: [
          { country: 'United States', users: 87406, percentage: 60.0 },
          { country: 'Canada', users: 17481, percentage: 12.0 },
          { country: 'United Kingdom', users: 14568, percentage: 10.0 },
          { country: 'Australia', users: 10246, percentage: 7.0 },
          { country: 'Other', users: 15977, percentage: 11.0 }
        ],
        vipUsers: 4567,
        bannedUsers: 234
      },
      games: {
        sessions: 789456,
        totalBets: 15847392.67,
        totalWins: 14892143.23,
        houseEdge: 6.02,
        popularGames: [
          { name: 'Buffalo Blitz', sessions: 45678, revenue: 234567.89 },
          { name: 'Lightning Roulette', sessions: 34567, revenue: 189234.56 },
          { name: 'Blackjack Pro', sessions: 28945, revenue: 156789.34 },
          { name: 'Mega Moolah', sessions: 23456, revenue: 298765.43 }
        ],
        sportsbook: { activeBets: 3456, totalVolume: 789234.56, profit: 47892.33 },
        slots: { spins: 2847593, hits: 567891, jackpots: 23 }
      },
      socialMedia: {
        posts: { total: 1247, today: 8, engagement: 6.7 },
        followers: { total: 234567, growth: 4.2 },
        leads: { generated: 2847, converted: 456, conversionRate: 16.0 },
        campaigns: { active: 12, clicks: 45678, ctr: 3.4 },
        platforms: [
          { platform: 'Instagram', followers: 89234, engagement: 7.8 },
          { platform: 'Twitter', followers: 67891, engagement: 5.4 },
          { platform: 'Facebook', followers: 45678, engagement: 8.2 },
          { platform: 'TikTok', followers: 31764, engagement: 12.6 }
        ]
      },
      compliance: {
        kyc: { pending: 147, approved: 89234, rejected: 456 },
        aml: { flagged: 23, cleared: 12456, underReview: 89 },
        responsible: { selfExcluded: 234, limits: 1456, alerts: 67 },
        licensing: { status: 'Active', expiryDate: '2025-03-15', compliance: 98.7 }
      }
    };

    setAnalyticsData(mockData);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Casino Analytics</h1>
          <p className="text-muted-foreground">
            Real-time analytics and business intelligence for CoinKrazy.com
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-border rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button 
            onClick={loadAnalyticsData} 
            disabled={isRefreshing}
            variant="outline"
          >
            {isRefreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(analyticsData.revenue.total)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">
                    +{formatPercentage(analyticsData.revenue.growth)}
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-blue-500">
                  {formatNumber(analyticsData.users.active)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(analyticsData.users.new)} new today
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Game Sessions</p>
                <p className="text-2xl font-bold text-purple-500">
                  {formatNumber(analyticsData.games.sessions)}
                </p>
                <p className="text-xs text-muted-foreground">
                  House Edge: {formatPercentage(analyticsData.games.houseEdge)}
                </p>
              </div>
              <Gamepad2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Social Reach</p>
                <p className="text-2xl font-bold text-pink-500">
                  {formatNumber(analyticsData.socialMedia.followers.total)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">
                    +{formatPercentage(analyticsData.socialMedia.followers.growth)}
                  </span>
                </div>
              </div>
              <Share2 className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="revenue">
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="banking">
            <CreditCard className="w-4 h-4 mr-2" />
            Banking
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="games">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Games
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="w-4 h-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Game Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.revenue.byGame.map((game, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{game.name}</span>
                        <div className="text-sm text-muted-foreground">
                          {formatPercentage(game.percentage)} of total
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">
                          {formatCurrency(game.revenue)}
                        </div>
                        <div className="w-24 bg-muted rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${game.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.revenue.byPaymentMethod.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{method.method}</span>
                        <div className="text-sm text-muted-foreground">
                          {formatPercentage(method.percentage)} of total
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">
                          {formatCurrency(method.revenue)}
                        </div>
                        <div className="w-24 bg-muted rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${method.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Daily</div>
                    <div className="text-xl font-bold text-green-500">
                      {formatCurrency(analyticsData.revenue.daily)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Weekly</div>
                    <div className="text-xl font-bold text-green-500">
                      {formatCurrency(analyticsData.revenue.weekly)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly</div>
                    <div className="text-xl font-bold text-green-500">
                      {formatCurrency(analyticsData.revenue.monthly)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Yearly</div>
                    <div className="text-xl font-bold text-green-500">
                      {formatCurrency(analyticsData.revenue.yearly)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Banking Analytics */}
        <TabsContent value="banking" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  Deposits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="text-2xl font-bold text-green-500">
                      {formatCurrency(analyticsData.banking.deposits.total)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Count</div>
                      <div className="font-medium">{formatNumber(analyticsData.banking.deposits.count)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Average</div>
                      <div className="font-medium">{formatCurrency(analyticsData.banking.deposits.average)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600">
                      {analyticsData.banking.deposits.pending} Pending
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDown className="w-4 h-4 text-red-500" />
                  Withdrawals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="text-2xl font-bold text-red-500">
                      {formatCurrency(analyticsData.banking.withdrawals.total)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Count</div>
                      <div className="font-medium">{formatNumber(analyticsData.banking.withdrawals.count)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Average</div>
                      <div className="font-medium">{formatCurrency(analyticsData.banking.withdrawals.average)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600">
                      {analyticsData.banking.withdrawals.pending} Pending
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold-500" />
                  Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="text-2xl font-bold text-gold-500">
                      {formatCurrency(analyticsData.banking.payouts.total)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Count</div>
                      <div className="font-medium">{formatNumber(analyticsData.banking.payouts.count)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Average</div>
                      <div className="font-medium">{formatCurrency(analyticsData.banking.payouts.average)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Current Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Coins className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Gold Coins</div>
                    <div className="text-xl font-bold text-gold-500">
                      {formatNumber(analyticsData.banking.balances.totalGoldCoins)}
                    </div>
                  </div>
                  <div className="text-center">
                    <Crown className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Sweeps Coins</div>
                    <div className="text-xl font-bold text-purple-500">
                      {formatNumber(analyticsData.banking.balances.totalSweepsCoins)}
                    </div>
                  </div>
                  <div className="text-center">
                    <Wallet className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Cash Balance</div>
                    <div className="text-xl font-bold text-green-500">
                      {formatCurrency(analyticsData.banking.balances.totalCash)}
                    </div>
                  </div>
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Chargebacks</div>
                    <div className="text-xl font-bold text-red-500">
                      {formatCurrency(analyticsData.banking.chargebacks.total)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {analyticsData.banking.chargebacks.count} incidents
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Analytics */}
        <TabsContent value="users" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                    <div className="text-2xl font-bold">{formatNumber(analyticsData.users.total)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                    <div className="text-2xl font-bold text-green-500">{formatNumber(analyticsData.users.active)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">New Users</div>
                    <div className="text-2xl font-bold text-blue-500">{formatNumber(analyticsData.users.new)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">VIP Users</div>
                    <div className="text-2xl font-bold text-gold-500">{formatNumber(analyticsData.users.vipUsers)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Day 1 Retention</span>
                      <span className="text-sm font-medium">{formatPercentage(analyticsData.users.retention.day1)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${analyticsData.users.retention.day1}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Day 7 Retention</span>
                      <span className="text-sm font-medium">{formatPercentage(analyticsData.users.retention.day7)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${analyticsData.users.retention.day7}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Day 30 Retention</span>
                      <span className="text-sm font-medium">{formatPercentage(analyticsData.users.retention.day30)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${analyticsData.users.retention.day30}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>User Demographics by Country</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.users.demographics.map((demo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{demo.country}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium">{formatNumber(demo.users)}</div>
                          <div className="text-sm text-muted-foreground">{formatPercentage(demo.percentage)}</div>
                        </div>
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${demo.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Games Analytics */}
        <TabsContent value="games" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Sessions</div>
                    <div className="text-2xl font-bold">{formatNumber(analyticsData.games.sessions)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Bets</div>
                    <div className="text-2xl font-bold text-blue-500">{formatCurrency(analyticsData.games.totalBets)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Wins</div>
                    <div className="text-2xl font-bold text-green-500">{formatCurrency(analyticsData.games.totalWins)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">House Edge</div>
                    <div className="text-2xl font-bold text-purple-500">{formatPercentage(analyticsData.games.houseEdge)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slots Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Spins</span>
                    <span className="font-bold">{formatNumber(analyticsData.games.slots.spins)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Winning Spins</span>
                    <span className="font-bold text-green-500">{formatNumber(analyticsData.games.slots.hits)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jackpots</span>
                    <span className="font-bold text-gold-500">{analyticsData.games.slots.jackpots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hit Rate</span>
                    <span className="font-bold">
                      {formatPercentage((analyticsData.games.slots.hits / analyticsData.games.slots.spins) * 100)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Popular Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.games.popularGames.map((game, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <div className="font-medium">{game.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(game.sessions)} sessions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">{formatCurrency(game.revenue)}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sportsbook Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Bets</span>
                    <span className="font-bold text-blue-500">{formatNumber(analyticsData.games.sportsbook.activeBets)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Volume</span>
                    <span className="font-bold">{formatCurrency(analyticsData.games.sportsbook.totalVolume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit</span>
                    <span className="font-bold text-green-500">{formatCurrency(analyticsData.games.sportsbook.profit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Media Analytics */}
        <TabsContent value="social" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Followers</div>
                    <div className="text-2xl font-bold text-blue-500">{formatNumber(analyticsData.socialMedia.followers.total)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                    <div className="text-2xl font-bold text-green-500">+{formatPercentage(analyticsData.socialMedia.followers.growth)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Posts Today</div>
                    <div className="text-2xl font-bold">{analyticsData.socialMedia.posts.today}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Engagement Rate</div>
                    <div className="text-2xl font-bold text-purple-500">{formatPercentage(analyticsData.socialMedia.posts.engagement)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Leads Generated</span>
                    <span className="font-bold text-blue-500">{formatNumber(analyticsData.socialMedia.leads.generated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Leads Converted</span>
                    <span className="font-bold text-green-500">{formatNumber(analyticsData.socialMedia.leads.converted)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="font-bold text-purple-500">{formatPercentage(analyticsData.socialMedia.leads.conversionRate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.socialMedia.platforms.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {platform.platform[0]}
                        </div>
                        <div>
                          <div className="font-medium">{platform.platform}</div>
                          <div className="text-sm text-muted-foreground">
                            Engagement: {formatPercentage(platform.engagement)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatNumber(platform.followers)}</div>
                        <div className="text-sm text-muted-foreground">Followers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Campaigns</span>
                    <span className="font-bold text-blue-500">{analyticsData.socialMedia.campaigns.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Clicks</span>
                    <span className="font-bold">{formatNumber(analyticsData.socialMedia.campaigns.clicks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Click-Through Rate</span>
                    <span className="font-bold text-green-500">{formatPercentage(analyticsData.socialMedia.campaigns.ctr)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Analytics */}
        <TabsContent value="compliance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>KYC Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Approved</span>
                    </div>
                    <span className="font-bold text-green-500">{formatNumber(analyticsData.compliance.kyc.approved)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span>Pending</span>
                    </div>
                    <span className="font-bold text-yellow-500">{formatNumber(analyticsData.compliance.kyc.pending)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>Rejected</span>
                    </div>
                    <span className="font-bold text-red-500">{formatNumber(analyticsData.compliance.kyc.rejected)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AML Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>Flagged</span>
                    </div>
                    <span className="font-bold text-red-500">{formatNumber(analyticsData.compliance.aml.flagged)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Cleared</span>
                    </div>
                    <span className="font-bold text-green-500">{formatNumber(analyticsData.compliance.aml.cleared)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-yellow-500" />
                      <span>Under Review</span>
                    </div>
                    <span className="font-bold text-yellow-500">{formatNumber(analyticsData.compliance.aml.underReview)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsible Gaming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Self-Excluded Users</span>
                    <span className="font-bold text-red-500">{formatNumber(analyticsData.compliance.responsible.selfExcluded)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Limits</span>
                    <span className="font-bold text-yellow-500">{formatNumber(analyticsData.compliance.responsible.limits)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alerts Triggered</span>
                    <span className="font-bold text-blue-500">{formatNumber(analyticsData.compliance.responsible.alerts)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Licensing Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="bg-green-500 text-white">{analyticsData.compliance.licensing.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiry Date</span>
                    <span className="font-medium">{analyticsData.compliance.licensing.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compliance Score</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-500">{formatPercentage(analyticsData.compliance.licensing.compliance)}</span>
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${analyticsData.compliance.licensing.compliance}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
