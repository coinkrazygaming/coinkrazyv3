import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Shield, AlertTriangle, CheckCircle, X } from "lucide-react";
import { complianceService } from "../services/complianceService";

const ComplianceBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showAgeDialog, setShowAgeDialog] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [ageForm, setAgeForm] = useState({
    birthDate: "",
    state: "CA",
  });

  useEffect(() => {
    // Check if user has already verified age
    const verified = localStorage.getItem("coinkrazy_age_verified");
    const verificationDate = localStorage.getItem(
      "coinkrazy_age_verification_date",
    );

    if (verified === "true" && verificationDate) {
      // Check if verification is still valid (30 days)
      const verifyDate = new Date(verificationDate);
      const now = new Date();
      const daysDiff =
        (now.getTime() - verifyDate.getTime()) / (1000 * 3600 * 24);

      if (daysDiff < 30) {
        setAgeVerified(true);
        return;
      }
    }

    // Show banner after 2 seconds for new users
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAgeVerification = async () => {
    if (!ageForm.birthDate) {
      alert("Please enter your birth date");
      return;
    }

    const isEligible = await complianceService.verifyAge(
      ageForm.birthDate,
      ageForm.state,
    );

    if (isEligible) {
      setAgeVerified(true);
      setShowAgeDialog(false);
      setShowBanner(false);

      // Store verification for 30 days
      localStorage.setItem("coinkrazy_age_verified", "true");
      localStorage.setItem(
        "coinkrazy_age_verification_date",
        new Date().toISOString(),
      );

      alert("Age verification successful! Welcome to CoinKrazy!");
    } else {
      alert(
        "You must be 18+ to access this site (19+ in AL/NE). Thank you for visiting.",
      );
      // Redirect away or disable access
      window.location.href = "https://www.google.com";
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    // Show again in 24 hours if not verified
    localStorage.setItem(
      "coinkrazy_banner_dismissed",
      new Date().toISOString(),
    );
  };

  if (ageVerified || !showBanner) {
    return null;
  }

  return (
    <>
      {/* Age Verification Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white p-2 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <span className="font-bold">Age Verification Required:</span>
              <span className="ml-2">
                You must be 18+ years old to access this sweepstakes site (19+
                in AL/NE)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAgeDialog(true)}
            >
              Verify Age
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissBanner}
              className="text-white hover:bg-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Age Verification Dialog */}
      <Dialog open={showAgeDialog} onOpenChange={setShowAgeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Age Verification Required
            </DialogTitle>
            <DialogDescription>
              To access CoinKrazy sweepstakes, you must verify that you meet the
              minimum age requirement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Legal Requirements:</strong>
                <ul className="list-disc list-inside mt-2 text-sm">
                  <li>Must be 18+ years old (19+ in Alabama and Nebraska)</li>
                  <li>Must be a legal resident of the United States</li>
                  <li>Sweepstakes void where prohibited by law</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <Label htmlFor="birthDate">Date of Birth</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={ageForm.birthDate}
                  onChange={(e) =>
                    setAgeForm((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
                  }
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <Label htmlFor="state">State of Residence</Label>
                <Select
                  value={ageForm.state}
                  onValueChange={(value) =>
                    setAgeForm((prev) => ({
                      ...prev,
                      state: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">Alabama (19+)</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="AR">Arkansas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="HI">Hawaii</SelectItem>
                    <SelectItem value="ID">Idaho</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="IN">Indiana</SelectItem>
                    <SelectItem value="IA">Iowa</SelectItem>
                    <SelectItem value="KS">Kansas</SelectItem>
                    <SelectItem value="KY">Kentucky</SelectItem>
                    <SelectItem value="LA">Louisiana</SelectItem>
                    <SelectItem value="ME">Maine</SelectItem>
                    <SelectItem value="MD">Maryland</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                    <SelectItem value="MN">Minnesota</SelectItem>
                    <SelectItem value="MS">Mississippi</SelectItem>
                    <SelectItem value="MO">Missouri</SelectItem>
                    <SelectItem value="MT">Montana</SelectItem>
                    <SelectItem value="NE">Nebraska (19+)</SelectItem>
                    <SelectItem value="NV">Nevada</SelectItem>
                    <SelectItem value="NH">New Hampshire</SelectItem>
                    <SelectItem value="NJ">New Jersey</SelectItem>
                    <SelectItem value="NM">New Mexico</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="ND">North Dakota</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="OK">Oklahoma</SelectItem>
                    <SelectItem value="OR">Oregon</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="RI">Rhode Island</SelectItem>
                    <SelectItem value="SC">South Carolina</SelectItem>
                    <SelectItem value="SD">South Dakota</SelectItem>
                    <SelectItem value="TN">Tennessee</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="UT">Utah</SelectItem>
                    <SelectItem value="VT">Vermont</SelectItem>
                    <SelectItem value="VA">Virginia</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="WV">West Virginia</SelectItem>
                    <SelectItem value="WI">Wisconsin</SelectItem>
                    <SelectItem value="WY">Wyoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium">Privacy Protection</span>
              </div>
              <p className="text-muted-foreground">
                Your personal information is protected and only used for age
                verification purposes. We do not store your date of birth after
                verification.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAgeVerification} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Age
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  (window.location.href = "https://www.google.com")
                }
                className="flex-1"
              >
                I'm Under 18
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComplianceBanner;
