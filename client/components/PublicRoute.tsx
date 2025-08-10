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

  // Handle redirects only once when auth state changes
  useEffect(() => {
    if (isLoading) return; // Don't do anything while loading

    if (user) {
      // If user is already authenticated, redirect to appropriate dashboard
      const targetRoute = isAdmin ? "/admin" : isStaff ? "/staff" : "/dashboard";
      navigate(targetRoute, { replace: true });
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

  // If authenticated, don't render children (redirect will happen)
  if (user) {
    return null;
  }

  // Render children if user is not authenticated
  return <>{children}</>;
}
