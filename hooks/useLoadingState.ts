import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number; // 0-100 for progress bars
}

export interface LoadingOptions {
  message?: string;
  timeout?: number; // Auto-clear loading after timeout (ms)
  minDuration?: number; // Minimum loading duration to prevent flashing
}

export const useLoadingState = (initialLoading: boolean = false) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialLoading
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minDurationRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTime = useRef<number | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (minDurationRef.current) {
        clearTimeout(minDurationRef.current);
      }
    };
  }, []);

  const startLoading = useCallback((options: LoadingOptions = {}) => {
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (minDurationRef.current) {
      clearTimeout(minDurationRef.current);
      minDurationRef.current = null;
    }

    loadingStartTime.current = Date.now();
    
    setLoadingState({
      isLoading: true,
      loadingMessage: options.message,
      progress: undefined
    });

    // Auto-clear loading after timeout if specified
    if (options.timeout) {
      timeoutRef.current = setTimeout(() => {
        stopLoading();
      }, options.timeout);
    }
  }, []);

  const stopLoading = useCallback((options: { minDuration?: number } = {}) => {
    const minDuration = options.minDuration || 0;
    const elapsed = loadingStartTime.current ? Date.now() - loadingStartTime.current : 0;
    const remainingTime = Math.max(0, minDuration - elapsed);

    const clearLoading = () => {
      setLoadingState({
        isLoading: false,
        loadingMessage: undefined,
        progress: undefined
      });
      loadingStartTime.current = null;
    };

    if (remainingTime > 0) {
      minDurationRef.current = setTimeout(clearLoading, remainingTime);
    } else {
      clearLoading();
    }

    // Clear timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      loadingMessage: message || prev.loadingMessage
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setLoadingState(prev => ({
      ...prev,
      loadingMessage: message
    }));
  }, []);

  // Wrapper for async operations with loading state
  const withLoading = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: LoadingOptions = {}
    ): Promise<T> => {
      startLoading(options);
      try {
        const result = await operation();
        stopLoading({ minDuration: options.minDuration });
        return result;
      } catch (error) {
        stopLoading({ minDuration: options.minDuration });
        throw error;
      }
    },
    [startLoading, stopLoading]
  );

  // Wrapper for operations with progress tracking
  const withProgress = useCallback(
    async <T>(
      operation: (updateProgress: (progress: number, message?: string) => void) => Promise<T>,
      options: LoadingOptions = {}
    ): Promise<T> => {
      startLoading({ ...options, message: options.message || 'Processing...' });
      try {
        const result = await operation(updateProgress);
        stopLoading({ minDuration: options.minDuration });
        return result;
      } catch (error) {
        stopLoading({ minDuration: options.minDuration });
        throw error;
      }
    },
    [startLoading, stopLoading, updateProgress]
  );

  return {
    ...loadingState,
    startLoading,
    stopLoading,
    updateProgress,
    updateMessage,
    withLoading,
    withProgress
  };
};

// Hook for managing multiple loading states
export const useMultipleLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});

  const startLoading = useCallback((key: string, options: LoadingOptions = {}) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        loadingMessage: options.message,
        progress: undefined
      }
    }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const updateProgress = useCallback((key: string, progress: number, message?: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress: Math.max(0, Math.min(100, progress)),
        loadingMessage: message || prev[key]?.loadingMessage
      }
    }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(state => state.isLoading);
  const getLoadingState = useCallback((key: string) => loadingStates[key] || { isLoading: false }, [loadingStates]);

  return {
    loadingStates,
    isAnyLoading,
    startLoading,
    stopLoading,
    updateProgress,
    getLoadingState
  };
};