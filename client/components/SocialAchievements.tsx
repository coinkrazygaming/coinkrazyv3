import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import {
  Trophy,
  Crown,
  Star,
  Award,
  Target,
  Zap,
  Flame,
  Sparkles,
  Gift,
  Heart,
  Users,
  Gamepad2,
  Coins,
  CheckCircle,
  Lock,
  Calendar,
  TrendingUp,
  Clock,
  Info,
} from "lucide-react";
import { socialService, SocialBadge } from "../services/socialService";

interface AchievementCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  badges: SocialBadge[];
}

interface DailyReward {
  day: number;
  reward: {
    type: "GC" | "SC" | "badge" | "experience";
    amount: number;
    badge?: string;
  };
  claimed: boolean;
  available: boolean;
}

interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  reward: {
    gc?: number;
    sc?: number;
    badge?: string;
    experience?: number;
  };
  deadline: string;
  completed: boolean;
}

export default function SocialAchievements() {
  const [badges, setBadges] = useState<SocialBadge[]>([]);
  const [categories, setCategories] = useState<AchievementCategory[]>([]);
  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<SocialBadge | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);

  useEffect(() => {
    loadAchievementsData();
  }, []);

  const loadAchievementsData = async () => {
    setLoading(true);
    try {
      const badgesData = await socialService.getUserBadges();
      setBadges(badgesData);

      // Categorize badges
      const categoryMap: Record<string, SocialBadge[]> = {};
      badgesData.forEach((badge) => {
        if (!categoryMap[badge.category]) {
          categoryMap[badge.category] = [];
        }
        categoryMap[badge.category].push(badge);
      });

      const categoriesData: AchievementCategory[] = [
        {
          id: "achievement",
          name: "Milestones",
          icon: <Trophy className="h-5 w-5" />,
          description: "Major gaming milestones and accomplishments",
          badges: categoryMap.achievement || [],
        },
        {
          id: "social",
          name: "Social",
          icon: <Users className="h-5 w-5" />,
          description: "Social interactions and community engagement",
          badges: categoryMap.social || [],
        },
        {
          id: "gaming",
          name: "Gaming",
          icon: <Gamepad2 className="h-5 w-5" />,
          description: "Game-specific achievements and victories",
          badges: categoryMap.gaming || [],
        },
        {
          id: "special",
          name: "Special",
          icon: <Crown className="h-5 w-5" />,
          description: "Rare and exclusive achievements",
          badges: categoryMap.special || [],
        },
      ];

      setCategories(categoriesData);

      // Mock daily rewards
      const mockDailyRewards: DailyReward[] = Array.from(
        { length: 7 },
        (_, i) => ({
          day: i + 1,
          reward: {
            type: i === 6 ? "SC" : "GC",
            amount: i === 6 ? 5 : (i + 1) * 100,
            ...(i === 2 && { badge: "daily-warrior" }),
          },
          claimed: i < 3,
          available: i === 3,
        }),
      );

      setDailyRewards(mockDailyRewards);

      // Mock weekly challenges
      const mockWeeklyChallenges: WeeklyChallenge[] = [
        {
          id: "1",
          name: "Win Streak Master",
          description: "Win 10 games in a row",
          progress: 6,
          target: 10,
          reward: { gc: 2500, experience: 1000 },
          deadline: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          completed: false,
        },
        {
          id: "2",
          name: "Social Butterfly",
          description: "Make 5 new friends this week",
          progress: 3,
          target: 5,
          reward: { sc: 10, badge: "social-butterfly" },
          deadline: new Date(
            Date.now() + 4 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          completed: false,
        },
        {
          id: "3",
          name: "High Roller",
          description: "Win 50,000 GC in total this week",
          progress: 35000,
          target: 50000,
          reward: { gc: 5000, sc: 25, experience: 2000 },
          deadline: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          completed: false,
        },
      ];

      setWeeklyChallenges(mockWeeklyChallenges);
    } catch (error) {
      console.error("Error loading achievements data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-500 to-gold-500";
      case "epic":
        return "from-purple-500 to-pink-500";
      case "rare":
        return "from-blue-500 to-indigo-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "border-gold-500";
      case "epic":
        return "border-purple-500";
      case "rare":
        return "border-blue-500";
      default:
        return "border-gray-300";
    }
  };

  const getBadgeIcon = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "👑";
      case "epic":
        return "💎";
      case "rare":
        return "⭐";
      default:
        return "🏅";
    }
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    if (percentage >= 50) return "bg-blue-500";
    return "bg-gray-400";
  };

  const formatTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const claimDailyReward = async (day: number) => {
    // Mock claiming logic
    setDailyRewards((prev) =>
      prev.map((reward) =>
        reward.day === day
          ? { ...reward, claimed: true, available: false }
          : reward.day === day + 1
            ? { ...reward, available: true }
            : reward,
      ),
    );
  };

  const filteredBadges =
    activeCategory === "all"
      ? badges
      : badges.filter((badge) => badge.category === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="badges">
            <Trophy className="h-4 w-4 mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="daily">
            <Calendar className="h-4 w-4 mr-2" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="weekly">
            <Target className="h-4 w-4 mr-2" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          {/* Achievement Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {badges.filter((b) => b.unlockedAt).length}
                </div>
                <div className="text-sm text-muted-foreground">Unlocked</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {badges.length}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {
                    badges.filter(
                      (b) => b.rarity === "legendary" && b.unlockedAt,
                    ).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Legendary</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gold-500">
                  {Math.round(
                    (badges.filter((b) => b.unlockedAt).length /
                      badges.length) *
                      100,
                  )}
                  %
                </div>
                <div className="text-sm text-muted-foreground">Completion</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={activeCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("all")}
                >
                  All ({badges.length})
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      activeCategory === category.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    {category.icon}
                    {category.name} ({category.badges.length})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => (
              <Card
                key={badge.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  badge.unlockedAt
                    ? `border-2 ${getRarityBorder(badge.rarity)} bg-gradient-to-br ${getRarityColor(badge.rarity)}/10`
                    : "opacity-60 hover:opacity-80"
                }`}
                onClick={() => setSelectedBadge(badge)}
              >
                <CardContent className="p-4 text-center">
                  <div className="relative mb-3">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <div className="absolute -top-1 -right-1 text-2xl">
                      {getBadgeIcon(badge.rarity)}
                    </div>
                    {badge.unlockedAt && (
                      <CheckCircle className="absolute -bottom-2 -right-2 h-6 w-6 text-green-500 bg-white rounded-full" />
                    )}
                    {!badge.unlockedAt && !badge.progress && (
                      <Lock className="absolute -bottom-2 -right-2 h-6 w-6 text-gray-400 bg-white rounded-full" />
                    )}
                  </div>

                  <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {badge.description}
                  </p>

                  <div className="space-y-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${badge.unlockedAt ? getRarityBorder(badge.rarity) : ""}`}
                    >
                      {badge.rarity}
                    </Badge>

                    {badge.progress && !badge.unlockedAt && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{badge.progress.current}</span>
                          <span>{badge.progress.required}</span>
                        </div>
                        <Progress
                          value={
                            (badge.progress.current / badge.progress.required) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    )}

                    {badge.unlockedAt && (
                      <div className="text-xs text-green-600 font-medium">
                        Unlocked{" "}
                        {new Date(badge.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Daily Rewards Tab */}
        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Login Rewards
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Login every day to claim increasing rewards. Miss a day and the
                streak resets!
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {dailyRewards.map((reward) => (
                  <div
                    key={reward.day}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      reward.claimed
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : reward.available
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950 animate-pulse"
                          : "border-gray-300 bg-gray-50 dark:bg-gray-950"
                    }`}
                  >
                    <div className="text-lg font-bold mb-2">
                      Day {reward.day}
                    </div>

                    <div className="mb-3">
                      {reward.reward.type === "GC" && (
                        <div className="flex flex-col items-center">
                          <Coins className="h-6 w-6 text-gold-500 mb-1" />
                          <span className="text-sm font-medium">
                            {reward.reward.amount} GC
                          </span>
                        </div>
                      )}
                      {reward.reward.type === "SC" && (
                        <div className="flex flex-col items-center">
                          <Crown className="h-6 w-6 text-purple-500 mb-1" />
                          <span className="text-sm font-medium">
                            {reward.reward.amount} SC
                          </span>
                        </div>
                      )}
                      {reward.reward.badge && (
                        <div className="flex flex-col items-center mt-2">
                          <Trophy className="h-4 w-4 text-yellow-500 mb-1" />
                          <span className="text-xs">+ Badge</span>
                        </div>
                      )}
                    </div>

                    {reward.claimed ? (
                      <Badge variant="default" className="bg-green-500 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Claimed
                      </Badge>
                    ) : reward.available ? (
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => claimDailyReward(reward.day)}
                      >
                        Claim
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Challenges Tab */}
        <TabsContent value="weekly" className="space-y-6">
          <div className="space-y-4">
            {weeklyChallenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">
                        {challenge.name}
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        {challenge.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            {challenge.progress.toLocaleString()} /{" "}
                            {challenge.target.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={(challenge.progress / challenge.target) * 100}
                          className="h-3"
                        />
                      </div>
                    </div>

                    <div className="ml-4 text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        {formatTimeRemaining(challenge.deadline)}
                      </div>

                      {challenge.completed ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline">In Progress</Badge>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gold-500/10 to-yellow-500/10 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">Rewards:</h4>
                    <div className="flex items-center gap-4 text-sm">
                      {challenge.reward.gc && (
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-gold-500" />
                          {challenge.reward.gc.toLocaleString()} GC
                        </div>
                      )}
                      {challenge.reward.sc && (
                        <div className="flex items-center gap-1">
                          <Crown className="h-4 w-4 text-purple-500" />
                          {challenge.reward.sc} SC
                        </div>
                      )}
                      {challenge.reward.experience && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-500" />
                          {challenge.reward.experience} XP
                        </div>
                      )}
                      {challenge.reward.badge && (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          Badge
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Reward Center
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your earned rewards and claim special bonuses
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-gold-500/20 to-yellow-500/20 rounded-lg">
                  <Coins className="h-12 w-12 text-gold-500 mx-auto mb-4" />
                  <div className="text-2xl font-bold">25,450</div>
                  <div className="text-sm text-muted-foreground">
                    Total GC Earned
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                  <Crown className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <div className="text-2xl font-bold">127</div>
                  <div className="text-sm text-muted-foreground">
                    Total SC Earned
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg">
                  <Star className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <div className="text-2xl font-bold">8,750</div>
                  <div className="text-sm text-muted-foreground">
                    Total XP Earned
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Badge Detail Dialog */}
      <Dialog
        open={!!selectedBadge}
        onOpenChange={() => setSelectedBadge(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{selectedBadge?.icon}</span>
              {selectedBadge?.name}
              <span className="text-2xl">
                {selectedBadge && getBadgeIcon(selectedBadge.rarity)}
              </span>
            </DialogTitle>
            <DialogDescription>{selectedBadge?.description}</DialogDescription>
          </DialogHeader>

          {selectedBadge && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getRarityBorder(selectedBadge.rarity)}>
                  {selectedBadge.rarity}
                </Badge>
                <Badge variant="outline">{selectedBadge.category}</Badge>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Requirements:</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedBadge.requirements}
                </p>
              </div>

              {selectedBadge.progress && !selectedBadge.unlockedAt && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {selectedBadge.progress.current} /{" "}
                      {selectedBadge.progress.required}
                    </span>
                  </div>
                  <Progress
                    value={
                      (selectedBadge.progress.current /
                        selectedBadge.progress.required) *
                      100
                    }
                    className="h-3"
                  />
                </div>
              )}

              {selectedBadge.unlockedAt && (
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      Unlocked on{" "}
                      {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
