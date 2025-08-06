import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Coins,
  Crown,
  TrendingUp,
  TrendingDown,
  Info,
  Zap,
  Lock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Wallet,
  ArrowUpDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { balanceService, UserBalance } from "@/services/balanceService";
import { cn } from "@/lib/utils";

interface CurrencyToggleProps {
  currentCurrency: "GC" | "SC";
  onCurrencyChange: (currency: "GC" | "SC") => void;
  className?: string;
  showBalances?: boolean;
  showToggleInfo?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function CurrencyToggle({
  currentCurrency,
  onCurrencyChange,
  className,
  showBalances = true,
  showToggleInfo = true,
  size = "md",
}: CurrencyToggleProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [previousBalance, setPreviousBalance] = useState<UserBalance | null>(null);
  const [showChangeAnimation, setShowChangeAnimation] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [kycVerified, setKycVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    // Get initial balance
    const initialBalance = balanceService.getUserBalance(user.id);
    setBalance(initialBalance);
    setIsLoading(false);

    // Subscribe to real-time balance updates
    const unsubscribe = balanceService.subscribeToBalanceUpdates(
      user.id,
      (newBalance) => {
        setPreviousBalance(balance);
        setBalance(newBalance);
        
        // Show change animation
        setShowChangeAnimation(true);
        setTimeout(() => setShowChangeAnimation(false), 2000);
      }
    );

    // Mock KYC status (in production this would be from API)
    setKycVerified(user.email === "coinkrazy00@gmail.com" || Math.random() > 0.5);

    return unsubscribe;
  }, [user?.id, balance]);

  const formatCurrency = (amount: number, currency: "GC" | "SC") => {
    if (currency === "SC") {
      return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      });
    }
    return amount.toLocaleString();
  };

  const getBalanceChange = (currency: "GC" | "SC") => {
    if (!balance || !previousBalance) return 0;
    return balance[currency.toLowerCase() as keyof UserBalance] as number - 
           (previousBalance[currency.toLowerCase() as keyof UserBalance] as number);
  };

  const getCurrencyInfo = (currency: "GC" | "SC") => {
    if (currency === "GC") {
      return {
        name: "Gold Coins",
        description: "Fun play currency for practice and entertainment. Cannot be redeemed for cash prizes.",
        icon: <Coins className="w-5 h-5" />,
        color: "from-yellow-400 to-yellow-600",
        textColor: "text-yellow-600",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
        features: [
          "Free daily bonuses",
          "Practice gameplay",
          "All games available",
          "No cash value"
        ]
      };
    } else {
      return {
        name: "Sweeps Coins",
        description: "Premium currency that can be redeemed for cash prizes. KYC verification required for cashouts.",
        icon: <Crown className="w-5 h-5" />,
        color: "from-blue-400 to-blue-600",
        textColor: "text-blue-600",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        features: [
          "Real cash value ($1 = 1 SC)",
          "Cashout minimum: 100 SC",
          "KYC verification required",
          "Limited daily earning"
        ]
      };
    }
  };

  const canUseSweepsCoins = () => {
    return balance && balance.sc > 0 && kycVerified;
  };

  const sizeClasses = {
    sm: "text-sm p-2",
    md: "text-base p-3",
    lg: "text-lg p-4"
  };

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className={sizeClasses[size]}>
          <div className="h-8 bg-muted rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={cn("transition-all duration-300 hover:shadow-lg", className)}>
        <CardContent className={sizeClasses[size]}>
          <div className="flex items-center justify-between gap-4">
            {/* Currency Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={currentCurrency === "GC" ? "default" : "ghost"}
                  size={size}
                  onClick={() => onCurrencyChange("GC")}
                  className={cn(
                    "relative transition-all duration-300",
                    currentCurrency === "GC"
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                      : "hover:bg-muted-foreground/10"
                  )}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  GC
                  {currentCurrency === "GC" && (
                    <Badge className="ml-2 bg-yellow-700 text-white">Active</Badge>
                  )}
                </Button>
                
                <Button
                  variant={currentCurrency === "SC" ? "default" : "ghost"}
                  size={size}
                  onClick={() => onCurrencyChange("SC")}
                  disabled={!canUseSweepsCoins()}
                  className={cn(
                    "relative transition-all duration-300",
                    currentCurrency === "SC"
                      ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700"
                      : "hover:bg-muted-foreground/10",
                    !canUseSweepsCoins() && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  SC
                  {currentCurrency === "SC" && (
                    <Badge className="ml-2 bg-blue-700 text-white">Active</Badge>
                  )}
                  {!kycVerified && (
                    <Lock className="w-3 h-3 ml-1 text-red-500" />
                  )}
                </Button>
              </div>

              {showToggleInfo && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Currency Information</DialogTitle>
                      <DialogDescription>
                        Learn about the differences between Gold Coins and Sweeps Coins
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(["GC", "SC"] as const).map((currency) => {
                        const info = getCurrencyInfo(currency);
                        return (
                          <Card key={currency} className={cn("border-2", info.borderColor)}>
                            <CardContent className="p-4">
                              <div className={cn("flex items-center gap-3 mb-4 p-3 rounded-lg", info.bgColor)}>
                                <div className={cn("p-2 rounded-full bg-gradient-to-br", info.color)}>
                                  {info.icon}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg">{info.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {currency === "GC" ? "Play Currency" : "Premium Currency"}
                                  </p>
                                </div>
                              </div>
                              
                              <p className="text-sm mb-4">{info.description}</p>
                              
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Features:</h4>
                                {info.features.map((feature, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {!kycVerified && (
                      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <div>
                            <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                              KYC Verification Required
                            </h4>
                            <p className="text-sm text-amber-600 dark:text-amber-300">
                              Complete identity verification to unlock Sweeps Coins features and cashouts.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Balance Display */}
            {showBalances && balance && (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="p-1"
                >
                  {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>

                <div className="flex gap-4">
                  {/* Gold Coins Balance */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300",
                        currentCurrency === "GC" 
                          ? "bg-yellow-500/10 border-yellow-500/30" 
                          : "bg-muted/50 border-border",
                        showChangeAnimation && getBalanceChange("GC") !== 0 && "animate-pulse"
                      )}>
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {balanceVisible ? formatCurrency(balance.gc, "GC") : "•••••"}
                          </div>
                          <div className="text-xs text-muted-foreground">GC</div>
                        </div>
                        {showChangeAnimation && getBalanceChange("GC") !== 0 && (
                          <div className={cn(
                            "text-xs font-bold",
                            getBalanceChange("GC") > 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {getBalanceChange("GC") > 0 ? "+" : ""}
                            {formatCurrency(getBalanceChange("GC"), "GC")}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Gold Coins - Play Currency</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Sweeps Coins Balance */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300",
                        currentCurrency === "SC" 
                          ? "bg-blue-500/10 border-blue-500/30" 
                          : "bg-muted/50 border-border",
                        showChangeAnimation && getBalanceChange("SC") !== 0 && "animate-pulse"
                      )}>
                        <Crown className="w-4 h-4 text-blue-600" />
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {balanceVisible ? formatCurrency(balance.sc, "SC") : "•••••"}
                          </div>
                          <div className="text-xs text-muted-foreground">SC</div>
                        </div>
                        {!kycVerified && (
                          <Lock className="w-3 h-3 text-red-500" />
                        )}
                        {showChangeAnimation && getBalanceChange("SC") !== 0 && (
                          <div className={cn(
                            "text-xs font-bold",
                            getBalanceChange("SC") > 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {getBalanceChange("SC") > 0 ? "+" : ""}
                            {formatCurrency(getBalanceChange("SC"), "SC")}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sweeps Coins - Premium Currency</p>
                      {!kycVerified && <p className="text-red-400">KYC Required</p>}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Cashout eligibility indicator */}
                {currentCurrency === "SC" && kycVerified && (
                  <div className="text-xs">
                    {balance.sc >= 100 ? (
                      <Badge className="bg-green-500 text-white">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Cashout Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-muted-foreground/50">
                        {100 - balance.sc} SC to cashout
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Currency mode indicator */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getCurrencyInfo(currentCurrency).icon}
              <span className="text-sm font-medium">
                {getCurrencyInfo(currentCurrency).name} Mode
              </span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  currentCurrency === "GC" ? "border-yellow-500/50 text-yellow-600" : "border-blue-500/50 text-blue-600"
                )}
              >
                {currentCurrency === "GC" ? "Play Only" : "Real Rewards"}
              </Badge>
            </div>

            {currentCurrency === "SC" && !kycVerified && (
              <Button variant="outline" size="sm" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Verify Identity
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
