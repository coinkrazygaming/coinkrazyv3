import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  FileText,
  Users,
  Settings,
  BarChart3,
  Download,
  Flag,
} from "lucide-react";
import {
  complianceService,
  ComplianceData,
  SweepstakesRules,
  ComplianceAlert,
} from "../services/complianceService";
import { authService } from "../services/authService";

const Compliance: React.FC = () => {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(
    null,
  );
  const [sweepstakesRules, setSweepstakesRules] = useState<SweepstakesRules[]>(
    [],
  );
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [ageVerification, setAgeVerification] = useState({
    birthDate: "",
    state: "CA",
  });
  const [playLimits, setPlayLimits] = useState({
    dailySpendLimit: "",
    weeklySpendLimit: "",
    monthlySpendLimit: "",
    sessionTimeLimit: "",
    dailySessionLimit: "",
  });
  const [reportIssue, setReportIssue] = useState({
    type: "",
    description: "",
    severity: "medium" as const,
  });

  const isAdmin = authService.isAdmin();

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      const [compliance, rules, alerts] = await Promise.all([
        complianceService.checkCompliance(),
        complianceService.getSweepstakesRules(),
        complianceService.getComplianceAlerts(),
      ]);

      setComplianceData(compliance);
      setSweepstakesRules(rules);
      setComplianceAlerts(alerts);
    } catch (error) {
      console.error("Failed to load compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgeVerification = async () => {
    if (!ageVerification.birthDate) {
      alert("Please enter your birth date");
      return;
    }

    const isEligible = await complianceService.verifyAge(
      ageVerification.birthDate,
      ageVerification.state,
    );

    if (isEligible) {
      alert(
        "Age verification successful! You meet the eligibility requirements.",
      );
      loadComplianceData();
    } else {
      alert(
        "Age verification failed. You must be 18+ to participate (19+ in AL/NE).",
      );
    }
  };

  const handleLocationVerification = async () => {
    const location = await complianceService.verifyLocation();

    if (location.isRestricted) {
      alert(
        `Sorry, sweepstakes are not available in your location (${location.state}, ${location.country}).`,
      );
    } else {
      alert(
        `Location verified! You are eligible to participate from ${location.state}, ${location.country}.`,
      );
      loadComplianceData();
    }
  };

  const handleSetPlayLimits = async () => {
    const limits = {
      dailySpendLimit: playLimits.dailySpendLimit
        ? parseInt(playLimits.dailySpendLimit)
        : undefined,
      weeklySpendLimit: playLimits.weeklySpendLimit
        ? parseInt(playLimits.weeklySpendLimit)
        : undefined,
      monthlySpendLimit: playLimits.monthlySpendLimit
        ? parseInt(playLimits.monthlySpendLimit)
        : undefined,
      sessionTimeLimit: playLimits.sessionTimeLimit
        ? parseInt(playLimits.sessionTimeLimit)
        : undefined,
      dailySessionLimit: playLimits.dailySessionLimit
        ? parseInt(playLimits.dailySessionLimit)
        : undefined,
    };

    const success = await complianceService.setPlayLimits(
      "current-user",
      limits,
    );

    if (success) {
      alert("Play limits updated successfully!");
    } else {
      alert("Failed to update play limits. Please try again.");
    }
  };

  const handleReportIssue = async () => {
    if (!reportIssue.type || !reportIssue.description) {
      alert("Please fill in all required fields");
      return;
    }

    const success = await complianceService.reportIssue(reportIssue);

    if (success) {
      alert("Issue reported successfully! Our compliance team will review it.");
      setReportIssue({ type: "", description: "", severity: "medium" });
    } else {
      alert("Failed to report issue. Please try again.");
    }
  };

  const handleSelfExclusion = async (duration: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to self-exclude for ${duration}? This action cannot be undone.`,
    );

    if (confirmed) {
      const success = await complianceService.requestSelfExclusion(
        "current-user",
        duration as any,
      );

      if (success) {
        alert(
          `Self-exclusion request submitted for ${duration}. You will be contacted by our support team.`,
        );
      } else {
        alert(
          "Failed to submit self-exclusion request. Please contact support directly.",
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Sweepstakes Compliance
          </h1>
          <p className="text-muted-foreground">
            Legal compliance, rules, and responsible gaming features
          </p>
        </div>

        {complianceData && (
          <Badge
            variant={complianceData.isEligible ? "success" : "destructive"}
            className="text-lg p-2"
          >
            {complianceData.isEligible ? "Compliant" : "Restricted"}
          </Badge>
        )}
      </div>

      {/* Compliance Status Overview */}
      {complianceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    complianceData.ageVerified ? "success" : "destructive"
                  }
                >
                  {complianceData.ageVerified ? "Verified" : "Pending"}
                </Badge>
                <span>Age Verification</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    complianceData.locationVerified ? "success" : "destructive"
                  }
                >
                  {complianceData.locationVerified ? "Verified" : "Pending"}
                </Badge>
                <span>Location Verification</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    complianceData.termsAccepted ? "success" : "destructive"
                  }
                >
                  {complianceData.termsAccepted ? "Accepted" : "Pending"}
                </Badge>
                <span>Terms Accepted</span>
              </div>
            </div>

            {complianceData.warnings.length > 0 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {complianceData.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="rules">Official Rules</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="responsible">Responsible Gaming</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="report">Report Issue</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        {/* Official Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {sweepstakesRules.map((rules) => (
            <Card key={rules.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {rules.title}
                </CardTitle>
                <CardDescription>{rules.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Flag className="h-4 w-4" />
                  <AlertDescription className="font-bold text-lg">
                    {rules.noPurchaseNecessary}
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="font-semibold mb-2">
                    Eligibility Requirements:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {rules.eligibilityRequirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Entry Methods:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {rules.entryMethods.map((method, index) => (
                      <li key={index}>{method}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Prize Structure:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {rules.prizeStructure.map((prize, index) => (
                      <div
                        key={index}
                        className="flex justify-between border p-2 rounded"
                      >
                        <span>
                          {prize.tier}: {prize.description}
                        </span>
                        <span className="font-bold">
                          {prize.value} ({prize.quantity}x)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong>Draw Dates:</strong> {rules.drawDates.join(", ")}
                  </div>
                  <div>
                    <strong>Odds:</strong> {rules.oddsDisclosure}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Official Rules
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Terms & Conditions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Age Verification
                </CardTitle>
                <CardDescription>
                  Verify that you meet the minimum age requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={ageVerification.birthDate}
                    onChange={(e) =>
                      setAgeVerification((prev) => ({
                        ...prev,
                        birthDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={ageVerification.state}
                    onValueChange={(value) =>
                      setAgeVerification((prev) => ({
                        ...prev,
                        state: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="NE">Nebraska</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAgeVerification} className="w-full">
                  Verify Age
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Verification
                </CardTitle>
                <CardDescription>
                  Verify your location for sweepstakes eligibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We use your IP address to verify that you're located in an
                  eligible jurisdiction. Sweepstakes are restricted in certain
                  states and countries.
                </p>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    VPN and proxy services may interfere with location
                    verification.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleLocationVerification} className="w-full">
                  Verify Location
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Responsible Gaming Tab */}
        <TabsContent value="responsible" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Play Limits
              </CardTitle>
              <CardDescription>
                Set spending and session limits to play responsibly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dailySpend">Daily Spend Limit ($)</Label>
                  <Input
                    id="dailySpend"
                    type="number"
                    placeholder="50"
                    value={playLimits.dailySpendLimit}
                    onChange={(e) =>
                      setPlayLimits((prev) => ({
                        ...prev,
                        dailySpendLimit: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="weeklySpend">Weekly Spend Limit ($)</Label>
                  <Input
                    id="weeklySpend"
                    type="number"
                    placeholder="200"
                    value={playLimits.weeklySpendLimit}
                    onChange={(e) =>
                      setPlayLimits((prev) => ({
                        ...prev,
                        weeklySpendLimit: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="monthlySpend">Monthly Spend Limit ($)</Label>
                  <Input
                    id="monthlySpend"
                    type="number"
                    placeholder="500"
                    value={playLimits.monthlySpendLimit}
                    onChange={(e) =>
                      setPlayLimits((prev) => ({
                        ...prev,
                        monthlySpendLimit: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="sessionTime">
                    Session Time Limit (minutes)
                  </Label>
                  <Input
                    id="sessionTime"
                    type="number"
                    placeholder="120"
                    value={playLimits.sessionTimeLimit}
                    onChange={(e) =>
                      setPlayLimits((prev) => ({
                        ...prev,
                        sessionTimeLimit: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSetPlayLimits} className="w-full">
                Update Play Limits
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Self-Exclusion</CardTitle>
              <CardDescription>
                Temporarily or permanently restrict your account access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Self-exclusion requests cannot be reversed during the
                  exclusion period. Please consider this decision carefully.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSelfExclusion("24h")}
                  className="text-orange-600 border-orange-600"
                >
                  24 Hours
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSelfExclusion("7d")}
                  className="text-orange-600 border-orange-600"
                >
                  7 Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSelfExclusion("30d")}
                  className="text-orange-600 border-orange-600"
                >
                  30 Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSelfExclusion("6m")}
                  className="text-red-600 border-red-600"
                >
                  6 Months
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSelfExclusion("1y")}
                  className="text-red-600 border-red-600"
                >
                  1 Year
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleSelfExclusion("permanent")}
                >
                  Permanent
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Compliance Alerts
              </CardTitle>
              <CardDescription>
                Recent compliance notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceAlerts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No compliance alerts at this time.
                </p>
              ) : (
                <div className="space-y-2">
                  {complianceAlerts.map((alert) => (
                    <Alert
                      key={alert.id}
                      variant={
                        alert.type === "error" ? "destructive" : "default"
                      }
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <strong>{alert.message}</strong>
                            <p className="text-sm text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              alert.severity === "critical"
                                ? "destructive"
                                : alert.severity === "high"
                                  ? "destructive"
                                  : alert.severity === "medium"
                                    ? "default"
                                    : "secondary"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Issue Tab */}
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Report Compliance Issue
              </CardTitle>
              <CardDescription>
                Report any compliance concerns or violations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="issueType">Issue Type</Label>
                <Select
                  value={reportIssue.type}
                  onValueChange={(value) =>
                    setReportIssue((prev) => ({
                      ...prev,
                      type: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="age-verification">
                      Age Verification
                    </SelectItem>
                    <SelectItem value="location-restriction">
                      Location Restriction
                    </SelectItem>
                    <SelectItem value="responsible-gaming">
                      Responsible Gaming
                    </SelectItem>
                    <SelectItem value="terms-violation">
                      Terms Violation
                    </SelectItem>
                    <SelectItem value="technical-issue">
                      Technical Issue
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={reportIssue.severity}
                  onValueChange={(value) =>
                    setReportIssue((prev) => ({
                      ...prev,
                      severity: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about the compliance issue..."
                  value={reportIssue.description}
                  onChange={(e) =>
                    setReportIssue((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>

              <Button onClick={handleReportIssue} className="w-full">
                Submit Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        {isAdmin && (
          <TabsContent value="admin" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Users:</span>
                      <span className="font-bold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified:</span>
                      <span className="font-bold text-green-600">1,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Restricted:</span>
                      <span className="font-bold text-red-600">34</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Compliance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      98.5%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Overall compliance rate
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Last Audit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-lg font-bold">2 days ago</div>
                    <p className="text-sm text-muted-foreground">
                      Next audit in 28 days
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    User Audit
                  </Button>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Check
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Update Rules
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Compliance;
