import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { 
  Users, 
  Database, 
  Settings, 
  BarChart3, 
  Shield, 
  Monitor,
  FileText,
  Edit3,
  Save,
  Trash2,
  Plus,
  Eye,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  Coins,
  TrendingUp,
  Activity,
  Globe,
  Lock,
  Unlock,
  Mail,
  Bell,
  Calendar,
  Clock,
  Search
} from 'lucide-react';
import { realNeonService, UserData, AdminAction } from '../services/realNeonService';
import { authService } from '../services/authService';

interface CMSContent {
  id: string;
  type: 'page' | 'component' | 'banner' | 'popup';
  title: string;
  slug: string;
  content: string;
  published: boolean;
  meta: {
    description?: string;
    keywords?: string[];
    author?: string;
  };
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

interface SystemConfig {
  site_name: string;
  site_description: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  min_deposit: number;
  max_deposit: number;
  default_gc_bonus_rate: number;
  default_sc_bonus_rate: number;
  kyc_required: boolean;
  email_verification_required: boolean;
  support_email: string;
  support_phone: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  seo_settings: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
}

const ComprehensiveAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<UserData[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [cmsContent, setCmsContent] = useState<CMSContent[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editingContent, setEditingContent] = useState<CMSContent | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      if (realNeonService.isConnected()) {
        // Load users
        const allUsers = await realNeonService.getAllUsers(100);
        setUsers(allUsers);

        // Load admin actions
        const actions = await realNeonService.getAdminActions(50);
        setAdminActions(actions);

        // Load system stats
        const healthCheck = await realNeonService.healthCheck();
        setSystemStats({
          status: healthCheck.status,
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter(u => u.status === 'active').length,
          totalTransactions: 0, // Would be fetched from DB
          systemUptime: '99.9%',
          databaseConnections: 5,
          lastBackup: new Date(),
        });
      }

      // Load CMS content from localStorage (in production, this would be from DB)
      loadCMSContent();
      loadSystemConfig();

    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCMSContent = () => {
    try {
      const stored = localStorage.getItem('cms_content');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCmsContent(parsed.map((item: any) => ({
          ...item,
          created_at: new Date(item.created_at),
          updated_at: new Date(item.updated_at)
        })));
      } else {
        // Initialize with default content
        const defaultContent: CMSContent[] = [
          {
            id: 'home_hero',
            type: 'component',
            title: 'Homepage Hero Section',
            slug: 'home-hero',
            content: JSON.stringify({
              headline: 'Welcome to CoinKrazy',
              subheadline: 'The Ultimate Sweepstakes Casino Experience',
              buttonText: 'Start Playing Now',
              backgroundImage: '/hero-bg.jpg'
            }),
            published: true,
            meta: {
              description: 'Main hero section for homepage'
            },
            settings: {
              showButton: true,
              buttonColor: 'purple',
              textAlign: 'center'
            },
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 'terms_page',
            type: 'page',
            title: 'Terms of Service',
            slug: 'terms-of-service',
            content: '<h1>Terms of Service</h1><p>Welcome to CoinKrazy...</p>',
            published: true,
            meta: {
              description: 'Terms of Service page',
              keywords: ['terms', 'service', 'legal']
            },
            settings: {},
            created_at: new Date(),
            updated_at: new Date()
          }
        ];
        setCmsContent(defaultContent);
        localStorage.setItem('cms_content', JSON.stringify(defaultContent));
      }
    } catch (error) {
      console.error('Failed to load CMS content:', error);
    }
  };

  const loadSystemConfig = () => {
    try {
      const stored = localStorage.getItem('system_config');
      if (stored) {
        setSystemConfig(JSON.parse(stored));
      } else {
        const defaultConfig: SystemConfig = {
          site_name: 'CoinKrazy',
          site_description: 'The Ultimate Sweepstakes Casino Experience',
          maintenance_mode: false,
          registration_enabled: true,
          min_deposit: 5,
          max_deposit: 500,
          default_gc_bonus_rate: 0.1,
          default_sc_bonus_rate: 0.05,
          kyc_required: false,
          email_verification_required: true,
          support_email: 'support@coinfrazy.com',
          support_phone: '319-473-0416',
          social_links: {
            facebook: 'https://facebook.com/coinfrazy',
            twitter: 'https://twitter.com/coinfrazy',
            instagram: 'https://instagram.com/coinfrazy'
          },
          seo_settings: {
            meta_title: 'CoinKrazy - Sweepstakes Casino',
            meta_description: 'Play free sweepstakes casino games and win real prizes',
            keywords: ['sweepstakes', 'casino', 'free games', 'prizes']
          }
        };
        setSystemConfig(defaultConfig);
        localStorage.setItem('system_config', JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Failed to load system config:', error);
    }
  };

  const saveCMSContent = (content: CMSContent) => {
    try {
      const updatedContent = cmsContent.map(item => 
        item.id === content.id ? { ...content, updated_at: new Date() } : item
      );
      
      if (!cmsContent.find(item => item.id === content.id)) {
        updatedContent.push({ ...content, created_at: new Date(), updated_at: new Date() });
      }

      setCmsContent(updatedContent);
      localStorage.setItem('cms_content', JSON.stringify(updatedContent));
      setEditingContent(null);
      
      // Log admin action
      if (realNeonService.isConnected()) {
        realNeonService.logAdminAction({
          admin_user_id: 'admin_coinkrazy_001',
          action: 'cms_content_updated',
          target_type: 'system',
          target_id: content.id,
          details: {
            contentType: content.type,
            title: content.title,
            published: content.published
          },
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Failed to save CMS content:', error);
    }
  };

  const saveSystemConfig = (config: SystemConfig) => {
    try {
      setSystemConfig(config);
      localStorage.setItem('system_config', JSON.stringify(config));
      
      // Log admin action
      if (realNeonService.isConnected()) {
        realNeonService.logAdminAction({
          admin_user_id: 'admin_coinkrazy_001',
          action: 'system_config_updated',
          target_type: 'system',
          details: { configKeys: Object.keys(config) },
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Failed to save system config:', error);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      if (realNeonService.isConnected()) {
        await realNeonService.updateUser(userId, { status: status as any });
        
        // Log admin action
        await realNeonService.logAdminAction({
          admin_user_id: 'admin_coinkrazy_001',
          action: 'user_status_updated',
          target_type: 'user',
          target_id: userId,
          details: { newStatus: status },
          severity: 'warning'
        });

        // Refresh users
        const updatedUsers = await realNeonService.getAllUsers(100);
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            Comprehensive Admin Panel
          </CardTitle>
          <CardDescription>
            Complete administrative control and content management system
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="cms">CMS</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Total Users</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {systemStats?.totalUsers || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Active Users</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {systemStats?.activeUsers || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">System Status</span>
                </div>
                <div className="text-2xl font-bold mt-2 text-green-600">
                  {systemStats?.status || 'Unknown'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">Uptime</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {systemStats?.systemUptime || '0%'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Admin Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminActions.slice(0, 5).map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{action.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {action.admin_user_id} • {new Date(action.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={action.severity === 'error' ? 'destructive' : 'default'}>
                        {action.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Database Connection</span>
                  <Badge variant="default">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Neon Database</span>
                  <Badge variant={realNeonService.isConnected() ? 'default' : 'destructive'}>
                    {realNeonService.isConnected() ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Online
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Offline
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Maintenance Mode</span>
                  <Badge variant={systemConfig?.maintenance_mode ? 'destructive' : 'default'}>
                    {systemConfig?.maintenance_mode ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Registration</span>
                  <Badge variant={systemConfig?.registration_enabled ? 'default' : 'destructive'}>
                    {systemConfig?.registration_enabled ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button onClick={loadAdminData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="border rounded-lg">
                <div className="grid grid-cols-6 gap-4 p-3 border-b font-medium text-sm">
                  <span>User</span>
                  <span>Email</span>
                  <span>Status</span>
                  <span>GC Balance</span>
                  <span>SC Balance</span>
                  <span>Actions</span>
                </div>
                
                {filteredUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-6 gap-4 p-3 border-b hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.username}</p>
                    </div>
                    <span className="text-sm">{user.email}</span>
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>
                    <span className="text-sm">{user.gcBalance?.toLocaleString() || 0}</span>
                    <span className="text-sm">{user.scBalance?.toFixed(2) || 0}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateUserStatus(user.id, 'suspended')}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateUserStatus(user.id, 'active')}
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CMS Tab */}
        <TabsContent value="cms" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Content Management System</CardTitle>
                  <CardDescription>Manage website content, pages, and components</CardDescription>
                </div>
                <Button onClick={() => setEditingContent({
                  id: `content_${Date.now()}`,
                  type: 'page',
                  title: 'New Content',
                  slug: 'new-content',
                  content: '',
                  published: false,
                  meta: {},
                  settings: {},
                  created_at: new Date(),
                  updated_at: new Date()
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Content
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmsContent.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{content.title}</h4>
                        <Badge variant={content.published ? 'default' : 'secondary'}>
                          {content.published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant="outline">{content.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{content.slug} • Updated {content.updated_at.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingContent(content)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const updated = cmsContent.filter(c => c.id !== content.id);
                          setCmsContent(updated);
                          localStorage.setItem('cms_content', JSON.stringify(updated));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CMS Editor Modal */}
          {editingContent && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Content: {editingContent.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editingContent.title}
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        title: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={editingContent.slug}
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        slug: e.target.value
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Content</Label>
                  <Textarea
                    rows={10}
                    value={editingContent.content}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      content: e.target.value
                    })}
                    placeholder="Enter content (HTML, JSON, or plain text)"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingContent.published}
                      onCheckedChange={(checked) => setEditingContent({
                        ...editingContent,
                        published: checked
                      })}
                    />
                    <Label>Published</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => saveCMSContent(editingContent)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Content
                  </Button>
                  <Button variant="outline" onClick={() => setEditingContent(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          {systemConfig && (
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage global system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Site Name</Label>
                    <Input
                      value={systemConfig.site_name}
                      onChange={(e) => setSystemConfig({
                        ...systemConfig,
                        site_name: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label>Support Email</Label>
                    <Input
                      value={systemConfig.support_email}
                      onChange={(e) => setSystemConfig({
                        ...systemConfig,
                        support_email: e.target.value
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Site Description</Label>
                  <Textarea
                    value={systemConfig.site_description}
                    onChange={(e) => setSystemConfig({
                      ...systemConfig,
                      site_description: e.target.value
                    })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={systemConfig.maintenance_mode}
                      onCheckedChange={(checked) => setSystemConfig({
                        ...systemConfig,
                        maintenance_mode: checked
                      })}
                    />
                    <Label>Maintenance Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={systemConfig.registration_enabled}
                      onCheckedChange={(checked) => setSystemConfig({
                        ...systemConfig,
                        registration_enabled: checked
                      })}
                    />
                    <Label>Registration Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={systemConfig.kyc_required}
                      onCheckedChange={(checked) => setSystemConfig({
                        ...systemConfig,
                        kyc_required: checked
                      })}
                    />
                    <Label>KYC Required</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Deposit ($)</Label>
                    <Input
                      type="number"
                      value={systemConfig.min_deposit}
                      onChange={(e) => setSystemConfig({
                        ...systemConfig,
                        min_deposit: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label>Max Deposit ($)</Label>
                    <Input
                      type="number"
                      value={systemConfig.max_deposit}
                      onChange={(e) => setSystemConfig({
                        ...systemConfig,
                        max_deposit: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <Button onClick={() => saveSystemConfig(systemConfig)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>System metrics and user analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Advanced analytics dashboard would be implemented here with charts and metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Admin actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminActions.map((action) => (
                  <div key={action.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{action.action}</p>
                        <p className="text-sm text-muted-foreground">
                          Admin: {action.admin_user_id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(action.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={
                        action.severity === 'error' ? 'destructive' :
                        action.severity === 'warning' ? 'default' : 'secondary'
                      }>
                        {action.severity}
                      </Badge>
                    </div>
                    {Object.keys(action.details).length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <pre>{JSON.stringify(action.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={() => realNeonService.healthCheck()}>
                  <Database className="h-4 w-4 mr-2" />
                  Test Database Connection
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={loadAdminData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All Data
                </Button>
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
                <Button className="w-full" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Test Notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveAdminPanel;
