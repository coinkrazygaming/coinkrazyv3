import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  FileText,
  Scale,
  Users,
  Clock,
  Ban,
  Eye,
  Download,
  Upload,
  Search,
  Filter
} from 'lucide-react';

const blockedStates = [
  { code: 'WA', name: 'Washington', reason: 'State gambling laws prohibit sweepstakes casinos' },
  { code: 'ID', name: 'Idaho', reason: 'Sweepstakes model not permitted under state law' },
  { code: 'MT', name: 'Montana', reason: 'Regulatory restrictions on online gambling' },
  { code: 'NV', name: 'Nevada', reason: 'Exclusive licensed casino regulations' },
  { code: 'NY', name: 'New York', reason: 'Pending regulatory clarification' }
];

const complianceRules = [
  { id: 1, rule: 'Minimum Age Verification', status: 'active', description: 'All users must be 18+ (21+ in some states)' },
  { id: 2, rule: 'State Geo-blocking', status: 'active', description: 'Block access from prohibited states' },
  { id: 3, rule: 'KYC Verification', status: 'active', description: 'Identity verification for SC withdrawals' },
  { id: 4, rule: 'PEP Screening', status: 'active', description: 'Politically Exposed Person screening' },
  { id: 5, rule: 'OFAC Compliance', status: 'active', description: 'Sanctions list verification' },
  { id: 6, rule: 'Anti-Money Laundering', status: 'active', description: 'AML monitoring and reporting' },
  { id: 7, rule: 'Responsible Gaming', status: 'active', description: 'Player protection measures' },
  { id: 8, rule: 'Data Protection', status: 'active', description: 'GDPR and CCPA compliance' }
];

export default function Compliance() {
  const [userLocation, setUserLocation] = useState<{ state: string; country: string } | null>(null);
  const [complianceStatus, setComplianceStatus] = useState({
    ageVerified: false,
    locationAllowed: false,
    kycCompleted: false,
    sanctionsCleared: false
  });

  const [auditLog] = useState([
    { id: 1, timestamp: '2024-03-20T14:30:00Z', action: 'User blocked', reason: 'Washington state access attempt', user: 'user123', severity: 'high' },
    { id: 2, timestamp: '2024-03-20T14:25:00Z', action: 'KYC approved', reason: 'Identity verification passed', user: 'player456', severity: 'low' },
    { id: 3, timestamp: '2024-03-20T14:20:00Z', action: 'Age verification failed', reason: 'Under 18 years old', user: 'minor789', severity: 'high' },
    { id: 4, timestamp: '2024-03-20T14:15:00Z', action: 'OFAC check passed', reason: 'No sanctions matches', user: 'player101', severity: 'low' }
  ]);

  useEffect(() => {
    // Simulate geolocation detection
    const detectLocation = async () => {
      try {
        // In real implementation, this would use IP geolocation
        const mockLocation = { state: 'CA', country: 'US' };
        setUserLocation(mockLocation);
        
        // Check if state is allowed
        const isBlocked = blockedStates.some(state => state.code === mockLocation.state);
        setComplianceStatus(prev => ({
          ...prev,
          locationAllowed: !isBlocked
        }));
      } catch (error) {
        console.error('Location detection failed:', error);
      }
    };

    detectLocation();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Compliance Center</h1>
              <p className="text-muted-foreground">Legal compliance, state blocking, and age verification</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Compliant Platform
              </Badge>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Compliance Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className={`${complianceStatus.ageVerified ? 'bg-green-500/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
            <CardContent className="p-4 text-center">
              <Calendar className={`w-8 h-8 mx-auto mb-2 ${complianceStatus.ageVerified ? 'text-green-500' : 'text-orange-500'}`} />
              <div className="text-lg font-bold">Age Verification</div>
              <Badge variant={complianceStatus.ageVerified ? 'default' : 'secondary'}>
                {complianceStatus.ageVerified ? 'Verified' : 'Pending'}
              </Badge>
            </CardContent>
          </Card>

          <Card className={`${complianceStatus.locationAllowed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <CardContent className="p-4 text-center">
              <MapPin className={`w-8 h-8 mx-auto mb-2 ${complianceStatus.locationAllowed ? 'text-green-500' : 'text-red-500'}`} />
              <div className="text-lg font-bold">Location Check</div>
              <Badge variant={complianceStatus.locationAllowed ? 'default' : 'destructive'}>
                {userLocation ? `${userLocation.state}, ${userLocation.country}` : 'Detecting...'}
              </Badge>
            </CardContent>
          </Card>

          <Card className={`${complianceStatus.kycCompleted ? 'bg-green-500/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
            <CardContent className="p-4 text-center">
              <Shield className={`w-8 h-8 mx-auto mb-2 ${complianceStatus.kycCompleted ? 'text-green-500' : 'text-orange-500'}`} />
              <div className="text-lg font-bold">KYC Status</div>
              <Badge variant={complianceStatus.kycCompleted ? 'default' : 'secondary'}>
                {complianceStatus.kycCompleted ? 'Verified' : 'Pending'}
              </Badge>
            </CardContent>
          </Card>

          <Card className={`${complianceStatus.sanctionsCleared ? 'bg-green-500/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
            <CardContent className="p-4 text-center">
              <Scale className={`w-8 h-8 mx-auto mb-2 ${complianceStatus.sanctionsCleared ? 'text-green-500' : 'text-orange-500'}`} />
              <div className="text-lg font-bold">Sanctions Check</div>
              <Badge variant={complianceStatus.sanctionsCleared ? 'default' : 'secondary'}>
                {complianceStatus.sanctionsCleared ? 'Cleared' : 'Pending'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Tabs */}
        <Tabs defaultValue="blocking" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="blocking">
              <Ban className="w-4 h-4 mr-2" />
              State Blocking
            </TabsTrigger>
            <TabsTrigger value="verification">
              <CheckCircle className="w-4 h-4 mr-2" />
              Age Verification
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Scale className="w-4 h-4 mr-2" />
              Compliance Rules
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="w-4 h-4 mr-2" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* State Blocking Tab */}
          <TabsContent value="blocking" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="w-5 h-5 text-red-500" />
                    Blocked States
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blockedStates.map((state) => (
                      <div key={state.code} className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">{state.name} ({state.code})</span>
                          <Badge variant="destructive">Blocked</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{state.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-casino-blue" />
                    Geolocation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h3 className="font-bold mb-2">Current Detection</h3>
                    {userLocation ? (
                      <div className="space-y-1">
                        <div>State: <span className="font-bold">{userLocation.state}</span></div>
                        <div>Country: <span className="font-bold">{userLocation.country}</span></div>
                        <div className="flex items-center gap-2 mt-2">
                          {complianceStatus.locationAllowed ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-green-500">Access Allowed</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-500">Access Blocked</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>Detecting location...</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold">Detection Methods</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>IP Geolocation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>VPN Detection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Address Verification</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Age Verification Tab */}
          <TabsContent value="verification" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Age Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                      <div className="font-bold text-orange-400 mb-1">Standard Requirement</div>
                      <div className="text-sm">18+ years old in most states</div>
                    </div>
                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <div className="font-bold text-red-400 mb-1">Enhanced Requirement</div>
                      <div className="text-sm">21+ years old in AL, IA, LA, NE</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold">Verification Methods</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Government ID Upload</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Date of Birth Validation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Third-party Verification</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Document Authentication</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-casino-blue" />
                    Verification Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-black font-bold text-sm">1</div>
                        <div>
                          <div className="font-medium">Document Upload</div>
                          <div className="text-sm text-muted-foreground">Submit valid government ID</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-8 h-8 bg-casino-blue rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                        <div>
                          <div className="font-medium">AI Verification</div>
                          <div className="text-sm text-muted-foreground">Automated document analysis</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                        <div>
                          <div className="font-medium">Manual Review</div>
                          <div className="text-sm text-muted-foreground">Human verification if needed</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                        <div>
                          <div className="font-medium">Approval</div>
                          <div className="text-sm text-muted-foreground">Account verification complete</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Rules Tab */}
          <TabsContent value="rules" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Compliance Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex-1">
                        <div className="font-bold">{rule.rule}</div>
                        <div className="text-sm text-muted-foreground">{rule.description}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                          {rule.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Compliance Audit Log</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search audit log..." className="w-64" />
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Timestamp</th>
                        <th className="text-left p-2">Action</th>
                        <th className="text-left p-2">Reason</th>
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLog.map((entry) => (
                        <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="p-2 text-sm font-mono">{formatTimestamp(entry.timestamp)}</td>
                          <td className="p-2 font-medium">{entry.action}</td>
                          <td className="p-2 text-sm text-muted-foreground">{entry.reason}</td>
                          <td className="p-2 text-sm">{entry.user}</td>
                          <td className="p-2">
                            <Badge className={getSeverityColor(entry.severity)}>
                              {entry.severity}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
