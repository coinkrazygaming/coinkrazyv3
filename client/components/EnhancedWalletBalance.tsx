import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  walletService,
  WalletBalance,
  CurrencyData,
} from "@/services/walletService";
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowUpDown,
  Wallet,
  DollarSign,
  Activity,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedWalletBalanceProps {
  showPortfolio?: boolean;
  showExchange?: boolean;
}

export default function EnhancedWalletBalance({
  showPortfolio = false,
  showExchange = false,
}: EnhancedWalletBalanceProps) {
  const { user, getBalance } = useAuth();
  const { toast } = useToast();

  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [showAllBalances, setShowAllBalances] = useState(false);
  const [exchangeDialog, setExchangeDialog] = useState(false);
  const [exchangeFrom, setExchangeFrom] = useState("");
  const [exchangeTo, setExchangeTo] = useState("");
  const [exchangeAmount, setExchangeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);

  useEffect(() => {
    if (user) {
      // Get initial data
      const userWallet = walletService.getUserBalance(user.email);
      setWallet(userWallet);

      const supportedCurrencies = walletService.getSupportedCurrencies();
      setCurrencies(supportedCurrencies);

      const defaultCurrency = walletService.getSelectedCurrency();
      setSelectedCurrency(defaultCurrency);

      // Subscribe to real-time updates
      const unsubscribeBalance = walletService.subscribeToBalanceUpdates(
        user.email,
        (updatedWallet) => setWallet(updatedWallet),
      );

      const unsubscribeCurrency = walletService.subscribeToCurrencyChanges(
        (currency) => setSelectedCurrency(currency),
      );

      return () => {
        unsubscribeBalance();
        unsubscribeCurrency();
      };
    }
  }, [user]);

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    walletService.setSelectedCurrency(currencyCode);
  };

  const getDisplayBalance = () => {
    if (!user || hideBalances) return hideBalances ? "***" : "0";

    const selectedCurrencyInfo = currencies.find(
      (c) => c.code === selectedCurrency,
    );
    if (!selectedCurrencyInfo) return "0";

    const balance = getBalance(selectedCurrency as 'GC' | 'SC');
    const decimals = selectedCurrencyInfo.decimals;

    return `${balance.toLocaleString(undefined, {
      minimumFractionDigits: decimals > 2 ? 2 : decimals,
      maximumFractionDigits: decimals,
    })} ${selectedCurrencyInfo.symbol}`;
  };

  const getPriceChange = (currencyCode: string) => {
    const priceData = walletService.getPriceData(currencyCode);
    return priceData.change24h;
  };

  const handleExchange = async () => {
    if (!exchangeFrom || !exchangeTo || !exchangeAmount || !user) {
      toast({
        title: "Invalid Exchange",
        description: "Please fill in all exchange fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = walletService.exchangeCurrency(
        user.email,
        exchangeFrom,
        exchangeTo,
        parseFloat(exchangeAmount),
      );

      if (success) {
        toast({
          title: "Exchange Successful",
          description: `Exchanged ${exchangeAmount} ${exchangeFrom} to ${exchangeTo}`,
        });
        setExchangeDialog(false);
        setExchangeAmount("");
      } else {
        toast({
          title: "Exchange Failed",
          description: "Insufficient balance or invalid exchange",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Exchange Error",
        description: "Failed to process exchange",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPortfolioBreakdown = () => {
    if (!wallet || !user) return [];
    return walletService.getPortfolioBreakdown(user.email);
  };

  if (!user || !wallet) {
    return (
      <Card className="bg-gradient-to-r from-gold/10 to-casino-blue/10 border-gold-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-gold-500" />
            <span className="text-sm text-muted-foreground">
              Loading wallet...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-gold/10 to-casino-blue/10 border-gold-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-gold-500" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">
                    {getDisplayBalance()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHideBalances(!hideBalances)}
                    className="h-6 w-6 p-0"
                  >
                    {hideBalances ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    CoinKrazy Balance
                  </span>
                  {!hideBalances && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400">Live</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showExchange && (
                <Dialog open={exchangeDialog} onOpenChange={setExchangeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Exchange Currency</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">From</label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between"
                              >
                                {exchangeFrom || "Select currency"}
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {currencies.map((currency) => (
                                <DropdownMenuItem
                                  key={currency.code}
                                  onClick={() => setExchangeFrom(currency.code)}
                                >
                                  {currency.icon} {currency.code} -{" "}
                                  {currency.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div>
                          <label className="text-sm font-medium">To</label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between"
                              >
                                {exchangeTo || "Select currency"}
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {currencies.map((currency) => (
                                <DropdownMenuItem
                                  key={currency.code}
                                  onClick={() => setExchangeTo(currency.code)}
                                >
                                  {currency.icon} {currency.code} -{" "}
                                  {currency.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={exchangeAmount}
                          onChange={(e) => setExchangeAmount(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleExchange}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                        )}
                        Exchange
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-20">
                    <span className="mr-1">
                      {
                        currencies.find((c) => c.code === selectedCurrency)
                          ?.icon
                      }
                    </span>
                    {selectedCurrency}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>CoinKrazy Virtual Currencies</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {currencies.map((currency) => {
                      const balance = wallet.currencies[currency.code];
                      const change = getPriceChange(currency.code);
                      const hasBalance = balance && balance.available > 0;

                      return (
                        <DropdownMenuItem
                          key={currency.code}
                          onClick={() => handleCurrencyChange(currency.code)}
                          className={hasBalance ? "" : "opacity-50"}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span>{currency.icon}</span>
                              <div>
                                <div className="font-medium">
                                  {currency.code} - {currency.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {currency.code === "GC"
                                    ? "Can be purchased • No cash value"
                                    : "Won/Rewarded only • Redeemable"
                                  }
                                </div>
                                {hasBalance && !hideBalances && (
                                  <div className="text-xs font-medium">
                                    {balance.available.toLocaleString()}{" "}
                                    {currency.symbol}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {change !== 0 && (
                                <div
                                  className={`flex items-center gap-1 ${change > 0 ? "text-green-500" : "text-red-500"}`}
                                >
                                  {change > 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  <span className="text-xs">
                                    {Math.abs(change).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                              {selectedCurrency === currency.code && (
                                <span className="text-green-500">✓</span>
                              )}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}

                  {showPortfolio && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowAllBalances(!showAllBalances)}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        {showAllBalances ? "Hide" : "Show"} Portfolio Breakdown
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {showAllBalances && showPortfolio && !hideBalances && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Portfolio Breakdown
                </div>
                {getPortfolioBreakdown().map((item) => {
                  const currencyInfo = currencies.find(
                    (c) => c.code === item.currency,
                  );
                  return (
                    <div
                      key={item.currency}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span>{currencyInfo?.icon}</span>
                        <span className="text-sm">{item.currency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          ${item.value.toFixed(2)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
