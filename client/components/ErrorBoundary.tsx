import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { productionService } from "@/services/productionService";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    // Log error to production service
    productionService.handleError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      retryCount: this.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Track error in analytics
    productionService.trackUserAction("error_boundary_triggered", {
      error: error.message,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack
        ?.split("\n")
        .slice(0, 5)
        .join("\n"), // First 5 lines
    });
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });

      productionService.trackUserAction("error_boundary_retry", {
        errorId: this.state.errorId,
        retryCount: this.retryCount,
      });
    }
  };

  handleReload = () => {
    productionService.trackUserAction("error_boundary_reload", {
      errorId: this.state.errorId,
      retryCount: this.retryCount,
    });
    window.location.reload();
  };

  handleGoHome = () => {
    productionService.trackUserAction("error_boundary_go_home", {
      errorId: this.state.errorId,
      retryCount: this.retryCount,
    });
    window.location.href = "/";
  };

  reportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      retryCount: this.retryCount,
    };

    // In production, this would send to error reporting service
    console.error("Error Report:", errorReport);

    productionService.trackUserAction("error_reported", {
      errorId,
      reportSize: JSON.stringify(errorReport).length,
    });

    // Show user confirmation
    alert(
      "Error report sent successfully. Our team will investigate this issue.",
    );
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId } = this.state;
      const isDevEnvironment = process.env.NODE_ENV === "development";
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Oops! Something went wrong
              </CardTitle>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Our team has been notified
                and is working on a fix.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error ID for support */}
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Error ID for support:
                </p>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {errorId}
                </code>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again ({this.maxRetries - this.retryCount} attempts
                    left)
                  </Button>
                )}

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {/* Report error button */}
              <div className="text-center">
                <Button
                  onClick={this.reportError}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Bug className="w-4 h-4" />
                  Report this error
                </Button>
              </div>

              {/* Development error details */}
              {isDevEnvironment && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Development Error Details
                  </summary>
                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-medium mb-1">Error Message:</h4>
                      <pre className="bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto text-red-700 dark:text-red-300">
                        {error.message}
                      </pre>
                    </div>

                    {error.stack && (
                      <div>
                        <h4 className="font-medium mb-1">Stack Trace:</h4>
                        <pre className="bg-muted p-2 rounded overflow-auto text-xs max-h-40">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {errorInfo?.componentStack && (
                      <div>
                        <h4 className="font-medium mb-1">Component Stack:</h4>
                        <pre className="bg-muted p-2 rounded overflow-auto text-xs max-h-40">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Support information */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Need immediate assistance? Contact our support team:
                </p>
                <p className="text-sm">
                  <a
                    href="mailto:support@coinkrazy.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@coinkrazy.com
                  </a>
                  {" | "}
                  <a
                    href="tel:+13194730416"
                    className="text-blue-600 hover:underline"
                  >
                    319-473-0416
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;
