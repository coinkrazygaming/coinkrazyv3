import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "@/hooks/use-toast";
import {
  Store,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  MoreHorizontal,
  Palette,
  Coins,
  Crown,
  Star,
  Gift,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  BarChart3,
  Settings,
  Sparkles,
  Target,
  RefreshCw,
  Save,
  Download,
  Upload,
  Search,
  Filter,
  SortAsc,
  Calendar,
  Clock,
  CreditCard,
  ShoppingCart,
  Package,
  Percent,
  Heart,
  Diamond,
  Award,
  Flame,
  Lightning,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Smartphone,
  Monitor,
  Tablet,
  Loader2,
} from "lucide-react";
import {
  goldStoreService,
  GoldPackage,
  PurchaseHistory,
  StoreAnalytics,
  StoreSettings,
} from "@/services/goldStoreService";

interface PackageFormData {
  name: string;
  description: string;
  goldCoins: number;
  sweepsCoins: number;
  price: number;
  originalPrice?: number;
  currency: "USD" | "EUR" | "GBP" | "CAD";
  popular: boolean;
  featured: boolean;
  bestValue: boolean;
  limitedTime: boolean;
  category: "starter" | "standard" | "premium" | "elite" | "mega" | "ultimate";
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  bonus: {
    enabled: boolean;
    type: "percentage" | "fixed" | "free_spins" | "multiplier";
    value: number;
    description: string;
  };
  design: {
    backgroundColor: string;
    backgroundGradient: {
      from: string;
      to: string;
      direction:
        | "to-r"
        | "to-br"
        | "to-b"
        | "to-bl"
        | "to-l"
        | "to-tl"
        | "to-t"
        | "to-tr";
    };
    textColor: string;
    accentColor: string;
    borderColor: string;
    shadowColor: string;
    icon: string;
    pattern?: string;
    animation?: "pulse" | "bounce" | "glow" | "shake" | "none";
  };
  availability: {
    enabled: boolean;
    startDate?: Date;
    endDate?: Date;
    maxPurchases?: number;
  };
  targeting: {
    userTiers: string[];
    countries: string[];
    minAge?: number;
    maxAge?: number;
    newUsersOnly: boolean;
    vipOnly: boolean;
  };
  isActive: boolean;
}

const iconOptions = [
  { value: "🌟", label: "Star" },
  { value: "💎", label: "Diamond" },
  { value: "👑", label: "Crown" },
  { value: "⚡", label: "Lightning" },
  { value: "🔥", label: "Fire" },
  { value: "🎯", label: "Target" },
  { value: "🚀", label: "Rocket" },
  { value: "✨", label: "Sparkles" },
  { value: "🎊", label: "Confetti" },
  { value: "🏆", label: "Trophy" },
];

const gradientDirections = [
  { value: "to-r", label: "Left to Right" },
  { value: "to-br", label: "Top-Left to Bottom-Right" },
  { value: "to-b", label: "Top to Bottom" },
  { value: "to-bl", label: "Top-Right to Bottom-Left" },
  { value: "to-l", label: "Right to Left" },
  { value: "to-tl", label: "Bottom-Right to Top-Left" },
  { value: "to-t", label: "Bottom to Top" },
  { value: "to-tr", label: "Bottom-Left to Top-Right" },
];

export default function GoldStoreManager() {
  // State management
  const [activeTab, setActiveTab] = useState("packages");
  const [packages, setPackages] = useState<GoldPackage[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<GoldPackage | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Form state
  const [packageForm, setPackageForm] = useState<PackageFormData>({
    name: "",
    description: "",
    goldCoins: 0,
    sweepsCoins: 0,
    price: 0,
    currency: "USD",
    popular: false,
    featured: false,
    bestValue: false,
    limitedTime: false,
    category: "starter",
    tier: 1,
    bonus: {
      enabled: false,
      type: "percentage",
      value: 0,
      description: "",
    },
    design: {
      backgroundColor: "#3B82F6",
      backgroundGradient: {
        from: "#3B82F6",
        to: "#1D4ED8",
        direction: "to-br",
      },
      textColor: "#FFFFFF",
      accentColor: "#FCD34D",
      borderColor: "#1D4ED8",
      shadowColor: "#3B82F6",
      icon: "����",
      animation: "none",
    },
    availability: {
      enabled: true,
    },
    targeting: {
      userTiers: ["new", "bronze"],
      countries: ["US"],
      newUsersOnly: false,
      vipOnly: false,
    },
    isActive: true,
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("tier");

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [packagesData, historyData, analyticsData, settingsData] =
        await Promise.all([
          goldStoreService.getAllPackages(),
          goldStoreService.getPurchaseHistory(),
          goldStoreService.getStoreAnalytics(),
          goldStoreService.getStoreSettings(),
        ]);

      setPackages(packagesData);
      setPurchaseHistory(historyData);
      setAnalytics(analyticsData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Error loading store data:", error);
      toast({
        title: "Error",
        description: "Failed to load store data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Package management functions
  const handleCreatePackage = async () => {
    try {
      const newPackage = await goldStoreService.createPackage(packageForm);
      setPackages((prev) => [newPackage, ...prev]);
      setPackageDialogOpen(false);
      resetPackageForm();

      toast({
        title: "Success",
        description: "Package created successfully.",
      });
    } catch (error) {
      console.error("Error creating package:", error);
      toast({
        title: "Error",
        description: "Failed to create package. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePackage = async (id: string, updates: Partial<GoldPackage>) => {
    try {
      const updatedPackage = await goldStoreService.updatePackage(id, updates);
      setPackages((prev) =>
        prev.map((p) => (p.id === id ? updatedPackage : p)),
      );

      toast({
        title: "Success",
        description: "Package updated successfully.",
      });
    } catch (error) {
      console.error("Error updating package:", error);
      toast({
        title: "Error",
        description: "Failed to update package. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePackage = async (id: string) => {
    try {
      await goldStoreService.deletePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));

      toast({
        title: "Success",
        description: "Package deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({
        title: "Error",
        description: "Failed to delete package. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicatePackage = async (id: string) => {
    try {
      const duplicatedPackage = await goldStoreService.duplicatePackage(id);
      setPackages((prev) => [duplicatedPackage, ...prev]);

      toast({
        title: "Success",
        description: "Package duplicated successfully.",
      });
    } catch (error) {
      console.error("Error duplicating package:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate package. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetPackageForm = () => {
    setPackageForm({
      name: "",
      description: "",
      goldCoins: 0,
      sweepsCoins: 0,
      price: 0,
      currency: "USD",
      popular: false,
      featured: false,
      bestValue: false,
      limitedTime: false,
      category: "starter",
      tier: 1,
      bonus: {
        enabled: false,
        type: "percentage",
        value: 0,
        description: "",
      },
      design: {
        backgroundColor: "#3B82F6",
        backgroundGradient: {
          from: "#3B82F6",
          to: "#1D4ED8",
          direction: "to-br",
        },
        textColor: "#FFFFFF",
        accentColor: "#FCD34D",
        borderColor: "#1D4ED8",
        shadowColor: "#3B82F6",
        icon: "🌟",
        animation: "none",
      },
      availability: {
        enabled: true,
      },
      targeting: {
        userTiers: ["new", "bronze"],
        countries: ["US"],
        newUsersOnly: false,
        vipOnly: false,
      },
      isActive: true,
    });
    setSelectedPackage(null);
  };

  const openEditPackage = (pkg: GoldPackage) => {
    setSelectedPackage(pkg);
    setPackageForm({
      name: pkg.name,
      description: pkg.description,
      goldCoins: pkg.goldCoins,
      sweepsCoins: pkg.sweepsCoins,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      currency: pkg.currency,
      popular: pkg.popular,
      featured: pkg.featured,
      bestValue: pkg.bestValue,
      limitedTime: pkg.limitedTime,
      category: pkg.category,
      tier: pkg.tier,
      bonus: pkg.bonus,
      design: pkg.design,
      availability: pkg.availability,
      targeting: pkg.targeting,
      isActive: pkg.isActive,
    });
    setPackageDialogOpen(true);
  };

  // Filter and sort packages
  const filteredPackages = packages
    .filter((pkg) => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || pkg.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "tier":
          return a.tier - b.tier;
        case "price":
          return a.price - b.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "purchases":
          return b.analytics.purchases - a.analytics.purchases;
        default:
          return 0;
      }
    });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      starter: "bg-blue-500",
      standard: "bg-green-500",
      premium: "bg-purple-500",
      elite: "bg-orange-500",
      mega: "bg-red-500",
      ultimate: "bg-gray-900",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500";
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case "mobile":
        return "w-80";
      case "tablet":
        return "w-96";
      default:
        return "w-full";
    }
  };

  const renderPackagePreview = () => {
    const style = {
      background: `linear-gradient(${packageForm.design.backgroundGradient.direction}, ${packageForm.design.backgroundGradient.from}, ${packageForm.design.backgroundGradient.to})`,
      color: packageForm.design.textColor,
      borderColor: packageForm.design.borderColor,
      boxShadow: `0 8px 25px ${packageForm.design.shadowColor}33`,
    };

    return (
      <div className={`${getPreviewWidth()} mx-auto`}>
        <Card
          className={`relative overflow-hidden transition-all duration-300 ${
            packageForm.design.animation === "pulse"
              ? "animate-pulse"
              : packageForm.design.animation === "bounce"
                ? "animate-bounce"
                : packageForm.design.animation === "glow"
                  ? "hover:shadow-2xl"
                  : packageForm.design.animation === "shake"
                    ? "hover:animate-bounce"
                    : ""
          }`}
          style={{
            ...style,
            border: `2px solid ${packageForm.design.borderColor}`,
          }}
        >
          <CardContent className="p-6">
            {/* Badges */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-wrap gap-2">
                {packageForm.popular && (
                  <Badge variant="default" className="bg-yellow-500">
                    ⭐ Popular
                  </Badge>
                )}
                {packageForm.featured && (
                  <Badge variant="default" className="bg-purple-500">
                    🔥 Featured
                  </Badge>
                )}
                {packageForm.bestValue && (
                  <Badge variant="default" className="bg-green-500">
                    💎 Best Value
                  </Badge>
                )}
                {packageForm.limitedTime && (
                  <Badge variant="destructive">⏰ Limited Time</Badge>
                )}
              </div>
              <div className="text-3xl">{packageForm.design.icon}</div>
            </div>

            {/* Title and Description */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">
                {packageForm.name || "Package Name"}
              </h3>
              <p className="opacity-90">
                {packageForm.description || "Package description"}
              </p>
            </div>

            {/* Coins */}
            <div className="flex justify-around mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Coins
                    className="w-5 h-5"
                    style={{ color: packageForm.design.accentColor }}
                  />
                  <span className="font-bold text-lg">
                    {packageForm.goldCoins.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm opacity-75">Gold Coins</div>
              </div>
              {packageForm.sweepsCoins > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Crown
                      className="w-5 h-5"
                      style={{ color: packageForm.design.accentColor }}
                    />
                    <span className="font-bold text-lg">
                      {packageForm.sweepsCoins}
                    </span>
                  </div>
                  <div className="text-sm opacity-75">Sweeps Coins</div>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-center mb-4">
              {packageForm.originalPrice &&
                packageForm.originalPrice > packageForm.price && (
                  <div className="line-through text-sm opacity-60">
                    ${packageForm.originalPrice.toFixed(2)}
                  </div>
                )}
              <div
                className="text-3xl font-bold"
                style={{ color: packageForm.design.accentColor }}
              >
                ${packageForm.price.toFixed(2)}
              </div>
            </div>

            {/* Bonus */}
            {packageForm.bonus.enabled && (
              <div className="text-center mb-4">
                <Badge
                  variant="outline"
                  className="border-current text-current"
                  style={{
                    borderColor: packageForm.design.accentColor,
                    color: packageForm.design.accentColor,
                  }}
                >
                  <Gift className="w-4 h-4 mr-1" />
                  {packageForm.bonus.description}
                </Badge>
              </div>
            )}

            {/* Purchase Button */}
            <Button
              className="w-full font-bold text-lg py-3"
              style={{
                backgroundColor: packageForm.design.accentColor,
                color: "#000000",
                border: "none",
              }}
            >
              Purchase Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Loading store data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6" />
            Gold Store Management
          </h2>
          <p className="text-muted-foreground">
            Manage packages, settings, and analytics for the gold coin store
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Purchases
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Store Preview
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                  <SelectItem value="mega">Mega</SelectItem>
                  <SelectItem value="ultimate">Ultimate</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier">Tier</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="purchases">Purchases</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog
              open={packageDialogOpen}
              onOpenChange={setPackageDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={resetPackageForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedPackage ? "Edit Package" : "Create New Package"}
                  </DialogTitle>
                  <DialogDescription>
                    Design and configure your gold coin package with the visual
                    builder
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Section */}
                  <div className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="design">Design</TabsTrigger>
                        <TabsTrigger value="bonus">Bonus</TabsTrigger>
                        <TabsTrigger value="targeting">Targeting</TabsTrigger>
                      </TabsList>

                      {/* Basic Info Tab */}
                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="package-name">Package Name</Label>
                            <Input
                              id="package-name"
                              value={packageForm.name}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              placeholder="Premium Pack"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="package-category">Category</Label>
                            <Select
                              value={packageForm.category}
                              onValueChange={(value) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  category: value as any,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="starter">Starter</SelectItem>
                                <SelectItem value="standard">
                                  Standard
                                </SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="elite">Elite</SelectItem>
                                <SelectItem value="mega">Mega</SelectItem>
                                <SelectItem value="ultimate">
                                  Ultimate
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="package-description">
                            Description
                          </Label>
                          <Textarea
                            id="package-description"
                            value={packageForm.description}
                            onChange={(e) =>
                              setPackageForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Great value pack with bonus coins"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="gold-coins">Gold Coins</Label>
                            <Input
                              id="gold-coins"
                              type="number"
                              value={packageForm.goldCoins}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  goldCoins: parseInt(e.target.value) || 0,
                                }))
                              }
                              placeholder="25000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sweeps-coins">Sweeps Coins</Label>
                            <Input
                              id="sweeps-coins"
                              type="number"
                              value={packageForm.sweepsCoins}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  sweepsCoins: parseInt(e.target.value) || 0,
                                }))
                              }
                              placeholder="5"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tier">Tier</Label>
                            <Select
                              value={packageForm.tier.toString()}
                              onValueChange={(value) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  tier: parseInt(value) as any,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select tier" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Tier 1</SelectItem>
                                <SelectItem value="2">Tier 2</SelectItem>
                                <SelectItem value="3">Tier 3</SelectItem>
                                <SelectItem value="4">Tier 4</SelectItem>
                                <SelectItem value="5">Tier 5</SelectItem>
                                <SelectItem value="6">Tier 6</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={packageForm.price}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  price: parseFloat(e.target.value) || 0,
                                }))
                              }
                              placeholder="9.99"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="original-price">
                              Original Price
                            </Label>
                            <Input
                              id="original-price"
                              type="number"
                              step="0.01"
                              value={packageForm.originalPrice || ""}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  originalPrice:
                                    parseFloat(e.target.value) || undefined,
                                }))
                              }
                              placeholder="12.99"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                              value={packageForm.currency}
                              onValueChange={(value) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  currency: value as any,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="CAD">CAD (C$)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="popular">Popular</Label>
                            <Switch
                              id="popular"
                              checked={packageForm.popular}
                              onCheckedChange={(checked) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  popular: checked,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="featured">Featured</Label>
                            <Switch
                              id="featured"
                              checked={packageForm.featured}
                              onCheckedChange={(checked) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  featured: checked,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="best-value">Best Value</Label>
                            <Switch
                              id="best-value"
                              checked={packageForm.bestValue}
                              onCheckedChange={(checked) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  bestValue: checked,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="limited-time">Limited Time</Label>
                            <Switch
                              id="limited-time"
                              checked={packageForm.limitedTime}
                              onCheckedChange={(checked) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  limitedTime: checked,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </TabsContent>

                      {/* Design Tab */}
                      <TabsContent value="design" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="icon">Icon</Label>
                          <Select
                            value={packageForm.design.icon}
                            onValueChange={(value) =>
                              setPackageForm((prev) => ({
                                ...prev,
                                design: { ...prev.design, icon: value },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                            <SelectContent>
                              {iconOptions.map((icon) => (
                                <SelectItem key={icon.value} value={icon.value}>
                                  {icon.value} {icon.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bg-from">Background From</Label>
                            <Input
                              id="bg-from"
                              type="color"
                              value={packageForm.design.backgroundGradient.from}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  design: {
                                    ...prev.design,
                                    backgroundGradient: {
                                      ...prev.design.backgroundGradient,
                                      from: e.target.value,
                                    },
                                  },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bg-to">Background To</Label>
                            <Input
                              id="bg-to"
                              type="color"
                              value={packageForm.design.backgroundGradient.to}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  design: {
                                    ...prev.design,
                                    backgroundGradient: {
                                      ...prev.design.backgroundGradient,
                                      to: e.target.value,
                                    },
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gradient-direction">
                            Gradient Direction
                          </Label>
                          <Select
                            value={
                              packageForm.design.backgroundGradient.direction
                            }
                            onValueChange={(value) =>
                              setPackageForm((prev) => ({
                                ...prev,
                                design: {
                                  ...prev.design,
                                  backgroundGradient: {
                                    ...prev.design.backgroundGradient,
                                    direction: value as any,
                                  },
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select direction" />
                            </SelectTrigger>
                            <SelectContent>
                              {gradientDirections.map((dir) => (
                                <SelectItem key={dir.value} value={dir.value}>
                                  {dir.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="text-color">Text Color</Label>
                            <Input
                              id="text-color"
                              type="color"
                              value={packageForm.design.textColor}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  design: {
                                    ...prev.design,
                                    textColor: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accent-color">Accent Color</Label>
                            <Input
                              id="accent-color"
                              type="color"
                              value={packageForm.design.accentColor}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  design: {
                                    ...prev.design,
                                    accentColor: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="border-color">Border Color</Label>
                            <Input
                              id="border-color"
                              type="color"
                              value={packageForm.design.borderColor}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  design: {
                                    ...prev.design,
                                    borderColor: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="shadow-color">Shadow Color</Label>
                            <Input
                              id="shadow-color"
                              type="color"
                              value={packageForm.design.shadowColor}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  design: {
                                    ...prev.design,
                                    shadowColor: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="animation">Animation</Label>
                          <Select
                            value={packageForm.design.animation || "none"}
                            onValueChange={(value) =>
                              setPackageForm((prev) => ({
                                ...prev,
                                design: {
                                  ...prev.design,
                                  animation: value as any,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select animation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="pulse">Pulse</SelectItem>
                              <SelectItem value="bounce">Bounce</SelectItem>
                              <SelectItem value="glow">Glow</SelectItem>
                              <SelectItem value="shake">Shake</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TabsContent>

                      {/* Bonus Tab */}
                      <TabsContent value="bonus" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="bonus-enabled">Enable Bonus</Label>
                          <Switch
                            id="bonus-enabled"
                            checked={packageForm.bonus.enabled}
                            onCheckedChange={(checked) =>
                              setPackageForm((prev) => ({
                                ...prev,
                                bonus: { ...prev.bonus, enabled: checked },
                              }))
                            }
                          />
                        </div>

                        {packageForm.bonus.enabled && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="bonus-type">Bonus Type</Label>
                                <Select
                                  value={packageForm.bonus.type}
                                  onValueChange={(value) =>
                                    setPackageForm((prev) => ({
                                      ...prev,
                                      bonus: {
                                        ...prev.bonus,
                                        type: value as any,
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="percentage">
                                      Percentage
                                    </SelectItem>
                                    <SelectItem value="fixed">
                                      Fixed Amount
                                    </SelectItem>
                                    <SelectItem value="free_spins">
                                      Free Spins
                                    </SelectItem>
                                    <SelectItem value="multiplier">
                                      Multiplier
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bonus-value">Bonus Value</Label>
                                <Input
                                  id="bonus-value"
                                  type="number"
                                  value={packageForm.bonus.value}
                                  onChange={(e) =>
                                    setPackageForm((prev) => ({
                                      ...prev,
                                      bonus: {
                                        ...prev.bonus,
                                        value: parseFloat(e.target.value) || 0,
                                      },
                                    }))
                                  }
                                  placeholder="10"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="bonus-description">
                                Bonus Description
                              </Label>
                              <Input
                                id="bonus-description"
                                value={packageForm.bonus.description}
                                onChange={(e) =>
                                  setPackageForm((prev) => ({
                                    ...prev,
                                    bonus: {
                                      ...prev.bonus,
                                      description: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="10% Bonus Gold Coins"
                              />
                            </div>
                          </>
                        )}
                      </TabsContent>

                      {/* Targeting Tab */}
                      <TabsContent value="targeting" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="user-tiers">
                            User Tiers (comma-separated)
                          </Label>
                          <Input
                            id="user-tiers"
                            value={packageForm.targeting.userTiers.join(", ")}
                            onChange={(e) =>
                              setPackageForm((prev) => ({
                                ...prev,
                                targeting: {
                                  ...prev.targeting,
                                  userTiers: e.target.value
                                    .split(",")
                                    .map((t) => t.trim())
                                    .filter((t) => t),
                                },
                              }))
                            }
                            placeholder="new, bronze, silver"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="countries">
                            Countries (comma-separated)
                          </Label>
                          <Input
                            id="countries"
                            value={packageForm.targeting.countries.join(", ")}
                            onChange={(e) =>
                              setPackageForm((prev) => ({
                                ...prev,
                                targeting: {
                                  ...prev.targeting,
                                  countries: e.target.value
                                    .split(",")
                                    .map((c) => c.trim())
                                    .filter((c) => c),
                                },
                              }))
                            }
                            placeholder="US, CA, UK"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="min-age">Minimum Age</Label>
                            <Input
                              id="min-age"
                              type="number"
                              value={packageForm.targeting.minAge || ""}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  targeting: {
                                    ...prev.targeting,
                                    minAge:
                                      parseInt(e.target.value) || undefined,
                                  },
                                }))
                              }
                              placeholder="18"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="max-age">Maximum Age</Label>
                            <Input
                              id="max-age"
                              type="number"
                              value={packageForm.targeting.maxAge || ""}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  targeting: {
                                    ...prev.targeting,
                                    maxAge:
                                      parseInt(e.target.value) || undefined,
                                  },
                                }))
                              }
                              placeholder="65"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-users-only">
                              New Users Only
                            </Label>
                            <Switch
                              id="new-users-only"
                              checked={packageForm.targeting.newUsersOnly}
                              onCheckedChange={(checked) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  targeting: {
                                    ...prev.targeting,
                                    newUsersOnly: checked,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="vip-only">VIP Only</Label>
                            <Switch
                              id="vip-only"
                              checked={packageForm.targeting.vipOnly}
                              onCheckedChange={(checked) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  targeting: {
                                    ...prev.targeting,
                                    vipOnly: checked,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="is-active">Package Active</Label>
                          <Switch
                            id="is-active"
                            checked={packageForm.isActive}
                            onCheckedChange={(checked) =>
                              setPackageForm((prev) => ({
                                ...prev,
                                isActive: checked,
                              }))
                            }
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Preview Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Live Preview</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={
                            previewMode === "desktop" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPreviewMode("desktop")}
                        >
                          <Monitor className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={
                            previewMode === "tablet" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPreviewMode("tablet")}
                        >
                          <Tablet className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={
                            previewMode === "mobile" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPreviewMode("mobile")}
                        >
                          <Smartphone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-muted/20">
                      {renderPackagePreview()}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPackageDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={
                      selectedPackage
                        ? () => {
                            handleUpdatePackage(selectedPackage.id, packageForm);
                            setPackageDialogOpen(false);
                          }
                        : handleCreatePackage
                    }
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {selectedPackage ? "Update Package" : "Create Package"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(pkg.category)}`} />
                        {pkg.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getStatusColor(pkg.isActive)}>
                          {pkg.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {pkg.popular && (
                          <Badge variant="outline" className="text-yellow-600">
                            Popular
                          </Badge>
                        )}
                        {pkg.featured && (
                          <Badge variant="outline" className="text-purple-600">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditPackage(pkg)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePackage(pkg.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Package</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{pkg.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pkg.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gold-400">
                          {pkg.goldCoins.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">GC</div>
                      </div>
                      {pkg.sweepsCoins > 0 && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-casino-blue">
                            {pkg.sweepsCoins}
                          </div>
                          <div className="text-xs text-muted-foreground">SC</div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {pkg.currency === "USD" ? "$" : pkg.currency === "EUR" ? "€" : pkg.currency === "GBP" ? "£" : "C$"}
                          {pkg.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Price</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-sm font-medium">
                          {pkg.analytics.views}
                        </div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {pkg.analytics.purchases}
                        </div>
                        <div className="text-xs text-muted-foreground">Sales</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {pkg.analytics.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">CVR</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPackages.length === 0 && (
            <Card className="text-center p-8">
              <CardContent>
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No packages found</h3>
                <p className="text-muted-foreground mb-4">
                  No packages match your current search and filter criteria.
                </p>
                <Button onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">
                          ${analytics.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p className="text-2xl font-bold">
                          {analytics.totalSales.toLocaleString()}
                        </p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">
                          {analytics.conversionRate.toFixed(1)}%
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Order Value</p>
                        <p className="text-2xl font-bold">
                          ${analytics.averageOrderValue.toFixed(2)}
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Packages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topPackages.map((pkg, index) => (
                        <div key={pkg.packageId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{pkg.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {pkg.sales} sales
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${pkg.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.paymentMethodStats.map((method) => (
                        <div key={method.method} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="capitalize">{method.method.replace('_', ' ')}</span>
                            <span className="font-medium">{method.percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={method.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
              <p className="text-muted-foreground">Analytics data will appear here once available.</p>
            </div>
          )}
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Customer</th>
                        <th className="text-left p-2">Package</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Payment</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseHistory.slice(0, 10).map((purchase) => (
                        <tr key={purchase.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{purchase.userId}</div>
                            </div>
                          </td>
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{purchase.packageName}</div>
                              <div className="text-sm text-muted-foreground">
                                {purchase.goldCoins.toLocaleString()} GC + {purchase.sweepsCoins} SC
                              </div>
                            </div>
                          </td>
                          <td className="p-2 font-mono">
                            ${purchase.price.toFixed(2)} {purchase.currency}
                          </td>
                          <td className="p-2 capitalize">
                            {purchase.paymentMethod.replace('_', ' ')}
                          </td>
                          <td className="p-2">
                            <Badge 
                              variant={
                                purchase.paymentStatus === "completed" ? "default" :
                                purchase.paymentStatus === "pending" ? "secondary" : "destructive"
                              }
                            >
                              {purchase.paymentStatus}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm">
                            {new Date(purchase.purchaseDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Purchases Yet</h3>
                  <p className="text-muted-foreground">Purchase history will appear here once customers start buying packages.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {settings && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input
                      id="store-name"
                      value={settings.storeName}
                      onChange={(e) =>
                        setSettings((prev) => prev ? {
                          ...prev,
                          storeName: e.target.value,
                        } : prev)
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="store-description">Description</Label>
                    <Textarea
                      id="store-description"
                      value={settings.storeDescription}
                      onChange={(e) =>
                        setSettings((prev) => prev ? {
                          ...prev,
                          storeDescription: e.target.value,
                        } : prev)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Select
                      value={settings.defaultCurrency}
                      onValueChange={(value) =>
                        setSettings((prev) => prev ? {
                          ...prev,
                          defaultCurrency: value as any,
                        } : prev)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Purchase Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-purchase">Minimum Purchase</Label>
                      <Input
                        id="min-purchase"
                        type="number"
                        step="0.01"
                        value={settings.minimumPurchaseAmount}
                        onChange={(e) =>
                          setSettings((prev) => prev ? {
                            ...prev,
                            minimumPurchaseAmount: parseFloat(e.target.value) || 0,
                          } : prev)
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max-purchase">Maximum Purchase</Label>
                      <Input
                        id="max-purchase"
                        type="number"
                        step="0.01"
                        value={settings.maximumPurchaseAmount}
                        onChange={(e) =>
                          setSettings((prev) => prev ? {
                            ...prev,
                            maximumPurchaseAmount: parseFloat(e.target.value) || 0,
                          } : prev)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <Switch
                      id="maintenance-mode"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => prev ? {
                          ...prev,
                          maintenanceMode: checked,
                        } : prev)
                      }
                    />
                  </div>

                  {settings.maintenanceMode && (
                    <div className="space-y-2">
                      <Label htmlFor="maintenance-message">Maintenance Message</Label>
                      <Textarea
                        id="maintenance-message"
                        value={settings.maintenanceMessage}
                        onChange={(e) =>
                          setSettings((prev) => prev ? {
                            ...prev,
                            maintenanceMessage: e.target.value,
                          } : prev)
                        }
                        placeholder="The store is temporarily under maintenance..."
                        rows={2}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => {
              if (settings) {
                goldStoreService.updateStoreSettings(settings).then(() => {
                  toast({
                    title: "Success",
                    description: "Store settings updated successfully.",
                  });
                }).catch(() => {
                  toast({
                    title: "Error",
                    description: "Failed to update store settings.",
                    variant: "destructive",
                  });
                });
              }
            }}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </TabsContent>

        {/* Store Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Store Preview</CardTitle>
              <div className="text-sm text-muted-foreground">
                Preview how the store appears to customers
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Store Preview</h3>
                  <p className="text-muted-foreground mb-4">
                    This would show a live preview of the customer-facing store
                  </p>
                  <Button asChild>
                    <a href="/store" target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4 mr-2" />
                      Open Store in New Tab
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
