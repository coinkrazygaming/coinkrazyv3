import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      // If user is already authenticated, redirect to appropriate dashboard
      if (isAdmin) {
        navigate("/admin");
      } else if (isStaff) {
        navigate("/staff");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, isLoading, isAdmin, isStaff]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-gold-500 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, don't render children (will redirect)
  if (user) {
    return null;
  }

  return <>{children}</>;
}
