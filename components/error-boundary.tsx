"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Store error info in state
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Integrate with error logging service (Sentry, LogRocket, etc.)
      // For example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">
                Something went wrong
              </CardTitle>
              <CardDescription>
                {process.env.NODE_ENV === "development" ? (
                  <div className="mt-2 text-left">
                    <p className="font-mono text-sm text-red-600">
                      {this.state.error?.message}
                    </p>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">
                          Error details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                ) : (
                  <p className="mt-2">
                    We apologize for the inconvenience. Please try again or
                    contact support if the problem persists.
                  </p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              {process.env.NODE_ENV === "production" && (
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => {
                    // Report error action
                    window.location.href = `mailto:support@company.com?subject=Error Report&body=${encodeURIComponent(
                      `Error: ${this.state.error?.message}\n\nURL: ${window.location.href}\n\nTimestamp: ${new Date().toISOString()}`
                    )}`;
                  }}
                >
                  Report this issue
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

// Error fallback component for inline errors
export function ErrorFallback({
  error,
  resetError,
  message,
}: {
  error?: Error;
  resetError?: () => void;
  message?: string;
}) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              {message || "Something went wrong"}
            </h3>
            {error && process.env.NODE_ENV === "development" && (
              <p className="mt-1 text-xs text-red-600 font-mono">
                {error.message}
              </p>
            )}
            {resetError && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetError}
                className="mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Async error boundary for async operations
export function AsyncErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const handleError = useErrorHandler();

  React.useEffect(() => {
    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      handleError(new Error(event.reason));
    };

    window.addEventListener("unhandledrejection", handleRejection);
    return () =>
      window.removeEventListener("unhandledrejection", handleRejection);
  }, [handleError]);

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
