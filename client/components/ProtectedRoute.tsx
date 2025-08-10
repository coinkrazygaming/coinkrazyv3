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
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
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
    const userRole = user.role;

    if (requiredRole === "admin" && userRole !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    if (requiredRole === "staff" && userRole !== "staff") {
      return <Navigate to="/dashboard" replace />;
    }

    // "user" role allows all authenticated users
  }

  // Render children if all checks pass
  return <>{children}</>;
}
