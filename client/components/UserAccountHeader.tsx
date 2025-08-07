import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { User } from "../types/auth";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  User as UserIcon,
  Settings,
  LogOut,
  Shield,
  Coins,
  Crown,
} from "lucide-react";

const UserAccountHeader = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const currentUser = authService.getUserByToken(token);
        setUser(currentUser);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      authService.logout(token);
    }
    localStorage.removeItem("auth_token");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  if (loading) {
    return <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate("/login")}>
          Login
        </Button>
        <Button onClick={() => navigate("/register")}>Sign Up</Button>
      </div>
    );
  }

  const isAdmin = user.email === "coinkrazy00@gmail.com";

  return (
    <div className="flex items-center gap-4">
      {/* Balance Display */}
      <div className="hidden md:flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{user.gcBalance.toLocaleString()}</span>
          <span className="text-muted-foreground">GC</span>
        </div>
        <div className="flex items-center gap-1">
          <Crown className="h-4 w-4 text-purple-500" />
          <span className="font-medium">{user.scBalance.toFixed(2)}</span>
          <span className="text-muted-foreground">SC</span>
        </div>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user.username || user.email} />
              <AvatarFallback>
                {user.firstName?.[0]?.toUpperCase() ||
                  user.email[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.username || user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <div className="flex gap-2 mt-2">
                {isAdmin && (
                  <Badge variant="destructive" className="text-xs">
                    Admin
                  </Badge>
                )}
                {user.status === "active" && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Mobile Balance Display */}
          <div className="md:hidden px-2 py-1">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span>{user.gcBalance.toLocaleString()} GC</span>
              </div>
              <div className="flex items-center gap-1">
                <Crown className="h-4 w-4 text-purple-500" />
                <span>{user.scBalance.toFixed(2)} SC</span>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator className="md:hidden" />

          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>My Account</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>

          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserAccountHeader;
