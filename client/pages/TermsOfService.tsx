import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, AlertTriangle, Gavel, CreditCard } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground text-lg">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing and using CoinKrazy's services, you accept and agree to be bound by the terms and 
              provision of this agreement. These Terms of Service govern your use of our website, games, and services. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Eligibility and Account Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Age Requirement</h3>
              <p className="text-muted-foreground">
                You must be at least 18 years old to create an account and use our services. By using our platform, 
                you represent and warrant that you are of legal age.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Account Registration</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Provide accurate, complete, and current information during registration</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Geographic Restrictions</h3>
              <p className="text-muted-foreground">
                Our services are available only in jurisdictions where sweepstakes gaming is legal. 
                You are responsible for ensuring compliance with local laws in your jurisdiction.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sweepstakes Gaming Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Virtual Currency System</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Gold Coins (GC):</strong> Virtual currency for gameplay and entertainment</li>
                <li><strong>Sweep Coins (SC):</strong> Promotional currency eligible for cash redemption</li>
                <li>No purchase necessary to play - free entry available</li>
                <li>Virtual currencies have no cash value except as outlined in our rules</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">No Purchase Necessary</h3>
              <p className="text-muted-foreground">
                You can participate in our sweepstakes without making a purchase. Free daily bonuses and 
                promotional giveaways provide access to play currency. Purchases provide additional convenience but are not required.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payments and Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Virtual Currency Packages</h3>
              <p className="text-muted-foreground">
                When you purchase virtual currency packages, you receive Gold Coins for gameplay and 
                complimentary Sweep Coins as promotional bonuses. All sales are final.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Redemption Process</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Minimum redemption thresholds apply for Sweep Coins</li>
                <li>Identity verification required for redemptions</li>
                <li>Processing times may vary (typically 3-7 business days)</li>
                <li>Redemption limits may apply as outlined in our sweepstakes rules</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Prohibited Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The following activities are strictly prohibited and may result in account suspension or termination:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Creating multiple accounts or using false identities</li>
              <li>Attempting to manipulate games or exploit system vulnerabilities</li>
              <li>Using automated tools, bots, or scripts</li>
              <li>Engaging in fraud, money laundering, or illegal activities</li>
              <li>Harassing other users or our staff</li>
              <li>Violating any applicable laws or regulations</li>
              <li>Attempting to reverse engineer our software</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsible Gaming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We are committed to promoting responsible gaming practices:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Set daily, weekly, and monthly spending limits</li>
              <li>Take breaks using our self-exclusion tools</li>
              <li>Monitor your gameplay time and spending</li>
              <li>Seek help if gaming becomes problematic</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              If you need assistance with responsible gaming, please visit our Responsible Gaming page or contact support.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              All content on our platform, including games, graphics, text, and software, is protected by intellectual property laws:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>CoinKrazy and its licensors own all intellectual property rights</li>
              <li>You may not copy, distribute, or modify our content without permission</li>
              <li>Game outcomes and algorithms are proprietary and confidential</li>
              <li>User-generated content may be used by us for promotional purposes</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Our services are provided "as is" without warranties of any kind</li>
              <li>We are not liable for indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the amount you paid in the preceding 12 months</li>
              <li>We do not guarantee continuous, uninterrupted access to our services</li>
              <li>Technical issues or system maintenance may temporarily affect service availability</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Governing Law</h3>
              <p className="text-muted-foreground">
                These Terms are governed by the laws of the jurisdiction where CoinKrazy is incorporated, 
                without regard to conflict of law principles.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Dispute Process</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Contact our support team to attempt resolution</li>
                <li>If unresolved, disputes may be subject to binding arbitration</li>
                <li>Class action lawsuits are waived where legally permissible</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Violation of these Terms of Service</li>
              <li>Suspected fraudulent or illegal activity</li>
              <li>Extended periods of inactivity</li>
              <li>Technical or security reasons</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Upon termination, your access to virtual currencies and account features will be discontinued. 
              Eligible Sweep Coin balances may be redeemed according to our redemption policies.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may modify these Terms of Service at any time. Material changes will be communicated through:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Email notifications to registered users</li>
              <li>Prominent notices on our website</li>
              <li>In-app notifications</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Continued use of our services after changes constitutes acceptance of the updated terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> legal@coinfrazy.com</p>
              <p><strong>Support:</strong> support@coinfrazy.com</p>
              <p><strong>Phone:</strong> 319-473-0416</p>
              <p><strong>Address:</strong> CoinKrazy Legal Department</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
