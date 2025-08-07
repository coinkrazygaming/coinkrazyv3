import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Coins,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Crown,
  DollarSign,
  Settings,
  AlertCircle,
} from "lucide-react";
import {
  walletService,
  UserWallet,
  CurrencyType,
} from "../services/walletService";
import { useToast } from "@/hooks/use-toast";

interface CurrencySelectorProps {
  userId: string;
  gameType?: "slots" | "table" | "live" | "bingo" | "sportsbook";
  onCurrencyChange?: (currency: CurrencyType) => void;
  className?: string;
  compact?: boolean;
  showSettings?: boolean;
  allowedCurrencies?: CurrencyType[];
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  userId,
  gameType = "slots",
  onCurrencyChange,
  className = "",
  compact = false,
  showSettings = true,
  allowedCurrencies,
}) => {
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>("GC");
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [previousWallet, setPreviousWallet] = useState<UserWallet | null>(null);
  const { toast } = useToast();

  // Determine allowed currencies based on game type
  const getAvailableCurrencies = (): CurrencyType[] => {
    if (allowedCurrencies) return allowedCurrencies;

    switch (gameType) {
      case "sportsbook":
        return ["SC"]; // Sportsbook only allows Sweeps Coins
      case "slots":
      case "table":
      case "live":
      case "bingo":
      default:
        return ["GC", "SC"]; // All other games allow both currencies
    }
  };

  const availableCurrencies = getAvailableCurrencies();

  useEffect(() => {
    loadWallet();

    // Subscribe to real-time wallet updates
    const unsubscribe = walletService.subscribeToWalletUpdates(
      userId,
      (newWallet) => {
        setPreviousWallet(wallet);
        setWallet(newWallet);
        setLastUpdate(new Date());
      },
    );

    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    // Set default currency based on game type
    if (gameType === "sportsbook" && selectedCurrency !== "SC") {
      setSelectedCurrency("SC");
      onCurrencyChange?.("SC");
    } else if (!availableCurrencies.includes(selectedCurrency)) {
      const defaultCurrency = availableCurrencies[0];
      setSelectedCurrency(defaultCurrency);
      onCurrencyChange?.(defaultCurrency);
    }
  }, [gameType, availableCurrencies, selectedCurrency, onCurrencyChange]);

  const loadWallet = async () => {
    setIsLoading(true);
    try {
      const userWallet = await walletService.getUserWallet(userId);
      setWallet(userWallet);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading wallet:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet balance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrencySwitch = (currency: CurrencyType) => {
    if (!availableCurrencies.includes(currency)) {
      toast({
        title: "Currency Not Available",
        description: `${currency} is not available for ${gameType}`,
        variant: "destructive",
      });
      return;
    }

    setSelectedCurrency(currency);
    onCurrencyChange?.(currency);

    toast({
      title: "Currency Changed",
      description: `Now playing with ${currency === "GC" ? "Gold Coins" : "Sweeps Coins"}`,
    });
  };

  const handleRefresh = async () => {
    await loadWallet();
    toast({
      title: "Wallet Refreshed",
      description: "Balance updated successfully",
    });
  };

  const formatBalance = (amount: number, currency: CurrencyType): string => {
    if (currency === "GC") {
      return amount >= 1000000
        ? `${(amount / 1000000).toFixed(2)}M`
        : amount >= 1000
          ? `${(amount / 1000).toFixed(1)}K`
          : amount.toLocaleString();
    } else {
      return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  const getCurrencyIcon = (currency: CurrencyType) => {
    switch (currency) {
      case "GC":
        return <Coins className="w-4 h-4 text-gold-500" />;
      case "SC":
        return <Star className="w-4 h-4 text-purple-500" />;
      case "USD":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      default:
        return <Coins className="w-4 h-4" />;
    }
  };

  const getCurrencyName = (currency: CurrencyType): string => {
    switch (currency) {
      case "GC":
        return "Gold Coins";
      case "SC":
        return "Sweeps Coins";
      case "USD":
        return "US Dollars";
      default:
        return currency;
    }
  };

  const getChangeIndicator = (
    current: number,
    previous: number | undefined,
  ) => {
    if (!previous || current === previous) return null;

    const isIncrease = current > previous;
    const difference = Math.abs(current - previous);

    return (
      <div
        className={`flex items-center gap-1 text-xs ${isIncrease ? "text-green-400" : "text-red-400"}`}
      >
        {isIncrease ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>
          {isIncrease ? "+" : "-"}
          {formatBalance(difference, selectedCurrency)}
        </span>
      </div>
    );
  };

  const getCurrentBalance = (): number => {
    if (!wallet) return 0;
    switch (selectedCurrency) {
      case "GC":
        return wallet.goldCoins;
      case "SC":
        return wallet.sweepsCoins;
      case "USD":
        return wallet.cashBalance || 0;
      default:
        return 0;
    }
  };

  const getPreviousBalance = (): number | undefined => {
    if (!previousWallet) return undefined;
    switch (selectedCurrency) {
      case "GC":
        return previousWallet.goldCoins;
      case "SC":
        return previousWallet.sweepsCoins;
      case "USD":
        return previousWallet.cashBalance || 0;
      default:
        return undefined;
    }
  };

  if (!wallet) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-muted rounded-full"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-6 bg-muted rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Currency Toggle */}
        <div className="flex items-center gap-2">
          {availableCurrencies.length > 1 ? (
            availableCurrencies.map((currency) => (
              <Button
                key={currency}
                variant={selectedCurrency === currency ? "default" : "outline"}
                size="sm"
                onClick={() => handleCurrencySwitch(currency)}
                className={`h-8 ${
                  selectedCurrency === currency
                    ? currency === "GC"
                      ? "bg-gold-500 hover:bg-gold-600 text-black"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                    : ""
                }`}
              >
                {getCurrencyIcon(currency)}
                <span className="ml-1 text-xs">{currency}</span>
              </Button>
            ))
          ) : (
            <Badge
              variant="outline"
              className={`${
                selectedCurrency === "GC"
                  ? "border-gold-500 text-gold-400"
                  : "border-purple-500 text-purple-400"
              }`}
            >
              {getCurrencyIcon(selectedCurrency)}
              <span className="ml-1">{selectedCurrency}</span>
            </Badge>
          )}
        </div>

        {/* Balance Display */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 h-auto"
          >
            {isVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>

          <div className="flex items-center gap-2">
            <span className="font-bold">
              {isVisible
                ? formatBalance(getCurrentBalance(), selectedCurrency)
                : "••••••"}
            </span>
            <span className="text-xs text-muted-foreground">
              {selectedCurrency}
            </span>
            {getChangeIndicator(getCurrentBalance(), getPreviousBalance())}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1 h-auto"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`${className} bg-gradient-to-r from-card via-card to-card border-border/50 shadow-lg`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-casino-blue" />
            <h3 className="font-semibold">Game Wallet</h3>
            <Badge variant="outline" className="text-xs">
              {gameType.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              LIVE
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="p-1 h-auto"
            >
              {isVisible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1 h-auto"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>

            {showSettings && (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Settings className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Wallet Settings</h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto-refresh balance</span>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Show balance changes</span>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Low balance alerts</span>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <h5 className="text-sm font-medium mb-2">Game Limits</h5>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Daily bet limit:</span>
                          <span>$500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Session limit:</span>
                          <span>$100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Currency Selection */}
        {availableCurrencies.length > 1 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Playing with:</span>
            </div>
            <div className="flex gap-2">
              {availableCurrencies.map((currency) => (
                <Button
                  key={currency}
                  variant={
                    selectedCurrency === currency ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleCurrencySwitch(currency)}
                  className={`flex-1 ${
                    selectedCurrency === currency
                      ? currency === "GC"
                        ? "bg-gold-500 hover:bg-gold-600 text-black"
                        : currency === "SC"
                          ? "bg-purple-500 hover:bg-purple-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      : ""
                  }`}
                >
                  {getCurrencyIcon(currency)}
                  <span className="ml-2">{getCurrencyName(currency)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Current Balance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getCurrencyIcon(selectedCurrency)}
              <span className="font-medium">
                {getCurrencyName(selectedCurrency)}
              </span>
              {selectedCurrency === "SC" && (
                <Badge
                  variant="outline"
                  className="text-xs border-purple-500 text-purple-400"
                >
                  REDEEMABLE
                </Badge>
              )}
            </div>
            {getChangeIndicator(getCurrentBalance(), getPreviousBalance())}
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">
              {isVisible
                ? formatBalance(getCurrentBalance(), selectedCurrency)
                : "••••••"}
            </div>
            <span className="text-muted-foreground">{selectedCurrency}</span>
          </div>

          {/* Balance Breakdown */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Coins className="w-3 h-3 text-gold-500" />
                <span className="text-xs text-muted-foreground">
                  Gold Coins
                </span>
              </div>
              <div className="text-sm font-medium">
                {isVisible ? formatBalance(wallet.goldCoins, "GC") : "••••••"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-muted-foreground">
                  Sweeps Coins
                </span>
              </div>
              <div className="text-sm font-medium">
                {isVisible ? formatBalance(wallet.sweepsCoins, "SC") : "••••••"}
              </div>
            </div>
          </div>

          {/* Game Type Notice */}
          {gameType === "sportsbook" && (
            <div className="flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-purple-400">
                Sportsbook only accepts Sweeps Coins
              </span>
            </div>
          )}

          {/* Low Balance Warning */}
          {getCurrentBalance() < 10 && (
            <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-orange-400">
                Low balance - Consider adding more{" "}
                {getCurrencyName(selectedCurrency)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>Real-time</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencySelector;
