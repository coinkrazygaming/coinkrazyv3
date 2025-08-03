import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gift,
  Shield,
  Coins,
  Star,
  Crown,
  Check
} from 'lucide-react';

export default function Register() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Join CoinKrazy</h1>
            <p className="text-muted-foreground text-lg">Get your welcome bonus and start winning today!</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Bonus */}
          <Card className="mb-8 border-gold-500/20 bg-gradient-to-r from-gold/5 to-casino-blue/5">
            <CardContent className="p-8 text-center">
              <Gift className="w-16 h-16 text-gold-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Welcome Bonus Package</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-500 mb-2">100,000</div>
                  <div className="text-muted-foreground">Free Gold Coins</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-casino-blue mb-2">50</div>
                  <div className="text-muted-foreground">Sweeps Coins</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold-500 mb-2">7</div>
                  <div className="text-muted-foreground">Days VIP</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-gold-500" />
                  Create Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-8">
                  <Shield className="w-16 h-16 text-casino-blue mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-4">Registration Form</h3>
                  <p className="text-muted-foreground mb-6">
                    The full registration form with KYC verification, age validation, and state compliance checking will be implemented here.
                  </p>
                  <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                    Continue Building This Page
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Choose CoinKrazy?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  'Instant play with no downloads',
                  '700+ premium slot games',
                  'Live poker tournaments 24/7',
                  'Daily bonus wheel spins',
                  'Real cash prize redemptions',
                  'VIP loyalty program',
                  'Mobile-optimized experience',
                  '24/7 customer support'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-gold-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Legal Notice */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <Badge variant="outline" className="border-gold-500 text-gold-400">
                <Shield className="w-3 h-3 mr-1" />
                18+ Only
              </Badge>
              <Badge variant="outline" className="border-casino-blue text-casino-blue-light">
                No Purchase Necessary
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-400">
                Legal Sweepstakes
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              By registering, you agree to our Terms of Service and Privacy Policy. 
              Must be 18+ years old. Void where prohibited. Play responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
