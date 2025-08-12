import { authService } from "./authService";

export interface SocialUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  experience: number;
  joinDate: string;
  lastActive: string;
  isOnline: boolean;
  stats: {
    totalWins: number;
    totalGamesPlayed: number;
    favoriteGame: string;
    winStreak: number;
    totalEarnings: number;
    rank: number;
  };
  preferences: {
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
    showActivityFeed: boolean;
    allowDirectMessages: boolean;
  };
  badges: SocialBadge[];
  socialScore: number;
  country: string;
  bio: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  author: Pick<SocialUser, 'username' | 'displayName' | 'avatar' | 'level'>;
  content: string;
  images: string[];
  type: 'text' | 'achievement' | 'win' | 'challenge' | 'tournament' | 'milestone';
  metadata?: {
    gameId?: string;
    gameName?: string;
    winAmount?: number;
    achievementId?: string;
    challengeId?: string;
    tournamentId?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  hasLiked: boolean;
  hasShared: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  visibility: 'public' | 'friends' | 'private';
}

export interface SocialComment {
  id: string;
  postId: string;
  authorId: string;
  author: Pick<SocialUser, 'username' | 'displayName' | 'avatar'>;
  content: string;
  likes: number;
  hasLiked: boolean;
  replies: SocialComment[];
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: Pick<SocialUser, 'username' | 'displayName' | 'avatar' | 'level'>;
  toUser: Pick<SocialUser, 'username' | 'displayName' | 'avatar' | 'level'>;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface SocialGroup {
  id: string;
  name: string;
  description: string;
  avatar: string;
  banner: string;
  category: string;
  memberCount: number;
  isPrivate: boolean;
  requirements: {
    minLevel?: number;
    inviteOnly?: boolean;
    approval?: boolean;
  };
  owner: Pick<SocialUser, 'id' | 'username' | 'displayName' | 'avatar'>;
  moderators: Pick<SocialUser, 'id' | 'username' | 'displayName' | 'avatar'>[];
  tags: string[];
  createdAt: string;
  rules: string[];
  stats: {
    totalPosts: number;
    activeMembers: number;
    totalWins: number;
  };
}

export interface SocialBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'achievement' | 'social' | 'gaming' | 'special';
  requirements: string;
  unlockedAt?: string;
  progress?: {
    current: number;
    required: number;
  };
}

export interface SocialChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'individual' | 'team' | 'community';
  requirements: {
    gameId?: string;
    minBet?: number;
    targetWins?: number;
    targetAmount?: number;
    timeLimit?: number;
  };
  rewards: {
    gc?: number;
    sc?: number;
    badges?: string[];
    experience?: number;
  };
  participants: number;
  status: 'active' | 'completed' | 'expired';
  startDate: string;
  endDate: string;
  leaderboard: Array<{
    userId: string;
    username: string;
    displayName: string;
    avatar: string;
    score: number;
    rank: number;
  }>;
}

export interface SocialTournament {
  id: string;
  name: string;
  description: string;
  gameId: string;
  gameName: string;
  type: 'elimination' | 'leaderboard' | 'bracket';
  entryFee: {
    type: 'GC' | 'SC' | 'free';
    amount: number;
  };
  maxParticipants: number;
  currentParticipants: number;
  prizePool: {
    gc?: number;
    sc?: number;
    special?: string[];
  };
  status: 'registration' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  rules: string[];
  brackets?: TournamentBracket[];
  leaderboard: Array<{
    userId: string;
    username: string;
    displayName: string;
    avatar: string;
    score: number;
    rank: number;
    eliminated?: boolean;
  }>;
}

export interface TournamentBracket {
  id: string;
  round: number;
  match: number;
  player1: Pick<SocialUser, 'id' | 'username' | 'displayName' | 'avatar'>;
  player2: Pick<SocialUser, 'id' | 'username' | 'displayName' | 'avatar'>;
  winner?: string;
  score1?: number;
  score2?: number;
  status: 'pending' | 'active' | 'completed';
  scheduledTime: string;
}

export interface DirectMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: Pick<SocialUser, 'username' | 'displayName' | 'avatar'>;
  toUser: Pick<SocialUser, 'username' | 'displayName' | 'avatar'>;
  content: string;
  type: 'text' | 'image' | 'game_invite' | 'challenge';
  isRead: boolean;
  createdAt: string;
  editedAt?: string;
  metadata?: {
    gameId?: string;
    challengeId?: string;
    imageUrl?: string;
  };
}

export interface SocialNotification {
  id: string;
  userId: string;
  type: 'friend_request' | 'friend_accepted' | 'post_like' | 'post_comment' | 'challenge_invite' | 'tournament_invite' | 'achievement' | 'message';
  title: string;
  message: string;
  icon: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SocialActivity {
  id: string;
  userId: string;
  user: Pick<SocialUser, 'username' | 'displayName' | 'avatar'>;
  type: 'win' | 'achievement' | 'level_up' | 'friend_added' | 'group_joined' | 'challenge_completed';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

class SocialService {
  private static instance: SocialService;
  private baseUrl = '/api/social';
  private ws: WebSocket | null = null;
  private activityListeners: Set<(activity: SocialActivity) => void> = new Set();
  private notificationListeners: Set<(notification: SocialNotification) => void> = new Set();

  static getInstance(): SocialService {
    if (!SocialService.instance) {
      SocialService.instance = new SocialService();
    }
    return SocialService.instance;
  }

  constructor() {
    this.initializeWebSocket();
  }

  // Helper method for fetch with timeout
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // WebSocket for real-time features
  private initializeWebSocket() {
    if (typeof window === 'undefined') return;

    // Skip WebSocket if explicitly disabled or in certain environments
    if (process.env.NODE_ENV === 'development' || !window.WebSocket) {
      console.log('Social WebSocket: Using simulated real-time updates');
      this.simulateRealTimeUpdates();
      return;
    }

    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/social`;
      console.log('Attempting to connect to Social WebSocket:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Social WebSocket connected successfully');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`Social WebSocket disconnected: Code ${event.code}, Reason: ${event.reason}`);

        // Only attempt reconnection if it wasn't a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
          console.log('Attempting to reconnect in 5 seconds...');
          setTimeout(() => this.initializeWebSocket(), 5000);
        }
      };

      this.ws.onerror = (error) => {
        // Better error logging
        if (error instanceof Event) {
          console.warn('Social WebSocket connection failed - WebSocket server not available');
          console.warn('This is normal in development mode. Real-time features will use mock data.');
        } else {
          console.error('Social WebSocket error:', error);
        }

        // Fallback to simulated updates
        this.simulateRealTimeUpdates();
      };
    } catch (error) {
      console.warn('Failed to initialize WebSocket:', error);
      this.simulateRealTimeUpdates();
    }
  }

  // Simulate real-time updates for development
  private simulateRealTimeUpdates() {
    // Simulate periodic activity updates every 30 seconds
    setInterval(() => {
      const mockActivity = this.generateMockActivity();
      if (mockActivity) {
        this.activityListeners.forEach(listener => listener(mockActivity));
      }
    }, 30000);

    // Simulate periodic notifications every 2 minutes
    setInterval(() => {
      const mockNotification = this.generateMockNotification();
      if (mockNotification) {
        this.notificationListeners.forEach(listener => listener(mockNotification));
      }
    }, 120000);
  }

  private generateMockActivity(): any {
    const activities = [
      {
        id: `mock_${Date.now()}`,
        userId: 'mock_user',
        user: {
          username: 'TestPlayer',
          displayName: 'Test Player',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
        },
        type: 'win',
        description: 'won 1,500 GC playing Sweet Bonanza',
        metadata: {
          gameId: 'sweet-bonanza',
          gameName: 'Sweet Bonanza',
          winAmount: 1500
        },
        createdAt: new Date().toISOString()
      },
      {
        id: `mock_${Date.now() + 1}`,
        userId: 'mock_user2',
        user: {
          username: 'LevelMaster',
          displayName: 'Level Master',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=level'
        },
        type: 'level_up',
        description: 'reached Level 25',
        metadata: {
          newLevel: 25
        },
        createdAt: new Date().toISOString()
      }
    ];

    return activities[Math.floor(Math.random() * activities.length)];
  }

  private generateMockNotification(): any {
    const notifications = [
      {
        id: `mock_notif_${Date.now()}`,
        userId: 'current-user',
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You earned a new badge for your gaming skills',
        icon: '🏆',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: `mock_notif_${Date.now() + 1}`,
        userId: 'current-user',
        type: 'friend_request',
        title: 'New Friend Request',
        message: 'Another player wants to be your friend',
        icon: '👥',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];

    return notifications[Math.floor(Math.random() * notifications.length)];
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'activity':
        this.activityListeners.forEach(listener => listener(data.payload));
        break;
      case 'notification':
        this.notificationListeners.forEach(listener => listener(data.payload));
        break;
    }
  }

  // User Profile Management
  async getUserProfile(userId: string): Promise<SocialUser | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/users/${userId}`);
      
      if (!response.ok) {
        console.warn(`User profile API returned ${response.status}, using mock data`);
        return this.getMockUser(userId);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('User profile response is not JSON, using mock data');
        return this.getMockUser(userId);
      }

      return await response.json();
    } catch (error) {
      console.warn('Error fetching user profile, using mock data:', error);
      return this.getMockUser(userId);
    }
  }

  async updateUserProfile(updates: Partial<SocialUser>): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      return response.ok;
    } catch (error) {
      console.warn('Error updating user profile:', error);
      return false;
    }
  }

  // Social Feed
  async getSocialFeed(page: number = 1, limit: number = 20): Promise<SocialPost[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/feed?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        console.warn('Feed API failed, using mock data');
        return this.getMockPosts();
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Feed response is not JSON, using mock data');
        return this.getMockPosts();
      }

      const posts = await response.json();
      return Array.isArray(posts) ? posts : this.getMockPosts();
    } catch (error) {
      console.warn('Error fetching social feed, using mock data:', error);
      return this.getMockPosts();
    }
  }

  async createPost(content: string, type: SocialPost['type'], metadata?: SocialPost['metadata']): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ content, type, metadata })
      });

      return response.ok;
    } catch (error) {
      console.warn('Error creating post:', error);
      return false;
    }
  }

  async likePost(postId: string): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/posts/${postId}/like`, {
        method: 'POST'
      });

      return response.ok;
    } catch (error) {
      console.warn('Error liking post:', error);
      return false;
    }
  }

  async commentOnPost(postId: string, content: string): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      return response.ok;
    } catch (error) {
      console.warn('Error commenting on post:', error);
      return false;
    }
  }

  // Friends System
  async getFriends(): Promise<SocialUser[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/friends`);
      
      if (!response.ok) {
        console.warn('Friends API failed, using mock data');
        return this.getMockFriends();
      }

      const friends = await response.json();
      return Array.isArray(friends) ? friends : this.getMockFriends();
    } catch (error) {
      console.warn('Error fetching friends, using mock data:', error);
      return this.getMockFriends();
    }
  }

  async getFriendRequests(): Promise<FriendRequest[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/friend-requests`);
      
      if (!response.ok) {
        console.warn('Friend requests API failed, using mock data');
        return this.getMockFriendRequests();
      }

      const requests = await response.json();
      return Array.isArray(requests) ? requests : this.getMockFriendRequests();
    } catch (error) {
      console.warn('Error fetching friend requests, using mock data:', error);
      return this.getMockFriendRequests();
    }
  }

  async sendFriendRequest(userId: string, message?: string): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/friend-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ userId, message })
      });

      return response.ok;
    } catch (error) {
      console.warn('Error sending friend request:', error);
      return false;
    }
  }

  async respondToFriendRequest(requestId: string, accept: boolean): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/friend-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ accept })
      });

      return response.ok;
    } catch (error) {
      console.warn('Error responding to friend request:', error);
      return false;
    }
  }

  // Groups
  async getGroups(): Promise<SocialGroup[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/groups`);
      
      if (!response.ok) {
        console.warn('Groups API failed, using mock data');
        return this.getMockGroups();
      }

      const groups = await response.json();
      return Array.isArray(groups) ? groups : this.getMockGroups();
    } catch (error) {
      console.warn('Error fetching groups, using mock data:', error);
      return this.getMockGroups();
    }
  }

  async joinGroup(groupId: string): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/groups/${groupId}/join`, {
        method: 'POST'
      });

      return response.ok;
    } catch (error) {
      console.warn('Error joining group:', error);
      return false;
    }
  }

  // Challenges
  async getChallenges(): Promise<SocialChallenge[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/challenges`);
      
      if (!response.ok) {
        console.warn('Challenges API failed, using mock data');
        return this.getMockChallenges();
      }

      const challenges = await response.json();
      return Array.isArray(challenges) ? challenges : this.getMockChallenges();
    } catch (error) {
      console.warn('Error fetching challenges, using mock data:', error);
      return this.getMockChallenges();
    }
  }

  async joinChallenge(challengeId: string): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/challenges/${challengeId}/join`, {
        method: 'POST'
      });

      return response.ok;
    } catch (error) {
      console.warn('Error joining challenge:', error);
      return false;
    }
  }

  // Tournaments
  async getTournaments(): Promise<SocialTournament[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/tournaments`);
      
      if (!response.ok) {
        console.warn('Tournaments API failed, using mock data');
        return this.getMockTournaments();
      }

      const tournaments = await response.json();
      return Array.isArray(tournaments) ? tournaments : this.getMockTournaments();
    } catch (error) {
      console.warn('Error fetching tournaments, using mock data:', error);
      return this.getMockTournaments();
    }
  }

  // Direct Messages
  async getDirectMessages(userId: string): Promise<DirectMessage[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/messages/${userId}`);
      
      if (!response.ok) {
        console.warn('Messages API failed, using mock data');
        return this.getMockMessages();
      }

      const messages = await response.json();
      return Array.isArray(messages) ? messages : this.getMockMessages();
    } catch (error) {
      console.warn('Error fetching messages, using mock data:', error);
      return this.getMockMessages();
    }
  }

  async sendDirectMessage(userId: string, content: string, type: DirectMessage['type'] = 'text'): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ userId, content, type })
      });

      return response.ok;
    } catch (error) {
      console.warn('Error sending message:', error);
      return false;
    }
  }

  // Notifications
  async getNotifications(): Promise<SocialNotification[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/notifications`);
      
      if (!response.ok) {
        console.warn('Notifications API failed, using mock data');
        return this.getMockNotifications();
      }

      const notifications = await response.json();
      return Array.isArray(notifications) ? notifications : this.getMockNotifications();
    } catch (error) {
      console.warn('Error fetching notifications, using mock data:', error);
      return this.getMockNotifications();
    }
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: 'POST'
      });

      return response.ok;
    } catch (error) {
      console.warn('Error marking notification as read:', error);
      return false;
    }
  }

  // Leaderboards
  async getLeaderboard(type: 'wins' | 'earnings' | 'level' | 'social' = 'wins'): Promise<SocialUser[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/leaderboard/${type}`);
      
      if (!response.ok) {
        console.warn('Leaderboard API failed, using mock data');
        return this.getMockLeaderboard();
      }

      const leaderboard = await response.json();
      return Array.isArray(leaderboard) ? leaderboard : this.getMockLeaderboard();
    } catch (error) {
      console.warn('Error fetching leaderboard, using mock data:', error);
      return this.getMockLeaderboard();
    }
  }

  // Achievements/Badges
  async getUserBadges(userId?: string): Promise<SocialBadge[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/badges${userId ? `/${userId}` : ''}`);
      
      if (!response.ok) {
        console.warn('Badges API failed, using mock data');
        return this.getMockBadges();
      }

      const badges = await response.json();
      return Array.isArray(badges) ? badges : this.getMockBadges();
    } catch (error) {
      console.warn('Error fetching badges, using mock data:', error);
      return this.getMockBadges();
    }
  }

  // Event Listeners
  onActivity(listener: (activity: SocialActivity) => void): () => void {
    this.activityListeners.add(listener);
    return () => this.activityListeners.delete(listener);
  }

  onNotification(listener: (notification: SocialNotification) => void): () => void {
    this.notificationListeners.add(listener);
    return () => this.notificationListeners.delete(listener);
  }

  // Mock Data Methods
  private getMockUser(userId: string): SocialUser {
    return {
      id: userId,
      username: 'CoinMaster',
      displayName: 'Coin Master Pro',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coinmaster',
      level: 25,
      experience: 12450,
      joinDate: '2024-01-15T00:00:00Z',
      lastActive: new Date().toISOString(),
      isOnline: true,
      stats: {
        totalWins: 157,
        totalGamesPlayed: 342,
        favoriteGame: 'Gates of Olympus',
        winStreak: 7,
        totalEarnings: 2847.50,
        rank: 12
      },
      preferences: {
        showOnlineStatus: true,
        allowFriendRequests: true,
        showActivityFeed: true,
        allowDirectMessages: true
      },
      badges: this.getMockBadges().slice(0, 5),
      socialScore: 8750,
      country: 'US',
      bio: 'Professional slot player and social gaming enthusiast!'
    };
  }

  private getMockPosts(): SocialPost[] {
    const now = new Date();
    return [
      {
        id: '1',
        authorId: 'user1',
        author: {
          username: 'LuckySpinner',
          displayName: 'Lucky Spinner',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucky',
          level: 23
        },
        content: "Just hit a massive win on Sweet Bonanza! 🍭💰 The multipliers were insane!",
        images: [],
        type: 'win',
        metadata: {
          gameId: 'sweet-bonanza',
          gameName: 'Sweet Bonanza',
          winAmount: 450.75
        },
        likes: 23,
        comments: 5,
        shares: 3,
        hasLiked: false,
        hasShared: false,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        tags: ['win', 'slots', 'sweetbonanza'],
        visibility: 'public'
      },
      {
        id: '2',
        authorId: 'user2',
        author: {
          username: 'SlotMaster',
          displayName: 'Slot Master',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=slotmaster',
          level: 31
        },
        content: "Finally reached level 30! 🎉 Thanks to everyone who helped along the way. The grind was real but so worth it!",
        images: [],
        type: 'milestone',
        metadata: {
          achievementId: 'level-30'
        },
        likes: 45,
        comments: 12,
        shares: 7,
        hasLiked: true,
        hasShared: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        tags: ['achievement', 'level-up'],
        visibility: 'public'
      },
      {
        id: '3',
        authorId: 'user3',
        author: {
          username: 'CoinCollector',
          displayName: 'Coin Collector',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=collector',
          level: 18
        },
        content: "Who's ready for the weekend tournament? 🏆 The prize pool is looking amazing! Let's see who can claim the crown this time 👑",
        images: [],
        type: 'tournament',
        metadata: {
          tournamentId: 'weekend-warrior'
        },
        likes: 18,
        comments: 8,
        shares: 4,
        hasLiked: false,
        hasShared: false,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        tags: ['tournament', 'competition'],
        visibility: 'public'
      }
    ];
  }

  private getMockFriends(): SocialUser[] {
    return [
      {
        ...this.getMockUser('friend1'),
        username: 'SpinQueen',
        displayName: 'Spin Queen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=spinqueen',
        level: 28,
        isOnline: true
      },
      {
        ...this.getMockUser('friend2'),
        username: 'JackpotJoe',
        displayName: 'Jackpot Joe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jackpotjoe',
        level: 22,
        isOnline: false
      }
    ];
  }

  private getMockFriendRequests(): FriendRequest[] {
    return [
      {
        id: '1',
        fromUserId: 'user4',
        toUserId: 'current-user',
        fromUser: {
          username: 'NewPlayer',
          displayName: 'New Player',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newplayer',
          level: 5
        },
        toUser: {
          username: 'current-user',
          displayName: 'Current User',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
          level: 25
        },
        status: 'pending',
        message: 'Hey! I saw your big win posts. Would love to be friends and share tips!',
        createdAt: new Date().toISOString()
      }
    ];
  }

  private getMockGroups(): SocialGroup[] {
    return [
      {
        id: '1',
        name: 'High Rollers Club',
        description: 'For serious players who play big and win bigger!',
        avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=highrollers',
        banner: '/groups/high-rollers-banner.jpg',
        category: 'Gaming',
        memberCount: 1247,
        isPrivate: false,
        requirements: {
          minLevel: 20,
          approval: true
        },
        owner: {
          id: 'owner1',
          username: 'BigWinner',
          displayName: 'Big Winner',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bigwinner'
        },
        moderators: [],
        tags: ['high-stakes', 'vip', 'serious-players'],
        createdAt: '2024-01-01T00:00:00Z',
        rules: [
          'Respect all members',
          'No spam or self-promotion',
          'Share wins and strategies',
          'Help new members learn'
        ],
        stats: {
          totalPosts: 342,
          activeMembers: 156,
          totalWins: 89
        }
      },
      {
        id: '2',
        name: 'Slot Enthusiasts',
        description: 'All about slots! Share your wins, strategies, and favorite games.',
        avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=slots',
        banner: '/groups/slots-banner.jpg',
        category: 'Games',
        memberCount: 892,
        isPrivate: false,
        requirements: {},
        owner: {
          id: 'owner2',
          username: 'SlotFan',
          displayName: 'Slot Fan',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=slotfan'
        },
        moderators: [],
        tags: ['slots', 'casual', 'friendly'],
        createdAt: '2024-02-01T00:00:00Z',
        rules: [
          'Keep discussions slot-related',
          'Be respectful and supportive',
          'Share your wins and losses',
          'Help others with game tips'
        ],
        stats: {
          totalPosts: 567,
          activeMembers: 234,
          totalWins: 123
        }
      }
    ];
  }

  private getMockChallenges(): SocialChallenge[] {
    return [
      {
        id: '1',
        title: 'Daily Win Streak',
        description: 'Get 5 wins in a row within 24 hours',
        type: 'daily',
        category: 'individual',
        requirements: {
          targetWins: 5,
          timeLimit: 24 * 60 * 60 * 1000
        },
        rewards: {
          gc: 1000,
          experience: 500,
          badges: ['win-streak-master']
        },
        participants: 234,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        leaderboard: [
          {
            userId: '1',
            username: 'SpeedWinner',
            displayName: 'Speed Winner',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=speed',
            score: 4,
            rank: 1
          }
        ]
      },
      {
        id: '2',
        title: 'Weekend Warrior',
        description: 'Win 50,000 GC over the weekend',
        type: 'weekly',
        category: 'individual',
        requirements: {
          targetAmount: 50000,
          timeLimit: 3 * 24 * 60 * 60 * 1000
        },
        rewards: {
          gc: 5000,
          sc: 25,
          experience: 2000,
          badges: ['weekend-warrior']
        },
        participants: 156,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        leaderboard: [
          {
            userId: '2',
            username: 'GoldHunter',
            displayName: 'Gold Hunter',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=goldhunter',
            score: 35000,
            rank: 1
          }
        ]
      }
    ];
  }

  private getMockTournaments(): SocialTournament[] {
    return [
      {
        id: '1',
        name: 'Sunday Slots Championship',
        description: 'Weekly tournament featuring the best slot games',
        gameId: 'gates-of-olympus',
        gameName: 'Gates of Olympus',
        type: 'leaderboard',
        entryFee: {
          type: 'GC',
          amount: 1000
        },
        maxParticipants: 100,
        currentParticipants: 78,
        prizePool: {
          gc: 50000,
          sc: 250,
          special: ['Exclusive Tournament Badge', 'VIP Status for 1 month']
        },
        status: 'registration',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        rules: [
          'Must be level 10 or higher',
          'Play only the designated game',
          'Highest total wins determine ranking',
          'Tournament runs for 24 hours'
        ],
        leaderboard: []
      }
    ];
  }

  private getMockMessages(): DirectMessage[] {
    const now = new Date();
    return [
      {
        id: '1',
        fromUserId: 'friend1',
        toUserId: 'current-user',
        fromUser: {
          username: 'SpinQueen',
          displayName: 'Spin Queen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=spinqueen'
        },
        toUser: {
          username: 'current-user',
          displayName: 'Current User',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current'
        },
        content: 'Hey! Did you see the new tournament? We should team up!',
        type: 'text',
        isRead: false,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        fromUserId: 'current-user',
        toUserId: 'friend1',
        fromUser: {
          username: 'current-user',
          displayName: 'Current User',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current'
        },
        toUser: {
          username: 'SpinQueen',
          displayName: 'Spin Queen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=spinqueen'
        },
        content: 'Absolutely! I was thinking the same thing. Let\'s practice together first.',
        type: 'text',
        isRead: true,
        createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
      }
    ];
  }

  private getMockNotifications(): SocialNotification[] {
    const now = new Date();
    return [
      {
        id: '1',
        userId: 'current-user',
        type: 'friend_request',
        title: 'New Friend Request',
        message: 'NewPlayer wants to be your friend',
        icon: '👥',
        isRead: false,
        actionUrl: '/social/friends',
        createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        userId: 'current-user',
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You earned the "Social Butterfly" badge',
        icon: '🏆',
        isRead: false,
        actionUrl: '/social/profile',
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        userId: 'current-user',
        type: 'challenge_invite',
        title: 'Challenge Invitation',
        message: 'SpinQueen invited you to the Daily Win Streak challenge',
        icon: '⚡',
        isRead: true,
        actionUrl: '/social/challenges',
        createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private getMockLeaderboard(): SocialUser[] {
    return [
      {
        ...this.getMockUser('leader1'),
        username: 'TopPlayer',
        displayName: 'Top Player',
        stats: { ...this.getMockUser('leader1').stats, rank: 1, totalWins: 500 }
      },
      {
        ...this.getMockUser('leader2'),
        username: 'WinMaster',
        displayName: 'Win Master',
        stats: { ...this.getMockUser('leader2').stats, rank: 2, totalWins: 450 }
      },
      {
        ...this.getMockUser('leader3'),
        username: 'LuckyPlayer',
        displayName: 'Lucky Player',
        stats: { ...this.getMockUser('leader3').stats, rank: 3, totalWins: 400 }
      }
    ];
  }

  private getMockBadges(): SocialBadge[] {
    return [
      {
        id: '1',
        name: 'First Win',
        description: 'Win your first game',
        icon: '🎯',
        rarity: 'common',
        category: 'achievement',
        requirements: 'Win any game',
        unlockedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Social Butterfly',
        description: 'Make 10 friends',
        icon: '🦋',
        rarity: 'rare',
        category: 'social',
        requirements: 'Add 10 friends',
        unlockedAt: '2024-02-01T15:45:00Z'
      },
      {
        id: '3',
        name: 'High Roller',
        description: 'Win 10,000 GC in a single game',
        icon: '💎',
        rarity: 'epic',
        category: 'gaming',
        requirements: 'Single game win of 10,000+ GC',
        unlockedAt: '2024-02-15T09:20:00Z'
      },
      {
        id: '4',
        name: 'Legendary Player',
        description: 'Reach level 50',
        icon: '👑',
        rarity: 'legendary',
        category: 'achievement',
        requirements: 'Reach player level 50',
        progress: {
          current: 25,
          required: 50
        }
      },
      {
        id: '5',
        name: 'Tournament Champion',
        description: 'Win a tournament',
        icon: '🏆',
        rarity: 'epic',
        category: 'gaming',
        requirements: 'Win any tournament',
        progress: {
          current: 0,
          required: 1
        }
      }
    ];
  }
}

export const socialService = SocialService.getInstance();
export default socialService;
