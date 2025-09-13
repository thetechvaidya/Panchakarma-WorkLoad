import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentMounts: number;
  memoryUsage?: number;
  loadTime?: number;
}

interface UsePerformanceMonitorOptions {
  componentName?: string;
  logToConsole?: boolean;
  trackMemory?: boolean;
  debounceMs?: number;
}

export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions = {}) => {
  const {
    componentName = 'UnknownComponent',
    logToConsole = false,
    trackMemory = false,
    debounceMs = 100
  } = options;

  const renderStartTime = useRef<number | undefined>();
  const mountCount = useRef(0);
  const metrics = useRef<PerformanceMetrics>({
    renderTime: 0,
    componentMounts: 0
  });

  // Start performance timing
  const startTiming = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End performance timing
  const endTiming = useCallback(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      metrics.current.renderTime = renderTime;
      
      if (logToConsole) {
        console.log(`[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
    }
  }, [componentName, logToConsole]);

  // Get memory usage if supported
  const getMemoryUsage = useCallback(() => {
    if (trackMemory && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize / 1024 / 1024, // MB
        totalJSHeapSize: memory.totalJSHeapSize / 1024 / 1024, // MB
      };
    }
    return null;
  }, [trackMemory]);

  // Log performance metrics
  const logMetrics = useCallback(() => {
    const memory = getMemoryUsage();
    
    if (logToConsole) {
      console.log(`[Performance Metrics] ${componentName}:`, {
        ...metrics.current,
        memoryUsage: memory
      });
    }

    // Send to analytics service (could be Firebase Analytics, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        component_name: componentName,
        render_time: metrics.current.renderTime,
        mount_count: metrics.current.componentMounts,
        memory_used: memory?.usedJSHeapSize
      });
    }
  }, [componentName, logToConsole, getMemoryUsage]);

  // Debounced logging
  const debouncedLog = useCallback(
    debounce(logMetrics, debounceMs),
    [logMetrics, debounceMs]
  );

  // Track component lifecycle
  useEffect(() => {
    mountCount.current += 1;
    metrics.current.componentMounts = mountCount.current;

    if (logToConsole) {
      console.log(`[Performance] ${componentName} mounted (${mountCount.current} times)`);
    }

    // Log on unmount
    return () => {
      debouncedLog();
    };
  }, [componentName, logToConsole, debouncedLog]);

  // Performance timing hooks
  useEffect(() => {
    startTiming();
    return () => {
      endTiming();
    };
  });

  return {
    startTiming,
    endTiming,
    getMetrics: () => ({ ...metrics.current, memoryUsage: getMemoryUsage() }),
    logMetrics
  };
};

// Web Vitals monitoring
export const useWebVitals = (logToConsole = false) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry && logToConsole) {
          console.log('[Web Vitals] LCP:', lastEntry.startTime);
        }
        
        // Send to analytics
        if (lastEntry && window.gtag) {
          window.gtag('event', 'web_vital', {
            metric_name: 'LCP',
            metric_value: lastEntry.startTime,
            metric_rating: lastEntry.startTime > 2500 ? 'poor' : lastEntry.startTime > 1000 ? 'needs_improvement' : 'good'
          });
        }
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }
    };

    // First Input Delay
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            
            if (logToConsole) {
              console.log('[Web Vitals] FID:', fid);
            }
            
            if (window.gtag) {
              window.gtag('event', 'web_vital', {
                metric_name: 'FID',
                metric_value: fid,
                metric_rating: fid > 100 ? 'poor' : fid > 25 ? 'needs_improvement' : 'good'
              });
            }
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }
    };

    // Cumulative Layout Shift
    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        
        if (logToConsole) {
          console.log('[Web Vitals] CLS:', clsValue);
        }
        
        if (window.gtag) {
          window.gtag('event', 'web_vital', {
            metric_name: 'CLS',
            metric_value: clsValue,
            metric_rating: clsValue > 0.25 ? 'poor' : clsValue > 0.1 ? 'needs_improvement' : 'good'
          });
        }
      });
      
      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    };

    observeLCP();
    observeFID();
    observeCLS();
  }, [logToConsole]);
};

// Memory monitoring for mobile devices
export const useMemoryMonitor = (threshold = 50, interval = 30000) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      if (usedMB > threshold) {
        console.warn(`[Memory Warning] High memory usage: ${usedMB.toFixed(2)}MB`);
        
        // Trigger garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
        
        // Send warning to analytics
        if (window.gtag) {
          window.gtag('event', 'memory_warning', {
            memory_used: usedMB,
            memory_limit: memory.totalJSHeapSize / 1024 / 1024
          });
        }
      }
    };

    const intervalId = setInterval(checkMemory, interval);
    return () => clearInterval(intervalId);
  }, [threshold, interval]);
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
}

// Network monitoring
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = React.useState({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

      setNetworkStatus({
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0
      });
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};

// Import React for hooks
import React from 'react';

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    gc?: () => void;
  }
}