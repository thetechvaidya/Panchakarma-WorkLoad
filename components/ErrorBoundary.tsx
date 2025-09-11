import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';
import Card from './Card';

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

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Placeholder for external error logging
    console.log('Logging error to external service:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card 
            variant="elevated" 
            padding="lg" 
            className="max-w-2xl w-full"
            title="Something went wrong"
            icon="fa-exclamation-triangle"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    Error Details (Development Mode)
                  </summary>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong className="text-red-700">Error:</strong>
                      <pre className="mt-1 text-red-600 whitespace-pre-wrap break-words">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong className="text-red-700">Stack Trace:</strong>
                        <pre className="mt-1 text-red-600 text-xs whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong className="text-red-700">Component Stack:</strong>
                        <pre className="mt-1 text-red-600 text-xs whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleReset}
                  variant="primary"
                  icon="fa-redo"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleReload}
                  variant="secondary"
                  icon="fa-refresh"
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  If this problem persists, please contact support with the error details above.
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;