import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useToast } from '../hooks/use-toast';
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  RefreshCw, 
  Settings, 
  TrendingUp,
  Users,
  Trophy,
  Coins,
  AlertTriangle,
  Activity,
  Calendar,
  BarChart3,
  DollarSign,
  Clock,
  Star,
  Zap,
  Target,
  Palette,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';

interface Theme {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  background_image?: string;
  is_active: boolean;
  sort_order: number;
}

interface CardType {
  id: number;
  theme_id: number;
  name: string;
  display_name: string;
  description?: string;
  game_type: string;
  cost_gc: number;
  cost_sc: number;
  currency_type: string;
  max_prize_gc: number;
  max_prize_sc: number;
  overall_odds: number;
  rtp_percentage: number;
  is_active: boolean;
  is_featured: boolean;
  total_sold: number;
  total_winnings_gc: number;
  total_winnings_sc: number;
  theme_name?: string;
}

interface Prize {
  id: number;
  card_type_id: number;
  prize_tier: string;
  prize_name: string;
  prize_gc: number;
  prize_sc: number;
  win_probability: number;
  total_wins: number;
  is_active: boolean;
}

interface CardInstance {
  id: number;
  instance_id: string;
  card_type_id: number;
  user_id: number;
  status: string;
  is_winner: boolean;
  winnings_gc: number;
  winnings_sc: number;
  prize_claimed: boolean;
  purchased_at: string;
  completed_at?: string;
  card_name?: string;
  theme_name?: string;
  username?: string;
  email?: string;
}

interface ScratchCardStats {
  overall: {
    total_cards_sold: number;
    total_players: number;
    total_revenue_gc: number;
    total_revenue_sc: number;
    total_wins: number;
    total_winnings_gc: number;
    total_winnings_sc: number;
    unscratched_cards: number;
    completed_cards: number;
    unclaimed_prizes: number;
  };
  by_type: Array<{
    display_name: string;
    cards_sold: number;
    revenue_gc: number;
    revenue_sc: number;
    wins: number;
  }>;
}

export default function ScratchCardAdmin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [cardInstances, setCardInstances] = useState<CardInstance[]>([]);
  const [stats, setStats] = useState<ScratchCardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCardType, setSelectedCardType] = useState<CardType | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [showCreateTheme, setShowCreateTheme] = useState(false);
  const [showCreateCardType, setShowCreateCardType] = useState(false);
  const [showEditCardType, setShowEditCardType] = useState(false);
  const [newTheme, setNewTheme] = useState({
    name: '',
    display_name: '',
    description: '',
    background_image: '',
    is_active: true,
    sort_order: 0,
  });
  const [newCardType, setNewCardType] = useState({
    theme_id: 0,
    name: '',
    display_name: '',
    description: '',
    game_type: 'match_three',
    cost_gc: 1000,
    cost_sc: 0,
    currency_type: 'GC',
    max_prize_gc: 50000,
    max_prize_sc: 0,
    overall_odds: 0.25,
    rtp_percentage: 85,
    is_active: true,
    is_featured: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [themesRes, cardTypesRes, instancesRes, statsRes] = await Promise.all([
        fetch('/api/scratch-cards/admin/themes', { headers: { 'Authorization': `Bearer ${token}` }}),
        fetch('/api/scratch-cards/admin/types', { headers: { 'Authorization': `Bearer ${token}` }}),
        fetch('/api/scratch-cards/admin/instances?limit=100', { headers: { 'Authorization': `Bearer ${token}` }}),
        fetch('/api/scratch-cards/admin/stats', { headers: { 'Authorization': `Bearer ${token}` }})
      ]);

      if (themesRes.ok) {
        const result = await themesRes.json();
        setThemes(result.data || []);
      }
      
      if (cardTypesRes.ok) {
        const result = await cardTypesRes.json();
        setCardTypes(result.data || []);
      }
      
      if (instancesRes.ok) {
        const result = await instancesRes.json();
        setCardInstances(result.data || []);
      }
      
      if (statsRes.ok) {
        const result = await statsRes.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTheme = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/scratch-cards/admin/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTheme)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Theme created successfully" });
        setShowCreateTheme(false);
        setNewTheme({
          name: '',
          display_name: '',
          description: '',
          background_image: '',
          is_active: true,
          sort_order: 0,
        });
        await loadAllData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create theme",
        variant: "destructive"
      });
    }
  };

  const handleCreateCardType = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/scratch-cards/admin/types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCardType)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Card type created successfully" });
        setShowCreateCardType(false);
        setNewCardType({
          theme_id: 0,
          name: '',
          display_name: '',
          description: '',
          game_type: 'match_three',
          cost_gc: 1000,
          cost_sc: 0,
          currency_type: 'GC',
          max_prize_gc: 50000,
          max_prize_sc: 0,
          overall_odds: 0.25,
          rtp_percentage: 85,
          is_active: true,
          is_featured: false,
        });
        await loadAllData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create card type",
        variant: "destructive"
      });
    }
  };

  const handleToggleCardType = async (cardTypeId: number, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/scratch-cards/admin/types/${cardTypeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: isActive })
      });

      if (response.ok) {
        setCardTypes(prev => prev.map(ct => 
          ct.id === cardTypeId ? { ...ct, is_active: isActive } : ct
        ));
        toast({
          title: "Success",
          description: `Card type ${isActive ? 'activated' : 'deactivated'} successfully`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card type",
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/scratch-cards/admin/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scratch-cards-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const filteredInstances = cardInstances.filter(instance => {
    const matchesSearch = instance.instance_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      completed: 'default',
      unscratched: 'secondary',
      partially_scratched: 'outline',
      expired: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scratch Card Administration</h1>
          <p className="text-muted-foreground">Manage scratch card types, themes, and monitor gameplay</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadAllData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cards Sold (24h)</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall.total_cards_sold.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overall.total_players} unique players
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (24h)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall.total_revenue_gc.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                GC + {stats.overall.total_revenue_sc} SC
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall.total_wins}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overall.total_winnings_gc.toLocaleString()} GC paid out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unscratched</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall.unscratched_cards}</div>
              <p className="text-xs text-muted-foreground">
                Active cards waiting
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unclaimed Prizes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall.unclaimed_prizes}</div>
              <p className="text-xs text-muted-foreground">
                Prizes waiting to be claimed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="card-types">Card Types</TabsTrigger>
          <TabsTrigger value="instances">Game Instances</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Card Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.by_type.slice(0, 5).map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{type.display_name}</p>
                        <p className="text-sm text-muted-foreground">{type.cards_sold} sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{type.revenue_gc.toLocaleString()} GC</p>
                        <p className="text-sm text-muted-foreground">{type.wins} wins</p>
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cardInstances.slice(0, 5).map(instance => (
                    <div key={instance.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{instance.username}</p>
                        <p className="text-sm text-muted-foreground">{instance.card_name}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(instance.status)}
                        {instance.is_winner && (
                          <p className="text-sm text-green-600 mt-1">
                            Won {instance.winnings_gc} GC
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="card-types" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Card Types Management</h2>
            <Button onClick={() => setShowCreateCardType(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Card Type
            </Button>
          </div>

          <div className="grid gap-4">
            {cardTypes.map(cardType => (
              <Card key={cardType.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {cardType.display_name}
                        {cardType.is_featured && (
                          <Badge variant="secondary">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{cardType.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={cardType.is_active}
                        onCheckedChange={(checked) => handleToggleCardType(cardType.id, checked)}
                      />
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-medium">{cardType.cost_gc.toLocaleString()} GC</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max Prize</p>
                      <p className="font-medium">{cardType.max_prize_gc.toLocaleString()} GC</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Win Rate</p>
                      <p className="font-medium">{(cardType.overall_odds * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">RTP</p>
                      <p className="font-medium">{cardType.rtp_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Sold</p>
                      <p className="font-medium">{cardType.total_sold.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Winnings</p>
                      <p className="font-medium">{cardType.total_winnings_gc.toLocaleString()} GC</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Game Type</p>
                      <p className="font-medium">{cardType.game_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Theme</p>
                      <p className="font-medium">{cardType.theme_name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Game Instances</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search instances..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unscratched">Unscratched</SelectItem>
                  <SelectItem value="partially_scratched">Partial</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instance ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Card Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Winner</TableHead>
                  <TableHead>Winnings</TableHead>
                  <TableHead>Purchased</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstances.map(instance => (
                  <TableRow key={instance.id}>
                    <TableCell className="font-mono text-sm">{instance.instance_id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{instance.username}</div>
                        <div className="text-sm text-muted-foreground">{instance.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{instance.card_name}</TableCell>
                    <TableCell>{getStatusBadge(instance.status)}</TableCell>
                    <TableCell>
                      {instance.is_winner ? (
                        <Badge variant="default" className="bg-green-600">
                          <Trophy className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {instance.is_winner ? (
                        <div>
                          <div className="font-medium">{instance.winnings_gc.toLocaleString()} GC</div>
                          {!instance.prize_claimed && (
                            <Badge variant="secondary" className="text-xs">Unclaimed</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(instance.purchased_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Themes Management</h2>
            <Button onClick={() => setShowCreateTheme(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Theme
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map(theme => (
              <Card key={theme.id}>
                <div className="h-32 bg-gradient-to-br from-gold-100 to-gold-200"
                     style={{ 
                       backgroundImage: theme.background_image ? `url(${theme.background_image})` : undefined,
                       backgroundSize: 'cover',
                       backgroundPosition: 'center'
                     }}>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{theme.display_name}</CardTitle>
                    <Badge variant={theme.is_active ? 'default' : 'secondary'}>
                      {theme.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{theme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Order: {theme.sort_order}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Palette className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Theme Dialog */}
      <Dialog open={showCreateTheme} onOpenChange={setShowCreateTheme}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Theme</DialogTitle>
            <DialogDescription>
              Add a new theme for scratch cards
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Name</Label>
              <Input
                id="theme-name"
                value={newTheme.name}
                onChange={(e) => setNewTheme(prev => ({ ...prev, name: e.target.value }))}
                placeholder="theme_name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-display-name">Display Name</Label>
              <Input
                id="theme-display-name"
                value={newTheme.display_name}
                onChange={(e) => setNewTheme(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Theme Display Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-description">Description</Label>
              <Textarea
                id="theme-description"
                value={newTheme.description}
                onChange={(e) => setNewTheme(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Theme description..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-bg-image">Background Image URL</Label>
              <Input
                id="theme-bg-image"
                value={newTheme.background_image}
                onChange={(e) => setNewTheme(prev => ({ ...prev, background_image: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="theme-active"
                checked={newTheme.is_active}
                onCheckedChange={(checked) => setNewTheme(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="theme-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTheme(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTheme}>
              Create Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Card Type Dialog */}
      <Dialog open={showCreateCardType} onOpenChange={setShowCreateCardType}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Card Type</DialogTitle>
            <DialogDescription>
              Add a new scratch card type
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-theme">Theme</Label>
              <Select value={newCardType.theme_id.toString()} onValueChange={(value) => setNewCardType(prev => ({ ...prev, theme_id: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map(theme => (
                    <SelectItem key={theme.id} value={theme.id.toString()}>
                      {theme.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-name">Name</Label>
              <Input
                id="card-name"
                value={newCardType.name}
                onChange={(e) => setNewCardType(prev => ({ ...prev, name: e.target.value }))}
                placeholder="card_name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-display-name">Display Name</Label>
              <Input
                id="card-display-name"
                value={newCardType.display_name}
                onChange={(e) => setNewCardType(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Card Display Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-game-type">Game Type</Label>
              <Select value={newCardType.game_type} onValueChange={(value) => setNewCardType(prev => ({ ...prev, game_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match_three">Match Three</SelectItem>
                  <SelectItem value="instant_win">Instant Win</SelectItem>
                  <SelectItem value="symbol_match">Symbol Match</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-cost-gc">Cost (GC)</Label>
              <Input
                id="card-cost-gc"
                type="number"
                value={newCardType.cost_gc}
                onChange={(e) => setNewCardType(prev => ({ ...prev, cost_gc: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-max-prize">Max Prize (GC)</Label>
              <Input
                id="card-max-prize"
                type="number"
                value={newCardType.max_prize_gc}
                onChange={(e) => setNewCardType(prev => ({ ...prev, max_prize_gc: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-odds">Win Rate (%)</Label>
              <Input
                id="card-odds"
                type="number"
                step="0.01"
                value={newCardType.overall_odds * 100}
                onChange={(e) => setNewCardType(prev => ({ ...prev, overall_odds: parseFloat(e.target.value) / 100 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-rtp">RTP (%)</Label>
              <Input
                id="card-rtp"
                type="number"
                step="0.01"
                value={newCardType.rtp_percentage}
                onChange={(e) => setNewCardType(prev => ({ ...prev, rtp_percentage: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="card-description">Description</Label>
              <Textarea
                id="card-description"
                value={newCardType.description}
                onChange={(e) => setNewCardType(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Card description..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="card-active"
                checked={newCardType.is_active}
                onCheckedChange={(checked) => setNewCardType(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="card-active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="card-featured"
                checked={newCardType.is_featured}
                onCheckedChange={(checked) => setNewCardType(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="card-featured">Featured</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCardType(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCardType}>
              Create Card Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
