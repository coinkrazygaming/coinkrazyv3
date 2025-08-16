import * as React from "react";
import { authService, AuthUser } from "@/services/authService";

interface AuthHook {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateBalance: (
    currency: "GC" | "SC",
    amount: number,
    type: "deposit" | "withdrawal" | "win" | "bet" | "bonus",
    description?: string,
    gameId?: string,
  ) => Promise<number>;
  getBalance: (currency: "GC" | "SC") => number;
  refreshUser: () => Promise<void>;
  getRedirectPath: () => string;
}

export function useAuth(): AuthHook {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial user from auth service
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((updatedUser) => {
      setUser(updatedUser);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const user = await authService.login(email, password);
      setUser(user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const user = await authService.register(email, username, password);
      setUser(user);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalance = async (
    currency: "GC" | "SC",
    amount: number,
    type: "deposit" | "withdrawal" | "win" | "bet" | "bonus",
    description?: string,
    gameId?: string,
  ): Promise<number> => {
    return await authService.updateBalance(
      currency,
      amount,
      type,
      description,
      gameId,
    );
  };

  const getBalance = (currency: "GC" | "SC"): number => {
    return authService.getBalance(currency);
  };

  const refreshUser = async (): Promise<void> => {
    await authService.refreshUser();
  };

  const getRedirectPath = (): string => {
    return authService.getRedirectPath();
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    updateBalance,
    getBalance,
    refreshUser,
    getRedirectPath,
  };
}
