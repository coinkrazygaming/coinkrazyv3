import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Coins,
  Crown,
  CreditCard,
  Gift,
  TrendingUp,
  Calendar,
  Star,
  Trophy,
  Download,
  Upload,
  DollarSign,
  Smartphone,
  Wallet,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Eye,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Lock,
  XCircle,
  FileText,
  Camera,
  User,
  MapPin,
  Phone,
  Loader2,
  PlayCircle,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  balanceService,
  UserBalance,
  BalanceTransaction,
} from "@/services/balanceService";
import SocialHubWidget from "@/components/SocialHubWidget";
import { bonusService } from "@/services/bonusService";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Real user balance and transactions
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Dashboard state
  const [activeTab, setActiveTab] = useState("overview");
  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    method: "bank",
    accountInfo: "",
    routingNumber: "",
    accountNumber: "",
    accountType: "checking",
  });
  const [showKycModal, setShowKycModal] = useState(false);
  const [dailyBonusAvailable, setDailyBonusAvailable] = useState(true);
  const [bonusLoading, setBonusLoading] = useState(false);

  // Real-time stats
  const [liveStats, setLiveStats] = useState({
    todayWins: 0,
    bestGame: "CoinKrazy Spinner",
    playTime: "0h 0m",
    rank: 0,
    totalWithdrawn: 0,
    lifetimeWinnings: 0,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user]);

  // Load user balance and transactions
  useEffect(() => {
    if (user) {
      loadUserData();

      // Subscribe to real-time balance updates
      const unsubscribe = balanceService.subscribeToBalanceUpdates(
        user.email,
        (updatedBalance) => {
          setBalance(updatedBalance);
          setTransactions(balanceService.getUserTransactions(user.email, 20));
        },
      );

      return () => unsubscribe();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setBalanceLoading(true);

      // Get user balance
      const userBalance = balanceService.getUserBalance(user.email);
      setBalance(userBalance);

      // Get transaction history
      const userTransactions = balanceService.getUserTransactions(
        user.email,
        20,
      );
      setTransactions(userTransactions);

      // Calculate live stats from real data
      const totalGCWon = userTransactions
        .filter((tx) => tx.type === "credit" && tx.currency === "gc")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalSCWon = userTransactions
        .filter((tx) => tx.type === "credit" && tx.currency === "sc")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalWithdrawn = userTransactions
        .filter((tx) => tx.type === "debit" && tx.currency === "sc")
        .reduce((sum, tx) => sum + tx.amount, 0);

      setLiveStats({
        todayWins: totalGCWon,
        bestGame: "CoinKrazy Spinner",
        playTime: "2h 34m",
        rank: Math.floor(Math.random() * 500) + 1,
        totalWithdrawn,
        lifetimeWinnings: totalGCWon + totalSCWon,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleDailyBonus = async () => {
    if (!user || bonusLoading) return;

    setBonusLoading(true);
    try {
      const result = await bonusService.claimDailyBonus(user.id);

      if (result.success) {
        toast({
          title: "Daily Bonus Claimed!",
          description: result.message,
        });
        setDailyBonusAvailable(false);
        loadUserData(); // Refresh balance
      } else {
        toast({
          title: "Bonus Already Claimed",
          description: result.message,
          variant: "destructive",
        });
        setDailyBonusAvailable(false);
      }
    } catch (error) {
      console.error("Error claiming daily bonus:", error);
      toast({
        title: "Error",
        description: "Failed to claim daily bonus. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBonusLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!user || !balance) return;

    const amount = parseFloat(withdrawalData.amount);

    // Validation checks
    if (!amount || amount < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is 100 Sweeps Coins",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance.sc) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough Sweeps Coins for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    if (user.kyc_status !== "verified") {
      setShowKycModal(true);
      return;
    }

    if (
      !withdrawalData.accountInfo ||
      !withdrawalData.routingNumber ||
      !withdrawalData.accountNumber
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all banking information",
        variant: "destructive",
      });
      return;
    }

    try {
      // Process withdrawal by debiting user balance
      balanceService.updateBalance(
        user.email,
        0,
        -amount,
        `Withdrawal - ${withdrawalData.method}`,
      );

      toast({
        title: "Withdrawal Submitted",
        description: `Withdrawal request for ${amount} SC submitted successfully! Processing time: 1-3 business days.`,
      });

      // Reset form
      setWithdrawalData({
        amount: "",
        method: "bank",
        accountInfo: "",
        routingNumber: "",
        accountNumber: "",
        accountType: "checking",
      });

      loadUserData(); // Refresh data
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canWithdraw = () => {
    return user?.kyc_status === "verified" && balance && balance.sc >= 100;
  };

  const getKycStatusColor = () => {
    switch (user?.kyc_status) {
      case "verified":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "pending":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "rejected":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getKycStatusIcon = () => {
    switch (user?.kyc_status) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatTransactionType = (transaction: BalanceTransaction) => {
    if (transaction.description.includes("Welcome Bonus")) return "bonus";
    if (transaction.description.includes("Withdrawal")) return "withdrawal";
    if (transaction.description.includes("Deposit")) return "deposit";
    if (
      transaction.description.includes("Game") ||
      transaction.description.includes("Gameplay")
    )
      return "win";
    return transaction.type === "credit" ? "win" : "loss";
  };

  // Show loading while checking auth
  if (isLoading || balanceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-gold-500 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not logged in (will redirect)
  if (!user || !balance) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user.username}!
              </h1>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className="border-gold-500 text-gold-400"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {user.role === "vip" ? "VIP" : "Player"}
                </Badge>
                <Badge className={`${getKycStatusColor()}`}>
                  {getKycStatusIcon()}
                  <span className="ml-1">KYC {user.kyc_status}</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="border-green-500 text-green-400"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>

            {/* Balance Display */}
            <div className="flex gap-4">
              <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold-500/20">
                <CardContent className="p-4 text-center">
                  <Coins className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gold-400">
                    {balance.gc.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Gold Coins
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-casino-blue/10 to-casino-blue/5 border-casino-blue/20">
                <CardContent className="p-4 text-center">
                  <Crown className="w-8 h-8 text-casino-blue mx-auto mb-2" />
                  <div className="text-2xl font-bold text-casino-blue">
                    {balance.sc}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sweeps Coins
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lifetime Wins</p>
                  <p className="text-xl font-bold text-gold-400">
                    {liveStats.lifetimeWinnings.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Withdrawn
                  </p>
                  <p className="text-xl font-bold text-casino-blue">
                    {liveStats.totalWithdrawn} SC
                  </p>
                </div>
                <Download className="w-6 h-6 text-casino-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Games Played</p>
                  <p className="text-xl font-bold text-gold-400">
                    {transactions.filter((t) => t.gameId).length}
                  </p>
                </div>
                <Trophy className="w-6 h-6 text-gold-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Player Rank</p>
                  <p className="text-xl font-bold">#{liveStats.rank}</p>
                </div>
                <Star className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="games">
              <PlayCircle className="w-4 h-4 mr-2" />
              Play Games
            </TabsTrigger>
            <TabsTrigger value="withdraw">
              <Download className="w-4 h-4 mr-2" />
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <CreditCard className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {formatTransactionType(tx) === "deposit" && (
                            <Plus className="w-5 h-5 text-green-500" />
                          )}
                          {formatTransactionType(tx) === "withdrawal" && (
                            <Download className="w-5 h-5 text-red-500" />
                          )}
                          {formatTransactionType(tx) === "win" && (
                            <Trophy className="w-5 h-5 text-gold-500" />
                          )}
                          {formatTransactionType(tx) === "bonus" && (
                            <Gift className="w-5 h-5 text-purple-500" />
                          )}
                          <div>
                            <div className="font-medium capitalize">
                              {formatTransactionType(tx)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {tx.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold ${tx.currency === "sc" ? "text-casino-blue" : "text-gold-400"}`}
                          >
                            {tx.type === "credit" ? "+" : "-"}
                            {tx.amount.toLocaleString()}{" "}
                            {tx.currency.toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.transactionDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions yet. Start playing to see your activity
                        here!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Bonus */}
              <Card className="bg-gradient-to-br from-gold/5 to-casino-blue/5 border-gold-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-gold-500" />
                    Daily Bonus
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-gold/20 to-casino-blue/20 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-gold-500/30">
                    <RotateCcw className="w-12 h-12 text-gold-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    {dailyBonusAvailable
                      ? "Daily Bonus Available!"
                      : "Bonus Claimed Today"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {dailyBonusAvailable
                      ? "Claim your daily bonus of Gold Coins and Sweeps Coins!"
                      : "Come back tomorrow for another bonus!"}
                  </p>
                  <Button
                    onClick={handleDailyBonus}
                    disabled={!dailyBonusAvailable || bonusLoading}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                  >
                    {bonusLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4 mr-2" />
                    )}
                    {dailyBonusAvailable ? "Claim Bonus" : "Claimed"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 border-gold-500/20">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-casino-blue/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Coins className="w-8 h-8 text-gold-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Slot Games</h3>
                  <p className="text-muted-foreground mb-4">
                    700+ slot games from top providers
                  </p>
                  <Link to="/games">
                    <Button className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-casino-blue/20">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-casino-blue/20 to-gold/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-casino-blue" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Poker Tables</h3>
                  <p className="text-muted-foreground mb-4">
                    Live poker games and tournaments
                  </p>
                  <Link to="/poker">
                    <Button className="w-full bg-casino-blue hover:bg-casino-blue-dark">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Join Table
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-purple-500/20">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple/20 to-pink/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Star className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Bingo Rooms</h3>
                  <p className="text-muted-foreground mb-4">
                    Join live bingo games with real prizes
                  </p>
                  <Link to="/bingo">
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Enter Room
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Withdraw Sweeps Coins</CardTitle>
                  <p className="text-muted-foreground">
                    Redeem your Sweeps Coins for real cash prizes (Minimum: 100
                    SC)
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* KYC Status Check */}
                  {user.kyc_status !== "verified" && (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <span className="font-bold text-orange-400">
                          KYC Verification Required
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        You must complete identity verification before
                        withdrawing Sweeps Coins.
                      </p>
                      <Button
                        onClick={() => setShowKycModal(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Complete KYC Verification
                      </Button>
                    </div>
                  )}

                  <div className="bg-casino-blue/5 border border-casino-blue/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-casino-blue" />
                      <span className="font-bold">Available Balance</span>
                    </div>
                    <div className="text-2xl font-bold text-casino-blue">
                      {balance.sc} Sweeps Coins
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ ${(balance.sc * 1).toFixed(2)} USD
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Withdrawal Amount (SC)
                    </label>
                    <Input
                      type="number"
                      placeholder="Minimum 100 SC"
                      value={withdrawalData.amount}
                      onChange={(e) =>
                        setWithdrawalData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      min="100"
                      max={balance.sc}
                    />
                    {withdrawalData.amount &&
                      parseFloat(withdrawalData.amount) < 100 && (
                        <p className="text-red-500 text-sm mt-1">
                          Minimum withdrawal amount is 100 Sweeps Coins
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Withdrawal Method
                    </label>
                    <select
                      className="w-full p-2 border border-border rounded-lg bg-background"
                      value={withdrawalData.method}
                      onChange={(e) =>
                        setWithdrawalData((prev) => ({
                          ...prev,
                          method: e.target.value,
                        }))
                      }
                    >
                      <option value="bank">Bank Transfer (ACH)</option>
                      <option value="paypal">PayPal</option>
                      <option value="check">Paper Check (7-10 days)</option>
                    </select>
                  </div>

                  {withdrawalData.method === "bank" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Account Holder Name
                        </label>
                        <Input
                          placeholder="Full name on account"
                          value={withdrawalData.accountInfo}
                          onChange={(e) =>
                            setWithdrawalData((prev) => ({
                              ...prev,
                              accountInfo: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Routing Number
                          </label>
                          <Input
                            placeholder="9-digit routing number"
                            value={withdrawalData.routingNumber}
                            onChange={(e) =>
                              setWithdrawalData((prev) => ({
                                ...prev,
                                routingNumber: e.target.value,
                              }))
                            }
                            maxLength={9}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Account Number
                          </label>
                          <Input
                            placeholder="Account number"
                            value={withdrawalData.accountNumber}
                            onChange={(e) =>
                              setWithdrawalData((prev) => ({
                                ...prev,
                                accountNumber: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Account Type
                        </label>
                        <select
                          className="w-full p-2 border border-border rounded-lg bg-background"
                          value={withdrawalData.accountType}
                          onChange={(e) =>
                            setWithdrawalData((prev) => ({
                              ...prev,
                              accountType: e.target.value,
                            }))
                          }
                        >
                          <option value="checking">Checking Account</option>
                          <option value="savings">Savings Account</option>
                        </select>
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleWithdrawal}
                    disabled={
                      !canWithdraw() ||
                      !withdrawalData.amount ||
                      parseFloat(withdrawalData.amount) < 100
                    }
                    className="w-full bg-casino-blue hover:bg-casino-blue-dark"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Submit Withdrawal Request
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {user.kyc_status === "verified" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">
                        Identity verification (KYC) completed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {balance.sc >= 100 ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">
                        Minimum 100 Sweeps Coins available
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className="text-sm">
                        Processing time: 1-3 business days
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-casino-blue" />
                      <span className="text-sm">
                        Secure bank-grade encryption
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-2">Recent Withdrawals</h3>
                    <div className="space-y-2">
                      {transactions
                        .filter(
                          (tx) => formatTransactionType(tx) === "withdrawal",
                        )
                        .slice(0, 3)
                        .map((tx) => (
                          <div
                            key={tx.id}
                            className="flex justify-between text-sm p-2 bg-muted/20 rounded"
                          >
                            <span>
                              {tx.amount} {tx.currency.toUpperCase()}
                            </span>
                            <span className="text-green-500">Completed</span>
                          </div>
                        ))}
                      {transactions.filter(
                        (tx) => formatTransactionType(tx) === "withdrawal",
                      ).length === 0 && (
                        <p className="text-muted-foreground text-sm">
                          No withdrawals yet
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transaction History */}
          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <p className="text-muted-foreground">
                  Complete history of all your account activity
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Balance After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-border/50 hover:bg-muted/50"
                        >
                          <td className="p-2">
                            <Badge
                              variant={
                                tx.type === "credit" ? "default" : "destructive"
                              }
                            >
                              {tx.type === "credit" ? "Credit" : "Debit"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <span
                              className={`font-mono ${tx.currency === "sc" ? "text-casino-blue" : "text-gold-400"}`}
                            >
                              {tx.type === "credit" ? "+" : "-"}
                              {tx.amount.toLocaleString()}{" "}
                              {tx.currency.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-2 text-sm">{tx.description}</td>
                          <td className="p-2 text-sm">
                            {tx.transactionDate.toLocaleDateString()}{" "}
                            {tx.transactionDate.toLocaleTimeString()}
                          </td>
                          <td className="p-2 text-sm font-mono">
                            {tx.balanceAfter.toLocaleString()}{" "}
                            {tx.currency.toUpperCase()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions yet. Start playing to see your activity
                      here!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Username
                    </label>
                    <Input value={user.username} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input value={user.email} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Account Status
                    </label>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Member Since
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security & Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Account Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Privacy Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* KYC Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-casino-blue" />
                KYC Verification Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To withdraw Sweeps Coins, you must complete identity
                verification as required by law.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Upload government-issued ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Take verification selfie</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Verify address information</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-casino-blue hover:bg-casino-blue-dark"
                  onClick={() => {
                    toast({
                      title: "KYC Process",
                      description:
                        "KYC verification page would open here in a real implementation.",
                    });
                    setShowKycModal(false);
                  }}
                >
                  Start Verification
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowKycModal(false)}
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
