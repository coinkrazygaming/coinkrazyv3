import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  Eye,
  Crown,
  Coins,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';

interface MetricData {
  value: number;
  change: number;
  period: string;
}

interface GamePerformance {
  name: string;
  provider: string;
  revenue: number;
  plays: number;
  rtp: number;
  players: number;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  const [liveMetrics, setLiveMetrics] = useState({
    activeUsers: 2847,
    revenue24h: 45230,
    totalBets: 156789,
    avgSessionTime: 28.5,
    conversionRate: 12.3,
    newRegistrations: 234
  });

  const [performanceData, setPerformanceData] = useState<GamePerformance[]>([
    { name: 'Josey Duck Game', provider: 'CoinKrazy', revenue: 18750, plays: 1234, rtp: 96.8, players: 723 },
    { name: 'Sweet Bonanza', provider: 'Pragmatic Play', revenue: 15430, plays: 987, rtp: 96.48, players: 567 },
    { name: 'Gates of Olympus', provider: 'Pragmatic Play', revenue: 12890, plays: 856, rtp: 96.5, players: 445 },
    { name: 'Colin Shots', provider: 'CoinKrazy', revenue: 11250, plays: 743, rtp: 97.2, players: 398 },
    { name: 'Wolf Gold', provider: 'Pragmatic Play', revenue: 9870, plays: 654, rtp: 96.01, players: 334 }
  ]);

  const [userMetrics] = useState({
    totalUsers: 15847,
    activeToday: 2847,
    newToday: 234,
    returningRate: 68.5,
    avgLifetimeValue: 287.50,
    churnRate: 8.2
  });

  const [revenueData] = useState({
    totalRevenue: 892847,
    gcRevenue: 567234,
    scRevenue: 325613,
    withdrawals: 234567,
    netRevenue: 658280
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 20) - 10,
        revenue24h: prev.revenue24h + Math.floor(Math.random() * 1000),
        totalBets: prev.totalBets + Math.floor(Math.random() * 50),
        avgSessionTime: Math.max(15, Math.min(45, prev.avgSessionTime + (Math.random() - 0.5) * 2)),
        conversionRate: Math.max(8, Math.min(20, prev.conversionRate + (Math.random() - 0.5) * 0.5))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Real-time platform performance and insights</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-card rounded-lg p-1">
                {(['24h', '7d', '30d', '90d'] as const).map((range) => (
                  <Button
                    key={range}
                    size="sm"
                    variant={timeRange === range ? 'default' : 'ghost'}
                    onClick={() => setTimeRange(range)}
                    className={timeRange === range ? 'bg-gold-500 text-black hover:bg-gold-600' : ''}
                  >
                    {range}
                  </Button>
                ))}
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-casino-blue/10 to-casino-blue/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{liveMetrics.activeUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-casino-blue" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+5.2%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gold/10 to-gold/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue 24h</p>
                  <p className="text-2xl font-bold">{formatCurrency(liveMetrics.revenue24h)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-gold-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+12.8%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bets</p>
                  <p className="text-2xl font-bold">{liveMetrics.totalBets.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+8.1%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Session</p>
                  <p className="text-2xl font-bold">{liveMetrics.avgSessionTime.toFixed(1)}m</p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+3.4%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion</p>
                  <p className="text-2xl font-bold">{formatPercentage(liveMetrics.conversionRate)}</p>
                </div>
                <Target className="w-8 h-8 text-orange-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+1.2%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Users</p>
                  <p className="text-2xl font-bold">{liveMetrics.newRegistrations}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+15.6%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="games">
              <Coins className="w-4 h-4 mr-2" />
              Game Performance
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User Analytics
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="w-4 h-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <CheckCircle className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Real-time revenue chart</p>
                      <p className="text-sm text-muted-foreground">Integration with Recharts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity Heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="w-12 h-12 text-casino-blue mx-auto mb-4" />
                      <p className="text-muted-foreground">Live activity visualization</p>
                      <p className="text-sm text-muted-foreground">WebSocket real-time updates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Game Performance Tab */}
          <TabsContent value="games" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Game</th>
                        <th className="text-left p-2">Provider</th>
                        <th className="text-left p-2">Revenue</th>
                        <th className="text-left p-2">Plays</th>
                        <th className="text-left p-2">RTP</th>
                        <th className="text-left p-2">Players</th>
                        <th className="text-left p-2">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData.map((game, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="p-2 font-medium">{game.name}</td>
                          <td className="p-2 text-muted-foreground">{game.provider}</td>
                          <td className="p-2 text-gold-400 font-bold">{formatCurrency(game.revenue)}</td>
                          <td className="p-2">{game.plays.toLocaleString()}</td>
                          <td className="p-2">
                            <Badge variant={game.rtp > 96.5 ? 'default' : 'secondary'}>
                              {formatPercentage(game.rtp)}
                            </Badge>
                          </td>
                          <td className="p-2">{game.players}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 text-sm">+{(Math.random() * 20).toFixed(1)}%</span>
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

          {/* User Analytics Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-casino-blue mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">{userMetrics.totalUsers.toLocaleString()}</div>
                  <div className="text-muted-foreground">Total Users</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">{formatPercentage(userMetrics.returningRate)}</div>
                  <div className="text-muted-foreground">Returning Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">{formatCurrency(userMetrics.avgLifetimeValue)}</div>
                  <div className="text-muted-foreground">Avg LTV</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Acquisition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-casino-blue mx-auto mb-4" />
                      <p className="text-muted-foreground">Acquisition channel breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Cohort retention analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-gold/10 to-gold/5">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                  <div className="text-xl font-bold">{formatCurrency(revenueData.totalRevenue)}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                <CardContent className="p-4 text-center">
                  <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-xl font-bold">{formatCurrency(revenueData.gcRevenue)}</div>
                  <div className="text-sm text-muted-foreground">GC Revenue</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-casino-blue/10 to-casino-blue/5">
                <CardContent className="p-4 text-center">
                  <Crown className="w-8 h-8 text-casino-blue mx-auto mb-2" />
                  <div className="text-xl font-bold">{formatCurrency(revenueData.scRevenue)}</div>
                  <div className="text-sm text-muted-foreground">SC Revenue</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
                <CardContent className="p-4 text-center">
                  <Download className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-xl font-bold">{formatCurrency(revenueData.withdrawals)}</div>
                  <div className="text-sm text-muted-foreground">Withdrawals</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-xl font-bold">{formatCurrency(revenueData.netRevenue)}</div>
                  <div className="text-sm text-muted-foreground">Net Revenue</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Comprehensive revenue analytics</p>
                    <p className="text-sm text-muted-foreground">GC vs SC performance comparison</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-green-400">98.9%</div>
                  <div className="text-sm text-muted-foreground">RTP Compliance</div>
                  <Badge variant="outline" className="border-green-500 text-green-400 mt-2">
                    Compliant
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-blue-400">24/7</div>
                  <div className="text-sm text-muted-foreground">AI Monitoring</div>
                  <Badge variant="outline" className="border-blue-500 text-blue-400 mt-2">
                    Active
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-orange-500/5 border-orange-500/20">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-orange-400">3</div>
                  <div className="text-sm text-muted-foreground">Active Alerts</div>
                  <Badge variant="outline" className="border-orange-500 text-orange-400 mt-2">
                    Review
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
