import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Coins,
  Users,
  Mail,
  Brain,
  GamepadIcon,
  Shield,
  BarChart3,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Crown,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GameSettings {
  id: string;
  name: string;
  enabled: boolean;
  rtp: number;
  minBet: number;
  maxBet: number;
  maxWinMultiplier: number;
  jackpotEnabled: boolean;
  jackpotSeedAmount: number;
}

interface CurrencySettings {
  code: string;
  name: string;
  enabled: boolean;
  exchangeRate: number;
  minPurchase: number;
  maxPurchase: number;
  welcomeBonus: number;
  dailyBonus: number;
}

interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  gamesEnabled: boolean;
  chatEnabled: boolean;
  welcomeEmailEnabled: boolean;
  joseyAIEnabled: boolean;
  maxPlayersOnline: number;
  sessionTimeout: number;
}

interface SecuritySettings {
  twoFactorRequired: boolean;
  kycRequired: boolean;
  maxLoginAttempts: number;
  passwordMinLength: number;
  suspiciousActivityAlerts: boolean;
  geoBlocking: boolean;
  vpnBlocking: boolean;
}

export default function AdminSettingsPanel() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("games");

  // Helper functions to safely parse numbers and prevent NaN
  const safeParseInt = (value: string, fallback: number = 0): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? fallback : parsed;
  };

  const safeParseFloat = (value: string, fallback: number = 0): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  };

  // Game Settings
  const [gameSettings, setGameSettings] = useState<GameSettings[]>([
    {
      id: "coinkrazy-spinner",
      name: "CoinKrazy Spinner",
      enabled: true,
      rtp: 96.8,
      minBet: 1,
      maxBet: 1000,
      maxWinMultiplier: 1000,
      jackpotEnabled: true,
      jackpotSeedAmount: 1000000,
    },
    {
      id: "lucky-scratch-gold",
      name: "Lucky Scratch Gold",
      enabled: true,
      rtp: 97.2,
      minBet: 1,
      maxBet: 100,
      maxWinMultiplier: 500,
      jackpotEnabled: false,
      jackpotSeedAmount: 0,
    },
    {
      id: "josey-duck-adventure",
      name: "Josey Duck Adventure",
      enabled: true,
      rtp: 96.5,
      minBet: 2,
      maxBet: 500,
      maxWinMultiplier: 750,
      jackpotEnabled: true,
      jackpotSeedAmount: 500000,
    },
    {
      id: "bingo-hall",
      name: "CoinKrazy Bingo Hall",
      enabled: true,
      rtp: 95.5,
      minBet: 1,
      maxBet: 50,
      maxWinMultiplier: 200,
      jackpotEnabled: false,
      jackpotSeedAmount: 0,
    },
    {
      id: "mary-cucumber",
      name: "Mary Had A Lil Cucumber",
      enabled: true,
      rtp: 96.2,
      minBet: 5,
      maxBet: 200,
      maxWinMultiplier: 400,
      jackpotEnabled: false,
      jackpotSeedAmount: 0,
    },
  ]);

  // Currency Settings
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings[]>([
    {
      code: "GC",
      name: "Gold Coins",
      enabled: true,
      exchangeRate: 0.0001,
      minPurchase: 10000,
      maxPurchase: 1000000,
      welcomeBonus: 50000,
      dailyBonus: 5000,
    },
    {
      code: "SC",
      name: "Sweeps Coins",
      enabled: true,
      exchangeRate: 1.0,
      minPurchase: 0, // Cannot be purchased
      maxPurchase: 0,
      welcomeBonus: 25,
      dailyBonus: 2,
    },
  ]);

  // System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    registrationEnabled: true,
    gamesEnabled: true,
    chatEnabled: true,
    welcomeEmailEnabled: true,
    joseyAIEnabled: true,
    maxPlayersOnline: 10000,
    sessionTimeout: 3600, // 1 hour
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorRequired: false,
    kycRequired: true,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    suspiciousActivityAlerts: true,
    geoBlocking: false,
    vpnBlocking: false,
  });

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In production: save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "All CoinKrazy settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateGameSetting = (gameId: string, field: string, value: any) => {
    setGameSettings(prev => 
      prev.map(game => 
        game.id === gameId ? { ...game, [field]: value } : game
      )
    );
  };

  const updateCurrencySetting = (code: string, field: string, value: any) => {
    setCurrencySettings(prev => 
      prev.map(currency => 
        currency.code === code ? { ...currency, [field]: value } : currency
      )
    );
  };

  const updateSystemSetting = (field: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateSecuritySetting = (field: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">CoinKrazy Admin Settings</h2>
          <p className="text-muted-foreground">Configure games, currencies, security, and system settings</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving} className="bg-gradient-to-r from-gold-500 to-gold-600">
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save All Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="games" className="flex items-center gap-2">
            <GamepadIcon className="w-4 h-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="currencies" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Currencies
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GamepadIcon className="w-5 h-5" />
                Game Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {gameSettings.map((game) => (
                <Card key={game.id} className="border-casino-blue/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={game.enabled ? "default" : "secondary"}>
                          {game.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Switch
                          checked={game.enabled}
                          onCheckedChange={(checked) => updateGameSetting(game.id, "enabled", checked)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div>
                        <Label>RTP (%)</Label>
                        <Input
                          type="number"
                          value={game.rtp}
                          min="85"
                          max="99"
                          step="0.1"
                          onChange={(e) => updateGameSetting(game.id, "rtp", safeParseFloat(e.target.value, game.rtp))}
                        />
                      </div>
                      <div>
                        <Label>Min Bet</Label>
                        <Input
                          type="number"
                          value={game.minBet}
                          min="1"
                          onChange={(e) => updateGameSetting(game.id, "minBet", safeParseInt(e.target.value, game.minBet))}
                        />
                      </div>
                      <div>
                        <Label>Max Bet</Label>
                        <Input
                          type="number"
                          value={game.maxBet}
                          min="10"
                          onChange={(e) => updateGameSetting(game.id, "maxBet", safeParseInt(e.target.value, game.maxBet))}
                        />
                      </div>
                      <div>
                        <Label>Max Win Multiplier</Label>
                        <Input
                          type="number"
                          value={game.maxWinMultiplier}
                          min="100"
                          onChange={(e) => updateGameSetting(game.id, "maxWinMultiplier", safeParseInt(e.target.value, game.maxWinMultiplier))}
                        />
                      </div>
                      <div>
                        <Label>Jackpot</Label>
                        <Switch
                          checked={game.jackpotEnabled}
                          onCheckedChange={(checked) => updateGameSetting(game.id, "jackpotEnabled", checked)}
                        />
                      </div>
                      {game.jackpotEnabled && (
                        <div>
                          <Label>Jackpot Seed</Label>
                          <Input
                            type="number"
                            value={game.jackpotSeedAmount}
                            min="10000"
                            onChange={(e) => updateGameSetting(game.id, "jackpotSeedAmount", safeParseInt(e.target.value, game.jackpotSeedAmount))}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Virtual Currency Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currencySettings.map((currency) => (
                <Card key={currency.code} className="border-gold/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {currency.code === "GC" ? "🪙" : "👑"} {currency.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={currency.enabled ? "default" : "secondary"}>
                          {currency.enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={currency.enabled}
                          onCheckedChange={(checked) => updateCurrencySetting(currency.code, "enabled", checked)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Exchange Rate (USD)</Label>
                        <Input
                          type="number"
                          value={currency.exchangeRate}
                          step="0.0001"
                          disabled={currency.code === "GC"} // GC has no real cash value
                          onChange={(e) => updateCurrencySetting(currency.code, "exchangeRate", safeParseFloat(e.target.value, currency.exchangeRate))}
                        />
                        {currency.code === "GC" && (
                          <p className="text-xs text-muted-foreground mt-1">No real cash value</p>
                        )}
                      </div>
                      <div>
                        <Label>Welcome Bonus</Label>
                        <Input
                          type="number"
                          value={currency.welcomeBonus}
                          min="0"
                          onChange={(e) => updateCurrencySetting(currency.code, "welcomeBonus", safeParseInt(e.target.value, currency.welcomeBonus))}
                        />
                      </div>
                      <div>
                        <Label>Daily Bonus</Label>
                        <Input
                          type="number"
                          value={currency.dailyBonus}
                          min="0"
                          onChange={(e) => updateCurrencySetting(currency.code, "dailyBonus", safeParseInt(e.target.value, currency.dailyBonus))}
                        />
                      </div>
                      <div>
                        <Label>Purchase Limits</Label>
                        {currency.code === "SC" ? (
                          <Badge variant="outline" className="w-full justify-center">Cannot be purchased</Badge>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Min"
                              type="number"
                              value={currency.minPurchase}
                              onChange={(e) => updateCurrencySetting(currency.code, "minPurchase", safeParseInt(e.target.value, currency.minPurchase))}
                            />
                            <Input
                              placeholder="Max"
                              type="number"
                              value={currency.maxPurchase}
                              onChange={(e) => updateCurrencySetting(currency.code, "maxPurchase", safeParseInt(e.target.value, currency.maxPurchase))}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Maintenance Mode</Label>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => updateSystemSetting("maintenanceMode", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Registration Enabled</Label>
                  <Switch
                    checked={systemSettings.registrationEnabled}
                    onCheckedChange={(checked) => updateSystemSetting("registrationEnabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Games Enabled</Label>
                  <Switch
                    checked={systemSettings.gamesEnabled}
                    onCheckedChange={(checked) => updateSystemSetting("gamesEnabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Chat Enabled</Label>
                  <Switch
                    checked={systemSettings.chatEnabled}
                    onCheckedChange={(checked) => updateSystemSetting("chatEnabled", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Capacity Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Max Players Online</Label>
                  <Input
                    type="number"
                    value={systemSettings.maxPlayersOnline}
                    min="100"
                    max="100000"
                    onChange={(e) => updateSystemSetting("maxPlayersOnline", safeParseInt(e.target.value, systemSettings.maxPlayersOnline))}
                  />
                </div>
                <div>
                  <Label>Session Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={systemSettings.sessionTimeout}
                    min="300"
                    max="86400"
                    onChange={(e) => updateSystemSetting("sessionTimeout", safeParseInt(e.target.value, systemSettings.sessionTimeout))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Two-Factor Authentication Required</Label>
                    <Switch
                      checked={securitySettings.twoFactorRequired}
                      onCheckedChange={(checked) => updateSecuritySetting("twoFactorRequired", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>KYC Verification Required</Label>
                    <Switch
                      checked={securitySettings.kycRequired}
                      onCheckedChange={(checked) => updateSecuritySetting("kycRequired", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Suspicious Activity Alerts</Label>
                    <Switch
                      checked={securitySettings.suspiciousActivityAlerts}
                      onCheckedChange={(checked) => updateSecuritySetting("suspiciousActivityAlerts", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Geo-blocking</Label>
                    <Switch
                      checked={securitySettings.geoBlocking}
                      onCheckedChange={(checked) => updateSecuritySetting("geoBlocking", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>VPN Blocking</Label>
                    <Switch
                      checked={securitySettings.vpnBlocking}
                      onCheckedChange={(checked) => updateSecuritySetting("vpnBlocking", checked)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Max Login Attempts</Label>
                    <Input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      min="3"
                      max="10"
                      onChange={(e) => updateSecuritySetting("maxLoginAttempts", safeParseInt(e.target.value, securitySettings.maxLoginAttempts))}
                    />
                  </div>
                  <div>
                    <Label>Minimum Password Length</Label>
                    <Input
                      type="number"
                      value={securitySettings.passwordMinLength}
                      min="6"
                      max="20"
                      onChange={(e) => updateSecuritySetting("passwordMinLength", safeParseInt(e.target.value, securitySettings.passwordMinLength))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email & Communications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Welcome Email Automation</Label>
                  <Switch
                    checked={systemSettings.welcomeEmailEnabled}
                    onCheckedChange={(checked) => updateSystemSetting("welcomeEmailEnabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Josey AI Assistant</Label>
                  <Switch
                    checked={systemSettings.joseyAIEnabled}
                    onCheckedChange={(checked) => updateSystemSetting("joseyAIEnabled", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Josey AI Lead Generation</Label>
                  <Badge variant="outline" className="border-green-500 text-green-400">Active</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Automated Customer Support</Label>
                  <Badge variant="outline" className="border-green-500 text-green-400">Active</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Fraud Detection</Label>
                  <Badge variant="outline" className="border-green-500 text-green-400">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
