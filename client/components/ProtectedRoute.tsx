import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "staff" | "user";
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = "/login"
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();

  // Handle redirects only once when auth state changes
  useEffect(() => {
    if (isLoading) return; // Don't do anything while loading

    if (!user) {
      navigate(redirectTo, { replace: true });
      return;
    }

    if (requiredRole) {
      const hasAccess = 
        requiredRole === "admin" ? isAdmin :
        requiredRole === "staff" ? isStaff :
        true; // "user" role - all authenticated users have access

      if (!hasAccess) {
        // Redirect based on actual user role
        const targetRoute = isAdmin ? "/admin" : isStaff ? "/staff" : "/dashboard";
        navigate(targetRoute, { replace: true });
      }
    }
  }, [user, isLoading, isAdmin, isStaff, requiredRole]);

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

  // If not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // If role is required, check access
  if (requiredRole) {
    const hasAccess = 
      requiredRole === "admin" ? isAdmin :
      requiredRole === "staff" ? isStaff :
      true; // "user" role

    if (!hasAccess) {
      return null; // Don't render anything (redirect will happen)
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
}
