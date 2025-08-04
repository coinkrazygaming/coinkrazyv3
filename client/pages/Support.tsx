import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HeadphonesIcon,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  HelpCircle,
  Search,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertTriangle,
  Bot,
  Users,
  Shield,
  CreditCard,
  Gift,
  Gamepad2,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
    priority: "normal",
  });

  const faqCategories = [
    {
      id: "account",
      name: "Account & Registration",
      icon: <Users className="w-4 h-4" />,
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click 'Sign Up' in the top right corner, fill in your details, and verify your email address. You'll receive a welcome bonus of 10 Gold Coins + 10 Sweeps Coins!"
        },
        {
          question: "Why do I need to verify my identity?",
          answer: "Identity verification (KYC) is required for security and to enable prize redemptions. We need a government-issued ID and utility bill to confirm your identity and address."
        },
        {
          question: "Can I have multiple accounts?",
          answer: "No, only one account per person, household, IP address, and device is allowed. Multiple accounts will result in permanent suspension."
        },
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page, enter your email, and follow the reset link sent to your inbox. Contact support if you need assistance."
        }
      ]
    },
    {
      id: "games",
      name: "Games & Gameplay", 
      icon: <Gamepad2 className="w-4 h-4" />,
      faqs: [
        {
          question: "What's the difference between Gold Coins and Sweeps Coins?",
          answer: "Gold Coins are for entertainment only and cannot be redeemed. Sweeps Coins can be redeemed for real cash prizes and gift cards when you meet the minimum requirements."
        },
        {
          question: "How do I get free Sweeps Coins?",
          answer: "Earn free Sweeps Coins through daily bonuses, mini-games, social media promotions, mail-in requests, and special events. No purchase necessary!"
        },
        {
          question: "Are the games fair and random?",
          answer: "Yes! All our games use certified Random Number Generators (RNG) and are regularly audited for fairness. Game RTPs are clearly displayed for transparency."
        },
        {
          question: "Can I play on mobile?",
          answer: "Absolutely! CoinKrazy works perfectly on all devices - desktop, tablet, and mobile. No app download required, just visit our website."
        }
      ]
    },
    {
      id: "payments",
      name: "Payments & Redemptions",
      icon: <CreditCard className="w-4 h-4" />,
      faqs: [
        {
          question: "How do I redeem my winnings?",
          answer: "Go to your dashboard, click 'Withdraw', select your preferred method (bank transfer, PayPal, gift cards), and complete the redemption process. Minimum $25 for gift cards, $100 for cash."
        },
        {
          question: "How long do withdrawals take?",
          answer: "Gift card redemptions process within 24-48 hours. Cash withdrawals take 3-7 business days after verification and approval."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit/debit cards, PayPal, Apple Pay, Google Pay, and bank transfers for Gold Coin purchases. Crypto payments coming soon!"
        },
        {
          question: "Are there any fees for withdrawals?",
          answer: "No! CoinKrazy covers all standard withdrawal fees. You receive the full amount of your redemption."
        }
      ]
    },
    {
      id: "bonuses",
      name: "Bonuses & Promotions",
      icon: <Gift className="w-4 h-4" />,
      faqs: [
        {
          question: "What bonuses do new players get?",
          answer: "New players receive 10 Gold Coins + 10 Sweeps Coins welcome bonus, plus a 100% match bonus up to $100 on their first Gold Coin purchase!"
        },
        {
          question: "How do daily bonuses work?",
          answer: "Log in daily to claim free Gold Coins and Sweeps Coins. Consecutive login streaks earn bigger bonuses. Check the promotions page for current offers."
        },
        {
          question: "What are loyalty rewards?",
          answer: "Active players earn loyalty points for gameplay, which can be exchanged for bonus coins, exclusive promotions, and VIP perks."
        },
        {
          question: "Can I use multiple bonus codes?",
          answer: "Bonus codes cannot typically be combined, but you can use different promotional codes for separate offers. Check the terms for each specific promotion."
        }
      ]
    },
    {
      id: "technical",
      name: "Technical Issues",
      icon: <AlertTriangle className="w-4 h-4" />,
      faqs: [
        {
          question: "The games won't load - what should I do?",
          answer: "Try refreshing the page, clearing your browser cache, or switching to an incognito/private window. Ensure you have a stable internet connection."
        },
        {
          question: "I'm having login problems",
          answer: "Double-check your email and password, ensure caps lock is off, and try resetting your password. Clear browser cookies if the issue persists."
        },
        {
          question: "The website is running slowly",
          answer: "This could be due to high traffic or your internet connection. Try closing other browser tabs, restarting your browser, or switching networks."
        },
        {
          question: "I lost my game progress",
          answer: "Game progress is automatically saved to your account. If you're missing coins or progress, please contact support with your account details and the approximate time of play."
        }
      ]
    }
  ];

  const supportChannels = [
    {
      name: "Live Chat",
      description: "Get instant help from our support team",
      icon: <MessageCircle className="w-5 h-5 text-green-500" />,
      status: "Online",
      statusColor: "text-green-400",
      action: "Start Chat",
      available: "24/7"
    },
    {
      name: "Email Support", 
      description: "Send us a detailed message",
      icon: <Mail className="w-5 h-5 text-blue-500" />,
      status: "Response within 2 hours",
      statusColor: "text-blue-400",
      action: "Send Email",
      available: "24/7"
    },
    {
      name: "Phone Support",
      description: "Speak directly with a specialist",
      icon: <Phone className="w-5 h-5 text-purple-500" />,
      status: "Available",
      statusColor: "text-purple-400", 
      action: "Call Now",
      available: "8AM - 12AM EST"
    },
    {
      name: "AI Assistant",
      description: "Get instant answers from JoseyAI",
      icon: <Bot className="w-5 h-5 text-orange-500" />,
      status: "Always Online",
      statusColor: "text-orange-400",
      action: "Ask JoseyAI",
      available: "24/7"
    }
  ];

  const filteredFaqs = faqCategories
    .map(category => ({
      ...category,
      faqs: category.faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(category =>
      !selectedCategory || selectedCategory === "all" || category.id === selectedCategory
    )
    .filter(category => category.faqs.length > 0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Contact form submitted:", contactForm);
    alert("Thank you! Your message has been sent. We'll respond within 2 hours.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-purple/5 to-casino-blue/10 py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HeadphonesIcon className="w-8 h-8 text-casino-blue" />
              <h1 className="text-4xl font-bold">Support Center</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get help fast with our comprehensive support resources and 24/7 assistance
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                24/7 Support
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                <Clock className="w-3 h-3 mr-1" />
                2 Hour Response
              </Badge>
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                <Star className="w-3 h-3 mr-1" />
                Expert Team
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

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {supportChannels.map((channel, index) => (
            <Card key={index} className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {channel.icon}
                  <h3 className="font-semibold">{channel.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {channel.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <span className={`text-xs ${channel.statusColor}`}>
                      {channel.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Available:</span>
                    <span className="text-xs">{channel.available}</span>
                  </div>
                  <Button size="sm" className="w-full mt-2">
                    {channel.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - FAQ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search for help..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {faqCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Sections */}
            {filteredFaqs.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.icon}
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}

            {filteredFaqs.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or contact our support team directly.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Contact Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={contactForm.category}
                      onValueChange={(value) =>
                        setContactForm((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="games">Game Problems</SelectItem>
                        <SelectItem value="payments">Payment/Withdrawal</SelectItem>
                        <SelectItem value="bonuses">Bonuses & Promotions</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={contactForm.priority}
                      onValueChange={(value) =>
                        setContactForm((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((prev) => ({ ...prev, message: e.target.value }))
                      }
                      placeholder="Describe your issue in detail..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/sweepstakes-rules" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Sweepstakes Rules
                  </Button>
                </Link>
                <Link to="/how-to-play" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    How to Play
                  </Button>
                </Link>
                <Link to="/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    My Account
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Emergency Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-300 mb-3">
                  For urgent account security issues or payment problems:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Emergency Line:</strong> 1-800-COIN-911</p>
                  <p><strong>Email:</strong> emergency@coinkrazy.com</p>
                  <p><strong>Response:</strong> Within 15 minutes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
