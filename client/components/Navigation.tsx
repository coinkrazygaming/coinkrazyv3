import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Users,
  Settings,
  Menu,
  Crown,
  Gift,
  Phone,
  Plus,
  Wallet,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  analyticsService,
  type RealTimeData,
  type UserWalletBalance,
} from "../services/realTimeAnalytics";
import { useAuth } from "../hooks/useAuth";

export default function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [walletBalance, setWalletBalance] = useState<UserWalletBalance | null>(
    null,
  );
  const [showWalletCurrency, setShowWalletCurrency] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<"USD" | "BTC" | "ETH">(
    "USD",
  );

  // Real user authentication state
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Subscribe to real-time analytics data
    const unsubscribe = analyticsService.subscribe(
      "navigation",
      (data: RealTimeData) => {
        setRealTimeData(data);
      },
    );

    // Load wallet balance if user is logged in
    if (user?.isLoggedIn) {
      loadWalletBalance();
      const walletInterval = setInterval(loadWalletBalance, 5000); // Update every 5 seconds
      return () => {
        clearInterval(walletInterval);
        unsubscribe();
      };
    }

    return unsubscribe;
  }, [user?.isLoggedIn, user?.id]);

  const loadWalletBalance = async () => {
    if (!user?.id) return;

    try {
      const balance = await analyticsService.getUserWalletBalance(user.id);
      setWalletBalance(balance);
    } catch (error) {
      console.error("Failed to load wallet balance:", error);
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: Crown },
    { path: "/games", label: "Games", icon: Coins },
    { path: "/store", label: "Store", icon: Plus },
    { path: "/login", label: "Login", icon: Users, hideWhenLoggedIn: true },
    { path: "/register", label: "Sign Up", icon: Gift, hideWhenLoggedIn: true },
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: Users,
      requiresLogin: true,
    },
    { path: "/admin", label: "Admin", icon: Settings, adminOnly: true },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.hideWhenLoggedIn && user?.isLoggedIn) return false;
    if (item.requiresLogin && !user?.isLoggedIn) return false;
    if (item.adminOnly && (!user?.isLoggedIn || !user?.isAdmin)) return false;
    return true;
  });

  const formatCurrency = (amount: number, currency: string) => {
    switch (currency) {
      case "BTC":
        return `₿${(amount / 45000).toFixed(6)}`; // Rough BTC conversion
      case "ETH":
        return `Ξ${(amount / 2500).toFixed(4)}`; // Rough ETH conversion
      default:
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const toggleCurrency = () => {
    const currencies: ("USD" | "BTC" | "ETH")[] = ["USD", "BTC", "ETH"];
    const currentIndex = currencies.indexOf(currentCurrency);
    const nextIndex = (currentIndex + 1) % currencies.length;
    setCurrentCurrency(currencies[nextIndex]);
  };

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              CoinKrazy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Real-time Players Online */}
            <div className="flex items-center gap-2 text-sm">
              <Badge
                variant="outline"
                className="border-gold-500 text-gold-400"
              >
                <Users className="w-3 h-3 mr-1" />
                {realTimeData
                  ? realTimeData.playersOnline.toLocaleString()
                  : "..."}{" "}
                Online
              </Badge>
            </div>

            {/* Wallet Balance (logged in users only) */}
            {user?.isLoggedIn && walletBalance && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWalletCurrency(!showWalletCurrency)}
                  className="border-casino-blue text-casino-blue hover:bg-casino-blue/10"
                >
                  <Wallet className="w-3 h-3 mr-1" />
                  {currentCurrency === "USD"
                    ? formatCurrency(walletBalance.usdBalance, currentCurrency)
                    : currentCurrency === "BTC"
                      ? formatCurrency(walletBalance.usdBalance, "BTC")
                      : formatCurrency(walletBalance.usdBalance, "ETH")}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>

                {/* Currency Toggle Dropdown */}
                {showWalletCurrency && (
                  <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[200px] z-50">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground font-medium border-b border-border pb-1">
                        Wallet Balance
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gold-400">Gold Coins:</span>
                          <span className="font-medium">
                            {walletBalance.goldCoins.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-400">Sweeps Coins:</span>
                          <span className="font-medium">
                            {walletBalance.sweepsCoins.toFixed(2)} SC
                          </span>
                        </div>
                        <div className="border-t border-border pt-1 mt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={toggleCurrency}
                            className="w-full justify-between text-xs"
                          >
                            <span>USD Balance:</span>
                            <span className="font-medium">
                              {formatCurrency(walletBalance.usdBalance, "USD")}
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={toggleCurrency}
                            className="w-full justify-between text-xs"
                          >
                            <span>BTC Equivalent:</span>
                            <span className="font-medium">
                              {formatCurrency(walletBalance.usdBalance, "BTC")}
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={toggleCurrency}
                            className="w-full justify-between text-xs"
                          >
                            <span>ETH Equivalent:</span>
                            <span className="font-medium">
                              {formatCurrency(walletBalance.usdBalance, "ETH")}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Phone */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>319-473-0416</span>
            </div>

            {/* Play Now Button */}
            <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
              Play Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="space-y-2">
              {/* Mobile real-time stats */}
              <div className="px-3 py-2 text-center">
                <Badge
                  variant="outline"
                  className="border-gold-500 text-gold-400 mb-2"
                >
                  <Users className="w-3 h-3 mr-1" />
                  {realTimeData
                    ? realTimeData.playersOnline.toLocaleString()
                    : "..."}{" "}
                  Online
                </Badge>
                {user?.isLoggedIn && walletBalance && (
                  <div className="text-xs text-muted-foreground">
                    Balance:{" "}
                    {formatCurrency(walletBalance.usdBalance, currentCurrency)}
                  </div>
                )}
              </div>

              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t border-border/50">
                <Button className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
                  Play Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close wallet dropdown */}
        {showWalletCurrency && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowWalletCurrency(false)}
          />
        )}
      </div>
    </nav>
  );
}
