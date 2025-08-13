import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  CreditCard,
  Globe,
  Target,
  Calendar as CalendarIcon,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  Zap,
  Crown,
  Coins,
  Activity,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Clock,
  MapPin,
  Smartphone,
  Desktop,
  Tablet,
  Star,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, isToday, isYesterday } from "date-fns";

// Types for analytics data
interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface ChartData {
  date: string;
  revenue: number;
  transactions: number;
  users: number;
  conversion: number;
}

interface PaymentMethodData {
  method: string;
  transactions: number;
  revenue: number;
  percentage: number;
  change: number;
  icon: string;
}

interface GeographicData {
  country: string;
  countryCode: string;
  revenue: number;
  users: number;
  transactions: number;
  percentage: number;
}

interface UserSegmentData {
  segment: string;
  users: number;
  revenue: number;
  averageOrderValue: number;
  retentionRate: number;
  color: string;
}

interface ConversionFunnelData {
  stage: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

interface PackagePerformanceData {
  packageId: string;
  packageName: string;
  sales: number;
  revenue: number;
  conversionRate: number;
  viewToSaleRate: number;
  averageOrderValue: number;
  category: string;
}

interface DeviceData {
  device: string;
  users: number;
  percentage: number;
  revenue: number;
  conversionRate: number;
  icon: React.ComponentType<any>;
}

interface RealtimeData {
  activeUsers: number;
  currentSales: number;
  revenueToday: number;
  conversionRate: number;
  topPackage: string;
  recentTransactions: Array<{
    id: string;
    user: string;
    package: string;
    amount: number;
    method: string;
    timestamp: string;
  }>;
}

interface DateRange {
  from: Date;
  to: Date;
}

export default function AdvancedAnalyticsDashboard() {
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'users', 'transactions', 'conversion']);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data state
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegmentData[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelData[]>([]);
  const [packagePerformance, setPackagePerformance] = useState<PackagePerformanceData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);

  // Load data on component mount and date range change
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedDateRange]);

  // Update realtime data every 30 seconds
  useEffect(() => {
    loadRealtimeData();
    const interval = setInterval(loadRealtimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadChartData(),
        loadPaymentMethodData(),
        loadGeographicData(),
        loadUserSegmentData(),
        loadConversionFunnelData(),
        loadPackagePerformanceData(),
        loadDeviceData(),
      ]);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    // Mock data - replace with actual API calls
    const mockMetrics: MetricCard[] = [
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: '$48,592.34',
        change: 12.5,
        changeType: 'increase',
        icon: DollarSign,
        color: 'text-green-600',
        description: 'Total revenue in selected period',
      },
      {
        id: 'users',
        title: 'Active Users',
        value: '2,847',
        change: 8.3,
        changeType: 'increase',
        icon: Users,
        color: 'text-blue-600',
        description: 'Unique users who made purchases',
      },
      {
        id: 'transactions',
        title: 'Transactions',
        value: '1,293',
        change: -2.1,
        changeType: 'decrease',
        icon: ShoppingCart,
        color: 'text-purple-600',
        description: 'Total completed transactions',
      },
      {
        id: 'conversion',
        title: 'Conversion Rate',
        value: '3.47%',
        change: 15.2,
        changeType: 'increase',
        icon: Target,
        color: 'text-orange-600',
        description: 'Visitor to purchase conversion',
      },
      {
        id: 'aov',
        title: 'Avg Order Value',
        value: '$37.58',
        change: 4.7,
        changeType: 'increase',
        icon: CreditCard,
        color: 'text-indigo-600',
        description: 'Average transaction amount',
      },
      {
        id: 'retention',
        title: 'User Retention',
        value: '68.4%',
        change: 2.8,
        changeType: 'increase',
        icon: Activity,
        color: 'text-pink-600',
        description: '30-day user retention rate',
      },
    ];
    setMetrics(mockMetrics);
  };

  const loadChartData = async () => {
    // Generate mock time series data
    const days = Math.floor((selectedDateRange.to.getTime() - selectedDateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    const mockData: ChartData[] = [];
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(selectedDateRange.from);
      date.setDate(date.getDate() + i);
      
      mockData.push({
        date: format(date, 'yyyy-MM-dd'),
        revenue: Math.random() * 2000 + 1000,
        transactions: Math.floor(Math.random() * 50 + 20),
        users: Math.floor(Math.random() * 100 + 50),
        conversion: Math.random() * 0.05 + 0.02,
      });
    }
    
    setChartData(mockData);
  };

  const loadPaymentMethodData = async () => {
    const mockData: PaymentMethodData[] = [
      { method: 'PayPal', transactions: 456, revenue: 18234.56, percentage: 42.3, change: 8.5, icon: '💙' },
      { method: 'Credit Card', transactions: 324, revenue: 15678.90, percentage: 36.4, change: 12.1, icon: '💳' },
      { method: 'Crypto', transactions: 89, revenue: 4567.23, percentage: 10.6, change: 45.2, icon: '₿' },
      { method: 'Apple Pay', transactions: 67, revenue: 3456.78, percentage: 8.0, change: 23.4, icon: '🍎' },
      { method: 'Google Pay', transactions: 45, revenue: 1234.56, percentage: 2.9, change: 15.7, icon: '🔍' },
    ];
    setPaymentMethods(mockData);
  };

  const loadGeographicData = async () => {
    const mockData: GeographicData[] = [
      { country: 'United States', countryCode: 'US', revenue: 25678.90, users: 1245, transactions: 567, percentage: 52.8 },
      { country: 'Canada', countryCode: 'CA', revenue: 8734.56, users: 432, transactions: 198, percentage: 18.0 },
      { country: 'United Kingdom', countryCode: 'GB', revenue: 5432.10, users: 298, transactions: 134, percentage: 11.2 },
      { country: 'Australia', countryCode: 'AU', revenue: 3456.78, users: 187, transactions: 89, percentage: 7.1 },
      { country: 'Germany', countryCode: 'DE', revenue: 2345.67, users: 123, transactions: 56, percentage: 4.8 },
    ];
    setGeographicData(mockData);
  };

  const loadUserSegmentData = async () => {
    const mockData: UserSegmentData[] = [
      { segment: 'VIP Players', users: 234, revenue: 18456.78, averageOrderValue: 78.90, retentionRate: 89.5, color: 'bg-yellow-500' },
      { segment: 'Regular Players', users: 1456, revenue: 24567.89, averageOrderValue: 45.67, retentionRate: 67.3, color: 'bg-blue-500' },
      { segment: 'Casual Players', users: 987, revenue: 8976.54, averageOrderValue: 23.45, retentionRate: 45.2, color: 'bg-green-500' },
      { segment: 'New Players', users: 567, revenue: 3456.78, averageOrderValue: 15.67, retentionRate: 78.9, color: 'bg-purple-500' },
    ];
    setUserSegments(mockData);
  };

  const loadConversionFunnelData = async () => {
    const mockData: ConversionFunnelData[] = [
      { stage: 'Store Visits', users: 12450, conversionRate: 100, dropOffRate: 0 },
      { stage: 'Package Views', users: 8734, conversionRate: 70.1, dropOffRate: 29.9 },
      { stage: 'Checkout Started', users: 2456, conversionRate: 28.1, dropOffRate: 41.9 },
      { stage: 'Payment Info', users: 1823, conversionRate: 74.2, dropOffRate: 25.8 },
      { stage: 'Purchase Complete', users: 1456, conversionRate: 79.9, dropOffRate: 20.1 },
    ];
    setConversionFunnel(mockData);
  };

  const loadPackagePerformanceData = async () => {
    const mockData: PackagePerformanceData[] = [
      { packageId: '1', packageName: 'Starter Pack', sales: 456, revenue: 4567.44, conversionRate: 8.9, viewToSaleRate: 12.3, averageOrderValue: 10.01, category: 'starter' },
      { packageId: '2', packageName: 'Value Pack', sales: 324, revenue: 12958.76, conversionRate: 6.7, viewToSaleRate: 9.8, averageOrderValue: 39.99, category: 'standard' },
      { packageId: '3', packageName: 'Premium Pack', sales: 187, revenue: 18698.13, conversionRate: 4.2, viewToSaleRate: 7.1, averageOrderValue: 99.99, category: 'premium' },
      { packageId: '4', packageName: 'VIP Mega Pack', sales: 89, revenue: 26697.11, conversionRate: 2.8, viewToSaleRate: 4.5, averageOrderValue: 299.99, category: 'vip' },
    ];
    setPackagePerformance(mockData);
  };

  const loadDeviceData = async () => {
    const mockData: DeviceData[] = [
      { device: 'Desktop', users: 1456, percentage: 51.2, revenue: 25678.90, conversionRate: 4.2, icon: Desktop },
      { device: 'Mobile', users: 1234, percentage: 43.4, revenue: 18456.78, conversionRate: 2.8, icon: Smartphone },
      { device: 'Tablet', users: 157, percentage: 5.5, revenue: 4456.66, conversionRate: 3.1, icon: Tablet },
    ];
    setDeviceData(mockData);
  };

  const loadRealtimeData = async () => {
    const mockRealtime: RealtimeData = {
      activeUsers: 127,
      currentSales: 8,
      revenueToday: 1456.78,
      conversionRate: 3.4,
      topPackage: 'Value Pack',
      recentTransactions: [
        { id: '1', user: 'John D.', package: 'Premium Pack', amount: 99.99, method: 'PayPal', timestamp: '2 minutes ago' },
        { id: '2', user: 'Sarah M.', package: 'Starter Pack', amount: 9.99, method: 'Credit Card', timestamp: '5 minutes ago' },
        { id: '3', user: 'Mike R.', package: 'Value Pack', amount: 39.99, method: 'Crypto', timestamp: '8 minutes ago' },
      ],
    };
    setRealtimeData(mockRealtime);
  };

  const handleExportData = async () => {
    try {
      toast({
        title: "Exporting Data",
        description: "Your analytics report is being generated...",
      });
      
      // Mock export process
      setTimeout(() => {
        toast({
          title: "Export Complete",
          description: "Your analytics report has been downloaded.",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate analytics report",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (changeType: string, size = 'w-4 h-4') => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className={`${size} text-green-500`} />;
      case 'decrease':
        return <TrendingDown className={`${size} text-red-500`} />;
      default:
        return <Activity className={`${size} text-gray-500`} />;
    }
  };

  if (loading && metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your business performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(selectedDateRange.from, 'MMM dd')} - {format(selectedDateRange.to, 'MMM dd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={selectedDateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setSelectedDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={handleExportData} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Realtime Banner */}
      {realtimeData && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-medium">{realtimeData.activeUsers} users online</span>
              </div>
              <div className="text-sm opacity-90">
                ${realtimeData.revenueToday.toFixed(2)} today
              </div>
              <div className="text-sm opacity-90">
                {realtimeData.currentSales} sales in progress
              </div>
            </div>
            <Badge variant="secondary">Live</Badge>
          </div>
        </motion.div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-muted`}>
                      <metric.icon className={`w-4 h-4 ${metric.color}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.changeType)}
                    <span className={`text-xs font-medium ${
                      metric.changeType === 'increase' ? 'text-green-600' : 
                      metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.title}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Revenue chart visualization</p>
                    <p className="text-sm">Integration with Chart.js or similar</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnel.map((stage, index) => (
                    <div key={stage.stage} className="relative">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stage.stage}</span>
                        <span className="text-sm text-muted-foreground">
                          {stage.users.toLocaleString()} ({formatPercent(stage.conversionRate)})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stage.conversionRate}%` }}
                        />
                      </div>
                      {index < conversionFunnel.length - 1 && (
                        <div className="text-xs text-red-500 mt-1">
                          -{formatPercent(stage.dropOffRate)} drop-off
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Segments */}
          <Card>
            <CardHeader>
              <CardTitle>User Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {userSegments.map((segment) => (
                  <div key={segment.segment} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                      <h3 className="font-medium">{segment.segment}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Users</span>
                        <span className="font-medium">{segment.users.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Revenue</span>
                        <span className="font-medium">{formatCurrency(segment.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>AOV</span>
                        <span className="font-medium">{formatCurrency(segment.averageOrderValue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Retention</span>
                        <span className="font-medium">{formatPercent(segment.retentionRate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {realtimeData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realtimeData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.user}</p>
                          <p className="text-sm text-muted-foreground">{transaction.package}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                        <p className="text-sm text-muted-foreground">{transaction.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.method} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-medium">{method.method}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.transactions} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(method.revenue)}</p>
                        <div className="flex items-center gap-1">
                          {getTrendIcon('increase', 'w-3 h-3')}
                          <span className="text-sm text-green-600">+{method.change}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceData.map((device) => (
                    <div key={device.device} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <device.icon className="w-5 h-5" />
                        <div>
                          <p className="font-medium">{device.device}</p>
                          <p className="text-sm text-muted-foreground">
                            {device.users.toLocaleString()} users ({formatPercent(device.percentage)})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(device.revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercent(device.conversionRate)} conv.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Package Performance Tab */}
        <TabsContent value="packages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Package Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Package</th>
                      <th className="text-left p-2">Sales</th>
                      <th className="text-left p-2">Revenue</th>
                      <th className="text-left p-2">Conversion</th>
                      <th className="text-left p-2">AOV</th>
                      <th className="text-left p-2">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packagePerformance.map((pkg) => (
                      <tr key={pkg.packageId} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{pkg.packageName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatPercent(pkg.viewToSaleRate)} view-to-sale
                            </p>
                          </div>
                        </td>
                        <td className="p-2 font-medium">{pkg.sales.toLocaleString()}</td>
                        <td className="p-2 font-medium">{formatCurrency(pkg.revenue)}</td>
                        <td className="p-2">
                          <Badge variant="outline">
                            {formatPercent(pkg.conversionRate)}
                          </Badge>
                        </td>
                        <td className="p-2">{formatCurrency(pkg.averageOrderValue)}</td>
                        <td className="p-2">
                          <Badge className={
                            pkg.category === 'starter' ? 'bg-green-100 text-green-800' :
                            pkg.category === 'standard' ? 'bg-blue-100 text-blue-800' :
                            pkg.category === 'premium' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {pkg.category}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {geographicData.map((country) => (
                    <div key={country.countryCode} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{country.country}</p>
                          <p className="text-sm text-muted-foreground">
                            {country.users.toLocaleString()} users • {country.transactions.toLocaleString()} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(country.revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercent(country.percentage)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-lg">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>World map visualization</p>
                    <p className="text-sm">Integration with mapping library</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
