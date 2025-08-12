import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Trophy,
  Clock,
  Users,
  Star,
  Crown,
  Medal,
  Coins,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Gift,
  Timer,
  Award,
  ChevronRight,
  PlayCircle,
  Fire
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  ACTIVE_TOURNAMENTS, 
  SLOT_LEADERBOARDS,
  DAILY_CHALLENGES,
  slotsThemeService,
  SlotTournament,
  SlotLeaderboard,
  DailyChallenge
} from '@/services/slotsThemes';
import { slotsAnalyticsService } from '@/services/slotsAnalytics';

export default function SlotsTournaments() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<SlotTournament[]>(ACTIVE_TOURNAMENTS);
  const [leaderboards, setLeaderboards] = useState<SlotLeaderboard[]>(SLOT_LEADERBOARDS);
  const [challenges, setChallenges] = useState<DailyChallenge[]>(DAILY_CHALLENGES);
  const [selectedTournament, setSelectedTournament] = useState<SlotTournament | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [hotGames, setHotGames] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadHotGames();
    }
  }, [user]);

  const loadUserData = () => {
    if (user) {
      const userChallenges = slotsThemeService.getUserChallenges(user.id);
      setChallenges(userChallenges);
      
      // Find user rank in leaderboards
      const dailyLeaderboard = leaderboards.find(l => l.period === 'daily');
      if (dailyLeaderboard) {
        const userEntry = dailyLeaderboard.entries.find(e => e.userId === user.id);
        setUserRank(userEntry?.rank || null);
      }
    }
  };

  const loadHotGames = () => {
    const hotColdAnalysis = slotsAnalyticsService.getAllHotColdAnalysis();
    const hot = hotColdAnalysis
      .filter(analysis => analysis.status === 'hot')
      .sort((a, b) => b.temperature - a.temperature)
      .slice(0, 5);
    setHotGames(hot);
  };

  const getTimeRemaining = (endTime: Date): string => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTournamentStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRankIcon = (rank: number): React.ReactNode => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-sm font-bold">#{rank}</span>;
    }
  };

  const joinTournament = (tournament: SlotTournament) => {
    // Implementation for joining tournament
    console.log('Joining tournament:', tournament.id);
  };

  const formatPrize = (prize: any): string => {
    switch (prize.type) {
      case 'GC': return `${prize.amount.toLocaleString()} GC`;
      case 'SC': return `${prize.amount.toLocaleString()} SC`;
      case 'cash': return `$${prize.amount.toLocaleString()}`;
      default: return prize.description;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            Tournaments & Competitions
            <Badge className="bg-yellow-500 text-black">
              {tournaments.filter(t => t.status === 'active').length} Active
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Compete with players worldwide • Win big prizes • Climb the leaderboards
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tournaments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tournaments">
            <Trophy className="w-4 h-4 mr-2" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="leaderboards">
            <Crown className="w-4 h-4 mr-2" />
            Leaderboards
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="w-4 h-4 mr-2" />
            Daily Challenges
          </TabsTrigger>
          <TabsTrigger value="hot-games">
            <Fire className="w-4 h-4 mr-2" />
            Hot Games
          </TabsTrigger>
        </TabsList>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {tournament.name}
                        <Badge className={getTournamentStatusColor(tournament.status)}>
                          {tournament.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tournament.description}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">Ends in</div>
                      <div className="font-bold text-orange-500">
                        {getTimeRemaining(tournament.endTime)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Tournament Info */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-400">
                        {tournament.participants}
                      </div>
                      <div className="text-xs text-muted-foreground">Participants</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">
                        {tournament.entryFee.type === 'free' ? 'FREE' : 
                         `${tournament.entryFee.amount} ${tournament.entryFee.type}`}
                      </div>
                      <div className="text-xs text-muted-foreground">Entry Fee</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-400">
                        {tournament.prizes.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Prize Tiers</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Participants</span>
                      <span>{tournament.participants} / {tournament.maxParticipants}</span>
                    </div>
                    <Progress 
                      value={(tournament.participants / tournament.maxParticipants) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Top Prizes */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Top Prizes:</div>
                    {tournament.prizes.slice(0, 3).map((prize, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getRankIcon(prize.position)}
                          <span>{prize.position === 1 ? '1st' : prize.position === 2 ? '2nd' : '3rd'} Place</span>
                        </div>
                        <div className="font-medium text-green-400">
                          {formatPrize(prize)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => joinTournament(tournament)}
                      className="flex-1"
                      disabled={tournament.status !== 'active'}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      {tournament.status === 'active' ? 'Join Tournament' : 'View Results'}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{tournament.name}</DialogTitle>
                          <DialogDescription>{tournament.description}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="font-medium">Tournament Period</div>
                              <div className="text-sm text-muted-foreground">
                                {tournament.startTime.toLocaleDateString()} - {tournament.endTime.toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Entry Requirements</div>
                              <div className="text-sm text-muted-foreground">
                                {tournament.entryFee.type === 'free' ? 'Free entry for all players' : 
                                 `${tournament.entryFee.amount} ${tournament.entryFee.type} entry fee`}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="font-medium mb-2">All Prizes</div>
                            <div className="space-y-2">
                              {tournament.prizes.map((prize, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                  <span>{prize.description}</span>
                                  <span className="font-medium">{formatPrize(prize)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {leaderboards.map((leaderboard) => (
              <Card key={`${leaderboard.period}-${leaderboard.category}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      {leaderboard.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <Badge variant="outline">
                      {leaderboard.period}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.entries.map((entry, index) => (
                      <div 
                        key={entry.userId} 
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          user?.id === entry.userId ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getRankIcon(entry.rank)}
                            {entry.badge && <span>{entry.badge}</span>}
                          </div>
                          <div>
                            <div className="font-medium">{entry.username}</div>
                            {entry.change !== 0 && (
                              <div className={`text-xs flex items-center gap-1 ${
                                entry.change > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                <TrendingUp className={`w-3 h-3 ${entry.change < 0 ? 'rotate-180' : ''}`} />
                                {Math.abs(entry.change)} since last update
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {leaderboard.category.includes('amount') ? 
                              `${entry.value.toLocaleString()} coins` : 
                              entry.value.toLocaleString()
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {userRank && userRank > 5 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Your Position:</div>
                      <div className="flex items-center justify-between p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-bold">#{userRank}</span>
                          <span>You</span>
                        </div>
                        <div className="font-bold">Your Score</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Daily Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className={`${challenge.completed ? 'bg-green-500/10 border-green-500/30' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    {challenge.completed && (
                      <Badge className="bg-green-500">
                        <Star className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{challenge.progress} / {challenge.target}</span>
                    </div>
                    <Progress 
                      value={(challenge.progress / challenge.target) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Reward */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">Reward</span>
                    </div>
                    <div className="font-medium">
                      {challenge.reward.type === 'GC' || challenge.reward.type === 'SC' ? 
                        `${challenge.reward.amount} ${challenge.reward.type}` :
                        `${challenge.reward.amount} ${challenge.reward.type.replace('_', ' ')}`
                      }
                    </div>
                  </div>

                  {/* Time Remaining */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="w-4 h-4" />
                    <span>Expires in {getTimeRemaining(challenge.expiresAt)}</span>
                  </div>

                  {challenge.completed && (
                    <Button className="w-full" disabled>
                      <Star className="w-4 h-4 mr-2" />
                      Completed
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Hot Games Tab */}
        <TabsContent value="hot-games" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotGames.map((game) => (
              <Card key={game.gameId} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {game.gameId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </CardTitle>
                    <Badge className="bg-red-500 text-white">
                      <Fire className="w-3 h-3 mr-1" />
                      HOT
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Temperature Gauge */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Temperature</span>
                      <span className="font-bold text-red-500">{game.temperature.toFixed(0)}°</span>
                    </div>
                    <Progress 
                      value={Math.max(0, (game.temperature + 100) / 2)} 
                      className="h-2"
                    />
                  </div>

                  {/* Payout Trend */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Payout Trend</span>
                    </div>
                    <Badge className={
                      game.payoutTrend === 'increasing' ? 'bg-green-500' :
                      game.payoutTrend === 'decreasing' ? 'bg-red-500' : 'bg-gray-500'
                    }>
                      {game.payoutTrend}
                    </Badge>
                  </div>

                  {/* Recommendation */}
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Recommendation</span>
                    </div>
                    <div className="font-medium text-yellow-600">
                      {game.recommendation === 'play_now' ? 'Play Now!' :
                       game.recommendation === 'wait' ? 'Wait' : 'Neutral'}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Confidence: {(game.confidence * 100).toFixed(0)}%
                    </div>
                  </div>

                  <Button className="w-full bg-red-500 hover:bg-red-600">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Play Hot Game
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
