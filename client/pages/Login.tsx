import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = () => {
    // Simulate login process
    // 2FA disabled for admin accounts as requested
    console.log("Login successful");
    // Navigate to appropriate dashboard
    if (formData.email === "coinkrazy00@gmail.com") {
      // Admin user - redirect to admin panel
      window.location.href = "/admin";
    } else {
      // Regular user - redirect to dashboard
      window.location.href = "/dashboard";
    }
  };

  const handle2FASubmit = () => {
    if (twoFactorCode.length === 6) {
      console.log("2FA verified, login complete");
      // Redirect to admin panel or dashboard
    }
  };

  if (is2FARequired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md border-gold-500/20">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <p className="text-muted-foreground">
              Enter the 6-digit code from your authenticator app
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button
              onClick={handle2FASubmit}
              disabled={twoFactorCode.length !== 6}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
            >
              Verify & Login
            </Button>

            <div className="text-center">
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setIs2FARequired(false)}
              >
                Back to login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-lg">
              Login to continue your winning streak
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Login Form */}
          <Card className="border-gold-500/20">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-black" />
              </div>
              <CardTitle>Login to Start Going CoinKrazy!</CardTitle>
              <p className="text-muted-foreground">
                Access your account and continue playing
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      handleInputChange("rememberMe", e.target.checked)
                    }
                  />
                  <label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gold-400 hover:text-gold-300"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                onClick={handleLogin}
                disabled={!formData.email || !formData.password}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
              >
                Login
              </Button>

              <div className="text-center">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-gold-400 hover:text-gold-300 font-medium"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>

              {/* Admin Login Demo */}
            </CardContent>
          </Card>

          {/* Features & Benefits */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-4">Why Choose CoinKrazy?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of players winning real cash prizes daily through
                our legal sweepstakes platform.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: Crown,
                  title: "Premium Gaming Experience",
                  description:
                    "700+ slot games from top providers like Pragmatic Play and NetEnt",
                },
                {
                  icon: Shield,
                  title: "Secure & Legal",
                  description:
                    "Fully compliant sweepstakes model with advanced security measures",
                },
                {
                  icon: Smartphone,
                  title: "Mobile Optimized",
                  description:
                    "Play anywhere with our mobile-first responsive design",
                },
                {
                  icon: AlertTriangle,
                  title: "Responsible Gaming",
                  description:
                    "Built-in tools and limits to promote healthy gaming habits",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-card rounded-lg border border-border/50"
                >
                  <feature.icon className="w-8 h-8 text-gold-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-gold/5 to-casino-blue/5 rounded-lg p-6 border border-gold-500/20">
              <h3 className="font-bold text-lg mb-2">New Player Bonus</h3>
              <p className="text-muted-foreground mb-4">
                Get started with 100,000 Gold Coins + 50 Sweeps Coins + 7 Days
                VIP when you sign up!
              </p>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
                  Claim Your Bonus
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <Badge variant="outline" className="border-gold-500 text-gold-400">
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
            Must be 18+ years old. Void where prohibited. Play responsibly.
            Support: 319-473-0416 | support@coinfrazy.com
          </p>
        </div>
      </div>
    </div>
  );
}
