import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Gift,
  Calendar,
  Users,
  Share2,
  Trophy,
  Star,
  Crown,
  Coins,
  Gem,
  Zap,
  Target,
  Award,
  Clock,
  CheckCircle,
  X,
  Plus,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  Mail,
  Link,
  Flame,
  TrendingUp,
  Sparkles,
  PartyPopper,
  Heart,
  ThumbsUp,
  Send,
  UserPlus,
  Settings,
  RotateCcw,
  ExternalLink,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { walletService, type UserWallet } from '../services/walletService';

interface DailyReward {
  day: number;
  gcReward: number;
  scReward: number;
  bonusMultiplier?: number;
  specialReward?: string;
  isClaimed: boolean;
  isAvailable: boolean;
  isBonusDay: boolean;
}

interface SocialTask {
  id: string;
  type: 'share' | 'follow' | 'like' | 'comment' | 'refer' | 'review' | 'survey';
  platform: 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'email' | 'generic';
  title: string;
  description: string;
  gcReward: number;
  scReward: number;
  url?: string;
  isCompleted: boolean;
  isAvailable: boolean;
  expiresAt?: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'social' | 'engagement' | 'referral' | 'feedback';
  requirements?: string[];
}

interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
  lastLoginDate: Date | null;
  weeklyBonusEligible: boolean;
  monthlyBonusEligible: boolean;
  vipLevel: number;
  socialPoints: number;
  referralCode: string;
  totalReferrals: number;
  completedTasks: string[];
}

interface Referral {
  id: string;
  referredEmail: string;
  referredAt: Date;
  status: 'pending' | 'verified' | 'active';
  bonusEarned: { GC: number; SC: number };
  milestoneReached?: string;
}

interface Milestone {
  id: string;
  type: 'streak' | 'social' | 'referral' | 'total_logins';
  title: string;
  description: string;
  requirement: number;
  gcReward: number;
  scReward: number;
  badgeIcon: string;
  isCompleted: boolean;
  progress: number;
}

export default function SocialRewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>([]);
  const [socialTasks, setSocialTasks] = useState<SocialTask[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [referralEmail, setReferralEmail] = useState('');
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadWallet(),
        loadUserProgress(),
        loadDailyRewards(),
        loadSocialTasks(),
        loadReferrals(),
        loadMilestones()
      ]);
      
      // Check if user can claim daily reward
      checkDailyLoginEligibility();
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    if (!user?.id) return;
    try {
      const userWallet = await walletService.getUserWallet(user.id);
      setWallet(userWallet);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const loadUserProgress = () => {
    if (!user?.id) return;
    
    try {
      const savedProgress = localStorage.getItem(`social_progress_${user.id}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setUserProgress({
          ...progress,
          lastLoginDate: progress.lastLoginDate ? new Date(progress.lastLoginDate) : null
        });
      } else {
        // Initialize new user progress
        const newProgress: UserProgress = {
          currentStreak: 0,
          longestStreak: 0,
          totalDaysLogged: 0,
          lastLoginDate: null,
          weeklyBonusEligible: false,
          monthlyBonusEligible: false,
          vipLevel: 1,
          socialPoints: 0,
          referralCode: generateReferralCode(),
          totalReferrals: 0,
          completedTasks: []
        };
        setUserProgress(newProgress);
        saveUserProgress(newProgress);
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  const loadDailyRewards = () => {
    // Generate 30-day reward calendar
    const rewards: DailyReward[] = [];
    const today = new Date();
    const currentDay = new Date().getDate();
    
    for (let day = 1; day <= 30; day++) {
      const baseGC = 100 + (day * 10);
      const baseSC = 1 + (day * 0.1);
      const isBonusDay = day % 7 === 0; // Every 7th day is bonus
      
      rewards.push({
        day,
        gcReward: isBonusDay ? baseGC * 2 : baseGC,
        scReward: isBonusDay ? baseSC * 2 : baseSC,
        bonusMultiplier: isBonusDay ? 2 : undefined,
        specialReward: day === 30 ? 'VIP Status Upgrade' : undefined,
        isClaimed: false, // Would be loaded from user data
        isAvailable: day <= currentDay,
        isBonusDay
      });
    }
    
    setDailyRewards(rewards);
  };

  const loadSocialTasks = () => {
    const tasks: SocialTask[] = [
      {
        id: 'follow-facebook',
        type: 'follow',
        platform: 'facebook',
        title: 'Follow us on Facebook',
        description: 'Follow our Facebook page for updates and exclusive content',
        gcReward: 500,
        scReward: 5,
        url: 'https://facebook.com/coinfrazy',
        isCompleted: false,
        isAvailable: true,
        difficulty: 'easy',
        category: 'social'
      },
      {
        id: 'share-twitter',
        type: 'share',
        platform: 'twitter',
        title: 'Share on Twitter',
        description: 'Share your latest win on Twitter with #CoinFrazy',
        gcReward: 300,
        scReward: 3,
        isCompleted: false,
        isAvailable: true,
        difficulty: 'easy',
        category: 'social'
      },
      {
        id: 'refer-friends',
        type: 'refer',
        platform: 'generic',
        title: 'Refer 3 Friends',
        description: 'Invite 3 friends to join CoinFrazy and get rewards',
        gcReward: 2000,
        scReward: 20,
        isCompleted: false,
        isAvailable: true,
        difficulty: 'hard',
        category: 'referral'
      },
      {
        id: 'instagram-like',
        type: 'like',
        platform: 'instagram',
        title: 'Like our Instagram posts',
        description: 'Like our latest 5 Instagram posts',
        gcReward: 250,
        scReward: 2.5,
        url: 'https://instagram.com/coinfrazy',
        isCompleted: false,
        isAvailable: true,
        difficulty: 'easy',
        category: 'engagement'
      },
      {
        id: 'youtube-subscribe',
        type: 'follow',
        platform: 'youtube',
        title: 'Subscribe to our YouTube',
        description: 'Subscribe to our YouTube channel for tutorials and tips',
        gcReward: 750,
        scReward: 7.5,
        url: 'https://youtube.com/coinfrazy',
        isCompleted: false,
        isAvailable: true,
        difficulty: 'easy',
        category: 'social'
      },
      {
        id: 'write-review',
        type: 'review',
        platform: 'generic',
        title: 'Write a Review',
        description: 'Write a review about your CoinFrazy experience',
        gcReward: 1000,
        scReward: 10,
        isCompleted: false,
        isAvailable: true,
        difficulty: 'medium',
        category: 'feedback',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },
      {
        id: 'complete-survey',
        type: 'survey',
        platform: 'generic',
        title: 'Complete User Survey',
        description: 'Help us improve by completing our 5-minute survey',
        gcReward: 600,
        scReward: 6,
        isCompleted: false,
        isAvailable: true,
        difficulty: 'medium',
        category: 'feedback'
      }
    ];
    
    setSocialTasks(tasks);
  };

  const loadReferrals = () => {
    if (!user?.id) return;
    
    try {
      const savedReferrals = localStorage.getItem(`referrals_${user.id}`);
      if (savedReferrals) {
        const referrals = JSON.parse(savedReferrals).map((ref: any) => ({
          ...ref,
          referredAt: new Date(ref.referredAt)
        }));
        setReferrals(referrals);
      }
    } catch (error) {
      console.error('Failed to load referrals:', error);
    }
  };

  const loadMilestones = () => {
    const milestones: Milestone[] = [
      {
        id: 'streak-7',
        type: 'streak',
        title: '7-Day Streak',
        description: 'Log in for 7 consecutive days',
        requirement: 7,
        gcReward: 1000,
        scReward: 10,
        badgeIcon: '🔥',
        isCompleted: false,
        progress: userProgress?.currentStreak || 0
      },
      {
        id: 'streak-30',
        type: 'streak',
        title: '30-Day Streak',
        description: 'Log in for 30 consecutive days',
        requirement: 30,
        gcReward: 5000,
        scReward: 50,
        badgeIcon: '🏆',
        isCompleted: false,
        progress: userProgress?.currentStreak || 0
      },
      {
        id: 'social-points-100',
        type: 'social',
        title: 'Social Butterfly',
        description: 'Earn 100 social points',
        requirement: 100,
        gcReward: 2000,
        scReward: 20,
        badgeIcon: '🦋',
        isCompleted: false,
        progress: userProgress?.socialPoints || 0
      },
      {
        id: 'referrals-10',
        type: 'referral',
        title: 'Referral Master',
        description: 'Successfully refer 10 friends',
        requirement: 10,
        gcReward: 10000,
        scReward: 100,
        badgeIcon: '👑',
        isCompleted: false,
        progress: userProgress?.totalReferrals || 0
      },
      {
        id: 'total-logins-100',
        type: 'total_logins',
        title: 'Loyal Player',
        description: 'Log in 100 total days',
        requirement: 100,
        gcReward: 7500,
        scReward: 75,
        badgeIcon: '💎',
        isCompleted: false,
        progress: userProgress?.totalDaysLogged || 0
      }
    ];
    
    setMilestones(milestones);
  };

  const generateReferralCode = (): string => {
    return `CF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  };

  const saveUserProgress = (progress: UserProgress) => {
    if (!user?.id) return;
    localStorage.setItem(`social_progress_${user.id}`, JSON.stringify(progress));
  };

  const checkDailyLoginEligibility = () => {
    if (!userProgress) return;
    
    const today = new Date();
    const lastLogin = userProgress.lastLoginDate;
    
    if (!lastLogin || !isSameDay(today, lastLogin)) {
      // User can claim daily reward
      const daysSinceLastLogin = lastLogin ? 
        Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      if (daysSinceLastLogin === 1) {
        // Consecutive day - increase streak
        userProgress.currentStreak += 1;
      } else if (daysSinceLastLogin > 1) {
        // Streak broken
        userProgress.currentStreak = 1;
      } else {
        // First login
        userProgress.currentStreak = 1;
      }
      
      userProgress.longestStreak = Math.max(userProgress.longestStreak, userProgress.currentStreak);
      userProgress.totalDaysLogged += 1;
      userProgress.lastLoginDate = today;
      
      setUserProgress({ ...userProgress });
      saveUserProgress(userProgress);
      
      // Show daily login popup
      showDailyLoginReward();
    }
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const showDailyLoginReward = () => {
    if (!userProgress) return;
    
    const baseReward = { GC: 100, SC: 1 };
    const streakMultiplier = Math.min(userProgress.currentStreak, 7);
    const gcReward = baseReward.GC * streakMultiplier;
    const scReward = baseReward.SC * streakMultiplier;
    
    claimDailyReward(gcReward, scReward);
  };

  const claimDailyReward = async (gcAmount: number, scAmount: number) => {
    if (!user?.id) return;
    
    try {
      await walletService.updateBalance(
        user.id,
        gcAmount,
        scAmount,
        `Daily Login Reward - Day ${userProgress?.currentStreak}`,
        undefined,
        'bonus'
      );
      
      await loadWallet();
      
      toast({
        title: "Daily Login Bonus! 🎉",
        description: `You earned ${gcAmount} GC and ${scAmount} SC! Current streak: ${userProgress?.currentStreak} days`,
      });
      
    } catch (error) {
      console.error('Failed to claim daily reward:', error);
    }
  };

  const completeSocialTask = async (task: SocialTask) => {
    if (!user?.id || !userProgress) return;
    
    try {
      // Award task rewards
      await walletService.updateBalance(
        user.id,
        task.gcReward,
        task.scReward,
        `Social Task: ${task.title}`,
        undefined,
        'social'
      );
      
      // Update user progress
      const updatedProgress = {
        ...userProgress,
        socialPoints: userProgress.socialPoints + (task.difficulty === 'easy' ? 1 : task.difficulty === 'medium' ? 3 : 5),
        completedTasks: [...userProgress.completedTasks, task.id]
      };
      
      setUserProgress(updatedProgress);
      saveUserProgress(updatedProgress);
      
      // Mark task as completed
      setSocialTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, isCompleted: true } : t
      ));
      
      await loadWallet();
      
      toast({
        title: "Task Completed! ✅",
        description: `You earned ${task.gcReward} GC and ${task.scReward} SC for ${task.title}`,
      });
      
    } catch (error) {
      console.error('Failed to complete social task:', error);
    }
  };

  const sendReferral = async () => {
    if (!referralEmail || !user?.id || !userProgress) return;
    
    try {
      const newReferral: Referral = {
        id: `ref_${Date.now()}`,
        referredEmail: referralEmail,
        referredAt: new Date(),
        status: 'pending',
        bonusEarned: { GC: 0, SC: 0 }
      };
      
      const updatedReferrals = [...referrals, newReferral];
      setReferrals(updatedReferrals);
      localStorage.setItem(`referrals_${user.id}`, JSON.stringify(updatedReferrals));
      
      // In production, this would send an actual email
      toast({
        title: "Referral Sent! 📧",
        description: `Invitation sent to ${referralEmail}. You'll earn rewards when they join!`,
      });
      
      setReferralEmail('');
      setShowReferralDialog(false);
      
    } catch (error) {
      console.error('Failed to send referral:', error);
    }
  };

  const copyReferralCode = () => {
    if (userProgress?.referralCode) {
      navigator.clipboard.writeText(userProgress.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const openSocialLink = (task: SocialTask) => {
    if (task.url) {
      window.open(task.url, '_blank');
    }
    
    // Auto-complete easy tasks when link is opened
    if (task.difficulty === 'easy' && !task.isCompleted) {
      setTimeout(() => {
        completeSocialTask(task);
      }, 3000); // 3 second delay
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'youtube': return <Youtube className="w-4 h-4 text-red-600" />;
      case 'email': return <Mail className="w-4 h-4 text-gray-600" />;
      default: return <Share2 className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RotateCcw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Social Rewards
            </h1>
            <p className="text-muted-foreground">
              Earn daily bonuses, complete social tasks, and refer friends for amazing rewards!
            </p>
          </div>
          
          {userProgress && (
            <Card className="px-6 py-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{userProgress.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">{userProgress.socialPoints}</div>
                  <div className="text-sm text-muted-foreground">Social Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{userProgress.totalReferrals}</div>
                  <div className="text-sm text-muted-foreground">Referrals</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Daily Rewards
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Social Tasks
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Milestones
          </TabsTrigger>
        </TabsList>

        {/* Daily Rewards */}
        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Login Calendar
                {userProgress && (
                  <Badge className="bg-orange-600">
                    <Flame className="w-3 h-3 mr-1" />
                    {userProgress.currentStreak} Day Streak
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 md:grid-cols-10 gap-3">
                {dailyRewards.map(reward => (
                  <Card 
                    key={reward.day} 
                    className={`
                      relative cursor-pointer transition-all duration-200 hover:scale-105
                      ${reward.isClaimed ? 'bg-green-500/20 border-green-500' : ''}
                      ${reward.isBonusDay ? 'ring-2 ring-gold-500' : ''}
                      ${!reward.isAvailable ? 'opacity-50' : ''}
                    `}
                  >
                    <CardContent className="p-3 text-center">
                      {reward.isBonusDay && (
                        <Crown className="w-4 h-4 text-gold-500 mx-auto mb-1" />
                      )}
                      <div className="font-bold text-lg mb-1">Day {reward.day}</div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <Coins className="w-3 h-3 text-yellow-500" />
                          {reward.gcReward}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Gem className="w-3 h-3 text-purple-500" />
                          {reward.scReward.toFixed(1)}
                        </div>
                      </div>
                      {reward.specialReward && (
                        <Badge className="mt-1 text-xs bg-gold-600 text-black">
                          {reward.specialReward}
                        </Badge>
                      )}
                      {reward.isClaimed && (
                        <CheckCircle className="w-5 h-5 text-green-500 absolute top-1 right-1" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Login daily to maintain your streak!</strong> Bonus days (every 7th day) give double rewards. 
                  Missing a day will reset your streak but you can always start again.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tasks */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialTasks.map(task => (
              <Card 
                key={task.id} 
                className={`
                  transition-all duration-200 hover:shadow-lg
                  ${task.isCompleted ? 'bg-green-500/10 border-green-500' : 'hover:scale-105 cursor-pointer'}
                `}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getPlatformIcon(task.platform)}
                      <div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                          {task.difficulty.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {task.isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        {task.gcReward} GC
                      </div>
                      <div className="flex items-center gap-1">
                        <Gem className="w-4 h-4 text-purple-500" />
                        {task.scReward} SC
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                  </div>
                  
                  {task.expiresAt && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Clock className="w-3 h-3" />
                      Expires: {task.expiresAt.toLocaleDateString()}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    disabled={task.isCompleted || !task.isAvailable}
                    onClick={() => task.url ? openSocialLink(task) : completeSocialTask(task)}
                  >
                    {task.isCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : task.url ? (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open & Complete
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Complete Task
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Referrals */}
        <TabsContent value="referrals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Invite Friends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Referral Code</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={userProgress?.referralCode || ''} 
                      readOnly 
                      className="font-mono"
                    />
                    <Button variant="outline" onClick={copyReferralCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => setShowReferralDialog(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{userProgress?.totalReferrals || 0}</div>
                    <div className="text-xs text-muted-foreground">Successful Referrals</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{referrals.length}</div>
                    <div className="text-xs text-muted-foreground">Total Invitations</div>
                  </div>
                </div>
                
                <Alert>
                  <Gift className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Referral Rewards:</strong> Earn 1000 GC + 10 SC for each friend who joins and makes their first deposit!
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Referral History */}
            <Card>
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {referrals.length > 0 ? (
                    <div className="space-y-3">
                      {referrals.map(referral => (
                        <div key={referral.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{referral.referredEmail}</div>
                            <div className="text-xs text-muted-foreground">
                              {referral.referredAt.toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant={
                            referral.status === 'active' ? 'default' :
                            referral.status === 'verified' ? 'secondary' : 'outline'
                          }>
                            {referral.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p>No referrals yet</p>
                      <p className="text-xs">Start inviting friends to earn rewards!</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Milestones */}
        <TabsContent value="milestones" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map(milestone => (
              <Card 
                key={milestone.id} 
                className={`
                  transition-all duration-200
                  ${milestone.isCompleted ? 'bg-green-500/10 border-green-500' : ''}
                `}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{milestone.badgeIcon}</div>
                      <div>
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {milestone.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {milestone.isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{milestone.progress}/{milestone.requirement}</span>
                    </div>
                    <Progress 
                      value={(milestone.progress / milestone.requirement) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        {milestone.gcReward} GC
                      </div>
                      <div className="flex items-center gap-1">
                        <Gem className="w-4 h-4 text-purple-500" />
                        {milestone.scReward} SC
                      </div>
                    </div>
                  </div>
                  
                  {milestone.isCompleted && (
                    <Badge className="w-full justify-center bg-green-600">
                      <Award className="w-4 h-4 mr-2" />
                      Milestone Achieved!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Referral Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a Friend</DialogTitle>
            <DialogDescription>
              Send an invitation to your friend and earn rewards when they join!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Friend's Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
              />
            </div>
            
            <Alert>
              <Gift className="h-4 w-4" />
              <AlertDescription>
                Your friend will receive a welcome bonus, and you'll earn 1000 GC + 10 SC when they make their first deposit!
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowReferralDialog(false)}>
              Cancel
            </Button>
            <Button onClick={sendReferral} disabled={!referralEmail}>
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
