import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Users,
  Clock,
  DollarSign,
  Star,
  Crown,
  Target,
  Zap,
  Calendar,
  ChevronRight,
  Play,
  Pause,
  Settings,
  Eye,
  UserPlus,
  TrendingUp,
  Award,
  Timer,
  Coins,
  Filter,
  Search,
  Bell,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Users2,
  MapPin,
  Gamepad2,
  MessageCircle,
  Share2,
  Bookmark
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { pokerService, PokerTournament, PokerTournamentPlayer, PokerBlindLevel, PokerPayout } from "@/services/pokerService";

export default function PokerTournaments() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<PokerTournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<PokerTournament | null>(null);
  const [registeredTournaments, setRegisteredTournaments] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<'all' | 'registered' | 'live' | 'completed'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterBuyIn, setFilterBuyIn] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showStructureDialog, setShowStructureDialog] = useState(false);
  const [selectedForRegistration, setSelectedForRegistration] = useState<PokerTournament | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadTournaments();
    startRealTimeUpdates();
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const loadTournaments = async () => {
    try {
      const tournamentData = pokerService.getTournaments();
      setTournaments(tournamentData);
    } catch (error) {
      console.error('Failed to load tournaments:', error);
    }
  };

  const startRealTimeUpdates = () => {
    updateIntervalRef.current = setInterval(() => {
      const updatedTournaments = pokerService.getTournaments();
      setTournaments(updatedTournaments);
    }, 5000);
  };

  const handleRegisterTournament = async (tournament: PokerTournament) => {
    setSelectedForRegistration(tournament);
    setShowRegistrationDialog(true);
  };

  const confirmRegistration = async () => {
    if (!selectedForRegistration || !user) return;

    setIsRegistering(true);
    try {
      pokerService.registerForTournament(selectedForRegistration.id);
      setRegisteredTournaments(prev => new Set([...prev, selectedForRegistration.id]));
      setShowRegistrationDialog(false);
      
      // Update tournament data
      await loadTournaments();
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregisterTournament = async (tournamentId: string) => {
    try {
      pokerService.unregisterFromTournament(tournamentId);
      setRegisteredTournaments(prev => {
        const updated = new Set(prev);
        updated.delete(tournamentId);
        return updated;
      });
      await loadTournaments();
    } catch (error) {
      console.error('Unregistration failed:', error);
    }
  };

  const getFilteredTournaments = () => {
    let filtered = tournaments;

    // Filter by view
    switch (currentView) {
      case 'registered':
        filtered = filtered.filter(t => registeredTournaments.has(t.id));
        break;
      case 'live':
        filtered = filtered.filter(t => t.status === 'active');
        break;
      case 'completed':
        filtered = filtered.filter(t => t.status === 'finished');
        break;
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by buy-in
    if (filterBuyIn !== 'all') {
      const ranges = {
        'low': { min: 0, max: 50 },
        'mid': { min: 51, max: 500 },
        'high': { min: 501, max: Infinity }
      };
      const range = ranges[filterBuyIn as keyof typeof ranges];
      if (range) {
        filtered = filtered.filter(t => {
          const totalBuyIn = t.buyIn.gc + t.buyIn.sc;
          return totalBuyIn >= range.min && totalBuyIn <= range.max;
        });
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      // Sort by status priority, then by start time
      const statusPriority = { 'registering': 3, 'active': 2, 'scheduled': 1, 'finished': 0 };
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 0;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 0;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return a.startTime.getTime() - b.startTime.getTime();
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Started';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusBadgeVariant = (status: PokerTournament['status']) => {
    switch (status) {
      case 'registering': return 'default';
      case 'active': return 'destructive';
      case 'scheduled': return 'secondary';
      case 'finished': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: PokerTournament['status']) => {
    switch (status) {
      case 'registering': return <UserPlus className="w-3 h-3" />;
      case 'active': return <Play className="w-3 h-3" />;
      case 'scheduled': return <Clock className="w-3 h-3" />;
      case 'finished': return <CheckCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const TournamentCard = ({ tournament }: { tournament: PokerTournament }) => {
    const isRegistered = registeredTournaments.has(tournament.id);
    const canRegister = tournament.status === 'registering' || tournament.status === 'scheduled';
    const registrationProgress = (tournament.currentPlayers / tournament.maxPlayers) * 100;

    return (
      <Card className={`hover:shadow-lg transition-all duration-300 ${
        tournament.isVIP ? 'border-gold-500/50 bg-gradient-to-br from-gold/5 to-gold/10' : ''
      } ${isRegistered ? 'ring-2 ring-blue-500/50' : ''}`}>
        {tournament.isVIP && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-gold-500 text-black">
              <Crown className="w-3 h-3 mr-1" />
              VIP
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold-500" />
                {tournament.name}
                {isRegistered && (
                  <Badge variant="outline" className="ml-2">
                    Registered
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mb-3">
                {tournament.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm">
                <Badge variant={getStatusBadgeVariant(tournament.status)} className="flex items-center gap-1">
                  {getStatusIcon(tournament.status)}
                  {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                </Badge>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {tournament.currentPlayers}/{tournament.maxPlayers}
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTimeUntil(tournament.startTime)}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tournament Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Buy-in</div>
              <div className="font-bold">
                {tournament.buyIn.gc > 0 && `${tournament.buyIn.gc} GC`}
                {tournament.buyIn.gc > 0 && tournament.buyIn.sc > 0 && ' + '}
                {tournament.buyIn.sc > 0 && `${tournament.buyIn.sc} SC`}
                {tournament.buyIn.fee > 0 && ` + ${formatCurrency(tournament.buyIn.fee)} fee`}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Prize Pool</div>
              <div className="font-bold text-gold-400">
                {tournament.guaranteedPrize ? 
                  `${formatCurrency(Math.max(tournament.currentPrizePool, tournament.guaranteedPrize))} GTD` :
                  formatCurrency(tournament.currentPrizePool)
                }
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Type</div>
              <div className="font-medium">
                {tournament.type.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Format</div>
              <div className="font-medium">
                {tournament.format.charAt(0).toUpperCase() + tournament.format.slice(1)}
              </div>
            </div>
          </div>

          {/* Registration Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Registration</span>
              <span className="text-muted-foreground">
                {tournament.currentPlayers}/{tournament.maxPlayers}
              </span>
            </div>
            <Progress value={registrationProgress} className="h-2" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {canRegister && !isRegistered && (
              <Button 
                onClick={() => handleRegisterTournament(tournament)}
                className="flex-1"
                disabled={tournament.currentPlayers >= tournament.maxPlayers}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Button>
            )}
            
            {isRegistered && canRegister && (
              <Button 
                variant="outline"
                onClick={() => handleUnregisterTournament(tournament.id)}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Unregister
              </Button>
            )}

            <Button 
              variant="outline"
              onClick={() => setSelectedTournament(tournament)}
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Details
            </Button>

            <Button 
              variant="outline"
              onClick={() => {
                setSelectedTournament(tournament);
                setShowStructureDialog(true);
              }}
              size="sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Structure
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TournamentDetails = ({ tournament }: { tournament: PokerTournament }) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold-500" />
            {tournament.name}
            {tournament.isVIP && (
              <Badge className="bg-gold-500 text-black">
                <Crown className="w-4 h-4 mr-1" />
                VIP
              </Badge>
            )}
          </h3>
          <p className="text-muted-foreground">{tournament.description}</p>
        </div>
        
        <Badge variant={getStatusBadgeVariant(tournament.status)} className="text-lg p-2">
          {getStatusIcon(tournament.status)}
          <span className="ml-2">
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </span>
        </Badge>
      </div>

      {/* Tournament Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-gold-500 mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Buy-in</div>
            <div className="font-bold">
              {tournament.buyIn.gc > 0 && `${tournament.buyIn.gc} GC`}
              {tournament.buyIn.gc > 0 && tournament.buyIn.sc > 0 && ' + '}
              {tournament.buyIn.sc > 0 && `${tournament.buyIn.sc} SC`}
            </div>
            {tournament.buyIn.fee > 0 && (
              <div className="text-sm text-muted-foreground">
                + {formatCurrency(tournament.buyIn.fee)} fee
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-gold-500 mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Prize Pool</div>
            <div className="font-bold text-gold-400">
              {tournament.guaranteedPrize ? 
                formatCurrency(Math.max(tournament.currentPrizePool, tournament.guaranteedPrize)) :
                formatCurrency(tournament.currentPrizePool)
              }
            </div>
            {tournament.guaranteedPrize && (
              <div className="text-sm text-muted-foreground">Guaranteed</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Players</div>
            <div className="font-bold">
              {tournament.currentPlayers}/{tournament.maxPlayers}
            </div>
            <Progress 
              value={(tournament.currentPlayers / tournament.maxPlayers) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Starts In</div>
            <div className="font-bold">
              {formatTimeUntil(tournament.startTime)}
            </div>
            <div className="text-sm text-muted-foreground">
              {tournament.startTime.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Tournament Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Registration Opens</span>
              </div>
              <span className="text-muted-foreground">
                {new Date(tournament.startTime.getTime() - 3600000).toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Registration Ends</span>
              </div>
              <span className="text-muted-foreground">
                {tournament.registrationEnd.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-green-500" />
                <span className="font-medium">Tournament Starts</span>
              </div>
              <span className="text-muted-foreground">
                {tournament.startTime.toLocaleString()}
              </span>
            </div>

            {tournament.lateRegistration && tournament.lateRegistrationEnd && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Late Registration Ends</span>
                </div>
                <span className="text-muted-foreground">
                  {tournament.lateRegistrationEnd.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Payout Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournament.payoutStructure.slice(0, 10).map((payout, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-gold-500/10 border border-gold-500/20' :
                  index === 1 ? 'bg-gray-500/10 border border-gray-500/20' :
                  index === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                  'bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Crown className="w-4 h-4 text-gold-500" />}
                  {index === 1 && <Award className="w-4 h-4 text-gray-500" />}
                  {index === 2 && <Award className="w-4 h-4 text-orange-500" />}
                  <span className="font-medium">
                    {payout.position === 1 ? '1st Place' : 
                     payout.position === 2 ? '2nd Place' :
                     payout.position === 3 ? '3rd Place' :
                     `${payout.position}th Place`}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gold-400">
                    {payout.percentage}%
                  </div>
                  {payout.amount && (
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(payout.amount)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const BlindStructure = ({ tournament }: { tournament: PokerTournament }) => (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Level</TableHead>
            <TableHead>Small Blind</TableHead>
            <TableHead>Big Blind</TableHead>
            <TableHead>Ante</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Break</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tournament.blindStructure.map((level, index) => (
            <TableRow 
              key={index}
              className={tournament.currentLevel === level.level ? 'bg-blue-500/10' : ''}
            >
              <TableCell className="font-medium">
                {level.level}
                {tournament.currentLevel === level.level && (
                  <Badge variant="outline" className="ml-2">Current</Badge>
                )}
              </TableCell>
              <TableCell>{formatCurrency(level.smallBlind)}</TableCell>
              <TableCell>{formatCurrency(level.bigBlind)}</TableCell>
              <TableCell>{level.ante ? formatCurrency(level.ante) : '-'}</TableCell>
              <TableCell>{level.duration} min</TableCell>
              <TableCell>
                {level.breakAfter ? `${level.breakDuration || 5} min` : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                Poker Tournaments
                <Badge className="bg-purple-600 text-white">Live Events</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Compete in world-class poker tournaments with guaranteed prize pools and exciting formats
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {tournaments.filter(t => t.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Live Now</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tournaments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tournament Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="multi-table">Multi-Table</SelectItem>
                  <SelectItem value="sit-and-go">Sit & Go</SelectItem>
                  <SelectItem value="heads-up">Heads-Up</SelectItem>
                  <SelectItem value="knockout">Knockout</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBuyIn} onValueChange={setFilterBuyIn}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Buy-in" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buy-ins</SelectItem>
                  <SelectItem value="low">Low ($0-50)</SelectItem>
                  <SelectItem value="mid">Mid ($51-500)</SelectItem>
                  <SelectItem value="high">High ($501+)</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={loadTournaments}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Views */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            All Tournaments
          </TabsTrigger>
          <TabsTrigger value="registered" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Registered
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Live Now
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentView} className="space-y-6">
          {/* Tournament Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {getFilteredTournaments().map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>

          {getFilteredTournaments().length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Tournaments Found</h3>
                <p className="text-muted-foreground">
                  {currentView === 'all' ? 'No tournaments match your current filters.' :
                   currentView === 'registered' ? 'You haven\'t registered for any tournaments yet.' :
                   currentView === 'live' ? 'No tournaments are currently running.' :
                   'No completed tournaments found.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Tournament Details Dialog */}
      <Dialog open={!!selectedTournament} onOpenChange={() => setSelectedTournament(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tournament Details</DialogTitle>
          </DialogHeader>
          {selectedTournament && (
            <TournamentDetails tournament={selectedTournament} />
          )}
        </DialogContent>
      </Dialog>

      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Tournament Registration</DialogTitle>
            <DialogDescription>
              You are about to register for this tournament. Please review the details below.
            </DialogDescription>
          </DialogHeader>
          
          {selectedForRegistration && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-bold">{selectedForRegistration.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedForRegistration.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Buy-in</div>
                  <div className="font-bold">
                    {selectedForRegistration.buyIn.gc > 0 && `${selectedForRegistration.buyIn.gc} GC`}
                    {selectedForRegistration.buyIn.gc > 0 && selectedForRegistration.buyIn.sc > 0 && ' + '}
                    {selectedForRegistration.buyIn.sc > 0 && `${selectedForRegistration.buyIn.sc} SC`}
                    {selectedForRegistration.buyIn.fee > 0 && ` + ${formatCurrency(selectedForRegistration.buyIn.fee)} fee`}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Prize Pool</div>
                  <div className="font-bold text-gold-400">
                    {formatCurrency(selectedForRegistration.currentPrizePool)}
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                By registering, you agree to the tournament rules and terms of service.
                Your buy-in will be deducted from your account balance.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegistrationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRegistration} disabled={isRegistering}>
              {isRegistering ? 'Registering...' : 'Confirm Registration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blind Structure Dialog */}
      <Dialog open={showStructureDialog} onOpenChange={setShowStructureDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Blind Structure</DialogTitle>
            <DialogDescription>
              Tournament blind levels and progression
            </DialogDescription>
          </DialogHeader>
          {selectedTournament && (
            <BlindStructure tournament={selectedTournament} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
