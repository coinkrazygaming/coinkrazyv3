import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserPlus,
  MessageCircle,
  Trophy,
  Search,
  Settings,
  Crown,
  Star,
  Gift,
  Zap,
  Heart,
  Share2,
  Bell,
  Send,
} from "lucide-react";

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  level: number;
  lastSeen?: Date;
  totalWins: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: "text" | "win_announcement" | "system";
}

interface Activity {
  id: string;
  type: "win" | "achievement" | "friend_joined" | "level_up";
  username: string;
  description: string;
  timestamp: Date;
  amount?: number;
  currency?: "GC" | "SC";
}

export default function SocialSection() {
  const [activeTab, setActiveTab] = useState("friends");
  const [chatMessage, setChatMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - in production, this would come from APIs
  const friends: Friend[] = [
    {
      id: "1",
      username: "LuckyPlayer88",
      isOnline: true,
      level: 25,
      totalWins: 15420,
    },
    {
      id: "2",
      username: "SlotMaster",
      isOnline: false,
      level: 18,
      totalWins: 8903,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "3",
      username: "BingoQueen",
      isOnline: true,
      level: 31,
      totalWins: 22150,
    },
  ];

  const chatMessages: ChatMessage[] = [
    {
      id: "1",
      userId: "system",
      username: "System",
      message: "Welcome to CoinKrazy Social Chat!",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: "system",
    },
    {
      id: "2",
      userId: "1",
      username: "LuckyPlayer88",
      message: "Just hit a big win on CoinKrazy Spinner! 🎰",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: "text",
    },
    {
      id: "3",
      userId: "win",
      username: "BingoQueen",
      message: "won 2,500 SC in Bingo Hall!",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: "win_announcement",
    },
  ];

  const recentActivity: Activity[] = [
    {
      id: "1",
      type: "win",
      username: "LuckyPlayer88",
      description: "won big on CoinKrazy Spinner",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      amount: 5000,
      currency: "GC",
    },
    {
      id: "2",
      type: "achievement",
      username: "SlotMaster",
      description: "unlocked 'High Roller' achievement",
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
    },
    {
      id: "3",
      type: "level_up",
      username: "BingoQueen",
      description: "reached level 31",
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
    },
  ];

  const sendMessage = () => {
    if (chatMessage.trim()) {
      // In production: send message to chat API
      console.log("Sending message:", chatMessage);
      setChatMessage("");
    }
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "win":
        return <Trophy className="w-4 h-4 text-gold-500" />;
      case "achievement":
        return <Star className="w-4 h-4 text-purple-500" />;
      case "friend_joined":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "level_up":
        return <Zap className="w-4 h-4 text-green-500" />;
      default:
        return <Heart className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Social Hub</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500 text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Online
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Friend
            </Button>
          </div>

          <div className="grid gap-4">
            {friends.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                          />
                          <AvatarFallback>
                            {friend.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${friend.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{friend.username}</div>
                        <div className="text-sm text-muted-foreground">
                          Level {friend.level} •{" "}
                          {friend.totalWins.toLocaleString()} total wins
                        </div>
                        {!friend.isOnline && friend.lastSeen && (
                          <div className="text-xs text-muted-foreground">
                            Last seen {friend.lastSeen.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Gift className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Global Chat
                <Badge variant="outline" className="ml-auto">
                  {Math.floor(Math.random() * 50) + 20} online
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full border rounded p-4">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      {msg.type !== "system" && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username}`}
                          />
                          <AvatarFallback>
                            {msg.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${msg.type === "system" ? "text-purple-400" : msg.type === "win_announcement" ? "text-gold-400" : ""}`}
                          >
                            {msg.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div
                          className={`text-sm ${msg.type === "win_announcement" ? "text-gold-300" : ""}`}
                        >
                          {msg.type === "win_announcement" && (
                            <Trophy className="w-4 h-4 inline mr-1" />
                          )}
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{activity.username}</span>{" "}
                        {activity.description}
                        {activity.amount && (
                          <span className="text-gold-400 font-medium">
                            {" "}
                            (+{activity.amount.toLocaleString()}{" "}
                            {activity.currency})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-gold-500" />
                  Weekly Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      rank: 1,
                      username: "CoinMaster",
                      wins: 45230,
                      badge: "👑",
                    },
                    {
                      rank: 2,
                      username: "LuckyCharm",
                      wins: 38910,
                      badge: "🥈",
                    },
                    { rank: 3, username: "SpinKing", wins: 34670, badge: "🥉" },
                    { rank: 4, username: "BingoStar", wins: 28450 },
                    { rank: 5, username: "SlotWiz", wins: 25120 },
                  ].map((player) => (
                    <div key={player.rank} className="flex items-center gap-3">
                      <div className="w-8 text-center">
                        {player.badge || `#${player.rank}`}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                        />
                        <AvatarFallback>
                          {player.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{player.username}</div>
                        <div className="text-sm text-gold-400">
                          {player.wins.toLocaleString()} GC won
                        </div>
                      </div>
                      {player.rank <= 3 && (
                        <Badge
                          variant="outline"
                          className="border-gold-500 text-gold-400"
                        >
                          Top {player.rank}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
