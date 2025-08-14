import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Store() {
  const navigate = useNavigate();

  // Redirect to the new comprehensive Gold Coin Store
  useEffect(() => {
    navigate("/gold-store", { replace: true });
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Redirecting to Gold Coin Store...</p>
        {/* Cache buster: {Date.now()} */}
      </div>
    </div>
  );
}
