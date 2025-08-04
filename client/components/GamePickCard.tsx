import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Plus,
  Minus,
  X,
  Target,
  DollarSign,
  Coins,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Crown,
} from "lucide-react";

export interface GamePick {
  id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  betType: "spread" | "total" | "moneyline";
  selection: string;
  odds: number;
  line?: number;
  gameTime: string;
  confidence: "low" | "medium" | "high";
}

export interface PickCard {
  id: string;
  picks: GamePick[];
  wagerAmount: number;
  potentialPayout: number;
  multiplier: number;
  status: "building" | "saved" | "placed" | "won" | "lost";
  createdAt: string;
  placedAt?: string;
}

interface GamePickCardProps {
  pickCard: PickCard;
  userBalance: { gc: number; sc: number };
  onUpdateCard: (card: PickCard) => void;
  onRemoveCard: (cardId: string) => void;
  onPlaceBet: (card: PickCard) => void;
  onSaveToCart: (card: PickCard) => void;
  isSportsBetting?: boolean;
}

// Parlay multipliers based on number of picks
const PARLAY_MULTIPLIERS = {
  1: 1, // Single bet - use actual odds
  2: 3, // 2-pick parlay = 3x
  3: 5, // 3-pick parlay = 5x
  4: 10, // 4-pick parlay = 10x
  5: 20, // 5-pick parlay = 20x
  6: 40, // 6-pick parlay = 40x
  7: 80, // 7-pick parlay = 80x
  8: 160, // 8-pick parlay = 160x
};

export default function GamePickCard({
  pickCard,
  userBalance,
  onUpdateCard,
  onRemoveCard,
  onPlaceBet,
  onSaveToCart,
  isSportsBetting = false,
}: GamePickCardProps) {
  const [wagerAmount, setWagerAmount] = useState<string>(
    pickCard.wagerAmount.toString() || "",
  );

  useEffect(() => {
    const amount = parseFloat(wagerAmount) || 0;
    const multiplier =
      PARLAY_MULTIPLIERS[Math.min(pickCard.picks.length, 8)] || 1;
    const potentialPayout = amount * multiplier;

    onUpdateCard({
      ...pickCard,
      wagerAmount: amount,
      multiplier,
      potentialPayout,
    });
  }, [wagerAmount, pickCard.picks.length]);

  const removePick = (pickId: string) => {
    const updatedPicks = pickCard.picks.filter((pick) => pick.id !== pickId);
    onUpdateCard({
      ...pickCard,
      picks: updatedPicks,
    });
  };

  const canPlaceBet = () => {
    const amount = parseFloat(wagerAmount) || 0;
    const availableBalance = isSportsBetting ? userBalance.sc : userBalance.gc;
    return (
      amount > 0 &&
      amount <= availableBalance &&
      pickCard.picks.length > 0 &&
      pickCard.status === "building"
    );
  };

  const handlePlaceBet = () => {
    const availableBalance = isSportsBetting ? userBalance.sc : userBalance.gc;
    if (canPlaceBet()) {
      onPlaceBet(pickCard);
    } else if ((parseFloat(wagerAmount) || 0) > availableBalance) {
      // Insufficient funds - save to cart and redirect to store
      onSaveToCart(pickCard);
    }
  };

  const getPickTypeColor = (betType: string) => {
    switch (betType) {
      case "spread":
        return "text-casino-blue";
      case "total":
        return "text-gold-500";
      case "moneyline":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "medium":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "low":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "lost":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "placed":
        return "text-casino-blue bg-casino-blue/10 border-casino-blue/20";
      case "saved":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  return (
    <Card
      className={`relative transition-all duration-300 ${
        pickCard.status === "building"
          ? "border-gold-500/50 bg-gradient-to-br from-gold/5 to-gold/10"
          : pickCard.status === "won"
            ? "border-green-500/50 bg-gradient-to-br from-green-500/5 to-green-500/10"
            : pickCard.status === "lost"
              ? "border-red-500/50 bg-gradient-to-br from-red-500/5 to-red-500/10"
              : "border-border/50"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-black" />
          </div>
          <div>
            <CardTitle className="text-lg">
              {pickCard.picks.length === 1
                ? "Single Bet"
                : `${pickCard.picks.length}-Pick Parlay`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(pickCard.status)} text-xs`}>
                {pickCard.status}
              </Badge>
              {pickCard.picks.length > 1 && (
                <Badge className="bg-gold-500 text-black text-xs">
                  {PARLAY_MULTIPLIERS[Math.min(pickCard.picks.length, 8)]}x
                  Multiplier
                </Badge>
              )}
            </div>
          </div>
        </div>

        {pickCard.status === "building" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemoveCard(pickCard.id)}
            className="text-red-500 hover:bg-red-500/10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Picks List */}
        <div className="space-y-3">
          {pickCard.picks.map((pick, index) => (
            <div key={pick.id} className="p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-casino-blue text-white text-xs">
                    Pick {index + 1}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {pick.sport}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getConfidenceColor(pick.confidence)} text-xs`}
                  >
                    {pick.confidence}
                  </Badge>
                  {pickCard.status === "building" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePick(pick.id)}
                      className="w-6 h-6 p-0 text-red-500 hover:bg-red-500/10"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-medium text-sm">
                  {pick.awayTeam} @ {pick.homeTeam}
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`font-bold ${getPickTypeColor(pick.betType)}`}
                  >
                    {pick.selection}
                  </div>
                  <div className="text-sm font-mono">
                    {formatOdds(pick.odds)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(pick.gameTime)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wager Input */}
        {pickCard.status === "building" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Wager Amount ({isSportsBetting ? 'Sweeps Coins' : 'Gold Coins'})
              </label>
              <div className="relative">
                {isSportsBetting ? (
                  <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-casino-blue" />
                ) : (
                  <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gold-500" />
                )}
                <Input
                  type="number"
                  placeholder="Enter wager amount"
                  value={wagerAmount}
                  onChange={(e) => setWagerAmount(e.target.value)}
                  className="pl-10"
                  min="1"
                  max={isSportsBetting ? userBalance.sc : userBalance.gc}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Available: {isSportsBetting ? userBalance.sc.toLocaleString() + ' SC' : userBalance.gc.toLocaleString() + ' GC'}</span>
                <span>Minimum: {isSportsBetting ? '1 SC' : '1 GC'}</span>
              </div>
            </div>

            {/* Quick Bet Amounts */}
            <div className="flex gap-2">
              {isSportsBetting ?
                [1, 5, 10, 25].map((amount) => (
                  <Button
                    key={amount}
                    size="sm"
                    variant="outline"
                    onClick={() => setWagerAmount(amount.toString())}
                    disabled={amount > userBalance.sc}
                    className="text-xs"
                  >
                    {amount} SC
                  </Button>
                )) :
                [100, 500, 1000, 5000].map((amount) => (
                  <Button
                    key={amount}
                    size="sm"
                    variant="outline"
                    onClick={() => setWagerAmount(amount.toString())}
                    disabled={amount > userBalance.gc}
                    className="text-xs"
                  >
                    {amount}
                  </Button>
                ))
              }
            </div>
          </div>
        )}

        {/* Payout Calculation */}
        {pickCard.wagerAmount > 0 && (
          <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Potential Payout:</span>
              <span className="text-2xl font-bold text-green-400">
                {pickCard.potentialPayout.toLocaleString()} {isSportsBetting ? 'SC' : 'GC'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Wager: {pickCard.wagerAmount.toLocaleString()} {props.isSportsBetting ? 'SC' : 'GC'}</span>
              <span>Multiplier: {pickCard.multiplier}x</span>
            </div>
            {pickCard.picks.length > 1 && (
              <div className="text-xs text-green-400 mt-2">
                🔥 {pickCard.picks.length}-pick parlay! All picks must win to
                cash out.
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {pickCard.status === "building" && (
          <div className="flex gap-3">
            <Button
              onClick={handlePlaceBet}
              disabled={
                !canPlaceBet() &&
                (parseFloat(wagerAmount) || 0) <= (props.isSportsBetting ? userBalance.sc : userBalance.gc)
              }
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
            >
              {(parseFloat(wagerAmount) || 0) > (props.isSportsBetting ? userBalance.sc : userBalance.gc) ? (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {props.isSportsBetting ? 'Buy More SC' : 'Buy More Coins'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Place Bet
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => onSaveToCart(pickCard)}
              className="px-6"
            >
              Save
            </Button>
          </div>
        )}

        {/* Bet Status Info */}
        {pickCard.status !== "building" && (
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            {pickCard.status === "placed" && (
              <div className="flex items-center justify-center gap-2 text-casino-blue">
                <Clock className="w-4 h-4" />
                <span>Bet placed - waiting for games to complete</span>
              </div>
            )}
            {pickCard.status === "won" && (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <Trophy className="w-4 h-4" />
                <span>
                  Winner! Payout: {pickCard.potentialPayout.toLocaleString()} {props.isSportsBetting ? 'SC' : 'GC'}
                </span>
              </div>
            )}
            {pickCard.status === "lost" && (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <X className="w-4 h-4" />
                <span>Better luck next time!</span>
              </div>
            )}
            {pickCard.status === "saved" && (
              <div className="flex items-center justify-center gap-2 text-orange-500">
                <Target className="w-4 h-4" />
                <span>Saved to cart - fund your account to place this bet</span>
              </div>
            )}
          </div>
        )}

        {/* Bet Details */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div>Card ID: {pickCard.id}</div>
          <div>Created: {formatDateTime(pickCard.createdAt)}</div>
          {pickCard.placedAt && (
            <div>Placed: {formatDateTime(pickCard.placedAt)}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
