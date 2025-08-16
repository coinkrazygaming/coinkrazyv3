import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Coins,
  Crown,
  Star,
  TrendingUp,
  Package,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Settings,
  Zap,
  Gift,
  DollarSign,
  Percent,
  Image,
  Tag,
  Calendar,
  Users,
  BarChart3,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Save,
  X,
} from "lucide-react";

// Types
interface GoldCoinPackage {
  id: string;
  packageName: string;
  description: string;
  goldCoins: number;
  bonusCoins: number;
  priceUsd: number;
  originalPriceUsd?: number;
  discountPercentage: number;
  packageImageUrl?: string;
  packageIcon: string;
  isFeatured: boolean;
  isPopular: boolean;
  isBestValue: boolean;
  isActive: boolean;
  displayOrder: number;
  maxPurchasesPerUser?: number;
  packageType: 'standard' | 'starter' | 'premium' | 'vip' | 'special';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

interface SweepsCoinPackage {
  id: string;
  packageName: string;
  description: string;
  sweepsCoins: number;
  goldCoinsIncluded: number;
  priceUsd: number;
  originalPriceUsd?: number;
  discountPercentage: number;
  packageImageUrl?: string;
  packageIcon: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  maxPurchasesPerUser?: number;
  packageType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface PackageBonus {
  id: string;
  packageId: string;
  packageType: 'gold' | 'sweeps';
  bonusType: 'percentage' | 'fixed_amount' | 'free_spins' | 'vip_access';
  bonusValue: number;
  bonusDescription: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

interface PackageStats {
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  topSellingPackages: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

// Form schemas
const goldPackageSchema = z.object({
  packageName: z.string().min(1, "Package name is required").max(100),
  description: z.string().max(500).optional(),
  goldCoins: z.number().min(1, "Must be at least 1 coin"),
  bonusCoins: z.number().min(0).default(0),
  priceUsd: z.number().min(0.01, "Price must be at least $0.01"),
  originalPriceUsd: z.number().optional(),
  discountPercentage: z.number().min(0).max(100).default(0),
  packageImageUrl: z.string().url().optional().or(z.literal("")),
  packageIcon: z.string().default("coins"),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isBestValue: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.number().min(0).default(0),
  maxPurchasesPerUser: z.number().min(1).optional(),
  packageType: z.enum(['standard', 'starter', 'premium', 'vip', 'special']).default('standard'),
  tags: z.array(z.string()).default([]),
});

type GoldPackageFormData = z.infer<typeof goldPackageSchema>;

const iconOptions = [
  { value: "coins", label: "Coins", icon: Coins },
  { value: "crown", label: "Crown", icon: Crown },
  { value: "star", label: "Star", icon: Star },
  { value: "gift", label: "Gift", icon: Gift },
  { value: "zap", label: "Zap", icon: Zap },
  { value: "sparkles", label: "Sparkles", icon: Sparkles },
  { value: "package", label: "Package", icon: Package },
  { value: "trending-up", label: "Trending Up", icon: TrendingUp },
];

const packageTypeOptions = [
  { value: "starter", label: "Starter", color: "bg-green-100 text-green-800" },
  { value: "standard", label: "Standard", color: "bg-blue-100 text-blue-800" },
  { value: "premium", label: "Premium", color: "bg-purple-100 text-purple-800" },
  { value: "vip", label: "VIP", color: "bg-yellow-100 text-yellow-800" },
  { value: "special", label: "Special", color: "bg-red-100 text-red-800" },
];

export default function PackageEditor() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("gold-packages");
  const [loading, setLoading] = useState(false);
  
  // State management
  const [goldPackages, setGoldPackages] = useState<GoldCoinPackage[]>([]);
  const [sweepsPackages, setSweepsPackages] = useState<SweepsCoinPackage[]>([]);
  const [packageBonuses, setPackageBonuses] = useState<PackageBonus[]>([]);
  const [packageStats, setPackageStats] = useState<PackageStats | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal states
  const [editPackageModal, setEditPackageModal] = useState<GoldCoinPackage | null>(null);
  const [createPackageModal, setCreatePackageModal] = useState(false);
  const [previewPackageModal, setPreviewPackageModal] = useState<GoldCoinPackage | null>(null);
  const [duplicatePackageModal, setDuplicatePackageModal] = useState<GoldCoinPackage | null>(null);
  
  // Form setup
  const form = useForm<GoldPackageFormData>({
    resolver: zodResolver(goldPackageSchema),
    defaultValues: {
      packageName: "",
      description: "",
      goldCoins: 1000,
      bonusCoins: 0,
      priceUsd: 9.99,
      discountPercentage: 0,
      packageIcon: "coins",
      isFeatured: false,
      isPopular: false,
      isBestValue: false,
      isActive: true,
      displayOrder: 0,
      packageType: "standard",
      tags: [],
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGoldPackages(),
        loadSweepsPackages(),
        loadPackageBonuses(),
        loadPackageStats(),
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load package data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGoldPackages = async () => {
    // Mock data - replace with actual API call
    const mockPackages: GoldCoinPackage[] = [
      {
        id: "1",
        packageName: "Starter Pack",
        description: "Perfect for new players to get started with CoinKrazy",
        goldCoins: 1000,
        bonusCoins: 100,
        priceUsd: 9.99,
        originalPriceUsd: 12.99,
        discountPercentage: 23,
        packageImageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400",
        packageIcon: "coins",
        isFeatured: true,
        isPopular: false,
        isBestValue: false,
        isActive: true,
        displayOrder: 1,
        maxPurchasesPerUser: 5,
        packageType: "starter",
        tags: ["beginner", "popular"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        packageName: "Value Pack",
        description: "Great value for regular players",
        goldCoins: 5000,
        bonusCoins: 750,
        priceUsd: 39.99,
        discountPercentage: 0,
        packageIcon: "star",
        isFeatured: false,
        isPopular: true,
        isBestValue: true,
        isActive: true,
        displayOrder: 2,
        packageType: "standard",
        tags: ["value", "popular"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        packageName: "Premium Pack",
        description: "Maximum coins with best bonus for serious players",
        goldCoins: 15000,
        bonusCoins: 3000,
        priceUsd: 99.99,
        packageIcon: "crown",
        isFeatured: true,
        isPopular: false,
        isBestValue: false,
        isActive: true,
        displayOrder: 3,
        packageType: "premium",
        tags: ["premium", "bonus"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setGoldPackages(mockPackages);
  };

  const loadSweepsPackages = async () => {
    // Mock data - replace with actual API call
    setSweepsPackages([]);
  };

  const loadPackageBonuses = async () => {
    // Mock data - replace with actual API call
    setPackageBonuses([]);
  };

  const loadPackageStats = async () => {
    // Mock data - replace with actual API call
    const mockStats: PackageStats = {
      totalSales: 1245,
      totalRevenue: 45692.34,
      conversionRate: 12.3,
      averageOrderValue: 36.72,
      topSellingPackages: [
        { id: "2", name: "Value Pack", sales: 456, revenue: 18234.44 },
        { id: "1", name: "Starter Pack", sales: 389, revenue: 3886.11 },
        { id: "3", name: "Premium Pack", sales: 234, revenue: 23397.66 },
      ],
    };
    setPackageStats(mockStats);
  };

  const handleCreatePackage = async (data: GoldPackageFormData) => {
    setLoading(true);
    try {
      // API call to create package
      const newPackage: GoldCoinPackage = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setGoldPackages(prev => [...prev, newPackage]);
      setCreatePackageModal(false);
      form.reset();
      
      toast({
        title: "Package Created",
        description: `${data.packageName} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePackage = async (id: string, data: Partial<GoldCoinPackage>) => {
    setLoading(true);
    try {
      // API call to update package
      setGoldPackages(prev =>
        prev.map(pkg => 
          pkg.id === id 
            ? { ...pkg, ...data, updatedAt: new Date().toISOString() }
            : pkg
        )
      );
      
      setEditPackageModal(null);
      
      toast({
        title: "Package Updated",
        description: "Package has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    setLoading(true);
    try {
      // API call to delete package
      setGoldPackages(prev => prev.filter(pkg => pkg.id !== id));
      
      toast({
        title: "Package Deleted",
        description: "Package has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicatePackage = async (packageToDuplicate: GoldCoinPackage) => {
    const duplicatedData: GoldPackageFormData = {
      packageName: `${packageToDuplicate.packageName} (Copy)`,
      description: packageToDuplicate.description || "",
      goldCoins: packageToDuplicate.goldCoins,
      bonusCoins: packageToDuplicate.bonusCoins,
      priceUsd: packageToDuplicate.priceUsd,
      originalPriceUsd: packageToDuplicate.originalPriceUsd,
      discountPercentage: packageToDuplicate.discountPercentage,
      packageImageUrl: packageToDuplicate.packageImageUrl || "",
      packageIcon: packageToDuplicate.packageIcon,
      isFeatured: false, // Reset featured status
      isPopular: false, // Reset popular status
      isBestValue: false, // Reset best value status
      isActive: false, // Start inactive
      displayOrder: goldPackages.length + 1,
      maxPurchasesPerUser: packageToDuplicate.maxPurchasesPerUser,
      packageType: packageToDuplicate.packageType,
      tags: [...packageToDuplicate.tags],
    };

    await handleCreatePackage(duplicatedData);
    setDuplicatePackageModal(null);
  };

  const handleReorderPackages = async (packages: GoldCoinPackage[]) => {
    setLoading(true);
    try {
      // Update display order for all packages
      const updatedPackages = packages.map((pkg, index) => ({
        ...pkg,
        displayOrder: index + 1,
        updatedAt: new Date().toISOString(),
      }));

      setGoldPackages(updatedPackages);
      
      // API call to update all package orders
      
      toast({
        title: "Order Updated",
        description: "Package order has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update package order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPackageTypeColor = (type: string) => {
    const option = packageTypeOptions.find(opt => opt.value === type);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const getIconComponent = (iconName: string) => {
    const option = iconOptions.find(opt => opt.value === iconName);
    return option?.icon || Coins;
  };

  const filteredGoldPackages = goldPackages.filter(pkg => {
    const matchesSearch = 
      pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "all" || pkg.packageType === typeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && pkg.isActive) ||
      (statusFilter === "inactive" && !pkg.isActive) ||
      (statusFilter === "featured" && pkg.isFeatured);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading && goldPackages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Package Editor</h1>
          <p className="text-muted-foreground">
            Create and manage coin packages for the Gold Coin Store
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadInitialData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreatePackageModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Package
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {packageStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{packageStats.totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all packages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${packageStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{packageStats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Store page to purchase
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${packageStats.averageOrderValue}</div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gold-packages">Gold Packages</TabsTrigger>
          <TabsTrigger value="sweeps-packages">Sweeps Packages</TabsTrigger>
          <TabsTrigger value="bonuses">Package Bonuses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Gold Packages Tab */}
        <TabsContent value="gold-packages" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <Label htmlFor="search">Search Packages</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, description, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="type-filter">Package Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {packageTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoldPackages.map((pkg) => {
              const IconComponent = getIconComponent(pkg.packageIcon);
              
              return (
                <Card key={pkg.id} className={`relative ${!pkg.isActive ? 'opacity-60' : ''}`}>
                  {/* Package Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    {pkg.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {pkg.isPopular && (
                      <Badge className="bg-green-100 text-green-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {pkg.isBestValue && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Zap className="w-3 h-3 mr-1" />
                        Best Value
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pkg.packageName}</CardTitle>
                        <Badge className={getPackageTypeColor(pkg.packageType)}>
                          {pkg.packageType}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Package Image */}
                    {pkg.packageImageUrl && (
                      <div className="w-full h-32 rounded-lg overflow-hidden">
                        <img
                          src={pkg.packageImageUrl}
                          alt={pkg.packageName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Description */}
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                    )}

                    {/* Coin Details */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Gold Coins</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {pkg.goldCoins.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Bonus</p>
                        <p className="text-lg font-bold text-green-600">
                          +{pkg.bonusCoins.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold">${pkg.priceUsd}</span>
                        {pkg.originalPriceUsd && pkg.originalPriceUsd > pkg.priceUsd && (
                          <>
                            <span className="text-lg text-muted-foreground line-through">
                              ${pkg.originalPriceUsd}
                            </span>
                            <Badge className="bg-red-100 text-red-800">
                              {pkg.discountPercentage}% OFF
                            </Badge>
                          </>
                        )}
                      </div>
                      {pkg.maxPurchasesPerUser && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Limit: {pkg.maxPurchasesPerUser} per user
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    {pkg.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pkg.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewPackageModal(pkg)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          form.reset(pkg);
                          setEditPackageModal(pkg);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDuplicatePackageModal(pkg)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Package</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{pkg.packageName}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-medium">Active</span>
                      <Switch
                        checked={pkg.isActive}
                        onCheckedChange={(checked) =>
                          handleUpdatePackage(pkg.id, { isActive: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredGoldPackages.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No packages found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters to see more packages."
                    : "Get started by creating your first package."}
                </p>
                <Button onClick={() => setCreatePackageModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Package
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Other tabs would go here */}
        <TabsContent value="sweeps-packages">
          <Card>
            <CardContent className="text-center py-12">
              <Crown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sweeps Coin Packages</h3>
              <p className="text-muted-foreground">
                Sweeps coin package management coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bonuses">
          <Card>
            <CardContent className="text-center py-12">
              <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Package Bonuses</h3>
              <p className="text-muted-foreground">
                Package bonus management coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Package Analytics</h3>
              <p className="text-muted-foreground">
                Detailed analytics and reporting coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Package Modal */}
      <Dialog open={createPackageModal || !!editPackageModal} onOpenChange={(open) => {
        if (!open) {
          setCreatePackageModal(false);
          setEditPackageModal(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editPackageModal ? "Edit Package" : "Create New Package"}
            </DialogTitle>
            <DialogDescription>
              {editPackageModal 
                ? "Update the package details below"
                : "Fill in the details to create a new gold coin package"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(editPackageModal ? 
              (data) => handleUpdatePackage(editPackageModal.id, data) :
              handleCreatePackage
            )} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="packageName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter package name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter package description"
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select package type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {packageTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packageIcon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Icon</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an icon" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {iconOptions.map(option => {
                              const IconComponent = option.icon;
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Coins & Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Coins & Pricing</h3>
                  
                  <FormField
                    control={form.control}
                    name="goldCoins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gold Coins</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="1000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bonusCoins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bonus Coins</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Extra coins given as a bonus
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceUsd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="0.01"
                            placeholder="9.99"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPriceUsd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="0.01"
                            placeholder="12.99"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Show strikethrough pricing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount %</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            max="100"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="packageImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          URL to the package image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxPurchasesPerUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Purchases per User</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="Leave empty for unlimited"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Lower numbers appear first
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Package Flags */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Featured</FormLabel>
                          <FormDescription className="text-xs">
                            Show in featured section
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPopular"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Popular</FormLabel>
                          <FormDescription className="text-xs">
                            Show popular badge
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isBestValue"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Best Value</FormLabel>
                          <FormDescription className="text-xs">
                            Show best value badge
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription className="text-xs">
                            Available for purchase
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreatePackageModal(false);
                    setEditPackageModal(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editPackageModal ? "Update Package" : "Create Package"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Package Preview Modal */}
      {previewPackageModal && (
        <Dialog open={!!previewPackageModal} onOpenChange={() => setPreviewPackageModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Package Preview</DialogTitle>
              <DialogDescription>
                How this package will appear in the store
              </DialogDescription>
            </DialogHeader>
            
            {/* Store-style package preview */}
            <div className="relative border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50">
              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {previewPackageModal.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    ⭐ Featured
                  </Badge>
                )}
                {previewPackageModal.isPopular && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    🔥 Popular
                  </Badge>
                )}
                {previewPackageModal.isBestValue && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    ⚡ Best Value
                  </Badge>
                )}
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  {React.createElement(getIconComponent(previewPackageModal.packageIcon), {
                    className: "w-8 h-8 text-white"
                  })}
                </div>
              </div>

              {/* Package Name */}
              <h3 className="text-xl font-bold text-center mb-2">
                {previewPackageModal.packageName}
              </h3>

              {/* Type Badge */}
              <div className="flex justify-center mb-4">
                <Badge className={getPackageTypeColor(previewPackageModal.packageType)}>
                  {previewPackageModal.packageType}
                </Badge>
              </div>

              {/* Description */}
              {previewPackageModal.description && (
                <p className="text-sm text-center text-muted-foreground mb-4">
                  {previewPackageModal.description}
                </p>
              )}

              {/* Coins */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {previewPackageModal.goldCoins.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Gold Coins</p>
                  {previewPackageModal.bonusCoins > 0 && (
                    <p className="text-lg font-semibold text-green-600">
                      +{previewPackageModal.bonusCoins.toLocaleString()} Bonus
                    </p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold">${previewPackageModal.priceUsd}</span>
                  {previewPackageModal.originalPriceUsd && previewPackageModal.originalPriceUsd > previewPackageModal.priceUsd && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        ${previewPackageModal.originalPriceUsd}
                      </span>
                      <Badge className="bg-red-100 text-red-800">
                        {previewPackageModal.discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Purchase Button */}
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Coins className="w-4 h-4 mr-2" />
                Purchase Now
              </Button>

              {/* Purchase Limit */}
              {previewPackageModal.maxPurchasesPerUser && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Limit: {previewPackageModal.maxPurchasesPerUser} per user
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Duplicate Package Dialog */}
      {duplicatePackageModal && (
        <AlertDialog open={!!duplicatePackageModal} onOpenChange={() => setDuplicatePackageModal(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Duplicate Package</AlertDialogTitle>
              <AlertDialogDescription>
                This will create a copy of "{duplicatePackageModal.packageName}" with "(Copy)" added to the name.
                The duplicate will be created as inactive so you can review it before making it available.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDuplicatePackage(duplicatePackageModal)}>
                Duplicate Package
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
