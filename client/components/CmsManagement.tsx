import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Image,
  Upload,
  Download,
  Settings,
  Layout,
  Code,
  Globe,
  Users,
  BarChart3,
  Folder,
  Link,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Save,
  X,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Database,
  Navigation,
  MapPin,
  Target,
  Zap,
  Shield,
  Mail,
  Phone,
  MessageSquare,
  Share2,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  BarChart,
  LineChart,
  MousePointer,
  Timer,
  Percent,
  Hash,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { 
  cmsService, 
  CMSPage, 
  CMSMedia, 
  CMSTemplate, 
  CMSForm, 
  CMSNavigation, 
  CMSRedirect,
  CMSContent,
  CMSAnalytics,
} from "@/services/cmsService";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  height = "300px"
}) => {
  const [content, setContent] = useState(value);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    const editor = document.getElementById('rich-text-editor') as HTMLElement;
    if (editor) {
      onChange(editor.innerHTML);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('formatBlock', 'h1')}
          className="h-8 w-8 p-0"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('formatBlock', 'h2')}
          className="h-8 w-8 p-0"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('formatBlock', 'h3')}
          className="h-8 w-8 p-0"
        >
          <Heading3 className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('justifyLeft')}
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('justifyCenter')}
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('justifyRight')}
          className="h-8 w-8 p-0"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('insertUnorderedList')}
          className="h-8 w-8 p-0"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('insertOrderedList')}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('formatBlock', 'blockquote')}
          className="h-8 w-8 p-0"
        >
          <Quote className="w-4 h-4" />
        </Button>
      </div>
      
      <div
        id="rich-text-editor"
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(e) => {
          const newContent = e.currentTarget.innerHTML;
          setContent(newContent);
          onChange(newContent);
        }}
        className="p-4 min-h-[200px] outline-none"
        style={{ height }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default function CmsManagement() {
  // State management
  const [activeTab, setActiveTab] = useState("pages");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Data states
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [media, setMedia] = useState<CMSMedia[]>([]);
  const [templates, setTemplates] = useState<CMSTemplate[]>([]);
  const [forms, setForms] = useState<CMSForm[]>([]);
  const [navigations, setNavigations] = useState<CMSNavigation[]>([]);
  const [redirects, setRedirects] = useState<CMSRedirect[]>([]);
  
  // Dialog states
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [redirectDialogOpen, setRedirectDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<CMSMedia | null>(null);
  
  // Form states
  const [pageForm, setPageForm] = useState<Partial<CMSPage>>({
    title: "",
    slug: "",
    content: [],
    meta: {
      description: "",
      keywords: [],
    },
    status: "draft",
    template: "default",
    settings: {
      showInNav: false,
      requireAuth: false,
      allowComments: false,
      enableSharing: true,
    },
    analytics: {
      views: 0,
    },
    sortOrder: 0,
  });
  
  const [formData, setFormData] = useState<Partial<CMSForm>>({
    name: "",
    description: "",
    fields: [],
    settings: {
      submitText: "Submit",
      emailNotifications: false,
      captcha: false,
      doubleOptIn: false,
    },
    isActive: true,
  });

  const [redirectForm, setRedirectForm] = useState<Partial<CMSRedirect>>({
    from: "",
    to: "",
    type: 301,
    isActive: true,
  });

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [pagesData, mediaData, templatesData, formsData, navigationsData, redirectsData] = await Promise.all([
        cmsService.getAllPages(),
        cmsService.getAllMedia(),
        cmsService.getAllTemplates(),
        cmsService.getAllForms(),
        cmsService.getAllNavigations(),
        cmsService.getAllRedirects(),
      ]);
      
      setPages(pagesData);
      setMedia(mediaData);
      setTemplates(templatesData);
      setForms(formsData);
      setNavigations(navigationsData);
      setRedirects(redirectsData);
    } catch (error) {
      console.error("Error loading CMS data:", error);
      toast({
        title: "Error",
        description: "Failed to load CMS data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Page management functions
  const handleCreatePage = async () => {
    try {
      if (!pageForm.title || !pageForm.slug) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const newPage = await cmsService.createPage({
        ...pageForm,
        author: {
          id: "admin_1",
          name: "Admin User",
          email: "admin@coinkrazy.com",
        },
      } as Omit<CMSPage, "id" | "createdAt" | "updatedAt" | "version">);
      
      setPages(prev => [newPage, ...prev]);
      setPageDialogOpen(false);
      setPageForm({
        title: "",
        slug: "",
        content: [],
        meta: { description: "", keywords: [] },
        status: "draft",
        template: "default",
        settings: {
          showInNav: false,
          requireAuth: false,
          allowComments: false,
          enableSharing: true,
        },
        analytics: { views: 0 },
        sortOrder: 0,
      });
      
      toast({
        title: "Success",
        description: "Page created successfully.",
      });
    } catch (error) {
      console.error("Error creating page:", error);
      toast({
        title: "Error",
        description: "Failed to create page. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePage = async (id: string, updates: Partial<CMSPage>) => {
    try {
      const updatedPage = await cmsService.updatePage(id, updates);
      setPages(prev => prev.map(p => p.id === id ? updatedPage : p));
      
      toast({
        title: "Success",
        description: "Page updated successfully.",
      });
    } catch (error) {
      console.error("Error updating page:", error);
      toast({
        title: "Error",
        description: "Failed to update page. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      await cmsService.deletePage(id);
      setPages(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "Success",
        description: "Page deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting page:", error);
      toast({
        title: "Error",
        description: "Failed to delete page. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublishPage = async (id: string) => {
    try {
      const publishedPage = await cmsService.publishPage(id);
      setPages(prev => prev.map(p => p.id === id ? publishedPage : p));
      
      toast({
        title: "Success",
        description: "Page published successfully.",
      });
    } catch (error) {
      console.error("Error publishing page:", error);
      toast({
        title: "Error",
        description: "Failed to publish page. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicatePage = async (id: string) => {
    try {
      const duplicatedPage = await cmsService.duplicatePage(id);
      setPages(prev => [duplicatedPage, ...prev]);
      
      toast({
        title: "Success",
        description: "Page duplicated successfully.",
      });
    } catch (error) {
      console.error("Error duplicating page:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate page. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Media management functions
  const handleUploadMedia = async (files: FileList) => {
    try {
      const uploadPromises = Array.from(files).map(file => 
        cmsService.uploadMedia(file, "general")
      );
      
      const uploadedMedia = await Promise.all(uploadPromises);
      setMedia(prev => [...uploadedMedia, ...prev]);
      
      toast({
        title: "Success",
        description: `${uploadedMedia.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({
        title: "Error",
        description: "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await cmsService.deleteMedia(id);
      setMedia(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: "Success",
        description: "Media deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to delete media. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Form management functions
  const handleCreateForm = async () => {
    try {
      if (!formData.name) {
        toast({
          title: "Validation Error",
          description: "Please enter a form name.",
          variant: "destructive",
        });
        return;
      }

      const newForm = await cmsService.createForm(formData as Omit<CMSForm, "id" | "createdAt" | "submissions">);
      setForms(prev => [newForm, ...prev]);
      setFormDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        fields: [],
        settings: {
          submitText: "Submit",
          emailNotifications: false,
          captcha: false,
          doubleOptIn: false,
        },
        isActive: true,
      });
      
      toast({
        title: "Success",
        description: "Form created successfully.",
      });
    } catch (error) {
      console.error("Error creating form:", error);
      toast({
        title: "Error",
        description: "Failed to create form. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Redirect management functions
  const handleCreateRedirect = async () => {
    try {
      if (!redirectForm.from || !redirectForm.to) {
        toast({
          title: "Validation Error",
          description: "Please fill in both source and destination URLs.",
          variant: "destructive",
        });
        return;
      }

      const newRedirect = await cmsService.createRedirect(redirectForm as Omit<CMSRedirect, "id" | "createdAt" | "hits">);
      setRedirects(prev => [newRedirect, ...prev]);
      setRedirectDialogOpen(false);
      setRedirectForm({
        from: "",
        to: "",
        type: 301,
        isActive: true,
      });
      
      toast({
        title: "Success",
        description: "Redirect created successfully.",
      });
    } catch (error) {
      console.error("Error creating redirect:", error);
      toast({
        title: "Error",
        description: "Failed to create redirect. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter and sort functions
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || page.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const aVal = a[sortBy as keyof CMSPage];
    const bVal = b[sortBy as keyof CMSPage];
    
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "draft": return "secondary";
      case "archived": return "outline";
      case "scheduled": return "destructive";
      default: return "secondary";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="w-6 h-6" />
            Content Management System
          </h2>
          <p className="text-muted-foreground">
            Manage all website content, pages, media, and forms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Forms
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="redirects" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Redirects
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            SEO Tools
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SortAsc className="w-4 h-4 mr-1" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("title")}>
                    Title
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("updatedAt")}>
                    Last Modified
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("status")}>
                    Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                    {sortOrder === "asc" ? "Descending" : "Ascending"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Dialog open={pageDialogOpen} onOpenChange={setPageDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Page
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Page</DialogTitle>
                  <DialogDescription>
                    Create a new page for your website with all the necessary settings.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="page-title">Page Title *</Label>
                      <Input
                        id="page-title"
                        value={pageForm.title}
                        onChange={(e) => setPageForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter page title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="page-slug">URL Slug *</Label>
                      <Input
                        id="page-slug"
                        value={pageForm.slug}
                        onChange={(e) => setPageForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                        placeholder="page-url-slug"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="page-description">Meta Description</Label>
                    <Textarea
                      id="page-description"
                      value={pageForm.meta?.description || ""}
                      onChange={(e) => setPageForm(prev => ({ 
                        ...prev, 
                        meta: { ...prev.meta, description: e.target.value } 
                      }))}
                      placeholder="Brief description for search engines (150-160 characters)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="page-keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="page-keywords"
                      value={pageForm.meta?.keywords?.join(", ") || ""}
                      onChange={(e) => setPageForm(prev => ({ 
                        ...prev, 
                        meta: { 
                          ...prev.meta, 
                          keywords: e.target.value.split(",").map(k => k.trim()).filter(k => k) 
                        } 
                      }))}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="page-status">Status</Label>
                      <Select 
                        value={pageForm.status} 
                        onValueChange={(value) => setPageForm(prev => ({ ...prev, status: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="page-template">Template</Label>
                      <Select 
                        value={pageForm.template} 
                        onValueChange={(value) => setPageForm(prev => ({ ...prev, template: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Page Settings</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-in-nav">Show in Navigation</Label>
                        <Switch
                          id="show-in-nav"
                          checked={pageForm.settings?.showInNav}
                          onCheckedChange={(checked) => setPageForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, showInNav: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-auth">Require Authentication</Label>
                        <Switch
                          id="require-auth"
                          checked={pageForm.settings?.requireAuth}
                          onCheckedChange={(checked) => setPageForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, requireAuth: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-comments">Allow Comments</Label>
                        <Switch
                          id="allow-comments"
                          checked={pageForm.settings?.allowComments}
                          onCheckedChange={(checked) => setPageForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, allowComments: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-sharing">Enable Sharing</Label>
                        <Switch
                          id="enable-sharing"
                          checked={pageForm.settings?.enableSharing}
                          onCheckedChange={(checked) => setPageForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, enableSharing: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setPageDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePage}>
                    Create Page
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredPages.map((page) => (
              <Card key={page.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{page.title}</h3>
                        <Badge variant={getStatusColor(page.status)}>
                          {page.status.toUpperCase()}
                        </Badge>
                        {page.settings.showInNav && (
                          <Badge variant="outline">
                            <Navigation className="w-3 h-3 mr-1" />
                            In Navigation
                          </Badge>
                        )}
                        {page.settings.requireAuth && (
                          <Badge variant="outline">
                            <Shield className="w-3 h-3 mr-1" />
                            Requires Auth
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {page.meta.description || "No description available"}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>/{page.slug}</span>
                        <span>•</span>
                        <span>Modified: {new Date(page.updatedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Author: {page.author.name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {page.analytics.views.toLocaleString()} views
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedPage(page);
                          setPageForm(page);
                          setPageDialogOpen(true);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/${page.slug}`, "_blank")}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePage(page.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {page.status === "draft" && (
                          <DropdownMenuItem onClick={() => handlePublishPage(page.id)}>
                            <Globe className="w-4 h-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Page</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{page.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePage(page.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredPages.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No pages found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterStatus !== "all" 
                      ? "Try adjusting your search or filter settings"
                      : "Get started by creating your first page"
                    }
                  </p>
                  {!searchTerm && filterStatus === "all" && (
                    <Button onClick={() => setPageDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Page
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={(e) => e.target.files && handleUploadMedia(e.target.files)}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload">
                <Button asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Media
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <Card key={item.id} className="group relative overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {item.mimeType.startsWith("image/") ? (
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <FileText className="w-8 h-8 mb-2" />
                      <span className="text-xs">{item.mimeType.split("/")[1].toUpperCase()}</span>
                    </div>
                  )}
                </div>
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setSelectedMedia(item)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(item.url)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Media</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{item.originalName}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteMedia(item.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <CardContent className="p-3">
                  <p className="text-xs font-medium truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.size)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {media.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No media files</h3>
                <p className="text-muted-foreground mb-4">
                  Upload images, videos, and documents to get started
                </p>
                <label htmlFor="media-upload">
                  <Button asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First File
                    </span>
                  </Button>
                </label>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms..."
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Form
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Form</DialogTitle>
                  <DialogDescription>
                    Create a new form to collect user information and feedback.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="form-name">Form Name *</Label>
                    <Input
                      id="form-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Contact Form"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form-description">Description</Label>
                    <Textarea
                      id="form-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this form"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submit-text">Submit Button Text</Label>
                    <Input
                      id="submit-text"
                      value={formData.settings?.submitText}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        settings: { ...prev.settings, submitText: e.target.value }
                      }))}
                      placeholder="Submit"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Form Settings</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <Switch
                          id="email-notifications"
                          checked={formData.settings?.emailNotifications}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            settings: { ...prev.settings, emailNotifications: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="captcha">Enable Captcha</Label>
                        <Switch
                          id="captcha"
                          checked={formData.settings?.captcha}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            settings: { ...prev.settings, captcha: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateForm}>
                    Create Form
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {forms.map((form) => (
              <Card key={form.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{form.name}</h3>
                        <Badge variant={form.isActive ? "default" : "secondary"}>
                          {form.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {form.fields.length} field{form.fields.length !== 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="outline">
                          {form.submissions.length} submission{form.submissions.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      
                      {form.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {form.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {new Date(form.createdAt).toLocaleDateString()}</span>
                        {form.settings.emailNotifications && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              Email notifications
                            </span>
                          </>
                        )}
                        {form.settings.captcha && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Protected by captcha
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Form
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Submissions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Code className="w-4 h-4 mr-2" />
                          Get Embed Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Navigation Menus</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Menu
            </Button>
          </div>

          <div className="grid gap-4">
            {navigations.map((nav) => (
              <Card key={nav.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{nav.name}</h4>
                        <Badge variant={nav.isActive ? "default" : "secondary"}>
                          {nav.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {nav.location}
                        </Badge>
                        <Badge variant="outline">
                          {nav.items.length} item{nav.items.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Menu items: {nav.items.map(item => item.label).join(", ")}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Menu
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Redirects Tab */}
        <TabsContent value="redirects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">URL Redirects</h3>
            
            <Dialog open={redirectDialogOpen} onOpenChange={setRedirectDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Redirect
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create URL Redirect</DialogTitle>
                  <DialogDescription>
                    Redirect users from old URLs to new ones to maintain SEO and user experience.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="redirect-from">From URL *</Label>
                    <Input
                      id="redirect-from"
                      value={redirectForm.from}
                      onChange={(e) => setRedirectForm(prev => ({ ...prev, from: e.target.value }))}
                      placeholder="/old-page"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redirect-to">To URL *</Label>
                    <Input
                      id="redirect-to"
                      value={redirectForm.to}
                      onChange={(e) => setRedirectForm(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="/new-page"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redirect-type">Redirect Type</Label>
                    <Select 
                      value={redirectForm.type?.toString()} 
                      onValueChange={(value) => setRedirectForm(prev => ({ ...prev, type: parseInt(value) as 301 | 302 }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select redirect type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="301">301 - Permanent</SelectItem>
                        <SelectItem value="302">302 - Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="redirect-active">Active</Label>
                    <Switch
                      id="redirect-active"
                      checked={redirectForm.isActive}
                      onCheckedChange={(checked) => setRedirectForm(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setRedirectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRedirect}>
                    Create Redirect
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {redirects.map((redirect) => (
              <Card key={redirect.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {redirect.from}
                        </code>
                        <span>→</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {redirect.to}
                        </code>
                        <Badge variant={redirect.isActive ? "default" : "secondary"}>
                          {redirect.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {redirect.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {new Date(redirect.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{redirect.hits} hits</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Stats
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Page Templates</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="group">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    {template.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                    {template.isCustom && (
                      <Badge variant="secondary" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SEO Tools Tab */}
        <TabsContent value="seo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  SEO Analyzer
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Analyze your pages for SEO optimization opportunities
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button className="w-full">
                  <Activity className="w-4 h-4 mr-2" />
                  Analyze SEO
                </Button>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>SEO Score</span>
                      <span>85/100</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Meta title is optimized
                    </div>
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      Meta description could be longer
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Page has proper heading structure
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Sitemap Generator
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate and submit sitemaps to search engines
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{pages.length}</div>
                    <div className="text-sm text-muted-foreground">Total Pages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {pages.filter(p => p.status === "published").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Published</div>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Sitemap
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Last generated: {new Date().toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Meta Tags Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and optimize meta tags across all your pages
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages.slice(0, 5).map((page) => (
                  <div key={page.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{page.title}</h4>
                        <code className="text-sm text-muted-foreground">/{page.slug}</code>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Title:</strong> {page.meta.description ? "✓" : "⚠️"} {page.title}
                      </div>
                      <div>
                        <strong>Description:</strong> {page.meta.description ? "✓" : "⚠️"} 
                        {page.meta.description || "No description set"}
                      </div>
                      <div>
                        <strong>Keywords:</strong> {page.meta.keywords?.length ? "✓" : "⚠️"} 
                        {page.meta.keywords?.length || 0} keywords
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">
                      {pages.reduce((sum, page) => sum + page.analytics.views, 0).toLocaleString()}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Published Pages</p>
                    <p className="text-2xl font-bold">
                      {pages.filter(p => p.status === "published").length}
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Media Files</p>
                    <p className="text-2xl font-bold">{media.length}</p>
                  </div>
                  <Image className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Forms</p>
                    <p className="text-2xl font-bold">
                      {forms.filter(f => f.isActive).length}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pages with the highest view counts and engagement
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages
                  .sort((a, b) => b.analytics.views - a.analytics.views)
                  .slice(0, 10)
                  .map((page, index) => (
                  <div key={page.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{page.title}</p>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{page.analytics.views.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
