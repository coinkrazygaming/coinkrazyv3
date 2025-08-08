import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gift,
  Shield,
  Coins,
  Star,
  Crown,
  Check,
  Upload,
  Camera,
  CreditCard,
  AlertTriangle,
  MapPin,
  Calendar,
  Mail,
  Lock,
  User,
  Phone,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";

const blockedStates = ["WA", "ID", "MT", "NV", "NY"];

export default function Register() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationError, setRegistrationError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    ssn: "",
    agreeTerms: false,
    agreeMarketing: false,
    verifyAge: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [kycDocuments, setKycDocuments] = useState({
    frontId: null,
    backId: null,
    selfie: null,
    addressProof: null,
  });
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isStateBlocked = (state: string) => {
    return blockedStates.includes(state.toUpperCase());
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          formData.username &&
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword
        );
      case 2:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.dateOfBirth &&
          formData.phone
        );
      case 3:
        return (
          formData.address &&
          formData.city &&
          formData.state &&
          formData.zipCode &&
          !isStateBlocked(formData.state)
        );
      case 4:
        return formData.agreeTerms && formData.verifyAge;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        // Complete registration
        setRegistrationError("");

        try {
          // In a real app, you'd create the account via API first
          // For now, we'll just log them in
          const success = await login(formData.email, formData.password);

          if (success) {
            setRegistrationComplete(true);
          } else {
            setRegistrationError("Registration failed. Please try again.");
          }
        } catch (error) {
          console.error("Registration error:", error);
          setRegistrationError("Registration failed. Please try again.");
        }
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-2xl mx-auto border-gold-500/20 bg-gradient-to-r from-gold/5 to-casino-blue/5">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to CoinKrazy!</h2>
            <p className="text-muted-foreground mb-8">
              Your account has been created successfully. You've received your
              welcome bonus!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-card rounded-lg">
                <Coins className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gold-500">100,000</div>
                <div className="text-sm text-muted-foreground">Gold Coins</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg">
                <Crown className="w-8 h-8 text-casino-blue mx-auto mb-2" />
                <div className="text-2xl font-bold text-casino-blue">50</div>
                <div className="text-sm text-muted-foreground">
                  Sweeps Coins
                </div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg">
                <Star className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gold-500">7</div>
                <div className="text-sm text-muted-foreground">Days VIP</div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => navigate("/dashboard")}
                size="lg"
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
              >
                Start Playing Now
              </Button>
              <p className="text-sm text-muted-foreground">
                Complete KYC verification to unlock Sweeps Coin withdrawals
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Join CoinKrazy
            </h1>
            <p className="text-muted-foreground text-lg">
              Get your welcome bonus and start winning today!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Bonus */}
          <Card className="mb-8 border-gold-500/20 bg-gradient-to-r from-gold/5 to-casino-blue/5">
            <CardContent className="p-6 text-center">
              <Gift className="w-12 h-12 text-gold-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Welcome Bonus Package</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-500 mb-1">
                    100,000
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Free Gold Coins
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-casino-blue mb-1">
                    50
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sweeps Coins
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-500 mb-1">7</div>
                  <div className="text-sm text-muted-foreground">Days VIP</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step <= currentStep
                        ? "bg-gold-500 text-black"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step < currentStep ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-12 h-1 ${
                        step < currentStep ? "bg-gold-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Account</span>
              <span>Personal</span>
              <span>Address</span>
              <span>Verification</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Create Your Account"}
                {currentStep === 2 && "Personal Information"}
                {currentStep === 3 && "Address & Location"}
                {currentStep === 4 && "Terms & Verification"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Account Creation */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                    {formData.password &&
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          Passwords do not match
                        </p>
                      )}
                  </div>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        First Name
                      </label>
                      <Input
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Last Name
                      </label>
                      <Input
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange("dateOfBirth", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Must be 18+ years old
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Address */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Street Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="123 Main Street"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        City
                      </label>
                      <Input
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        State
                      </label>
                      <Input
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        className={
                          isStateBlocked(formData.state) ? "border-red-500" : ""
                        }
                      />
                      {isStateBlocked(formData.state) && (
                        <p className="text-red-500 text-sm mt-1">
                          Sorry, CoinKrazy is not available in{" "}
                          {formData.state.toUpperCase()}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        ZIP Code
                      </label>
                      <Input
                        placeholder="12345"
                        value={formData.zipCode}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-casino-blue" />
                      <span className="font-medium">
                        State Compliance Check
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We verify your location to ensure compliance with local
                      laws. CoinKrazy is not available in: WA, ID, MT, NV, NY.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Terms & Verification */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="verifyAge"
                        checked={formData.verifyAge}
                        onChange={(e) =>
                          handleInputChange("verifyAge", e.target.checked)
                        }
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor="verifyAge" className="font-medium">
                          I certify that I am 18+ years old
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Must be at least 18 years old to register
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={(e) =>
                          handleInputChange("agreeTerms", e.target.checked)
                        }
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor="agreeTerms" className="font-medium">
                          I agree to the Terms of Service and Privacy Policy
                        </label>
                        <p className="text-sm text-muted-foreground">
                          By checking this box, you agree to our sweepstakes
                          rules and responsible gaming policies
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agreeMarketing"
                        checked={formData.agreeMarketing}
                        onChange={(e) =>
                          handleInputChange("agreeMarketing", e.target.checked)
                        }
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor="agreeMarketing" className="font-medium">
                          I want to receive bonus offers and promotions
                          (optional)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gold/5 border border-gold-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-gold-500" />
                      <span className="font-medium">
                        Sweepstakes Legal Notice
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• No purchase necessary to play or win</p>
                      <p>• Sweeps Coins can be redeemed for cash prizes</p>
                      <p>• Gold Coins are for entertainment only</p>
                      <p>• Must complete KYC verification to redeem prizes</p>
                      <p>• Void where prohibited by law</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Error */}
              {registrationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{registrationError}</span>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep) || isLoading}
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                >
                  {isLoading
                    ? "Creating Account..."
                    : currentStep === 4
                      ? "Create Account"
                      : "Next"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Legal Footer */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <Badge
                variant="outline"
                className="border-gold-500 text-gold-400"
              >
                <Shield className="w-3 h-3 mr-1" />
                18+ Only
              </Badge>
              <Badge
                variant="outline"
                className="border-casino-blue text-casino-blue-light"
              >
                No Purchase Necessary
              </Badge>
              <Badge
                variant="outline"
                className="border-green-500 text-green-400"
              >
                Legal Sweepstakes
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              CoinKrazy operates as a legal sweepstakes casino. Play
              responsibly. If you have a gambling problem, call 1-800-GAMBLER.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
