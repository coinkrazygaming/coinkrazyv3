import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Award,
  Coins,
  Star,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Activity,
  RefreshCw,
} from "lucide-react";
import { bonusService, BonusConfig, UserBonus, BonusStats } from "@/services/bonusService";

const BonusManagement: React.FC = () => {
  const [bonuses, setBonuses] = useState<BonusConfig[]>([]);
  const [selectedBonus, setSelectedBonus] = useState<BonusConfig | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bonusStats, setBonusStats] = useState<BonusStats | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Form state for creating/editing bonuses
  const [formData, setFormData] = useState({
    type: 'welcome' as BonusConfig['type'],
    name: '',
    description: '',
    isActive: true,
    gcAmount: 0,
    scAmount: 0,
    matchPercentage: 0,
    maxAmount: 0,
    minDeposit: 0,
    cooldownHours: 0,
    requirements: {
      minLevel: 0,
      maxUses: 1,
      expiryDays: 30,
      wagering: 1
    }
  });

  useEffect(() => {
    loadBonuses();
    loadBonusStats();
  }, []);

  const loadBonuses = () => {
    const allBonuses = bonusService.getAllBonuses();
    setBonuses(allBonuses);
  };

  const loadBonusStats = () => {
    const stats = bonusService.getBonusStats();
    setBonusStats(stats);
  };

  const handleCreateBonus = () => {
    const bonusId = bonusService.createBonus(formData);
    if (bonusId) {
      loadBonuses();
      loadBonusStats();
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEditBonus = () => {
    if (selectedBonus) {
      const success = bonusService.updateBonus(selectedBonus.id, formData);
      if (success) {
        loadBonuses();
        loadBonusStats();
        setIsEditDialogOpen(false);
        setSelectedBonus(null);
        resetForm();
      }
    }
  };

  const handleDeleteBonus = (bonusId: string) => {
    if (confirm('Are you sure you want to delete this bonus? This action cannot be undone.')) {
      bonusService.deleteBonus(bonusId);
      loadBonuses();
      loadBonusStats();
    }
  };

  const handleToggleBonus = (bonusId: string, isActive: boolean) => {
    bonusService.updateBonus(bonusId, { isActive });
    loadBonuses();
  };

  const resetForm = () => {
    setFormData({
      type: 'welcome',
      name: '',
      description: '',
      isActive: true,
      gcAmount: 0,
      scAmount: 0,
      matchPercentage: 0,
      maxAmount: 0,
      minDeposit: 0,
      cooldownHours: 0,
      requirements: {
        minLevel: 0,
        maxUses: 1,
        expiryDays: 30,
        wagering: 1
      }
    });
  };

  const openEditDialog = (bonus: BonusConfig) => {
    setSelectedBonus(bonus);
    setFormData({
      type: bonus.type,
      name: bonus.name,
      description: bonus.description,
      isActive: bonus.isActive,
      gcAmount: bonus.gcAmount || 0,
      scAmount: bonus.scAmount || 0,
      matchPercentage: bonus.matchPercentage || 0,
      maxAmount: bonus.maxAmount || 0,
      minDeposit: bonus.minDeposit || 0,
      cooldownHours: bonus.cooldownHours || 0,
      requirements: bonus.requirements
    });
    setIsEditDialogOpen(true);
  };

  const getBonusTypeIcon = (type: BonusConfig['type']) => {
    switch (type) {
      case 'welcome': return <Gift className="w-4 h-4" />;
      case 'deposit': return <DollarSign className="w-4 h-4" />;
      case 'reload': return <RefreshCw className="w-4 h-4" />;
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <Clock className="w-4 h-4" />;
      case 'vip': return <Star className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getBonusTypeColor = (type: BonusConfig['type']) => {
    switch (type) {
      case 'welcome': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'deposit': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'reload': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'daily': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'weekly': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'vip': return 'bg-gold-500/10 text-gold-400 border-gold-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bonus Management</h2>
          <p className="text-muted-foreground">Manage welcome bonuses, deposits, and promotional offers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Bonus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Bonus</DialogTitle>
              <DialogDescription>
                Configure a new bonus offer for your players
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bonus-type">Bonus Type</Label>
                  <Select value={formData.type} onValueChange={(value: BonusConfig['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome Bonus</SelectItem>
                      <SelectItem value="deposit">Deposit Bonus</SelectItem>
                      <SelectItem value="reload">Reload Bonus</SelectItem>
                      <SelectItem value="daily">Daily Bonus</SelectItem>
                      <SelectItem value="weekly">Weekly Bonus</SelectItem>
                      <SelectItem value="vip">VIP Bonus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="bonus-name">Bonus Name</Label>
                <Input
                  id="bonus-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter bonus name"
                />
              </div>
              
              <div>
                <Label htmlFor="bonus-description">Description</Label>
                <Textarea
                  id="bonus-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter bonus description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gc-amount">Gold Coins</Label>
                  <Input
                    id="gc-amount"
                    type="number"
                    value={formData.gcAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, gcAmount: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="sc-amount">Sweeps Coins</Label>
                  <Input
                    id="sc-amount"
                    type="number"
                    value={formData.scAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, scAmount: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
              </div>
              
              {formData.type === 'deposit' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="match-percentage">Match %</Label>
                    <Input
                      id="match-percentage"
                      type="number"
                      value={formData.matchPercentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, matchPercentage: Number(e.target.value) }))}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-amount">Max Amount ($)</Label>
                    <Input
                      id="max-amount"
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: Number(e.target.value) }))}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="min-deposit">Min Deposit ($)</Label>
                    <Input
                      id="min-deposit"
                      type="number"
                      value={formData.minDeposit}
                      onChange={(e) => setFormData(prev => ({ ...prev, minDeposit: Number(e.target.value) }))}
                      placeholder="10"
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max-uses">Max Uses</Label>
                  <Input
                    id="max-uses"
                    type="number"
                    value={formData.requirements.maxUses}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, maxUses: Number(e.target.value) }
                    }))}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="expiry-days">Expiry (Days)</Label>
                  <Input
                    id="expiry-days"
                    type="number"
                    value={formData.requirements.expiryDays}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, expiryDays: Number(e.target.value) }
                    }))}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="wagering">Wagering Req</Label>
                  <Input
                    id="wagering"
                    type="number"
                    value={formData.requirements.wagering}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      requirements: { ...prev.requirements, wagering: Number(e.target.value) }
                    }))}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBonus}>Create Bonus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      {bonusStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Awarded</p>
                  <p className="text-2xl font-bold">{bonusStats.totalAwarded}</p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{bonusStats.activeUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{bonusStats.completionRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gold-500/10 to-gold-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total GC</p>
                  <p className="text-2xl font-bold">{bonusStats.totalGCAwarded.toLocaleString()}</p>
                </div>
                <Coins className="w-8 h-8 text-gold-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-casino-blue/10 to-casino-blue/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total SC</p>
                  <p className="text-2xl font-bold">{bonusStats.totalSCAwarded}</p>
                </div>
                <Star className="w-8 h-8 text-casino-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion</p>
                  <p className="text-2xl font-bold">{bonusStats.conversionRate.toFixed(1)}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bonuses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Active Bonuses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bonuses.map((bonus) => (
              <div
                key={bonus.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getBonusTypeColor(bonus.type)}`}>
                    {getBonusTypeIcon(bonus.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{bonus.name}</h3>
                    <p className="text-sm text-muted-foreground">{bonus.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {bonus.gcAmount && (
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-gold-500" />
                          <span className="text-sm">{bonus.gcAmount} GC</span>
                        </div>
                      )}
                      {bonus.scAmount && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-casino-blue" />
                          <span className="text-sm">{bonus.scAmount} SC</span>
                        </div>
                      )}
                      {bonus.matchPercentage && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          <span className="text-sm">{bonus.matchPercentage}% match up to ${bonus.maxAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={bonus.isActive}
                    onCheckedChange={(checked) => handleToggleBonus(bonus.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(bonus)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBonus(bonus.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bonus</DialogTitle>
            <DialogDescription>
              Update bonus configuration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-bonus-type">Bonus Type</Label>
                <Select value={formData.type} onValueChange={(value: BonusConfig['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Bonus</SelectItem>
                    <SelectItem value="deposit">Deposit Bonus</SelectItem>
                    <SelectItem value="reload">Reload Bonus</SelectItem>
                    <SelectItem value="daily">Daily Bonus</SelectItem>
                    <SelectItem value="weekly">Weekly Bonus</SelectItem>
                    <SelectItem value="vip">VIP Bonus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Active</Label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-bonus-name">Bonus Name</Label>
              <Input
                id="edit-bonus-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter bonus name"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-bonus-description">Description</Label>
              <Textarea
                id="edit-bonus-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter bonus description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-gc-amount">Gold Coins</Label>
                <Input
                  id="edit-gc-amount"
                  type="number"
                  value={formData.gcAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, gcAmount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-sc-amount">Sweeps Coins</Label>
                <Input
                  id="edit-sc-amount"
                  type="number"
                  value={formData.scAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, scAmount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            {formData.type === 'deposit' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-match-percentage">Match %</Label>
                  <Input
                    id="edit-match-percentage"
                    type="number"
                    value={formData.matchPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, matchPercentage: Number(e.target.value) }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-max-amount">Max Amount ($)</Label>
                  <Input
                    id="edit-max-amount"
                    type="number"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: Number(e.target.value) }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-min-deposit">Min Deposit ($)</Label>
                  <Input
                    id="edit-min-deposit"
                    type="number"
                    value={formData.minDeposit}
                    onChange={(e) => setFormData(prev => ({ ...prev, minDeposit: Number(e.target.value) }))}
                    placeholder="10"
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-max-uses">Max Uses</Label>
                <Input
                  id="edit-max-uses"
                  type="number"
                  value={formData.requirements.maxUses}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    requirements: { ...prev.requirements, maxUses: Number(e.target.value) }
                  }))}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="edit-expiry-days">Expiry (Days)</Label>
                <Input
                  id="edit-expiry-days"
                  type="number"
                  value={formData.requirements.expiryDays}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    requirements: { ...prev.requirements, expiryDays: Number(e.target.value) }
                  }))}
                  placeholder="30"
                />
              </div>
              <div>
                <Label htmlFor="edit-wagering">Wagering Req</Label>
                <Input
                  id="edit-wagering"
                  type="number"
                  value={formData.requirements.wagering}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    requirements: { ...prev.requirements, wagering: Number(e.target.value) }
                  }))}
                  placeholder="1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBonus}>Update Bonus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BonusManagement;
