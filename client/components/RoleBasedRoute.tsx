import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'user' | 'staff' | 'admin'>;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function RoleBasedRoute({
  children,
  allowedRoles = ['user', 'staff', 'admin'],
  requireAuth = true,
  redirectTo
}: RoleBasedRouteProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If auth is required but user is not logged in
    if (requireAuth && !user?.isLoggedIn) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // If user is logged in but doesn't have required role
    if (user?.isLoggedIn && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      const userRedirectPath = getUserDashboard(user.role);
      navigate(redirectTo || userRedirectPath, { replace: true });
      return;
    }
  }, [user, isLoading, allowedRoles, requireAuth, navigate, location, redirectTo]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gold-500" />
          <div className="text-lg font-medium">Loading...</div>
          <div className="text-sm text-muted-foreground">Checking authentication</div>
        </div>
      </div>
    );
  }

  // If auth is required but user is not logged in, don't render anything
  // (navigation will handle redirect)
  if (requireAuth && !user?.isLoggedIn) {
    return null;
  }

  // If user doesn't have required role, don't render anything
  // (navigation will handle redirect)
  if (user?.isLoggedIn && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

// Helper function to get user's appropriate dashboard
function getUserDashboard(role: 'user' | 'staff' | 'admin'): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'staff':
      return '/staff';
    default:
      return '/dashboard';
  }
}

// Higher-order component for specific role requirements
export function withRoleAuth(
  Component: React.ComponentType,
  allowedRoles: Array<'user' | 'staff' | 'admin'>
) {
  return function AuthenticatedComponent(props: any) {
    return (
      <RoleBasedRoute allowedRoles={allowedRoles}>
        <Component {...props} />
      </RoleBasedRoute>
    );
  };
}

// Specific role components
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['admin']}>
    {children}
  </RoleBasedRoute>
);

export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['staff', 'admin']}>
    {children}
  </RoleBasedRoute>
);

export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['user', 'staff', 'admin']}>
    {children}
  </RoleBasedRoute>
);
