import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { Scholar, Patient, Assignment } from './types';
import { INITIAL_SCHOLARS } from './constants';
import { distributeWorkload } from './services/distributionService';
import { generateExportText } from './services/exportService';
import { getLatestAssignmentsForContinuity, saveDailyData, getDailyData } from './services/historyService';

import Header from './components/Header';
import ScholarSetup from './components/ScholarSetup';
import ResultsDisplay from './components/ResultsDisplay';
import WorkloadSummary from './components/WorkloadSummary';
import ExportModal from './components/ExportModal';
import RulesDisplay from './components/RulesDisplay';
import ProcedureGradeTable from './components/ProcedureGradeTable';
import PatientInput from './components/PatientInput';
import WeeklyAnalysisModal from './components/WeeklyAnalysisModal';
import DateNavigator from './components/DateNavigator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import IntelligentInsights from './components/IntelligentInsights';
import { isFirebaseConnected } from './firebaseConfig';


const getISODateString = (date: Date): string => date.toISOString().split('T')[0];

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};


const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scholars, setScholars] = useState<Scholar[]>(INITIAL_SCHOLARS);
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDistributing, setIsDistributing] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isExportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showInsights, setShowInsights] = useState<boolean>(false);
  const [exportText, setExportText] = useState<string>('');

  const isToday = useMemo(() => isSameDay(selectedDate, new Date()), [selectedDate]);
  
  useEffect(() => {
    const loadDataForDate = async () => {
        setIsLoading(true);
        setShowResults(false);
        try {
            const data = await getDailyData(selectedDate);
            if (data) {
                setPatients(data.patients || []);
                setScholars(data.scholars || INITIAL_SCHOLARS);
                const assignmentMap = new Map<string, Assignment>();
                if (data.assignments && data.assignments.length > 0) {
                    data.assignments.forEach(a => assignmentMap.set(a.scholar.id, a));
                    setShowResults(true);
                }
                setAssignments(assignmentMap);
            } else {
                // Reset for a new day or a day with no data
                setPatients([]);
                setScholars(INITIAL_SCHOLARS);
                setAssignments(new Map());
            }
        } catch (error) {
            console.error("Error loading data for date:", selectedDate, error);
            alert("Could not load data. Please check console for details.");
        } finally {
            setIsLoading(false);
        }
    };
    loadDataForDate();
  }, [selectedDate]);

  const handleAddPatient = useCallback(async (patientData: Omit<Patient, 'id' | 'isAttendant'>) => {
      if (!isToday) return;
      const newPatient: Patient = {
        ...patientData,
        id: `patient-${patientData.name.trim().replace(/\s/g, '')}-${Date.now()}`,
        isAttendant: false,
      }
      const updatedPatients = [...patients, newPatient];
      setPatients(updatedPatients);
      try {
        await saveDailyData({ date: getISODateString(selectedDate), patients: updatedPatients, scholars });
      } catch (error) {
        console.error("Failed to save new patient:", error);
        // Optionally revert state or show error
      }
  }, [patients, scholars, selectedDate, isToday]);

  const handleDeletePatient = useCallback(async (patientId: string) => {
      if (!isToday) return;
      const updatedPatients = patients.filter(p => p.id !== patientId);
      setPatients(updatedPatients);
      try {
        await saveDailyData({ date: getISODateString(selectedDate), patients: updatedPatients, scholars });
      } catch (error) {
        console.error("Failed to save after deleting patient:", error);
      }
  }, [patients, scholars, selectedDate, isToday]);
  
  const handleToggleScholarStatus = useCallback(async (scholarId: string) => {
      if (!isToday) return;
      const updatedScholars = scholars.map(scholar => 
          scholar.id === scholarId 
            ? { ...scholar, isPosted: !scholar.isPosted } 
            : scholar
      );
      setScholars(updatedScholars);
      try {
        await saveDailyData({ date: getISODateString(selectedDate), scholars: updatedScholars, patients });
      } catch (error) {
        console.error("Failed to save scholar status:", error);
      }
  }, [scholars, patients, selectedDate, isToday]);

  const handleDistribute = useCallback(async () => {
    if (patients.length === 0 || !isToday) {
        alert("Please add at least one patient on the current day before distributing.");
        return;
    }
    setIsDistributing(true);
    
    try {
        const previousAssignments = await getLatestAssignmentsForContinuity();
        const newAssignments = distributeWorkload(patients, scholars, previousAssignments);
        setAssignments(newAssignments);

        const assignmentsArray = Array.from(newAssignments.values());
        await saveDailyData({ date: getISODateString(selectedDate), assignments: assignmentsArray, patients, scholars });
        setShowResults(true);
        
    } catch(error) {
        console.error("Error during workload distribution:", error);
        alert("An error occurred during distribution or saving. Please check the console for details.");
    } finally {
        setIsDistributing(false);
    }
  }, [patients, scholars, selectedDate, isToday]);
  
  const handleExport = () => {
    const text = generateExportText(assignments);
    setExportText(text);
    setExportModalOpen(true);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-6 flex-grow">
        <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} isLoading={isLoading} />
        
        {/* Firebase Connection Status */}
        {!isFirebaseConnected() && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-triangle text-yellow-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Running in offline mode.</strong> Data will not be saved to Firebase. 
                  Check your internet connection or Firebase configuration.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics and Insights Section */}
        {showResults && assignments.size > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showAnalytics 
                    ? 'bg-teal-600 text-white shadow-md' 
                    : 'bg-white text-teal-600 border border-teal-600 hover:bg-teal-50'
                }`}
              >
                <i className="fas fa-chart-bar mr-2"></i>
                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </button>
              <button
                onClick={() => setShowInsights(!showInsights)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showInsights 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                }`}
              >
                <i className="fas fa-brain mr-2"></i>
                {showInsights ? 'Hide AI Insights' : 'Show AI Insights'}
              </button>
            </div>
            
            {showAnalytics && (
              <AnalyticsDashboard assignments={assignments} patients={patients} />
            )}
            
            {showInsights && (
              <IntelligentInsights assignments={assignments} patients={patients} scholars={scholars} />
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <PatientInput 
              patients={patients} 
              onAddPatient={handleAddPatient} 
              onDeletePatient={handleDeletePatient}
              disabled={!isToday || isLoading} 
            />
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <i className="fas fa-robot text-teal-600 mr-2"></i>
                  Intelligent Distribution
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <button
                    onClick={handleDistribute}
                    disabled={isDistributing || patients.length === 0 || !isToday || isLoading}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold py-3 px-4 rounded-lg hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                    {isDistributing ? (
                    <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>AI Processing...</span>
                    </>
                    ) : (
                    <>
                        <i className="fa-solid fa-brain"></i>
                        <span>Smart Distribute</span>
                    </>
                    )}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAnalysisModalOpen(true)}
                    className="bg-white text-purple-600 border border-purple-300 font-medium py-2 px-3 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition-all duration-300 ease-in-out flex items-center justify-center space-x-1 text-sm"
                  >
                    <i className="fas fa-chart-line"></i>
                    <span>Weekly</span>
                  </button>
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className="bg-white text-blue-600 border border-blue-300 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-300 ease-in-out flex items-center justify-center space-x-1 text-sm"
                  >
                    <i className="fas fa-lightbulb"></i>
                    <span>Insights</span>
                  </button>
                </div>
              </div>
            </div>

            <ScholarSetup scholars={scholars} onToggleScholarStatus={handleToggleScholarStatus} disabled={!isToday || isLoading} />
            <ProcedureGradeTable />
            <RulesDisplay />
          </div>
          <div className="lg:col-span-2">
            {isDistributing || isLoading ? (
                <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-md p-10">
                    <div className="text-center">
                        <i className="fas fa-spinner fa-spin text-4xl text-teal-600"></i>
                        <p className="mt-4 text-lg text-gray-600">
                            {isLoading ? "Loading data..." : "Calculating optimal distribution..."}
                        </p>
                    </div>
                </div>
            ) : showResults ? (
                <div className="flex flex-col gap-6">
                    {!isToday && (
                        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-lg shadow" role="alert">
                            <p className="font-bold">Read-Only Mode</p>
                            <p>You are viewing a historical record. No changes can be made.</p>
                        </div>
                    )}
                    <WorkloadSummary assignments={assignments} />
                    <ResultsDisplay assignments={assignments} onExport={handleExport} />
                </div>
            ) : (
                 <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-md p-10">
                    <div className="text-center">
                        <i className="fas fa-info-circle text-4xl text-gray-400"></i>
                        <p className="mt-4 text-lg text-gray-600">{isToday ? "Add patients and click 'Distribute Workload' to see assignments." : "No workload was recorded for this day."}</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <i className="fas fa-graduation-cap text-teal-400"></i>
                <p className="font-semibold text-sm">Developed by</p>
              </div>
              <p className="text-xs text-gray-300">
                Dr. Akash Goel, PG Scholar
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <i className="fas fa-hospital text-teal-400"></i>
                <p className="font-semibold text-sm">Department of Panchkarma</p>
              </div>
              <p className="text-xs text-gray-300">
                Ayurvedic & Unani Tibbia College and Hospital
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end space-x-2 mb-2">
                <i className="fas fa-calendar-check text-teal-400"></i>
                <p className="font-semibold text-sm">Workload Management</p>
              </div>
              <p className="text-xs text-gray-300">
                Smart Scholar Assignment System
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-4 text-center">
            <p className="text-xs text-gray-400">
              © 2025 Panchkarma Workload Distributor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
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
    </div>
  );
};

export default App;