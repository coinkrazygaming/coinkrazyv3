import { useState, useEffect } from 'react';
import { authService, User, AuthResponse, RegisterData } from '../services/authService';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVIP: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<AuthResponse>;
  requestPasswordReset: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResponse>;
  refreshUser: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authService.verifyEmail(token);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<AuthResponse> => {
    return authService.requestPasswordReset(email);
  };

  const resetPassword = async (token: string, newPassword: string): Promise<AuthResponse> => {
    return authService.resetPassword(token, newPassword);
  };

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  return {
    user,
    loading,
    isAuthenticated: authService.isAuthenticated(),
    isAdmin: authService.isAdmin(),
    isVIP: authService.isVIP(),
    login,
    register,
    logout,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    refreshUser
  };
};
