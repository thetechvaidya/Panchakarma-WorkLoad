import React, { useState, useCallback } from 'react';
import type { Scholar, Patient, Assignment } from './types';
import { INITIAL_SCHOLARS } from './constants';
import { distributeWorkload } from './services/distributionService';
import { generateExportText } from './services/exportService';
import { getLatestAssignmentsForContinuity, saveDailyAssignments } from './services/historyService';

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scholars, setScholars] = useState<Scholar[]>(INITIAL_SCHOLARS);
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  const [isDistributing, setIsDistributing] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isExportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [exportText, setExportText] = useState<string>('');
  
  const handleAddPatient = useCallback((patientData: Omit<Patient, 'id' | 'isAttendant'>) => {
      const newPatient: Patient = {
        ...patientData,
        id: `patient-${patientData.name.trim().replace(/\s/g, '')}-${Date.now()}`,
        isAttendant: false,
      }
      setPatients(prev => [...prev, newPatient]);
  }, []);

  const handleDeletePatient = useCallback((patientId: string) => {
      setPatients(prev => prev.filter(p => p.id !== patientId));
  }, []);
  
  const handleToggleScholarStatus = useCallback((scholarId: string) => {
      setScholars(prev => 
        prev.map(scholar => 
          scholar.id === scholarId 
            ? { ...scholar, isPosted: !scholar.isPosted } 
            : scholar
        )
      );
  }, []);

  const handleDistribute = useCallback(async () => {
    if (patients.length === 0) {
        alert("Please add at least one patient before distributing.");
        return;
    }
    setIsDistributing(true);
    setShowResults(true);
    
    try {
        const previousAssignments = await getLatestAssignmentsForContinuity();
        const newAssignments = distributeWorkload(patients, scholars, previousAssignments);
        setAssignments(newAssignments);
        await saveDailyAssignments(newAssignments, patients);
        
    } catch(error) {
        console.error("Error during workload distribution:", error);
        alert("An error occurred during distribution or saving. Please check the console for details.");
    } finally {
        setIsDistributing(false);
    }
  }, [patients, scholars]);
  
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
            <PatientInput patients={patients} onAddPatient={handleAddPatient} onDeletePatient={handleDeletePatient} />
            
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="p-4 bg-gray-50/75 border-t border-gray-200 space-y-3">
                <button
                    onClick={handleDistribute}
                    disabled={isDistributing || patients.length === 0}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2 shadow hover:shadow-lg"
                >
                    {isDistributing ? (
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
                  className="w-full bg-white text-gray-500 border border-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chart-line"></i>
                  <span>View Weekly Analysis</span>
                </button>
              </div>
            </div>

            <ScholarSetup scholars={scholars} onToggleScholarStatus={(id) => handleToggleScholarStatus(id)} />
            <ProcedureGradeTable />
            <RulesDisplay />
          </div>
          <div className="lg:col-span-2">
            {showResults ? (
                isDistributing ? (
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
