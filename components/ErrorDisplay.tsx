import React from 'react';
import Button from './Button';
import Card from './Card';
import { AppError } from '../hooks/useErrorHandler';

interface ErrorDisplayProps {
  error: AppError | Error | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'modal' | 'toast';
  showDetails?: boolean;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  variant = 'inline',
  showDetails = false,
  className = ''
}) => {
  if (!error) return null;

  // Normalize error to AppError format
  const normalizedError: AppError = {
    message: typeof error === 'string' ? error : error.message,
    code: error instanceof Error ? error.name : (error as AppError).code,
    details: (error as AppError).details,
    timestamp: (error as AppError).timestamp || new Date(),
    context: (error as AppError).context
  };

  const getErrorIcon = (code?: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'fa-wifi';
      case 'VALIDATION_ERROR':
        return 'fa-exclamation-circle';
      case 'DATABASE_ERROR':
        return 'fa-database';
      case 'DISTRIBUTION_ERROR':
        return 'fa-cogs';
      default:
        return 'fa-exclamation-triangle';
    }
  };

  const getErrorColor = (code?: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'text-orange-600';
      case 'VALIDATION_ERROR':
        return 'text-yellow-600';
      case 'DATABASE_ERROR':
        return 'text-purple-600';
      case 'DISTRIBUTION_ERROR':
        return 'text-blue-600';
      default:
        return 'text-red-600';
    }
  };

  const getBgColor = (code?: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'bg-orange-50 border-orange-200';
      case 'VALIDATION_ERROR':
        return 'bg-yellow-50 border-yellow-200';
      case 'DATABASE_ERROR':
        return 'bg-purple-50 border-purple-200';
      case 'DISTRIBUTION_ERROR':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (variant === 'toast') {
    return (
      <div className={`fixed top-4 right-4 z-50 max-w-md ${className}`}>
        <div className={`rounded-lg border p-4 shadow-lg ${getBgColor(normalizedError.code)}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className={`fas ${getErrorIcon(normalizedError.code)} ${getErrorColor(normalizedError.code)}`} />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {normalizedError.message}
              </p>
              {normalizedError.context && (
                <p className="mt-1 text-xs text-gray-500">
                  Context: {normalizedError.context}
                </p>
              )}
            </div>
            {onDismiss && (
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={onDismiss}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            )}
          </div>
          {onRetry && (
            <div className="mt-3">
              <Button
                onClick={onRetry}
                variant="secondary"
                size="sm"
                icon="fa-redo"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${getBgColor(normalizedError.code)}`}>
                  <i className={`fas ${getErrorIcon(normalizedError.code)} ${getErrorColor(normalizedError.code)}`} />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Error Occurred
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {normalizedError.message}
                    </p>
                    {normalizedError.context && (
                      <p className="mt-1 text-xs text-gray-400">
                        Context: {normalizedError.context}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="primary"
                  className="mb-2 sm:mb-0 sm:ml-3"
                  icon="fa-redo"
                >
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  variant="secondary"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <Card 
      variant="outlined" 
      className={`${getBgColor(normalizedError.code)} ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className={`fas ${getErrorIcon(normalizedError.code)} ${getErrorColor(normalizedError.code)} text-lg`} />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              {normalizedError.code ? normalizedError.code.replace(/_/g, ' ') : 'Error'}
            </h4>
            <span className="text-xs text-gray-500">
              {formatTimestamp(normalizedError.timestamp)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-700">
            {normalizedError.message}
          </p>
          {normalizedError.context && (
            <p className="mt-1 text-xs text-gray-500">
              Context: {normalizedError.context}
            </p>
          )}
          
          {showDetails && normalizedError.details && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                Show Details
              </summary>
              <pre className="mt-1 text-xs text-gray-600 whitespace-pre-wrap break-words">
                {JSON.stringify(normalizedError.details, null, 2)}
              </pre>
            </details>
          )}
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="secondary"
                  size="sm"
                  icon="fa-redo"
                >
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  variant="ghost"
                  size="sm"
                  icon="fa-times"
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ErrorDisplay;