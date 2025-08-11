import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlobalChat from '@/components/GlobalChat';
import { MessageCircle, Users, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Chat() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            Chat Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect with other players, join discussions, and get support
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Online
        </Badge>
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Global Chat
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Game Rooms
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Moderation
            </TabsTrigger>
          )}
        </TabsList>

        {/* Global Chat Tab */}
        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Global Chat
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Join the community conversation with players from around the world
              </p>
            </CardHeader>
            <CardContent>
              <GlobalChat />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Rooms Tab */}
        <TabsContent value="rooms" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Slots Room */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  🎰 Slots Chat
                  <Badge variant="secondary">24 online</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Discuss slot strategies and share your wins
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-muted-foreground">
                  Coming Soon
                </div>
              </CardContent>
            </Card>

            {/* Bingo Room */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  🎯 Bingo Chat
                  <Badge variant="secondary">12 online</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Connect with other bingo enthusiasts
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-muted-foreground">
                  Coming Soon
                </div>
              </CardContent>
            </Card>

            {/* General Room */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  💬 General Chat
                  <Badge variant="secondary">67 online</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  General discussions and community chat
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-muted-foreground">
                  Available in Global Chat
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize your chat experience and privacy settings
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chat settings panel coming soon</p>
                <p className="text-sm">Configure notifications, privacy, and more</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Tab (Admin/Staff only) */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Chat Moderation
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Moderate chat messages and manage user behavior
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Moderation tools coming soon</p>
                  <p className="text-sm">Manage messages, users, and chat policies</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
