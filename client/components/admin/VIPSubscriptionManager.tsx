import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import {
  Crown,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Star,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Gift,
  Award,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VIPTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  color: string;
  benefits: string[];
  maxUsers?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VIPSubscription {
  id: string;
  userId: string;
  userEmail: string;
  tierType: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  isAutoRenew: boolean;
  paymentMethod: 'paypal' | 'googlepay' | 'card';
  lastPayment: Date;
  nextPayment: Date;
  totalPaid: number;
  createdAt: Date;
}

interface VIPAnalytics {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  churnRate: number;
  averageLifetime: number;
  conversionRate: number;
  tierDistribution: { [key: string]: number };
}

interface VIPBenefit {
  id: string;
  name: string;
  description: string;
  type: 'feature' | 'bonus' | 'access' | 'support';
  isActive: boolean;
}

export default function VIPSubscriptionManager() {
  const { toast } = useToast();

  const [vipTiers, setVipTiers] = useState<VIPTier[]>([
    {
      id: 'basic_vip',
      name: 'Basic VIP',
      monthlyPrice: 20,
      yearlyPrice: 200,
      color: 'from-blue-500 to-blue-600',
      benefits: [
        'Priority customer support',
        'Exclusive game access',
        'Daily bonus multiplier x2',
        'VIP chat badge',
        'Monthly free coins'
      ],
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'premium_vip',
      name: 'Premium VIP',
      monthlyPrice: 50,
      yearlyPrice: 500,
      color: 'from-purple-500 to-purple-600',
      benefits: [
        'All Basic VIP benefits',
        'Personal account manager',
        'Exclusive tournaments',
        'Daily bonus multiplier x3',
        'Priority game access',
        'Custom avatar frames',
        'Monthly exclusive gifts'
      ],
      isActive: true,
      sortOrder: 2,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'diamond_vip',
      name: 'Diamond VIP',
      monthlyPrice: 100,
      yearlyPrice: 1000,
      color: 'from-gold-500 to-gold-600',
      benefits: [
        'All Premium VIP benefits',
        '24/7 dedicated support',
        'Exclusive VIP events',
        'Daily bonus multiplier x5',
        'Custom game limits',
        'VIP-only games',
        'Monthly cash bonuses',
        'Concierge services'
      ],
      maxUsers: 100,
      isActive: true,
      sortOrder: 3,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]);

  const [subscriptions, setSubscriptions] = useState<VIPSubscription[]>([
    {
      id: 'sub_001',
      userId: 'user_123',
      userEmail: 'player1@example.com',
      tierType: 'basic_vip',
      status: 'active',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      isAutoRenew: true,
      paymentMethod: 'paypal',
      lastPayment: new Date('2024-01-15'),
      nextPayment: new Date('2024-02-15'),
      totalPaid: 60,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'sub_002',
      userId: 'user_456',
      userEmail: 'player2@example.com',
      tierType: 'premium_vip',
      status: 'active',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-02-10'),
      isAutoRenew: false,
      paymentMethod: 'googlepay',
      lastPayment: new Date('2024-01-10'),
      nextPayment: new Date('2024-02-10'),
      totalPaid: 100,
      createdAt: new Date('2024-01-10')
    }
  ]);

  const [analytics, setAnalytics] = useState<VIPAnalytics>({
    totalSubscribers: 847,
    activeSubscribers: 756,
    monthlyRevenue: 25680,
    yearlyRevenue: 308160,
    churnRate: 8.5,
    averageLifetime: 8.2,
    conversionRate: 12.4,
    tierDistribution: {
      'basic_vip': 420,
      'premium_vip': 280,
      'diamond_vip': 56
    }
  });

  const [availableBenefits] = useState<VIPBenefit[]>([
    { id: 'priority_support', name: 'Priority Support', description: 'Get faster response times', type: 'support', isActive: true },
    { id: 'exclusive_games', name: 'Exclusive Games', description: 'Access to VIP-only games', type: 'access', isActive: true },
    { id: 'bonus_multiplier', name: 'Bonus Multiplier', description: 'Increased daily bonuses', type: 'bonus', isActive: true },
    { id: 'custom_limits', name: 'Custom Limits', description: 'Higher betting limits', type: 'feature', isActive: true },
    { id: 'tournaments', name: 'VIP Tournaments', description: 'Exclusive tournament access', type: 'access', isActive: true },
    { id: 'account_manager', name: 'Account Manager', description: 'Personal account manager', type: 'support', isActive: true }
  ]);

  const [editingTier, setEditingTier] = useState<VIPTier | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tiers');

  const startEditingTier = (tier: VIPTier) => {
    setEditingTier({ ...tier });
    setIsEditing(true);
  };

  const startCreatingTier = () => {
    setEditingTier({
      id: '',
      name: '',
      monthlyPrice: 20,
      yearlyPrice: 200,
      color: 'from-blue-500 to-blue-600',
      benefits: [],
      isActive: true,
      sortOrder: vipTiers.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  const saveTier = () => {
    if (!editingTier) return;

    if (!editingTier.name || editingTier.monthlyPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isCreating) {
      const newTier = {
        ...editingTier,
        id: editingTier.name.toLowerCase().replace(/\s+/g, '_'),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setVipTiers([...vipTiers, newTier]);
      
      toast({
        title: "VIP Tier Created",
        description: `${newTier.name} has been created successfully`,
      });
    } else {
      setVipTiers(vipTiers.map(tier => 
        tier.id === editingTier.id 
          ? { ...editingTier, updatedAt: new Date() }
          : tier
      ));
      
      toast({
        title: "VIP Tier Updated",
        description: `${editingTier.name} has been updated successfully`,
      });
    }

    setIsEditing(false);
    setIsCreating(false);
    setEditingTier(null);
  };

  const deleteTier = (tierId: string) => {
    setVipTiers(vipTiers.filter(tier => tier.id !== tierId));
    toast({
      title: "VIP Tier Deleted",
      description: "VIP tier has been removed",
    });
  };

  const toggleTierStatus = (tierId: string) => {
    setVipTiers(vipTiers.map(tier => 
      tier.id === tierId 
        ? { ...tier, isActive: !tier.isActive, updatedAt: new Date() }
        : tier
    ));
  };

  const updateSubscriptionStatus = (subId: string, newStatus: VIPSubscription['status']) => {
    setSubscriptions(subscriptions.map(sub =>
      sub.id === subId ? { ...sub, status: newStatus } : sub
    ));
    
    toast({
      title: "Subscription Updated",
      description: `Subscription status changed to ${newStatus}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      case 'expired': return 'text-gray-500';
      case 'pending': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const updateBenefits = (benefits: string) => {
    if (!editingTier) return;
    const benefitArray = benefits.split('\n').filter(b => b.trim());
    setEditingTier({ ...editingTier, benefits: benefitArray });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">VIP Subscription Manager</h2>
          <p className="text-muted-foreground">Manage VIP tiers, subscriptions, and benefits</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={startCreatingTier}>
            <Plus className="w-4 h-4 mr-2" />
            New VIP Tier
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Active Subscribers</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {analytics.activeSubscribers.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              of {analytics.totalSubscribers.toLocaleString()} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Monthly Revenue</span>
            </div>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(analytics.monthlyRevenue)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(analytics.yearlyRevenue)} yearly
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Conversion Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">
              {analytics.conversionRate}%
            </div>
            <div className="text-xs text-muted-foreground">
              {analytics.churnRate}% churn rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Avg Lifetime</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">
              {analytics.averageLifetime} months
            </div>
            <div className="text-xs text-muted-foreground">
              subscriber lifetime
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tiers">VIP Tiers</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vipTiers.map((tier) => (
              <Card key={tier.id} className={`relative ${!tier.isActive ? 'opacity-60' : ''}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-5 rounded-lg`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-gold-500" />
                        {tier.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-2xl font-bold">
                          {formatCurrency(tier.monthlyPrice)}/mo
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(tier.yearlyPrice)}/yr
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={tier.isActive}
                      onCheckedChange={() => toggleTierStatus(tier.id)}
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Benefits:</h4>
                    <ul className="space-y-1">
                      {tier.benefits.slice(0, 4).map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                      {tier.benefits.length > 4 && (
                        <li className="text-sm text-muted-foreground">
                          +{tier.benefits.length - 4} more benefits
                        </li>
                      )}
                    </ul>
                  </div>

                  {tier.maxUsers && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Max Users: </span>
                      <span className="font-medium">{tier.maxUsers}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditingTier(tier)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTier(tier.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((subscription) => {
                  const tier = vipTiers.find(t => t.id === subscription.tierType);
                  return (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-gold-500" />
                          <div>
                            <div className="font-medium">{subscription.userEmail}</div>
                            <div className="text-sm text-muted-foreground">
                              {tier?.name} • Started {subscription.startDate.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(subscription.totalPaid)} paid
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Next: {subscription.nextPayment.toLocaleDateString()}
                          </div>
                        </div>
                        
                        <Select 
                          value={subscription.status} 
                          onValueChange={(value: VIPSubscription['status']) => 
                            updateSubscriptionStatus(subscription.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.tierDistribution).map(([tierId, count]) => {
                    const tier = vipTiers.find(t => t.id === tierId);
                    const percentage = (count / analytics.totalSubscribers) * 100;
                    return (
                      <div key={tierId} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{tier?.name}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vipTiers.map((tier) => {
                    const subscribers = analytics.tierDistribution[tier.id] || 0;
                    const revenue = subscribers * tier.monthlyPrice;
                    return (
                      <div key={tier.id} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <div>
                          <div className="font-medium">{tier.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {subscribers} subscribers
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(revenue)}</div>
                          <div className="text-sm text-muted-foreground">monthly</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>VIP System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Configure global VIP system settings, payment processing, and automatic renewals.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Trial Period (days)</Label>
                  <Input type="number" defaultValue="7" min="0" max="30" />
                </div>
                <div>
                  <Label>Grace Period (days)</Label>
                  <Input type="number" defaultValue="3" min="0" max="7" />
                </div>
                <div>
                  <Label>Auto-Renewal Default</Label>
                  <Select defaultValue="enabled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="user_choice">User Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Retry Attempts</Label>
                  <Input type="number" defaultValue="3" min="1" max="5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Tier Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New VIP Tier' : `Edit ${editingTier?.name}`}
            </DialogTitle>
          </DialogHeader>

          {editingTier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tier Name</Label>
                  <Input
                    id="name"
                    value={editingTier.name}
                    onChange={(e) => setEditingTier({...editingTier, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color Theme</Label>
                  <Select value={editingTier.color} onValueChange={(value) => setEditingTier({...editingTier, color: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="from-blue-500 to-blue-600">Blue</SelectItem>
                      <SelectItem value="from-purple-500 to-purple-600">Purple</SelectItem>
                      <SelectItem value="from-gold-500 to-gold-600">Gold</SelectItem>
                      <SelectItem value="from-green-500 to-green-600">Green</SelectItem>
                      <SelectItem value="from-red-500 to-red-600">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    min="1"
                    step="1"
                    value={editingTier.monthlyPrice}
                    onChange={(e) => setEditingTier({...editingTier, monthlyPrice: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="yearlyPrice">Yearly Price ($)</Label>
                  <Input
                    id="yearlyPrice"
                    type="number"
                    min="1"
                    step="1"
                    value={editingTier.yearlyPrice}
                    onChange={(e) => setEditingTier({...editingTier, yearlyPrice: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxUsers">Max Users (optional)</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="1"
                  value={editingTier.maxUsers || ''}
                  onChange={(e) => setEditingTier({...editingTier, maxUsers: e.target.value ? parseInt(e.target.value) : undefined})}
                />
              </div>

              <div>
                <Label htmlFor="benefits">Benefits (one per line)</Label>
                <textarea
                  id="benefits"
                  rows={8}
                  className="w-full p-3 border rounded-md"
                  value={editingTier.benefits.join('\n')}
                  onChange={(e) => updateBenefits(e.target.value)}
                  placeholder="Priority customer support&#10;Exclusive game access&#10;Daily bonus multiplier x2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingTier.isActive}
                  onCheckedChange={(checked) => setEditingTier({...editingTier, isActive: checked})}
                />
                <Label>Active Tier</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={saveTier}>
              {isCreating ? 'Create Tier' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
