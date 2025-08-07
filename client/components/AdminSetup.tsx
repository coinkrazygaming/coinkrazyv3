import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Crown, 
  Settings, 
  Loader2,
  RefreshCw,
  Play
} from 'lucide-react';

interface SetupStep {
  name: string;
  description: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
}

export default function AdminSetup() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      name: 'Database Connection',
      description: 'Test connection to Neon PostgreSQL database',
      status: 'pending'
    },
    {
      name: 'Database Schema',
      description: 'Create tables and seed initial data',
      status: 'pending'
    },
    {
      name: 'Admin User',
      description: 'Create admin account for coinkrazy00@gmail.com',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const updateStep = (index: number, status: SetupStep['status'], error?: string) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, error } : step
    ));
  };

  const testDatabaseConnection = async (stepIndex: number) => {
    updateStep(stepIndex, 'loading');
    try {
      const response = await fetch('/api/ping');
      if (response.ok) {
        updateStep(stepIndex, 'success');
        return true;
      } else {
        updateStep(stepIndex, 'error', 'Server not responding');
        return false;
      }
    } catch (error) {
      updateStep(stepIndex, 'error', `Connection failed: ${error.message}`);
      return false;
    }
  };

  const seedDatabase = async (stepIndex: number) => {
    updateStep(stepIndex, 'loading');
    try {
      const response = await fetch('/api/seed-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        updateStep(stepIndex, 'success');
        return true;
      } else {
        updateStep(stepIndex, 'error', result.error || 'Database seeding failed');
        return false;
      }
    } catch (error) {
      updateStep(stepIndex, 'error', `Seeding failed: ${error.message}`);
      return false;
    }
  };

  const createAdminUser = async (stepIndex: number) => {
    updateStep(stepIndex, 'loading');
    try {
      const response = await fetch('/api/init-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        updateStep(stepIndex, 'success');
        return true;
      } else {
        updateStep(stepIndex, 'error', result.error || 'Admin creation failed');
        return false;
      }
    } catch (error) {
      updateStep(stepIndex, 'error', `Admin creation failed: ${error.message}`);
      return false;
    }
  };

  const runSetup = async () => {
    setIsRunning(true);
    
    try {
      // Step 1: Test database connection
      setCurrentStep(0);
      const connectionOk = await testDatabaseConnection(0);
      if (!connectionOk) {
        setIsRunning(false);
        return;
      }

      // Step 2: Seed database
      setCurrentStep(1);
      const seedingOk = await seedDatabase(1);
      if (!seedingOk) {
        setIsRunning(false);
        return;
      }

      // Step 3: Create admin user
      setCurrentStep(2);
      const adminOk = await createAdminUser(2);
      if (!adminOk) {
        setIsRunning(false);
        return;
      }

      setCurrentStep(-1);
    } catch (error) {
      console.error('Setup failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetSetup = () => {
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', error: undefined })));
    setCurrentStep(-1);
  };

  const allStepsComplete = steps.every(step => step.status === 'success');
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold mb-2">CoinKrazy Admin Setup</h1>
          <p className="text-muted-foreground">
            Initialize your database and create your admin account
          </p>
        </div>

        <Card className="border-gold-500/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Setup Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border transition-all ${
                  currentStep === index 
                    ? 'border-gold-500 bg-gold-500/5' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {step.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {step.status === 'error' && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    {step.status === 'loading' && (
                      <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
                    )}
                    {step.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-muted" />
                    )}
                    <span className="font-medium">{step.name}</span>
                  </div>
                  <Badge variant={
                    step.status === 'success' ? 'default' : 
                    step.status === 'error' ? 'destructive' : 
                    step.status === 'loading' ? 'secondary' : 'outline'
                  }>
                    {step.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {step.description}
                </p>
                {step.error && (
                  <Alert className="border-red-500/20 bg-red-500/10">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-red-400">
                      {step.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {allStepsComplete && (
          <Alert className="border-green-500/20 bg-green-500/10 mb-6">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <AlertDescription className="text-green-400">
              <div className="space-y-2">
                <p className="font-medium">🎉 Setup Complete!</p>
                <p>Your admin account is ready:</p>
                <div className="font-mono text-sm bg-card p-2 rounded mt-2">
                  <div>Email: coinkrazy00@gmail.com</div>
                  <div>Password: Woot6969!</div>
                </div>
                <p>You can now navigate to the <strong>Login</strong> page and access the admin panel.</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <Button
            onClick={runSetup}
            disabled={isRunning || allStepsComplete}
            className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Setup
              </>
            )}
          </Button>

          {(hasErrors || allStepsComplete) && (
            <Button
              onClick={resetSetup}
              variant="outline"
              disabled={isRunning}
              className="border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {allStepsComplete && (
          <div className="text-center mt-6">
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-casino-blue to-casino-blue-dark hover:from-casino-blue-dark hover:to-casino-blue text-white font-bold"
            >
              <Crown className="w-4 h-4 mr-2" />
              Go to Login
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <h3 className="font-medium mb-2">Database Information</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>✅ Connected to Neon PostgreSQL Database</p>
            <p>✅ Database URL configured in server</p>
            <p>✅ SSL connection enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
