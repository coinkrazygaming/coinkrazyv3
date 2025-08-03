import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2,
  Users,
  TrendingUp,
  Video,
  Camera,
  Mic,
  Edit,
  Send,
  Calendar,
  Target,
  BarChart3,
  Bot,
  Sparkles,
  Play,
  Pause,
  Download,
  Upload,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
  Star,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  Plus,
  Settings,
  Globe,
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  FileText,
  Image,
  Palette,
  Wand2,
  BrainCircuit,
  Monitor,
  Smartphone
} from 'lucide-react';

interface SocialMediaPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin';
  content: string;
  media: Array<{ type: 'image' | 'video'; url: string; thumbnail?: string }>;
  hashtags: string[];
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    reach: number;
  };
  aiGenerated: boolean;
  campaign?: string;
  createdAt: Date;
}

interface Lead {
  id: string;
  source: string;
  platform: string;
  type: 'comment' | 'dm' | 'mention' | 'click' | 'signup';
  content: string;
  userData: {
    username: string;
    followers: number;
    verified: boolean;
    location?: string;
  };
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  aiScore: number;
  tags: string[];
  createdAt: Date;
  followUpDate?: Date;
}

interface VideoGenerationRequest {
  id: string;
  userId: string;
  userName: string;
  winAmount?: number;
  gameType?: string;
  opinion?: string;
  style: 'celebration' | 'testimonial' | 'gameplay' | 'promotional';
  duration: 15 | 30 | 60;
  status: 'pending' | 'generating' | 'review' | 'approved' | 'rejected' | 'published';
  videoUrl?: string;
  thumbnailUrl?: string;
  script: string;
  music: string;
  effects: string[];
  createdAt: Date;
  reviewNotes?: string;
}

interface Campaign {
  id: string;
  name: string;
  objective: 'awareness' | 'engagement' | 'conversion' | 'retention';
  platforms: string[];
  budget: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'paused' | 'completed' | 'draft';
  targetAudience: {
    ageRange: [number, number];
    interests: string[];
    locations: string[];
    demographics: string[];
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    roi: number;
  };
}

export default function JoseyAI() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [videoRequests, setVideoRequests] = useState<VideoGenerationRequest[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);

  useEffect(() => {
    loadSocialMediaData();
    const interval = setInterval(loadSocialMediaData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSocialMediaData = async () => {
    // Simulate API calls for social media data
    const mockPosts: SocialMediaPost[] = [
      {
        id: 'post_001',
        platform: 'instagram',
        content: '🎰 Big Win Alert! 🪙 Check out this amazing jackpot hit on CoinKrazy Spinner! Who\'s ready to spin their way to gold? #CoinKrazy #BigWin #Jackpot #OnlineCasino',
        media: [{ type: 'video', url: '/videos/big-win.mp4', thumbnail: '/images/big-win-thumb.jpg' }],
        hashtags: ['#CoinKrazy', '#BigWin', '#Jackpot', '#OnlineCasino', '#SlotMachine'],
        scheduledDate: new Date('2024-03-20T18:00:00'),
        status: 'published',
        engagement: { likes: 2847, comments: 156, shares: 89, views: 15634, reach: 45231 },
        aiGenerated: true,
        campaign: 'big-wins-march',
        createdAt: new Date('2024-03-20T12:00:00')
      },
      {
        id: 'post_002',
        platform: 'facebook',
        content: '🍀 Lucky Tuesday at CoinKrazy! 🍀 New players get 100,000 Gold Coins + 50 Sweeps Coins FREE! Start your winning journey today! Link in bio 👆',
        media: [{ type: 'image', url: '/images/lucky-tuesday.jpg' }],
        hashtags: ['#LuckyTuesday', '#CoinKrazy', '#FreeCoins', '#NewPlayer', '#Bonus'],
        scheduledDate: new Date('2024-03-19T14:00:00'),
        status: 'published',
        engagement: { likes: 1234, comments: 78, shares: 145, views: 8934, reach: 23456 },
        aiGenerated: false,
        campaign: 'weekly-promotions',
        createdAt: new Date('2024-03-19T10:00:00')
      },
      {
        id: 'post_003',
        platform: 'twitter',
        content: '⚡ FLASH PROMO ALERT! ⚡ Double your first deposit at CoinKrazy! More coins = More chances to win BIG! 🚀 #DoubleUp #CoinKrazy #FlashPromo',
        media: [],
        hashtags: ['#DoubleUp', '#CoinKrazy', '#FlashPromo', '#MoreCoins', '#BigWins'],
        scheduledDate: new Date('2024-03-21T10:00:00'),
        status: 'scheduled',
        engagement: { likes: 0, comments: 0, shares: 0, views: 0, reach: 0 },
        aiGenerated: true,
        campaign: 'flash-promotions',
        createdAt: new Date('2024-03-20T16:00:00')
      }
    ];

    const mockLeads: Lead[] = [
      {
        id: 'lead_001',
        source: 'Instagram Post',
        platform: 'instagram',
        type: 'comment',
        content: 'How do I get started? This looks amazing!',
        userData: {
          username: 'casino_lover_2024',
          followers: 1234,
          verified: false,
          location: 'Las Vegas, NV'
        },
        status: 'new',
        aiScore: 85,
        tags: ['high-intent', 'new-player', 'interested'],
        createdAt: new Date('2024-03-20T15:30:00'),
        followUpDate: new Date('2024-03-20T18:00:00')
      },
      {
        id: 'lead_002',
        source: 'Facebook Ad',
        platform: 'facebook',
        type: 'click',
        content: 'Clicked on Lucky Tuesday promotion',
        userData: {
          username: 'lucky_spinner',
          followers: 567,
          verified: false,
          location: 'New York, NY'
        },
        status: 'contacted',
        aiScore: 72,
        tags: ['promo-interested', 'bonus-seeker'],
        createdAt: new Date('2024-03-19T16:45:00')
      },
      {
        id: 'lead_003',
        source: 'YouTube Video',
        platform: 'youtube',
        type: 'comment',
        content: 'What game is this? I want to try it!',
        userData: {
          username: 'slot_enthusiast',
          followers: 2890,
          verified: true,
          location: 'California, USA'
        },
        status: 'qualified',
        aiScore: 92,
        tags: ['influencer', 'high-value', 'content-creator'],
        createdAt: new Date('2024-03-18T20:15:00')
      }
    ];

    const mockVideoRequests: VideoGenerationRequest[] = [
      {
        id: 'video_001',
        userId: 'user_123',
        userName: 'jackpot_jenny',
        winAmount: 2500.00,
        gameType: 'CoinKrazy Spinner',
        style: 'celebration',
        duration: 30,
        status: 'review',
        videoUrl: '/videos/jenny-win.mp4',
        thumbnailUrl: '/videos/jenny-win-thumb.jpg',
        script: 'OMG! I just hit a $2,500 jackpot on CoinKrazy Spinner! The reels aligned perfectly and I couldn\'t believe my eyes! CoinKrazy really delivers on those big wins!',
        music: 'celebration-upbeat.mp3',
        effects: ['confetti', 'gold-coins', 'sparkles'],
        createdAt: new Date('2024-03-20T14:00:00'),
        reviewNotes: 'Great authentic reaction, ready for approval'
      },
      {
        id: 'video_002',
        userId: 'user_456',
        userName: 'scratch_master',
        opinion: 'CoinKrazy has the best scratch cards online!',
        style: 'testimonial',
        duration: 30,
        status: 'generating',
        script: 'As someone who\'s tried every scratch card game out there, I can honestly say CoinKrazy has the best selection and fairest odds. The graphics are amazing!',
        music: 'testimonial-ambient.mp3',
        effects: ['smooth-transitions', 'text-overlay'],
        createdAt: new Date('2024-03-20T16:30:00')
      }
    ];

    const mockCampaigns: Campaign[] = [
      {
        id: 'campaign_001',
        name: 'March Big Wins',
        objective: 'engagement',
        platforms: ['instagram', 'facebook', 'twitter'],
        budget: 5000,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        status: 'active',
        targetAudience: {
          ageRange: [25, 55],
          interests: ['gambling', 'casino games', 'slots', 'entertainment'],
          locations: ['United States', 'Canada'],
          demographics: ['disposable income', 'tech-savvy']
        },
        performance: {
          impressions: 456789,
          clicks: 12345,
          conversions: 567,
          cost: 3245.67,
          roi: 2.8
        }
      },
      {
        id: 'campaign_002',
        name: 'New Player Acquisition',
        objective: 'conversion',
        platforms: ['facebook', 'youtube'],
        budget: 8000,
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-04-15'),
        status: 'active',
        targetAudience: {
          ageRange: [21, 65],
          interests: ['online gaming', 'mobile games', 'casino'],
          locations: ['United States'],
          demographics: ['new-to-online-casino']
        },
        performance: {
          impressions: 234567,
          clicks: 8901,
          conversions: 345,
          cost: 2156.78,
          roi: 3.2
        }
      }
    ];

    setPosts(mockPosts);
    setLeads(mockLeads);
    setVideoRequests(mockVideoRequests);
    setCampaigns(mockCampaigns);
  };

  const generateAIPost = async (platform: string, topic: string) => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const aiPosts = {
      'big-win': [
        '🎰 JACKPOT ALERT! 🪙 Another lucky player just hit it BIG on CoinKrazy! Could you be next? Spin to win! #BigWin #Jackpot #CoinKrazy',
        '💰 WOW! Check out this incredible win! 💰 Our players are on fire! Ready to try your luck? #LuckyWin #CoinKrazy #OnlineCasino',
        '🔥 MEGA WIN! 🔥 The slots are paying out TODAY! Don\'t miss your chance to win big at CoinKrazy! #MegaWin #Slots #Lucky'
      ],
      'promotion': [
        '🎁 SPECIAL OFFER! 🎁 New players get 100K Gold Coins + 50 Sweeps Coins FREE! Start winning today! #FreeCoins #NewPlayer #CoinKrazy',
        '⚡ FLASH SALE! ⚡ Double your deposit for the next 24 hours only! More coins = More chances to win! #FlashSale #DoubleCoins',
        '🍀 Lucky Wednesday! 🍀 All players get bonus coins today! Log in now to claim yours! #LuckyDay #BonusCoins #CoinKrazy'
      ],
      'game-feature': [
        '🎮 NEW GAME ALERT! 🎮 Try our latest slot machine with 25 paylines and progressive jackpots! #NewGame #Slots #CoinKrazy',
        '🃏 Scratch card lovers rejoice! 🃏 Our new Lucky Scratch Gold offers instant wins up to $10,000! #ScratchCards #InstantWin',
        '🎯 Daily challenges are here! 🎯 Complete missions and earn exclusive rewards! #DailyChallenge #Rewards #Gaming'
      ]
    };

    const posts = aiPosts[topic as keyof typeof aiPosts] || aiPosts['promotion'];
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    
    const newPost: SocialMediaPost = {
      id: `post_${Date.now()}`,
      platform: platform as any,
      content: randomPost,
      media: [],
      hashtags: randomPost.match(/#\w+/g) || [],
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'draft',
      engagement: { likes: 0, comments: 0, shares: 0, views: 0, reach: 0 },
      aiGenerated: true,
      createdAt: new Date()
    };

    setPosts(prev => [newPost, ...prev]);
    setIsGenerating(false);
  };

  const approveVideoRequest = (requestId: string) => {
    setVideoRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const }
          : req
      )
    );
  };

  const rejectVideoRequest = (requestId: string, notes: string) => {
    setVideoRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const, reviewNotes: notes }
          : req
      )
    );
  };

  const updateLeadStatus = (leadId: string, status: Lead['status']) => {
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status }
          : lead
      )
    );
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      facebook: <Facebook className="w-4 h-4 text-blue-600" />,
      instagram: <Instagram className="w-4 h-4 text-pink-500" />,
      twitter: <Twitter className="w-4 h-4 text-blue-400" />,
      youtube: <Youtube className="w-4 h-4 text-red-500" />,
      linkedin: <Linkedin className="w-4 h-4 text-blue-700" />
    };
    return icons[platform as keyof typeof icons] || <Globe className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      published: 'bg-green-500',
      scheduled: 'bg-blue-500',
      draft: 'bg-gray-500',
      failed: 'bg-red-500',
      active: 'bg-green-500',
      paused: 'bg-yellow-500',
      completed: 'bg-blue-500',
      new: 'bg-yellow-500',
      contacted: 'bg-blue-500',
      qualified: 'bg-green-500',
      converted: 'bg-purple-500',
      lost: 'bg-red-500',
      pending: 'bg-yellow-500',
      generating: 'bg-blue-500',
      review: 'bg-orange-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            JoseyAI - Social Media Manager
            <Badge className="bg-pink-500 text-white">AI-Powered</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Automated social media management, lead generation, and AI-powered content creation
          </p>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <Share2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold text-green-500">{leads.filter(l => l.status === 'new').length}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Video Requests</p>
                <p className="text-2xl font-bold text-purple-500">{videoRequests.filter(v => v.status === 'review').length}</p>
              </div>
              <Video className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-orange-500">{campaigns.filter(c => c.status === 'active').length}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Engagement</p>
                <p className="text-2xl font-bold text-pink-500">
                  {formatNumber(posts.reduce((sum, post) => sum + post.engagement.likes + post.engagement.comments + post.engagement.shares, 0))}
                </p>
              </div>
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="posts">
            <Share2 className="w-4 h-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Users className="w-4 h-4 mr-2" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="w-4 h-4 mr-2" />
            AI Videos
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Target className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="ai-tools">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Tools
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(post.platform)}
                        <div>
                          <div className="font-medium line-clamp-1">{post.content.slice(0, 50)}...</div>
                          <div className="text-sm text-muted-foreground">
                            {post.engagement.likes} likes • {post.engagement.comments} comments
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High-Value Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.filter(l => l.aiScore > 80).slice(0, 3).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <div className="font-medium">{lead.userData.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {lead.platform} • AI Score: {lead.aiScore}% • {formatNumber(lead.userData.followers)} followers
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600">High Value</Badge>
                        <Button size="sm" variant="outline">Contact</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaigns.filter(c => c.status === 'active').map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Impressions:</span>
                          <div className="font-bold">{formatNumber(campaign.performance.impressions)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clicks:</span>
                          <div className="font-bold">{formatNumber(campaign.performance.clicks)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Conversions:</span>
                          <div className="font-bold text-green-500">{campaign.performance.conversions}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ROI:</span>
                          <div className="font-bold text-purple-500">{campaign.performance.roi.toFixed(1)}x</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Social Media Posts</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="draft">Draft</option>
                  </select>
                  <Button className="bg-pink-500 hover:bg-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(post.platform)}
                          <span className="font-medium capitalize">{post.platform}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {post.aiGenerated && <Bot className="w-4 h-4 text-purple-500" />}
                          <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm line-clamp-3 mb-3">{post.content}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.hashtags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.hashtags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      {post.status === 'published' && (
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(post.engagement.likes)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {formatNumber(post.engagement.comments)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Repeat2 className="w-3 h-3" />
                            {formatNumber(post.engagement.shares)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(post.engagement.views)}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Lead</th>
                      <th className="text-left p-3">Source</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">AI Score</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-muted/20">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{lead.userData.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatNumber(lead.userData.followers)} followers
                              {lead.userData.verified && <Badge className="ml-1 text-xs bg-blue-500">✓</Badge>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(lead.platform)}
                            <span className="text-sm">{lead.source}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="capitalize">{lead.type}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${lead.aiScore > 80 ? 'text-green-500' : lead.aiScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {lead.aiScore}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${lead.aiScore > 80 ? 'bg-green-500' : lead.aiScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${lead.aiScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {lead.createdAt.toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateLeadStatus(lead.id, 'contacted')}
                              disabled={lead.status !== 'new'}
                            >
                              <Send className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Videos Tab */}
        <TabsContent value="videos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Video Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoRequests.map((request) => (
                  <Card key={request.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium">{request.userName}</div>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </div>
                      
                      {request.thumbnailUrl && (
                        <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Style:</span>
                          <span className="ml-1 capitalize">{request.style}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="ml-1">{request.duration}s</span>
                        </div>
                        {request.winAmount && (
                          <div>
                            <span className="text-muted-foreground">Win Amount:</span>
                            <span className="ml-1 font-bold text-green-500">{formatCurrency(request.winAmount)}</span>
                          </div>
                        )}
                        {request.gameType && (
                          <div>
                            <span className="text-muted-foreground">Game:</span>
                            <span className="ml-1">{request.gameType}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 p-2 bg-muted/20 rounded text-xs">
                        <strong>Script:</strong> {request.script.slice(0, 100)}...
                      </div>
                      
                      {request.status === 'review' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            onClick={() => approveVideoRequest(request.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-red-500 border-red-500"
                            onClick={() => rejectVideoRequest(request.id, 'Needs revision')}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {request.status === 'approved' && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-1">
                            <Share2 className="w-3 h-3 mr-1" />
                            Publish
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Marketing Campaigns</CardTitle>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {campaign.objective} • {campaign.platforms.join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Budget:</span>
                          <div className="font-bold">{formatCurrency(campaign.budget)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Spent:</span>
                          <div className="font-bold">{formatCurrency(campaign.performance.cost)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Impressions:</span>
                          <div className="font-bold">{formatNumber(campaign.performance.impressions)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clicks:</span>
                          <div className="font-bold">{formatNumber(campaign.performance.clicks)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Conversions:</span>
                          <div className="font-bold text-green-500">{campaign.performance.conversions}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ROI:</span>
                          <div className="font-bold text-purple-500">{campaign.performance.roi.toFixed(1)}x</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Analytics
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          {campaign.status === 'active' ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                          {campaign.status === 'active' ? 'Pause' : 'Resume'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="ai-tools" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-500" />
                  AI Post Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Topic</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option value="big-win">Big Win</option>
                    <option value="promotion">Promotion</option>
                    <option value="game-feature">Game Feature</option>
                  </select>
                </div>
                <Button 
                  onClick={() => generateAIPost('instagram', 'big-win')}
                  disabled={isGenerating}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  {isGenerating ? <BrainCircuit className="w-4 h-4 mr-2 animate-pulse" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate Post
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-500" />
                  AI Video Creator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Create AI Videos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate promotional videos from user wins and testimonials
                  </p>
                  <Button className="bg-red-500 hover:bg-red-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Creating
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Smart Targeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <BrainCircuit className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold mb-2">AI Audience Targeting</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Optimize your campaigns with AI-powered audience insights
                  </p>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Audience
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
