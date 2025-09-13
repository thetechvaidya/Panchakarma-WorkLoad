import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load heavy components for better performance
const LazyAnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
const LazyIntelligentInsights = lazy(() => import('./IntelligentInsights'));
const LazyHistoricalDataViewer = lazy(() => import('./HistoricalDataViewer'));
const LazyWeeklyAnalysisModal = lazy(() => import('./WeeklyAnalysisModal'));
const LazyExportModal = lazy(() => import('./ExportModal'));

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({ 
  children, 
  fallback,
  delay = 200 
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="lg" className="text-teal-600" />
    </div>
  );

  // Add a small delay to prevent flash of loading state for fast connections
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Suspense fallback={showFallback ? (fallback || defaultFallback) : null}>
      {children}
    </Suspense>
  );
};

// Export lazy components with wrappers
export const AnalyticsDashboard: React.FC<any> = (props) => (
  <LazyComponentWrapper>
    <LazyAnalyticsDashboard {...props} />
  </LazyComponentWrapper>
);

export const IntelligentInsights: React.FC<any> = (props) => (
  <LazyComponentWrapper>
    <LazyIntelligentInsights {...props} />
  </LazyComponentWrapper>
);

export const HistoricalDataViewer: React.FC<any> = (props) => (
  <LazyComponentWrapper>
    <LazyHistoricalDataViewer {...props} />
  </LazyComponentWrapper>
);

export const WeeklyAnalysisModal: React.FC<any> = (props) => (
  <LazyComponentWrapper>
    <LazyWeeklyAnalysisModal {...props} />
  </LazyComponentWrapper>
);

export const ExportModal: React.FC<any> = (props) => (
  <LazyComponentWrapper>
    <LazyExportModal {...props} />
  </LazyComponentWrapper>
);

export default LazyComponentWrapper;