import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Crown, 
  Star, 
  Gift, 
  Zap, 
  Shield, 
  Phone, 
  CreditCard,
  TrendingUp,
  Award,
  Gem,
  Lock,
  Unlock
} from 'lucide-react';
import { realNeonService, VIPProgram } from '../services/realNeonService';
import { authService } from '../services/authService';

interface VIPTier {
  level: number;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  pointsRequired: number;
  benefits: string[];
  cashbackRate: number;
  bonusMultiplier: number;
  monthlyGC: number;
  monthlySC: number;
  withdrawalLimitIncrease: number;
  exclusiveGames: string[];
}

const VIP_TIERS: VIPTier[] = [
  {
    level: 1,
    name: 'Bronze Member',
    icon: Shield,
    color: 'from-amber-600 to-amber-800',
    pointsRequired: 0,
    benefits: ['Basic support', 'Standard withdrawal limits'],
    cashbackRate: 0.01,
    bonusMultiplier: 1.0,
    monthlyGC: 1000,
    monthlySC: 5,
    withdrawalLimitIncrease: 0,
    exclusiveGames: []
  },
  {
    level: 2,
    name: 'Silver Elite',
    icon: Star,
    color: 'from-gray-400 to-gray-600',
    pointsRequired: 1000,
    benefits: ['Priority support', 'Weekly bonuses', 'Birthday bonus'],
    cashbackRate: 0.02,
    bonusMultiplier: 1.2,
    monthlyGC: 2500,
    monthlySC: 12,
    withdrawalLimitIncrease: 500,
    exclusiveGames: ['VIP Slots Collection']
  },
  {
    level: 3,
    name: 'Gold Premier',
    icon: Award,
    color: 'from-yellow-400 to-yellow-600',
    pointsRequired: 5000,
    benefits: ['Dedicated account manager', 'Exclusive tournaments', 'Higher limits'],
    cashbackRate: 0.035,
    bonusMultiplier: 1.5,
    monthlyGC: 5000,
    monthlySC: 25,
    withdrawalLimitIncrease: 1500,
    exclusiveGames: ['VIP Slots Collection', 'Gold Tournament Games']
  },
  {
    level: 4,
    name: 'Platinum Prestige',
    icon: Gem,
    color: 'from-slate-300 to-slate-500',
    pointsRequired: 15000,
    benefits: ['24/7 VIP support', 'Custom bonuses', 'Exclusive events'],
    cashbackRate: 0.05,
    bonusMultiplier: 2.0,
    monthlyGC: 10000,
    monthlySC: 50,
    withdrawalLimitIncrease: 3000,
    exclusiveGames: ['VIP Slots Collection', 'Gold Tournament Games', 'Platinum Exclusives']
  },
  {
    level: 5,
    name: 'Diamond Elite',
    icon: Crown,
    color: 'from-blue-400 to-blue-600',
    pointsRequired: 50000,
    benefits: ['Personal VIP host', 'Unlimited withdrawals', 'Exclusive rewards'],
    cashbackRate: 0.075,
    bonusMultiplier: 3.0,
    monthlyGC: 25000,
    monthlySC: 125,
    withdrawalLimitIncrease: 10000,
    exclusiveGames: ['VIP Slots Collection', 'Gold Tournament Games', 'Platinum Exclusives', 'Diamond VIP Games']
  }
];

const VIPAccessSystem = () => {
  const [userVIP, setUserVIP] = useState<VIPProgram | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadVIPData();
  }, []);

  const loadVIPData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const user = authService.getUserByToken(token);
      if (!user) return;
      
      setCurrentUser(user);

      // Get VIP program data from Neon
      if (realNeonService.isConnected()) {
        const vipData = await realNeonService.getVIPProgram(user.id);
        if (vipData) {
          setUserVIP(vipData);
        } else {
          // Create initial VIP program for user
          await createInitialVIPProgram(user.id);
        }
      }
    } catch (error) {
      console.error('Failed to load VIP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialVIPProgram = async (userId: string) => {
    try {
      const initialVIP: VIPProgram = {
        id: `vip_${userId}_${Date.now()}`,
        user_id: userId,
        level: 1,
        level_name: 'Bronze Member',
        points_current: 0,
        points_required_next: 1000,
        benefits: VIP_TIERS[0].benefits,
        cashback_rate: VIP_TIERS[0].cashbackRate,
        bonus_multiplier: VIP_TIERS[0].bonusMultiplier,
        priority_support: false,
        exclusive_games: false,
        monthly_bonus_gc: VIP_TIERS[0].monthlyGC,
        monthly_bonus_sc: VIP_TIERS[0].monthlySC,
        withdrawal_limit_increase: VIP_TIERS[0].withdrawalLimitIncrease,
        created_at: new Date(),
        updated_at: new Date()
      };

      await realNeonService.updateVIPProgram(userId, initialVIP);
      setUserVIP(initialVIP);
      
      // Log VIP creation
      await realNeonService.logAdminAction({
        admin_user_id: 'system',
        action: 'vip_program_created',
        target_type: 'user',
        target_id: userId,
        details: { initialLevel: 1, levelName: 'Bronze Member' },
        severity: 'info'
      });
    } catch (error) {
      console.error('Failed to create initial VIP program:', error);
    }
  };

  const checkVIPUpgrade = async () => {
    if (!userVIP || !currentUser) return;

    try {
      setUpgrading(true);
      
      // Calculate points based on user activity (simplified)
      const pointsToAdd = Math.floor(Math.random() * 500) + 100; // Simulate earning points
      const newPoints = userVIP.points_current + pointsToAdd;
      
      // Check if user qualifies for upgrade
      const nextTier = VIP_TIERS.find(tier => tier.level === userVIP.level + 1);
      
      if (nextTier && newPoints >= nextTier.pointsRequired) {
        // Upgrade user
        const upgradedVIP: Partial<VIPProgram> = {
          level: nextTier.level,
          level_name: nextTier.name,
          points_current: newPoints,
          points_required_next: VIP_TIERS.find(t => t.level === nextTier.level + 1)?.pointsRequired || 999999,
          benefits: nextTier.benefits,
          cashback_rate: nextTier.cashbackRate,
          bonus_multiplier: nextTier.bonusMultiplier,
          priority_support: nextTier.level >= 2,
          exclusive_games: nextTier.level >= 2,
          monthly_bonus_gc: nextTier.monthlyGC,
          monthly_bonus_sc: nextTier.monthlySC,
          withdrawal_limit_increase: nextTier.withdrawalLimitIncrease
        };

        await realNeonService.updateVIPProgram(currentUser.id, upgradedVIP);
        
        // Log upgrade
        await realNeonService.logAdminAction({
          admin_user_id: currentUser.id,
          action: 'vip_level_upgraded',
          target_type: 'user',
          target_id: currentUser.id,
          details: {
            previousLevel: userVIP.level,
            newLevel: nextTier.level,
            pointsEarned: pointsToAdd,
            totalPoints: newPoints
          },
          severity: 'info'
        });

        // Reload data
        await loadVIPData();
      } else {
        // Just update points
        await realNeonService.updateVIPProgram(currentUser.id, {
          points_current: newPoints
        });
        
        setUserVIP(prev => prev ? { ...prev, points_current: newPoints } : null);
      }
    } catch (error) {
      console.error('Failed to check VIP upgrade:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const claimMonthlyBonus = async () => {
    if (!userVIP || !currentUser) return;

    try {
      // Create bonus transaction in Neon
      await realNeonService.createTransaction({
        user_id: currentUser.id,
        type: 'bonus',
        amount: userVIP.monthly_bonus_gc,
        currency: 'GC',
        balance_before: currentUser.gcBalance,
        balance_after: currentUser.gcBalance + userVIP.monthly_bonus_gc,
        description: `VIP ${userVIP.level_name} Monthly Bonus`,
        status: 'completed',
        metadata: {
          vipLevel: userVIP.level,
          bonusType: 'monthly_vip',
          scBonus: userVIP.monthly_bonus_sc
        }
      });

      // Update user balance
      await realNeonService.updateUser(currentUser.id, {
        gcBalance: currentUser.gcBalance + userVIP.monthly_bonus_gc,
        scBalance: currentUser.scBalance + userVIP.monthly_bonus_sc
      });

      // Log bonus claim
      await realNeonService.logAdminAction({
        admin_user_id: currentUser.id,
        action: 'vip_monthly_bonus_claimed',
        target_type: 'user',
        target_id: currentUser.id,
        details: {
          vipLevel: userVIP.level,
          gcBonus: userVIP.monthly_bonus_gc,
          scBonus: userVIP.monthly_bonus_sc
        },
        severity: 'info'
      });

      // Refresh user data
      window.dispatchEvent(new Event('auth-change'));
    } catch (error) {
      console.error('Failed to claim monthly bonus:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!userVIP) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            VIP Access System
          </CardTitle>
          <CardDescription>
            VIP program data is loading...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentTier = VIP_TIERS.find(tier => tier.level === userVIP.level) || VIP_TIERS[0];
  const nextTier = VIP_TIERS.find(tier => tier.level === userVIP.level + 1);
  const progressPercentage = nextTier 
    ? (userVIP.points_current / nextTier.pointsRequired) * 100 
    : 100;

  return (
    <div className="space-y-6">
      <Card className={`bg-gradient-to-r ${currentTier.color} text-white`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <currentTier.icon className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">{currentTier.name}</CardTitle>
                <CardDescription className="text-white/80">
                  Level {userVIP.level} VIP Member
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {userVIP.points_current.toLocaleString()} Points
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTier.name}</span>
                <span>{userVIP.points_current} / {nextTier.pointsRequired}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-white/80">
                {nextTier.pointsRequired - userVIP.points_current} points until next level
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="benefits" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
          <TabsTrigger value="tiers">All Tiers</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your VIP Benefits</CardTitle>
              <CardDescription>
                Exclusive perks for Level {userVIP.level} members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Cashback Rate</p>
                    <p className="text-sm text-muted-foreground">
                      {(userVIP.cashback_rate * 100).toFixed(2)}% on all deposits
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Bonus Multiplier</p>
                    <p className="text-sm text-muted-foreground">
                      {userVIP.bonus_multiplier}x bonus rewards
                    </p>
                  </div>
                </div>

                {userVIP.priority_support && (
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Priority Support</p>
                      <p className="text-sm text-muted-foreground">
                        24/7 dedicated VIP support
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Withdrawal Limit</p>
                    <p className="text-sm text-muted-foreground">
                      +${userVIP.withdrawal_limit_increase.toLocaleString()} increase
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Exclusive Benefits:</h4>
                <ul className="space-y-1">
                  {userVIP.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bonuses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly VIP Bonuses</CardTitle>
              <CardDescription>
                Claim your exclusive monthly rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-6 border rounded-lg">
                  <Gift className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{userVIP.monthly_bonus_gc.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Gold Coins</p>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <Crown className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{userVIP.monthly_bonus_sc}</p>
                  <p className="text-sm text-muted-foreground">Sweeps Coins</p>
                </div>
              </div>

              <Button 
                onClick={claimMonthlyBonus} 
                className="w-full"
                size="lg"
              >
                <Gift className="h-5 w-5 mr-2" />
                Claim Monthly Bonus
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4">
            {VIP_TIERS.map((tier, index) => {
              const TierIcon = tier.icon;
              const isCurrentTier = tier.level === userVIP.level;
              const isUnlocked = tier.level <= userVIP.level;
              
              return (
                <Card key={tier.level} className={`${isCurrentTier ? 'ring-2 ring-purple-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${tier.color}`}>
                          <TierIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {tier.name}
                            {isCurrentTier && <Badge>Current</Badge>}
                            {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                            {isUnlocked && !isCurrentTier && <Unlock className="h-4 w-4 text-green-500" />}
                          </CardTitle>
                          <CardDescription>
                            Level {tier.level} • {tier.pointsRequired.toLocaleString()} points required
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cashback</p>
                        <p className="font-medium">{(tier.cashbackRate * 100).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Multiplier</p>
                        <p className="font-medium">{tier.bonusMultiplier}x</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly GC</p>
                        <p className="font-medium">{tier.monthlyGC.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly SC</p>
                        <p className="font-medium">{tier.monthlySC}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earn VIP Points</CardTitle>
              <CardDescription>
                Complete these activities to earn points and level up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={checkVIPUpgrade} 
                disabled={upgrading}
                className="w-full"
              >
                {upgrading ? 'Processing...' : 'Simulate Activity & Check Upgrade'}
              </Button>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Daily Login</span>
                  <Badge variant="outline">+10 points</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Complete Game Session</span>
                  <Badge variant="outline">+25 points</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Make Deposit</span>
                  <Badge variant="outline">+50 points</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Refer a Friend</span>
                  <Badge variant="outline">+200 points</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VIPAccessSystem;
