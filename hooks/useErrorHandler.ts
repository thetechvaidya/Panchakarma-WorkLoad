import { useState, useCallback } from 'react';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

export interface ErrorState {
  error: AppError | null;
  isError: boolean;
  errorHistory: AppError[];
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorHistory: []
  });

  const logError = useCallback((error: Error | AppError | string, context?: string, details?: any) => {
    const baseError = typeof error === 'string' ? { message: error } : error;

    const appError: AppError = {
      message: baseError.message,
      code: ('code' in baseError && baseError.code) ? baseError.code : (baseError instanceof Error ? baseError.name : 'UNKNOWN_ERROR'),
      details: ('details' in baseError && baseError.details) ? baseError.details : details,
      timestamp: ('timestamp' in baseError && (baseError.timestamp instanceof Date || typeof baseError.timestamp === 'string')) ? new Date(baseError.timestamp) : new Date(),
      context: ('context' in baseError && baseError.context) ? baseError.context : context
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', appError);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

    // Update error state
    setErrorState(prev => ({
      error: appError,
      isError: true,
      errorHistory: [appError, ...prev.errorHistory.slice(0, 9)] // Keep last 10 errors
    }));

    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      // TODO: Send to external error tracking service
      console.log('Would send to error tracking service:', appError);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      error: null,
      isError: false
    }));
  }, []);

  const clearErrorHistory = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      errorHistory: []
    }));
  }, []);

  // Wrapper for async operations with error handling
  const withErrorHandling = useCallback(
    async <T>(operation: () => Promise<T>, context?: string): Promise<T | null> => {
      try {
        return await operation();
      } catch (error) {
        logError(error as Error, context);
        return null;
      }
    },
    [logError]
  );

  // Wrapper for sync operations with error handling
  const withSyncErrorHandling = useCallback(
    <T>(operation: () => T, context?: string): T | null => {
      try {
        return operation();
      } catch (error) {
        logError(error as Error, context);
        return null;
      }
    },
    [logError]
  );

  return {
    ...errorState,
    logError,
    clearError,
    clearErrorHistory,
    withErrorHandling,
    withSyncErrorHandling
  };
};

// Utility functions for common error scenarios
export const createNetworkError = (message: string = 'Network request failed'): AppError => ({
  message,
  code: 'NETWORK_ERROR',
  timestamp: new Date(),
  context: 'Network'
});

export const createValidationError = (message: string, field?: string): AppError => ({
  message,
  code: 'VALIDATION_ERROR',
  details: { field },
  timestamp: new Date(),
  context: 'Validation'
});

export const createDatabaseError = (message: string = 'Database operation failed'): AppError => ({
  message,
  code: 'DATABASE_ERROR',
  timestamp: new Date(),
  context: 'Database'
});

export const createDistributionError = (message: string = 'Distribution algorithm failed'): AppError => ({
  message,
  code: 'DISTRIBUTION_ERROR',
  timestamp: new Date(),
  context: 'Distribution'
});