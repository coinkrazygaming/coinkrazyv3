import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Mail,
  MapPin,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Printer,
  Send,
  Copy,
  ExternalLink,
  Phone,
  Globe,
  BookOpen,
  Scale,
  Stamp,
  Package,
  Calendar,
  Trophy,
  Coins,
  Gem,
  Crown,
  Star,
  Target,
  Award,
  Gift,
  QrCode,
  Paperclip,
  Archive,
  Eye,
  History
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MailInEntry {
  id: string;
  userId?: string;
  entryMethod: 'mail' | 'postcard' | 'online_form';
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  entryDate: Date;
  status: 'pending' | 'verified' | 'processed' | 'invalid';
  sweepstakesId: string;
  entryCode?: string;
  mailTrackingNumber?: string;
  adminNotes?: string;
}

interface SweepstakesPromotion {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  prizes: SweepstakesPrize[];
  gcReward: number;
  scReward: number;
  isActive: boolean;
  maxEntriesPerPerson: number;
  totalEntries: number;
  eligibleStates: string[];
  ageRequirement: number;
  mailInAddress: {
    companyName: string;
    department: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface SweepstakesPrize {
  place: number;
  description: string;
  value: number;
  quantity: number;
}

interface ComplianceInfo {
  noEntryFee: boolean;
  noPurchaseNecessary: boolean;
  alternateEntry: boolean;
  officialRules: string;
  privacyPolicy: string;
  termsOfService: string;
  sponsorInfo: {
    companyName: string;
    address: string;
    phone: string;
    email: string;
  };
}

export default function MailInSweepstakes() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activePromotions, setActivePromotions] = useState<SweepstakesPromotion[]>([]);
  const [userEntries, setUserEntries] = useState<MailInEntry[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<SweepstakesPromotion | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [entryFormData, setEntryFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    entryMethod: 'online_form' as 'mail' | 'postcard' | 'online_form'
  });
  const [loading, setLoading] = useState(true);

  const complianceInfo: ComplianceInfo = {
    noEntryFee: true,
    noPurchaseNecessary: true,
    alternateEntry: true,
    officialRules: '/legal/sweepstakes-rules.pdf',
    privacyPolicy: '/legal/privacy-policy.pdf',
    termsOfService: '/legal/terms-of-service.pdf',
    sponsorInfo: {
      companyName: 'CoinFrazy Entertainment LLC',
      address: '1234 Gaming Blvd, Suite 500, Las Vegas, NV 89101',
      phone: '1-800-COINFRAZY',
      email: 'sweepstakes@coinfrazy.com'
    }
  };

  useEffect(() => {
    loadSweepstakesData();
    if (user?.id) {
      loadUserEntries();
    }
  }, [user?.id]);

  const loadSweepstakesData = async () => {
    try {
      setLoading(true);
      
      // Mock sweepstakes promotions
      const promotions: SweepstakesPromotion[] = [
        {
          id: 'monthly-mega-2024-01',
          title: 'Monthly Mega Sweepstakes - January 2024',
          description: 'Enter for a chance to win amazing prizes including cash, gift cards, and electronics! No purchase necessary.',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          prizes: [
            { place: 1, description: '$10,000 Cash Prize', value: 10000, quantity: 1 },
            { place: 2, description: '$1,000 Cash Prize', value: 1000, quantity: 5 },
            { place: 3, description: '$500 Amazon Gift Card', value: 500, quantity: 10 },
            { place: 4, description: '$100 Gift Card', value: 100, quantity: 50 },
            { place: 5, description: 'CoinFrazy Premium Merchandise', value: 50, quantity: 100 }
          ],
          gcReward: 1000,
          scReward: 10,
          isActive: true,
          maxEntriesPerPerson: 1,
          totalEntries: 15420,
          eligibleStates: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
          ageRequirement: 18,
          mailInAddress: {
            companyName: 'CoinFrazy Entertainment LLC',
            department: 'Sweepstakes Department',
            streetAddress: '1234 Gaming Blvd, Suite 500',
            city: 'Las Vegas',
            state: 'NV',
            zipCode: '89101'
          }
        },
        {
          id: 'weekly-winners-2024-w04',
          title: 'Weekly Winners - Week 4, 2024',
          description: 'Weekly sweepstakes with instant prizes and entry into monthly grand prize drawing.',
          startDate: new Date('2024-01-22'),
          endDate: new Date('2024-01-28'),
          prizes: [
            { place: 1, description: '$2,500 Cash Prize', value: 2500, quantity: 1 },
            { place: 2, description: '$500 Gift Card', value: 500, quantity: 3 },
            { place: 3, description: '$100 Gift Card', value: 100, quantity: 15 },
            { place: 4, description: '$25 Gift Card', value: 25, quantity: 50 }
          ],
          gcReward: 500,
          scReward: 5,
          isActive: true,
          maxEntriesPerPerson: 1,
          totalEntries: 8350,
          eligibleStates: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
          ageRequirement: 18,
          mailInAddress: {
            companyName: 'CoinFrazy Entertainment LLC',
            department: 'Weekly Sweepstakes',
            streetAddress: '1234 Gaming Blvd, Suite 500',
            city: 'Las Vegas',
            state: 'NV',
            zipCode: '89101'
          }
        }
      ];
      
      setActivePromotions(promotions);
    } catch (error) {
      console.error('Failed to load sweepstakes data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserEntries = () => {
    if (!user?.id) return;
    
    try {
      const savedEntries = localStorage.getItem(`mail_entries_${user.id}`);
      if (savedEntries) {
        const entries = JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          entryDate: new Date(entry.entryDate)
        }));
        setUserEntries(entries);
      }
    } catch (error) {
      console.error('Failed to load user entries:', error);
    }
  };

  const saveUserEntries = (entries: MailInEntry[]) => {
    if (!user?.id) return;
    localStorage.setItem(`mail_entries_${user.id}`, JSON.stringify(entries));
  };

  const generateEntryCode = (): string => {
    return `CF-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  };

  const submitEntry = async () => {
    if (!selectedPromotion || !user?.id) return;
    
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'dateOfBirth'];
      const missingFields = requiredFields.filter(field => !entryFormData[field as keyof typeof entryFormData]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing Information",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }
      
      // Check if user already entered this sweepstakes
      const existingEntry = userEntries.find(entry => 
        entry.sweepstakesId === selectedPromotion.id && entry.userId === user.id
      );
      
      if (existingEntry) {
        toast({
          title: "Already Entered",
          description: "You have already entered this sweepstakes",
          variant: "destructive"
        });
        return;
      }
      
      // Validate age
      const birthDate = new Date(entryFormData.dateOfBirth);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (age < selectedPromotion.ageRequirement) {
        toast({
          title: "Age Requirement",
          description: `You must be at least ${selectedPromotion.ageRequirement} years old to enter`,
          variant: "destructive"
        });
        return;
      }
      
      // Validate state eligibility
      if (!selectedPromotion.eligibleStates.includes(entryFormData.state)) {
        toast({
          title: "State Not Eligible",
          description: "This sweepstakes is not available in your state",
          variant: "destructive"
        });
        return;
      }
      
      // Create new entry
      const newEntry: MailInEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        entryMethod: entryFormData.entryMethod,
        firstName: entryFormData.firstName,
        lastName: entryFormData.lastName,
        address: entryFormData.address,
        city: entryFormData.city,
        state: entryFormData.state,
        zipCode: entryFormData.zipCode,
        email: entryFormData.email || user.email,
        phone: entryFormData.phone,
        dateOfBirth: entryFormData.dateOfBirth,
        entryDate: new Date(),
        status: 'pending',
        sweepstakesId: selectedPromotion.id,
        entryCode: generateEntryCode()
      };
      
      // Save entry
      const updatedEntries = [...userEntries, newEntry];
      setUserEntries(updatedEntries);
      saveUserEntries(updatedEntries);
      
      // Award participation rewards (GC/SC for entering)
      if (selectedPromotion.gcReward > 0 || selectedPromotion.scReward > 0) {
        // In production, this would call walletService.updateBalance
        toast({
          title: "Entry Submitted! 🎉",
          description: `You've been entered into ${selectedPromotion.title} and earned ${selectedPromotion.gcReward} GC + ${selectedPromotion.scReward} SC!`,
        });
      } else {
        toast({
          title: "Entry Submitted! 🎉",
          description: `You've been successfully entered into ${selectedPromotion.title}. Good luck!`,
        });
      }
      
      // Reset form
      setEntryFormData({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        entryMethod: 'online_form'
      });
      
      setShowEntryForm(false);
      setSelectedPromotion(null);
      
    } catch (error) {
      console.error('Failed to submit entry:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const downloadPrintableForm = (promotion: SweepstakesPromotion) => {
    // In production, this would generate and download a PDF
    const printableContent = generatePrintableForm(promotion);
    
    const blob = new Blob([printableContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${promotion.title.replace(/\s+/g, '_')}_Entry_Form.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Form Downloaded",
      description: "Printable entry form has been downloaded",
    });
  };

  const generatePrintableForm = (promotion: SweepstakesPromotion): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${promotion.title} - Entry Form</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .field { margin-bottom: 10px; }
        .field label { display: inline-block; width: 120px; font-weight: bold; }
        .field input { border: none; border-bottom: 1px solid #000; width: 200px; }
        .instructions { background: #f5f5f5; padding: 15px; border: 1px solid #ddd; }
        .address-box { border: 2px solid #000; padding: 15px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CoinFrazy Sweepstakes Entry Form</h1>
        <h2>${promotion.title}</h2>
        <p><strong>Entry Code:</strong> ${generateEntryCode()}</p>
    </div>
    
    <div class="section">
        <h3>Personal Information</h3>
        <div class="field">
            <label>First Name:</label>
            <input type="text" name="firstName" />
        </div>
        <div class="field">
            <label>Last Name:</label>
            <input type="text" name="lastName" />
        </div>
        <div class="field">
            <label>Date of Birth:</label>
            <input type="text" name="dateOfBirth" placeholder="MM/DD/YYYY" />
        </div>
        <div class="field">
            <label>Email:</label>
            <input type="text" name="email" />
        </div>
        <div class="field">
            <label>Phone:</label>
            <input type="text" name="phone" />
        </div>
    </div>
    
    <div class="section">
        <h3>Address Information</h3>
        <div class="field">
            <label>Street Address:</label>
            <input type="text" name="address" style="width: 300px;" />
        </div>
        <div class="field">
            <label>City:</label>
            <input type="text" name="city" />
        </div>
        <div class="field">
            <label>State:</label>
            <input type="text" name="state" style="width: 50px;" />
        </div>
        <div class="field">
            <label>ZIP Code:</label>
            <input type="text" name="zipCode" style="width: 100px;" />
        </div>
    </div>
    
    <div class="instructions">
        <h3>Mail-In Instructions</h3>
        <p><strong>1.</strong> Fill out this form completely with legible handwriting</p>
        <p><strong>2.</strong> Sign and date below</p>
        <p><strong>3.</strong> Mail this form to the address below</p>
        <p><strong>4.</strong> Entries must be postmarked by ${promotion.endDate.toLocaleDateString()}</p>
        <p><strong>5.</strong> No purchase necessary. Void where prohibited.</p>
        <br>
        <div class="field">
            <label>Signature:</label>
            <input type="text" name="signature" style="width: 200px;" />
        </div>
        <div class="field">
            <label>Date:</label>
            <input type="text" name="date" style="width: 100px;" />
        </div>
    </div>
    
    <div class="address-box">
        <h3>Mail To:</h3>
        <p><strong>${promotion.mailInAddress.companyName}</strong><br>
        ${promotion.mailInAddress.department}<br>
        ${promotion.mailInAddress.streetAddress}<br>
        ${promotion.mailInAddress.city}, ${promotion.mailInAddress.state} ${promotion.mailInAddress.zipCode}</p>
    </div>
    
    <div style="margin-top: 30px; font-size: 12px; border-top: 1px solid #000; padding-top: 10px;">
        <p><strong>Official Rules:</strong> Visit coinfrazy.com/sweepstakes-rules for complete terms and conditions.</p>
        <p><strong>No Purchase Necessary:</strong> A purchase does not increase your chances of winning.</p>
        <p><strong>Privacy:</strong> Your information will be used in accordance with our Privacy Policy.</p>
    </div>
</body>
</html>
    `;
  };

  const copyMailAddress = (promotion: SweepstakesPromotion) => {
    const address = `${promotion.mailInAddress.companyName}\n${promotion.mailInAddress.department}\n${promotion.mailInAddress.streetAddress}\n${promotion.mailInAddress.city}, ${promotion.mailInAddress.state} ${promotion.mailInAddress.zipCode}`;
    
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Mailing address copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-600', icon: Clock, text: 'Pending' },
      verified: { color: 'bg-blue-600', icon: CheckCircle, text: 'Verified' },
      processed: { color: 'bg-green-600', icon: CheckCircle, text: 'Processed' },
      invalid: { color: 'bg-red-600', icon: AlertTriangle, text: 'Invalid' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Mail className="w-8 h-8 animate-bounce mx-auto mb-4" />
          <p>Loading sweepstakes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Mail-In Sweepstakes
            </h1>
            <p className="text-muted-foreground">
              Enter to win amazing prizes! No purchase necessary - free alternative entry methods available.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white">
              <Shield className="w-3 h-3 mr-1" />
              100% Legal & Compliant
            </Badge>
            <Badge variant="outline">
              <Mail className="w-3 h-3 mr-1" />
              No Purchase Required
            </Badge>
          </div>
        </div>

        {/* Compliance Notice */}
        <Alert className="mb-6 border-blue-500 bg-blue-500/10">
          <Scale className="h-4 w-4" />
          <AlertDescription>
            <strong>Legal Compliance:</strong> All sweepstakes comply with federal and state regulations. 
            No purchase necessary to enter or win. Alternative free entry methods are always provided.
            <Button 
              variant="link" 
              className="p-0 ml-2 h-auto text-blue-600" 
              onClick={() => setShowRules(true)}
            >
              View Official Rules
            </Button>
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Sweepstakes</TabsTrigger>
          <TabsTrigger value="entries">My Entries</TabsTrigger>
          <TabsTrigger value="how-to">How to Enter</TabsTrigger>
        </TabsList>

        {/* Active Sweepstakes */}
        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activePromotions.filter(p => p.isActive).map(promotion => (
              <Card key={promotion.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-green-500/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{promotion.title}</CardTitle>
                      <p className="text-muted-foreground mt-2">{promotion.description}</p>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      <Trophy className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Prize Information */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Prizes
                      </h4>
                      <div className="space-y-1">
                        {promotion.prizes.slice(0, 3).map(prize => (
                          <div key={prize.place} className="flex justify-between text-sm">
                            <span>{prize.description}</span>
                            <span className="font-semibold text-green-600">
                              ${prize.value.toLocaleString()} {prize.quantity > 1 && `(${prize.quantity})`}
                            </span>
                          </div>
                        ))}
                        {promotion.prizes.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{promotion.prizes.length - 3} more prizes
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Entry Rewards */}
                    {(promotion.gcReward > 0 || promotion.scReward > 0) && (
                      <div className="bg-muted rounded-lg p-3">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Gift className="w-4 h-4" />
                          Entry Bonus
                        </h4>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            {promotion.gcReward} GC
                          </div>
                          <div className="flex items-center gap-1">
                            <Gem className="w-4 h-4 text-purple-500" />
                            {promotion.scReward} SC
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Ends:</span>
                        <div>{promotion.endDate.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Entries:</span>
                        <div>{promotion.totalEntries.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Age Req:</span>
                        <div>{promotion.ageRequirement}+</div>
                      </div>
                      <div>
                        <span className="font-medium">Max Entries:</span>
                        <div>{promotion.maxEntriesPerPerson}</div>
                      </div>
                    </div>
                    
                    {/* Entry Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Button 
                        onClick={() => {
                          setSelectedPromotion(promotion);
                          setShowEntryForm(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Enter Online
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => downloadPrintableForm(promotion)}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Mail-In Form
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowInstructions(true)}
                      className="w-full"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      View Entry Instructions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {activePromotions.filter(p => p.isActive).length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Sweepstakes</h3>
              <p className="text-muted-foreground">Check back soon for new sweepstakes opportunities!</p>
            </div>
          )}
        </TabsContent>

        {/* My Entries */}
        <TabsContent value="entries" className="space-y-6">
          {user ? (
            <>
              {userEntries.length > 0 ? (
                <div className="space-y-4">
                  {userEntries.map(entry => {
                    const promotion = activePromotions.find(p => p.id === entry.sweepstakesId);
                    
                    return (
                      <Card key={entry.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h3 className="font-semibold">
                                {promotion?.title || 'Unknown Sweepstakes'}
                              </h3>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Entry Code: <span className="font-mono">{entry.entryCode}</span></div>
                                <div>Submitted: {entry.entryDate.toLocaleDateString()}</div>
                                <div>Method: {entry.entryMethod.replace('_', ' ').toUpperCase()}</div>
                                {entry.mailTrackingNumber && (
                                  <div>Tracking: {entry.mailTrackingNumber}</div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {getStatusBadge(entry.status)}
                              {entry.status === 'verified' && (
                                <div className="text-xs text-green-600 mt-1">
                                  <CheckCircle className="w-3 h-3 inline mr-1" />
                                  Entered Successfully
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Entries Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't entered any sweepstakes yet. Start entering to win amazing prizes!
                  </p>
                  <Button onClick={() => setActiveTab?.('active')}>
                    View Active Sweepstakes
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Login Required</h3>
              <p className="text-muted-foreground">Please log in to view your sweepstakes entries</p>
            </div>
          )}
        </TabsContent>

        {/* How to Enter */}
        <TabsContent value="how-to" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Online Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Online Entry (Free)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium">Select a Sweepstakes</h4>
                      <p className="text-sm text-muted-foreground">Choose from active sweepstakes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium">Fill Out Entry Form</h4>
                      <p className="text-sm text-muted-foreground">Complete required information</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium">Submit Entry</h4>
                      <p className="text-sm text-muted-foreground">Instant entry + bonus rewards</p>
                    </div>
                  </div>
                </div>
                
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Online entries are processed instantly and you receive bonus GC/SC for participating!
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Mail-In Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Mail-In Entry (Free)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium">Download Form</h4>
                      <p className="text-sm text-muted-foreground">Print official entry form</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium">Complete Form</h4>
                      <p className="text-sm text-muted-foreground">Fill out with legible handwriting</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium">Mail Entry</h4>
                      <p className="text-sm text-muted-foreground">Send to official address by deadline</p>
                    </div>
                  </div>
                </div>
                
                <Alert className="mt-4">
                  <Stamp className="h-4 w-4" />
                  <AlertDescription>
                    Mail-in entries must be postmarked by the deadline date. Use certified mail for tracking.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Important Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Entry Requirements</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Must be 18+ years old</li>
                    <li>• Valid US address required</li>
                    <li>• Limit one entry per person per sweepstakes</li>
                    <li>• No purchase necessary</li>
                    <li>• Void where prohibited</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Legal Compliance</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• FTC compliant promotions</li>
                    <li>• State law compliance verified</li>
                    <li>• Official rules available</li>
                    <li>• Privacy policy protection</li>
                    <li>• Legitimate winner selection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Entry Form Dialog */}
      <Dialog open={showEntryForm} onOpenChange={setShowEntryForm}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Enter Sweepstakes</DialogTitle>
            <DialogDescription>
              {selectedPromotion?.title} - Complete the form below to enter
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-96">
            <div className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={entryFormData.firstName}
                    onChange={(e) => setEntryFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={entryFormData.lastName}
                    onChange={(e) => setEntryFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={entryFormData.address}
                  onChange={(e) => setEntryFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={entryFormData.city}
                    onChange={(e) => setEntryFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <select
                    id="state"
                    className="w-full p-2 border rounded-md"
                    value={entryFormData.state}
                    onChange={(e) => setEntryFormData(prev => ({ ...prev, state: e.target.value }))}
                  >
                    <option value="">Select State</option>
                    {usStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={entryFormData.zipCode}
                    onChange={(e) => setEntryFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={entryFormData.dateOfBirth}
                    onChange={(e) => setEntryFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={entryFormData.email}
                    onChange={(e) => setEntryFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={entryFormData.phone}
                    onChange={(e) => setEntryFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  By submitting this form, you agree to the official rules and privacy policy. 
                  You must be 18+ and a US resident to enter.
                </AlertDescription>
              </Alert>
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEntryForm(false)}>
              Cancel
            </Button>
            <Button onClick={submitEntry}>
              <Send className="w-4 h-4 mr-2" />
              Submit Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Entry Instructions & Mailing Address</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mailing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPromotion && (
                    <div className="space-y-3">
                      <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                        <div>{selectedPromotion.mailInAddress.companyName}</div>
                        <div>{selectedPromotion.mailInAddress.department}</div>
                        <div>{selectedPromotion.mailInAddress.streetAddress}</div>
                        <div>{selectedPromotion.mailInAddress.city}, {selectedPromotion.mailInAddress.state} {selectedPromotion.mailInAddress.zipCode}</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyMailAddress(selectedPromotion)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Address
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {complianceInfo.sponsorInfo.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {complianceInfo.sponsorInfo.email}
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <div>{complianceInfo.sponsorInfo.address}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Entries must be postmarked by the deadline. 
                We recommend using certified mail with tracking for important submissions.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>

      {/* Official Rules Dialog */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Official Sweepstakes Rules</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold mb-2">1. Eligibility</h3>
                <p>Sweepstakes are open to legal residents of the United States who are 18 years of age or older. Employees of CoinFrazy Entertainment LLC and their immediate family members are not eligible.</p>
              </section>
              
              <section>
                <h3 className="font-semibold mb-2">2. No Purchase Necessary</h3>
                <p>No purchase is necessary to enter or win. A purchase does not increase your chances of winning. Void where prohibited by law.</p>
              </section>
              
              <section>
                <h3 className="font-semibold mb-2">3. Entry Methods</h3>
                <p>Entries may be submitted online through our website or by mail to the address provided. All entry requirements must be met for entry to be valid.</p>
              </section>
              
              <section>
                <h3 className="font-semibold mb-2">4. Winner Selection</h3>
                <p>Winners will be selected at random from all eligible entries. Winners will be notified via email or phone. Response required within specified timeframe.</p>
              </section>
              
              <section>
                <h3 className="font-semibold mb-2">5. Prizes</h3>
                <p>Prizes are as described in each sweepstakes. No cash substitution except at sponsor's discretion. Taxes are winner's responsibility.</p>
              </section>
              
              <section>
                <h3 className="font-semibold mb-2">6. Privacy</h3>
                <p>Personal information is collected and used in accordance with our Privacy Policy. Winner information may be used for promotional purposes.</p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
