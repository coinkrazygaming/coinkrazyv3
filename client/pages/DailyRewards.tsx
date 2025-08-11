import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Calendar, CheckCircle, Lock, Coins, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DailyReward {
  day: number;
  gcAmount: number;
  scAmount: number;
  claimed: boolean;
  available: boolean;
  bonus?: string;
}

export default function DailyRewards() {
  const { user } = useAuth();

  // Mock data - in production this would come from the backend
  const [currentStreak, setCurrentStreak] = useState(3);
  const [totalClaimed, setTotalClaimed] = useState(15);
  const [nextRewardAvailable, setNextRewardAvailable] = useState(
    new Date(Date.now() + 5 * 60 * 60 * 1000),
  ); // 5 hours from now

  const [dailyRewards] = useState<DailyReward[]>([
    { day: 1, gcAmount: 1000, scAmount: 0, claimed: true, available: false },
    { day: 2, gcAmount: 1500, scAmount: 0, claimed: true, available: false },
    { day: 3, gcAmount: 2000, scAmount: 1, claimed: true, available: false },
    { day: 4, gcAmount: 2500, scAmount: 0, claimed: false, available: true },
    {
      day: 5,
      gcAmount: 3000,
      scAmount: 2,
      claimed: false,
      available: false,
      bonus: "Bonus SC!",
    },
    { day: 6, gcAmount: 4000, scAmount: 1, claimed: false, available: false },
    {
      day: 7,
      gcAmount: 5000,
      scAmount: 5,
      claimed: false,
      available: false,
      bonus: "Weekly Bonus!",
    },
  ]);

  const handleClaimReward = (day: number) => {
    // In production, this would make an API call to claim the reward
    console.log(`Claiming reward for day ${day}`);
    // Update user balance, streak, etc.
  };

  const formatTimeUntilNext = () => {
    const now = new Date();
    const diff = nextRewardAvailable.getTime() - now.getTime();

    if (diff <= 0) return "Available now!";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <Gift className="w-8 h-8" />
          Daily Rewards
        </h1>
        <p className="text-muted-foreground">
          Collect free Gold Coins and Sweeps Coins every day!
        </p>
      </div>

      {/* Streak & Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {currentStreak} days
            </div>
            <p className="text-sm text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5" />
              Total Claimed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {totalClaimed} rewards
            </div>
            <p className="text-sm text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Next Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-green-500">
              {formatTimeUntilNext()}
            </div>
            <p className="text-sm text-muted-foreground">Until available</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete all 7 days for a special bonus!
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={(currentStreak / 7) * 100} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Day {currentStreak} of 7</span>
              <span>{Math.round((currentStreak / 7) * 100)}% complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Rewards Grid */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Rewards</CardTitle>
          <p className="text-sm text-muted-foreground">
            Claim your daily rewards to maintain your streak
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {dailyRewards.map((reward) => (
              <Card
                key={reward.day}
                className={`relative transition-all duration-200 ${
                  reward.claimed
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20"
                    : reward.available
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 shadow-md"
                      : "bg-gray-50 border-gray-200 dark:bg-gray-950/20 opacity-75"
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-sm flex items-center justify-center gap-1">
                    Day {reward.day}
                    {reward.claimed && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {!reward.available && !reward.claimed && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Rewards */}
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">
                        {reward.gcAmount.toLocaleString()} GC
                      </span>
                    </div>
                    {reward.scAmount > 0 && (
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <Coins className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">
                          {reward.scAmount} SC
                        </span>
                      </div>
                    )}
                    {reward.bonus && (
                      <Badge variant="outline" className="text-xs">
                        {reward.bonus}
                      </Badge>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="text-center">
                    {reward.claimed ? (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Claimed
                      </Badge>
                    ) : reward.available ? (
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleClaimReward(reward.day)}
                      >
                        Claim
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reward Rules */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Daily Collection
              </h4>
              <p className="text-sm text-muted-foreground">
                Rewards reset every 24 hours. Come back daily to maintain your
                streak!
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Star className="w-4 h-4" />
                Streak Bonuses
              </h4>
              <p className="text-sm text-muted-foreground">
                Longer streaks unlock bigger rewards and special bonuses.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Weekly Rewards
              </h4>
              <p className="text-sm text-muted-foreground">
                Complete all 7 days for extra Gold Coins and Sweeps Coins!
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Free Currency
              </h4>
              <p className="text-sm text-muted-foreground">
                All rewards are completely free - no purchase required!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
