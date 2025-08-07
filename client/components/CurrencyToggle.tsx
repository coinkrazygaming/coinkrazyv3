import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Coins, 
  Gem, 
  RotateCcw, 
  Settings,
  ChevronDown,
  Check,
  Zap
} from 'lucide-react';
import { 
  currencyToggleService, 
  type GameCurrencyType 
} from '@/services/currencyToggleService';
import { walletService, type UserWallet } from '@/services/walletService';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CurrencyToggleProps {
  compact?: boolean;
  showBalance?: boolean;
  showDropdown?: boolean;
  className?: string;
}

export default function CurrencyToggle({ 
  compact = false, 
  showBalance = true,
  showDropdown = true,
  className = '' 
}: CurrencyToggleProps) {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<GameCurrencyType>('GC');
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Load initial currency preference
    const initialCurrency = currencyToggleService.getUserCurrency(user.id);
    setSelectedCurrency(initialCurrency);

    // Subscribe to currency changes
    const unsubscribeCurrency = currencyToggleService.subscribeToUserCurrency(
      user.id,
      (currency) => {
        setSelectedCurrency(currency);
        setIsToggling(false);
      }
    );

    // Subscribe to wallet updates
    const unsubscribeWallet = walletService.subscribeToWalletUpdates(
      user.id,
      (updatedWallet) => {
        setWallet(updatedWallet);
      }
    );

    // Load initial wallet
    loadWallet();

    return () => {
      unsubscribeCurrency();
      unsubscribeWallet();
    };
  }, [user?.id]);

  const loadWallet = async () => {
    if (!user?.id) return;
    try {
      const userWallet = await walletService.getUserWallet(user.id);
      setWallet(userWallet);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const handleToggle = () => {
    if (!user?.id || isToggling) return;
    
    setIsToggling(true);
    const newCurrency = currencyToggleService.toggleUserCurrency(user.id);
    
    // Provide immediate visual feedback
    setSelectedCurrency(newCurrency);
    
    // Reset toggling state after animation
    setTimeout(() => setIsToggling(false), 200);
  };

  const handleCurrencySelect = (currency: GameCurrencyType) => {
    if (!user?.id || currency === selectedCurrency) return;
    
    setIsToggling(true);
    currencyToggleService.setUserCurrency(user.id, currency);
  };

  const handleAutoSwitchToggle = (enabled: boolean) => {
    if (!user?.id) return;
    setAutoSwitch(enabled);
    currencyToggleService.setAutoSwitch(user.id, enabled);
  };

  const getCurrentBalance = (): number => {
    if (!wallet) return 0;
    return selectedCurrency === 'GC' ? wallet.goldCoins : wallet.sweepsCoins;
  };

  const formatBalance = (amount: number, currency: GameCurrencyType): string => {
    if (currency === 'GC') {
      return amount.toLocaleString('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      });
    } else {
      return amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      });
    }
  };

  const getCurrencyInfo = (currency: GameCurrencyType) => 
    currencyToggleService.getCurrencyDisplay(currency);

  const currentInfo = getCurrencyInfo(selectedCurrency);
  const alternateInfo = getCurrencyInfo(selectedCurrency === 'GC' ? 'SC' : 'GC');

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          disabled={isToggling || !user?.id}
          className={`
            relative overflow-hidden transition-all duration-200 border-2
            ${selectedCurrency === 'GC' 
              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' 
              : 'border-purple-500 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
            }
            ${isToggling ? 'scale-105 animate-pulse' : ''}
          `}
        >
          <div className="flex items-center gap-1.5">
            {selectedCurrency === 'GC' ? (
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
            ) : (
              <Gem className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span className="font-bold text-xs">
              {currentInfo.shortName}
            </span>
            {showBalance && wallet && (
              <span className="text-xs">
                {formatBalance(getCurrentBalance(), selectedCurrency)}
              </span>
            )}
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Main Toggle Switch */}
      <Card className={`
        relative overflow-hidden transition-all duration-300 border-2
        ${selectedCurrency === 'GC' 
          ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5' 
          : 'border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-purple-600/5'
        }
        ${isToggling ? 'scale-105 shadow-lg' : 'hover:scale-102'}
      `}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Currency Icon & Info */}
            <div className="flex items-center gap-2">
              <div className={`
                p-2 rounded-full transition-all duration-200
                ${selectedCurrency === 'GC' 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-purple-500/20 text-purple-400'
                }
              `}>
                {selectedCurrency === 'GC' ? (
                  <Coins className="w-4 h-4" />
                ) : (
                  <Gem className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    {currentInfo.shortName}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-1.5 py-0.5"
                  >
                    Active
                  </Badge>
                </div>
                {showBalance && wallet && (
                  <span className={`
                    text-xs font-mono font-semibold
                    ${selectedCurrency === 'GC' ? 'text-yellow-400' : 'text-purple-400'}
                  `}>
                    {formatBalance(getCurrentBalance(), selectedCurrency)} {currentInfo.shortName}
                  </span>
                )}
              </div>
            </div>

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              disabled={isToggling || !user?.id}
              className={`
                ml-auto px-3 py-1.5 transition-all duration-200
                ${selectedCurrency === 'GC' 
                  ? 'hover:bg-yellow-500/20 text-yellow-400' 
                  : 'hover:bg-purple-500/20 text-purple-400'
                }
                ${isToggling ? 'animate-spin' : ''}
              `}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>

            {/* Settings Dropdown */}
            {showDropdown && (
              <DropdownMenu open={showSettings} onOpenChange={setShowSettings}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Currency Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Direct Currency Selection */}
                  <DropdownMenuItem 
                    onClick={() => handleCurrencySelect('GC')}
                    className="flex items-center gap-2"
                  >
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span>Gold Coins (GC)</span>
                    {selectedCurrency === 'GC' && (
                      <Check className="w-3.5 h-3.5 ml-auto text-green-500" />
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleCurrencySelect('SC')}
                    className="flex items-center gap-2"
                  >
                    <Gem className="w-4 h-4 text-purple-400" />
                    <span>Sweeps Coins (SC)</span>
                    {selectedCurrency === 'SC' && (
                      <Check className="w-3.5 h-3.5 ml-auto text-green-500" />
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Auto-Switch Setting */}
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-sm">Auto-Switch</span>
                    </div>
                    <Switch
                      checked={autoSwitch}
                      onCheckedChange={handleAutoSwitchToggle}
                      size="sm"
                    />
                  </div>
                  
                  {/* Balance Display */}
                  {wallet && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        <div className="flex justify-between items-center mb-1">
                          <span>Gold Coins:</span>
                          <span className="font-mono text-yellow-400">
                            {formatBalance(wallet.goldCoins, 'GC')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Sweeps Coins:</span>
                          <span className="font-mono text-purple-400">
                            {formatBalance(wallet.sweepsCoins, 'SC')}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Subtle Animation Overlay */}
          {isToggling && (
            <div className={`
              absolute inset-0 opacity-20 animate-pulse
              ${selectedCurrency === 'GC' 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                : 'bg-gradient-to-r from-purple-400 to-purple-600'
              }
            `} />
          )}
        </CardContent>
      </Card>

      {/* Quick Balance Preview for Alternate Currency */}
      {wallet && !compact && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {alternateInfo.shortName === 'GC' ? (
              <Coins className="w-3 h-3 text-yellow-400/60" />
            ) : (
              <Gem className="w-3 h-3 text-purple-400/60" />
            )}
            <span>
              {formatBalance(
                alternateInfo.shortName === 'GC' ? wallet.goldCoins : wallet.sweepsCoins, 
                alternateInfo.shortName as GameCurrencyType
              )} {alternateInfo.shortName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
