import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import {
  Activity,
  Trophy,
  Crown,
  Star,
  Users,
  Coins,
  Zap,
  Target,
  Heart,
  MessageCircle,
  TrendingUp,
  Gift,
  Award,
  CheckCircle,
  Flame,
  Sparkles,
} from "lucide-react";
import { socialService, SocialActivity } from "../services/socialService";

interface LiveActivity extends SocialActivity {
  isNew?: boolean;
  animation?: string;
}

export default function SocialActivitiesFeed() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadActivities();

    // Set up real-time activity listener
    const unsubscribe = socialService.onActivity((activity) => {
      setActivities((prev) => [
        { ...activity, isNew: true, animation: "animate-pulse" },
        ...prev.slice(0, 49), // Keep only latest 50 activities
      ]);

      // Remove animation after 3 seconds
      setTimeout(() => {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activity.id
              ? { ...a, isNew: false, animation: undefined }
              : a,
          ),
        );
      }, 3000);
    });

    return unsubscribe;
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Mock activities since we don't have a specific endpoint
      const mockActivities: SocialActivity[] = [
        {
          id: "1",
          userId: "user1",
          user: {
            username: "LuckySpinner",
            displayName: "Lucky Spinner",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lucky",
          },
          type: "win",
          description: "won 2,500 GC playing Gates of Olympus",
          metadata: {
            gameId: "gates-of-olympus",
            gameName: "Gates of Olympus",
            winAmount: 2500,
          },
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          userId: "user2",
          user: {
            username: "SlotMaster",
            displayName: "Slot Master",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=slotmaster",
          },
          type: "level_up",
          description: "reached Level 30",
          metadata: {
            newLevel: 30,
            previousLevel: 29,
          },
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          userId: "user3",
          user: {
            username: "CoinCollector",
            displayName: "Coin Collector",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=collector",
          },
          type: "achievement",
          description: 'unlocked the "High Roller" achievement',
          metadata: {
            achievementId: "high-roller",
            achievementName: "High Roller",
          },
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          userId: "user4",
          user: {
            username: "SpinQueen",
            displayName: "Spin Queen",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=spinqueen",
          },
          type: "friend_added",
          description: "became friends with JackpotJoe",
          metadata: {
            friendId: "user5",
            friendName: "JackpotJoe",
          },
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
        {
          id: "5",
          userId: "user5",
          user: {
            username: "JackpotJoe",
            displayName: "Jackpot Joe",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=jackpotjoe",
          },
          type: "win",
          description: "hit the MEGA JACKPOT on Wolf Gold for 15,000 GC!",
          metadata: {
            gameId: "wolf-gold",
            gameName: "Wolf Gold",
            winAmount: 15000,
            isJackpot: true,
          },
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: "6",
          userId: "user6",
          user: {
            username: "ChallengeChamp",
            displayName: "Challenge Champion",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=champion",
          },
          type: "challenge_completed",
          description: 'completed the "Daily Win Streak" challenge',
          metadata: {
            challengeId: "daily-win-streak",
            challengeName: "Daily Win Streak",
            reward: "1,000 GC + Badge",
          },
          createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        },
        {
          id: "7",
          userId: "user7",
          user: {
            username: "GroupLeader",
            displayName: "Group Leader",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=leader",
          },
          type: "group_joined",
          description: "joined the High Rollers Club",
          metadata: {
            groupId: "high-rollers",
            groupName: "High Rollers Club",
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string, metadata?: any) => {
    switch (type) {
      case "win":
        return metadata?.isJackpot ? (
          <Crown className="h-5 w-5 text-gold-500" />
        ) : (
          <Coins className="h-5 w-5 text-green-500" />
        );
      case "achievement":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "level_up":
        return <Star className="h-5 w-5 text-blue-500" />;
      case "friend_added":
        return <Users className="h-5 w-5 text-purple-500" />;
      case "group_joined":
        return <Users className="h-5 w-5 text-indigo-500" />;
      case "challenge_completed":
        return <Target className="h-5 w-5 text-orange-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string, metadata?: any) => {
    switch (type) {
      case "win":
        return metadata?.isJackpot
          ? "from-gold-500/20 to-yellow-500/20"
          : "from-green-500/20 to-emerald-500/20";
      case "achievement":
        return "from-yellow-500/20 to-orange-500/20";
      case "level_up":
        return "from-blue-500/20 to-indigo-500/20";
      case "friend_added":
        return "from-purple-500/20 to-pink-500/20";
      case "group_joined":
        return "from-indigo-500/20 to-purple-500/20";
      case "challenge_completed":
        return "from-orange-500/20 to-red-500/20";
      default:
        return "from-gray-500/20 to-slate-500/20";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const displayedActivities = showAll ? activities : activities.slice(0, 10);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity Feed
            <Badge variant="outline" className="ml-2">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {activities.length} activities
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {displayedActivities.map((activity, index) => (
              <div key={activity.id}>
                <div
                  className={`flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r ${getActivityColor(activity.type, activity.metadata)} transition-all duration-300 ${activity.animation || ""} ${activity.isNew ? "ring-2 ring-blue-500" : ""}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type, activity.metadata)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>
                          {activity.user.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {activity.user.displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            @{activity.user.username}
                          </span>
                          {activity.isNew && (
                            <Badge variant="destructive" className="text-xs">
                              New!
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>

                        {/* Special metadata display */}
                        {activity.metadata && (
                          <div className="mt-2">
                            {activity.type === "win" &&
                              activity.metadata.winAmount && (
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={
                                      activity.metadata.isJackpot
                                        ? "bg-gold-500"
                                        : "bg-green-500"
                                    }
                                  >
                                    {activity.metadata.isJackpot && (
                                      <Crown className="h-3 w-3 mr-1" />
                                    )}
                                    +
                                    {activity.metadata.winAmount.toLocaleString()}{" "}
                                    GC
                                  </Badge>
                                  {activity.metadata.gameName && (
                                    <span className="text-xs text-muted-foreground">
                                      in {activity.metadata.gameName}
                                    </span>
                                  )}
                                </div>
                              )}

                            {activity.type === "level_up" &&
                              activity.metadata.newLevel && (
                                <Badge className="bg-blue-500">
                                  <Star className="h-3 w-3 mr-1" />
                                  Level {activity.metadata.newLevel}
                                </Badge>
                              )}

                            {activity.type === "achievement" &&
                              activity.metadata.achievementName && (
                                <Badge className="bg-yellow-500">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {activity.metadata.achievementName}
                                </Badge>
                              )}

                            {activity.type === "challenge_completed" &&
                              activity.metadata.reward && (
                                <Badge className="bg-orange-500">
                                  <Gift className="h-3 w-3 mr-1" />
                                  {activity.metadata.reward}
                                </Badge>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-xs text-muted-foreground">
                    {formatTimeAgo(activity.createdAt)}
                  </div>
                </div>

                {index < displayedActivities.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {activities.length > 10 && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll
                ? "Show Less"
                : `Show All ${activities.length} Activities`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
