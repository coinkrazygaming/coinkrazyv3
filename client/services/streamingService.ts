import { io, Socket } from "socket.io-client";

// Streaming Types
export interface LiveStream {
  id: string;
  title: string;
  description: string;
  streamUrl: string;
  thumbnailUrl?: string;
  status: StreamStatus;
  startTime: Date;
  endTime?: Date;
  viewerCount: number;
  maxViewers: number;
  streamer: Streamer;
  game: StreamGame;
  quality: StreamQuality[];
  currentQuality: StreamQuality;
  chat: LiveChat;
  features: StreamFeature[];
  settings: StreamSettings;
  statistics: StreamStatistics;
  isRecording: boolean;
  recordingUrl?: string;
  category: StreamCategory;
  tags: string[];
  language: string;
  isVIP: boolean;
  isFeatured: boolean;
}

export interface Streamer {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  title: string;
  isVerified: boolean;
  isOnline: boolean;
  followers: number;
  totalStreams: number;
  totalHours: number;
  averageViewers: number;
  specialties: string[];
  socialLinks: SocialLink[];
  schedule: StreamSchedule[];
}

export interface StreamGame {
  id: string;
  name: string;
  type: 'poker' | 'blackjack' | 'roulette' | 'baccarat' | 'bingo' | 'sports' | 'tournament';
  tableId?: string;
  tournamentId?: string;
  gameState?: any;
  isLive: boolean;
}

export interface StreamQuality {
  id: string;
  label: string;
  resolution: string;
  bitrate: number;
  fps: number;
  bandwidth: number;
}

export interface LiveChat {
  id: string;
  streamId: string;
  messages: ChatMessage[];
  moderators: string[];
  settings: ChatSettings;
  statistics: ChatStatistics;
  emoticons: Emoticon[];
  commands: ChatCommand[];
}

export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  username: string;
  displayName: string;
  message: string;
  timestamp: Date;
  type: ChatMessageType;
  badges: UserBadge[];
  emoticons: MessageEmoticon[];
  mentions: string[];
  isDeleted: boolean;
  isModerated: boolean;
  color?: string;
  replyTo?: string;
}

export interface ChatSettings {
  slowMode: boolean;
  slowModeDelay: number; // seconds
  subscriberOnly: boolean;
  followersOnly: boolean;
  followersOnlyDuration: number; // minutes
  uniqueChat: boolean;
  emotesOnly: boolean;
  maxMessageLength: number;
  blockedWords: string[];
  allowedDomains: string[];
  autoModeration: boolean;
}

export interface ChatStatistics {
  totalMessages: number;
  messagesPerMinute: number;
  uniqueChatters: number;
  topChatters: TopChatter[];
  mostUsedEmotes: EmoteUsage[];
  peakActivity: Date;
}

export interface TopChatter {
  userId: string;
  username: string;
  messageCount: number;
  isSubscriber: boolean;
}

export interface EmoteUsage {
  emoteId: string;
  emoteName: string;
  usage: number;
}

export interface Emoticon {
  id: string;
  name: string;
  url: string;
  category: 'global' | 'channel' | 'subscriber' | 'vip';
  isAnimated: boolean;
  isLocked: boolean;
  requiredBadge?: string;
}

export interface MessageEmoticon {
  emoteId: string;
  emoteName: string;
  positions: number[][];
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  color?: string;
  priority: number;
}

export interface ChatCommand {
  command: string;
  description: string;
  permission: 'everyone' | 'subscribers' | 'vip' | 'moderators' | 'broadcaster';
  cooldown: number; // seconds
  isEnabled: boolean;
}

export interface StreamFeature {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  settings?: any;
}

export interface StreamSettings {
  allowRecording: boolean;
  allowClips: boolean;
  chatDelay: number; // seconds
  videoDelay: number; // seconds
  autoHost: boolean;
  autoQuality: boolean;
  dvr: boolean;
  dvrDuration: number; // minutes
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  newFollower: boolean;
  donation: boolean;
  subscription: boolean;
  raid: boolean;
  host: boolean;
  soundEnabled: boolean;
  soundVolume: number;
}

export interface PrivacySettings {
  showViewerCount: boolean;
  allowWhispers: boolean;
  blockAnonymous: boolean;
  ageRestricted: boolean;
}

export interface StreamStatistics {
  totalViews: number;
  peakViewers: number;
  averageViewTime: number; // seconds
  chatEngagement: number; // percentage
  followersGained: number;
  subscribersGained: number;
  donations: number;
  clips: number;
  highlights: number;
}

export interface SocialLink {
  platform: string;
  url: string;
  isVerified: boolean;
}

export interface StreamSchedule {
  dayOfWeek: number; // 0-6, Sunday = 0
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  game?: string;
  title?: string;
  isActive: boolean;
}

export interface StreamClip {
  id: string;
  streamId: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  duration: number; // seconds
  startTime: number; // seconds from stream start
  createdBy: string;
  createdAt: Date;
  views: number;
  likes: number;
  isHighlight: boolean;
}

export interface StreamNotification {
  id: string;
  type: NotificationType;
  userId: string;
  username: string;
  message: string;
  amount?: number;
  timestamp: Date;
  isRead: boolean;
  metadata?: any;
}

export interface ChatModerationAction {
  id: string;
  chatId: string;
  moderatorId: string;
  moderatorName: string;
  targetUserId: string;
  targetUsername: string;
  action: ModerationActionType;
  reason?: string;
  duration?: number; // seconds
  timestamp: Date;
}

export interface StreamRaid {
  id: string;
  fromStreamId: string;
  fromStreamer: string;
  toStreamId: string;
  toStreamer: string;
  viewerCount: number;
  timestamp: Date;
  message?: string;
}

// Enums
export type StreamStatus = 'offline' | 'starting' | 'live' | 'paused' | 'ending' | 'ended';

export type StreamCategory = 'poker' | 'casino' | 'bingo' | 'sports' | 'tournament' | 'variety' | 'educational';

export type ChatMessageType = 'normal' | 'system' | 'moderator' | 'subscriber' | 'donation' | 'follow' | 'raid' | 'host';

export type NotificationType = 'follow' | 'subscribe' | 'donation' | 'raid' | 'host' | 'clip' | 'highlight';

export type ModerationActionType = 'timeout' | 'ban' | 'unban' | 'delete' | 'warn' | 'slow' | 'clear';

class StreamingService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private streams: Map<string, LiveStream> = new Map();
  private chats: Map<string, LiveChat> = new Map();
  private currentStream: LiveStream | null = null;
  private currentQuality: StreamQuality | null = null;
  private isViewerModerator = false;
  private isViewerVIP = false;
  private blockedUsers: Set<string> = new Set();
  private mutedUsers: Set<string> = new Set();
  private playerVolume = 100;
  private isFullscreen = false;
  private isDVREnabled = false;
  private dvrPosition = 0;

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    if (process.env.NODE_ENV === 'development') {
      this.loadMockData();
      this.simulateRealTimeUpdates();
    } else {
      this.initializeWebSocket();
    }
  }

  private initializeWebSocket() {
    if (typeof window === 'undefined') return;

    try {
      this.socket = io(process.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001', {
        path: '/streaming',
        transports: ['websocket', 'polling'],
        timeout: 20000,
        retries: 3,
      });

      this.setupSocketListeners();
    } catch (error) {
      console.warn('Streaming WebSocket initialization failed, using mock data:', error);
      this.loadMockData();
      this.simulateRealTimeUpdates();
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Streaming service connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Streaming service disconnected');
      this.handleReconnection();
    });

    this.socket.on('stream_update', (stream: LiveStream) => {
      this.streams.set(stream.id, stream);
      if (this.currentStream && this.currentStream.id === stream.id) {
        this.currentStream = stream;
      }
    });

    this.socket.on('viewer_count_update', (data: { streamId: string; count: number }) => {
      const stream = this.streams.get(data.streamId);
      if (stream) {
        stream.viewerCount = data.count;
      }
    });

    this.socket.on('chat_message', (message: ChatMessage) => {
      const chat = this.chats.get(message.chatId);
      if (chat) {
        if (!this.blockedUsers.has(message.userId) && !this.mutedUsers.has(message.userId)) {
          chat.messages.push(message);
          chat.messages = chat.messages.slice(-500); // Keep last 500 messages
          chat.statistics.totalMessages++;
          chat.statistics.messagesPerMinute = this.calculateMessagesPerMinute(chat);
        }
      }
    });

    this.socket.on('chat_deleted', (data: { chatId: string; messageId: string }) => {
      const chat = this.chats.get(data.chatId);
      if (chat) {
        const message = chat.messages.find(m => m.id === data.messageId);
        if (message) {
          message.isDeleted = true;
          message.message = '[Message deleted]';
        }
      }
    });

    this.socket.on('user_timeout', (data: { chatId: string; userId: string; duration: number }) => {
      // Handle user timeout
      console.log(`User ${data.userId} timed out for ${data.duration} seconds`);
    });

    this.socket.on('user_ban', (data: { chatId: string; userId: string }) => {
      this.blockedUsers.add(data.userId);
    });

    this.socket.on('stream_notification', (notification: StreamNotification) => {
      // Handle stream notifications (follows, donations, etc.)
      console.log('Stream notification:', notification);
    });

    this.socket.on('stream_raid', (raid: StreamRaid) => {
      // Handle incoming raid
      console.log(`Raid from ${raid.fromStreamer} with ${raid.viewerCount} viewers!`);
    });

    this.socket.on('quality_change', (data: { streamId: string; quality: StreamQuality }) => {
      if (this.currentStream && this.currentStream.id === data.streamId) {
        this.currentQuality = data.quality;
      }
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    } else {
      console.warn('Max reconnection attempts reached, switching to offline mode');
      this.loadMockData();
      this.simulateRealTimeUpdates();
    }
  }

  private loadMockData() {
    // Load mock streams
    const mockStreams: LiveStream[] = [
      {
        id: 'poker-pro-stream',
        title: 'High Stakes Poker Tournament - Final Table!',
        description: 'Watch the final table of our biggest poker tournament with $100K guaranteed!',
        streamUrl: 'https://stream.example.com/poker-pro',
        thumbnailUrl: '/thumbnails/poker-final-table.jpg',
        status: 'live',
        startTime: new Date(Date.now() - 7200000), // 2 hours ago
        viewerCount: 1247,
        maxViewers: 1850,
        streamer: {
          id: 'poker-pro',
          username: 'PokerProDealer',
          displayName: 'Professional Poker Dealer',
          avatar: '/avatars/poker-dealer.jpg',
          title: 'Tournament Director',
          isVerified: true,
          isOnline: true,
          followers: 15623,
          totalStreams: 456,
          totalHours: 2847,
          averageViewers: 890,
          specialties: ['Tournament Poker', 'High Stakes', 'Live Commentary'],
          socialLinks: [
            { platform: 'twitter', url: 'https://twitter.com/pokerpro', isVerified: true }
          ],
          schedule: [
            { dayOfWeek: 0, startTime: '19:00', endTime: '23:00', game: 'Tournament Poker', isActive: true },
            { dayOfWeek: 3, startTime: '20:00', endTime: '00:00', game: 'Cash Games', isActive: true }
          ]
        },
        game: {
          id: 'sunday-major-final',
          name: 'Sunday Major Championship - Final Table',
          type: 'tournament',
          tournamentId: 'sunday-major',
          isLive: true
        },
        quality: [
          { id: 'hd', label: 'HD', resolution: '1920x1080', bitrate: 6000, fps: 60, bandwidth: 8000 },
          { id: 'sd', label: 'SD', resolution: '1280x720', bitrate: 3000, fps: 30, bandwidth: 4000 },
          { id: 'mobile', label: 'Mobile', resolution: '854x480', bitrate: 1500, fps: 30, bandwidth: 2000 }
        ],
        currentQuality: { id: 'hd', label: 'HD', resolution: '1920x1080', bitrate: 6000, fps: 60, bandwidth: 8000 },
        chat: this.generateMockChat('poker-pro-stream'),
        features: [
          { id: 'multi-camera', name: 'Multi-Camera View', description: 'Switch between different camera angles', isEnabled: true },
          { id: 'player-cards', name: 'Player Card Reveal', description: 'See hole cards when players are eliminated', isEnabled: true },
          { id: 'pot-tracker', name: 'Live Pot Tracker', description: 'Real-time pot size and betting action', isEnabled: true },
          { id: 'statistics', name: 'Live Statistics', description: 'Player stats and tournament info', isEnabled: true }
        ],
        settings: {
          allowRecording: true,
          allowClips: true,
          chatDelay: 0,
          videoDelay: 15,
          autoHost: true,
          autoQuality: false,
          dvr: true,
          dvrDuration: 240,
          notifications: {
            newFollower: true,
            donation: true,
            subscription: true,
            raid: true,
            host: true,
            soundEnabled: true,
            soundVolume: 80
          },
          privacy: {
            showViewerCount: true,
            allowWhispers: true,
            blockAnonymous: false,
            ageRestricted: false
          }
        },
        statistics: {
          totalViews: 45623,
          peakViewers: 1850,
          averageViewTime: 1847,
          chatEngagement: 67.5,
          followersGained: 234,
          subscribersGained: 89,
          donations: 15,
          clips: 67,
          highlights: 12
        },
        isRecording: true,
        recordingUrl: '/recordings/poker-pro-stream-2024-01-15.mp4',
        category: 'tournament',
        tags: ['Poker', 'Tournament', 'High Stakes', 'Final Table', 'Live'],
        language: 'English',
        isVIP: false,
        isFeatured: true
      },
      {
        id: 'blackjack-master',
        title: 'Blackjack Strategy Masterclass',
        description: 'Learn advanced blackjack strategies while watching live gameplay',
        streamUrl: 'https://stream.example.com/blackjack-master',
        status: 'live',
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        viewerCount: 456,
        maxViewers: 567,
        streamer: {
          id: 'blackjack-master',
          username: 'BlackjackMaster21',
          displayName: 'Blackjack Strategy Expert',
          avatar: '/avatars/blackjack-expert.jpg',
          title: 'Card Counting Professional',
          isVerified: true,
          isOnline: true,
          followers: 8934,
          totalStreams: 234,
          totalHours: 1456,
          averageViewers: 423,
          specialties: ['Blackjack Strategy', 'Card Counting', 'Educational Content'],
          socialLinks: [],
          schedule: []
        },
        game: {
          id: 'blackjack-vip-table',
          name: 'VIP Blackjack Table',
          type: 'blackjack',
          tableId: 'blackjack-vip',
          isLive: true
        },
        quality: [
          { id: 'hd', label: 'HD', resolution: '1920x1080', bitrate: 4000, fps: 30, bandwidth: 5000 },
          { id: 'sd', label: 'SD', resolution: '1280x720', bitrate: 2000, fps: 30, bandwidth: 3000 }
        ],
        currentQuality: { id: 'hd', label: 'HD', resolution: '1920x1080', bitrate: 4000, fps: 30, bandwidth: 5000 },
        chat: this.generateMockChat('blackjack-master'),
        features: [
          { id: 'basic-strategy', name: 'Basic Strategy Overlay', description: 'Shows optimal play decisions', isEnabled: true },
          { id: 'count-tracker', name: 'Count Tracker', description: 'Live running count display', isEnabled: true },
          { id: 'educational', name: 'Educational Mode', description: 'Learning-focused features', isEnabled: true }
        ],
        settings: {
          allowRecording: true,
          allowClips: true,
          chatDelay: 5,
          videoDelay: 10,
          autoHost: false,
          autoQuality: true,
          dvr: false,
          dvrDuration: 60,
          notifications: {
            newFollower: true,
            donation: false,
            subscription: false,
            raid: true,
            host: true,
            soundEnabled: false,
            soundVolume: 0
          },
          privacy: {
            showViewerCount: true,
            allowWhispers: false,
            blockAnonymous: true,
            ageRestricted: false
          }
        },
        statistics: {
          totalViews: 12456,
          peakViewers: 567,
          averageViewTime: 2134,
          chatEngagement: 34.2,
          followersGained: 67,
          subscribersGained: 0,
          donations: 0,
          clips: 23,
          highlights: 5
        },
        isRecording: false,
        category: 'educational',
        tags: ['Blackjack', 'Strategy', 'Educational', 'Live'],
        language: 'English',
        isVIP: false,
        isFeatured: false
      }
    ];

    mockStreams.forEach(stream => {
      this.streams.set(stream.id, stream);
      this.chats.set(stream.id, stream.chat);
    });
  }

  private generateMockChat(streamId: string): LiveChat {
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg-1',
        chatId: streamId,
        userId: 'viewer-1',
        username: 'PokerFan123',
        displayName: 'PokerFan123',
        message: 'This final table is amazing! 🔥',
        timestamp: new Date(Date.now() - 300000),
        type: 'normal',
        badges: [{ id: 'follower', name: 'Follower', description: 'Following this channel', imageUrl: '/badges/follower.png', priority: 1 }],
        emoticons: [{ emoteId: 'fire', emoteName: '🔥', positions: [[34, 36]] }],
        mentions: [],
        isDeleted: false,
        isModerated: false,
        color: '#FF6B6B'
      },
      {
        id: 'msg-2',
        chatId: streamId,
        userId: 'viewer-2',
        username: 'HighStakesPlayer',
        displayName: 'HighStakesPlayer',
        message: 'That was a sick bluff by Player3!',
        timestamp: new Date(Date.now() - 240000),
        type: 'normal',
        badges: [
          { id: 'vip', name: 'VIP', description: 'VIP member', imageUrl: '/badges/vip.png', priority: 2 },
          { id: 'subscriber', name: 'Subscriber', description: 'Channel subscriber', imageUrl: '/badges/sub.png', priority: 3 }
        ],
        emoticons: [],
        mentions: [],
        isDeleted: false,
        isModerated: false,
        color: '#4ECDC4'
      },
      {
        id: 'msg-3',
        chatId: streamId,
        userId: 'mod-1',
        username: 'StreamModerator',
        displayName: 'StreamModerator',
        message: 'Welcome to the final table everyone! Please keep chat respectful.',
        timestamp: new Date(Date.now() - 180000),
        type: 'moderator',
        badges: [
          { id: 'moderator', name: 'Moderator', description: 'Channel moderator', imageUrl: '/badges/mod.png', priority: 5 }
        ],
        emoticons: [],
        mentions: [],
        isDeleted: false,
        isModerated: false,
        color: '#45B7D1'
      }
    ];

    return {
      id: streamId,
      streamId,
      messages: mockMessages,
      moderators: ['mod-1', 'mod-2'],
      settings: {
        slowMode: false,
        slowModeDelay: 5,
        subscriberOnly: false,
        followersOnly: false,
        followersOnlyDuration: 10,
        uniqueChat: false,
        emotesOnly: false,
        maxMessageLength: 500,
        blockedWords: ['spam', 'promotion'],
        allowedDomains: ['twitch.tv', 'youtube.com'],
        autoModeration: true
      },
      statistics: {
        totalMessages: 1247,
        messagesPerMinute: 12.5,
        uniqueChatters: 234,
        topChatters: [
          { userId: 'viewer-1', username: 'PokerFan123', messageCount: 45, isSubscriber: false },
          { userId: 'viewer-2', username: 'HighStakesPlayer', messageCount: 38, isSubscriber: true }
        ],
        mostUsedEmotes: [
          { emoteId: 'fire', emoteName: '🔥', usage: 67 },
          { emoteId: 'gg', emoteName: 'GG', usage: 45 }
        ],
        peakActivity: new Date(Date.now() - 1800000)
      },
      emoticons: [
        { id: 'fire', name: '🔥', url: '/emotes/fire.png', category: 'global', isAnimated: false, isLocked: false },
        { id: 'gg', name: 'GG', url: '/emotes/gg.png', category: 'global', isAnimated: false, isLocked: false },
        { id: 'vip-emote', name: 'VIPKappa', url: '/emotes/vip-kappa.gif', category: 'vip', isAnimated: true, isLocked: true, requiredBadge: 'vip' }
      ],
      commands: [
        { command: '!rules', description: 'Show chat rules', permission: 'everyone', cooldown: 30, isEnabled: true },
        { command: '!uptime', description: 'Show stream uptime', permission: 'everyone', cooldown: 10, isEnabled: true },
        { command: '!timeout', description: 'Timeout a user', permission: 'moderators', cooldown: 0, isEnabled: true },
        { command: '!clear', description: 'Clear chat', permission: 'moderators', cooldown: 0, isEnabled: true }
      ]
    };
  }

  private calculateMessagesPerMinute(chat: LiveChat): number {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentMessages = chat.messages.filter(m => m.timestamp >= oneMinuteAgo);
    return recentMessages.length;
  }

  private simulateRealTimeUpdates() {
    setInterval(() => {
      // Simulate viewer count changes
      this.streams.forEach(stream => {
        const change = Math.floor(Math.random() * 20) - 10;
        stream.viewerCount = Math.max(0, stream.viewerCount + change);
        stream.maxViewers = Math.max(stream.maxViewers, stream.viewerCount);
      });

      // Simulate new chat messages
      if (Math.random() > 0.7) {
        this.simulateRandomChatMessage();
      }

      // Update chat statistics
      this.chats.forEach(chat => {
        chat.statistics.messagesPerMinute = this.calculateMessagesPerMinute(chat);
      });
    }, 3000);
  }

  private simulateRandomChatMessage() {
    const streamIds = Array.from(this.streams.keys());
    if (streamIds.length === 0) return;

    const randomStreamId = streamIds[Math.floor(Math.random() * streamIds.length)];
    const chat = this.chats.get(randomStreamId);
    if (!chat) return;

    const messages = [
      'Great stream! 👍',
      'Amazing play!',
      'What a hand!',
      'LET\'S GO! 🔥',
      'That was insane!',
      'GG everyone',
      'Nice strategy',
      'Incredible read',
      'So close!',
      'What are the odds?'
    ];

    const usernames = ['StreamWatcher', 'GameFan', 'PokerLover', 'CasinoKing', 'LuckyPlayer', 'HighRoller'];

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      chatId: randomStreamId,
      userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      username: usernames[Math.floor(Math.random() * usernames.length)],
      displayName: usernames[Math.floor(Math.random() * usernames.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(),
      type: 'normal',
      badges: [],
      emoticons: [],
      mentions: [],
      isDeleted: false,
      isModerated: false,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    };

    chat.messages.push(message);
    chat.messages = chat.messages.slice(-500);
    chat.statistics.totalMessages++;
  }

  // Public API methods
  public getStreams(filters?: {
    category?: StreamCategory;
    status?: StreamStatus;
    isLive?: boolean;
    isFeatured?: boolean;
    minViewers?: number;
  }): LiveStream[] {
    let streams = Array.from(this.streams.values());

    if (filters) {
      if (filters.category) {
        streams = streams.filter(s => s.category === filters.category);
      }
      if (filters.status) {
        streams = streams.filter(s => s.status === filters.status);
      }
      if (filters.isLive !== undefined) {
        streams = streams.filter(s => (s.status === 'live') === filters.isLive);
      }
      if (filters.isFeatured !== undefined) {
        streams = streams.filter(s => s.isFeatured === filters.isFeatured);
      }
      if (filters.minViewers !== undefined) {
        streams = streams.filter(s => s.viewerCount >= filters.minViewers);
      }
    }

    return streams.sort((a, b) => b.viewerCount - a.viewerCount);
  }

  public getStream(streamId: string): LiveStream | undefined {
    return this.streams.get(streamId);
  }

  public getCurrentStream(): LiveStream | null {
    return this.currentStream;
  }

  public joinStream(streamId: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const stream = this.streams.get(streamId);
      if (!stream) {
        resolve({ success: false, error: 'Stream not found' });
        return;
      }

      if (stream.status !== 'live') {
        resolve({ success: false, error: 'Stream is not live' });
        return;
      }

      this.currentStream = stream;
      this.currentQuality = stream.currentQuality;

      if (this.socket && this.socket.connected) {
        this.socket.emit('join_stream', { streamId });
      }

      // Simulate joining
      setTimeout(() => {
        stream.viewerCount++;
        resolve({ success: true });
      }, 500);
    });
  }

  public leaveStream(): void {
    if (this.currentStream) {
      if (this.socket && this.socket.connected) {
        this.socket.emit('leave_stream', { streamId: this.currentStream.id });
      }

      this.currentStream.viewerCount = Math.max(0, this.currentStream.viewerCount - 1);
      this.currentStream = null;
      this.currentQuality = null;
    }
  }

  public sendChatMessage(message: string, username: string): void {
    if (!this.currentStream || !this.currentStream.chat) return;

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId: this.currentStream.chat.id,
      userId: 'current-user',
      username,
      displayName: username,
      message,
      timestamp: new Date(),
      type: 'normal',
      badges: [],
      emoticons: [],
      mentions: [],
      isDeleted: false,
      isModerated: false,
      color: '#4ECDC4'
    };

    if (this.socket && this.socket.connected) {
      this.socket.emit('chat_message', chatMessage);
    } else {
      // Add locally in development
      this.currentStream.chat.messages.push(chatMessage);
      this.currentStream.chat.messages = this.currentStream.chat.messages.slice(-500);
      this.currentStream.chat.statistics.totalMessages++;
    }
  }

  public changeQuality(quality: StreamQuality): void {
    if (this.currentStream) {
      this.currentQuality = quality;
      
      if (this.socket && this.socket.connected) {
        this.socket.emit('change_quality', { 
          streamId: this.currentStream.id, 
          quality 
        });
      }
    }
  }

  public toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  public setVolume(volume: number): void {
    this.playerVolume = Math.max(0, Math.min(100, volume));
  }

  public getVolume(): number {
    return this.playerVolume;
  }

  public isStreamFullscreen(): boolean {
    return this.isFullscreen;
  }

  public blockUser(userId: string): void {
    this.blockedUsers.add(userId);
    
    if (this.socket && this.socket.connected && this.currentStream) {
      this.socket.emit('block_user', { 
        chatId: this.currentStream.chat.id, 
        userId 
      });
    }
  }

  public unblockUser(userId: string): void {
    this.blockedUsers.delete(userId);
    
    if (this.socket && this.socket.connected && this.currentStream) {
      this.socket.emit('unblock_user', { 
        chatId: this.currentStream.chat.id, 
        userId 
      });
    }
  }

  public muteUser(userId: string): void {
    this.mutedUsers.add(userId);
  }

  public unmuteUser(userId: string): void {
    this.mutedUsers.delete(userId);
  }

  public createClip(title: string, duration: number = 30): Promise<{ success: boolean; clipId?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!this.currentStream) {
        resolve({ success: false, error: 'No active stream' });
        return;
      }

      if (!this.currentStream.settings.allowClips) {
        resolve({ success: false, error: 'Clips are disabled for this stream' });
        return;
      }

      const clipId = `clip_${Date.now()}`;
      
      if (this.socket && this.socket.connected) {
        this.socket.emit('create_clip', { 
          streamId: this.currentStream.id, 
          title, 
          duration 
        });
      }

      // Simulate clip creation
      setTimeout(() => {
        this.currentStream!.statistics.clips++;
        resolve({ success: true, clipId });
      }, 1000);
    });
  }

  public reportUser(userId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.connected && this.currentStream) {
        this.socket.emit('report_user', { 
          chatId: this.currentStream.chat.id, 
          userId, 
          reason 
        });
      }

      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  public followStreamer(streamerId: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('follow_streamer', { streamerId });
      }

      setTimeout(() => {
        const stream = Array.from(this.streams.values()).find(s => s.streamer.id === streamerId);
        if (stream) {
          stream.streamer.followers++;
          stream.statistics.followersGained++;
        }
        resolve({ success: true });
      }, 500);
    });
  }

  public getChatHistory(streamId: string): ChatMessage[] {
    const chat = this.chats.get(streamId);
    return chat ? chat.messages : [];
  }

  public disconnect(): void {
    if (this.currentStream) {
      this.leaveStream();
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const streamingService = new StreamingService();
