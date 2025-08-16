import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  FlaskConical,
  Play,
  Pause,
  Square,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  Target,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Star,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Info,
  Lightbulb,
} from "lucide-react";
import {
  abTestingService,
  ABTest,
  ABTestTemplate,
  ABTestResults,
  VariantConfig,
} from "@/services/abTestingService";

interface ABTestingManagerProps {
  className?: string;
}

export default function ABTestingManager({ className }: ABTestingManagerProps) {
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [templates, setTemplates] = useState<ABTestTemplate[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal states
  const [createTestModal, setCreateTestModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ABTestTemplate | null>(null);
  const [viewTestModal, setViewTestModal] = useState<ABTest | null>(null);
  const [testResults, setTestResults] = useState<ABTestResults | null>(null);
  
  // Create test form
  const [testForm, setTestForm] = useState({
    name: "",
    description: "",
    type: "package_design" as ABTest['type'],
    trafficAllocation: 50,
    targetAudience: {
      userSegments: ["all_users"],
      geoTargeting: [],
      deviceTypes: ["desktop", "mobile", "tablet"],
    },
    metrics: {
      primary: "conversion_rate",
      secondary: ["revenue", "aov"],
      minimumSampleSize: 1000,
      confidenceLevel: 95,
      minimumDetectableEffect: 10,
      expectedRuntime: 14,
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadTests();
    loadTemplates();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const testsData = await abTestingService.getTests();
      setTests(testsData);
    } catch (error) {
      console.error("Failed to load A/B tests:", error);
      toast({
        title: "Error",
        description: "Failed to load A/B tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesData = abTestingService.getTestTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const handleCreateTest = async () => {
    if (!selectedTemplate) return;
    
    try {
      setLoading(true);
      
      const newTest = await abTestingService.createTest({
        ...testForm,
        ...selectedTemplate.template,
        name: testForm.name || selectedTemplate.name,
        description: testForm.description || selectedTemplate.description,
        status: 'draft',
        startDate: new Date().toISOString(),
        targetAudience: testForm.targetAudience,
        metrics: testForm.metrics,
        variants: selectedTemplate.template.variants!.map((variant, index) => ({
          ...variant,
          id: `variant_${index}`,
          conversions: 0,
          revenue: 0,
          views: 0,
          uniqueUsers: 0,
        })),
      });
      
      setTests(prev => [newTest, ...prev]);
      setCreateTestModal(false);
      setSelectedTemplate(null);
      
      toast({
        title: "Test Created",
        description: `A/B test "${newTest.name}" has been created`,
      });
      
    } catch (error) {
      console.error("Failed to create test:", error);
      toast({
        title: "Error",
        description: "Failed to create A/B test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId: string) => {
    try {
      await abTestingService.startTest(testId);
      await loadTests();
      
      toast({
        title: "Test Started",
        description: "A/B test is now running",
      });
    } catch (error) {
      console.error("Failed to start test:", error);
      toast({
        title: "Error",
        description: "Failed to start test",
        variant: "destructive",
      });
    }
  };

  const handlePauseTest = async (testId: string) => {
    try {
      await abTestingService.pauseTest(testId);
      await loadTests();
      
      toast({
        title: "Test Paused",
        description: "A/B test has been paused",
      });
    } catch (error) {
      console.error("Failed to pause test:", error);
      toast({
        title: "Error",
        description: "Failed to pause test",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTest = async (testId: string) => {
    try {
      await abTestingService.completeTest(testId);
      await loadTests();
      
      toast({
        title: "Test Completed",
        description: "A/B test has been completed and results calculated",
      });
    } catch (error) {
      console.error("Failed to complete test:", error);
      toast({
        title: "Error",
        description: "Failed to complete test",
        variant: "destructive",
      });
    }
  };

  const handleViewResults = async (test: ABTest) => {
    try {
      setLoading(true);
      const results = await abTestingService.calculateTestResults(test.id);
      setTestResults(results);
      setViewTestModal(test);
    } catch (error) {
      console.error("Failed to load test results:", error);
      toast({
        title: "Error",
        description: "Failed to load test results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ABTest['status']) => {
    switch (status) {
      case 'running':
        return <Play className="w-3 h-3" />;
      case 'draft':
        return <Edit className="w-3 h-3" />;
      case 'paused':
        return <Pause className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getConfidenceColor = (isSignificant: boolean, confidenceLevel: number) => {
    if (!isSignificant) return 'text-red-600';
    if (confidenceLevel >= 95) return 'text-green-600';
    if (confidenceLevel >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && (test.status === 'running' || test.status === 'paused')) ||
                      (activeTab === 'completed' && test.status === 'completed') ||
                      (activeTab === 'drafts' && test.status === 'draft');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-purple-600" />
            A/B Testing Manager
          </h2>
          <p className="text-muted-foreground">
            Create and manage A/B tests for package designs and user experience
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={loadTests} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateTestModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Test
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tests</p>
                <p className="text-2xl font-bold">
                  {tests.filter(t => t.status === 'running').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {tests.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Winning Tests</p>
                <p className="text-2xl font-bold">
                  {tests.filter(t => t.results?.isSignificant).length}
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Lift</p>
                <p className="text-2xl font-bold">
                  {tests.filter(t => t.results?.liftPercentage).length > 0
                    ? `${(tests.filter(t => t.results?.liftPercentage).reduce((sum, t) => sum + (t.results!.liftPercentage || 0), 0) / tests.filter(t => t.results?.liftPercentage).length).toFixed(1)}%`
                    : '0%'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="all">All Tests</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => {
                const totalParticipants = test.variants.reduce((sum, v) => sum + v.uniqueUsers, 0);
                const progress = test.metrics.minimumSampleSize > 0 
                  ? Math.min((totalParticipants / test.metrics.minimumSampleSize) * 100, 100)
                  : 0;
                
                const controlVariant = test.variants.find(v => v.isControl);
                const controlConversion = controlVariant && controlVariant.uniqueUsers > 0
                  ? (controlVariant.conversions / controlVariant.uniqueUsers) * 100
                  : 0;

                return (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {test.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(test.status)}>
                        {getStatusIcon(test.status)}
                        <span className="ml-1 capitalize">{test.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Progress value={progress} className="w-16 h-2" />
                          <span className="text-xs">{progress.toFixed(0)}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {totalParticipants.toLocaleString()} / {test.metrics.minimumSampleSize.toLocaleString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{controlConversion.toFixed(2)}%</span>
                        {test.results?.liftPercentage && (
                          <div className={`text-xs ${test.results.liftPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {test.results.liftPercentage > 0 ? '+' : ''}{test.results.liftPercentage.toFixed(1)}% lift
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {test.results ? (
                        <div className={`text-sm ${getConfidenceColor(test.results.isSignificant, test.results.confidenceLevel)}`}>
                          <span className="font-medium">
                            {test.results.isSignificant ? '✓' : '✗'} {test.results.confidenceLevel}%
                          </span>
                          <div className="text-xs">
                            p={test.results.pValue?.toFixed(3) || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Calculating...</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {test.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartTest(test.id)}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {test.status === 'running' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseTest(test.id)}
                          >
                            <Pause className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {(test.status === 'running' || test.status === 'paused') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteTest(test.id)}
                          >
                            <Square className="w-3 h-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewResults(test)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredTests.length === 0 && (
            <div className="text-center py-12">
              <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No A/B tests found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first A/B test to start optimizing your packages.
              </p>
              <Button onClick={() => setCreateTestModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Test Modal */}
      <Dialog open={createTestModal} onOpenChange={setCreateTestModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create A/B Test</DialogTitle>
            <DialogDescription>
              Choose a template and configure your A/B test
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {!selectedTemplate ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Choose Test Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                          <Badge className={
                            template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {template.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>~{template.estimatedRuntime} days</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="w-4 h-4" />
                            <span>{template.successMetrics.join(', ')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    ← Back to Templates
                  </Button>
                  <Badge>{selectedTemplate.name}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="test-name">Test Name</Label>
                      <Input
                        id="test-name"
                        placeholder={selectedTemplate.name}
                        value={testForm.name}
                        onChange={(e) => setTestForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="test-description">Description</Label>
                      <Textarea
                        id="test-description"
                        placeholder={selectedTemplate.description}
                        value={testForm.description}
                        onChange={(e) => setTestForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="traffic-allocation">Traffic Allocation (%)</Label>
                      <Input
                        id="traffic-allocation"
                        type="number"
                        min="1"
                        max="100"
                        value={testForm.trafficAllocation}
                        onChange={(e) => setTestForm(prev => ({ ...prev, trafficAllocation: parseInt(e.target.value) || 50 }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sample-size">Minimum Sample Size</Label>
                      <Input
                        id="sample-size"
                        type="number"
                        min="100"
                        value={testForm.metrics.minimumSampleSize}
                        onChange={(e) => setTestForm(prev => ({
                          ...prev,
                          metrics: { ...prev.metrics, minimumSampleSize: parseInt(e.target.value) || 1000 }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Template Variants</Label>
                      <div className="space-y-2 mt-2">
                        {selectedTemplate.template.variants?.map((variant, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{variant.name}</span>
                              <Badge variant={variant.isControl ? 'default' : 'secondary'}>
                                {variant.isControl ? 'Control' : 'Variant'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{variant.description}</p>
                            <div className="text-xs text-muted-foreground mt-1">
                              Traffic: {variant.trafficSplit}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Success Metrics</Label>
                      <div className="space-y-1 mt-2">
                        {selectedTemplate.successMetrics.map((metric, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Target className="w-3 h-3" />
                            {metric}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTestModal(false)}>
              Cancel
            </Button>
            {selectedTemplate && (
              <Button onClick={handleCreateTest} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Test
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Results Modal */}
      {viewTestModal && (
        <Dialog open={!!viewTestModal} onOpenChange={() => {
          setViewTestModal(null);
          setTestResults(null);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewTestModal.name} - Results</DialogTitle>
              <DialogDescription>
                Detailed A/B test results and statistical analysis
              </DialogDescription>
            </DialogHeader>

            {testResults && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className={`text-2xl font-bold ${getConfidenceColor(testResults.isSignificant, testResults.confidenceLevel)}`}>
                        {testResults.isSignificant ? '✓ Significant' : '✗ Not Significant'}
                      </div>
                      <p className="text-sm text-muted-foreground">Statistical Significance</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">
                        {testResults.liftPercentage?.toFixed(1) || '0'}%
                      </div>
                      <p className="text-sm text-muted-foreground">Conversion Lift</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">
                        {testResults.totalParticipants.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Participants</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Variant Performance */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Variant Performance</h3>
                  <div className="space-y-3">
                    {viewTestModal.variants.map((variant) => {
                      const conversionRate = testResults.conversionRates[variant.id] || 0;
                      const revenue = testResults.revenuePerVariant[variant.id] || 0;
                      
                      return (
                        <div key={variant.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{variant.name}</h4>
                              {variant.isControl && <Badge>Control</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {variant.trafficSplit}% traffic
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Conversion Rate</p>
                              <p className="font-medium">{(conversionRate * 100).toFixed(2)}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Revenue</p>
                              <p className="font-medium">${revenue.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Participants</p>
                              <p className="font-medium">{variant.uniqueUsers}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Conversions</p>
                              <p className="font-medium">{variant.conversions}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Insights */}
                {testResults.insights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                    <div className="space-y-2">
                      {testResults.insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Recommended Action</h4>
                  <p className="text-sm capitalize">{testResults.recommendedAction.replace('_', ' ')}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
