import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  DollarSign,
  Coins,
  Crown,
  Star,
  Settings,
  TrendingUp,
  Users,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PackageData {
  id: string;
  name: string;
  description: string;
  goldCoins: number;
  sweepCoins: number;
  price: number;
  originalPrice?: number;
  isPopular: boolean;
  isBestValue: boolean;
  isNewCustomer: boolean;
  bonusPercentage?: number;
  icon: string;
  features: string[];
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PackageAnalytics {
  packageId: string;
  totalSales: number;
  revenue: number;
  conversionRate: number;
  averageRating: number;
  popularityRank: number;
}

interface PackageTemplate {
  id: string;
  name: string;
  packages: Partial<PackageData>[];
}

export default function PackageEditor() {
  const { toast } = useToast();

  const [packages, setPackages] = useState<PackageData[]>([
    {
      id: 'starter',
      name: 'Starter Pack',
      description: 'Perfect for new players',
      goldCoins: 50000,
      sweepCoins: 25,
      price: 9.99,
      isPopular: false,
      isBestValue: false,
      isNewCustomer: true,
      bonusPercentage: 100,
      icon: '🌟',
      features: ['50,000 Gold Coins', '25 Sweep Coins', '100% Bonus SC', 'New Customer Special'],
      color: 'from-green-500 to-emerald-600',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'bronze',
      name: 'Bronze Package',
      description: 'Great value for casual players',
      goldCoins: 100000,
      sweepCoins: 50,
      price: 19.99,
      originalPrice: 24.99,
      isPopular: false,
      isBestValue: false,
      isNewCustomer: false,
      bonusPercentage: 25,
      icon: '🥉',
      features: ['100,000 Gold Coins', '50 Sweep Coins', '25% Bonus SC', 'Daily Bonus Access'],
      color: 'from-amber-600 to-orange-600',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ]);

  const [analytics, setAnalytics] = useState<PackageAnalytics[]>([
    { packageId: 'starter', totalSales: 1250, revenue: 12497.50, conversionRate: 8.5, averageRating: 4.7, popularityRank: 1 },
    { packageId: 'bronze', totalSales: 890, revenue: 17792.10, conversionRate: 6.2, averageRating: 4.4, popularityRank: 2 }
  ]);

  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('packages');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'sales' | 'created'>('sortOrder');

  const [packageTemplates] = useState<PackageTemplate[]>([
    {
      id: 'holiday_special',
      name: 'Holiday Special Bundle',
      packages: [
        { name: 'Holiday Starter', bonusPercentage: 150, icon: '🎄' },
        { name: 'Holiday Deluxe', bonusPercentage: 200, icon: '🎁' }
      ]
    },
    {
      id: 'vip_tier',
      name: 'VIP Tier Packages',
      packages: [
        { name: 'VIP Bronze', goldCoins: 750000, sweepCoins: 500, price: 149.99 },
        { name: 'VIP Silver', goldCoins: 1500000, sweepCoins: 1000, price: 299.99 },
        { name: 'VIP Gold', goldCoins: 3000000, sweepCoins: 2500, price: 599.99 }
      ]
    }
  ]);

  const iconOptions = ['🌟', '🥉', '🥈', '🥇', '💎', '👑', '🎯', '🔥', '⚡', '💰', '🏆', '🎁', '🎪', '🎰', '💫'];
  const colorOptions = [
    { name: 'Green to Emerald', value: 'from-green-500 to-emerald-600' },
    { name: 'Blue to Cyan', value: 'from-blue-500 to-cyan-600' },
    { name: 'Purple to Pink', value: 'from-purple-500 to-pink-600' },
    { name: 'Yellow to Orange', value: 'from-yellow-500 to-orange-600' },
    { name: 'Red to Rose', value: 'from-red-500 to-rose-600' },
    { name: 'Gold to Yellow', value: 'from-yellow-500 to-gold-600' },
    { name: 'Silver to Gray', value: 'from-gray-500 to-slate-600' }
  ];

  const startEditing = (pkg: PackageData) => {
    setEditingPackage({ ...pkg });
    setIsEditing(true);
  };

  const startCreating = () => {
    setEditingPackage({
      id: '',
      name: '',
      description: '',
      goldCoins: 10000,
      sweepCoins: 10,
      price: 4.99,
      isPopular: false,
      isBestValue: false,
      isNewCustomer: false,
      bonusPercentage: 0,
      icon: '🌟',
      features: [],
      color: 'from-blue-500 to-cyan-600',
      isActive: true,
      sortOrder: packages.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  const savePackage = () => {
    if (!editingPackage) return;

    if (!editingPackage.name || !editingPackage.description || editingPackage.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isCreating) {
      const newPackage = {
        ...editingPackage,
        id: editingPackage.name.toLowerCase().replace(/\s+/g, '_'),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setPackages([...packages, newPackage]);
      
      // Add analytics entry
      setAnalytics([...analytics, {
        packageId: newPackage.id,
        totalSales: 0,
        revenue: 0,
        conversionRate: 0,
        averageRating: 0,
        popularityRank: packages.length + 1
      }]);
      
      toast({
        title: "Package Created",
        description: `${newPackage.name} has been created successfully`,
      });
    } else {
      setPackages(packages.map(pkg => 
        pkg.id === editingPackage.id 
          ? { ...editingPackage, updatedAt: new Date() }
          : pkg
      ));
      
      toast({
        title: "Package Updated",
        description: `${editingPackage.name} has been updated successfully`,
      });
    }

    setIsEditing(false);
    setIsCreating(false);
    setEditingPackage(null);
  };

  const deletePackage = (packageId: string) => {
    setPackages(packages.filter(pkg => pkg.id !== packageId));
    setAnalytics(analytics.filter(a => a.packageId !== packageId));
    
    toast({
      title: "Package Deleted",
      description: "Package has been removed from the store",
    });
  };

  const togglePackageStatus = (packageId: string) => {
    setPackages(packages.map(pkg => 
      pkg.id === packageId 
        ? { ...pkg, isActive: !pkg.isActive, updatedAt: new Date() }
        : pkg
    ));
  };

  const applyTemplate = (template: PackageTemplate) => {
    const newPackages = template.packages.map((pkg, index) => ({
      id: `${template.id}_${index}`,
      name: pkg.name || `Template Package ${index + 1}`,
      description: pkg.description || 'Template package',
      goldCoins: pkg.goldCoins || 100000,
      sweepCoins: pkg.sweepCoins || 50,
      price: pkg.price || 19.99,
      originalPrice: pkg.originalPrice,
      isPopular: pkg.isPopular || false,
      isBestValue: pkg.isBestValue || false,
      isNewCustomer: pkg.isNewCustomer || false,
      bonusPercentage: pkg.bonusPercentage || 0,
      icon: pkg.icon || '🎁',
      features: pkg.features || [],
      color: pkg.color || 'from-blue-500 to-cyan-600',
      isActive: true,
      sortOrder: packages.length + index + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    })) as PackageData[];

    setPackages([...packages, ...newPackages]);
    
    toast({
      title: "Template Applied",
      description: `${template.name} has been applied successfully`,
    });
  };

  const updateFeatures = (features: string) => {
    if (!editingPackage) return;
    const featureArray = features.split('\n').filter(f => f.trim());
    setEditingPackage({ ...editingPackage, features: featureArray });
  };

  const exportPackages = () => {
    const dataStr = JSON.stringify(packages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gold_coin_packages.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'price': return a.price - b.price;
      case 'sales': {
        const aAnalytics = analytics.find(an => an.packageId === a.id);
        const bAnalytics = analytics.find(an => an.packageId === b.id);
        return (bAnalytics?.totalSales || 0) - (aAnalytics?.totalSales || 0);
      }
      case 'created': return b.createdAt.getTime() - a.createdAt.getTime();
      default: return a.sortOrder - b.sortOrder;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Package Editor</h2>
          <p className="text-muted-foreground">Manage Gold Coin Store packages and pricing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportPackages}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={startCreating}>
            <Plus className="w-4 h-4 mr-2" />
            New Package
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search packages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sortOrder">Order</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Package List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPackages.map((pkg) => {
              const pkgAnalytics = analytics.find(a => a.packageId === pkg.id);
              return (
                <Card key={pkg.id} className={`relative ${!pkg.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{pkg.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {pkg.isPopular && <Badge className="bg-purple-500 text-xs">Popular</Badge>}
                        {pkg.isBestValue && <Badge className="bg-gold-500 text-black text-xs">Best Value</Badge>}
                        {pkg.isNewCustomer && <Badge className="bg-green-500 text-xs">New Customer</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <div className="font-semibold">${pkg.price}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gold Coins:</span>
                        <div className="font-semibold">{pkg.goldCoins.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sweep Coins:</span>
                        <div className="font-semibold">{pkg.sweepCoins}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sales:</span>
                        <div className="font-semibold">{pkgAnalytics?.totalSales || 0}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pkg.isActive}
                          onCheckedChange={() => togglePackageStatus(pkg.id)}
                        />
                        <span className="text-sm">{pkg.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(pkg)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePackage(pkg.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold">
                  ${analytics.reduce((sum, a) => sum + a.revenue, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Sales</span>
                </div>
                <div className="text-2xl font-bold">
                  {analytics.reduce((sum, a) => sum + a.totalSales, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Avg Conversion</span>
                </div>
                <div className="text-2xl font-bold">
                  {(analytics.reduce((sum, a) => sum + a.conversionRate, 0) / analytics.length).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-gold-500" />
                  <span className="text-sm font-medium">Avg Rating</span>
                </div>
                <div className="text-2xl font-bold">
                  {(analytics.reduce((sum, a) => sum + a.averageRating, 0) / analytics.length).toFixed(1)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Package Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((data) => {
                  const pkg = packages.find(p => p.id === data.packageId);
                  return (
                    <div key={data.packageId} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{pkg?.icon}</span>
                        <div>
                          <div className="font-medium">{pkg?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {data.totalSales} sales • ${data.revenue.toLocaleString()} revenue
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{data.conversionRate}%</div>
                        <div className="text-sm text-muted-foreground">Conversion</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Package Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quickly create packages using pre-configured templates
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packageTemplates.map((template) => (
                  <Card key={template.id} className="border-2 border-dashed">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.packages.length} packages included
                      </p>
                      <Button
                        onClick={() => applyTemplate(template)}
                        className="w-full"
                        variant="outline"
                      >
                        Apply Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Store settings allow you to configure global options for the Gold Coin Store, 
                  including payment processing, tax rates, and promotional features.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Tax Rate (%)</Label>
                  <Input type="number" defaultValue="0" min="0" max="25" step="0.1" />
                </div>
                <div>
                  <Label>Currency Symbol</Label>
                  <Input defaultValue="$" />
                </div>
                <div>
                  <Label>Minimum Purchase Amount</Label>
                  <Input type="number" defaultValue="4.99" min="0" step="0.01" />
                </div>
                <div>
                  <Label>Maximum Purchase Amount</Label>
                  <Input type="number" defaultValue="999.99" min="0" step="0.01" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Package Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New Package' : `Edit ${editingPackage?.name}`}
            </DialogTitle>
          </DialogHeader>

          {editingPackage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={editingPackage.name}
                    onChange={(e) => setEditingPackage({...editingPackage, name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingPackage.description}
                    onChange={(e) => setEditingPackage({...editingPackage, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingPackage.price}
                      onChange={(e) => setEditingPackage({...editingPackage, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price ($)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingPackage.originalPrice || ''}
                      onChange={(e) => setEditingPackage({...editingPackage, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goldCoins">Gold Coins</Label>
                    <Input
                      id="goldCoins"
                      type="number"
                      min="0"
                      value={editingPackage.goldCoins}
                      onChange={(e) => setEditingPackage({...editingPackage, goldCoins: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sweepCoins">Sweep Coins</Label>
                    <Input
                      id="sweepCoins"
                      type="number"
                      min="0"
                      value={editingPackage.sweepCoins}
                      onChange={(e) => setEditingPackage({...editingPackage, sweepCoins: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bonusPercentage">Bonus Percentage (%)</Label>
                  <Input
                    id="bonusPercentage"
                    type="number"
                    min="0"
                    max="500"
                    value={editingPackage.bonusPercentage || 0}
                    onChange={(e) => setEditingPackage({...editingPackage, bonusPercentage: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={editingPackage.icon} onValueChange={(value) => setEditingPackage({...editingPackage, icon: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{icon}</span>
                            <span>{icon}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Color Theme</Label>
                  <Select value={editingPackage.color} onValueChange={(value) => setEditingPackage({...editingPackage, color: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="features">Features (one per line)</Label>
                  <Textarea
                    id="features"
                    rows={6}
                    value={editingPackage.features.join('\n')}
                    onChange={(e) => updateFeatures(e.target.value)}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingPackage.isPopular}
                      onCheckedChange={(checked) => setEditingPackage({...editingPackage, isPopular: checked})}
                    />
                    <Label>Mark as Popular</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingPackage.isBestValue}
                      onCheckedChange={(checked) => setEditingPackage({...editingPackage, isBestValue: checked})}
                    />
                    <Label>Mark as Best Value</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingPackage.isNewCustomer}
                      onCheckedChange={(checked) => setEditingPackage({...editingPackage, isNewCustomer: checked})}
                    />
                    <Label>New Customer Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingPackage.isActive}
                      onCheckedChange={(checked) => setEditingPackage({...editingPackage, isActive: checked})}
                    />
                    <Label>Active in Store</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={savePackage}>
              <Save className="w-4 h-4 mr-2" />
              {isCreating ? 'Create Package' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
