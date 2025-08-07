import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gold mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions about CoinKrazy? We're here to help! Reach out to our support team
          and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gold">Send us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll respond within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Your first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Your last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="What can we help you with?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Please describe your question or issue in detail..."
                rows={5}
              />
            </div>
            <Button className="w-full bg-gold hover:bg-gold/90 text-black">
              Send Message
            </Button>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gold">Contact Information</CardTitle>
              <CardDescription>
                Get in touch with us through any of these channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold" />
                <div>
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-muted-foreground">support@coinkrazy.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold" />
                <div>
                  <div className="font-medium">Phone Support</div>
                  <div className="text-sm text-muted-foreground">1-800-COINKRAZY</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gold" />
                <div>
                  <div className="font-medium">Office Address</div>
                  <div className="text-sm text-muted-foreground">
                    123 Casino Blvd<br />
                    Las Vegas, NV 89109
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gold" />
                <div>
                  <div className="font-medium">Support Hours</div>
                  <div className="text-sm text-muted-foreground">
                    24/7 Live Chat & Email<br />
                    Phone: Mon-Fri 9AM-6PM PST
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gold">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium text-sm">How do I verify my account?</div>
                <div className="text-xs text-muted-foreground">
                  Visit your profile settings and upload a valid ID and proof of address.
                </div>
              </div>
              <div>
                <div className="font-medium text-sm">What payment methods do you accept?</div>
                <div className="text-xs text-muted-foreground">
                  We accept all major credit cards, bank transfers, and cryptocurrency.
                </div>
              </div>
              <div>
                <div className="font-medium text-sm">How long do withdrawals take?</div>
                <div className="text-xs text-muted-foreground">
                  Most withdrawals are processed within 24-48 hours.
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All FAQs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
