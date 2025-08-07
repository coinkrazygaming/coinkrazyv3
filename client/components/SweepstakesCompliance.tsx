import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import {
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  Lock,
  Users,
  Globe,
  Calendar,
  DollarSign,
  Eye,
  Book,
  Settings,
  RefreshCw,
  Download,
  ExternalLink,
  Clock,
  MapPin,
  Scale,
  Crown,
  Star,
  Gift
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ComplianceRule {
  id: string;
  category: 'age_verification' | 'geo_restriction' | 'purchase_limits' | 'fair_play' | 'data_protection';
  title: string;
  description: string;
  isActive: boolean;
  isRequired: boolean;
  lastUpdated: Date;
  details: string[];
  penalties: string[];
}

interface GeographicRestriction {
  id: string;
  country: string;
  state?: string;
  isAllowed: boolean;
  restrictions: string[];
  legalFramework: string;
  lastVerified: Date;
}

interface UserCompliance {
  userId: string;
  ageVerified: boolean;
  identityVerified: boolean;
  locationVerified: boolean;
  consentGiven: boolean;
  termsAccepted: boolean;
  responsibleGamingAcknowledged: boolean;
  complianceScore: number;
  lastVerification: Date;
  violations: ComplianceViolation[];
}

interface ComplianceViolation {
  id: string;
  type: 'age' | 'location' | 'spending' | 'behavior' | 'fraud';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  resolved: boolean;
  action: string;
}

interface SweepstakesLaw {
  jurisdiction: string;
  key: string;
  requirement: string;
  compliance: 'compliant' | 'partial' | 'non_compliant';
  lastReview: Date;
  notes: string;
}

interface AuditLog {
  id: string;
  type: 'verification' | 'restriction' | 'violation' | 'policy_update';
  description: string;
  userId?: string;
  timestamp: Date;
  outcome: 'success' | 'failure' | 'pending';
  details: string;
}

export default function SweepstakesCompliance() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [complianceRules] = useState<ComplianceRule[]>([
    {
      id: 'age_verify',
      category: 'age_verification',
      title: '18+ Age Verification',
      description: 'All users must be 18 years or older to participate',
      isActive: true,
      isRequired: true,
      lastUpdated: new Date('2024-01-01'),
      details: [
        'Government-issued ID verification required',
        'Social Security number verification',
        'Third-party age verification service integration',
        'Regular re-verification for suspicious accounts'
      ],
      penalties: ['Account suspension', 'Permanent ban', 'Legal reporting']
    },
    {
      id: 'geo_restrict',
      category: 'geo_restriction',
      title: 'Geographic Restrictions',
      description: 'Service availability limited to legal jurisdictions',
      isActive: true,
      isRequired: true,
      lastUpdated: new Date('2024-01-01'),
      details: [
        'IP-based location verification',
        'GPS location confirmation for mobile users',
        'State-by-state legal compliance checking',
        'Regular updates for changing regulations'
      ],
      penalties: ['Service restriction', 'Account closure', 'Refund processing']
    },
    {
      id: 'purchase_limits',
      category: 'purchase_limits',
      title: 'Responsible Spending Limits',
      description: 'Mandatory spending limits and cooling-off periods',
      isActive: true,
      isRequired: true,
      lastUpdated: new Date('2024-01-01'),
      details: [
        'Daily spending limits: $100 default',
        'Monthly spending limits: $1000 default',
        'Automatic cooling-off periods',
        'Self-exclusion options'
      ],
      penalties: ['Purchase restrictions', 'Mandatory counseling referral']
    },
    {
      id: 'no_purchase_required',
      category: 'fair_play',
      title: 'No Purchase Necessary',
      description: 'Free entry method must always be available',
      isActive: true,
      isRequired: true,
      lastUpdated: new Date('2024-01-01'),
      details: [
        'Free daily coin bonuses',
        'Mail-in entry options',
        'Social media giveaways',
        'Clear disclosure of free entry methods'
      ],
      penalties: ['FTC violations', 'Service shutdown', 'Legal penalties']
    },
    {
      id: 'data_protection',
      category: 'data_protection',
      title: 'Data Privacy & Protection',
      description: 'CCPA, GDPR, and other privacy law compliance',
      isActive: true,
      isRequired: true,
      lastUpdated: new Date('2024-01-01'),
      details: [
        'Encrypted data storage',
        'Regular security audits',
        'User consent management',
        'Data retention policies'
      ],
      penalties: ['Regulatory fines', 'Data breach notifications']
    }
  ]);

  const [geoRestrictions] = useState<GeographicRestriction[]>([
    {
      id: 'us_legal',
      country: 'United States',
      isAllowed: true,
      restrictions: ['Must exclude Idaho, Montana, Nevada, Washington'],
      legalFramework: 'State-by-state sweepstakes laws',
      lastVerified: new Date('2024-01-15')
    },
    {
      id: 'us_idaho',
      country: 'United States',
      state: 'Idaho',
      isAllowed: false,
      restrictions: ['Sweepstakes gambling prohibited'],
      legalFramework: 'Idaho Code § 18-3801',
      lastVerified: new Date('2024-01-15')
    },
    {
      id: 'us_montana',
      country: 'United States',
      state: 'Montana',
      isAllowed: false,
      restrictions: ['Social gaming restrictions'],
      legalFramework: 'Montana Code Annotated § 23-5-112',
      lastVerified: new Date('2024-01-15')
    },
    {
      id: 'us_nevada',
      country: 'United States',
      state: 'Nevada',
      isAllowed: false,
      restrictions: ['Licensed gambling only'],
      legalFramework: 'Nevada Revised Statutes § 463.750',
      lastVerified: new Date('2024-01-15')
    },
    {
      id: 'us_washington',
      country: 'United States',
      state: 'Washington',
      isAllowed: false,
      restrictions: ['Internet gambling prohibited'],
      legalFramework: 'Revised Code of Washington § 9.46.240',
      lastVerified: new Date('2024-01-15')
    },
    {
      id: 'canada',
      country: 'Canada',
      isAllowed: false,
      restrictions: ['Provincial gaming regulations', 'Federal criminal code restrictions'],
      legalFramework: 'Criminal Code of Canada s. 206',
      lastVerified: new Date('2024-01-15')
    }
  ]);

  const [userCompliance, setUserCompliance] = useState<UserCompliance>({
    userId: user?.id || 'demo_user',
    ageVerified: true,
    identityVerified: true,
    locationVerified: true,
    consentGiven: true,
    termsAccepted: true,
    responsibleGamingAcknowledged: true,
    complianceScore: 95,
    lastVerification: new Date(),
    violations: []
  });

  const [sweepstakesLaws] = useState<SweepstakesLaw[]>([
    {
      jurisdiction: 'Federal (USA)',
      key: 'FTC_Guidelines',
      requirement: 'Clear and conspicuous disclosure of material terms',
      compliance: 'compliant',
      lastReview: new Date('2024-01-01'),
      notes: 'All disclosures updated and reviewed by legal team'
    },
    {
      jurisdiction: 'Federal (USA)',
      key: 'CAN_SPAM_Act',
      requirement: 'Proper email marketing consent and unsubscribe options',
      compliance: 'compliant',
      lastReview: new Date('2024-01-01'),
      notes: 'Email service provider handles compliance automatically'
    },
    {
      jurisdiction: 'State Level',
      key: 'Sweepstakes_Registration',
      requirement: 'Registration required in FL, NY, RI for prizes over $5,000',
      compliance: 'compliant',
      lastReview: new Date('2024-01-01'),
      notes: 'Registered in all required states'
    },
    {
      jurisdiction: 'California',
      key: 'CCPA_Compliance',
      requirement: 'Consumer privacy rights and data protection',
      compliance: 'compliant',
      lastReview: new Date('2024-01-01'),
      notes: 'Privacy policy updated, user rights implemented'
    },
    {
      jurisdiction: 'International',
      key: 'GDPR_Compliance',
      requirement: 'European user data protection and consent',
      compliance: 'partial',
      lastReview: new Date('2024-01-01'),
      notes: 'EU users currently blocked pending full compliance'
    }
  ]);

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: 'audit_001',
      type: 'verification',
      description: 'Age verification completed for user',
      userId: 'user_123',
      timestamp: new Date(Date.now() - 3600000),
      outcome: 'success',
      details: 'Government ID verified through third-party service'
    },
    {
      id: 'audit_002',
      type: 'restriction',
      description: 'Geographic restriction enforced',
      userId: 'user_456',
      timestamp: new Date(Date.now() - 7200000),
      outcome: 'success',
      details: 'User from Nevada blocked from accessing service'
    },
    {
      id: 'audit_003',
      type: 'policy_update',
      description: 'Terms of Service updated',
      timestamp: new Date(Date.now() - 86400000),
      outcome: 'success',
      details: 'Updated responsible gaming policies and user notifications sent'
    }
  ]);

  const [selectedTab, setSelectedTab] = useState('overview');

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'compliant': return 'text-green-500';
      case 'partial': return 'text-yellow-500';
      case 'non_compliant': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getViolationSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'age_verification': return <Users className="w-4 h-4" />;
      case 'geo_restriction': return <Globe className="w-4 h-4" />;
      case 'purchase_limits': return <DollarSign className="w-4 h-4" />;
      case 'fair_play': return <Scale className="w-4 h-4" />;
      case 'data_protection': return <Lock className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const exportComplianceReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      complianceRules,
      geoRestrictions,
      userCompliance,
      sweepstakesLaws,
      auditLogs: auditLogs.slice(0, 100) // Last 100 entries
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Compliance Report Exported",
      description: "Full compliance report has been downloaded",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sweepstakes Compliance</h2>
          <p className="text-muted-foreground">Legal compliance monitoring and enforcement</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportComplianceReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Badge className={`${userCompliance.complianceScore >= 90 ? 'bg-green-500' : 
                              userCompliance.complianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}>
            Compliance Score: {userCompliance.complianceScore}%
          </Badge>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Active Rules</span>
            </div>
            <div className="text-2xl font-bold text-green-500">
              {complianceRules.filter(rule => rule.isActive).length}
            </div>
            <div className="text-xs text-muted-foreground">
              of {complianceRules.length} total rules
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Allowed Regions</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {geoRestrictions.filter(geo => geo.isAllowed).length}
            </div>
            <div className="text-xs text-muted-foreground">
              {geoRestrictions.filter(geo => !geo.isAllowed).length} restricted
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Legal Framework</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">
              {sweepstakesLaws.filter(law => law.compliance === 'compliant').length}
            </div>
            <div className="text-xs text-muted-foreground">
              compliant requirements
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Active Violations</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">
              {userCompliance.violations.filter(v => !v.resolved).length}
            </div>
            <div className="text-xs text-muted-foreground">
              {userCompliance.violations.length} total violations
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="laws">Legal Framework</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* No Purchase Necessary Notice */}
          <Alert className="border-gold-500 bg-gold-500/10">
            <Gift className="h-4 w-4" />
            <AlertDescription>
              <strong>NO PURCHASE NECESSARY:</strong> You may enter and play for free. Purchase does not improve odds of winning. 
              Free entry available through daily bonuses, social media, and mail-in requests. 
              <Button variant="link" className="p-0 h-auto text-gold-600">
                <ExternalLink className="w-3 h-3 ml-1" />
                View complete rules
              </Button>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  User Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Age Verified (18+)</span>
                  <Badge variant={userCompliance.ageVerified ? 'default' : 'destructive'}>
                    {userCompliance.ageVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Identity Verified</span>
                  <Badge variant={userCompliance.identityVerified ? 'default' : 'destructive'}>
                    {userCompliance.identityVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location Verified</span>
                  <Badge variant={userCompliance.locationVerified ? 'default' : 'destructive'}>
                    {userCompliance.locationVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Terms Accepted</span>
                  <Badge variant={userCompliance.termsAccepted ? 'default' : 'destructive'}>
                    {userCompliance.termsAccepted ? 'Accepted' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Responsible Gaming</span>
                  <Badge variant={userCompliance.responsibleGamingAcknowledged ? 'default' : 'destructive'}>
                    {userCompliance.responsibleGamingAcknowledged ? 'Acknowledged' : 'Pending'}
                  </Badge>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Overall Compliance Score</span>
                    <span className="font-bold">{userCompliance.complianceScore}%</span>
                  </div>
                  <Progress value={userCompliance.complianceScore} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Key Compliance Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>18+ Only:</strong> Must be 18 years or older to participate. Age verification required.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Geographic Restrictions:</strong> Not available in ID, MT, NV, WA. Service automatically blocks restricted areas.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Spending Limits:</strong> Daily and monthly limits in place. Self-exclusion tools available.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Data Protection:</strong> CCPA and privacy law compliant. Encrypted storage and secure processing.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {complianceRules.map((rule) => (
              <Card key={rule.id} className={`${!rule.isActive ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(rule.category)}
                      <div>
                        <CardTitle className="text-lg">{rule.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rule.isRequired && <Badge variant="destructive">Required</Badge>}
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Implementation Details:</h4>
                    <ul className="space-y-1">
                      {rule.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Violation Penalties:</h4>
                    <ul className="space-y-1">
                      {rule.penalties.map((penalty, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{penalty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Last updated: {rule.lastUpdated.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Geographic Service Availability
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Service availability by jurisdiction based on local sweepstakes laws
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geoRestrictions.map((restriction) => (
                  <div key={restriction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={restriction.isAllowed ? 'default' : 'destructive'}
                        className={restriction.isAllowed ? 'bg-green-500' : 'bg-red-500'}
                      >
                        {restriction.isAllowed ? 'Allowed' : 'Restricted'}
                      </Badge>
                      <div>
                        <div className="font-medium">
                          {restriction.country}
                          {restriction.state && ` - ${restriction.state}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {restriction.legalFramework}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">Last verified:</div>
                      <div>{restriction.lastVerified.toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laws" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Legal Framework Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sweepstakesLaws.map((law, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{law.jurisdiction}</Badge>
                        <span className="font-medium">{law.key}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{law.requirement}</p>
                      <p className="text-xs text-muted-foreground">{law.notes}</p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge 
                        variant={law.compliance === 'compliant' ? 'default' : 
                                law.compliance === 'partial' ? 'secondary' : 'destructive'}
                        className={getComplianceColor(law.compliance)}
                      >
                        {law.compliance.replace('_', ' ')}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        Reviewed: {law.lastReview.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Compliance Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="mt-1">
                      {log.type === 'verification' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {log.type === 'restriction' && <Shield className="w-4 h-4 text-blue-500" />}
                      {log.type === 'violation' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {log.type === 'policy_update' && <FileText className="w-4 h-4 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.description}</span>
                        <Badge variant={log.outcome === 'success' ? 'default' : 
                                       log.outcome === 'failure' ? 'destructive' : 'secondary'}>
                          {log.outcome}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{log.timestamp.toLocaleString()}</span>
                        {log.userId && (
                          <>
                            <span>•</span>
                            <span>User: {log.userId}</span>
                          </>
                        )}
                      </div>
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
