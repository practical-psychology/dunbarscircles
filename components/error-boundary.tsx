import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console and call optional error handler
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            retry={this.handleRetry}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          retry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred while loading this component.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-mono text-gray-700 break-all">
              {error.message}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={retry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              aria-label="Go to home page"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Specific error fallback for data loading errors
export function DataErrorFallback({
  error,
  retry,
  showSampleData,
}: {
  error: Error;
  retry: () => void;
  showSampleData?: () => void;
}) {
  const isAuthError =
    error.message.includes("Unauthorized") ||
    error.message.includes("authentication");
  const isNotFoundError =
    error.message.includes("not found") || error.message.includes("404");
  const isNetworkError =
    error.message.includes("network") || error.message.includes("fetch");

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-red-900">
              {isAuthError
                ? "Authentication Required"
                : isNotFoundError
                  ? "Data Not Found"
                  : isNetworkError
                    ? "Connection Error"
                    : "Data Loading Error"}
            </CardTitle>
            <CardDescription>
              {isAuthError
                ? "Please sign in to access your data"
                : isNotFoundError
                  ? "The requested data could not be found"
                  : isNetworkError
                    ? "Unable to connect to the database"
                    : "Failed to load your relationship data"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 rounded-md border border-red-200">
          <p className="text-sm text-red-700">{error.message}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={retry} size="sm" aria-label="Retry loading data">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>

          {showSampleData && (
            <Button
              onClick={showSampleData}
              variant="outline"
              size="sm"
              aria-label="Load sample data instead"
            >
              Use Sample Data
            </Button>
          )}

          {isAuthError && (
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              variant="outline"
              size="sm"
              aria-label="Go to sign in page"
            >
              Sign In
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error("Async error caught:", error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, clearError };
}
