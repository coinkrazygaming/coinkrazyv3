import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { authService } from '../services/authService';
import { WelcomeBonus } from '../types/auth';
import {
  CheckCircle,
  XCircle,
  Mail,
  RefreshCw,
  Coins,
  Star,
  Crown,
  Gift,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [welcomeBonus, setWelcomeBonus] = useState<WelcomeBonus | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    const emailFromUrl = searchParams.get('email');
    
    if (codeFromUrl) {
      setVerificationCode(codeFromUrl);
    }
    if (emailFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl));
    }

    // Auto-verify if both code and email are in URL
    if (codeFromUrl && emailFromUrl) {
      handleVerification(codeFromUrl, decodeURIComponent(emailFromUrl));
    }
  }, [searchParams]);

  const handleVerification = async (code?: string, emailAddress?: string) => {
    const verifyCode = code || verificationCode;
    const verifyEmail = emailAddress || email;

    if (!verifyCode || !verifyEmail) {
      setErrorMessage('Please enter both email and verification code');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const response = await authService.verifyEmail({
        email: verifyEmail,
        code: verifyCode,
      });

      if (response.success) {
        setVerificationStatus('success');
        setWelcomeBonus(response.welcomeBonus || null);
        
        toast({
          title: 'Email Verified Successfully!',
          description: response.message,
        });

        // Redirect to games after 3 seconds
        setTimeout(() => {
          navigate('/games');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setErrorMessage(response.error || 'Verification failed');
        toast({
          title: 'Verification Failed',
          description: response.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('Verification failed. Please try again.');
      toast({
        title: 'Error',
        description: 'Verification failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await authService.resendVerification(email);
      
      if (response.success) {
        toast({
          title: 'Verification Email Sent',
          description: response.message,
        });
      } else {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-2xl mx-auto border-gold-500/20 bg-gradient-to-r from-gold/5 to-casino-blue/5">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">🎉 Welcome to CoinKrazy!</h2>
            <p className="text-muted-foreground mb-8">
              Your email has been verified successfully! Your welcome bonus has been added to your account.
            </p>

            {welcomeBonus && (
              <div className="bg-gradient-to-r from-gold/10 to-purple/10 border border-gold-500/20 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Gift className="w-6 h-6 text-gold-500" />
                  <h3 className="font-bold text-xl">Welcome Bonus Claimed!</h3>
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-card rounded-lg border border-gold-500/20">
                    <Coins className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gold-500">{welcomeBonus.goldCoins}</div>
                    <div className="text-sm text-muted-foreground">Gold Coins</div>
                    <div className="text-xs text-green-400 mt-1">✓ Added to your account</div>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border border-purple-500/20">
                    <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-500">{welcomeBonus.sweepsCoins}</div>
                    <div className="text-sm text-muted-foreground">Sweeps Coins</div>
                    <div className="text-xs text-green-400 mt-1">✓ Added to your account</div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {welcomeBonus.description}
                </p>
                
                {welcomeBonus.expiresAt && (
                  <p className="text-xs text-orange-400 mt-2">
                    Bonus expires: {welcomeBonus.expiresAt.toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                onClick={() => navigate('/games')}
              >
                <Coins className="w-5 h-5 mr-2" />
                Start Playing Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  View Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Redirecting to games in 3 seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Email Verification
            </h1>
            <p className="text-muted-foreground text-lg">
              Verify your email to claim your welcome bonus!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className={verificationStatus === 'error' ? 'border-red-500/20' : ''}>
            <CardHeader className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                verificationStatus === 'error' 
                  ? 'bg-red-500/10' 
                  : 'bg-gradient-to-r from-casino-blue/20 to-purple/20'
              }`}>
                {verificationStatus === 'error' ? (
                  <XCircle className="w-8 h-8 text-red-500" />
                ) : (
                  <Mail className="w-8 h-8 text-casino-blue" />
                )}
              </div>
              <CardTitle>
                {verificationStatus === 'error' ? 'Verification Failed' : 'Verify Your Email'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {verificationStatus === 'error' && errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Verification Code</label>
                <Input
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  className="font-mono text-center tracking-wider"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Check your email for the verification code
                </p>
              </div>

              <Button
                onClick={() => handleVerification()}
                disabled={isVerifying || !email || !verificationCode}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Verify Email & Claim Bonus'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the email?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendVerification}
                  disabled={isResending || !email}
                  size="sm"
                >
                  {isResending ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              </div>

              {/* Bonus Preview */}
              <div className="bg-gradient-to-r from-gold/5 to-purple/5 border border-gold-500/20 rounded-lg p-4 mt-6">
                <div className="text-center">
                  <h3 className="font-medium mb-3">🎁 Your Welcome Bonus</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <Coins className="w-6 h-6 text-gold-500 mx-auto mb-1" />
                      <div className="font-bold text-gold-500">10</div>
                      <div className="text-xs text-muted-foreground">Gold Coins</div>
                    </div>
                    <div className="text-center">
                      <Star className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                      <div className="font-bold text-purple-500">10</div>
                      <div className="text-xs text-muted-foreground">Sweeps Coins</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Automatically added after verification
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Footer */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="outline" className="border-gold-500 text-gold-400">
                18+ Only
              </Badge>
              <Badge variant="outline" className="border-casino-blue text-casino-blue-light">
                Legal Sweepstakes
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Play responsibly. If you have a gambling problem, call 1-800-GAMBLER.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
