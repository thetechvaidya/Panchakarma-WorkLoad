import React, { useState, useCallback, useEffect } from 'react';
import type { Scholar, Assignment } from './types';
import { INITIAL_SCHOLARS, DEFAULT_INPUT_TEXT } from './constants';
import { parsePatientProcedures } from './services/parserService';
import { distributeWorkload } from './services/distributionService';
import { generateExportText } from './services/exportService';
import Header from './components/Header';
import ScholarSetup from './components/ScholarSetup';
import ResultsDisplay from './components/ResultsDisplay';
import WorkloadSummary from './components/WorkloadSummary';
import ExportModal from './components/ExportModal';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>(DEFAULT_INPUT_TEXT);
  const [scholars, setScholars] = useState<Scholar[]>(INITIAL_SCHOLARS);
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isExportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportText, setExportText] = useState<string>('');


  const handleDistribute = useCallback(() => {
    setIsLoading(true);
    setShowResults(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
        try {
            const patients = parsePatientProcedures(inputText);
            const newAssignments = distributeWorkload(patients, scholars);
            setAssignments(newAssignments);
        } catch(error) {
            console.error("Error during workload distribution:", error);
            alert("An error occurred. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    }, 500);
  }, [inputText, scholars]);
  
  const handleExport = () => {
    const text = generateExportText(assignments);
    setExportText(text);
    setExportModalOpen(true);
  };

  // Auto-run on first load
  useEffect(() => {
    handleDistribute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Enter Daily Procedures</h3>
              <p className="text-sm font-medium text-gray-500 mb-3">Procedures for 31/08/25</p>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-96 p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow duration-200 text-sm font-mono"
                placeholder="Paste the procedure list here..."
              />
              <button
                onClick={handleDistribute}
                disabled={isLoading}
                className="mt-4 w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
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
            </div>
            <ScholarSetup scholars={scholars} setScholars={setScholars} />
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
                        <p className="mt-4 text-lg text-gray-600">Click "Distribute Workload" to see the assignments.</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setExportModalOpen(false)}
        text={exportText}
      />
    </div>
  );
};

export default App;
