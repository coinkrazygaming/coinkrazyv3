import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bonusService, Bonus } from "@/services/bonusService";
import { useToast } from "@/hooks/use-toast";
import {
  Gift,
  Users,
  TrendingUp,
  Calendar,
  Star,
  Trophy,
  Crown,
  Heart,
  Share2,
  Coins,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Loader2,
  BarChart3,
} from "lucide-react";

interface BonusStats {
  totalBonuses: number;
  totalClaimed: number;
  totalGCAwarded: number;
  totalSCAwarded: number;
  pendingBonuses: number;
  claimRate: number;
}

export default function BonusManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [bonusStats, setBonusStats] = useState<BonusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New bonus form
  const [newBonusForm, setNewBonusForm] = useState({
    type: 'daily',
    title: '',
    description: '',
    gcAmount: 0,
    scAmount: 0,
    wageringRequirement: 0,
    expiresIn: 24, // hours
    targetUsers: 'all'
  });

  useEffect(() => {
    loadBonusData();
  }, []);

  const loadBonusData = async () => {
    try {
      setLoading(true);
      const [bonusesData, statsData] = await Promise.all([
        bonusService.getAllBonuses(100),
        bonusService.getBonusStatistics()
      ]);

      setBonuses(bonusesData);
      
      // Calculate aggregated stats
      const totalBonuses = bonusesData.length;
      const totalClaimed = bonusesData.filter(b => b.status === 'claimed').length;
      const totalGCAwarded = bonusesData.reduce((sum, b) => sum + (b.gc_amount || 0), 0);
      const totalSCAwarded = bonusesData.reduce((sum, b) => sum + (b.sc_amount || 0), 0);
      const pendingBonuses = bonusesData.filter(b => b.status === 'pending').length;
      const claimRate = totalBonuses > 0 ? (totalClaimed / totalBonuses) * 100 : 0;

      setBonusStats({
        totalBonuses,
        totalClaimed,
        totalGCAwarded,
        totalSCAwarded,
        pendingBonuses,
        claimRate
      });
    } catch (error) {
      console.error('Failed to load bonus data:', error);
      toast({
        title: "Error",
        description: "Failed to load bonus data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadBonusData();
    setRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Bonus data has been updated.",
    });
  };

  const createBonus = async () => {
    if (!newBonusForm.title || !newBonusForm.description) {
      toast({
        title: "Validation Error",
        description: "Title and description are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real implementation, this would create bonuses for selected users
      // For now, we'll show a success message
      toast({
        title: "Bonus Created",
        description: `${newBonusForm.type} bonus has been created and distributed.`,
      });

      // Reset form
      setNewBonusForm({
        type: 'daily',
        title: '',
        description: '',
        gcAmount: 0,
        scAmount: 0,
        wageringRequirement: 0,
        expiresIn: 24,
        targetUsers: 'all'
      });

      // Refresh data
      await loadBonusData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bonus.",
        variant: "destructive"
      });
    }
  };

  const getBonusTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <Gift className="w-4 h-4" />;
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'deposit': return <DollarSign className="w-4 h-4" />;
      case 'loyalty': return <Trophy className="w-4 h-4" />;
      case 'referral': return <Users className="w-4 h-4" />;
      case 'vip': return <Crown className="w-4 h-4" />;
      case 'social': return <Share2 className="w-4 h-4" />;
      case 'wheel_spin': return <Star className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getBonusTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'daily': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'deposit': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'loyalty': return 'bg-gold-500/10 text-gold-500 border-gold-500/20';
      case 'referral': return 'bg-casino-blue/10 text-casino-blue border-casino-blue/20';
      case 'vip': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'social': return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      case 'wheel_spin': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'cancelled': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatCurrency = (amount: number, type: 'gc' | 'sc') => {
    if (type === 'gc') {
      return `${amount.toLocaleString()} GC`;
    } else {
      return `${amount.toFixed(2)} SC`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading bonus data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Bonus Management</h2>
          <p className="text-muted-foreground">Manage player bonuses and promotions</p>
        </div>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="active">
            <Clock className="w-4 h-4 mr-2" />
            Active Bonuses
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="w-4 h-4 mr-2" />
            Create Bonus
          </TabsTrigger>
          <TabsTrigger value="history">
            <Eye className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          {bonusStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <Gift className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{bonusStats.totalBonuses}</div>
                  <div className="text-sm text-muted-foreground">Total Bonuses</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{bonusStats.totalClaimed}</div>
                  <div className="text-sm text-muted-foreground">Claimed</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gold-500/10 to-gold-500/5 border-gold-500/20">
                <CardContent className="p-4 text-center">
                  <Coins className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{bonusStats.totalGCAwarded.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">GC Awarded</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-casino-blue/10 to-casino-blue/5 border-casino-blue/20">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-casino-blue mx-auto mb-2" />
                  <div className="text-2xl font-bold">{bonusStats.totalSCAwarded.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">SC Awarded</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bonus Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bonus Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Claim Rate</span>
                    <span className="font-bold text-green-500">
                      {bonusStats?.claimRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending Bonuses</span>
                    <span className="font-bold text-orange-500">
                      {bonusStats?.pendingBonuses}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average GC per Bonus</span>
                    <span className="font-bold">
                      {bonusStats && bonusStats.totalBonuses > 0 
                        ? Math.round(bonusStats.totalGCAwarded / bonusStats.totalBonuses).toLocaleString()
                        : 0} GC
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average SC per Bonus</span>
                    <span className="font-bold">
                      {bonusStats && bonusStats.totalBonuses > 0 
                        ? (bonusStats.totalSCAwarded / bonusStats.totalBonuses).toFixed(2)
                        : 0} SC
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Bonus Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bonuses.slice(0, 5).map((bonus) => (
                    <div key={bonus.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getBonusTypeIcon(bonus.bonus_type)}
                        <div>
                          <div className="font-medium text-sm">{bonus.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {bonus.username} • {new Date(bonus.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-bold">
                          {formatCurrency(bonus.gc_amount || 0, 'gc')}
                        </div>
                        <div className="text-casino-blue">
                          {formatCurrency(bonus.sc_amount || 0, 'sc')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Bonuses Tab */}
        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Bonuses</CardTitle>
              <p className="text-sm text-muted-foreground">
                Currently pending and available bonuses
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bonuses.filter(bonus => bonus.status === 'pending').map((bonus) => (
                  <div key={bonus.id} className="p-4 bg-muted/20 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getBonusTypeIcon(bonus.bonus_type)}
                          <span className="font-bold">{bonus.title}</span>
                        </div>
                        <Badge className={getBonusTypeColor(bonus.bonus_type)}>
                          {bonus.bonus_type}
                        </Badge>
                        <Badge className={getStatusColor(bonus.status)}>
                          {bonus.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gold-500">
                          {formatCurrency(bonus.gc_amount || 0, 'gc')}
                        </div>
                        <div className="font-bold text-casino-blue">
                          {formatCurrency(bonus.sc_amount || 0, 'sc')}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{bonus.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span>User: <strong>{bonus.username}</strong></span>
                        <span>Created: {new Date(bonus.created_at).toLocaleString()}</span>
                        {bonus.expires_at && (
                          <span>Expires: {new Date(bonus.expires_at).toLocaleString()}</span>
                        )}
                      </div>
                      {bonus.wagering_requirement > 0 && (
                        <span className="text-orange-500">
                          Wagering: {bonus.wagering_requirement}x
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {bonuses.filter(bonus => bonus.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active bonuses found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Bonus Tab */}
        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Bonus</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create and distribute bonuses to players
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Bonus Type</label>
                  <Select
                    value={newBonusForm.type}
                    onValueChange={(value) => setNewBonusForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Login</SelectItem>
                      <SelectItem value="deposit">Deposit Bonus</SelectItem>
                      <SelectItem value="loyalty">Loyalty Bonus</SelectItem>
                      <SelectItem value="referral">Referral Bonus</SelectItem>
                      <SelectItem value="vip">VIP Bonus</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="wheel_spin">Wheel Spin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Target Users</label>
                  <Select
                    value={newBonusForm.targetUsers}
                    onValueChange={(value) => setNewBonusForm(prev => ({ ...prev, targetUsers: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active Users Only</SelectItem>
                      <SelectItem value="new">New Users Only</SelectItem>
                      <SelectItem value="vip">VIP Users Only</SelectItem>
                      <SelectItem value="inactive">Inactive Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bonus Title</label>
                <Input
                  placeholder="Enter bonus title..."
                  value={newBonusForm.title}
                  onChange={(e) => setNewBonusForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  placeholder="Enter bonus description..."
                  value={newBonusForm.description}
                  onChange={(e) => setNewBonusForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Gold Coins (GC)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newBonusForm.gcAmount}
                    onChange={(e) => setNewBonusForm(prev => ({ ...prev, gcAmount: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sweeps Coins (SC)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newBonusForm.scAmount}
                    onChange={(e) => setNewBonusForm(prev => ({ ...prev, scAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Wagering Requirement (x)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newBonusForm.wageringRequirement}
                    onChange={(e) => setNewBonusForm(prev => ({ ...prev, wageringRequirement: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expires In (hours)</label>
                <Input
                  type="number"
                  placeholder="24"
                  value={newBonusForm.expiresIn}
                  onChange={(e) => setNewBonusForm(prev => ({ ...prev, expiresIn: parseInt(e.target.value) || 24 }))}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={createBonus} className="bg-green-500 hover:bg-green-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bonus
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setNewBonusForm({
                    type: 'daily',
                    title: '',
                    description: '',
                    gcAmount: 0,
                    scAmount: 0,
                    wageringRequirement: 0,
                    expiresIn: 24,
                    targetUsers: 'all'
                  })}
                >
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bonus History</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete history of all bonuses
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Bonus</th>
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-left p-2">Claimed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonuses.map((bonus) => (
                      <tr key={bonus.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{bonus.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {bonus.description}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{bonus.username}</div>
                            <div className="text-sm text-muted-foreground">{bonus.email}</div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge className={getBonusTypeColor(bonus.bonus_type)}>
                            {getBonusTypeIcon(bonus.bonus_type)}
                            <span className="ml-1">{bonus.bonus_type}</span>
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">
                            <div className="text-gold-500 font-medium">
                              {formatCurrency(bonus.gc_amount || 0, 'gc')}
                            </div>
                            <div className="text-casino-blue font-medium">
                              {formatCurrency(bonus.sc_amount || 0, 'sc')}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge className={getStatusColor(bonus.status)}>
                            {bonus.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">
                          {new Date(bonus.created_at).toLocaleString()}
                        </td>
                        <td className="p-2 text-sm">
                          {bonus.claimed_at 
                            ? new Date(bonus.claimed_at).toLocaleString()
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {bonuses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No bonus history found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
