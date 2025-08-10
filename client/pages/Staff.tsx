import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

export default function Staff() {
  const { user, isLoading, isStaff } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [staffLoading, setStaffLoading] = useState(true);

  // Redirect to login if not authenticated or not staff
  useEffect(() => {
    if (!isLoading && (!user || !isStaff)) {
      navigate("/login");
    } else if (user && isStaff) {
      setStaffLoading(false);
    }
  }, [isLoading, user, isStaff]);

  // Mock staff data
  const [staffStats] = useState({
    totalTickets: 156,
    pendingTickets: 23,
    resolvedToday: 12,
    avgResponseTime: "45 minutes",
    customerSatisfaction: 4.8,
    activeChats: 8,
  });

  const [recentTickets] = useState([
    {
      id: 1,
      user: "player123",
      subject: "Withdrawal Issue",
      priority: "high",
      status: "pending",
      created: "2024-03-20 14:30",
      assigned: "You",
    },
    {
      id: 2,
      user: "gamerlady",
      subject: "Account Verification",
      priority: "medium",
      status: "in_progress",
      created: "2024-03-20 13:15",
      assigned: "John Smith",
    },
    {
      id: 3,
      user: "winner2024",
      subject: "Game Not Loading",
      priority: "low",
      status: "resolved",
      created: "2024-03-20 12:00",
      assigned: "You",
    },
  ]);

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
                <Badge
                  variant="outline"
                  className="border-casino-blue text-casino-blue"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Staff Member
                </Badge>
                <Badge className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-muted-foreground">Welcome back,</div>
              <div className="text-xl font-bold">{user.username}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Staff Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Tickets
                  </p>
                  <p className="text-2xl font-bold text-orange-400">
                    {staffStats.pendingTickets}
                  </p>
                </div>
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Resolved Today
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    {staffStats.resolvedToday}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Chats</p>
                  <p className="text-2xl font-bold text-casino-blue">
                    {staffStats.activeChats}
                  </p>
                </div>
                <MessageSquare className="w-6 h-6 text-casino-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <MessageSquare className="w-4 h-4 mr-2" />
              Support Tickets
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              ticket.priority === "high"
                                ? "bg-red-500"
                                : ticket.priority === "medium"
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                            }`}
                          />
                          <div>
                            <div className="font-medium">{ticket.subject}</div>
                            <div className="text-sm text-muted-foreground">
                              From: {ticket.user}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              ticket.status === "resolved"
                                ? "default"
                                : ticket.status === "in_progress"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {ticket.status.replace("_", " ")}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {ticket.created}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Tickets</span>
                    <span className="font-bold">{staffStats.totalTickets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="font-bold">
                      {staffStats.avgResponseTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="font-bold text-green-500">
                      {staffStats.customerSatisfaction}/5.0
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tickets Today</span>
                    <span className="font-bold">
                      {staffStats.resolvedToday}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <p className="text-muted-foreground">
                  Manage customer support requests and inquiries
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Subject</th>
                        <th className="text-left p-2">Priority</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Assigned</th>
                        <th className="text-left p-2">Created</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="border-b border-border/50 hover:bg-muted/50"
                        >
                          <td className="p-2">#{ticket.id}</td>
                          <td className="p-2">{ticket.user}</td>
                          <td className="p-2">{ticket.subject}</td>
                          <td className="p-2">
                            <Badge
                              variant={
                                ticket.priority === "high"
                                  ? "destructive"
                                  : ticket.priority === "medium"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                ticket.status === "resolved"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {ticket.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="p-2">{ticket.assigned}</td>
                          <td className="p-2 text-sm">{ticket.created}</td>
                          <td className="p-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <p className="text-muted-foreground">
                  Manage user accounts, KYC verification, and account status
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <UserCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="font-bold text-lg mb-2">
                        KYC Verification
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Review and approve user identity verification
                      </p>
                      <Button className="w-full">Review Pending</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Ban className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h3 className="font-bold text-lg mb-2">
                        Account Actions
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Suspend, ban, or restrict user accounts
                      </p>
                      <Button variant="destructive" className="w-full">
                        Manage Restrictions
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Mail className="w-12 h-12 text-casino-blue mx-auto mb-4" />
                      <h3 className="font-bold text-lg mb-2">
                        User Communications
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Send notifications and announcements
                      </p>
                      <Button className="w-full bg-casino-blue hover:bg-casino-blue-dark">
                        Send Message
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Reports</CardTitle>
                <p className="text-muted-foreground">
                  Generate and view performance and activity reports
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold">Quick Reports</h3>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Daily Activity Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Weekly Performance Summary
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      User Satisfaction Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="w-4 h-4 mr-2" />
                      Response Time Analysis
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold">Performance Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Tickets This Week</span>
                        <span className="font-medium">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Resolution Rate</span>
                        <span className="font-medium text-green-500">96%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">First Response Time</span>
                        <span className="font-medium">32 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Customer Rating</span>
                        <span className="font-medium text-gold-400">
                          4.8/5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
