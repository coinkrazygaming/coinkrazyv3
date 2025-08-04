import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Tag,
} from "lucide-react";
import {
  cmsService,
  CmsPage,
  CmsTemplate,
  CmsAsset,
  CmsForm,
  CmsSettings,
} from "@/services/cmsService";

const CmsManagement: React.FC = () => {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [templates, setTemplates] = useState<CmsTemplate[]>([]);
  const [assets, setAssets] = useState<CmsAsset[]>([]);
  const [forms, setForms] = useState<CmsForm[]>([]);
  const [settings, setSettings] = useState<CmsSettings | null>(null);
  const [contentStats, setContentStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);
  const [isEditPageOpen, setIsEditPageOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [newPageData, setNewPageData] = useState({
    title: "",
    slug: "",
    content: [],
    metadata: {
      description: "",
      keywords: [],
      status: "draft" as "draft" | "published",
      template: "default",
    },
    settings: {
      showInNavigation: true,
      requireAuth: false,
      allowComments: false,
      enableLiveChat: true,
    },
  });

  useEffect(() => {
    loadCmsData();

    // Subscribe to CMS updates
    const unsubscribe = cmsService.subscribe(() => {
      loadCmsData();
    });

    return unsubscribe;
  }, []);

  const loadCmsData = () => {
    setPages(cmsService.getAllPages());
    setTemplates(cmsService.getAllTemplates());
    setAssets(cmsService.getAllAssets());
    setForms(cmsService.getAllForms());
    setSettings(cmsService.getSettings());
    setContentStats(cmsService.getContentStats());
  };

  const handleCreatePage = () => {
    const pageId = cmsService.createPage(newPageData);
    if (pageId) {
      setIsCreatePageOpen(false);
      resetNewPageData();
      loadCmsData();
    }
  };

  const handleUpdatePage = (pageId: string, updates: Partial<CmsPage>) => {
    cmsService.updatePage(pageId, updates);
    loadCmsData();
  };

  const handleDeletePage = (pageId: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      cmsService.deletePage(pageId);
      loadCmsData();
    }
  };

  const resetNewPageData = () => {
    setNewPageData({
      title: "",
      slug: "",
      content: [],
      metadata: {
        description: "",
        keywords: [],
        status: "draft",
        template: "default",
      },
      settings: {
        showInNavigation: true,
        requireAuth: false,
        allowComments: false,
        enableLiveChat: true,
      },
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        await cmsService.uploadAsset(file, "uploads");
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    loadCmsData();
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.metadata.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "draft":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "archived":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CMS Management</h2>
          <p className="text-muted-foreground">
            Content Management System with Visual Builder
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreatePageOpen} onOpenChange={setIsCreatePageOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                New Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
                <DialogDescription>
                  Create a new page with custom content and settings
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="page-title">Page Title</Label>
                    <Input
                      id="page-title"
                      value={newPageData.title}
                      onChange={(e) =>
                        setNewPageData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter page title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="page-slug">Slug</Label>
                    <Input
                      id="page-slug"
                      value={newPageData.slug}
                      onChange={(e) =>
                        setNewPageData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      placeholder="/page-url"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="page-description">Description</Label>
                  <Textarea
                    id="page-description"
                    value={newPageData.metadata.description}
                    onChange={(e) =>
                      setNewPageData((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          description: e.target.value,
                        },
                      }))
                    }
                    placeholder="Enter page description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="page-status">Status</Label>
                    <Select
                      value={newPageData.metadata.status}
                      onValueChange={(value: "draft" | "published") =>
                        setNewPageData((prev) => ({
                          ...prev,
                          metadata: { ...prev.metadata, status: value },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="page-template">Template</Label>
                    <Select
                      value={newPageData.metadata.template}
                      onValueChange={(value) =>
                        setNewPageData((prev) => ({
                          ...prev,
                          metadata: { ...prev.metadata, template: value },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatePageOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreatePage}>Create Page</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {contentStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pages</p>
                  <p className="text-2xl font-bold">
                    {contentStats.totalPages}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">
                    {contentStats.publishedPages}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold">
                    {contentStats.draftPages}
                  </p>
                </div>
                <Edit className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assets</p>
                  <p className="text-2xl font-bold">
                    {contentStats.totalAssets}
                  </p>
                </div>
                <Image className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Forms</p>
                  <p className="text-2xl font-bold">
                    {contentStats.totalForms}
                  </p>
                </div>
                <Layout className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <p className="text-2xl font-bold">
                    {contentStats.totalFormSubmissions}
                  </p>
                </div>
                <Users className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main CMS Tabs */}
      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pages">
            <FileText className="w-4 h-4 mr-2" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Image className="w-4 h-4 mr-2" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Layout className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="forms">
            <Users className="w-4 h-4 mr-2" />
            Forms
          </TabsTrigger>
          <TabsTrigger value="navigation">
            <Link className="w-4 h-4 mr-2" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Pages
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{page.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {page.slug}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={getStatusColor(page.metadata.status)}
                          >
                            {page.metadata.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Last modified:{" "}
                            {page.metadata.lastModified.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePage(page.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Media Assets
                </CardTitle>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="relative group border border-border/50 rounded-lg overflow-hidden hover:border-border transition-colors"
                  >
                    {asset.mimeType.startsWith("image/") ? (
                      <img
                        src={asset.url}
                        alt={asset.alt || asset.originalName}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">
                        {asset.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(asset.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Page Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-border/50 rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Forms & Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-4 border border-border/50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{form.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {form.submissions.length} submissions
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Analytics
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Site Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Navigation management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Content Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-muted-foreground">
                  Track page views, user engagement, and content performance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>CMS Settings</DialogTitle>
            <DialogDescription>
              Configure global CMS settings and preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {settings && (
              <Tabs defaultValue="general">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Site Name</Label>
                      <Input value={settings.siteName} readOnly />
                    </div>
                    <div>
                      <Label>Site URL</Label>
                      <Input value={settings.siteUrl} readOnly />
                    </div>
                  </div>
                  <div>
                    <Label>Site Description</Label>
                    <Textarea value={settings.siteDescription} readOnly />
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <p className="text-muted-foreground">
                    SEO settings and meta tag configuration
                  </p>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <p className="text-muted-foreground">
                    Analytics and tracking configuration
                  </p>
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Twitter</Label>
                      <Input value={settings.social.twitter || ""} readOnly />
                    </div>
                    <div>
                      <Label>Discord</Label>
                      <Input value={settings.social.discord || ""} readOnly />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Close
            </Button>
            <Button>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CmsManagement;
