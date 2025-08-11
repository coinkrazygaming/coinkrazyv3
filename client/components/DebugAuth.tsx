import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuth() {
  const { user, login, logout, getBalance } = useAuth();

  const handleTestLogin = async (userType: 'user' | 'staff' | 'admin' = 'user') => {
    const emails = {
      user: 'user@coinkrazy.com',
      staff: 'staff@coinkrazy.com',
      admin: 'admin@coinkrazy.com'
    };

    try {
      await login(emails[userType], 'password');
      console.log(`${userType} login successful!`);
    } catch (error) {
      console.error(`${userType} login failed:`, error);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>🐛 Auth Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Status:</strong> {user ? 'Logged In' : 'Not Logged In'}
        </div>
        
        {user && (
          <div className="space-y-2">
            <div><strong>User:</strong> {user.username}</div>
            <div><strong>Role:</strong> {user.role}</div>
            <div><strong>GC Balance:</strong> {getBalance('GC').toLocaleString()}</div>
            <div><strong>SC Balance:</strong> {getBalance('SC')}</div>
          </div>
        )}
        
        <div className="flex gap-2 flex-wrap">
          {!user ? (
            <>
              <Button onClick={() => handleTestLogin('user')} size="sm">
                User Login
              </Button>
              <Button onClick={() => handleTestLogin('staff')} size="sm" variant="outline">
                Staff Login
              </Button>
              <Button onClick={() => handleTestLogin('admin')} size="sm" variant="secondary">
                Admin Login
              </Button>
            </>
          ) : (
            <Button onClick={logout} variant="destructive">
              Logout
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
