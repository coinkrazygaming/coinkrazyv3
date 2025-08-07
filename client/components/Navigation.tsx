import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/ui/Logo";
import { playerCountService } from "@/services/playerCountService";
import UserAccountHeader from "@/components/UserAccountHeader";
import CurrencyToggle from "@/components/CurrencyToggle";
import {
  Coins,
  Users,
  Settings,
  Menu,
  Crown,
  Gift,
  Phone,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  analyticsService,
  type RealTimeData,
} from "../services/realTimeAnalytics";
import { authService } from "../services/authService";
import { User } from "../types/auth";

export default function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const currentUser = authService.getUserByToken(token);
        setUser(currentUser);
      } else {
        setUser(null);
      }
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

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
  }, []);

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
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.requiresLogin && !user) return false;
    return true;
  });

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

            {/* Contact Phone */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>319-473-0416</span>
            </div>

            {/* User Account or Login */}
            <UserAccountHeader />
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
                  className="border-purple-500 text-purple-400 bg-purple-500/10 mb-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                  <Users className="w-3 h-3 mr-1" />
                  {playerCount > 0 ? playerCount.toLocaleString() : "..."}{" "}
                  Online
                </Badge>
                {user && (
                  <div className="mt-2">
                    <CurrencyToggle
                      compact={false}
                      showBalance={true}
                      showDropdown={false}
                      className="justify-center"
                    />
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

              {/* Mobile User Account Section */}
              <div className="px-3 py-2">
                <UserAccountHeader />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
