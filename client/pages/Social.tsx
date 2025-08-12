import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  Trophy,
  Crown,
  Star,
  Plus,
  Search,
  Filter,
  Settings,
  Bell,
  Send,
  Camera,
  MapPin,
  Calendar,
  Target,
  Zap,
  Gift,
  Award,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ThumbsUp,
  MessageSquare,
  UserPlus,
  UserCheck,
  Flame,
  Sparkles,
  Coins,
  Gamepad2,
  BarChart3,
  Globe,
  Lock,
  Unlock,
  Info,
  Edit,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { socialService, SocialPost, SocialUser, FriendRequest, SocialGroup, SocialChallenge, SocialTournament, DirectMessage, SocialNotification, SocialBadge } from '../services/socialService';
import SocialActivitiesFeed from '../components/SocialActivitiesFeed';
import SocialAchievements from '../components/SocialAchievements';

export default function Social() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [loading, setLoading] = useState(true);
  
  // Feed State
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<SocialPost['type']>('text');
  
  // Friends State
  const [friends, setFriends] = useState<SocialUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchUsers, setSearchUsers] = useState('');
  
  // Groups State
  const [groups, setGroups] = useState<SocialGroup[]>([]);
  const [searchGroups, setSearchGroups] = useState('');
  
  // Challenges State
  const [challenges, setChallenges] = useState<SocialChallenge[]>([]);
  
  // Tournaments State
  const [tournaments, setTournaments] = useState<SocialTournament[]>([]);
  
  // Messages State
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Notifications State
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Profile State
  const [userProfile, setUserProfile] = useState<SocialUser | null>(null);
  const [userBadges, setUserBadges] = useState<SocialBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<SocialUser[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'messages' && selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [activeTab, selectedConversation]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [
        feedData,
        friendsData,
        requestsData,
        groupsData,
        challengesData,
        tournamentsData,
        notificationsData,
        profileData,
        badgesData,
        leaderboardData
      ] = await Promise.all([
        socialService.getSocialFeed(),
        socialService.getFriends(),
        socialService.getFriendRequests(),
        socialService.getGroups(),
        socialService.getChallenges(),
        socialService.getTournaments(),
        socialService.getNotifications(),
        user ? socialService.getUserProfile(user.id) : null,
        socialService.getUserBadges(),
        socialService.getLeaderboard()
      ]);

      setPosts(feedData);
      setFriends(friendsData);
      setFriendRequests(requestsData);
      setGroups(groupsData);
      setChallenges(challengesData);
      setTournaments(tournamentsData);
      setNotifications(notificationsData);
      setUserProfile(profileData);
      setUserBadges(badgesData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const messagesData = await socialService.getDirectMessages(userId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const success = await socialService.createPost(newPost, postType);
      if (success) {
        setNewPost('');
        setPostType('text');
        // Reload feed
        const feedData = await socialService.getSocialFeed();
        setPosts(feedData);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await socialService.likePost(postId);
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, hasLiked: !post.hasLiked, likes: post.hasLiked ? post.likes - 1 : post.likes + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const success = await socialService.sendDirectMessage(selectedConversation, newMessage);
      if (success) {
        setNewMessage('');
        loadMessages(selectedConversation);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const success = await socialService.joinChallenge(challengeId);
      if (success) {
        // Reload challenges
        const challengesData = await socialService.getChallenges();
        setChallenges(challengesData);
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const success = await socialService.joinGroup(groupId);
      if (success) {
        // Reload groups
        const groupsData = await socialService.getGroups();
        setGroups(groupsData);
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleFriendRequest = async (userId: string, accept: boolean) => {
    try {
      const success = await socialService.respondToFriendRequest(userId, accept);
      if (success) {
        // Reload friend requests and friends
        const [requestsData, friendsData] = await Promise.all([
          socialService.getFriendRequests(),
          socialService.getFriends()
        ]);
        setFriendRequests(requestsData);
        setFriends(friendsData);
      }
    } catch (error) {
      console.error('Error responding to friend request:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const getBadgeIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '👑';
      case 'epic': return '💎';
      case 'rare': return '⭐';
      default: return '🏅';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'completed': return 'text-blue-500';
      case 'expired': return 'text-gray-500';
      case 'registration': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Social Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Social Hub
          </h1>
          <p className="text-muted-foreground">
            Connect, compete, and celebrate with the CoinKrazy community
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500">
                    {notifications.filter(n => !n.isRead).length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notifications</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`p-3 rounded-lg border ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{notification.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* User Profile Quick View */}
          {userProfile && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3">
              <Avatar>
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>{userProfile.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userProfile.displayName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-3 w-3" />
                  Level {userProfile.level}
                  <Badge variant="secondary">{userProfile.socialScore} pts</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
          <TabsTrigger value="feed">
            <Activity className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Feed</span>
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Zap className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Live</span>
          </TabsTrigger>
          <TabsTrigger value="friends">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Friends</span>
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Globe className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Groups</span>
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Challenges</span>
          </TabsTrigger>
          <TabsTrigger value="tournaments">
            <Crown className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Tournaments</span>
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
          <TabsTrigger value="profile">
            <Award className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
        </TabsList>

        {/* Social Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          {/* Create Post */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What's happening in your gaming world?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    Achievement
                  </Button>
                  <Button variant="outline" size="sm">
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Game
                  </Button>
                </div>
                <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.author.displayName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>@{post.author.username}</span>
                          <Badge variant="outline">Level {post.author.level}</Badge>
                          <span>•</span>
                          <span>{formatTimeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-lg mb-2">{post.content}</p>
                    
                    {/* Post Metadata */}
                    {post.metadata && (
                      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 mt-3">
                        {post.type === 'win' && post.metadata.winAmount && (
                          <div className="flex items-center gap-2">
                            <Coins className="h-5 w-5 text-gold-500" />
                            <span className="font-bold text-gold-500">
                              +{post.metadata.winAmount.toLocaleString()} GC
                            </span>
                            <span className="text-muted-foreground">
                              on {post.metadata.gameName}
                            </span>
                          </div>
                        )}
                        {post.type === 'achievement' && (
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <span className="font-bold">Achievement Unlocked!</span>
                          </div>
                        )}
                        {post.type === 'milestone' && (
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-blue-500" />
                            <span className="font-bold">Milestone Reached!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post.id)}
                        className={post.hasLiked ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${post.hasLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        {post.shares}
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <SocialActivitiesFeed />
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-6">
          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Friend Requests ({friendRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {friendRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.fromUser.avatar} />
                          <AvatarFallback>{request.fromUser.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.fromUser.displayName}</p>
                          <p className="text-sm text-muted-foreground">@{request.fromUser.username} • Level {request.fromUser.level}</p>
                          {request.message && (
                            <p className="text-sm mt-1 italic">"{request.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleFriendRequest(request.id, true)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFriendRequest(request.id, false)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Friends */}
          <Card>
            <CardHeader>
              <CardTitle>Find Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username or display name..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                />
                <Button>Search</Button>
              </div>
            </CardContent>
          </Card>

          {/* Friends List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Friends ({friends.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map(friend => (
                  <Card key={friend.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {friend.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{friend.displayName}</p>
                        <p className="text-sm text-muted-foreground">@{friend.username}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Level:</span>
                        <Badge variant="outline">{friend.level}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Wins:</span>
                        <span className="font-medium">{friend.stats.totalWins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={friend.isOnline ? 'text-green-500' : 'text-muted-foreground'}>
                          {friend.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          {/* Search Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Discover Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups by name or category..."
                  value={searchGroups}
                  onChange={(e) => setSearchGroups(e.target.value)}
                />
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <Card key={group.id} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-500 relative">
                  {group.banner && (
                    <img src={group.banner} alt={group.name} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <Avatar className="border-2 border-white">
                      <AvatarImage src={group.avatar} />
                      <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {group.isPrivate ? (
                      <Lock className="h-4 w-4 text-white" />
                    ) : (
                      <Unlock className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg">{group.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Members:</span>
                      <span className="font-medium">{group.memberCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <Badge variant="outline">{group.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Posts:</span>
                      <span className="font-medium">{group.stats.totalPosts}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {group.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={group.requirements.inviteOnly}
                  >
                    {group.requirements.inviteOnly ? 'Invite Only' : 'Join Group'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {challenges.map(challenge => (
              <Card key={challenge.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {challenge.title}
                    </CardTitle>
                    <Badge className={getStatusColor(challenge.status)}>
                      {challenge.status}
                    </Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Type:</span>
                      <Badge variant="outline">{challenge.type}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Category:</span>
                      <Badge variant="outline">{challenge.category}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Participants:</span>
                      <span className="font-medium">{challenge.participants}</span>
                    </div>
                    
                    {/* Challenge Requirements */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                      <div className="space-y-1 text-sm">
                        {challenge.requirements.targetWins && (
                          <div>• Win {challenge.requirements.targetWins} games</div>
                        )}
                        {challenge.requirements.targetAmount && (
                          <div>• Earn {challenge.requirements.targetAmount.toLocaleString()} GC</div>
                        )}
                        {challenge.requirements.timeLimit && (
                          <div>• Complete within {Math.floor(challenge.requirements.timeLimit / (1000 * 60 * 60))} hours</div>
                        )}
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="bg-gradient-to-r from-gold-500/10 to-yellow-500/10 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Rewards:</h4>
                      <div className="space-y-1 text-sm">
                        {challenge.rewards.gc && (
                          <div className="flex items-center gap-1">
                            <Coins className="h-3 w-3 text-gold-500" />
                            {challenge.rewards.gc.toLocaleString()} GC
                          </div>
                        )}
                        {challenge.rewards.sc && (
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3 text-purple-500" />
                            {challenge.rewards.sc} SC
                          </div>
                        )}
                        {challenge.rewards.experience && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-blue-500" />
                            {challenge.rewards.experience} XP
                          </div>
                        )}
                        {challenge.rewards.badges && (
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-green-500" />
                            {challenge.rewards.badges.length} Badge(s)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                      <span>{Math.floor((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60))}h left</span>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={challenge.status !== 'active'}
                    >
                      {challenge.status === 'active' ? 'Join Challenge' : 'Challenge Ended'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tournaments.map(tournament => (
              <Card key={tournament.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-gold-500/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      {tournament.name}
                    </CardTitle>
                    <Badge className={getStatusColor(tournament.status)}>
                      {tournament.status}
                    </Badge>
                  </div>
                  <CardDescription>{tournament.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Game:</span>
                      <Badge variant="outline">{tournament.gameName}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Type:</span>
                      <Badge variant="outline">{tournament.type}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Participants:</span>
                      <span className="font-medium">
                        {tournament.currentParticipants}/{tournament.maxParticipants}
                      </span>
                    </div>
                    
                    {/* Entry Fee */}
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Entry Fee:</h4>
                      <div className="text-sm">
                        {tournament.entryFee.type === 'free' ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          <span className="font-medium">
                            {tournament.entryFee.amount} {tournament.entryFee.type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prize Pool */}
                    <div className="bg-gradient-to-r from-gold-500/10 to-yellow-500/10 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Prize Pool:</h4>
                      <div className="space-y-1 text-sm">
                        {tournament.prizePool.gc && (
                          <div className="flex items-center gap-1">
                            <Coins className="h-3 w-3 text-gold-500" />
                            {tournament.prizePool.gc.toLocaleString()} GC
                          </div>
                        )}
                        {tournament.prizePool.sc && (
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3 text-purple-500" />
                            {tournament.prizePool.sc} SC
                          </div>
                        )}
                        {tournament.prizePool.special && (
                          <div className="text-xs text-muted-foreground">
                            + {tournament.prizePool.special.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Starts: {new Date(tournament.startDate).toLocaleDateString()}</span>
                      <span>Duration: {Math.floor((new Date(tournament.endDate).getTime() - new Date(tournament.startDate).getTime()) / (1000 * 60 * 60))}h</span>
                    </div>

                    <Button 
                      className="w-full" 
                      disabled={tournament.status !== 'registration' || tournament.currentParticipants >= tournament.maxParticipants}
                    >
                      {tournament.status === 'registration' ? 
                        (tournament.currentParticipants >= tournament.maxParticipants ? 'Full' : 'Register') : 
                        'Registration Closed'
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <SocialAchievements />
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-1 p-4">
                    {friends.map(friend => (
                      <div
                        key={friend.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted ${
                          selectedConversation === friend.id ? 'bg-blue-50 dark:bg-blue-950' : ''
                        }`}
                        onClick={() => setSelectedConversation(friend.id)}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={friend.avatar} />
                            <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {friend.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{friend.displayName}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {friend.isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2">
              {selectedConversation ? (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {(() => {
                        const friend = friends.find(f => f.id === selectedConversation);
                        return friend ? (
                          <>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={friend.avatar} />
                              <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-base">{friend.displayName}</p>
                              <p className="text-sm font-normal text-muted-foreground">
                                {friend.isOnline ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </>
                        ) : null;
                      })()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-[400px]">
                    {/* Messages */}
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        {messages.map(message => (
                          <div
                            key={message.id}
                            className={`flex ${message.fromUserId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                message.fromUserId === user?.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-muted'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.fromUserId === user?.id
                                    ? 'text-blue-100'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {formatTimeAgo(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="flex items-center gap-2 mt-4">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-[500px]">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {userProfile && (
            <>
              {/* Profile Header */}
              <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <CardContent className="p-6 -mt-16 relative">
                  <div className="flex items-end gap-6 mb-6">
                    <Avatar className="h-24 w-24 border-4 border-white">
                      <AvatarImage src={userProfile.avatar} />
                      <AvatarFallback className="text-2xl">{userProfile.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{userProfile.displayName}</h2>
                      <p className="text-muted-foreground">@{userProfile.username}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className="bg-blue-500">Level {userProfile.level}</Badge>
                        <Badge variant="outline">{userProfile.socialScore} Social Score</Badge>
                        <Badge variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          {userProfile.country}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>

                  {userProfile.bio && (
                    <div className="mb-6">
                      <p className="text-muted-foreground">{userProfile.bio}</p>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-500">{userProfile.stats.totalWins}</div>
                      <div className="text-sm text-muted-foreground">Total Wins</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{userProfile.stats.totalGamesPlayed}</div>
                      <div className="text-sm text-muted-foreground">Games Played</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-gold-500">${userProfile.stats.totalEarnings}</div>
                      <div className="text-sm text-muted-foreground">Total Earnings</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-500">#{userProfile.stats.rank}</div>
                      <div className="text-sm text-muted-foreground">Global Rank</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements & Badges ({userBadges.filter(b => b.unlockedAt).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userBadges.map(badge => (
                      <div 
                        key={badge.id} 
                        className={`p-4 rounded-lg border ${
                          badge.unlockedAt ? 'bg-gradient-to-r from-gold-500/10 to-yellow-500/10' : 'bg-muted/50 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl">{badge.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium">{badge.name}</h4>
                            <p className="text-sm text-muted-foreground">{badge.description}</p>
                          </div>
                          <div className="text-2xl">{getBadgeIcon(badge.rarity)}</div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline">{badge.rarity}</Badge>
                          {badge.unlockedAt ? (
                            <span className="text-green-600">Unlocked</span>
                          ) : badge.progress ? (
                            <span className="text-muted-foreground">
                              {badge.progress.current}/{badge.progress.required}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Locked</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Global Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((player, index) => (
                      <div key={player.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-gold-500 to-yellow-500 text-white font-bold">
                          {index + 1}
                        </div>
                        <Avatar>
                          <AvatarImage src={player.avatar} />
                          <AvatarFallback>{player.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{player.displayName}</p>
                          <p className="text-sm text-muted-foreground">Level {player.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-500">{player.stats.totalWins} wins</p>
                          <p className="text-sm text-muted-foreground">{player.socialScore} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
