import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Loader2, Shield } from "lucide-react";
import { seedService } from "@/services/seedService";

export default function AdminSetup() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const response = await seedService.seedDatabase();
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleInitAdmin = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const response = await fetch("/api/init-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to initialize admin",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gold-500/20">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <CardTitle>Admin Setup</CardTitle>
          <p className="text-muted-foreground text-sm">
            Initialize the database and create admin user
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {result && (
            <Alert
              className={
                result.success
                  ? "border-green-500/20 bg-green-500/10"
                  : "border-red-500/20 bg-red-500/10"
              }
            >
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              <AlertDescription
                className={result.success ? "text-green-400" : "text-red-400"}
              >
                {result.success ? result.message : result.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                "Seed Full Database"
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">OR</div>

            <Button
              onClick={handleInitAdmin}
              disabled={isSeeding}
              variant="outline"
              className="w-full"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                "Create Admin Only"
              )}
            </Button>
          </div>

          <div className="bg-muted/20 rounded-lg p-3 border border-border/50 text-sm">
            <div className="font-medium mb-1">Admin Credentials:</div>
            <div className="text-muted-foreground text-xs space-y-1">
              <div>Email: coinkrazy00@gmail.com</div>
              <div>Password: Woot6969!</div>
            </div>
          </div>

          {result?.success && (
            <div className="text-center">
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <a href="/login">Go to Login</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
