import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  welcomeEmailAutomationService,
  WelcomeEmailSequence,
  UserWelcomeJourney,
  WelcomeEmailStep
} from "@/services/welcomeEmailAutomation";
import {
  Mail,
  Play,
  Pause,
  Settings,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Plus,
  Trash2,
  Send,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  Star,
  ArrowRight,
  MessageSquare,
  Timer,
  Bot,
  Sparkles
} from "lucide-react";

export default function WelcomeEmailAutomationManager() {
  const { toast } = useToast();
  const [sequences, setSequences] = useState<WelcomeEmailSequence[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<WelcomeEmailSequence | null>(null);
  const [journeys, setJourneys] = useState<UserWelcomeJourney[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribe = welcomeEmailAutomationService.subscribe((event, data) => {
      switch (event) {
        case 'email_sent':
        case 'journey_started':
        case 'journey_completed':
          loadJourneys();
          loadMetrics();
          break;
        case 'sequence_updated':
        case 'sequence_created':
          loadSequences();
          break;
      }
    });

    return unsubscribe;
  }, []);

  const loadData = async () => {
    try {
      loadSequences();
      loadJourneys();
      loadMetrics();
    } finally {
      setLoading(false);
    }
  };

  const loadSequences = () => {
    const allSequences = welcomeEmailAutomationService.getAllSequences();
    setSequences(allSequences);
    if (!selectedSequence && allSequences.length > 0) {
      setSelectedSequence(allSequences[0]);
    }
  };

  const loadJourneys = () => {
    // In a real implementation, this would fetch from the service
    // For now, we'll use mock data since the service stores journeys internally
    const mockJourneys: UserWelcomeJourney[] = [
      {
        userId: '1',
        email: 'user1@example.com',
        username: 'player1',
        sequenceId: 'standard_welcome',
        currentStep: 2,
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        emailsSent: 2,
        emailsOpened: 2,
        emailsClicked: 1,
        conversions: 0,
        status: 'active',
        metadata: {}
      },
      {
        userId: '2',
        email: 'user2@example.com',
        username: 'player2',
        sequenceId: 'standard_welcome',
        currentStep: 5,
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        emailsSent: 5,
        emailsOpened: 5,
        emailsClicked: 3,
        conversions: 1,
        status: 'completed',
        metadata: {}
      },
      {
        userId: '3',
        email: 'vip@example.com',
        username: 'vipPlayer',
        sequenceId: 'vip_welcome',
        currentStep: 1,
        startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        emailsSent: 1,
        emailsOpened: 1,
        emailsClicked: 1,
        conversions: 0,
        status: 'active',
        metadata: {}
      }
    ];
    setJourneys(mockJourneys);
  };

  const loadMetrics = () => {
    if (!selectedSequence) return;
    
    const sequenceMetrics = welcomeEmailAutomationService.getSequenceMetrics(selectedSequence.id);
    setMetrics(sequenceMetrics);
  };

  const toggleSequenceStatus = (sequenceId: string, isActive: boolean) => {
    welcomeEmailAutomationService.updateSequence(sequenceId, { isActive });
    loadSequences();
    toast({
      title: "Success",
      description: `Sequence ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  };

  const testEmailSequence = (sequenceId: string) => {
    const testUserId = `test_${Date.now()}`;
    const success = welcomeEmailAutomationService.startWelcomeSequence(
      testUserId,
      'test@example.com',
      'TestUser',
      sequenceId
    );

    if (success) {
      toast({
        title: "Test Email Sent",
        description: "Test welcome sequence has been triggered",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  const pauseUserJourney = (userId: string) => {
    welcomeEmailAutomationService.pauseUserJourney(userId);
    loadJourneys();
    toast({
      title: "Journey Paused",
      description: "User journey has been paused",
    });
  };

  const resumeUserJourney = (userId: string) => {
    welcomeEmailAutomationService.resumeUserJourney(userId);
    loadJourneys();
    toast({
      title: "Journey Resumed",
      description: "User journey has been resumed",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-casino-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            Welcome Email Automation
            <Badge className="bg-blue-500 text-white">AI-Powered</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Manage automated welcome email sequences and user onboarding journeys
          </p>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sequences</p>
                <p className="text-2xl font-bold">{sequences.filter(s => s.isActive).length}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Journeys</p>
                <p className="text-2xl font-bold text-blue-500">
                  {journeys.filter(j => j.status === 'active').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent Today</p>
                <p className="text-2xl font-bold text-purple-500">
                  {formatNumber(journeys.reduce((sum, j) => sum + j.emailsSent, 0))}
                </p>
              </div>
              <Send className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Open Rate</p>
                <p className="text-2xl font-bold text-green-500">
                  {journeys.length > 0 ? 
                    ((journeys.reduce((sum, j) => sum + (j.emailsOpened / Math.max(j.emailsSent, 1)), 0) / journeys.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-500">
                  {journeys.length > 0 ? 
                    ((journeys.filter(j => j.conversions > 0).length / journeys.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sequences">
            <Mail className="w-4 h-4 mr-2" />
            Sequences
          </TabsTrigger>
          <TabsTrigger value="journeys">
            <Users className="w-4 h-4 mr-2" />
            User Journeys
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sequence Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sequences.map((sequence) => (
                    <div key={sequence.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${sequence.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <div>
                          <div className="font-medium">{sequence.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {sequence.emails.length} emails • {sequence.metrics.totalTriggered} triggered
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {(sequence.metrics.conversionRate * 100).toFixed(1)}% conversion
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(sequence.metrics.averageOpenRate).toFixed(1)}% open rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {journeys
                    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
                    .slice(0, 5)
                    .map((journey) => (
                    <div key={journey.userId} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(journey.status)}>
                          {journey.status}
                        </Badge>
                        <div>
                          <div className="font-medium">{journey.username}</div>
                          <div className="text-sm text-muted-foreground">
                            Step {journey.currentStep} • {journey.emailsSent} emails sent
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Started {journey.startedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-blue-700 dark:text-blue-300">Optimization Suggestion</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Consider adding a 3-day follow-up email to the standard sequence to improve conversion rates by an estimated 15%.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-700 dark:text-green-300">Performance Insight</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      VIP welcome sequence shows 23% higher engagement. Consider A/B testing premium elements in standard sequence.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-yellow-700 dark:text-yellow-300">Action Required</span>
                    </div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      12 users have been stuck on email verification step for over 24 hours. Consider sending a reminder email.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sequences Tab */}
        <TabsContent value="sequences" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Email Sequences</CardTitle>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Sequence
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sequences.map((sequence) => (
                      <div
                        key={sequence.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSequence?.id === sequence.id 
                            ? 'border-casino-blue bg-casino-blue/5' 
                            : 'hover:bg-muted/20'
                        }`}
                        onClick={() => setSelectedSequence(sequence)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{sequence.name}</span>
                          <div className="flex items-center gap-2">
                            {sequence.isActive ? (
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-500 rounded-full" />
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSequenceStatus(sequence.id, !sequence.isActive);
                              }}
                            >
                              {sequence.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {sequence.emails.length} emails • {sequence.description}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Triggered: {sequence.metrics.totalTriggered}</span>
                          <span>Completed: {sequence.metrics.totalCompleted}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {selectedSequence ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedSequence.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => testEmailSequence(selectedSequence.id)}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Test Sequence
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{selectedSequence.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold">{selectedSequence.emails.length}</div>
                          <div className="text-sm text-muted-foreground">Total Emails</div>
                        </div>
                        <div className="text-center p-3 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold">{selectedSequence.metrics.totalTriggered}</div>
                          <div className="text-sm text-muted-foreground">Triggered</div>
                        </div>
                        <div className="text-center p-3 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold">{(selectedSequence.metrics.averageOpenRate).toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Open Rate</div>
                        </div>
                        <div className="text-center p-3 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold">{(selectedSequence.metrics.conversionRate * 100).toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Conversion</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Email Steps</h4>
                        <div className="space-y-3">
                          {selectedSequence.emails
                            .sort((a, b) => a.stepNumber - b.stepNumber)
                            .map((email, index) => (
                            <div key={email.id} className="flex items-center gap-4 p-3 border rounded-lg">
                              <div className="flex items-center justify-center w-8 h-8 bg-casino-blue text-white rounded-full text-sm font-bold">
                                {email.stepNumber}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{email.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Trigger: {email.trigger.type.replace('_', ' ')}
                                  {email.trigger.delayMinutes && ` (${email.trigger.delayMinutes}min delay)`}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={email.isActive ? "default" : "secondary"}>
                                  {email.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Button size="sm" variant="ghost">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                              {index < selectedSequence.emails.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-muted-foreground absolute ml-4 mt-12" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Select a Sequence</h3>
                    <p className="text-muted-foreground">
                      Choose a sequence from the list to view details and manage email steps
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* User Journeys Tab */}
        <TabsContent value="journeys" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Journeys</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Sequence</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Progress</th>
                      <th className="text-left p-3">Emails</th>
                      <th className="text-left p-3">Engagement</th>
                      <th className="text-left p-3">Started</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journeys.map((journey) => (
                      <tr key={journey.userId} className="border-b hover:bg-muted/20">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{journey.username}</div>
                            <div className="text-sm text-muted-foreground">{journey.email}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="capitalize">
                            {sequences.find(s => s.id === journey.sequenceId)?.name || journey.sequenceId}
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(journey.status)}>
                            {journey.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Step {journey.currentStep}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 bg-casino-blue rounded-full"
                                style={{ 
                                  width: `${(journey.currentStep / (sequences.find(s => s.id === journey.sequenceId)?.emails.length || 1)) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div>Sent: {journey.emailsSent}</div>
                            <div>Opened: {journey.emailsOpened}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div>Open: {journey.emailsSent > 0 ? ((journey.emailsOpened / journey.emailsSent) * 100).toFixed(0) : 0}%</div>
                            <div>Click: {journey.emailsSent > 0 ? ((journey.emailsClicked / journey.emailsSent) * 100).toFixed(0) : 0}%</div>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          {journey.startedAt.toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {journey.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => pauseUserJourney(journey.userId)}
                              >
                                <Pause className="w-3 h-3" />
                              </Button>
                            ) : journey.status === 'paused' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resumeUserJourney(journey.userId)}
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                            ) : null}
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sequence Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sequences.map((sequence) => (
                    <div key={sequence.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{sequence.name}</span>
                        <Badge variant="outline">
                          {sequence.metrics.totalTriggered} users
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Open Rate</div>
                          <div className="font-bold text-green-500">
                            {sequence.metrics.averageOpenRate.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Click Rate</div>
                          <div className="font-bold text-blue-500">
                            {sequence.metrics.averageClickRate.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Conversion</div>
                          <div className="font-bold text-purple-500">
                            {(sequence.metrics.conversionRate * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and trends would be displayed here with charts and graphs
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">Top Performing Email</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      "KYC Completion Celebration" has the highest conversion rate at 47.3%
                    </p>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Optimization Opportunity</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Adding a 2-day delay to "Getting Started" email could increase opens by 18%
                    </p>
                    <Button size="sm" variant="outline">Apply Suggestion</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Drop-off Point</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      43% of users drop off after "Email Verification Reminder"
                    </p>
                    <Button size="sm" variant="outline">Investigate</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">A/B Test Suggestion</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Test subject line variations for "First Week Check-in" email
                    </p>
                    <Button size="sm" variant="outline">Create Test</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Auto-start sequences for new users</span>
                    <p className="text-sm text-muted-foreground">Automatically trigger welcome sequences when users register</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">AI optimization</span>
                    <p className="text-sm text-muted-foreground">Use AI to optimize send times and content</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Smart throttling</span>
                    <p className="text-sm text-muted-foreground">Automatically adjust sending rate based on engagement</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Delivery monitoring</span>
                    <p className="text-sm text-muted-foreground">Monitor and retry failed email deliveries</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Limits & Throttling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="font-medium">Max emails per user per day</label>
                  <Input type="number" defaultValue="3" className="mt-1" />
                </div>

                <div>
                  <label className="font-medium">Minimum delay between emails (hours)</label>
                  <Input type="number" defaultValue="4" className="mt-1" />
                </div>

                <div>
                  <label className="font-medium">Daily sending limit</label>
                  <Input type="number" defaultValue="10000" className="mt-1" />
                </div>

                <div>
                  <label className="font-medium">Retry failed emails</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option value="3">3 times</option>
                    <option value="5">5 times</option>
                    <option value="10">10 times</option>
                  </select>
                </div>

                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="font-medium text-green-700 dark:text-green-300">Email Service</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Operational</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="font-medium text-green-700 dark:text-green-300">Queue Processor</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Running</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="font-medium text-green-700 dark:text-green-300">AI Analytics</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
