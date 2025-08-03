import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Crown,
  Trophy,
  Clock,
  Star,
  Coins,
  TrendingUp,
  Eye,
  Plus,
  Minus,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

interface PokerTable {
  id: string;
  name: string;
  variant: 'texas-holdem' | 'omaha' | '7-card-stud' | 'jailhouse-spades';
  stakes: string;
  players: number;
  maxPlayers: number;
  pot: number;
  isPrivate: boolean;
  buyIn: { gc: number; sc: number };
}

interface Tournament {
  id: string;
  name: string;
  type: 'texas-holdem' | 'omaha';
  buyIn: { gc: number; sc: number };
  prizePool: number;
  players: number;
  maxPlayers: number;
  startTime: string;
  status: 'registering' | 'active' | 'late-reg' | 'finished';
}

export default function Poker() {
  const [activeTab, setActiveTab] = useState<'cash' | 'tournaments'>('cash');
  const [selectedTable, setSelectedTable] = useState<PokerTable | null>(null);

  const [cashTables] = useState<PokerTable[]>([
    {
      id: '1',
      name: 'High Roller Room',
      variant: 'texas-holdem',
      stakes: '$10/$20',
      players: 6,
      maxPlayers: 9,
      pot: 1250,
      isPrivate: false,
      buyIn: { gc: 10000, sc: 50 }
    },
    {
      id: '2',
      name: 'Casual Texas',
      variant: 'texas-holdem',
      stakes: '$1/$2',
      players: 4,
      maxPlayers: 6,
      pot: 180,
      isPrivate: false,
      buyIn: { gc: 1000, sc: 5 }
    },
    {
      id: '3',
      name: 'Omaha Action',
      variant: 'omaha',
      stakes: '$2/$5',
      players: 5,
      maxPlayers: 8,
      pot: 420,
      isPrivate: false,
      buyIn: { gc: 2500, sc: 15 }
    },
    {
      id: '4',
      name: 'Jailhouse Spades',
      variant: 'jailhouse-spades',
      stakes: '$1/$1',
      players: 3,
      maxPlayers: 4,
      pot: 85,
      isPrivate: false,
      buyIn: { gc: 500, sc: 2 }
    }
  ]);

  const [tournaments] = useState<Tournament[]>([
    {
      id: '1',
      name: 'Daily High Roller',
      type: 'texas-holdem',
      buyIn: { gc: 50000, sc: 250 },
      prizePool: 125000,
      players: 234,
      maxPlayers: 500,
      startTime: '2024-03-20T20:00:00Z',
      status: 'registering'
    },
    {
      id: '2',
      name: 'Weekend Warrior',
      type: 'texas-holdem',
      buyIn: { gc: 25000, sc: 100 },
      prizePool: 87500,
      players: 156,
      maxPlayers: 300,
      startTime: '2024-03-21T15:00:00Z',
      status: 'registering'
    },
    {
      id: '3',
      name: 'Omaha Masters',
      type: 'omaha',
      buyIn: { gc: 30000, sc: 150 },
      prizePool: 95000,
      players: 89,
      maxPlayers: 200,
      startTime: '2024-03-20T18:30:00Z',
      status: 'active'
    }
  ]);

  const getVariantName = (variant: string) => {
    switch (variant) {
      case 'texas-holdem': return 'Texas Hold\'em';
      case 'omaha': return 'Omaha Hi-Lo';
      case '7-card-stud': return '7-Card Stud';
      case 'jailhouse-spades': return 'Jailhouse Spades';
      default: return variant;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registering': return 'bg-green-500';
      case 'active': return 'bg-casino-blue';
      case 'late-reg': return 'bg-orange-500';
      case 'finished': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeUntil = (dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return 'Started';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Live Poker</h1>
            <p className="text-muted-foreground text-lg">Professional poker tables running 24/7</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-card rounded-lg p-1 flex">
            <Button
              variant={activeTab === 'cash' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('cash')}
              className={activeTab === 'cash' ? 'bg-gold-500 text-black hover:bg-gold-600' : ''}
            >
              <Coins className="w-4 h-4 mr-2" />
              Cash Games
            </Button>
            <Button
              variant={activeTab === 'tournaments' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('tournaments')}
              className={activeTab === 'tournaments' ? 'bg-casino-blue text-white hover:bg-casino-blue-dark' : ''}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Tournaments
            </Button>
          </div>
        </div>

        {/* Cash Games */}
        {activeTab === 'cash' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Cash Game Tables</h2>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Private Table
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cashTables.map((table) => (
                <Card key={table.id} className="hover:shadow-xl transition-all duration-300 border-border/50 hover:border-casino-blue/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{table.name}</CardTitle>
                      <Badge variant="outline">
                        {table.players}/{table.maxPlayers}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{getVariantName(table.variant)}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stakes:</span>
                        <span className="font-bold">{table.stakes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Pot:</span>
                        <span className="text-gold-400 font-bold">${table.pot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Buy-in:</span>
                        <div className="text-sm text-right">
                          <div className="text-gold-400">{table.buyIn.gc.toLocaleString()} GC</div>
                          <div className="text-casino-blue">{table.buyIn.sc} SC</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-casino-blue hover:bg-casino-blue-dark">
                        <Users className="w-4 h-4 mr-2" />
                        Join Table
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <Card className="bg-gradient-to-br from-casino-blue/10 to-casino-blue/5">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-casino-blue mx-auto mb-2" />
                  <div className="text-2xl font-bold">247</div>
                  <div className="text-sm text-muted-foreground">Active Players</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-gold/10 to-gold/5">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">$45K</div>
                  <div className="text-sm text-muted-foreground">Total Pots</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-muted-foreground">Always Open</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">VIP</div>
                  <div className="text-sm text-muted-foreground">Premium Tables</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tournaments */}
        {activeTab === 'tournaments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Poker Tournaments</h2>
              <Button variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Tournament Schedule
              </Button>
            </div>

            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <Card key={tournament.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{tournament.name}</h3>
                          <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                            {tournament.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Game:</span>
                            <div className="font-medium">{getVariantName(tournament.type)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Buy-in:</span>
                            <div className="font-medium">
                              {tournament.buyIn.gc.toLocaleString()} GC + {tournament.buyIn.sc} SC
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Prize Pool:</span>
                            <div className="font-medium text-gold-400">${tournament.prizePool.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Players:</span>
                            <div className="font-medium">{tournament.players}/{tournament.maxPlayers}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {tournament.status === 'registering' ? 'Starts in:' : 'Started'}
                        </div>
                        <div className="text-lg font-bold text-casino-blue">
                          {formatTimeUntil(tournament.startTime)}
                        </div>
                        <Button 
                          className={`${
                            tournament.status === 'registering' 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : tournament.status === 'late-reg'
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : 'bg-gray-500'
                          } text-white`}
                          disabled={tournament.status === 'finished'}
                        >
                          {tournament.status === 'registering' ? 'Register' :
                           tournament.status === 'late-reg' ? 'Late Reg' :
                           tournament.status === 'active' ? 'Watch' : 'Finished'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tournament Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="text-center p-6">
                <Trophy className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Big Prizes</h3>
                <p className="text-muted-foreground">
                  Win massive Sweeps Coin prizes in daily tournaments
                </p>
              </Card>
              <Card className="text-center p-6">
                <Clock className="w-12 h-12 text-casino-blue mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">24/7 Action</h3>
                <p className="text-muted-foreground">
                  Tournaments running around the clock for all skill levels
                </p>
              </Card>
              <Card className="text-center p-6">
                <Star className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">VIP Events</h3>
                <p className="text-muted-foreground">
                  Exclusive high-stakes tournaments for VIP members
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
