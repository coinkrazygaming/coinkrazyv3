import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Coins,
  Crown,
  Gift,
  TrendingUp,
  Calendar,
  Star,
  Trophy,
  DollarSign,
  Wallet,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Gamepad2,
  Target,
  Flame,
  Zap,
  Heart,
  Activity,
  Award,
  ChevronRight,
  Sparkles,
  Timer,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { walletService } from '../services/walletService';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalGamesPlayed: number;
  totalWagered: number;
  totalWinnings: number;
  biggestWin: number;
  favoriteGame: string;
  winRate: number;
  averageSession: number;
  totalSessions: number;
  vipPoints: number;
  nextVipLevel: string;
  pointsToNextLevel: number;
}

interface DailyBonus {
  day: number;
  reward: { type: 'GC' | 'SC'; amount: number };
  claimed: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  reward: { type: 'GC' | 'SC'; amount: number };
  unlocked: boolean;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bonus' | 'win' | 'bet';
  amount: number;
  currency: 'GC' | 'SC' | 'USD';
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  description: string;
}

export default function EnhancedDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [userStats, setUserStats] = useState<UserStats>({
    totalGamesPlayed: 1247,
    totalWagered: 485600,
    totalWinnings: 421350,
    biggestWin: 15750,
    favoriteGame: 'CoinKrazy Special',
    winRate: 42.8,
    averageSession: 28,
    totalSessions: 89,
    vipPoints: 2840,
    nextVipLevel: 'Platinum',
    pointsToNextLevel: 1160
  });

  const [balances, setBalances] = useState({
    GC: 125000,
    SC: 450.75,
    USD: 0
  });

  const [dailyBonuses] = useState<DailyBonus[]>([
    { day: 1, reward: { type: 'GC', amount: 1000 }, claimed: true },
    { day: 2, reward: { type: 'GC', amount: 1500 }, claimed: true },
    { day: 3, reward: { type: 'SC', amount: 5 }, claimed: true },
    { day: 4, reward: { type: 'GC', amount: 2000 }, claimed: false },
    { day: 5, reward: { type: 'GC', amount: 2500 }, claimed: false },
    { day: 6, reward: { type: 'SC', amount: 10 }, claimed: false },
    { day: 7, reward: { type: 'GC', amount: 5000 }, claimed: false }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first game',
      icon: '🏆',
      progress: 1,
      maxProgress: 1,
      reward: { type: 'GC', amount: 500 },
      unlocked: true
    },
    {
      id: 'high_roller',
      name: 'High Roller',
      description: 'Wager 100,000 GC',
      icon: '💰',
      progress: 85600,
      maxProgress: 100000,
      reward: { type: 'SC', amount: 25 },
      unlocked: false
    },
    {
      id: 'big_winner',
      name: 'Big Winner',
      description: 'Win 10,000 GC in a single spin',
      icon: '🎰',
      progress: 8750,
      maxProgress: 10000,
      reward: { type: 'GC', amount: 2000 },
      unlocked: false
    }
  ];

  const [recentTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'win',
      amount: 2850,
      currency: 'GC',
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000),
      description: 'Slot game win - CoinKrazy Special'
    },
    {
      id: '2',
      type: 'deposit',
      amount: 50000,
      currency: 'GC',
      status: 'completed',
      timestamp: new Date(Date.now() - 7200000),
      description: 'Gold Coin package purchase'
    },
    {
      id: '3',
      type: 'bonus',
      amount: 15,
      currency: 'SC',
      status: 'completed',
      timestamp: new Date(Date.now() - 86400000),
      description: 'Daily lucky wheel spin'
    }
  ]);

  const [canClaimDailyBonus, setCanClaimDailyBonus] = useState(true);
  const [dailyWheelAvailable, setDailyWheelAvailable] = useState(true);

  const currentDay = dailyBonuses.findIndex(bonus => !bonus.claimed) + 1;

  const claimDailyBonus = async () => {
    const todayBonus = dailyBonuses[currentDay - 1];
    if (todayBonus && !todayBonus.claimed) {
      try {
        await walletService.addBalance(
          user?.id || 'guest',
          todayBonus.reward.amount,
          todayBonus.reward.type
        );
        
        todayBonus.claimed = true;
        setCanClaimDailyBonus(false);
        
        // Update balance display
        setBalances(prev => ({
          ...prev,
          [todayBonus.reward.type]: prev[todayBonus.reward.type] + todayBonus.reward.amount
        }));

        toast({
          title: "Daily Bonus Claimed!",
          description: `You received ${todayBonus.reward.amount} ${todayBonus.reward.type}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to claim daily bonus",
          variant: "destructive",
        });
      }
    }
  };

  const getVipLevelColor = (level: string) => {
    switch (level) {
      case 'Bronze': return 'bg-amber-600';
      case 'Silver': return 'bg-gray-400';
      case 'Gold': return 'bg-yellow-500';
      case 'Platinum': return 'bg-blue-400';
      case 'Diamond': return 'bg-purple-500';
      default: return 'bg-gray-600';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'win': return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'deposit': return <Plus className="w-4 h-4 text-blue-500" />;
      case 'withdrawal': return <ArrowDownLeft className="w-4 h-4 text-orange-500" />;
      case 'bonus': return <Gift className="w-4 h-4 text-purple-500" />;
      case 'bet': return <ArrowDownLeft className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  const vipProgress = (userStats.vipPoints / (userStats.vipPoints + userStats.pointsToNextLevel)) * 100;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src="/api/placeholder/64/64" />
            <AvatarFallback className="text-lg font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">Ready to play and win?</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`${getVipLevelColor('Gold')} text-white px-3 py-1`}>
            <Crown className="w-4 h-4 mr-1" />
            Gold VIP
          </Badge>
          <Link to="/store">
            <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Buy Gold Coins
            </Button>
          </Link>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 border-gold-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-gold-400" />
                Gold Coins
              </span>
              <Button size="sm" variant="ghost" className="text-gold-400 hover:text-gold-300">
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold-400 mb-2">
              {balances.GC.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Available for play</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" />
                Sweep Coins
              </span>
              <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
                <DollarSign className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {balances.SC.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Redeemable for cash</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-400" />
              VIP Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Gold → Platinum</span>
                <span className="text-sm text-muted-foreground">
                  {userStats.pointsToNextLevel} points needed
                </span>
              </div>
              <Progress value={vipProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {userStats.vipPoints.toLocaleString()} total points
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Bonuses & Lucky Wheel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Daily Login Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dailyBonuses.map((bonus, index) => (
                <div
                  key={index}
                  className={`text-center p-3 rounded-lg border ${
                    bonus.claimed
                      ? 'bg-green-500/20 border-green-500/30'
                      : index === currentDay - 1
                      ? 'bg-gold-500/20 border-gold-500/30 ring-2 ring-gold-400'
                      : 'bg-muted border-muted-foreground/20'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">Day {bonus.day}</div>
                  <div className="text-xs text-muted-foreground">
                    {bonus.reward.amount} {bonus.reward.type}
                  </div>
                  {bonus.claimed && (
                    <CheckCircle className="w-4 h-4 text-green-500 mx-auto mt-1" />
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={claimDailyBonus}
              disabled={!canClaimDailyBonus}
              className="w-full"
            >
              {canClaimDailyBonus ? (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Claim Day {currentDay} Bonus
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Come back tomorrow
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Daily Lucky Wheel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-gold-500/20 rounded-full flex items-center justify-center border-4 border-gold-500/30">
                <Sparkles className="w-12 h-12 text-gold-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Spin for 0.01 SC to 0.25 SC
                </p>
                <p className="text-xs text-muted-foreground">1 free spin daily</p>
              </div>
              <Link to="/dashboard/wheel">
                <Button
                  disabled={!dailyWheelAvailable}
                  className="w-full bg-gradient-to-r from-purple-500 to-gold-500 hover:from-purple-600 hover:to-gold-600"
                >
                  {dailyWheelAvailable ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Spin the Wheel
                    </>
                  ) : (
                    <>
                      <Timer className="w-4 h-4 mr-2" />
                      Next spin in 18h 23m
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gaming Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Gaming Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {userStats.totalGamesPlayed.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Games Played</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {userStats.winRate}%
                    </div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">
                      {formatCurrency(userStats.totalWagered, 'GC')}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Wagered</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gold-400">
                      {formatCurrency(userStats.biggestWin, 'GC')}
                    </div>
                    <p className="text-sm text-muted-foreground">Biggest Win</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Favorite Game</p>
                  <p className="font-medium">{userStats.favoriteGame}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/games" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Play Games
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link to="/store" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Coins className="w-4 h-4 mr-2" />
                    Buy Gold Coins
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link to="/dashboard/withdraw" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Redeem Sweep Coins
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link to="/support" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Contact Support
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.unlocked ? 'bg-green-500/10 border-green-500/30' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{achievement.progress.toLocaleString()}</span>
                          <span className="text-muted-foreground">
                            {achievement.maxProgress.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {achievement.reward.amount} {achievement.reward.type}
                          </Badge>
                          {achievement.unlocked && (
                            <Badge className="bg-green-500 text-xs">
                              <Trophy className="w-3 h-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.timestamp.toLocaleDateString()} at {transaction.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.type === 'win' || transaction.type === 'deposit' || transaction.type === 'bonus'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}>
                        {transaction.type === 'bet' ? '-' : '+'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wallet className="w-4 h-4 mr-2" />
                  Payment Methods
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Responsible Gaming
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Email Verified</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phone Verified</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Identity Verified</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
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