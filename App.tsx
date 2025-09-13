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
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorDisplay from './components/ErrorDisplay';

// Mobile Components
import MobileNavigation from './components/MobileNavigation';
import FloatingActionButton from './components/FloatingActionButton';
import MobileViewContainer from './components/MobileViewContainer';

// Hooks
import { useErrorHandler } from './hooks/useErrorHandler';
import { useLoadingState } from './hooks/useLoadingState';

const getISODateString = (date: Date): string => date.toISOString().split('T')[0] || '';

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

const App: React.FC = () => {
  // Core state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scholars, setScholars] = useState<Scholar[]>(INITIAL_SCHOLARS);
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  
  // UI state
  const [currentView, setCurrentView] = useState('patients');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Hooks
  const { error, isError, logError, clearError, withErrorHandling } = useErrorHandler();
  const { isLoading, startLoading, stopLoading } = useLoadingState(true);
  const [isDistributing, setIsDistributing] = useState<boolean>(false);

  const isToday = useMemo(() => isSameDay(selectedDate, new Date()), [selectedDate]);
  const isMobile = useMemo(() => window.innerWidth < 768, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
  }, [patients, scholars, selectedDate, isToday, withErrorHandling]);

  const handleDeletePatient = useCallback(async (patientId: string) => {
    if (!isToday) return;
    
    const updatedPatients = patients.filter(p => p.id !== patientId);
    setPatients(updatedPatients);
    
    await withErrorHandling(async () => {
      await saveDailyData({ date: getISODateString(selectedDate), patients: updatedPatients, scholars });
    }, 'Deleting patient');
  }, [patients, scholars, selectedDate, isToday, withErrorHandling]);

  const handleUpdatePatient = useCallback(async (patientId: string, updatedData: Partial<Patient>) => {
    if (!isToday) return;
    
    const updatedPatients = patients.map(p => 
      p.id === patientId ? { ...p, ...updatedData } : p
    );
    setPatients(updatedPatients);
    
    await withErrorHandling(async () => {
      await saveDailyData({ date: getISODateString(selectedDate), patients: updatedPatients, scholars });
    }, 'Updating patient procedures');
  }, [patients, scholars, selectedDate, isToday, withErrorHandling]);
  
  // Scholar management
  const handleToggleScholarStatus = useCallback(async (scholarId: string) => {
    if (!isToday) return;
    
    const updatedScholars = scholars.map(scholar => 
      scholar.id === scholarId ? { ...scholar, isPosted: !scholar.isPosted } : scholar
    );
    setScholars(updatedScholars);
    
    await withErrorHandling(async () => {
      await saveDailyData({ date: getISODateString(selectedDate), scholars: updatedScholars, patients });
    }, 'Updating scholar status');
  }, [scholars, patients, selectedDate, isToday, withErrorHandling]);

  // Workload distribution
  const handleDistribute = useCallback(async () => {
    if (patients.length === 0 || !isToday) {
      logError('Please add at least one patient on the current day before distributing.', 'VALIDATION_ERROR', 'Distribution validation');
      return;
    }
    
    setIsDistributing(true);
    
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
    }
    
    setIsDistributing(false);
  }, [patients, scholars, selectedDate, isToday, logError, withErrorHandling]);
  
  // Export functionality
  const handleExport = useCallback(() => {
    const text = generateExportText(assignments);
    console.log('Export text:', text);
    // Create download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workload-${getISODateString(selectedDate)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [assignments, selectedDate]);

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
  }, []);

  // Basic card styles
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #f3f4f6',
    padding: '16px',
    marginBottom: '16px'
  };

  const connectionStyle: React.CSSProperties = {
    ...cardStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const statusDotStyle = (online: boolean): React.CSSProperties => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: online ? '#10b981' : '#ef4444'
  });

  // Render based on device type
  if (isMobile) {
    return (
      <ErrorBoundary>
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
          <MobileViewContainer
            title="Panchkarma WLD"
            subtitle={selectedDate.toLocaleDateString()}
          >
            {/* Global Error Display */}
            {isError && (
              <div style={{ marginBottom: '16px' }}>
                <ErrorDisplay 
                  error={error}
                  onDismiss={clearError}
                  variant="inline"
                />
              </div>
            )}

            {/* Connection Status */}
            <div style={connectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={statusDotStyle(isOnline)}></div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

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
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Smart Distribution</h3>
                <Button
                  onClick={handleDistribute}
                  disabled={isDistributing || patients.length === 0 || !isToday || isLoading}
                  variant="primary"
                  size="lg"
                  icon="brain"
                  fullWidth
                >
                  {isDistributing ? 'AI Processing...' : 'Smart Distribute'}
                </Button>
                
                {showResults && assignments.size > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <WorkloadSummary assignments={assignments} patients={patients} scholars={scholars} />
                    <ResultsDisplay assignments={assignments} onExport={handleExport} />
                  </div>
                )}
              </div>
            )}

            {/* Additional mobile views */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '24px' }}>
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
        </div>
      </ErrorBoundary>
    );
  }

  // Desktop layout (original)
  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f9fafb, #eff6ff)', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', flex: 1 }}>
          <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} isLoading={isLoading} />
          
          {/* Global Error Display */}
          {isError && (
            <div style={{ marginBottom: '24px' }}>
              <ErrorDisplay 
                error={error}
                onDismiss={clearError}
                variant="inline"
              />
            </div>
          )}
        
          {/* Connection Status */}
          <div style={connectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={statusDotStyle(isOnline)}></div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {isOnline ? 'Online - Data will be saved automatically' : 'Offline - Changes will not be saved'}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <PatientInput 
                patients={patients} 
                onAddPatient={handleAddPatient} 
                onDeletePatient={handleDeletePatient}
                onUpdatePatient={handleUpdatePatient}
                disabled={!isToday} 
              />
              
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-robot" style={{ color: '#0d9488' }}></i>
                  Intelligent Distribution
                </h3>
                <Button
                  onClick={handleDistribute}
                  disabled={isDistributing || patients.length === 0 || !isToday || isLoading}
                  variant="primary"
                  size="lg"
                  icon="brain"
                  fullWidth
                >
                  {isDistributing ? 'AI Processing...' : 'Smart Distribute'}
                </Button>
              </div>

              <ScholarSetup scholars={scholars} onToggleScholarStatus={handleToggleScholarStatus} disabled={!isToday || isLoading} />
              <ProcedureGradeTable />
              <RulesDisplay />
            </div>
            
            <div>
              {isDistributing || isLoading ? (
                <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                  <div>
                    <LoadingSpinner size="lg" />
                    <p style={{ marginTop: '16px', fontSize: '18px', color: '#6b7280' }}>
                      {isLoading ? "Loading data..." : "Calculating optimal distribution..."}
                    </p>
                  </div>
                </div>
              ) : showResults ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {!isToday && (
                    <div style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', color: '#92400e', padding: '16px', borderRadius: '8px' }}>
                      <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>Read-Only Mode</p>
                      <p style={{ margin: 0 }}>You are viewing a historical record. No changes can be made.</p>
                    </div>
                  )}
                  <WorkloadSummary assignments={assignments} patients={patients} scholars={scholars} />
                  <ResultsDisplay assignments={assignments} onExport={handleExport} />
                </div>
              ) : (
                <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                  <div>
                    <i className="fas fa-info-circle" style={{ fontSize: '48px', color: '#d1d5db' }}></i>
                    <p style={{ marginTop: '16px', fontSize: '18px', color: '#6b7280' }}>
                      {isToday ? "Add patients and click 'Distribute Workload' to see assignments." : "No workload was recorded for this day."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;