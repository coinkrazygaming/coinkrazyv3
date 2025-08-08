import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user?.isLoggedIn) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not logged in (will redirect)
  if (!user?.isLoggedIn) {
    return null;
  }

  const [mockUser] = useState({
    username: "player123",
    email: "player123@email.com",
    joinDate: "2024-01-15",
    kycStatus: "verified", // 'pending', 'verified', 'rejected', 'not_started'
    vipLevel: "Gold",
    gcBalance: 125000,
    scBalance: 450,
    isKycRequired: true, // Always require KYC for SC withdrawals
    kycDocuments: {
      idFront: true,
      idBack: true,
      selfie: true,
      addressProof: true,
    },
  });

  const [transactions] = useState([
    {
      id: 1,
      type: "deposit",
      amount: 500,
      currency: "GC",
      method: "Credit Card",
      status: "completed",
      date: "2024-03-20 14:30",
      txHash: "tx_1234567890",
    },
    {
      id: 2,
      type: "win",
      amount: 1250,
      currency: "GC",
      method: "Josey Duck Game",
      status: "completed",
      date: "2024-03-20 13:45",
      txHash: "tx_0987654321",
    },
    {
      id: 3,
      type: "withdrawal",
      amount: 150,
      currency: "SC",
      method: "Bank Transfer",
      status: "completed",
      date: "2024-03-20 12:15",
      txHash: "tx_1122334455",
    },
    {
      id: 4,
      type: "bonus",
      amount: 100000,
      currency: "GC",
      method: "Welcome Bonus",
      status: "completed",
      date: "2024-03-15 10:00",
      txHash: "tx_5544332211",
    },
    {
      id: 5,
      type: "bonus",
      amount: 50,
      currency: "SC",
      method: "Welcome Bonus",
      status: "completed",
      date: "2024-03-15 10:00",
      txHash: "tx_9988776655",
    },
  ]);

  const [coinPackages] = useState([
    {
      id: 1,
      name: "Starter Pack",
      gc: 50000,
      sc: 25,
      price: 9.99,
      popular: false,
      savings: 0,
    },
    {
      id: 2,
      name: "Popular Pack",
      gc: 125000,
      sc: 75,
      price: 19.99,
      popular: true,
      savings: 25,
    },
    {
      id: 3,
      name: "Premium Pack",
      gc: 300000,
      sc: 200,
      price: 49.99,
      popular: false,
      savings: 50,
    },
    {
      id: 4,
      name: "VIP Pack",
      gc: 750000,
      sc: 500,
      price: 99.99,
      popular: false,
      savings: 100,
    },
  ]);

  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    method: "bank",
    accountInfo: "",
    routingNumber: "",
    accountNumber: "",
    accountType: "checking",
  });

  const [showKycModal, setShowKycModal] = useState(false);
  const [kycUploadStep, setKycUploadStep] = useState(1);

  const [liveStats, setLiveStats] = useState({
    todayWins: 2450,
    bestGame: "Josey Duck Game",
    playTime: "2h 34m",
    rank: 156,
    totalWithdrawn: 1250,
    lifetimeWinnings: 8945,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats((prev) => ({
        ...prev,
        todayWins: prev.todayWins + Math.floor(Math.random() * 100),
        playTime: `${Math.floor(Math.random() * 5) + 2}h ${Math.floor(Math.random() * 60)}m`,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleWithdrawal = () => {
    const amount = parseFloat(withdrawalData.amount);

    // Validation checks
    if (!amount || amount < 100) {
      alert("Minimum withdrawal amount is 100 Sweeps Coins");
      return;
    }

    if (amount > user.scBalance) {
      alert("Insufficient Sweeps Coin balance");
      return;
    }

    if (user.kycStatus !== "verified") {
      setShowKycModal(true);
      return;
    }

    if (
      !withdrawalData.accountInfo ||
      !withdrawalData.routingNumber ||
      !withdrawalData.accountNumber
    ) {
      alert("Please fill in all banking information");
      return;
    }

    // Process withdrawal
    console.log("Processing withdrawal:", {
      amount,
      method: withdrawalData.method,
      accountInfo: withdrawalData.accountInfo,
      routingNumber: withdrawalData.routingNumber,
      accountNumber: withdrawalData.accountNumber,
      accountType: withdrawalData.accountType,
    });

    alert(`Withdrawal request for ${amount} SC submitted successfully!`);
    setWithdrawalData({
      amount: "",
      method: "bank",
      accountInfo: "",
      routingNumber: "",
      accountNumber: "",
      accountType: "checking",
    });
  };

  const canWithdraw = () => {
    return user.kycStatus === "verified" && user.scBalance >= 100;
  };

  const getKycStatusColor = () => {
    switch (user.kycStatus) {
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
    switch (user.kycStatus) {
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
                  {user.vipLevel} VIP
                </Badge>
                <Badge className={`${getKycStatusColor()}`}>
                  {getKycStatusIcon()}
                  <span className="ml-1">KYC {user.kycStatus}</span>
                </Badge>
              </div>
            </div>

            {/* Balance Display */}
            <div className="flex gap-4">
              <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold-500/20">
                <CardContent className="p-4 text-center">
                  <Coins className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gold-400">
                    {user.gcBalance.toLocaleString()}
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
                    {user.scBalance}
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
                  <p className="text-sm text-muted-foreground">Today's Wins</p>
                  <p className="text-xl font-bold text-gold-400">
                    {liveStats.todayWins.toLocaleString()}
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
                    ${liveStats.totalWithdrawn}
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
                  <p className="text-sm text-muted-foreground">
                    Lifetime Winnings
                  </p>
                  <p className="text-xl font-bold text-gold-400">
                    {liveStats.lifetimeWinnings.toLocaleString()}
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
                  <p className="text-sm text-muted-foreground">Leaderboard</p>
                  <p className="text-xl font-bold">#{liveStats.rank}</p>
                </div>
                <Star className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="buy-coins">
              <Plus className="w-4 h-4 mr-2" />
              Buy Coins
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          {tx.type === "deposit" && (
                            <Plus className="w-5 h-5 text-green-500" />
                          )}
                          {tx.type === "withdrawal" && (
                            <Download className="w-5 h-5 text-red-500" />
                          )}
                          {tx.type === "win" && (
                            <Trophy className="w-5 h-5 text-gold-500" />
                          )}
                          {tx.type === "bonus" && (
                            <Gift className="w-5 h-5 text-purple-500" />
                          )}
                          <div>
                            <div className="font-medium capitalize">
                              {tx.type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {tx.method}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold ${tx.currency === "SC" ? "text-casino-blue" : "text-gold-400"}`}
                          >
                            {tx.amount.toLocaleString()} {tx.currency}
                          </div>
                          <Badge
                            variant={
                              tx.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Bonus */}
              <Card className="bg-gradient-to-br from-gold/5 to-casino-blue/5 border-gold-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-gold-500" />
                    Daily Bonus Wheel
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-gold/20 to-casino-blue/20 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-gold-500/30">
                    <RotateCcw className="w-12 h-12 text-gold-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    Spin for Free Coins!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Come back daily to spin the bonus wheel and earn free Gold
                    Coins and Sweeps Coins.
                  </p>
                  <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Spin Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Buy Coins Tab */}
          <TabsContent value="buy-coins" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gold Coin Packages</CardTitle>
                <p className="text-muted-foreground">
                  Purchase Gold Coins for gameplay and receive bonus Sweeps
                  Coins
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {coinPackages.map((pkg) => (
                    <Card
                      key={pkg.id}
                      className={`relative ${pkg.popular ? "border-gold-500 bg-gradient-to-br from-gold/5 to-gold/10" : ""}`}
                    >
                      {pkg.popular && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gold-500 text-black">
                          Most Popular
                        </Badge>
                      )}
                      {pkg.savings > 0 && (
                        <Badge className="absolute -top-2 right-2 bg-green-500 text-white">
                          Save ${pkg.savings}
                        </Badge>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle>{pkg.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-1">
                            <Coins className="w-5 h-5 text-gold-500" />
                            <span className="text-xl font-bold text-gold-400">
                              {pkg.gc.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Gold Coins
                          </div>

                          <div className="flex items-center justify-center gap-1">
                            <Crown className="w-4 h-4 text-casino-blue" />
                            <span className="text-lg font-bold text-casino-blue">
                              {pkg.sc}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Bonus Sweeps Coins
                          </div>
                        </div>

                        <div className="py-4">
                          <div className="text-3xl font-bold">${pkg.price}</div>
                        </div>

                        <Button
                          className={`w-full ${pkg.popular ? "bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black" : ""}`}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Purchase
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-muted/20 rounded-lg">
                  <h3 className="font-bold mb-2">Secure Payment Methods</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-casino-blue" />
                      <span>Credit/Debit Cards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-green-500" />
                      <span>Apple Pay</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-500" />
                      <span>Google Pay</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gold-500" />
                      <span>Bank Transfer</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  {user.kycStatus !== "verified" && (
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
                      {user.scBalance} Sweeps Coins
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ ${(user.scBalance * 1).toFixed(2)} USD
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
                      max={user.scBalance}
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
                      {user.kycStatus === "verified" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">
                        Identity verification (KYC) completed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.scBalance >= 100 ? (
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
                        .filter((tx) => tx.type === "withdrawal")
                        .map((tx) => (
                          <div
                            key={tx.id}
                            className="flex justify-between text-sm p-2 bg-muted/20 rounded"
                          >
                            <span>
                              {tx.amount} {tx.currency}
                            </span>
                            <Badge
                              variant={
                                tx.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {tx.status}
                            </Badge>
                          </div>
                        ))}
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
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Method</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">TX Hash</th>
                        <th className="text-left p-2">Actions</th>
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
                                tx.type === "deposit"
                                  ? "default"
                                  : tx.type === "withdrawal"
                                    ? "destructive"
                                    : tx.type === "win"
                                      ? "default"
                                      : "secondary"
                              }
                            >
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <span
                              className={`font-mono ${tx.currency === "SC" ? "text-casino-blue" : "text-gold-400"}`}
                            >
                              {tx.amount.toLocaleString()} {tx.currency}
                            </span>
                          </td>
                          <td className="p-2 text-sm">{tx.method}</td>
                          <td className="p-2">
                            <Badge
                              variant={
                                tx.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm">{tx.date}</td>
                          <td className="p-2 text-xs font-mono text-muted-foreground">
                            {tx.txHash}
                          </td>
                          <td className="p-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
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
                  <Button className="w-full">Update Profile</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Data
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
                <Link to="/kyc" className="flex-1">
                  <Button className="w-full bg-casino-blue hover:bg-casino-blue-dark">
                    Start Verification
                  </Button>
                </Link>
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
