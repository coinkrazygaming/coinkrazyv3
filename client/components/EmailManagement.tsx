import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { emailService, InboxMessage, Email, EmailTemplate, AIEmailAssistant } from "@/services/emailService";
import {
  Mail,
  Inbox,
  Send,
  Bot,
  Settings,
  Eye,
  Reply,
  Archive,
  Star,
  Clock,
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  ChevronDown,
  RefreshCw,
  Filter,
  Search,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";

export default function EmailManagement() {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("inbox");
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [aiAssistants, setAIAssistants] = useState<AIEmailAssistant[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Compose email state
  const [composeDialog, setComposeDialog] = useState(false);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    content: "",
    template: "",
    priority: "normal"
  });

  // AI Assistant configuration
  const [aiConfigDialog, setAiConfigDialog] = useState(false);
  const [selectedAI, setSelectedAI] = useState<AIEmailAssistant | null>(null);

  useEffect(() => {
    loadEmailData();
    
    // Subscribe to real-time updates
    const unsubscribe = emailService.subscribe((data) => {
      handleEmailUpdate(data);
    });

    return () => unsubscribe();
  }, []);

  const loadEmailData = async () => {
    try {
      setIsLoading(true);
      const inbox = emailService.getInboxMessages();
      const sent = emailService.getSentEmails();
      const emailTemplates = emailService.getEmailTemplates();
      const aiList = emailService.getAIAssistants();

      setInboxMessages(inbox);
      setSentEmails(sent);
      setTemplates(emailTemplates);
      setAIAssistants(aiList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load email data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailUpdate = (data: any) => {
    switch (data.type) {
      case 'new_email':
        setInboxMessages(prev => [data.data, ...prev]);
        toast({
          title: "New Email",
          description: `New message from ${data.data.from}`,
        });
        break;
      case 'ai_response_sent':
        setSentEmails(prev => [data.data.response, ...prev]);
        setInboxMessages(prev => 
          prev.map(msg => 
            msg.id === data.data.message.id 
              ? { ...msg, status: 'responded', responseId: data.data.response.id }
              : msg
          )
        );
        toast({
          title: "AI Response Sent",
          description: `${data.data.aiAssistant.name} responded to ${data.data.message.from}`,
        });
        break;
      case 'email_sent':
        setSentEmails(prev => [data.data, ...prev]);
        break;
    }
  };

  const handleMessageClick = (message: InboxMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      emailService.markMessageAsRead(message.id);
      setInboxMessages(prev =>
        prev.map(msg => msg.id === message.id ? { ...msg, isRead: true } : msg)
      );
    }
  };

  const handleReply = (message: InboxMessage) => {
    setComposeData({
      to: message.from,
      subject: `Re: ${message.subject}`,
      content: "",
      template: "",
      priority: "normal"
    });
    setComposeDialog(true);
  };

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject || !composeData.content) {
      toast({
        title: "Invalid Email",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate sending email
      const newEmail: Email = {
        id: `email_${Date.now()}`,
        messageId: `<compose_${Date.now()}@coinkrazy.com>`,
        to: composeData.to,
        from: 'admin@coinkrazy.com',
        subject: composeData.subject,
        htmlContent: composeData.content.replace(/\n/g, '<br>'),
        textContent: composeData.content,
        status: 'sent',
        priority: composeData.priority as any,
        sentAt: new Date(),
        deliveredAt: new Date(),
        metadata: { manually_sent: true },
        aiGenerated: false
      };

      setSentEmails(prev => [newEmail, ...prev]);
      setComposeDialog(false);
      setComposeData({
        to: "",
        subject: "",
        content: "",
        template: "",
        priority: "normal"
      });

      toast({
        title: "Email Sent",
        description: `Email sent to ${composeData.to}`,
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send email",
        variant: "destructive"
      });
    }
  };

  const getFilteredMessages = () => {
    let filtered = inboxMessages;

    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(msg => msg.category === filterCategory);
    }

    return filtered;
  };

  const getEmailAnalytics = () => {
    return emailService.getEmailAnalytics();
  };

  const analytics = getEmailAnalytics();

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gold-500" />
        <span className="ml-2">Loading email management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold text-green-400">{analytics.totalSent}</p>
              </div>
              <Send className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold text-orange-400">{analytics.unreadMessages}</p>
              </div>
              <Mail className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Open Rate</p>
                <p className="text-2xl font-bold text-blue-400">{analytics.avgOpenRate.toFixed(1)}%</p>
              </div>
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Response Rate</p>
                <p className="text-2xl font-bold text-purple-400">{analytics.aiResponseRate.toFixed(1)}%</p>
              </div>
              <Bot className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Email Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={composeDialog} onOpenChange={setComposeDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                    <Send className="w-4 h-4 mr-2" />
                    Compose
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Compose Email</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">To</label>
                        <Input
                          placeholder="recipient@email.com"
                          value={composeData.to}
                          onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <Select value={composeData.priority} onValueChange={(value) => setComposeData(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <Input
                        placeholder="Email subject"
                        value={composeData.subject}
                        onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Content</label>
                      <Textarea
                        placeholder="Email content..."
                        rows={8}
                        value={composeData.content}
                        onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setComposeDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendEmail}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={loadEmailData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inbox">
                <Inbox className="w-4 h-4 mr-2" />
                Inbox ({inboxMessages.filter(m => !m.isRead).length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                <Send className="w-4 h-4 mr-2" />
                Sent ({sentEmails.length})
              </TabsTrigger>
              <TabsTrigger value="templates">
                <MessageSquare className="w-4 h-4 mr-2" />
                Templates ({templates.length})
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Bot className="w-4 h-4 mr-2" />
                AI Assistants ({aiAssistants.length})
              </TabsTrigger>
            </TabsList>

            {/* Inbox Tab */}
            <TabsContent value="inbox" className="mt-6">
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="inquiry">Inquiry</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message List */}
                <div className="space-y-2">
                  {getFilteredMessages().map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        !message.isRead ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200' : 'border-border'
                      } ${selectedMessage?.id === message.id ? 'ring-2 ring-gold-500' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${!message.isRead ? 'font-bold' : ''}`}>
                              {message.from}
                            </span>
                            <Badge variant="outline" className={getSentimentColor(message.aiAnalysis.sentiment)}>
                              {message.aiAnalysis.sentiment}
                            </Badge>
                            <Badge variant="outline">
                              {message.category}
                            </Badge>
                            {message.priority !== 'normal' && (
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(message.priority)}`} />
                            )}
                          </div>
                          <div className={`mb-2 ${!message.isRead ? 'font-semibold' : ''}`}>
                            {message.subject}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {message.content}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-4">
                            <span>{message.receivedAt.toLocaleString()}</span>
                            <span className="flex items-center gap-1">
                              <Bot className="w-3 h-3" />
                              Confidence: {Math.round(message.aiAnalysis.confidence * 100)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Urgency: {message.aiAnalysis.urgency}/10
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleReply(message)}>
                                <Reply className="w-4 h-4 mr-2" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => emailService.updateMessageStatus(message.id, 'in_progress')}>
                                <Clock className="w-4 h-4 mr-2" />
                                Mark In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => emailService.updateMessageStatus(message.id, 'closed')}>
                                <Archive className="w-4 h-4 mr-2" />
                                Close
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Details */}
                {selectedMessage && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Message Details</span>
                        <Button onClick={() => handleReply(selectedMessage)}>
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">From</label>
                          <p>{selectedMessage.from}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Received</label>
                          <p>{selectedMessage.receivedAt.toLocaleString()}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Subject</label>
                        <p>{selectedMessage.subject}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Content</label>
                        <div className="p-4 bg-muted rounded-lg">
                          {selectedMessage.content}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">AI Analysis</label>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg space-y-2">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <span className="text-sm font-medium">Sentiment:</span>
                              <span className={`ml-2 ${getSentimentColor(selectedMessage.aiAnalysis.sentiment)}`}>
                                {selectedMessage.aiAnalysis.sentiment}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Intent:</span>
                              <span className="ml-2">{selectedMessage.aiAnalysis.intent}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Urgency:</span>
                              <span className="ml-2">{selectedMessage.aiAnalysis.urgency}/10</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Summary:</span>
                            <p className="text-sm mt-1">{selectedMessage.aiAnalysis.summary}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Suggested Response:</span>
                            <p className="text-sm mt-1 italic">{selectedMessage.aiAnalysis.suggestedResponse}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Tags:</span>
                            <div className="flex gap-1 mt-1">
                              {selectedMessage.aiAnalysis.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Sent Tab */}
            <TabsContent value="sent" className="mt-6">
              <div className="space-y-4">
                {sentEmails.map((email) => (
                  <div key={email.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">To: {email.to}</span>
                          <Badge variant={email.status === 'sent' ? 'default' : 'secondary'}>
                            {email.status}
                          </Badge>
                          {email.aiGenerated && (
                            <Badge variant="outline" className="text-purple-500">
                              <Bot className="w-3 h-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium mb-2">{email.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          Sent: {email.sentAt?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-6">
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge variant="outline">{template.category}</Badge>
                            {template.aiOptimized && (
                              <Badge variant="outline" className="text-purple-500">
                                <Zap className="w-3 h-3 mr-1" />
                                AI Optimized
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{template.subject}</p>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Sent:</span> {template.stats.sent}
                            </div>
                            <div>
                              <span className="font-medium">Open Rate:</span> {template.stats.openRate.toFixed(1)}%
                            </div>
                            <div>
                              <span className="font-medium">Click Rate:</span> {template.stats.clickRate.toFixed(1)}%
                            </div>
                            <div>
                              <span className="font-medium">Status:</span> 
                              <Badge variant={template.isActive ? 'default' : 'secondary'} className="ml-1">
                                {template.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* AI Assistants Tab */}
            <TabsContent value="ai" className="mt-6">
              <div className="space-y-4">
                {aiAssistants.map((assistant) => (
                  <Card key={assistant.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{assistant.name}</h3>
                            <Badge variant="outline">{assistant.role.replace('_', ' ')}</Badge>
                            <Badge variant={assistant.isActive ? 'default' : 'secondary'}>
                              {assistant.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {assistant.autoRespond && (
                              <Badge variant="outline" className="text-green-500">
                                <Zap className="w-3 h-3 mr-1" />
                                Auto-Respond
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{assistant.personality}</p>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Emails Handled:</span> {assistant.stats.emailsHandled}
                            </div>
                            <div>
                              <span className="font-medium">Avg Response:</span> {assistant.stats.avgResponseTime}min
                            </div>
                            <div>
                              <span className="font-medium">Satisfaction:</span> {assistant.stats.satisfactionScore}/5
                            </div>
                            <div>
                              <span className="font-medium">Accuracy:</span> {assistant.stats.accuracyRate}%
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-sm font-medium">Specializations:</span>
                            <div className="flex gap-1 mt-1">
                              {assistant.specializations.map((spec, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {spec.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedAI(assistant);
                          setAiConfigDialog(true);
                        }}>
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Configuration Dialog */}
      <Dialog open={aiConfigDialog} onOpenChange={setAiConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure AI Assistant: {selectedAI?.name}</DialogTitle>
          </DialogHeader>
          {selectedAI && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Response Delay (minutes)</label>
                  <Input type="number" value={selectedAI.responseDelay} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Confidence Threshold</label>
                  <Input type="number" value={selectedAI.confidence_threshold} readOnly />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Personality</label>
                <Textarea value={selectedAI.personality} readOnly rows={3} />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedAI.isActive} readOnly />
                  <label className="text-sm">Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedAI.autoRespond} readOnly />
                  <label className="text-sm">Auto-Respond</label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAiConfigDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Configuration Saved",
                    description: `${selectedAI.name} settings updated`,
                  });
                  setAiConfigDialog(false);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
