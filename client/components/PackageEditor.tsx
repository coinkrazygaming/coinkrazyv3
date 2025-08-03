import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  Crown,
  Palette,
  Wand2,
  Eye,
  Save,
  Plus,
  Minus,
  RefreshCw,
  Sparkles,
  Settings,
  Image,
  Type,
  Layout,
  ColorWheel,
  Layers,
  Target,
  TrendingUp,
  DollarSign,
  Star,
  Gift,
  Zap,
  Bot,
} from "lucide-react";

export interface CoinPackage {
  id: string;
  name: string;
  description: string;
  goldCoins: number;
  sweepsCoins: number;
  price: number;
  originalPrice?: number;
  popular: boolean;
  featured: boolean;
  bonus: string;
  savings?: number;
  design: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    gradient: {
      from: string;
      to: string;
      direction: string;
    };
    border: {
      color: string;
      width: number;
      style: string;
    };
    icon: string;
    layout: "compact" | "expanded" | "premium";
    animation: string;
    shadow: {
      color: string;
      blur: number;
      opacity: number;
    };
  };
  analytics: {
    conversions: number;
    views: number;
    revenue: number;
    clickRate: number;
  };
}

export default function PackageEditor() {
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [packages, setPackages] = useState<CoinPackage[]>([
    {
      id: "starter",
      name: "Starter Pack",
      description: "Perfect for new players to get started",
      goldCoins: 50000,
      sweepsCoins: 25,
      price: 9.99,
      originalPrice: 12.99,
      popular: false,
      featured: false,
      bonus: "25 Free SC + Welcome Bonus",
      savings: 3,
      design: {
        backgroundColor: "#1e293b",
        textColor: "#ffffff",
        accentColor: "#f59e0b",
        gradient: {
          from: "#1e293b",
          to: "#334155",
          direction: "to-br",
        },
        border: {
          color: "#f59e0b",
          width: 2,
          style: "solid",
        },
        icon: "🌟",
        layout: "compact",
        animation: "none",
        shadow: {
          color: "#f59e0b",
          blur: 10,
          opacity: 0.3,
        },
      },
      analytics: {
        conversions: 1247,
        views: 8934,
        revenue: 12459.53,
        clickRate: 13.9,
      },
    },
    {
      id: "popular",
      name: "Popular Pack",
      description: "Our most popular choice for active players",
      goldCoins: 125000,
      sweepsCoins: 75,
      price: 19.99,
      originalPrice: 29.99,
      popular: true,
      featured: true,
      bonus: "75 Free SC + VIP Status",
      savings: 10,
      design: {
        backgroundColor: "#0f172a",
        textColor: "#ffffff",
        accentColor: "#3b82f6",
        gradient: {
          from: "#0f172a",
          to: "#1e293b",
          direction: "to-br",
        },
        border: {
          color: "#3b82f6",
          width: 3,
          style: "solid",
        },
        icon: "👑",
        layout: "expanded",
        animation: "pulse",
        shadow: {
          color: "#3b82f6",
          blur: 15,
          opacity: 0.4,
        },
      },
      analytics: {
        conversions: 3456,
        views: 15678,
        revenue: 69078.44,
        clickRate: 22.1,
      },
    },
  ]);

  const createNewPackage = () => {
    const newPackage: CoinPackage = {
      id: `package-${Date.now()}`,
      name: "New Package",
      description: "Customize this package",
      goldCoins: 100000,
      sweepsCoins: 50,
      price: 14.99,
      popular: false,
      featured: false,
      bonus: "Bonus description",
      design: {
        backgroundColor: "#1e293b",
        textColor: "#ffffff",
        accentColor: "#f59e0b",
        gradient: {
          from: "#1e293b",
          to: "#334155",
          direction: "to-br",
        },
        border: {
          color: "#f59e0b",
          width: 2,
          style: "solid",
        },
        icon: "💎",
        layout: "compact",
        animation: "none",
        shadow: {
          color: "#f59e0b",
          blur: 10,
          opacity: 0.3,
        },
      },
      analytics: {
        conversions: 0,
        views: 0,
        revenue: 0,
        clickRate: 0,
      },
    };

    setPackages([...packages, newPackage]);
    setSelectedPackage(newPackage);
    setIsCreating(true);
  };

  const updatePackage = (updates: Partial<CoinPackage>) => {
    if (!selectedPackage) return;

    const updatedPackage = { ...selectedPackage, ...updates };
    setSelectedPackage(updatedPackage);
    setPackages(
      packages.map((pkg) =>
        pkg.id === selectedPackage.id ? updatedPackage : pkg,
      ),
    );
  };

  const updateDesign = (designUpdates: Partial<CoinPackage["design"]>) => {
    if (!selectedPackage) return;

    const updatedDesign = { ...selectedPackage.design, ...designUpdates };
    updatePackage({ design: updatedDesign });
  };

  const generateAISuggestions = async () => {
    setIsGeneratingAI(true);

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const suggestions = [
      "Consider adding a limited-time offer badge to increase urgency",
      "The gradient could be more vibrant - try gold to amber for premium feel",
      "Popular packages perform 23% better with crown icons",
      "Adding a subtle animation increases click rates by 15%",
      "Price point optimization: $19.99 shows 18% higher conversion than $20.00",
      "Consider bundling with 7-day VIP access for premium packages",
    ];

    setAiSuggestions(suggestions);
    setIsGeneratingAI(false);
  };

  const applyAIOptimization = async () => {
    if (!selectedPackage) return;

    setIsGeneratingAI(true);

    // Simulate AI optimization
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Apply AI-suggested optimizations
    const optimizedDesign = {
      ...selectedPackage.design,
      gradient: {
        from: "#fbbf24",
        to: "#f59e0b",
        direction: "to-br",
      },
      accentColor: "#f59e0b",
      animation: "pulse",
      shadow: {
        color: "#f59e0b",
        blur: 20,
        opacity: 0.5,
      },
    };

    updatePackage({
      design: optimizedDesign,
      bonus: selectedPackage.bonus + " + AI Optimized",
    });

    setIsGeneratingAI(false);
  };

  const previewStyles = selectedPackage
    ? {
        background: `linear-gradient(${selectedPackage.design.gradient.direction}, ${selectedPackage.design.gradient.from}, ${selectedPackage.design.gradient.to})`,
        color: selectedPackage.design.textColor,
        border: `${selectedPackage.design.border.width}px ${selectedPackage.design.border.style} ${selectedPackage.design.border.color}`,
        boxShadow: `0 0 ${selectedPackage.design.shadow.blur}px ${selectedPackage.design.shadow.color}${Math.round(
          selectedPackage.design.shadow.opacity * 255,
        )
          .toString(16)
          .padStart(2, "0")}`,
      }
    : {};

  return (
    <div className="space-y-6">
      {/* Package List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold-500" />
            Package Editor
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={generateAISuggestions}
              disabled={isGeneratingAI}
              variant="outline"
              className="border-purple-500 text-purple-400"
            >
              {isGeneratingAI ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Bot className="w-4 h-4 mr-2" />
              )}
              AI Suggestions
            </Button>
            <Button
              onClick={createNewPackage}
              className="bg-gold-500 hover:bg-gold-600 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Package
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPackage?.id === pkg.id ? "ring-2 ring-gold-500" : ""
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold">{pkg.name}</h3>
                    <div className="flex gap-1">
                      {pkg.popular && (
                        <Badge className="bg-gold-500 text-black text-xs">
                          Popular
                        </Badge>
                      )}
                      {pkg.featured && (
                        <Badge variant="outline" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gold Coins:</span>
                      <span className="font-bold text-gold-400">
                        {pkg.goldCoins.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sweeps Coins:</span>
                      <span className="font-bold text-casino-blue">
                        {pkg.sweepsCoins}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-bold">${pkg.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversions:</span>
                      <span className="font-bold text-green-500">
                        {pkg.analytics.conversions}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions Panel */}
      {aiSuggestions.length > 0 && (
        <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-purple-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Sparkles className="w-5 h-5" />
              AI Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg"
                >
                  <Wand2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              ))}
              <Button
                onClick={applyAIOptimization}
                disabled={isGeneratingAI || !selectedPackage}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isGeneratingAI ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Apply AI Optimization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package Editor */}
      {selectedPackage && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">
                  <Type className="w-4 h-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="design">
                  <Palette className="w-4 h-4 mr-2" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <Layout className="w-4 h-4 mr-2" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Package Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Package Name
                      </label>
                      <Input
                        value={selectedPackage.name}
                        onChange={(e) =>
                          updatePackage({ name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <Input
                        value={selectedPackage.description}
                        onChange={(e) =>
                          updatePackage({ description: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Gold Coins
                        </label>
                        <Input
                          type="number"
                          value={selectedPackage.goldCoins}
                          onChange={(e) =>
                            updatePackage({
                              goldCoins: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Sweeps Coins
                        </label>
                        <Input
                          type="number"
                          value={selectedPackage.sweepsCoins}
                          onChange={(e) =>
                            updatePackage({
                              sweepsCoins: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Price ($)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={selectedPackage.price}
                          onChange={(e) =>
                            updatePackage({
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Original Price ($)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={selectedPackage.originalPrice || ""}
                          onChange={(e) =>
                            updatePackage({
                              originalPrice:
                                parseFloat(e.target.value) || undefined,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bonus Description
                      </label>
                      <Input
                        value={selectedPackage.bonus}
                        onChange={(e) =>
                          updatePackage({ bonus: e.target.value })
                        }
                        placeholder="e.g., 75 Free SC + VIP Status"
                      />
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPackage.popular}
                          onChange={(e) =>
                            updatePackage({ popular: e.target.checked })
                          }
                        />
                        <span className="text-sm">Popular</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPackage.featured}
                          onChange={(e) =>
                            updatePackage({ featured: e.target.checked })
                          }
                        />
                        <span className="text-sm">Featured</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Visual Design</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Icon
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {[
                          "💎",
                          "👑",
                          "🌟",
                          "🔥",
                          "⚡",
                          "🎯",
                          "🚀",
                          "💰",
                          "🏆",
                          "🎁",
                          "✨",
                          "🍀",
                        ].map((icon) => (
                          <Button
                            key={icon}
                            variant={
                              selectedPackage.design.icon === icon
                                ? "default"
                                : "outline"
                            }
                            className="text-2xl h-12"
                            onClick={() => updateDesign({ icon })}
                          >
                            {icon}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedPackage.design.backgroundColor}
                            onChange={(e) =>
                              updateDesign({ backgroundColor: e.target.value })
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={selectedPackage.design.backgroundColor}
                            onChange={(e) =>
                              updateDesign({ backgroundColor: e.target.value })
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Accent Color
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedPackage.design.accentColor}
                            onChange={(e) =>
                              updateDesign({ accentColor: e.target.value })
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={selectedPackage.design.accentColor}
                            onChange={(e) =>
                              updateDesign({ accentColor: e.target.value })
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Gradient
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Input
                            type="color"
                            value={selectedPackage.design.gradient.from}
                            onChange={(e) =>
                              updateDesign({
                                gradient: {
                                  ...selectedPackage.design.gradient,
                                  from: e.target.value,
                                },
                              })
                            }
                            className="w-full h-10 p-1"
                          />
                          <label className="text-xs text-muted-foreground">
                            From
                          </label>
                        </div>
                        <div>
                          <Input
                            type="color"
                            value={selectedPackage.design.gradient.to}
                            onChange={(e) =>
                              updateDesign({
                                gradient: {
                                  ...selectedPackage.design.gradient,
                                  to: e.target.value,
                                },
                              })
                            }
                            className="w-full h-10 p-1"
                          />
                          <label className="text-xs text-muted-foreground">
                            To
                          </label>
                        </div>
                        <div>
                          <select
                            value={selectedPackage.design.gradient.direction}
                            onChange={(e) =>
                              updateDesign({
                                gradient: {
                                  ...selectedPackage.design.gradient,
                                  direction: e.target.value,
                                },
                              })
                            }
                            className="w-full h-10 px-2 border border-border rounded"
                          >
                            <option value="to-r">Right</option>
                            <option value="to-l">Left</option>
                            <option value="to-t">Up</option>
                            <option value="to-b">Down</option>
                            <option value="to-br">Bottom Right</option>
                            <option value="to-bl">Bottom Left</option>
                            <option value="to-tr">Top Right</option>
                            <option value="to-tl">Top Left</option>
                          </select>
                          <label className="text-xs text-muted-foreground">
                            Direction
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Animation
                      </label>
                      <select
                        value={selectedPackage.design.animation}
                        onChange={(e) =>
                          updateDesign({ animation: e.target.value })
                        }
                        className="w-full p-2 border border-border rounded"
                      >
                        <option value="none">None</option>
                        <option value="pulse">Pulse</option>
                        <option value="bounce">Bounce</option>
                        <option value="spin">Spin</option>
                        <option value="ping">Ping</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Layout Style
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["compact", "expanded", "premium"].map((layout) => (
                          <Button
                            key={layout}
                            variant={
                              selectedPackage.design.layout === layout
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              updateDesign({ layout: layout as any })
                            }
                            className="capitalize"
                          >
                            {layout}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Border Width
                      </label>
                      <Input
                        type="range"
                        min="0"
                        max="5"
                        value={selectedPackage.design.border.width}
                        onChange={(e) =>
                          updateDesign({
                            border: {
                              ...selectedPackage.design.border,
                              width: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                      <div className="text-sm text-muted-foreground">
                        {selectedPackage.design.border.width}px
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Shadow Blur
                      </label>
                      <Input
                        type="range"
                        min="0"
                        max="30"
                        value={selectedPackage.design.shadow.blur}
                        onChange={(e) =>
                          updateDesign({
                            shadow: {
                              ...selectedPackage.design.shadow,
                              blur: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                      <div className="text-sm text-muted-foreground">
                        {selectedPackage.design.shadow.blur}px
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Shadow Opacity
                      </label>
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedPackage.design.shadow.opacity}
                        onChange={(e) =>
                          updateDesign({
                            shadow: {
                              ...selectedPackage.design.shadow,
                              opacity: parseFloat(e.target.value),
                            },
                          })
                        }
                      />
                      <div className="text-sm text-muted-foreground">
                        {(selectedPackage.design.shadow.opacity * 100).toFixed(
                          0,
                        )}
                        %
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                          {selectedPackage.analytics.conversions}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Conversions
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {selectedPackage.analytics.views}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Views
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gold-500">
                          ${selectedPackage.analytics.revenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Revenue
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-casino-blue">
                          {selectedPackage.analytics.clickRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Click Rate
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Package Preview */}
                  <div
                    className={`relative p-6 rounded-lg text-center transition-all duration-300 ${
                      selectedPackage.design.animation === "pulse"
                        ? "animate-pulse"
                        : selectedPackage.design.animation === "bounce"
                          ? "animate-bounce"
                          : selectedPackage.design.animation === "spin"
                            ? "animate-spin"
                            : selectedPackage.design.animation === "ping"
                              ? "animate-ping"
                              : ""
                    }`}
                    style={previewStyles}
                  >
                    {selectedPackage.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gold-500 text-black">
                        Popular
                      </Badge>
                    )}
                    {selectedPackage.featured && (
                      <Badge className="absolute -top-2 right-2 bg-red-500 text-white">
                        Featured
                      </Badge>
                    )}

                    <div className="text-4xl mb-3">
                      {selectedPackage.design.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">
                      {selectedPackage.name}
                    </h3>
                    <p className="text-sm opacity-80 mb-4">
                      {selectedPackage.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center gap-2">
                        <Coins className="w-4 h-4" />
                        <span className="font-bold">
                          {selectedPackage.goldCoins.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs opacity-70">Gold Coins</div>

                      <div className="flex items-center justify-center gap-2">
                        <Crown className="w-4 h-4" />
                        <span className="font-bold">
                          {selectedPackage.sweepsCoins}
                        </span>
                      </div>
                      <div className="text-xs opacity-70">Sweeps Coins</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold">
                        ${selectedPackage.price}
                      </div>
                      {selectedPackage.originalPrice && (
                        <div className="text-sm line-through opacity-60">
                          ${selectedPackage.originalPrice}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-green-400 mb-4">
                      {selectedPackage.bonus}
                    </div>

                    <Button className="w-full">Purchase</Button>
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={() =>
                      console.log("Saving package:", selectedPackage)
                    }
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
