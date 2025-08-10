import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/ui/Logo";
import { playerCountService } from "@/services/playerCountService";
import RealTimeBalance from "@/components/RealTimeBalance";
import WalletBalance from "@/components/WalletBalance";
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
import { useNavigate } from "react-router-dom";
import {
  analyticsService,
  type RealTimeData,
  type UserWalletBalance,
} from "../services/realTimeAnalytics";
import { useAuth } from "../hooks/useAuth";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [walletBalance, setWalletBalance] = useState<UserWalletBalance | null>(
    null,
  );
  const [showWalletCurrency, setShowWalletCurrency] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<"USD" | "BTC" | "ETH">(
    "USD",
  );
  const [playerCount, setPlayerCount] = useState<number>(0);

  // Real user authentication state
  const { user, logout, isLoading: authLoading } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log("Navigation: Auth state changed", {
      user: user
        ? {
            id: user.id,
            email: user.email,
            isLoggedIn: user.isLoggedIn,
            isAdmin: user.isAdmin,
          }
        : null,
      authLoading,
    });
  }, [user, authLoading]);

  useEffect(() => {
    // Subscribe to real-time analytics data
    const unsubscribeAnalytics = analyticsService.subscribe(
      "navigation",
      (data: RealTimeData) => {
        setRealTimeData(data);
      },
    );

    // Subscribe to real-time player count
    const unsubscribePlayers = playerCountService.subscribeToPlayerCount(
      (count) => {
        setPlayerCount(count);
      },
    );

    // Load wallet balance if user is logged in
    if (user?.isLoggedIn) {
      loadWalletBalance();
      const walletInterval = setInterval(loadWalletBalance, 5000); // Update every 5 seconds
      return () => {
        clearInterval(walletInterval);
        unsubscribeAnalytics();
        unsubscribePlayers();
      };
    }

    return () => {
      unsubscribeAnalytics();
      unsubscribePlayers();
    };
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
    <nav className="bg-gradient-to-r from-card/80 via-purple-900/10 to-card/80 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" showText={true} />
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
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10 hover:border-purple-400/30"
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
                className="border-purple-500 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                <Users className="w-3 h-3 mr-1" />
                {playerCount > 0 ? playerCount.toLocaleString() : "..."} Online
              </Badge>
            </div>

            {/* Enhanced Wallet Balance (logged in users only) */}
            {user?.isLoggedIn && (
              <WalletBalance userId={user.id || "user-1"} compact={true} />
            )}

            {/* Contact Phone */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>319-473-0416</span>
            </div>

            {/* Auth Buttons */}
            {user?.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
                    Register
                  </Button>
                </Link>
              </div>
            )}
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
                {user?.isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="text-center text-sm text-muted-foreground mb-2">
                      Welcome, {user.username}
                    </div>
                    <Button
                      onClick={logout}
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      variant="outline"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
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
