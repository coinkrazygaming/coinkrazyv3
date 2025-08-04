import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { balanceService, UserBalance } from "@/services/balanceService";

interface RealTimeBalanceProps {
  userId: string;
  className?: string;
  showTransactions?: boolean;
  compact?: boolean;
}

const RealTimeBalance: React.FC<RealTimeBalanceProps> = ({
  userId,
  className = "",
  showTransactions = false,
  compact = false,
}) => {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [previousBalance, setPreviousBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initial balance load
    loadBalance();

    // Subscribe to real-time updates
    const unsubscribe = balanceService.subscribeToBalanceUpdates(userId, (newBalance) => {
      setPreviousBalance(balance);
      setBalance(newBalance);
      setLastUpdate(new Date());
    });

    // Cleanup subscription
    return unsubscribe;
  }, [userId]);

  const loadBalance = () => {
    setIsLoading(true);
    try {
      const userBalance = balanceService.getUserBalance(userId);
      setBalance(userBalance);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadBalance();
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getChangeIndicator = (current: number, previous: number | undefined) => {
    if (!previous || current === previous) return null;
    
    const isIncrease = current > previous;
    const difference = Math.abs(current - previous);
    
    return (
      <div className={`flex items-center gap-1 text-xs ${isIncrease ? 'text-green-400' : 'text-red-400'}`}>
        {isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{isIncrease ? '+' : '-'}{formatNumber(difference)}</span>
      </div>
    );
  };

  if (!balance) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-6 bg-muted rounded w-32"></div>
            </div>
            <div className="h-8 w-8 bg-muted rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleVisibility}
          className="p-1 h-auto"
        >
          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-gold-500" />
            <span className="font-bold">
              {isVisible ? formatNumber(balance.gc) : '••••••'}
            </span>
            <span className="text-xs text-muted-foreground">GC</span>
            {getChangeIndicator(balance.gc, previousBalance?.gc)}
          </div>
          
          <div className="w-px h-4 bg-border"></div>
          
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-casino-blue" />
            <span className="font-bold">
              {isVisible ? balance.sc.toLocaleString() : '••••'}
            </span>
            <span className="text-xs text-muted-foreground">SC</span>
            {getChangeIndicator(balance.sc, previousBalance?.sc)}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-1 h-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    );
  }

  return (
    <Card className={`${className} transition-all duration-200 hover:shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-casino-blue" />
            <h3 className="font-semibold">Real-Time Balance</h3>
            <Badge variant="outline" className="text-xs">
              LIVE
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVisibility}
              className="p-1 h-auto"
            >
              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1 h-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Gold Coins */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-gold-500" />
              <span className="text-sm text-muted-foreground">Gold Coins</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {isVisible ? formatNumber(balance.gc) : '••••••'}
              </div>
              {getChangeIndicator(balance.gc, previousBalance?.gc)}
            </div>
          </div>

          {/* Sweeps Coins */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-casino-blue" />
              <span className="text-sm text-muted-foreground">Sweeps Coins</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {isVisible ? balance.sc.toLocaleString() : '••••'}
              </div>
              {getChangeIndicator(balance.sc, previousBalance?.sc)}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>Live updates enabled</span>
            </div>
          </div>
        </div>

        {showTransactions && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium mb-2">Recent Transactions</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {balanceService.getUserTransactions(userId, 5).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {txn.currency === 'gc' ? (
                      <Coins className="w-3 h-3 text-gold-500" />
                    ) : (
                      <Star className="w-3 h-3 text-casino-blue" />
                    )}
                    <span className="truncate max-w-32">{txn.description}</span>
                  </div>
                  <div className={`font-medium ${txn.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {txn.type === 'credit' ? '+' : '-'}{txn.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeBalance;
