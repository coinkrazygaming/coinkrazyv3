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
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoading && !hasRedirected.current) {
      // If not authenticated, redirect to login
      if (!user) {
        hasRedirected.current = true;
        navigate(redirectTo);
        return;
      }

      // Check role-based access
      if (requiredRole) {
        let hasAccess = false;

        switch (requiredRole) {
          case "admin":
            hasAccess = isAdmin;
            break;
          case "staff":
            hasAccess = isStaff;
            break;
          case "user":
            hasAccess = true; // All authenticated users can access user routes
            break;
        }

        if (!hasAccess) {
          // Redirect to appropriate dashboard based on user role
          hasRedirected.current = true;
          if (isAdmin) {
            navigate("/admin");
          } else if (isStaff) {
            navigate("/staff");
          } else {
            navigate("/dashboard");
          }
          return;
        }
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

  // If not authenticated, don't render children (will redirect)
  if (!user) {
    return null;
  }

  // If role is required and user doesn't have access, don't render children (will redirect)
  if (requiredRole) {
    let hasAccess = false;
    
    switch (requiredRole) {
      case "admin":
        hasAccess = isAdmin;
        break;
      case "staff":
        hasAccess = isStaff;
        break;
      case "user":
        hasAccess = true;
        break;
    }

    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}
