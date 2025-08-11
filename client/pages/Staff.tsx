import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { staffService, SupportTicket, UserAccount, StaffAlert } from "@/services/staffService";
import { joseyAIService } from "@/services/joseyAIService";
import {
  Users,
  MessageSquare,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  FileText,
  TrendingUp,
  Loader2,
  UserCheck,
  Ban,
  Mail,
  Send,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  Zap,
  Bell,
  X,
  ChevronRight,
  Calendar,
  BarChart3,
  Target,
  Award,
  Timer,
  Activity,
  AlertCircle,
  Bot,
  Sparkles,
  RefreshCw,
  Archive,
  Flag,
  MessageCircle,
  UserX,
  CheckSquare,
  ExternalLink
} from "lucide-react";

export default function Staff() {
  const { user, isLoading, isStaff } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [staffLoading, setStaffLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [alerts, setAlerts] = useState<StaffAlert[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [newUserNote, setNewUserNote] = useState("");

  // Redirect to login if not authenticated or not staff
  useEffect(() => {
    if (!isLoading && (!user || !isStaff)) {
      navigate("/login");
    } else if (user && isStaff) {
      loadStaffData();
      setStaffLoading(false);
    }
  }, [isLoading, user, isStaff]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = staffService.subscribe((event, data) => {
      switch (event) {
        case 'ticket_updated':
        case 'ticket_assigned':
        case 'message_added':
          loadTickets();
          break;
        case 'alert_created':
        case 'alert_acknowledged':
        case 'alert_resolved':
          loadAlerts();
          break;
        case 'user_status_updated':
        case 'kyc_status_updated':
          loadUsers();
          break;
      }
    });

    return unsubscribe;
  }, []);

  const loadStaffData = async () => {
    try {
      loadTickets();
      loadUsers();
      loadAlerts();
    } catch (error) {
      console.error('Error loading staff data:', error);
      toast({
        title: "Error",
        description: "Failed to load staff data",
        variant: "destructive",
      });
    }
  };

  const loadTickets = () => {
    const allTickets = staffService.getAllTickets();
    setTickets(allTickets);
  };

  const loadUsers = () => {
    const allUsers = staffService.getAllUsers();
    setUsers(allUsers);
  };

  const loadAlerts = () => {
    const allAlerts = staffService.getActiveAlerts();
    setAlerts(allAlerts);
  };

  const handleTicketStatusUpdate = async (ticketId: string, status: SupportTicket['status']) => {
    const success = staffService.updateTicketStatus(ticketId, status, user?.id || '');
    if (success) {
      toast({
        title: "Success",
        description: `Ticket status updated to ${status}`,
      });
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(staffService.getTicket(ticketId) || null);
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    const success = staffService.addTicketMessage(
      selectedTicket.id,
      user?.id || '',
      newMessage,
      false
    );

    if (success) {
      setNewMessage("");
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
      loadTickets();
      setSelectedTicket(staffService.getTicket(selectedTicket.id) || null);
    } else {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleEscalateTicket = async (ticketId: string, reason: string) => {
    const success = staffService.escalateTicket(ticketId, reason, user?.id || '');
    if (success) {
      toast({
        title: "Success",
        description: "Ticket escalated successfully",
      });
      loadTickets();
      loadAlerts();
    }
  };

  const handleKycUpdate = async (userId: string, status: UserAccount['kycStatus'], notes: string) => {
    const success = staffService.updateKycStatus(userId, status, notes, user?.id || '');
    if (success) {
      toast({
        title: "Success",
        description: `KYC status updated to ${status}`,
      });
      loadUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser(staffService.getUser(userId) || null);
      }
    }
  };

  const handleAddUserNote = async () => {
    if (!selectedUser || !newUserNote.trim()) return;

    const success = staffService.addUserNote(selectedUser.id, newUserNote, user?.id || '');
    if (success) {
      setNewUserNote("");
      toast({
        title: "Success",
        description: "Note added successfully",
      });
      loadUsers();
      setSelectedUser(staffService.getUser(selectedUser.id) || null);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    staffService.acknowledgeAlert(alertId, user?.id || '');
    loadAlerts();
  };

  const resolveAlert = (alertId: string) => {
    staffService.resolveAlert(alertId, user?.id || '');
    loadAlerts();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-red-500",
      in_progress: "bg-yellow-500",
      waiting_user: "bg-blue-500",
      resolved: "bg-green-500",
      closed: "bg-gray-500",
      active: "bg-green-500",
      suspended: "bg-orange-500",
      banned: "bg-red-500",
      pending_verification: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
      pending: "bg-yellow-500",
      not_started: "bg-gray-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-500",
      medium: "text-yellow-500",
      high: "text-orange-500",
      urgent: "text-red-500",
      critical: "text-red-600"
    };
    return colors[priority as keyof typeof colors] || "text-gray-500";
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const urgentAlerts = alerts.filter(alert => alert.priority === 'high' || alert.priority === 'critical');
  const pendingTickets = tickets.filter(ticket => ticket.status === 'open').length;
  const myTickets = tickets.filter(ticket => ticket.assignedTo === user?.id).length;
  const avgResponseTime = tickets
    .filter(t => t.firstResponseAt)
    .reduce((sum, t) => {
      const responseTime = t.firstResponseAt!.getTime() - t.createdAt.getTime();
      return sum + responseTime / (60 * 1000); // Convert to minutes
    }, 0) / (tickets.filter(t => t.firstResponseAt).length || 1);

  if (isLoading || staffLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-casino-blue animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading staff panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isStaff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Staff Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-purple/5 to-casino-blue/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Staff Panel
              </h1>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-casino-blue text-casino-blue">
                  <Shield className="w-3 h-3 mr-1" />
                  Staff Member
                </Badge>
                <Badge className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                {urgentAlerts.length > 0 && (
                  <Badge className="bg-red-500 animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {urgentAlerts.length} Urgent Alert{urgentAlerts.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-muted-foreground">Welcome back,</div>
              <div className="text-xl font-bold">{user.username}</div>
              <div className="text-sm text-muted-foreground">
                {myTickets} tickets assigned to you
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Tickets</p>
                  <p className="text-2xl font-bold text-orange-400">{pendingTickets}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Tickets</p>
                  <p className="text-2xl font-bold text-casino-blue">{myTickets}</p>
                </div>
                <MessageSquare className="w-6 h-6 text-casino-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold text-green-400">
                    {avgResponseTime.toFixed(0)}m
                  </p>
                </div>
                <Timer className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-400">{alerts.length}</p>
                </div>
                <Bell className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Alerts Bar */}
        {urgentAlerts.length > 0 && (
          <Card className="mb-6 border-red-500/50 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="font-bold text-red-500">Urgent Alerts Require Attention</h3>
                    <p className="text-sm text-muted-foreground">
                      {urgentAlerts.length} high priority alert{urgentAlerts.length > 1 ? 's' : ''} need immediate action
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setActiveTab('alerts')}
                  className="bg-red-500 hover:bg-red-600"
                >
                  View Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Staff Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <MessageSquare className="w-4 h-4 mr-2" />
              Tickets ({pendingTickets})
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="w-4 h-4 mr-2" />
              Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai-assistant">
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent High Priority Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tickets
                      .filter(t => t.priority === 'high' || t.priority === 'urgent')
                      .slice(0, 5)
                      .map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/40"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setActiveTab('tickets');
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            ticket.priority === "urgent" ? "bg-red-500" :
                            ticket.priority === "high" ? "bg-orange-500" : "bg-yellow-500"
                          }`} />
                          <div>
                            <div className="font-medium line-clamp-1">{ticket.subject}</div>
                            <div className="text-sm text-muted-foreground">
                              From: {ticket.username} • {ticket.category}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {ticket.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Performance Today</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tickets Handled</span>
                    <span className="font-bold">{myTickets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="font-bold">{avgResponseTime.toFixed(0)} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resolution Rate</span>
                    <span className="font-bold text-green-500">
                      {((tickets.filter(t => t.assignedTo === user?.id && t.status === 'resolved').length / Math.max(myTickets, 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Rating</span>
                    <span className="font-bold text-gold-400">4.8/5.0</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      className="h-20 flex-col"
                      onClick={() => {
                        const openTickets = tickets.filter(t => t.status === 'open' && !t.assignedTo);
                        if (openTickets.length > 0) {
                          staffService.assignTicket(openTickets[0].id, user?.id || '', user?.id || '');
                          toast({ title: "Success", description: "Ticket assigned to you" });
                          loadTickets();
                        }
                      }}
                    >
                      <MessageSquare className="w-6 h-6 mb-2" />
                      Take Next Ticket
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => setActiveTab('users')}
                    >
                      <UserCheck className="w-6 h-6 mb-2" />
                      KYC Reviews
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => setActiveTab('analytics')}
                    >
                      <BarChart3 className="w-6 h-6 mb-2" />
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ticket List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Support Tickets</CardTitle>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search tickets..."
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
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="waiting_user">Waiting User</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors ${
                            selectedTicket?.id === ticket.id ? 'border-casino-blue bg-casino-blue/5' : ''
                          }`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  ticket.priority === "urgent" ? "bg-red-500" :
                                  ticket.priority === "high" ? "bg-orange-500" :
                                  ticket.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                                }`} />
                                <span className="font-medium">{ticket.subject}</span>
                                {ticket.aiAnalysis?.requiresEscalation && (
                                  <Flag className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                <span>From: {ticket.username}</span>
                                <span className="mx-2">•</span>
                                <span>{ticket.category}</span>
                                <span className="mx-2">•</span>
                                <span>{ticket.createdAt.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(ticket.status)}>
                                  {ticket.status.replace("_", " ")}
                                </Badge>
                                <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                                  {ticket.priority}
                                </Badge>
                                {ticket.assignedTo === user?.id && (
                                  <Badge variant="outline" className="text-blue-500">
                                    Assigned to you
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">
                                Messages: {ticket.messages.length}
                              </div>
                              {ticket.aiAnalysis && (
                                <div className="text-xs text-purple-500 mt-1">
                                  AI Score: {ticket.aiScore}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ticket Detail */}
              <div>
                {selectedTicket ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Ticket Details</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTicket(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-bold mb-2">{selectedTicket.subject}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">User:</span>
                            <div className="font-medium">{selectedTicket.username}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <div>
                              <Badge className={getStatusColor(selectedTicket.status)}>
                                {selectedTicket.status.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Priority:</span>
                            <div>
                              <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                                {selectedTicket.priority}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Category:</span>
                            <div className="font-medium">{selectedTicket.category}</div>
                          </div>
                        </div>
                      </div>

                      {selectedTicket.aiAnalysis && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-purple-700 dark:text-purple-300">AI Analysis</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Sentiment:</span>
                              <span className="ml-2 font-medium">{selectedTicket.aiAnalysis.sentiment}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Est. Resolution:</span>
                              <span className="ml-2 font-medium">{selectedTicket.aiAnalysis.estimatedResolutionTime}min</span>
                            </div>
                            {selectedTicket.aiAnalysis.requiresEscalation && (
                              <div className="text-red-600 font-medium">⚠️ Requires Escalation</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm bg-muted/20 p-3 rounded">{selectedTicket.description}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Messages ({selectedTicket.messages.length})</h4>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {selectedTicket.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`p-2 rounded text-sm ${
                                message.senderType === 'user'
                                  ? 'bg-blue-50 dark:bg-blue-900/20 ml-4'
                                  : message.senderType === 'staff'
                                  ? 'bg-green-50 dark:bg-green-900/20 mr-4'
                                  : 'bg-gray-50 dark:bg-gray-900/20'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-xs">
                                  {message.senderType === 'user' ? selectedTicket.username : 
                                   message.senderType === 'staff' ? 'Staff' : 'System'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {message.timestamp.toLocaleString()}
                                </span>
                              </div>
                              <p>{message.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Reply</h4>
                        <Textarea
                          placeholder="Type your response..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-20"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="flex-1"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Reply
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleTicketStatusUpdate(selectedTicket.id, 'in_progress')}
                          disabled={selectedTicket.status === 'in_progress'}
                        >
                          Start Work
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleTicketStatusUpdate(selectedTicket.id, 'resolved')}
                          disabled={selectedTicket.status === 'resolved'}
                        >
                          Mark Resolved
                        </Button>
                      </div>

                      {selectedTicket.aiAnalysis?.requiresEscalation && (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleEscalateTicket(selectedTicket.id, "AI recommendation: Complex issue requiring escalation")}
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Escalate Ticket
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-bold mb-2">Select a Ticket</h3>
                      <p className="text-muted-foreground">
                        Choose a ticket from the list to view details and respond
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {users.slice(0, 10).map((user) => (
                        <div
                          key={user.id}
                          className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors ${
                            selectedUser?.id === user.id ? 'border-casino-blue bg-casino-blue/5' : ''
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{user.username}</span>
                                {user.emailVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email} • Registered {user.registrationDate.toLocaleDateString()}
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Badge className={getStatusColor(user.status)}>
                                  {user.status.replace("_", " ")}
                                </Badge>
                                <Badge className={getStatusColor(user.kycStatus)}>
                                  KYC: {user.kycStatus.replace("_", " ")}
                                </Badge>
                                {user.riskScore > 50 && (
                                  <Badge variant="destructive">
                                    Risk: {user.riskScore}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                ${user.totalDeposits.toFixed(2)} deposited
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {user.gamesPlayed} games played
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                {selectedUser ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>User Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-bold mb-2">{selectedUser.username}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{selectedUser.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedUser.status)}>
                              {selectedUser.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">KYC:</span>
                            <Badge className={getStatusColor(selectedUser.kycStatus)}>
                              {selectedUser.kycStatus.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Score:</span>
                            <span className={selectedUser.riskScore > 50 ? 'text-red-500' : 'text-green-500'}>
                              {selectedUser.riskScore}/100
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Balances</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Gold Coins:</span>
                            <span>{selectedUser.balances.goldCoins.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sweeps Coins:</span>
                            <span>{selectedUser.balances.sweepsCoins.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>USD:</span>
                            <span>${selectedUser.balances.usd.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {selectedUser.kycStatus === 'pending' && (
                        <div>
                          <h4 className="font-medium mb-2">KYC Actions</h4>
                          <div className="space-y-2">
                            <Button
                              className="w-full bg-green-500 hover:bg-green-600"
                              onClick={() => handleKycUpdate(selectedUser.id, 'approved', 'Documents verified and approved')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve KYC
                            </Button>
                            <Button
                              variant="destructive"
                              className="w-full"
                              onClick={() => handleKycUpdate(selectedUser.id, 'rejected', 'Documents do not meet requirements')}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject KYC
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Add Note</h4>
                        <Textarea
                          placeholder="Add internal note..."
                          value={newUserNote}
                          onChange={(e) => setNewUserNote(e.target.value)}
                          className="min-h-16"
                        />
                        <Button 
                          onClick={handleAddUserNote}
                          disabled={!newUserNote.trim()}
                          className="w-full mt-2"
                        >
                          Add Note
                        </Button>
                      </div>

                      {selectedUser.notes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Notes</h4>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {selectedUser.notes.slice(-5).map((note, index) => (
                              <div key={index} className="text-xs bg-muted/20 p-2 rounded">
                                {note}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-bold mb-2">Select a User</h3>
                      <p className="text-muted-foreground">
                        Choose a user to view details and manage their account
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${
                        alert.priority === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                        alert.priority === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                        'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`w-4 h-4 ${
                              alert.priority === 'critical' ? 'text-red-500' :
                              alert.priority === 'high' ? 'text-orange-500' : 'text-yellow-500'
                            }`} />
                            <span className="font-medium">{alert.title}</span>
                            <Badge className={
                              alert.priority === 'critical' ? 'bg-red-500' :
                              alert.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                            }>
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Created: {alert.createdAt.toLocaleString()}
                            {alert.acknowledgedAt && (
                              <span className="ml-4">Acknowledged: {alert.acknowledgedAt.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!alert.acknowledgedAt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="font-bold mb-2">No Active Alerts</h3>
                      <p className="text-muted-foreground">All alerts have been resolved</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{tickets.length}</div>
                    <div className="text-sm text-muted-foreground">Total Tickets</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {((tickets.filter(t => t.status === 'resolved').length / Math.max(tickets.length, 1)) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Resolution Rate</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Timer className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}m</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      tickets.reduce((acc, ticket) => {
                        acc[ticket.category] = (acc[ticket.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="capitalize">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-casino-blue rounded-full"
                              style={{ width: `${(count / tickets.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      tickets.reduce((acc, ticket) => {
                        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between items-center">
                        <span className="capitalize">{priority}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                priority === 'urgent' ? 'bg-red-500' :
                                priority === 'high' ? 'bg-orange-500' :
                                priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(count / tickets.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-500" />
                    JoseyAI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Lead Generation Update</span>
                    </div>
                    <p className="text-sm">
                      JoseyAI has identified 12 new high-value leads from social media today. 
                      3 require immediate attention.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Performance Insight</span>
                    </div>
                    <p className="text-sm">
                      Your response time is 23% faster than team average. Keep up the great work!
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">Recommendation</span>
                    </div>
                    <p className="text-sm">
                      Consider escalating ticket #001 - customer sentiment analysis shows increasing frustration.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Assistance Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Bot className="w-4 h-4 mr-2" />
                    Generate Response Template
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze Customer Sentiment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Identify High-Risk Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="w-4 h-4 mr-2" />
                    Predict Ticket Escalation
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Auto-categorize Tickets
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
