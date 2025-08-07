import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import AIEmployeeManager from "@/components/AIEmployeeManager";
import CasinoAnalytics from "@/components/CasinoAnalytics";
import CasinoBanking from "@/components/CasinoBanking";
import PackageEditor from "@/components/PackageEditor";
import BonusManagement from "@/components/BonusManagement";
import CmsManagement from "@/components/CmsManagement";
import EmailTemplates from "@/components/EmailTemplates";
import {
  Shield,
  Users,
  Settings,
  BarChart3,
  AlertTriangle,
  Bot,
  Database,
  CreditCard,
  FileText,
  Activity,
  Search,
  Filter,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Store,
  Coins,
  Gift,
  Layout,
  Mail,
} from "lucide-react";

// Mock data
const mockUsers = [
  {
    id: 1,
    username: "player123",
    email: "player123@email.com",
    status: "active",
    kyc: "verified",
    gcBalance: 125000,
    scBalance: 450,
    joinDate: "2024-01-15",
    lastLogin: "2024-03-20",
  },
  {
    id: 2,
    username: "casinofan",
    email: "fan@email.com",
    status: "suspended",
    kyc: "pending",
    gcBalance: 89000,
    scBalance: 0,
    joinDate: "2024-02-10",
    lastLogin: "2024-03-19",
  },
  {
    id: 3,
    username: "highroller",
    email: "high@email.com",
    status: "active",
    kyc: "verified",
    gcBalance: 450000,
    scBalance: 1250,
    joinDate: "2024-01-05",
    lastLogin: "2024-03-20",
  },
  {
    id: 4,
    username: "newbie2024",
    email: "new@email.com",
    status: "active",
    kyc: "rejected",
    gcBalance: 50000,
    scBalance: 25,
    joinDate: "2024-03-18",
    lastLogin: "2024-03-20",
  },
];

const mockGames = [
  {
    id: 1,
    name: "Sweet Bonanza",
    provider: "Pragmatic Play",
    status: "active",
    rtp: 96.48,
    players: 423,
    revenue24h: 12450,
    enabled: true,
  },
  {
    id: 2,
    name: "Josey Duck Game",
    provider: "CoinKrazy",
    status: "active",
    rtp: 96.8,
    players: 723,
    revenue24h: 18750,
    enabled: true,
  },
  {
    id: 3,
    name: "Gates of Olympus",
    provider: "Pragmatic Play",
    status: "maintenance",
    rtp: 96.5,
    players: 0,
    revenue24h: 0,
    enabled: false,
  },
  {
    id: 4,
    name: "Colin Shots",
    provider: "CoinKrazy",
    status: "active",
    rtp: 97.2,
    players: 612,
    revenue24h: 15250,
    enabled: true,
  },
];

const mockTransactions = [
  {
    id: 1,
    user: "player123",
    type: "withdrawal",
    amount: 150,
    currency: "SC",
    status: "pending",
    date: "2024-03-20 14:30",
  },
  {
    id: 2,
    user: "highroller",
    type: "deposit",
    amount: 500,
    currency: "GC",
    status: "completed",
    date: "2024-03-20 13:15",
  },
  {
    id: 3,
    user: "casinofan",
    type: "withdrawal",
    amount: 75,
    currency: "SC",
    status: "flagged",
    date: "2024-03-20 12:00",
  },
  {
    id: 4,
    user: "newbie2024",
    type: "deposit",
    amount: 100,
    currency: "GC",
    status: "completed",
    date: "2024-03-20 11:45",
  },
];

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [liveStats, setLiveStats] = useState({
    totalUsers: 15847,
    activeNow: 2847,
    pendingKyc: 23,
    revenue24h: 45230,
    pendingWithdrawals: 12,
    systemHealth: 99.9,
    fraudAlerts: 3,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats((prev) => ({
        ...prev,
        activeNow: prev.activeNow + Math.floor(Math.random() * 20) - 10,
        revenue24h: prev.revenue24h + Math.floor(Math.random() * 1000),
        systemHealth: Math.max(
          95,
          Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 0.1),
        ),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-6 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">CoinKrazy Admin Panel</h1>
              <p className="text-muted-foreground">
                Management Dashboard & AI Assistant
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="border-gold-500 text-gold-400"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin: coinkrazy00@gmail.com
              </Badge>
              <Button
                variant="outline"
                className="bg-red-500/10 border-red-500 text-red-400"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Emergency Stop
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Live Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-casino-blue/10 to-casino-blue/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">
                    {liveStats.totalUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-casino-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Now</p>
                  <p className="text-2xl font-bold">
                    {liveStats.activeNow.toLocaleString()}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending KYC</p>
                  <p className="text-2xl font-bold">{liveStats.pendingKyc}</p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gold-500/10 to-gold-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue 24h</p>
                  <p className="text-2xl font-bold">
                    ${liveStats.revenue24h.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-gold-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Withdrawals</p>
                  <p className="text-2xl font-bold">
                    {liveStats.pendingWithdrawals}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <p className="text-2xl font-bold">
                    {liveStats.systemHealth.toFixed(1)}%
                  </p>
                </div>
                <Database className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fraud Alerts</p>
                  <p className="text-2xl font-bold">{liveStats.fraudAlerts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tools Tabs */}
        <Tabs defaultValue="ai-manager" className="w-full">
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="ai-manager">
              <Bot className="w-4 h-4 mr-2" />
              AI Manager
            </TabsTrigger>
            <TabsTrigger value="store">
              <Store className="w-4 h-4 mr-2" />
              Gold Store
            </TabsTrigger>
            <TabsTrigger value="package-editor">
              <Edit className="w-4 h-4 mr-2" />
              Package Editor
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="games">
              <Settings className="w-4 h-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="bonus">
              <Gift className="w-4 h-4 mr-2" />
              Bonuses
            </TabsTrigger>
            <TabsTrigger value="cms">
              <Layout className="w-4 h-4 mr-2" />
              CMS
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="w-4 h-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* AI Employee Manager */}
          <TabsContent value="ai-manager" className="mt-6">
            <AIEmployeeManager />
          </TabsContent>

          {/* Package Editor */}
          <TabsContent value="package-editor" className="mt-6">
            <PackageEditor />
          </TabsContent>

          {/* Gold Coin Store Management */}
          <TabsContent value="store" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-gold-500" />
                    Gold Coin Store Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center p-6">
                      <Coins className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                      <h3 className="font-bold mb-2">Package Editor</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create and edit Gold Coin packages with AI-assisted
                        visual builder
                      </p>
                      <Button
                        className="bg-gold-500 hover:bg-gold-600 text-black"
                        onClick={() =>
                          window.open("/admin?tab=package-editor", "_blank")
                        }
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Open Editor
                      </Button>
                    </Card>

                    <Card className="text-center p-6">
                      <CreditCard className="w-12 h-12 text-casino-blue mx-auto mb-4" />
                      <h3 className="font-bold mb-2">Payment Settings</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure payment processors and security settings
                      </p>
                      <Button variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </Card>

                    <Card className="text-center p-6">
                      <BarChart3 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="font-bold mb-2">Sales Analytics</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        View detailed sales metrics and performance data
                      </p>
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Reports
                      </Button>
                    </Card>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-bold text-lg mb-4">Current Packages</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-2">Package</th>
                            <th className="text-left p-2">Gold Coins</th>
                            <th className="text-left p-2">Sweeps Coins</th>
                            <th className="text-left p-2">Price</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              name: "Starter Pack",
                              gc: 50000,
                              sc: 25,
                              price: 9.99,
                              status: "active",
                            },
                            {
                              name: "Popular Pack",
                              gc: 125000,
                              sc: 75,
                              price: 19.99,
                              status: "active",
                            },
                            {
                              name: "Premium Pack",
                              gc: 300000,
                              sc: 200,
                              price: 49.99,
                              status: "active",
                            },
                            {
                              name: "VIP Pack",
                              gc: 750000,
                              sc: 500,
                              price: 99.99,
                              status: "active",
                            },
                          ].map((pkg, index) => (
                            <tr
                              key={index}
                              className="border-b border-border/50 hover:bg-muted/50"
                            >
                              <td className="p-2 font-medium">{pkg.name}</td>
                              <td className="p-2">{pkg.gc.toLocaleString()}</td>
                              <td className="p-2">{pkg.sc}</td>
                              <td className="p-2">${pkg.price}</td>
                              <td className="p-2">
                                <Badge variant="default">Active</Badge>
                              </td>
                              <td className="p-2">
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-3 h-3" />
                                  </Button>
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">KYC</th>
                        <th className="text-left p-2">GC Balance</th>
                        <th className="text-left p-2">SC Balance</th>
                        <th className="text-left p-2">Last Login</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-border/50 hover:bg-muted/50"
                        >
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                user.kyc === "verified"
                                  ? "default"
                                  : user.kyc === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {user.kyc}
                            </Badge>
                          </td>
                          <td className="p-2 font-mono">
                            {user.gcBalance.toLocaleString()}
                          </td>
                          <td className="p-2 font-mono text-gold-400">
                            {user.scBalance}
                          </td>
                          <td className="p-2 text-sm">{user.lastLogin}</td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500"
                              >
                                <Ban className="w-3 h-3" />
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

          {/* Game Control */}
          <TabsContent value="games" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Management & RTP Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Game</th>
                        <th className="text-left p-2">Provider</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">RTP</th>
                        <th className="text-left p-2">Players</th>
                        <th className="text-left p-2">Revenue 24h</th>
                        <th className="text-left p-2">Controls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockGames.map((game) => (
                        <tr
                          key={game.id}
                          className="border-b border-border/50 hover:bg-muted/50"
                        >
                          <td className="p-2 font-medium">{game.name}</td>
                          <td className="p-2 text-muted-foreground">
                            {game.provider}
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                game.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {game.status}
                            </Badge>
                          </td>
                          <td className="p-2 font-mono">{game.rtp}%</td>
                          <td className="p-2">{game.players}</td>
                          <td className="p-2 text-gold-400">
                            ${game.revenue24h.toLocaleString()}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={game.enabled ? "outline" : "default"}
                                className={
                                  game.enabled
                                    ? "text-orange-500"
                                    : "bg-green-500 hover:bg-green-600"
                                }
                              >
                                {game.enabled ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                              </Button>
                              <Button size="sm" variant="outline">
                                <Settings className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <BarChart3 className="w-3 h-3" />
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

          {/* Payment Management */}
          <TabsContent value="payments" className="mt-6">
            <CasinoBanking />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-6">
            <CasinoAnalytics />
          </TabsContent>

          {/* AI Assistant */}
          <TabsContent value="ai" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-gold-500" />
                  AI Assistant "Lucky" - Fraud Detection & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Recent AI Alerts</h3>
                    <div className="space-y-3">
                      <div className="border border-red-500/20 rounded-lg p-3 bg-red-500/5">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="font-medium text-red-400">
                            Suspicious Pattern Detected
                          </span>
                          <Badge
                            variant="outline"
                            className="border-red-500 text-red-400"
                          >
                            HIGH
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          User "casinofan" showing unusual betting patterns. 47
                          consecutive losses followed by large win.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          2 minutes ago
                        </p>
                      </div>

                      <div className="border border-orange-500/20 rounded-lg p-3 bg-orange-500/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-orange-400">
                            RTP Anomaly
                          </span>
                          <Badge
                            variant="outline"
                            className="border-orange-500 text-orange-400"
                          >
                            MEDIUM
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "Sweet Bonanza" RTP deviation detected: 102.3% over
                          last 1000 spins.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          15 minutes ago
                        </p>
                      </div>

                      <div className="border border-blue-500/20 rounded-lg p-3 bg-blue-500/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-blue-400">
                            Auto-Resolved Support
                          </span>
                          <Badge
                            variant="outline"
                            className="border-blue-500 text-blue-400"
                          >
                            INFO
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Automatically resolved 3 password reset requests and 1
                          bonus claim inquiry.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">AI Chat Interface</h3>
                    <div className="border border-border rounded-lg p-4 h-64 bg-muted/20 flex items-center justify-center">
                      <div className="text-center">
                        <Bot className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Lucky AI Assistant
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Voice + Text interface integration
                        </p>
                        <Button className="mt-4 bg-gold-500 text-black hover:bg-gold-600">
                          Activate Lucky
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs */}
          <TabsContent value="audit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Logs & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Logs
                    </Button>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Report
                    </Button>
                    <Button variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-green-500/5 border-green-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium">RTP Compliance</span>
                        </div>
                        <p className="text-2xl font-bold text-green-400">
                          ✓ Passed
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last audit: 2 hours ago
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-500/5 border-blue-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Security Scan</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-400">
                          ✓ Clean
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last scan: 30 minutes ago
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-500/5 border-orange-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-orange-500" />
                          <span className="font-medium">Backup Status</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-400">
                          ⚠ Due
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last backup: 22 hours ago
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bonus Management */}
          <TabsContent value="bonus" className="mt-6">
            <BonusManagement />
          </TabsContent>

          {/* CMS Management */}
          <TabsContent value="cms" className="mt-6">
            <CmsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
