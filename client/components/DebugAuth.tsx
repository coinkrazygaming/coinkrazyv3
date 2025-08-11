import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuth() {
  const { user, login, logout, getBalance } = useAuth();

  const handleTestLogin = async () => {
    try {
      await login('user@coinkrazy.com', 'password');
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
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
        
        <div className="flex gap-2">
          {!user ? (
            <Button onClick={handleTestLogin}>
              Test Login
            </Button>
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
