import React, { useState, useCallback, useEffect } from 'react';
import type { Scholar, Patient, Assignment } from './types';
import { INITIAL_SCHOLARS } from './constants';
import { parsePreviousAssignments } from './services/parserService';
import { distributeWorkload } from './services/distributionService';
import { generateExportText } from './services/exportService';
import { saveDailyAssignments } from './services/historyService';
import Header from './components/Header';
import ScholarSetup from './components/ScholarSetup';
import ResultsDisplay from './components/ResultsDisplay';
import WorkloadSummary from './components/WorkloadSummary';
import ExportModal from './components/ExportModal';
import RulesDisplay from './components/RulesDisplay';
import ProcedureGradeTable from './components/ProcedureGradeTable';
import PatientInput from './components/PatientInput';
import WeeklyAnalysisModal from './components/WeeklyAnalysisModal';

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const savedPatients = localStorage.getItem('panchkarma_patients');
      return savedPatients ? JSON.parse(savedPatients) : [];
    } catch (error) {
      console.error("Error loading patients from localStorage:", error);
      return [];
    }
  });
  const [previousDayInputText, setPreviousDayInputText] = useState<string>('');
  const [scholars, setScholars] = useState<Scholar[]>(() => {
    try {
      const savedScholars = localStorage.getItem('panchkarma_scholars');
      return savedScholars ? JSON.parse(savedScholars) : INITIAL_SCHOLARS;
    } catch (error) {
      console.error("Error loading scholars from localStorage:", error);
      return INITIAL_SCHOLARS;
    }
  });
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isExportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [exportText, setExportText] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('panchkarma_patients', JSON.stringify(patients));
    } catch (error) {
      console.error("Error saving patients to localStorage:", error);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem('panchkarma_scholars', JSON.stringify(scholars));
    } catch (error) {
      console.error("Error saving scholars to localStorage:", error);
    }
  }, [scholars]);


  const handleDistribute = useCallback(() => {
    setIsLoading(true);
    setShowResults(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
        try {
            const previousAssignments = parsePreviousAssignments(previousDayInputText);
            const newAssignments = distributeWorkload(patients, scholars, previousAssignments);
            setAssignments(newAssignments);
            saveDailyAssignments(newAssignments); // Save history
        } catch(error) {
            console.error("Error during workload distribution:", error);
            alert("An error occurred. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    }, 500);
  }, [patients, scholars, previousDayInputText]);
  
  const handleExport = () => {
    const text = generateExportText(assignments);
    setExportText(text);
    setExportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <PatientInput patients={patients} setPatients={setPatients} />
            
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="p-6">
                  <label htmlFor="previousDayInput" className="block text-sm font-bold text-gray-700 mb-2">
                      <i className="fas fa-user-clock text-amber-600 mr-2"></i>Continuity List <span className="text-xs font-normal text-gray-500">(Optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Paste yesterday's exported list here to maintain patient-scholar continuity.</p>
                  <textarea
                      id="previousDayInput"
                      value={previousDayInputText}
                      onChange={(e) => setPreviousDayInputText(e.target.value)}
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow duration-200 text-sm font-mono"
                      placeholder="Paste the final distributed list from the previous day here..."
                  />
              </div>
              <div className="p-4 bg-gray-50/75 border-t border-gray-200 space-y-3">
                <button
                    onClick={handleDistribute}
                    disabled={isLoading}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2 shadow hover:shadow-lg"
                >
                    {isLoading ? (
                    <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Distributing...</span>
                    </>
                    ) : (
                    <>
                        <i className="fa-solid fa-arrows-split-up-and-left"></i>
                        <span>Distribute Workload</span>
                    </>
                    )}
                </button>
                <button
                  onClick={() => setAnalysisModalOpen(true)}
                  className="w-full bg-white text-teal-600 border border-teal-600 font-bold py-3 px-4 rounded-lg hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-chart-line"></i>
                  <span>View Weekly Analysis</span>
                </button>
              </div>
            </div>

            <ScholarSetup scholars={scholars} setScholars={setScholars} />
            <ProcedureGradeTable />
            <RulesDisplay />
          </div>
          <div className="lg:col-span-2">
            {showResults ? (
                isLoading ? (
                    <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-md p-10">
                        <div className="text-center">
                            <i className="fas fa-spinner fa-spin text-4xl text-teal-600"></i>
                            <p className="mt-4 text-lg text-gray-600">Calculating optimal distribution...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                      <WorkloadSummary assignments={assignments} />
                      <ResultsDisplay assignments={assignments} onExport={handleExport} />
                    </div>
                )
            ) : (
                 <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-md p-10">
                    <div className="text-center">
                        <i className="fas fa-info-circle text-4xl text-gray-400"></i>
                        <p className="mt-4 text-lg text-gray-600">Add patients and click "Distribute Workload" to see the assignments.</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center p-4 bg-gray-100 border-t border-gray-200">
        <p className="text-xs text-gray-500">
            Copyright - Dr Akash Goel, PG Scholar, Department of Panchkarma, Ayurvedic & Unani Tibbia College and Hospital
        </p>
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