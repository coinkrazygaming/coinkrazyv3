import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Save,
  AlertTriangle,
  CheckCircle,
  Lock,
  Smartphone,
  Globe,
  Heart,
  Star,
  Gift,
  Coins,
  TrendingUp,
  Activity,
  Settings,
  FileText,
  CreditCard,
  Clock,
  Users,
  MessageSquare,
} from "lucide-react";

export default function Profile() {
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.username.split(" ")[0] || "",
    lastName: user?.username.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    bio: "",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`,
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    marketingEmails: true,
    gameUpdates: true,
    bonusOffers: true,
    newsletter: false,
    language: "en",
    timezone: "America/New_York",
    currency: "USD",
    theme: "system",
  });

  // Security state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 60,
    passwordStrength: 85,
    lastPasswordChange: new Date("2024-01-15"),
    activeSessions: 2,
  });

  // Privacy state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "friends",
    showOnlineStatus: true,
    allowFriendRequests: true,
    showGameHistory: false,
    allowDataCollection: true,
    shareAnalytics: false,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  // Profile completion calculation
  const calculateProfileCompletion = () => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.phone,
      profileData.dateOfBirth,
      profileData.address,
      profileData.city,
      profileData.state,
      profileData.zipCode,
      profileData.bio,
    ];

    const completedFields = fields.filter(
      (field) => field && field.length > 0,
    ).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      // Simulate API call to update preferences
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev) => ({
          ...prev,
          avatar: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength >= 80) return "text-green-500";
    if (strength >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength >= 80) return "Strong";
    if (strength >= 60) return "Medium";
    return "Weak";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="w-8 h-8" />
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {profileCompletion}% Complete
        </Badge>
      </div>

      {/* Profile Completion Alert */}
      {profileCompletion < 100 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your profile is {profileCompletion}% complete. Complete your profile
            to unlock all features and receive personalized bonuses.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback className="text-2xl">
                        {profileData.firstName.charAt(0)}
                        {profileData.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/80 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {profileData.firstName} {profileData.lastName}
                    </h3>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge
                        variant={
                          user?.role === "admin"
                            ? "destructive"
                            : user?.role === "staff"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {user?.role?.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        Member since {new Date().getFullYear()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your personal details and contact information
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter your email"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          dateOfBirth: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      placeholder="Enter your state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={profileData.zipCode}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      placeholder="12345"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose how you want to receive notifications
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "emailNotifications",
                    label: "Email Notifications",
                    icon: Mail,
                  },
                  {
                    key: "pushNotifications",
                    label: "Push Notifications",
                    icon: Smartphone,
                  },
                  {
                    key: "smsNotifications",
                    label: "SMS Notifications",
                    icon: Phone,
                  },
                  {
                    key: "marketingEmails",
                    label: "Marketing Emails",
                    icon: Gift,
                  },
                  { key: "gameUpdates", label: "Game Updates", icon: Activity },
                  { key: "bonusOffers", label: "Bonus Offers", icon: Star },
                  { key: "newsletter", label: "Newsletter", icon: FileText },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor={key}>{label}</Label>
                    </div>
                    <Switch
                      id={key}
                      checked={
                        preferences[key as keyof typeof preferences] as boolean
                      }
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* General Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  General Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize your general preferences
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time (ET)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (CT)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time (MT)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (PT)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Password Security
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your password and account security
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Password Strength</span>
                    <span
                      className={`text-sm font-medium ${getPasswordStrengthColor(securitySettings.passwordStrength)}`}
                    >
                      {getPasswordStrengthText(
                        securitySettings.passwordStrength,
                      )}
                    </span>
                  </div>
                  <Progress
                    value={securitySettings.passwordStrength}
                    className="h-2"
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  Last changed:{" "}
                  {securitySettings.lastPasswordChange.toLocaleDateString()}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {loading ? "Changing..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Additional security features for your account
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        twoFactorEnabled: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        loginAlerts: checked,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <Select
                    value={securitySettings.sessionTimeout.toString()}
                    onValueChange={(value) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        sessionTimeout: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Active Sessions</h4>
                  <div className="text-sm text-muted-foreground">
                    You have {securitySettings.activeSessions} active sessions
                  </div>
                  <Button variant="outline" size="sm">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Manage Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Control your privacy and data sharing preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select
                      value={privacySettings.profileVisibility}
                      onValueChange={(value) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          profileVisibility: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Online Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Let others see when you're online
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          showOnlineStatus: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Friend Requests</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to send friend requests
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.allowFriendRequests}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          allowFriendRequests: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Game History</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your game history to others
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showGameHistory}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          showGameHistory: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow data collection for personalization
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.allowDataCollection}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          allowDataCollection: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Share anonymous usage analytics
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.shareAnalytics}
                      onCheckedChange={(checked) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          shareAnalytics: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Profile updated",
                      time: "2 hours ago",
                      icon: User,
                    },
                    {
                      action: "Password changed",
                      time: "1 day ago",
                      icon: Lock,
                    },
                    {
                      action: "Game session ended",
                      time: "3 days ago",
                      icon: Activity,
                    },
                    { action: "Bonus claimed", time: "1 week ago", icon: Gift },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {user?.balances
                        ?.find((b) => b.currency === "GC")
                        ?.balance.toLocaleString() || "0"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Gold Coins
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {user?.balances?.find((b) => b.currency === "SC")
                        ?.balance || "0"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Sweeps Coins
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">156</div>
                    <div className="text-sm text-muted-foreground">
                      Games Played
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">42</div>
                    <div className="text-sm text-muted-foreground">
                      Days Active
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
