import { Navigate } from "react-router-dom";
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

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If role is required, check access
  if (requiredRole) {
    const hasAccess = 
      requiredRole === "admin" ? isAdmin :
      requiredRole === "staff" ? isStaff :
      true; // "user" role - all authenticated users have access

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on user's actual role
      const targetRoute = isAdmin ? "/admin" : isStaff ? "/staff" : "/dashboard";
      return <Navigate to={targetRoute} replace />;
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
}
