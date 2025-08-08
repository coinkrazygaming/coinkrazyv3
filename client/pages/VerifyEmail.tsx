import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle,
  AlertTriangle,
  Mail,
  Loader2,
  Crown,
  Coins,
} from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setStatus("error");
        setMessage(
          "Invalid verification link. Please check your email for a valid verification link.",
        );
        return;
      }

      try {
        const response = await verifyEmail(token);

        if (response.success) {
          setStatus("success");
          setMessage(response.message || "Email verified successfully!");

          // Redirect to login page after a delay
          setTimeout(() => {
            navigate("/login?verified=true");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(
            response.message ||
              "Email verification failed. The link may be invalid or expired.",
          );
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          "An unexpected error occurred during verification. Please try again or contact support.",
        );
        console.error("Email verification error:", error);
      }
    };

    handleVerification();
  }, [token, verifyEmail, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto border-gold-500/20">
          <CardHeader className="text-center">
            {status === "loading" && (
              <div className="w-16 h-16 bg-gradient-to-r from-casino-blue to-casino-blue-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}

            {status === "success" && (
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            )}

            {status === "error" && (
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            )}

            <CardTitle className="text-2xl">
              {status === "loading" && "Verifying Your Email..."}
              {status === "success" && "Email Verified Successfully!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === "loading" && (
              <div className="text-center">
                <p className="text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-6">
                <Alert className="border-green-500/20 bg-green-500/10">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <AlertDescription className="text-green-400">
                    {message}
                  </AlertDescription>
                </Alert>

                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">
                    Welcome Bonus Added!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Your welcome bonus has been credited to your account:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-card rounded-lg border border-gold-500/20">
                      <Coins className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gold-500">10</div>
                      <div className="text-sm text-muted-foreground">
                        Gold Coins
                      </div>
                    </div>
                    <div className="text-center p-4 bg-card rounded-lg border border-casino-blue/20">
                      <Crown className="w-8 h-8 text-casino-blue mx-auto mb-2" />
                      <div className="text-2xl font-bold text-casino-blue">
                        10
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sweeps Coins
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    You will be redirected to the login page in a few seconds...
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-6">
                <Alert className="border-red-500/20 bg-red-500/10">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <AlertDescription className="text-red-400">
                    {message}
                  </AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    If you continue to experience issues, please contact our
                    support team.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/login">
                      <Button variant="outline" className="w-full sm:w-auto">
                        Back to Login
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
                        Register Again
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <Link to="/login">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                  >
                    Continue to Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Information */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need help? Contact support at{" "}
            <a
              href="mailto:coinkrazy00@gmail.com"
              className="text-gold-400 hover:text-gold-300"
            >
              coinkrazy00@gmail.com
            </a>{" "}
            or{" "}
            <a
              href="tel:319-473-0416"
              className="text-gold-400 hover:text-gold-300"
            >
              319-473-0416
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
