import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle,
  Send,
  Settings,
  Users,
  Shield,
  Bot,
  Crown,
  Star,
  Heart,
  Volume2,
  VolumeX,
  Pin,
  Flag,
  Ban,
  UserX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2,
  Lock,
  Unlock,
  Zap,
  Gift,
  Trophy,
  Coins,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Hash,
  User,
  Smile,
  Image,
  Paperclip,
  MoreHorizontal
} from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  userRole: 'admin' | 'vip' | 'moderator' | 'user' | 'ai';
  content: string;
  timestamp: Date;
  type: 'message' | 'system' | 'win' | 'bonus' | 'warning' | 'ban';
  isDeleted: boolean;
  isEdited: boolean;
  replyTo?: string;
  reactions: Array<{ emoji: string; count: number; users: string[] }>;
  attachments?: Array<{ type: 'image' | 'gif'; url: string }>;
  winAmount?: number;
  gameType?: string;
}

interface ChatUser {
  id: string;
  username: string;
  role: 'admin' | 'vip' | 'moderator' | 'user' | 'ai';
  isOnline: boolean;
  lastSeen: Date;
  isTyping: boolean;
  isMuted: boolean;
  isBanned: boolean;
  level: number;
  coinBalance: number;
  avatar?: string;
  badges: string[];
  joinedAt: Date;
}

interface ModerationAction {
  id: string;
  type: 'warn' | 'mute' | 'ban' | 'delete' | 'spam_detection';
  userId: string;
  username: string;
  reason: string;
  duration?: number;
  messageId?: string;
  moderatorId: string;
  moderatorName: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface AdminAlert {
  id: string;
  type: 'spam_detected' | 'promotional_content' | 'inappropriate_content' | 'mass_reporting' | 'ai_flagged';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  username: string;
  content: string;
  messageId: string;
  aiConfidence: number;
  suggestedAction: 'warn' | 'mute' | 'ban' | 'delete' | 'review';
  timestamp: Date;
  isResolved: boolean;
  adminResponse?: string;
  actions?: Array<{ label: string; action: string; variant: 'default' | 'destructive' | 'secondary' }>;
}

export default function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationAction[]>([]);
  const [adminAlerts, setAdminAlerts] = useState<AdminAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Simulated admin status
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const channels = [
    { id: 'general', name: 'General', icon: Hash, description: 'General discussion' },
    { id: 'wins', name: 'Big Wins', icon: Trophy, description: 'Share your victories' },
    { id: 'help', name: 'Help', icon: Heart, description: 'Get assistance' },
    { id: 'vip', name: 'VIP Lounge', icon: Crown, description: 'VIP members only' }
  ];

  useEffect(() => {
    loadChatData();
    const interval = setInterval(simulateRealTimeUpdates, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = () => {
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg_001',
        userId: 'luckyai',
        username: 'LuckyAI',
        userRole: 'ai',
        content: 'Welcome to CoinKrazy Global Chat! 🎰 I\'m your AI moderator. Please keep the conversation casino-related and respectful. Good luck and have fun! 🍀',
        timestamp: new Date(Date.now() - 1800000),
        type: 'system',
        isDeleted: false,
        isEdited: false,
        reactions: [{ emoji: '👋', count: 12, users: [] }]
      },
      {
        id: 'msg_002',
        userId: 'user_001',
        username: 'SlotMaster99',
        userRole: 'vip',
        content: 'Just hit a massive jackpot on CoinKrazy Spinner! 🪙💰',
        timestamp: new Date(Date.now() - 1200000),
        type: 'win',
        isDeleted: false,
        isEdited: false,
        reactions: [
          { emoji: '🎉', count: 8, users: [] },
          { emoji: '💰', count: 15, users: [] },
          { emoji: '🔥', count: 6, users: [] }
        ],
        winAmount: 5000.00,
        gameType: 'CoinKrazy Spinner'
      },
      {
        id: 'msg_003',
        userId: 'user_002',
        username: 'LuckyLady777',
        userRole: 'user',
        content: 'Congratulations! That\'s an amazing win! 🎊 What was your bet amount?',
        timestamp: new Date(Date.now() - 1100000),
        type: 'message',
        isDeleted: false,
        isEdited: false,
        replyTo: 'msg_002',
        reactions: [{ emoji: '❤️', count: 3, users: [] }]
      },
      {
        id: 'msg_004',
        userId: 'luckyai',
        username: 'LuckyAI',
        userRole: 'ai',
        content: '🚨 Reminder: Please keep discussions related to CoinKrazy games and features. External casino promotions are not allowed. Thank you! 🤖',
        timestamp: new Date(Date.now() - 600000),
        type: 'warning',
        isDeleted: false,
        isEdited: false,
        reactions: [{ emoji: '👍', count: 5, users: [] }]
      },
      {
        id: 'msg_005',
        userId: 'user_003',
        username: 'BingoFan2024',
        userRole: 'user',
        content: 'Love the new scratch cards! The Lucky Scratch Gold is so addictive! 🎯',
        timestamp: new Date(Date.now() - 300000),
        type: 'message',
        isDeleted: false,
        isEdited: false,
        reactions: [{ emoji: '🎯', count: 4, users: [] }]
      }
    ];

    const mockUsers: ChatUser[] = [
      {
        id: 'luckyai',
        username: 'LuckyAI',
        role: 'ai',
        isOnline: true,
        lastSeen: new Date(),
        isTyping: false,
        isMuted: false,
        isBanned: false,
        level: 100,
        coinBalance: 0,
        badges: ['AI Moderator', 'Guardian'],
        joinedAt: new Date('2024-01-01')
      },
      {
        id: 'user_001',
        username: 'SlotMaster99',
        role: 'vip',
        isOnline: true,
        lastSeen: new Date(),
        isTyping: false,
        isMuted: false,
        isBanned: false,
        level: 45,
        coinBalance: 250000,
        badges: ['VIP', 'High Roller', 'Jackpot Winner'],
        joinedAt: new Date('2024-01-15')
      },
      {
        id: 'user_002',
        username: 'LuckyLady777',
        role: 'user',
        isOnline: true,
        lastSeen: new Date(Date.now() - 300000),
        isTyping: true,
        isMuted: false,
        isBanned: false,
        level: 23,
        coinBalance: 85000,
        badges: ['Lucky Streak'],
        joinedAt: new Date('2024-02-01')
      },
      {
        id: 'user_003',
        username: 'BingoFan2024',
        role: 'user',
        isOnline: true,
        lastSeen: new Date(Date.now() - 120000),
        isTyping: false,
        isMuted: false,
        isBanned: false,
        level: 18,
        coinBalance: 42000,
        badges: ['Bingo Expert'],
        joinedAt: new Date('2024-03-01')
      },
      {
        id: 'user_004',
        username: 'CardShark',
        role: 'user',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1800000),
        isTyping: false,
        isMuted: false,
        isBanned: false,
        level: 31,
        coinBalance: 150000,
        badges: ['Card Master'],
        joinedAt: new Date('2024-01-20')
      }
    ];

    const mockAlerts: AdminAlert[] = [
      {
        id: 'alert_001',
        type: 'spam_detected',
        severity: 'high',
        userId: 'user_spam',
        username: 'spam_user_123',
        content: 'Check out BestCasino.com for better bonuses!',
        messageId: 'msg_spam_001',
        aiConfidence: 95,
        suggestedAction: 'ban',
        timestamp: new Date(Date.now() - 300000),
        isResolved: false,
        actions: [
          { label: 'Ban User', action: 'ban', variant: 'destructive' },
          { label: 'Delete Message', action: 'delete', variant: 'secondary' },
          { label: 'Warn User', action: 'warn', variant: 'default' }
        ]
      },
      {
        id: 'alert_002',
        type: 'inappropriate_content',
        severity: 'medium',
        userId: 'user_toxic',
        username: 'angry_player',
        content: 'This game is rigged! [inappropriate language detected]',
        messageId: 'msg_toxic_001',
        aiConfidence: 87,
        suggestedAction: 'mute',
        timestamp: new Date(Date.now() - 600000),
        isResolved: false,
        actions: [
          { label: 'Mute 24h', action: 'mute_24h', variant: 'destructive' },
          { label: 'Delete & Warn', action: 'delete_warn', variant: 'secondary' },
          { label: 'Review Later', action: 'review', variant: 'default' }
        ]
      }
    ];

    setMessages(mockMessages);
    setOnlineUsers(mockUsers);
    setAdminAlerts(mockAlerts);
  };

  const simulateRealTimeUpdates = () => {
    // Simulate new messages, users joining/leaving, etc.
    const randomEvents = [
      () => {
        // Simulate user typing
        setOnlineUsers(prev => prev.map(user => ({
          ...user,
          isTyping: Math.random() > 0.8 && user.id !== 'luckyai'
        })));
      },
      () => {
        // Simulate new message
        if (Math.random() > 0.7) {
          const users = ['SlotMaster99', 'LuckyLady777', 'BingoFan2024', 'CardShark'];
          const user = users[Math.floor(Math.random() * users.length)];
          const messages = [
            'Anyone playing the wheel of fortune game?',
            'Just won 500 coins! 🎉',
            'The new update looks great!',
            'Good luck everyone! 🍀',
            'Having a great session today!'
          ];
          
          const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            userId: `user_${Math.floor(Math.random() * 1000)}`,
            username: user,
            userRole: 'user',
            content: messages[Math.floor(Math.random() * messages.length)],
            timestamp: new Date(),
            type: 'message',
            isDeleted: false,
            isEdited: false,
            reactions: []
          };
          
          setMessages(prev => [...prev, newMessage]);
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
            if (soundEnabled) {
              // Play notification sound
            }
          }
        }
      }
    ];

    randomEvents[Math.floor(Math.random() * randomEvents.length)]();
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    // AI Moderation Check
    const aiModerationResult = checkMessageWithAI(currentMessage);
    
    if (aiModerationResult.isBlocked) {
      const alert: AdminAlert = {
        id: `alert_${Date.now()}`,
        type: 'ai_flagged',
        severity: aiModerationResult.severity,
        userId: 'current_user',
        username: 'current_user',
        content: currentMessage,
        messageId: `msg_${Date.now()}`,
        aiConfidence: aiModerationResult.confidence,
        suggestedAction: aiModerationResult.action,
        timestamp: new Date(),
        isResolved: false,
        actions: [
          { label: 'Allow Message', action: 'allow', variant: 'default' },
          { label: 'Block & Warn', action: 'block_warn', variant: 'destructive' },
          { label: 'Review Content', action: 'review', variant: 'secondary' }
        ]
      };
      setAdminAlerts(prev => [alert, ...prev]);
      return;
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: 'current_user',
      username: 'You',
      userRole: isAdmin ? 'admin' : 'user',
      content: currentMessage,
      timestamp: new Date(),
      type: 'message',
      isDeleted: false,
      isEdited: false,
      reactions: []
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');

    // Auto-response from LuckyAI for certain keywords
    if (currentMessage.toLowerCase().includes('help') || currentMessage.toLowerCase().includes('support')) {
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: `msg_ai_${Date.now()}`,
          userId: 'luckyai',
          username: 'LuckyAI',
          userRole: 'ai',
          content: '🤖 Hi! I\'m here to help! For account issues, contact support@coinkrazy.com. For game rules, check our help section. For technical issues, our team is standing by! 🎰',
          timestamp: new Date(),
          type: 'system',
          isDeleted: false,
          isEdited: false,
          reactions: []
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const checkMessageWithAI = (message: string) => {
    // Simulate AI moderation
    const spamKeywords = ['other casino', 'better bonus', 'free money', 'click here', 'best casino'];
    const inappropriateKeywords = ['scam', 'rigged', 'cheat', 'steal'];
    
    const lowerMessage = message.toLowerCase();
    
    if (spamKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        isBlocked: true,
        severity: 'high' as const,
        confidence: 95,
        action: 'ban' as const
      };
    }
    
    if (inappropriateKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        isBlocked: true,
        severity: 'medium' as const,
        confidence: 80,
        action: 'warn' as const
      };
    }
    
    return { isBlocked: false, severity: 'low' as const, confidence: 0, action: 'allow' as const };
  };

  const resolveAdminAlert = (alertId: string, action: string) => {
    setAdminAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, isResolved: true, adminResponse: action }
          : alert
      )
    );

    // Take the specified action
    switch (action) {
      case 'ban':
        // Ban user logic
        break;
      case 'delete':
        // Delete message logic
        setMessages(prev => 
          prev.map(msg => 
            msg.id === prev.find(a => a.id === alertId)?.messageId
              ? { ...msg, isDeleted: true, content: '[Message deleted by moderator]' }
              : msg
          )
        );
        break;
      case 'warn':
        // Send warning message
        const warningMessage: ChatMessage = {
          id: `warning_${Date.now()}`,
          userId: 'luckyai',
          username: 'LuckyAI',
          userRole: 'ai',
          content: '⚠️ Please keep conversations appropriate and casino-related. This is your warning.',
          timestamp: new Date(),
          type: 'warning',
          isDeleted: false,
          isEdited: false,
          reactions: []
        };
        setMessages(prev => [...prev, warningMessage]);
        break;
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.emoji === emoji);
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1 }
                  : r
              )
            };
          } else {
            return {
              ...msg,
              reactions: [...msg.reactions, { emoji, count: 1, users: ['current_user'] }]
            };
          }
        }
        return msg;
      })
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-gold-500" />;
      case 'ai': return <Bot className="w-4 h-4 text-purple-500" />;
      case 'vip': return <Star className="w-4 h-4 text-blue-500" />;
      case 'moderator': return <Shield className="w-4 h-4 text-green-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-gold-500';
      case 'ai': return 'text-purple-500';
      case 'vip': return 'text-blue-500';
      case 'moderator': return 'text-green-500';
      default: return 'text-gray-300';
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'win': return 'border-l-4 border-green-500 bg-green-500/5';
      case 'system': return 'border-l-4 border-blue-500 bg-blue-500/5';
      case 'warning': return 'border-l-4 border-yellow-500 bg-yellow-500/5';
      case 'ban': return 'border-l-4 border-red-500 bg-red-500/5';
      default: return '';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className={`
          fixed ${isPinned ? 'bottom-24 right-6' : 'bottom-6 right-6'} z-50 
          ${isOpen ? 'bg-casino-blue' : 'bg-gold-500 hover:bg-gold-600'} 
          text-white rounded-full w-14 h-14 shadow-lg transition-all duration-300
          ${unreadCount > 0 ? 'animate-bounce' : ''}
        `}
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </Button>

      {/* Admin Alerts Button (Admin Only) */}
      {isAdmin && adminAlerts.filter(a => !a.isResolved).length > 0 && (
        <Button
          className="fixed bottom-24 right-20 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 shadow-lg animate-pulse"
          onClick={() => {/* Open admin alerts modal */}}
        >
          <div className="relative">
            <AlertTriangle className="w-5 h-5" />
            <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs min-w-[18px] h-4 flex items-center justify-center">
              {adminAlerts.filter(a => !a.isResolved).length}
            </Badge>
          </div>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`
          fixed z-40 shadow-2xl transition-all duration-300
          ${isPinned 
            ? 'bottom-20 right-6 w-96 h-[600px]' 
            : isMinimized 
              ? 'bottom-20 right-6 w-96 h-12' 
              : 'bottom-20 right-6 w-96 h-[600px]'
          }
        `}>
          {/* Chat Header */}
          <CardHeader className="p-4 bg-gradient-to-r from-casino-blue to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5" />
                Global Chat
                <Badge className="bg-white/20 text-white text-xs">
                  {onlineUsers.filter(u => u.isOnline).length} online
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPinned(!isPinned)}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8"
                >
                  <Pin className={`w-4 h-4 ${isPinned ? 'text-gold-400' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {!isMinimized && (
              <div className="flex gap-1 mt-2">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    size="sm"
                    variant={selectedChannel === channel.id ? "secondary" : "ghost"}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`text-xs h-7 ${selectedChannel === channel.id ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'}`}
                  >
                    <channel.icon className="w-3 h-3 mr-1" />
                    {channel.name}
                  </Button>
                ))}
              </div>
            )}
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-full">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col space-y-1 ${getMessageTypeColor(message.type)} p-2 rounded-lg ${
                      message.isDeleted ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getRoleIcon(message.userRole)}
                      <span className={`font-medium text-sm ${getRoleColor(message.userRole)}`}>
                        {message.username}
                      </span>
                      {message.userRole === 'vip' && <Crown className="w-3 h-3 text-gold-500" />}
                      {message.userRole === 'ai' && <Bot className="w-3 h-3 text-purple-500" />}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      {message.type === 'win' && message.winAmount && (
                        <div className="flex items-center gap-1 mb-1">
                          <Trophy className="w-4 h-4 text-gold-500" />
                          <span className="font-bold text-green-500">
                            ${message.winAmount.toLocaleString()} WIN!
                          </span>
                          {message.gameType && (
                            <span className="text-muted-foreground">on {message.gameType}</span>
                          )}
                        </div>
                      )}
                      
                      <p className={message.isDeleted ? 'italic text-muted-foreground' : ''}>
                        {message.content}
                      </p>
                      
                      {message.isEdited && (
                        <span className="text-xs text-muted-foreground">(edited)</span>
                      )}
                    </div>
                    
                    {/* Message Reactions */}
                    {message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {message.reactions.map((reaction, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => addReaction(message.id, reaction.emoji)}
                            className="h-6 px-2 text-xs hover:bg-muted/50"
                          >
                            {reaction.emoji} {reaction.count}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addReaction(message.id, '❤️')}
                          className="h-6 px-1 text-xs"
                        >
                          <Heart className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Typing Indicators */}
                {onlineUsers.filter(u => u.isTyping).map((user) => (
                  <div key={`typing-${user.id}`} className="flex items-center gap-2 text-muted-foreground text-sm">
                    {getRoleIcon(user.role)}
                    <span>{user.username} is typing...</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                ))}
                
                <div ref={messagesEndRef} />
              </div>

              {/* User List Toggle */}
              <div className="px-4 py-2 border-t bg-muted/20">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowUserList(!showUserList)}
                  className="w-full justify-between text-xs"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Online Users ({onlineUsers.filter(u => u.isOnline).length})
                  </span>
                  {showUserList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
                
                {showUserList && (
                  <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                    {onlineUsers.filter(u => u.isOnline).map((user) => (
                      <div key={user.id} className="flex items-center gap-2 text-xs">
                        {getRoleIcon(user.role)}
                        <span className={getRoleColor(user.role)}>{user.username}</span>
                        <div className="flex gap-1 ml-auto">
                          {user.badges.slice(0, 2).map((badge, index) => (
                            <Badge key={index} className="text-xs h-4">{badge}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={chatInputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 text-sm"
                    maxLength={500}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim()}
                    size="sm"
                    className="bg-casino-blue hover:bg-casino-blue/80"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>
                    {currentMessage.length}/500
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Moderated by LuckyAI</span>
                    <Bot className="w-3 h-3 text-purple-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Admin Alerts Modal */}
      {isAdmin && adminAlerts.filter(a => !a.isResolved).length > 0 && (
        <Card className="fixed top-20 right-6 w-96 max-h-96 overflow-y-auto z-50 shadow-2xl border-red-500/20">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Admin Alerts
              <Badge className="bg-white/20 text-white">
                {adminAlerts.filter(a => !a.isResolved).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {adminAlerts
              .filter(alert => !alert.isResolved)
              .slice(0, 5)
              .map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={
                      alert.severity === 'critical' ? 'bg-red-600' :
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }>
                      {alert.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      AI: {alert.aiConfidence}%
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div><strong>User:</strong> {alert.username}</div>
                    <div><strong>Content:</strong> "{alert.content}"</div>
                    <div><strong>Suggested:</strong> {alert.suggestedAction}</div>
                  </div>
                  
                  <div className="flex gap-1 mt-3">
                    {alert.actions?.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={action.variant}
                        onClick={() => resolveAdminAlert(alert.id, action.action)}
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}
