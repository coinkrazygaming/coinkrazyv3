import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import AnimatedLogo from "@/components/ui/AnimatedLogo";
import { playerCountService } from "@/services/playerCountService";
import MyAccountDropdown from "@/components/MyAccountDropdown";
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
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  analyticsService,
  type RealTimeData,
} from "../services/realTimeAnalytics";
import { useAuth } from "../hooks/useAuth";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<"GC" | "SC">("GC");
  const [playerCount, setPlayerCount] = useState<number>(0);

  // Real user authentication state
  const { user, logout, getBalance, isLoading: authLoading } = useAuth();

  // Handle logout with redirect
  const handleLogout = async () => {
    await logout();
    navigate("/"); // Redirect to home page after logout
  };

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

    return () => {
      unsubscribeAnalytics();
      unsubscribePlayers();
    };
  }, [user?.isLoggedIn, user?.id]);

  const navItems = [
    { path: "/", label: "Home", icon: Crown },
    { path: "/games", label: "Games", icon: Coins },
    { path: "/slots", label: "Slots", icon: Zap },
    { path: "/gold-store", label: "Gold Store", icon: Plus },
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

  const formatBalance = (amount: number, currency: "GC" | "SC") => {
    if (currency === "GC") {
      return `${amount.toLocaleString()} GC`;
    } else {
      return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SC`;
    }
  };

  return (
    <nav className="bg-gradient-to-r from-card/80 via-purple-900/10 to-card/80 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <AnimatedLogo size="md" showText={true} animated={true} />
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

            {/* Currency Toggle and Balance (logged in users only) */}
            {user && (
              <div className="flex items-center gap-3">
                {/* Currency Toggle */}
                <div className="flex items-center gap-2 text-sm">
                  <span className={`${selectedCurrency === "GC" ? "text-gold-400 font-medium" : "text-muted-foreground"} transition-colors`}>
                    GC
                  </span>
                  <span className="text-xs text-muted-foreground">FUN</span>
                  <Switch
                    checked={selectedCurrency === "SC"}
                    onCheckedChange={(checked) => setSelectedCurrency(checked ? "SC" : "GC")}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <span className="text-xs text-muted-foreground">REAL</span>
                  <span className={`${selectedCurrency === "SC" ? "text-green-400 font-medium" : "text-muted-foreground"} transition-colors`}>
                    SC
                  </span>
                </div>

                {/* Balance Display */}
                <Badge
                  variant="outline"
                  className={`${
                    selectedCurrency === "GC"
                      ? "border-gold-500 text-gold-400 bg-gold-500/10"
                      : "border-green-500 text-green-400 bg-green-500/10"
                  } font-mono`}
                >
                  <Wallet className="w-3 h-3 mr-1" />
                  {formatBalance(getBalance(selectedCurrency), selectedCurrency)}
                </Badge>
              </div>
            )}

            {/* Contact Phone */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>1-800-COIN-KRAZY</span>
            </div>

            {/* Auth Section */}
            <MyAccountDropdown />
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
              <div className="px-3 py-2 text-center space-y-2">
                <Badge
                  variant="outline"
                  className="border-purple-500 text-purple-400"
                >
                  <Users className="w-3 h-3 mr-1" />
                  {playerCount > 0 ? playerCount.toLocaleString() : "..."} Online
                </Badge>

                {/* Mobile Currency Toggle and Balance */}
                {user?.isLoggedIn && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <span className={`${selectedCurrency === "GC" ? "text-gold-400 font-medium" : "text-muted-foreground"} transition-colors`}>
                        GC
                      </span>
                      <span className="text-[10px] text-muted-foreground">FUN</span>
                      <Switch
                        checked={selectedCurrency === "SC"}
                        onCheckedChange={(checked) => setSelectedCurrency(checked ? "SC" : "GC")}
                        className="data-[state=checked]:bg-green-500 scale-75 mx-1"
                      />
                      <span className="text-[10px] text-muted-foreground">REAL</span>
                      <span className={`${selectedCurrency === "SC" ? "text-green-400 font-medium" : "text-muted-foreground"} transition-colors`}>
                        SC
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        selectedCurrency === "GC"
                          ? "border-gold-500 text-gold-400 bg-gold-500/10"
                          : "border-green-500 text-green-400 bg-green-500/10"
                      } font-mono text-xs`}
                    >
                      <Wallet className="w-3 h-3 mr-1" />
                      {formatBalance(getBalance(selectedCurrency), selectedCurrency)}
                    </Badge>
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
                {/* Mobile Account Section - Use MyAccountDropdown for consistent experience */}
                <div className="w-full">
                  <MyAccountDropdown />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
