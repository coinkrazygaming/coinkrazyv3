import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageCircle,
  Trophy,
  Crown,
  Star,
  Activity,
  Heart,
  Target,
  Gift,
  Bell,
  TrendingUp,
  Zap,
  Plus,
  ArrowRight,
  CheckCircle,
  Coins,
  Award,
  Flame
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { socialService, SocialPost, SocialUser, SocialNotification, SocialActivity } from '../services/socialService';

interface SocialStats {
  friends: number;
  unreadMessages: number;
  unreadNotifications: number;
  activeChallenges: number;
  todayWins: number;
  level: number;
  socialScore: number;
}

export default function SocialHubWidget() {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState<SocialPost[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<SocialUser[]>([]);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [socialStats, setSocialStats] = useState<SocialStats>({
    friends: 0,
    unreadMessages: 0,
    unreadNotifications: 0,
    activeChallenges: 0,
    todayWins: 0,
    level: 1,
    socialScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSocialData();
    }
  }, [user]);

  const loadSocialData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [
        feedData,
        friendsData,
        notificationsData,
        userProfile,
        challengesData
      ] = await Promise.all([
        socialService.getSocialFeed(1, 5), // Get latest 5 posts
        socialService.getFriends(),
        socialService.getNotifications(),
        socialService.getUserProfile(user.id),
        socialService.getChallenges()
      ]);

      setRecentPosts(feedData);
      setOnlineFriends(friendsData.filter(friend => friend.isOnline).slice(0, 8));
      setNotifications(notificationsData.filter(n => !n.isRead));

      // Calculate social stats
      setSocialStats({
        friends: friendsData.length,
        unreadMessages: 0, // Would need to implement message counting
        unreadNotifications: notificationsData.filter(n => !n.isRead).length,
        activeChallenges: challengesData.filter(c => c.status === 'active').length,
        todayWins: 12, // Mock data
        level: userProfile?.level || 1,
        socialScore: userProfile?.socialScore || 0
      });
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Join the Community!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect with other players, share wins, and compete in challenges.
          </p>
          <Link to="/login">
            <Button>Sign In to Connect</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Social Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Social Stats Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Social Hub
            </CardTitle>
            <Link to="/social">
              <Button variant="outline" size="sm">
                <ArrowRight className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{socialStats.friends}</div>
              <div className="text-xs text-muted-foreground">Friends</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <Trophy className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{socialStats.level}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Star className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{socialStats.socialScore}</div>
              <div className="text-xs text-muted-foreground">Social Score</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <Target className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{socialStats.activeChallenges}</div>
              <div className="text-xs text-muted-foreground">Challenges</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/social?tab=feed">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Share Win
              </Button>
            </Link>
            <Link to="/social?tab=friends">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </Link>
            <Link to="/social?tab=challenges">
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Join Challenge
              </Button>
            </Link>
            <Link to="/social?tab=achievements">
              <Button variant="outline" className="w-full justify-start">
                <Award className="h-4 w-4 mr-2" />
                View Badges
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              <Badge variant="destructive">{notifications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className="flex items-start gap-3 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span className="text-lg">{notification.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {notifications.length > 3 && (
              <div className="mt-3">
                <Link to="/social?tab=profile">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All {notifications.length} Notifications
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Online Friends */}
      {onlineFriends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Online Friends
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-normal text-muted-foreground">
                  {onlineFriends.length}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {onlineFriends.slice(0, 5).map(friend => (
                <div key={friend.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{friend.displayName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Trophy className="h-3 w-3" />
                      Level {friend.level}
                    </div>
                  </div>
                  <Link to={`/social?tab=messages&user=${friend.id}`}>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            {onlineFriends.length > 5 && (
              <div className="mt-3">
                <Link to="/social?tab=friends">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Friends
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {recentPosts.slice(0, 3).map(post => (
                <div key={post.id} className="border rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{post.author.displayName}</p>
                        <Badge variant="outline" className="text-xs">
                          Level {post.author.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(post.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                      
                      {/* Post Metadata */}
                      {post.metadata && post.type === 'win' && post.metadata.winAmount && (
                        <div className="mt-2">
                          <Badge className="bg-green-500 text-xs">
                            <Coins className="h-3 w-3 mr-1" />
                            +{post.metadata.winAmount.toLocaleString()} GC
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.comments}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-3">
            <Link to="/social?tab=feed">
              <Button variant="ghost" size="sm" className="w-full">
                View Full Feed
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Today's Achievements */}
      <Card className="bg-gradient-to-br from-gold-500/10 to-yellow-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold-500" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-green-500" />
                <span className="text-sm">Wins Today</span>
              </div>
              <Badge className="bg-green-500">{socialStats.todayWins}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Win Streak</span>
              </div>
              <Badge className="bg-orange-500">7</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-500" />
                <span className="text-sm">XP Gained</span>
              </div>
              <Badge className="bg-blue-500">+1,250</Badge>
            </div>
          </div>
          
          <div className="mt-4">
            <Link to="/social?tab=achievements">
              <Button variant="outline" size="sm" className="w-full border-gold-500 text-gold-600 hover:bg-gold-50">
                <Award className="h-4 w-4 mr-2" />
                View All Achievements
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
