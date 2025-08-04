import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Scale,
  AlertTriangle,
  CheckCircle,
  FileText,
  Users,
  Globe,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SweepstakesRules() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Scale className="w-8 h-8 text-gold-500" />
              <h1 className="text-4xl font-bold">Official Sweepstakes Rules</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete terms, conditions, and legal information for CoinKrazy
              sweepstakes contests
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge
                variant="outline"
                className="border-green-500 text-green-400"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Legally Compliant
              </Badge>
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-400"
              >
                <Shield className="w-3 h-3 mr-1" />
                18+ Only
              </Badge>
              <Badge
                variant="outline"
                className="border-gold-500 text-gold-400"
              >
                <Globe className="w-3 h-3 mr-1" />
                US Residents Only
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Important Legal Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-300">
              Please read these sweepstakes rules carefully. By participating in
              any CoinKrazy sweepstakes, you agree to be bound by these terms
              and conditions. These rules are legally binding and enforceable
              under applicable state and federal laws.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Eligibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Eligibility Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Who Can Participate:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Legal residents of the United States (excluding
                        restricted states)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Must be 18 years of age or older at time of entry
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Must provide valid government-issued identification for
                        verification
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        One account per person, household, IP address, and
                        device
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-semibold text-red-400">
                    Restricted Participants:
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Employees of CoinKrazy and their immediate family
                        members
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Residents of Idaho, Montana, Nevada, and Washington
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Anyone with a gambling addiction or self-excluded
                        individuals
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How Sweepstakes Work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  How CoinKrazy Sweepstakes Work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Two Currency System:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gold-500/30 rounded-lg bg-gold-500/5">
                      <h5 className="font-medium text-gold-400 mb-2">
                        Gold Coins (GC)
                      </h5>
                      <ul className="text-sm space-y-1">
                        <li>• Virtual currency for entertainment</li>
                        <li>• Cannot be redeemed for cash</li>
                        <li>• Used for free gameplay</li>
                        <li>• No purchase necessary</li>
                      </ul>
                    </div>
                    <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-500/5">
                      <h5 className="font-medium text-purple-400 mb-2">
                        Sweeps Coins (SC)
                      </h5>
                      <ul className="text-sm space-y-1">
                        <li>• Sweepstakes entry tokens</li>
                        <li>• Can be redeemed for cash prizes</li>
                        <li>• Awarded through promotions</li>
                        <li>• Subject to redemption rules</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-semibold">No Purchase Necessary:</h4>
                  <p className="text-sm text-muted-foreground">
                    Sweeps Coins can be obtained through daily bonuses, mail-in
                    requests, social media promotions, and other free methods.
                    Purchase of Gold Coins is not required to participate in
                    sweepstakes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Prize Redemption */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-green-500" />
                  Prize Redemption Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Cash Prize Redemption:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Minimum redemption: $100 USD (equivalent Sweeps Coins)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Identity verification required before first redemption
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Processing time: 3-7 business days after approval
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Available methods: Bank transfer, PayPal, check by mail
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-semibold">Gift Card Redemption:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Minimum redemption: $25 USD equivalent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Available: Amazon, Visa, Mastercard, PlayStation, Xbox
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Digital delivery within 24-48 hours</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Legal Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Legal Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">General Conditions:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Sweepstakes void where prohibited by law</li>
                    <li>
                      • All federal, state, and local taxes are the
                      responsibility of winners
                    </li>
                    <li>
                      • CoinKrazy reserves the right to verify eligibility and
                      disqualify fraudulent entries
                    </li>
                    <li>
                      • Prizes are non-transferable and cannot be substituted
                    </li>
                    <li>
                      • Winners may be required to complete affidavit of
                      eligibility
                    </li>
                    <li>
                      • CoinKrazy is not responsible for technical malfunctions
                      or errors
                    </li>
                    <li>
                      • Participation constitutes agreement to these official
                      rules
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-semibold">Dispute Resolution:</h4>
                  <p className="text-sm text-muted-foreground">
                    Any disputes arising from these sweepstakes will be resolved
                    through binding arbitration in accordance with the laws of
                    the state of Delaware. Participants waive the right to
                    participate in class action lawsuits.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Minimum Age:
                    </span>
                    <Badge variant="outline">18+</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Purchase Required:
                    </span>
                    <Badge
                      variant="outline"
                      className="text-green-400 border-green-500"
                    >
                      No
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Min Redemption:
                    </span>
                    <Badge variant="outline">$25</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Max Processing:
                    </span>
                    <Badge variant="outline">7 Days</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Legal Questions:</p>
                    <p className="text-muted-foreground">legal@coinkrazy.com</p>
                  </div>
                  <div>
                    <p className="font-medium">Prize Support:</p>
                    <p className="text-muted-foreground">
                      prizes@coinkrazy.com
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">General Support:</p>
                    <p className="text-muted-foreground">
                      support@coinkrazy.com
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Mail-in Requests:</p>
                    <p className="text-muted-foreground text-xs">
                      CoinKrazy Sweepstakes
                      <br />
                      123 Gaming Street
                      <br />
                      Las Vegas, NV 89101
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Rules Effective Date:</p>
                  <p className="text-muted-foreground">January 1, 2024</p>
                </div>
                <div>
                  <p className="font-medium">Last Updated:</p>
                  <p className="text-muted-foreground">December 15, 2024</p>
                </div>
                <div>
                  <p className="font-medium">Next Review:</p>
                  <p className="text-muted-foreground">June 1, 2025</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Notice */}
        <Card className="mt-8 border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-blue-400">
                For complete terms and conditions, please review our Privacy
                Policy and Terms of Service.
              </p>
              <p className="text-xs text-muted-foreground">
                CoinKrazy operates under applicable sweepstakes laws and
                regulations. We are committed to fair play and responsible
                gaming.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
