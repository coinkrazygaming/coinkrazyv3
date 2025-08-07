import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Mail,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Send,
  Copy,
  Save,
  RefreshCw,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Server,
  Key,
  Shield,
  Zap,
} from 'lucide-react';
import { emailService, EmailTemplate, SMTPConfig, EmailJob } from '../services/emailService';
import { useToast } from '@/hooks/use-toast';

const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [smtpConfig, setSMTPConfig] = useState<SMTPConfig | null>(null);
  const [emailQueue, setEmailQueue] = useState<EmailJob[]>([]);
  const [activeTab, setActiveTab] = useState('templates');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isSMTPDialogOpen, setIsSMTPDialogOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    category: 'notification' as EmailTemplate['category'],
    active: true,
    variables: [] as string[],
  });

  const [smtpForm, setSMTPForm] = useState({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'CoinKrazy',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const templatesData = emailService.getAllTemplates();
      setTemplates(templatesData);

      const config = emailService.getSMTPConfig();
      setSMTPConfig(config);
      if (config) {
        setSMTPForm(config);
      }

      const queue = emailService.getEmailQueue();
      setEmailQueue(queue);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load email data',
        variant: 'destructive',
      });
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate) {
        await emailService.updateTemplate(editingTemplate.id, templateForm);
        toast({
          title: 'Success',
          description: 'Template updated successfully',
        });
      } else {
        await emailService.saveTemplate(templateForm);
        toast({
          title: 'Success',
          description: 'Template created successfully',
        });
      }

      setIsEditorOpen(false);
      setEditingTemplate(null);
      resetTemplateForm();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await emailService.deleteTemplate(id);
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      category: template.category,
      active: template.active,
      variables: template.variables,
    });
    setIsEditorOpen(true);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      htmlContent: '',
      textContent: '',
      category: 'notification',
      active: true,
      variables: [],
    });
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleSaveSMTPConfig = async () => {
    try {
      await emailService.saveSMTPConfig(smtpForm);
      setSMTPConfig(smtpForm);
      setIsSMTPDialogOpen(false);
      toast({
        title: 'Success',
        description: 'SMTP configuration saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save SMTP configuration',
        variant: 'destructive',
      });
    }
  };

  const handleTestSMTPConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await emailService.testSMTPConnection();
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test SMTP connection',
        variant: 'destructive',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(match => match.slice(2, -2)))];
  };

  const updateVariables = () => {
    const htmlVars = extractVariables(templateForm.htmlContent);
    const textVars = extractVariables(templateForm.textContent);
    const subjectVars = extractVariables(templateForm.subject);
    const allVars = [...new Set([...htmlVars, ...textVars, ...subjectVars])];
    setTemplateForm(prev => ({ ...prev, variables: allVars }));
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: EmailJob['status']) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'sending': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const emailStats = emailService.getEmailStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">Manage email templates and SMTP configuration</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSMTPDialogOpen} onOpenChange={setIsSMTPDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                SMTP Config
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetTemplateForm(); setEditingTemplate(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="queue">Email Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="password_reset">Password Reset</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant={template.active ? 'default' : 'secondary'}>
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Template</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{template.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{template.subject}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Variables: {template.variables.length}</span>
                    <span>{template.active ? 'Active' : 'Inactive'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Email Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{emailStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Emails</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{emailStats.sent}</p>
                    <p className="text-xs text-muted-foreground">Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{emailStats.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{emailStats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailQueue.slice(0, 10).map((job) => {
                    const template = templates.find(t => t.id === job.templateId);
                    return (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(job.status)}
                            <span className="capitalize">{job.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>{job.to}</TableCell>
                        <TableCell>{template?.name || 'Unknown'}</TableCell>
                        <TableCell>{job.attempts}</TableCell>
                        <TableCell>
                          {job.scheduledAt ? job.scheduledAt.toLocaleString() : 'Now'}
                        </TableCell>
                        <TableCell>
                          {job.status === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => emailService.retryFailedEmails()}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Delivery Rate</span>
                    <span>{((emailStats.sent / Math.max(emailStats.total, 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(emailStats.sent / Math.max(emailStats.total, 1)) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Success Rate</span>
                    <span>{(((emailStats.sent) / Math.max(emailStats.sent + emailStats.failed, 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={((emailStats.sent) / Math.max(emailStats.sent + emailStats.failed, 1)) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.slice(0, 5).map((template) => {
                    const usage = emailQueue.filter(job => job.templateId === template.id).length;
                    return (
                      <div key={template.id} className="flex justify-between items-center">
                        <span className="text-sm">{template.name}</span>
                        <Badge variant="outline">{usage} sent</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure your email server settings for sending emails
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {smtpConfig ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">SMTP Server</h4>
                      <p className="text-sm text-muted-foreground">{smtpConfig.host}:{smtpConfig.port}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleTestSMTPConnection} disabled={isTestingConnection}>
                        {isTestingConnection ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        Test Connection
                      </Button>
                      <Button onClick={() => setIsSMTPDialogOpen(true)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No SMTP Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure your SMTP server to start sending emails
                  </p>
                  <Button onClick={() => setIsSMTPDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add SMTP Config
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SMTP Configuration Dialog */}
      <Dialog open={isSMTPDialogOpen} onOpenChange={setIsSMTPDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>SMTP Configuration</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                value={smtpForm.host}
                onChange={(e) => setSMTPForm(prev => ({ ...prev, host: e.target.value }))}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">Port</Label>
              <Input
                id="smtp-port"
                type="number"
                value={smtpForm.port}
                onChange={(e) => setSMTPForm(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                placeholder="587"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-username">Username</Label>
              <Input
                id="smtp-username"
                value={smtpForm.username}
                onChange={(e) => setSMTPForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">Password</Label>
              <Input
                id="smtp-password"
                type="password"
                value={smtpForm.password}
                onChange={(e) => setSMTPForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="App password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                value={smtpForm.fromEmail}
                onChange={(e) => setSMTPForm(prev => ({ ...prev, fromEmail: e.target.value }))}
                placeholder="noreply@coinfrazy.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                value={smtpForm.fromName}
                onChange={(e) => setSMTPForm(prev => ({ ...prev, fromName: e.target.value }))}
                placeholder="CoinKrazy"
              />
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                checked={smtpForm.secure}
                onCheckedChange={(checked) => setSMTPForm(prev => ({ ...prev, secure: checked }))}
              />
              <Label>Use SSL/TLS</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSMTPDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSMTPConfig}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Welcome Email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-category">Category</Label>
                <Select
                  value={templateForm.category}
                  onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value as EmailTemplate['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="verification">Verification</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="password_reset">Password Reset</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject Line</Label>
              <Input
                id="template-subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Welcome to CoinKrazy!"
                onBlur={updateVariables}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-html">HTML Content</Label>
              <Textarea
                id="template-html"
                value={templateForm.htmlContent}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, htmlContent: e.target.value }))}
                placeholder="HTML email content..."
                className="min-h-[200px] font-mono text-sm"
                onBlur={updateVariables}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-text">Text Content</Label>
              <Textarea
                id="template-text"
                value={templateForm.textContent}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, textContent: e.target.value }))}
                placeholder="Plain text email content..."
                className="min-h-[100px]"
                onBlur={updateVariables}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={templateForm.active}
                onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, active: checked }))}
              />
              <Label>Active Template</Label>
            </div>

            {templateForm.variables.length > 0 && (
              <div className="space-y-2">
                <Label>Variables Found</Label>
                <div className="flex flex-wrap gap-2">
                  {templateForm.variables.map((variable) => (
                    <Badge key={variable} variant="outline">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <p className="text-sm bg-muted p-2 rounded">{previewTemplate.subject}</p>
              </div>
              <div>
                <Label>HTML Preview</Label>
                <div 
                  className="border rounded p-4 max-h-96 overflow-y-auto bg-white"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }}
                />
              </div>
              <div>
                <Label>Text Content</Label>
                <pre className="text-sm bg-muted p-4 rounded max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {previewTemplate.textContent}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplates;
