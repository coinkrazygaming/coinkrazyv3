import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  Users,
  Settings,
  BarChart3,
  AlertTriangle,
  Bot,
  Database,
  CreditCard,
  FileText,
  Activity
} from 'lucide-react';

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">CoinKrazy.com Management Dashboard</p>
            </div>
            <Badge variant="outline" className="border-gold-500 text-gold-400">
              <Shield className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Active Players', value: '2,847', icon: Users, color: 'text-casino-blue' },
            { title: 'Today Revenue', value: '$12,453', icon: CreditCard, color: 'text-gold-500' },
            { title: 'Pending KYC', value: '23', icon: FileText, color: 'text-orange-500' },
            { title: 'System Health', value: '99.9%', icon: Activity, color: 'text-green-500' }
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'User Management',
              description: 'Manage players, KYC status, bans, and account settings',
              icon: Users,
              color: 'text-casino-blue'
            },
            {
              title: 'Game Management', 
              description: 'Configure RTP, enable/disable games, view statistics',
              icon: Settings,
              color: 'text-gold-500'
            },
            {
              title: 'Analytics Dashboard',
              description: 'Revenue tracking, player activity, and performance metrics',
              icon: BarChart3,
              color: 'text-green-500'
            },
            {
              title: 'AI Assistant (Lucky)',
              description: 'Monitor fraud, automate support, and system health checks',
              icon: Bot,
              color: 'text-purple-500'
            },
            {
              title: 'Payment Manager',
              description: 'Process withdrawals, manage coin packages, payment methods',
              icon: CreditCard,
              color: 'text-blue-500'
            },
            {
              title: 'Audit Logs',
              description: 'View security logs, RTP audits, and compliance reports',
              icon: FileText,
              color: 'text-orange-500'
            },
            {
              title: 'Bonus Manager',
              description: 'Configure daily wheels, signup bonuses, promotions',
              icon: AlertTriangle,
              color: 'text-red-500'
            },
            {
              title: 'Database Tools',
              description: 'Backup, restore, and database maintenance operations',
              icon: Database,
              color: 'text-gray-500'
            }
          ].map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-gold-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{tool.description}</p>
                <Button variant="outline" className="w-full">
                  Access Tool
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder Notice */}
        <Card className="mt-8 border-gold-500/20 bg-gradient-to-r from-gold/5 to-casino-blue/5">
          <CardContent className="p-8 text-center">
            <Bot className="w-16 h-16 text-gold-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Admin Panel Under Construction</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              The complete admin panel with real-time monitoring, user management, AI assistant integration, 
              and all the features mentioned in the specifications will be built out as we continue development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                Continue Building Admin Tools
              </Button>
              <Button variant="outline">
                View System Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
