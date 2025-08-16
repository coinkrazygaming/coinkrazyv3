import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Settings,
  CreditCard,
  Receipt,
  Gift,
  GamepadIcon,
  MessageCircle,
  Users,
  LogOut,
  ChevronDown,
  Crown,
  Shield,
} from "lucide-react";

export default function MyAccountDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user?.isLoggedIn) {
    return (
      <Button
        onClick={() => navigate("/login")}
        variant="outline"
        className="border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
      >
        Login
      </Button>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case "admin":
        return <Shield className="w-3 h-3" />;
      case "staff":
        return <Crown className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case "admin":
        return (
          <Badge variant="destructive" className="text-xs">
            Admin
          </Badge>
        );
      case "staff":
        return (
          <Badge variant="secondary" className="text-xs">
            Staff
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-casino-blue/10"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            />
            <AvatarFallback className="bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">My Account</span>
              {getRoleBadge()}
            </div>
            <span className="text-xs text-muted-foreground">
              {user.username}
            </span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end">
        {/* User Info Header */}
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              />
              <AvatarFallback className="bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium flex items-center gap-2">
                {user.username}
                {getRoleIcon()}
              </div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge()}
                {user.kyc_status === "verified" && (
                  <Badge
                    variant="outline"
                    className="text-xs border-green-500 text-green-400"
                  >
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Balance Display */}
        <div className="px-2 py-2">
          <div className="text-xs text-muted-foreground mb-1">
            Current Balances
          </div>
          <div className="flex justify-between text-sm">
            <span>🪙 Gold Coins:</span>
            <span className="font-medium text-gold-400">
              {user.balances
                .find((b) => b.currency === "GC")
                ?.balance.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>👑 Sweeps Coins:</span>
            <span className="font-medium text-casino-blue">
              {user.balances
                .find((b) => b.currency === "SC")
                ?.balance.toLocaleString() || "0"}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Account Management */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleMenuClick("/profile")}>
            <User className="w-4 h-4 mr-2" />
            Profile Settings
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleMenuClick("/payment-settings")}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Settings
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleMenuClick("/transactions")}>
            <Receipt className="w-4 h-4 mr-2" />
            Transaction Records
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Gaming Features */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleMenuClick("/daily-rewards")}>
            <Gift className="w-4 h-4 mr-2" />
            Daily Rewards
            <Badge
              variant="outline"
              className="ml-auto text-xs border-gold-500 text-gold-400"
            >
              Available
            </Badge>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleMenuClick("/game-history")}>
            <GamepadIcon className="w-4 h-4 mr-2" />
            Game History
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Social & Communication */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleMenuClick("/chat")}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat Settings
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleMenuClick("/social")}>
            <Users className="w-4 h-4 mr-2" />
            Social
            <Badge variant="outline" className="ml-auto text-xs">
              New
            </Badge>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
