import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Phone, 
  Mail, 
  ExternalLink, 
  Users, 
  Settings,
  Ban,
  Timer,
  Target
} from "lucide-react";

export default function ResponsibleGaming() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gold">Responsible Gaming</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          At CoinKrazy, we're committed to providing a safe and responsible gaming environment for all our players.
        </p>
      </div>

      <Alert className="mb-8 border-blue-500 bg-blue-50 dark:bg-blue-950">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Gaming should be fun and entertaining.</strong> If you feel it's becoming a problem, we're here to help with tools and resources.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        {/* Self-Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Self-Assessment
            </CardTitle>
            <CardDescription>
              Evaluate your gaming habits with these important questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Do you spend more time or money gaming than you can afford?</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Do you chase losses or try to win back money you've lost?</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Has gaming negatively affected your relationships, work, or finances?</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Do you feel anxious or irritable when not gaming?</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Do you lie about your gaming activities to family or friends?</span>
              </div>
            </div>
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                If you answered "yes" to any of these questions, consider using our responsible gaming tools or seek professional help.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Gaming Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gold" />
              Account Control Tools
            </CardTitle>
            <CardDescription>
              Manage your gaming experience with our built-in safety features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold">Deposit Limits</h4>
                    <p className="text-sm text-muted-foreground">Set daily, weekly, or monthly deposit limits</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">Session Time Limits</h4>
                    <p className="text-sm text-muted-foreground">Control how long you spend gaming</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Timer className="w-5 h-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold">Reality Check</h4>
                    <p className="text-sm text-muted-foreground">Receive time reminders during play</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Ban className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-semibold">Self-Exclusion</h4>
                    <p className="text-sm text-muted-foreground">Temporarily or permanently block access</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold">Cool-Off Period</h4>
                    <p className="text-sm text-muted-foreground">Take a break for 24 hours to 6 weeks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h4 className="font-semibold">Loss Limits</h4>
                    <p className="text-sm text-muted-foreground">Set maximum loss amounts per period</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Manage Limits
              </Button>
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Self-Exclusion Options
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Warning Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Warning Signs of Problem Gaming
            </CardTitle>
            <CardDescription>
              Recognize these behavioral patterns that may indicate a problem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-red-600">Behavioral Signs</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Gaming for longer periods than intended</li>
                  <li>• Increasing bet amounts to feel excitement</li>
                  <li>• Preoccupation with gaming activities</li>
                  <li>• Restlessness when not gaming</li>
                  <li>• Using gaming to escape problems</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-red-600">Financial Signs</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Chasing losses with bigger bets</li>
                  <li>• Borrowing money to fund gaming</li>
                  <li>• Hiding gaming expenses</li>
                  <li>• Neglecting bills or responsibilities</li>
                  <li>• Using credit cards or loans for gaming</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help and Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Get Help and Support
            </CardTitle>
            <CardDescription>
              Professional resources and support organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4">National Helplines</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">National Problem Gaming Helpline</div>
                      <div className="text-sm text-muted-foreground">1-800-522-4700</div>
                      <Badge variant="outline" className="text-xs mt-1">24/7 Support</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">Crisis Text Line</div>
                      <div className="text-sm text-muted-foreground">Text HOME to 741741</div>
                      <Badge variant="outline" className="text-xs mt-1">Crisis Support</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Online Resources</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-auto p-3">
                    <ExternalLink className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Gamblers Anonymous</div>
                      <div className="text-sm text-muted-foreground">12-step recovery program</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-auto p-3">
                    <ExternalLink className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">GamCare.org.uk</div>
                      <div className="text-sm text-muted-foreground">Support and information</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-auto p-3">
                    <ExternalLink className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">ResponsibleGaming.org</div>
                      <div className="text-sm text-muted-foreground">Education and resources</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Age Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Age Verification & Legal Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>You must be 21 or older</strong> to participate in sweepstakes gaming on CoinKrazy. 
                  We use advanced age verification systems to ensure compliance.
                </AlertDescription>
              </Alert>
              <div className="text-sm space-y-2">
                <p>• CoinKrazy operates under strict legal guidelines for sweepstakes gaming</p>
                <p>• We employ third-party age verification services</p>
                <p>• Account verification is required before withdrawal</p>
                <p>• We comply with all applicable state and federal laws</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-blue-600/10 to-green-600/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Need Help? Contact Our Support Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Our responsible gaming team is available 24/7 to help you set limits, provide resources, or discuss concerns.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                support@coinkrazy.com
              </Button>
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Live Chat Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />
      
      <div className="text-center text-sm text-muted-foreground">
        <p>
          CoinKrazy is committed to responsible gaming practices. This page provides educational information and is not a substitute for professional counseling or treatment.
        </p>
        <p className="mt-2">
          If you or someone you know has a gaming problem, please seek professional help immediately.
        </p>
      </div>
    </div>
  );
}
