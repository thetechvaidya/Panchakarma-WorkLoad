import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { Scholar, Patient, Assignment } from './types';
import { INITIAL_SCHOLARS } from './constants';
import { distributeWorkload } from './services/distributionService';
import { generateExportText } from './services/exportService';
import { getLatestAssignmentsForContinuity, saveDailyData, getDailyData } from './services/historyService';

// Core Components
import Header from './components/Header';
import ScholarSetup from './components/ScholarSetup';
import ResultsDisplay from './components/ResultsDisplay';
import WorkloadSummary from './components/WorkloadSummary';
import ProcedureGradeTable from './components/ProcedureGradeTable';
import PatientInput from './components/PatientInput';
import DateNavigator from './components/DateNavigator';
import RulesDisplay from './components/RulesDisplay';
import Button from './components/Button';
import Card from './components/Card';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorDisplay from './components/ErrorDisplay';

// Mobile Components
import MobileNavigation from './components/MobileNavigation';
import FloatingActionButton from './components/FloatingActionButton';
import MobileViewContainer from './components/MobileViewContainer';
import ResponsiveTest from './components/ResponsiveTest';

// Lazy Components
import {
  AnalyticsDashboard,
  IntelligentInsights,
  HistoricalDataViewer,
  WeeklyAnalysisModal,
  ExportModal
} from './components/LazyComponents';

// Hooks
import { useErrorHandler } from './hooks/useErrorHandler';
import { useLoadingState } from './hooks/useLoadingState';
import { useHapticFeedback, useDeviceCapabilities, usePullToRefresh } from './hooks/useMobileInteractions';
import { usePerformanceMonitor, useWebVitals, useMemoryMonitor } from './hooks/usePerformanceMonitor';

const getISODateString = (date: Date): string => date.toISOString().split('T')[0] || '';

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

const App: React.FC = () => {
  // Performance monitoring
  usePerformanceMonitor({ componentName: 'App', logToConsole: import.meta.env.DEV });
  useWebVitals(import.meta.env.DEV);
  useMemoryMonitor(75, 60000); // Alert if memory usage > 75MB, check every minute

  // Core state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scholars, setScholars] = useState<Scholar[]>(INITIAL_SCHOLARS);
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  
  // UI state
  const [currentView, setCurrentView] = useState('patients');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isExportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showInsights, setShowInsights] = useState<boolean>(false);
  const [historicalViewerOpen, setHistoricalViewerOpen] = useState<boolean>(false);
  const [exportText, setExportText] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Hooks
  const { error, isError, logError, clearError, withErrorHandling } = useErrorHandler();
  const { isLoading, startLoading, stopLoading } = useLoadingState(true);
  const [isDistributing, setIsDistributing] = useState<boolean>(false);
  const { triggerHaptic } = useHapticFeedback();
  const deviceCapabilities = useDeviceCapabilities();

  const isToday = useMemo(() => isSameDay(selectedDate, new Date()), [selectedDate]);
  const isMobile = useMemo(() => window.innerWidth < 768, []);

  // Pull to refresh
  const { isRefreshing, pullProgress } = usePullToRefresh(
    async () => {
      if (isToday) {
        triggerHaptic();
        await loadDataForDate();
      }
    }
  );

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerHaptic();
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerHaptic();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerHaptic]);

  // Data loading
  const loadDataForDate = useCallback(async () => {
    startLoading();
    setShowResults(false);
    
    setPatients([]);
    setScholars(INITIAL_SCHOLARS);
    setAssignments(new Map());
    
    await withErrorHandling(async () => {
      const dataPromise = getDailyData(selectedDate);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Load timeout')), 8000)
      );
      
      const data = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      if (data) {
        setPatients(data.patients || []);
        setScholars(data.scholars || INITIAL_SCHOLARS);
        const assignmentMap = new Map<string, Assignment>();
        if (data.assignments && data.assignments.length > 0) {
          data.assignments.forEach((a: Assignment) => assignmentMap.set(a.scholar.id, a));
          setShowResults(true);
        }
        setAssignments(assignmentMap);
      }
      return true;
    }, 'Loading data for selected date');
    
    stopLoading();
  }, [selectedDate, startLoading, stopLoading, withErrorHandling]);

  useEffect(() => {
    loadDataForDate();
  }, [loadDataForDate]);

  // Patient management
  const handleAddPatient = useCallback(async (patientData: Omit<Patient, 'id' | 'isAttendant'>) => {
    if (!isToday) return;
    
    triggerHaptic();
    const newPatient: Patient = {
      ...patientData,
      id: `patient-${patientData.name.trim().replace(/\s/g, '')}-${Date.now()}`,
      isAttendant: false,
    };
    
    const updatedPatients = [...patients, newPatient];
    setPatients(updatedPatients);
    
    await withErrorHandling(async () => {
      await saveDailyData({ date: getISODateString(selectedDate), patients: updatedPatients, scholars });
    }, 'Adding new patient');
  }, [patients, scholars, selectedDate, isToday, triggerHaptic, withErrorHandling]);

  const handleDeletePatient = useCallback(async (patientId: string) => {
    if (!isToday) return;
    
    triggerHaptic();
    const updatedPatients = patients.filter(p => p.id !== patientId);
    setPatients(updatedPatients);
    
    await withErrorHandling(async () => {
      await saveDailyData({ date: getISODateString(selectedDate), patients: updatedPatients, scholars });
    }, 'Deleting patient');
  }, [patients, scholars, selectedDate, isToday, triggerHaptic, withErrorHandling]);

  const handleUpdatePatient = useCallback(async (patientId: string, updatedData: Partial<Patient>) => {
    if (!isToday) return;
    
    triggerHaptic();
    const updatedPatients = patients.map(p => 
      p.id === patientId ? { ...p, ...updatedData } : p
    );
    setPatients(updatedPatients);
    
    await withErrorHandling(async () => {
      await saveDailyData({ date: getISODateString(selectedDate), patients: updatedPatients, scholars });
    }, 'Updating patient procedures');
  }, [patients, scholars, selectedDate, isToday, triggerHaptic, withErrorHandling]);
  
  // Scholar management
  const handleToggleScholarStatus = useCallback(async (scholarId: string) => {
    if (!isToday) return;
    
    triggerHaptic();
    const updatedScholars = scholars.map(scholar => 
      scholar.id === scholarId ? { ...scholar, isPosted: !scholar.isPosted } : scholar
    );
    setScholars(updatedScholars);
    
    await withErrorHandling(async () => {
      await saveDailyData({ date: getISODateString(selectedDate), scholars: updatedScholars, patients });
    }, 'Updating scholar status');
  }, [scholars, patients, selectedDate, isToday, triggerHaptic, withErrorHandling]);

  // Workload distribution
  const handleDistribute = useCallback(async () => {
    if (patients.length === 0 || !isToday) {
      logError('Please add at least one patient on the current day before distributing.', 'VALIDATION_ERROR', 'Distribution validation');
      return;
    }
    
    setIsDistributing(true);
    triggerHaptic();
    
    const result = await withErrorHandling(async () => {
      const previousAssignments = await getLatestAssignmentsForContinuity();
      const newAssignments = distributeWorkload(patients, scholars, previousAssignments);
      setAssignments(newAssignments);

      const assignmentsArray = Array.from(newAssignments.values());
      await saveDailyData({ date: getISODateString(selectedDate), assignments: assignmentsArray, patients, scholars });
      setShowResults(true);
      
      return newAssignments;
    }, 'Workload distribution');
    
    if (!result) {
      logError('An error occurred during distribution or saving. Please try again.', 'DISTRIBUTION_ERROR', 'Workload distribution');
    } else {
      triggerHaptic();
    }
    
    setIsDistributing(false);
  }, [patients, scholars, selectedDate, isToday, logError, withErrorHandling, triggerHaptic]);
  
  // Export functionality
  const handleExport = useCallback(() => {
    const text = generateExportText(assignments);
    setExportText(text);
    setExportModalOpen(true);
    triggerHaptic();
  }, [assignments, triggerHaptic]);

  // Floating Action Button actions
  const handleQuickDistribute = useCallback(() => {
    setCurrentView('distribute');
    handleDistribute();
  }, [handleDistribute]);

  const handleQuickAddPatient = useCallback(() => {
    setCurrentView('patients');
  }, []);

  const handleShowAnalytics = useCallback(() => {
    setCurrentView('analytics');
    setShowAnalytics(true);
  }, []);

  // Render based on device type
  if (isMobile) {
    return (
      <ResponsiveTest>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            {/* Pull to refresh indicator */}
            {isRefreshing && (
              <div className="fixed top-0 left-0 right-0 bg-teal-600 text-white text-center py-2 z-50">
                <i className="fas fa-sync-alt fa-spin mr-2"></i>
                Refreshing...
              </div>
            )}
            
            {pullProgress > 0 && !isRefreshing && (
              <div 
                className="fixed top-0 left-0 right-0 bg-teal-600 z-50 transition-all duration-200"
                style={{ height: `${pullProgress * 4}px` }}
              />
            )}

            <MobileViewContainer
              title="Panchkarma WLD"
              subtitle={selectedDate.toLocaleDateString()}
            >
              {/* Global Error Display */}
              {isError && (
                <div className="mb-4">
                  <ErrorDisplay 
                    error={error}
                    onDismiss={clearError}
                    variant="inline"
                  />
                </div>
              )}

              {/* Connection Status */}
              <Card variant="outlined" className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  {deviceCapabilities.isStandalone && (
                    <span className="text-xs text-green-600 font-medium">PWA Mode</span>
                  )}
                </div>
              </Card>

              <DateNavigator 
                selectedDate={selectedDate} 
                onDateChange={setSelectedDate} 
                isLoading={isLoading} 
              />

              {/* Mobile Content */}
              {currentView === 'patients' && (
                <PatientInput 
                  patients={patients} 
                  onAddPatient={handleAddPatient} 
                  onDeletePatient={handleDeletePatient}
                  onUpdatePatient={handleUpdatePatient}
                  disabled={!isToday} 
                />
              )}

              {currentView === 'distribute' && (
                <Card title="Smart Distribution" icon="brain" variant="elevated">
                  <div className="space-y-4">
                    <Button
                      onClick={handleDistribute}
                      disabled={isDistributing || patients.length === 0 || !isToday || isLoading}
                      variant="primary"
                      size="lg"
                      icon="brain"
                      fullWidth
                      className="bg-gradient-to-r from-teal-600 to-teal-700"
                    >
                      {isDistributing ? 'AI Processing...' : 'Smart Distribute'}
                    </Button>
                    
                    {showResults && assignments.size > 0 && (
                      <div className="space-y-4">
                        <WorkloadSummary assignments={assignments} patients={patients} scholars={scholars} />
                        <ResultsDisplay assignments={assignments} onExport={handleExport} />
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {currentView === 'analytics' && showResults && assignments.size > 0 && (
                <div className="space-y-4">
                  <AnalyticsDashboard assignments={assignments} patients={patients} />
                  <IntelligentInsights assignments={assignments} patients={patients} scholars={scholars} />
                </div>
              )}

              {/* Additional mobile views */}
              <div className="grid grid-cols-1 gap-4 mt-6">
                <ScholarSetup 
                  scholars={scholars} 
                  onToggleScholarStatus={handleToggleScholarStatus} 
                  disabled={!isToday || isLoading} 
                />
                <ProcedureGradeTable />
                <RulesDisplay />
              </div>
            </MobileViewContainer>

            {/* Mobile Navigation */}
            <MobileNavigation
              currentView={currentView}
              onViewChange={setCurrentView}
              isVisible={true}
            />

            {/* Floating Action Button */}
            <FloatingActionButton
              onQuickDistribute={handleQuickDistribute}
              onAddPatient={handleQuickAddPatient}
              onShowAnalytics={handleShowAnalytics}
              disabled={isLoading}
              isVisible={isToday}
            />

            {/* Modals */}
            <ExportModal 
              isOpen={isExportModalOpen}
              onClose={() => setExportModalOpen(false)}
              text={exportText}
            />
            
            <WeeklyAnalysisModal
              isOpen={isAnalysisModalOpen}
              onClose={() => setAnalysisModalOpen(false)}
              scholars={scholars}
            />
            
            <HistoricalDataViewer
              isOpen={historicalViewerOpen}
              onClose={() => setHistoricalViewerOpen(false)}
            />
          </div>
        </ErrorBoundary>
      </ResponsiveTest>
    );
  }

  // Desktop layout (original)
  return (
    <ResponsiveTest>
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
          <Header />
          <main className="container mx-auto p-4 md:p-6 flex-grow">
            <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} isLoading={isLoading} />
            
            {/* Global Error Display */}
            {isError && (
              <div className="mb-6">
                <ErrorDisplay 
                  error={error}
                  onDismiss={clearError}
                  variant="inline"
                  showDetails={import.meta.env.DEV}
                />
              </div>
            )}
          
          {/* Connection Status */}
          <Card variant="outlined" className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Online - Data will be saved automatically' : 'Offline - Changes will not be saved'}
                </span>
              </div>
              {deviceCapabilities.isStandalone && (
                <span className="text-sm text-green-600 font-medium">PWA Mode Active</span>
              )}
            </div>
          </Card>
          
          {/* Analytics and Insights Section */}
          {showResults && assignments.size > 0 && (
            <Card title="Analytics & Insights" icon="chart-bar" variant="elevated" className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  variant={showAnalytics ? "primary" : "outline"}
                  icon="chart-bar"
                  className={showAnalytics ? "bg-teal-600 hover:bg-teal-700" : "text-teal-600 border-teal-600 hover:bg-teal-50"}
                >
                  {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </Button>
                <Button
                  onClick={() => setShowInsights(!showInsights)}
                  variant={showInsights ? "primary" : "outline"}
                  icon="brain"
                  className={showInsights ? "bg-purple-600 hover:bg-purple-700" : "text-purple-600 border-purple-600 hover:bg-purple-50"}
                >
                  {showInsights ? 'Hide AI Insights' : 'Show AI Insights'}
                </Button>
              </div>
              
              {showAnalytics && (
                <AnalyticsDashboard assignments={assignments} patients={patients} />
              )}
              
              {showInsights && (
                <IntelligentInsights assignments={assignments} patients={patients} scholars={scholars} />
              )}
            </Card>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6 order-2 lg:order-1">
              <PatientInput 
                patients={patients} 
                onAddPatient={handleAddPatient} 
                onDeletePatient={handleDeletePatient}
                onUpdatePatient={handleUpdatePatient}
                disabled={!isToday} 
              />
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center">
                    <i className="fas fa-robot text-teal-600 mr-2"></i>
                    Intelligent Distribution
                  </h3>
                </div>
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <Button
                    onClick={handleDistribute}
                    disabled={isDistributing || patients.length === 0 || !isToday || isLoading}
                    variant="primary"
                    size="lg"
                    icon="brain"
                    fullWidth
                    className="bg-gradient-to-r from-teal-600 to-teal-700"
                  >
                    {isDistributing ? 'AI Processing...' : 'Smart Distribute'}
                  </Button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      onClick={() => setAnalysisModalOpen(true)}
                      variant="outline"
                      size="md"
                      icon="chart-line"
                      className="text-purple-600 hover:text-purple-700 border-purple-200 hover:bg-purple-50"
                    >
                      Weekly Analysis
                    </Button>
                    <Button
                      onClick={() => setHistoricalViewerOpen(true)}
                      variant="outline"
                      size="md"
                      icon="history"
                      className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                    >
                      Historical Data
                    </Button>
                  </div>
                </div>
              </div>

              <ScholarSetup scholars={scholars} onToggleScholarStatus={handleToggleScholarStatus} disabled={!isToday || isLoading} />
              <ProcedureGradeTable />
              <RulesDisplay />
            </div>
            
            <div className="lg:col-span-2 order-1 lg:order-2">
              {isDistributing || isLoading ? (
                <Card className="flex items-center justify-center h-full p-10">
                  <div className="text-center">
                    <LoadingSpinner size="lg" className="text-teal-600" />
                    <p className="mt-4 text-lg text-gray-600">
                      {isLoading ? "Loading data..." : "Calculating optimal distribution..."}
                    </p>
                  </div>
                </Card>
              ) : showResults ? (
                <div className="flex flex-col gap-6">
                  {!isToday && (
                    <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-lg shadow" role="alert">
                      <p className="font-bold">Read-Only Mode</p>
                      <p>You are viewing a historical record. No changes can be made.</p>
                    </div>
                  )}
                  <WorkloadSummary assignments={assignments} patients={patients} scholars={scholars} />
                  <ResultsDisplay assignments={assignments} onExport={handleExport} />
                </div>
              ) : (
                <Card className="flex items-center justify-center h-full p-10">
                  <div className="text-center">
                    <i className="fas fa-info-circle text-4xl text-gray-400"></i>
                    <p className="mt-4 text-lg text-gray-600">
                      {isToday ? "Add patients and click 'Distribute Workload' to see assignments." : "No workload was recorded for this day."}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <i className="fas fa-graduation-cap text-teal-400"></i>
                  <p className="font-semibold text-sm">Developed by</p>
                </div>
                <p className="text-xs text-gray-300">Dr. Akash Goel, PG Scholar</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <i className="fas fa-hospital text-teal-400"></i>
                  <p className="font-semibold text-sm">Department of Panchkarma</p>
                </div>
                <p className="text-xs text-gray-300">Ayurvedic & Unani Tibbia College and Hospital</p>
              </div>
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end space-x-2 mb-2">
                  <i className="fas fa-calendar-check text-teal-400"></i>
                  <p className="font-semibold text-sm">Workload Management</p>
                </div>
                <p className="text-xs text-gray-300">Smart Scholar Assignment System</p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-6 pt-4 text-center">
              <p className="text-xs text-gray-400">© 2025 Panchkarma Workload Distributor. All rights reserved.</p>
            </div>
          </div>
        </footer>
        
        {/* Modals */}
        <ExportModal 
          isOpen={isExportModalOpen}
          onClose={() => setExportModalOpen(false)}
          text={exportText}
        />
        
        <WeeklyAnalysisModal
          isOpen={isAnalysisModalOpen}
          onClose={() => setAnalysisModalOpen(false)}
          scholars={scholars}
        />
        
        <HistoricalDataViewer
          isOpen={historicalViewerOpen}
          onClose={() => setHistoricalViewerOpen(false)}
        />
        </div>
      </ErrorBoundary>
    </ResponsiveTest>
  );
};

export default App;