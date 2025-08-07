import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Server, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <p className="text-muted-foreground">
                When you create an account or use our services, we may collect personal information including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Name and contact information (email address, phone number)</li>
                <li>Date of birth and identity verification information</li>
                <li>Payment and billing information</li>
                <li>Location data (for legal compliance and fraud prevention)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Usage Information</h3>
              <p className="text-muted-foreground">
                We automatically collect information about how you use our platform:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Game activity and gameplay statistics</li>
                <li>Device information and browser type</li>
                <li>IP address and geographic location</li>
                <li>Platform usage patterns and preferences</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Providing and maintaining our gaming platform services</li>
              <li>Processing transactions and managing your account</li>
              <li>Verifying your identity and age for legal compliance</li>
              <li>Preventing fraud and ensuring platform security</li>
              <li>Improving our services and developing new features</li>
              <li>Sending important account notifications and updates</li>
              <li>Providing customer support and responding to inquiries</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Information Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> When you have given us explicit permission to share your information</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Secure data storage with encryption at rest</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication protocols</li>
              <li>Fraud detection and prevention systems</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              While we strive to protect your information, no method of transmission over the internet is 100% secure. 
              We cannot guarantee absolute security but are committed to protecting your data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request corrections to inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Request transfer of your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your experience on our platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can control cookie settings through your browser preferences, though disabling certain cookies may affect platform functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Restrictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our services are intended for users who are 18 years of age or older. We do not knowingly collect 
              personal information from individuals under 18. If we become aware that we have collected personal 
              information from someone under 18, we will take steps to delete such information promptly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, 
              operational, or regulatory reasons. We will notify you of any material changes by posting the updated 
              policy on our website and updating the "Last updated" date above.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> privacy@coinfrazy.com</p>
              <p><strong>Phone:</strong> 319-473-0416</p>
              <p><strong>Address:</strong> CoinKrazy Privacy Department</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
