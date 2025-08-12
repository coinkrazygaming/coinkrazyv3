import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Coins,
  Crown,
  Star,
  TrendingUp,
  Users,
  Target,
  Gift,
  Zap,
  Play,
  BarChart3,
  Calendar,
  Flame,
  Award,
  Timer,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import Slots from './Slots';
import SlotsTournaments from '../components/games/SlotsTournaments';
import { slotsAnalyticsService } from '../services/slotsAnalytics';
import { slotsThemeService, DAILY_CHALLENGES } from '../services/slotsThemes';
import { balanceService } from '../services/balanceService';

interface QuickStats {
  totalSpins: number;
  totalWins: number;
  biggestWin: number;
  currentLevel: number;
  experience: number;
  winRate: number;
}

export default function SlotsHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState({ GC: 0, SC: 0 });
  const [userStats, setUserStats] = useState<QuickStats>({
    totalSpins: 0,
    totalWins: 0,
    biggestWin: 0,
    currentLevel: 1,
    experience: 0,
    winRate: 0
  });
  const [challenges, setChallenges] = useState(DAILY_CHALLENGES.slice(0, 3));
  const [hotGames, setHotGames] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadRecommendations();
      loadHotGames();
    }
  }, [user]);

  const loadUserData = () => {
    if (user) {
      // Load balance
      const userBalance = balanceService.getUserBalance(user.id);
      setBalance({ GC: userBalance.gc, SC: userBalance.sc });

      // Load user profile and stats
      const profile = slotsAnalyticsService.getUserProfile(user.id);
      setUserStats({
        totalSpins: profile.totalSpins,
        totalWins: profile.totalWins,
        biggestWin: profile.biggestSingleWin,
        currentLevel: profile.level,
        experience: profile.experience,
        winRate: profile.winRate
      });

      // Load challenges
      const userChallenges = slotsThemeService.getUserChallenges(user.id);
      setChallenges(userChallenges.slice(0, 3));

      // Get leaderboard position
      const leaderboard = slotsAnalyticsService.getWinLeaderboard('daily');
      const position = leaderboard.findIndex(entry => entry.userId === user.id);
      setLeaderboardPosition(position >= 0 ? position + 1 : null);
    }
  };

  const loadRecommendations = () => {
    if (user) {
      const personalizedRecs = slotsAnalyticsService.getPersonalizedRecommendations(user.id);
      setRecommendations(personalizedRecs);
    }
  };

  const loadHotGames = () => {
    const hotColdAnalysis = slotsAnalyticsService.getAllHotColdAnalysis();
    const hot = hotColdAnalysis
      .filter(analysis => analysis.status === 'hot')
      .sort((a, b) => b.temperature - a.temperature)
      .slice(0, 4);
    setHotGames(hot);
  };

  const formatGameName = (gameId: string): string => {
    return gameId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (activeTab === 'play') {
    return <Slots />;
  }

  if (activeTab === 'tournaments') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setActiveTab('overview')}>
            ← Back to Hub
          </Button>
          <h1 className="text-2xl font-bold">Tournaments & Competitions</h1>
        </div>
        <SlotsTournaments />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-gold-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-gold-500 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                Slots Hub
                <Badge className="bg-purple-600 text-white">
                  Level {userStats.currentLevel}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Your complete slots gaming experience • 25 Premium Games • Tournaments • Rewards
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Card className="bg-gradient-to-r from-gold/10 to-casino-blue/10 border-gold-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {balance.GC.toLocaleString()} GC
                    </div>
                    <div className="text-lg font-bold text-gold-400">
                      {balance.SC.toLocaleString()} SC
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available Balance
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="play">
            <Play className="w-4 h-4 mr-2" />
            Play Games
          </TabsTrigger>
          <TabsTrigger value="tournaments">
            <Trophy className="w-4 h-4 mr-2" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="w-4 h-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{userStats.totalSpins.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Spins</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{userStats.totalWins.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Wins</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{userStats.biggestWin.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Biggest Win</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{(userStats.winRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{userStats.currentLevel}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </CardContent>
            </Card>
            
            {leaderboardPosition && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gold-400">#{leaderboardPosition}</div>
                  <div className="text-sm text-muted-foreground">Rank Today</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Level {userStats.currentLevel}</span>
                  <span>{userStats.experience.toLocaleString()} XP</span>
                </div>
                <Progress value={65} className="h-3" />
                <div className="text-sm text-muted-foreground text-center">
                  Continue playing to earn more experience and unlock rewards!
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hot Games */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  Hot Games Right Now
                </CardTitle>
                <Link to="/slots">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hotGames.map((game) => (
                  <Card key={game.gameId} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{formatGameName(game.gameId)}</h3>
                        <Badge className="bg-red-500 text-white text-xs">
                          HOT
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Temperature</span>
                          <span className="font-bold text-red-500">{game.temperature.toFixed(0)}°</span>
                        </div>
                        <Progress value={Math.max(0, (game.temperature + 100) / 2)} className="h-1" />
                      </div>
                      <Button size="sm" className="w-full mt-3 bg-red-500 hover:bg-red-600">
                        <Play className="w-3 h-3 mr-1" />
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Challenges */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Daily Challenges
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('rewards')}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {challenges.map((challenge) => (
                  <Card key={challenge.id} className={challenge.completed ? 'bg-green-500/10 border-green-500/30' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">{challenge.title}</h3>
                        {challenge.completed && (
                          <Badge className="bg-green-500 text-xs">
                            ✓ Done
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{challenge.progress} / {challenge.target}</span>
                        </div>
                        <Progress value={(challenge.progress / challenge.target) * 100} className="h-1" />
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <div className="flex items-center gap-1 text-purple-400">
                          <Gift className="w-3 h-3" />
                          {challenge.reward.amount} {challenge.reward.type}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Timer className="w-3 h-3" />
                          {getTimeRemaining(challenge.expiresAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('play')}>
              <CardContent className="p-6 text-center">
                <Play className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Play 25 Slot Games</h3>
                <p className="text-sm text-muted-foreground">Premium slots with real gameplay mechanics</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('tournaments')}>
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Join Tournaments</h3>
                <p className="text-sm text-muted-foreground">Compete for amazing prizes and glory</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('rewards')}>
              <CardContent className="p-6 text-center">
                <Gift className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Claim Rewards</h3>
                <p className="text-sm text-muted-foreground">Daily challenges and achievements</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Daily Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {DAILY_CHALLENGES.map((challenge) => (
                  <div key={challenge.id} className={`p-4 rounded-lg border ${challenge.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/50'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{challenge.title}</h4>
                      {challenge.completed && <Badge className="bg-green-500">Completed</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{challenge.progress} / {challenge.target}</span>
                      </div>
                      <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-purple-400">
                        <Gift className="w-4 h-4" />
                        <span className="text-sm">{challenge.reward.amount} {challenge.reward.type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Timer className="w-4 h-4" />
                        {getTimeRemaining(challenge.expiresAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Level Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold-500" />
                  Level Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => i + userStats.currentLevel).map((level) => (
                  <div key={level} className={`p-4 rounded-lg border ${level === userStats.currentLevel ? 'bg-blue-500/10 border-blue-500/30' : 'bg-muted/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${level === userStats.currentLevel ? 'bg-blue-500 text-white' : 'bg-muted'}`}>
                          {level}
                        </div>
                        <div>
                          <div className="font-medium">Level {level}</div>
                          <div className="text-sm text-muted-foreground">
                            {level === userStats.currentLevel ? 'Current Level' : `${(level - userStats.currentLevel) * 1000} XP to unlock`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-400">{level * 5000} GC</div>
                        <div className="text-sm text-purple-400">{level * 2} SC</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
