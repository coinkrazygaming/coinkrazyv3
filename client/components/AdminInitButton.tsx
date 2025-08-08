import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function AdminInitButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, message?: string, error?: string} | null>(null);

  const initializeAdmin = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      // First seed the database
      const seedResponse = await fetch("/api/seed-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (seedResponse.ok) {
        const seedResult = await seedResponse.json();
        if (seedResult.success) {
          setResult({
            success: true,
            message: "✅ Database seeded and admin user created! Email: coinkrazy00@gmail.com | Password: Woot6969!"
          });
        } else {
          setResult({
            success: false,
            error: seedResult.error || "Failed to seed database"
          });
        }
      } else {
        // Fallback to just creating admin
        const adminResponse = await fetch("/api/init-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const adminResult = await adminResponse.json();
        setResult(adminResult);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {result && (
        <Alert className={result.success ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"}>
          {result.success ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
          <AlertDescription className={result.success ? "text-green-400" : "text-red-400"}>
            {result.success ? result.message : result.error}
          </AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={initializeAdmin}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Setting up admin...
          </>
        ) : (
          "🚀 Setup Admin & Database"
        )}
      </Button>
    </div>
  );
}
