import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Coins,
  Star,
  ChevronDown,
  RefreshCw,
  TrendingUp,
  Gift,
  DollarSign,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { balanceService, UserBalance } from "@/services/balanceService";

interface WalletBalanceProps {
  userId: string;
  className?: string;
  compact?: boolean;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({
  userId,
  className = "",
  compact = false,
}) => {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [currentView, setCurrentView] = useState<"GC" | "SC">("GC");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [previousBalance, setPreviousBalance] = useState<UserBalance | null>(
    null,
  );

  useEffect(() => {
    // Initial balance load
    loadBalance();

    // Subscribe to real-time updates
    const unsubscribe = balanceService.subscribeToBalanceUpdates(
      userId,
      (newBalance) => {
        setPreviousBalance(balance);
        setBalance(newBalance);
      },
    );

    return unsubscribe;
  }, [userId]);

  const loadBalance = () => {
    setIsLoading(true);
    try {
      const userBalance = balanceService.getUserBalance(userId);
      setBalance(userBalance);
    } catch (error) {
      console.error("Error loading balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (amount: number, type: "GC" | "SC"): string => {
    if (type === "GC") {
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K`;
      }
      return amount.toLocaleString();
    } else {
      return amount.toFixed(2);
    }
  };

  const getBalanceChange = (
    current: number,
    previous: number | undefined,
    type: "GC" | "SC",
  ) => {
    if (!previous || current === previous) return null;

    const isIncrease = current > previous;
    const difference = Math.abs(current - previous);

    return (
      <div
        className={`flex items-center gap-1 text-xs ${isIncrease ? "text-green-400" : "text-red-400"}`}
      >
        <TrendingUp className={`w-3 h-3 ${isIncrease ? "" : "rotate-180"}`} />
        <span>
          {isIncrease ? "+" : "-"}
          {formatBalance(difference, type)}
        </span>
      </div>
    );
  };

  const toggleCurrency = () => {
    setCurrentView(currentView === "GC" ? "SC" : "GC");
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const getCashPrizeInfo = () => {
    if (currentView === "SC") {
      return {
        canWinCash: true,
        description: "Play for real cash prizes & gift shop items",
        icon: <DollarSign className="w-3 h-3 text-green-500" />,
        color: "border-green-500 text-green-400 bg-green-500/10",
      };
    } else {
      return {
        canWinCash: false,
        description: "Fun play with Gold Coins",
        icon: <Coins className="w-3 h-3 text-gold-500" />,
        color: "border-gold-500 text-gold-400 bg-gold-500/10",
      };
    }
  };

  if (!balance) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 w-24 bg-muted rounded"></div>
      </div>
    );
  }

  const currentAmount = currentView === "GC" ? balance.gc : balance.sc;
  const previousAmount =
    currentView === "GC" ? previousBalance?.gc : previousBalance?.sc;
  const prizeInfo = getCashPrizeInfo();

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCurrency}
          className={`${prizeInfo.color} border transition-all duration-200 hover:scale-105`}
        >
          {prizeInfo.icon}
          <span className="mx-1">
            {isVisible ? formatBalance(currentAmount, currentView) : "••••"}
          </span>
          <span className="text-xs">{currentView}</span>
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`${prizeInfo.color} border transition-all duration-200 hover:scale-105`}
      >
        <Wallet className="w-3 h-3 mr-1" />
        {isVisible ? formatBalance(currentAmount, currentView) : "••••"}
        <span className="text-xs ml-1">{currentView}</span>
        <ChevronDown className="w-3 h-3 ml-1" />
      </Button>

      {/* Enhanced Dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-xl p-3 min-w-[280px] z-50">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-sm font-semibold">Wallet Balance</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVisibility}
                  className="p-1 h-auto"
                >
                  {isVisible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadBalance}
                  disabled={isLoading}
                  className="p-1 h-auto"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            {/* Gold Coins */}
            <div className="space-y-2">
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  currentView === "GC"
                    ? "border-gold-500 bg-gold-500/10"
                    : "border-border hover:border-gold-400/50"
                }`}
                onClick={() => setCurrentView("GC")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-gold-500" />
                    <span className="text-sm font-medium">Gold Coins</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {isVisible ? formatBalance(balance.gc, "GC") : "••••••"}
                    </div>
                    {getBalanceChange(balance.gc, previousBalance?.gc, "GC")}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Fun play • No purchase necessary
                </div>
              </div>

              {/* Sweeps Coins */}
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  currentView === "SC"
                    ? "border-green-500 bg-green-500/10"
                    : "border-border hover:border-green-400/50"
                }`}
                onClick={() => setCurrentView("SC")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Sweeps Coins</span>
                    <Badge
                      variant="outline"
                      className="text-xs px-1 border-green-500 text-green-400"
                    >
                      CASH
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {isVisible ? formatBalance(balance.sc, "SC") : "••••"}
                    </div>
                    {getBalanceChange(balance.sc, previousBalance?.sc, "SC")}
                  </div>
                </div>
                <div className="mt-1 text-xs text-green-400">
                  Play for real cash prizes & gift shop items
                </div>
              </div>
            </div>

            {/* Current Mode Info */}
            <div className={`p-2 rounded-lg ${prizeInfo.color}`}>
              <div className="flex items-center gap-2">
                {prizeInfo.icon}
                <span className="text-xs font-medium">
                  Current Mode:{" "}
                  {currentView === "GC" ? "Gold Coins" : "Sweeps Coins"}
                </span>
              </div>
              <div className="text-xs mt-1">{prizeInfo.description}</div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" className="text-xs">
                <Gift className="w-3 h-3 mr-1" />
                Buy Coins
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Withdraw
              </Button>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-muted-foreground text-center pt-1 border-t border-border">
              Updated: {balance.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
