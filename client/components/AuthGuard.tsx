import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { User } from "../types/auth";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
  showAlert?: boolean;
}

const AuthGuard = ({
  children,
  requireAdmin = false,
  fallbackPath = "/login",
  showAlert = true,
}: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setLoading(false);
          return;
        }

        const currentUser = authService.getUserByToken(token);
        if (!currentUser) {
          localStorage.removeItem("auth_token");
          setLoading(false);
          return;
        }

        if (currentUser.status !== "active") {
          setError(
            "Account is not active. Please verify your email or contact support.",
          );
          setLoading(false);
          return;
        }

        if (requireAdmin && currentUser.email !== "coinkrazy00@gmail.com") {
          setError("Admin access required.");
          setLoading(false);
          return;
        }

        setUser(currentUser);
        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Authentication error occurred.");
        setLoading(false);
      }
    };

    checkAuth();
  }, [requireAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  if (error) {
    if (!showAlert) {
      navigate(fallbackPath, { state: { from: location.pathname } });
      return null;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={() => navigate(fallbackPath)}>
            {requireAdmin ? "Go to Login" : "Login Required"}
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    if (!showAlert) {
      navigate(fallbackPath, { state: { from: location.pathname } });
      return null;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            Please log in to access this content.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button
            onClick={() =>
              navigate(fallbackPath, { state: { from: location.pathname } })
            }
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
