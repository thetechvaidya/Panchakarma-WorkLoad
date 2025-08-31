import React, { useState, useCallback, useEffect } from 'react';
import type { Scholar, Assignment } from './types';
import { INITIAL_SCHOLARS, DEFAULT_INPUT_TEXT } from './constants';
import { parsePatientProcedures } from './services/parserService';
import { distributeWorkload } from './services/distributionService';
import Header from './components/Header';
import ScholarSetup from './components/ScholarSetup';
import ResultsDisplay from './components/ResultsDisplay';
import WorkloadSummary from './components/WorkloadSummary';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>(DEFAULT_INPUT_TEXT);
  const [scholars, setScholars] = useState<Scholar[]>(INITIAL_SCHOLARS);
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

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
  
  // Auto-run on first load
  useEffect(() => {
    handleDistribute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Enter Daily Procedures</h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow duration-200 text-sm"
                placeholder="Paste the procedure list here..."
              />
              <button
                onClick={handleDistribute}
                disabled={isLoading}
                className="mt-4 w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Distributing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sitemap mr-2"></i>
                    Distribute Workload
                  </>
                )}
              </button>
            </div>
            <ScholarSetup scholars={scholars} setScholars={setScholars} />
          </div>
          <div className="lg:col-span-2">
            {showResults ? (
                isLoading ? (
                    <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-lg p-10">
                        <div className="text-center">
                            <i className="fas fa-spinner fa-spin text-4xl text-teal-600"></i>
                            <p className="mt-4 text-lg text-gray-600">Calculating optimal distribution...</p>
                        </div>
                    </div>
                ) : (
                    <>
                      <WorkloadSummary assignments={assignments} />
                      <ResultsDisplay assignments={assignments} />
                    </>
                )
            ) : (
                 <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-lg p-10">
                    <div className="text-center">
                        <i className="fas fa-info-circle text-4xl text-gray-400"></i>
                        <p className="mt-4 text-lg text-gray-600">Click "Distribute Workload" to see the assignments.</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;