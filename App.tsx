import React, { useState, useCallback, useEffect } from 'react';
import type { Scholar, Assignment } from './types';
import { Gender } from './types';
import { INITIAL_SCHOLARS, DEFAULT_FEMALE_INPUT_TEXT, DEFAULT_MALE_INPUT_TEXT } from './constants';
import { parsePatientProcedures, parsePreviousAssignments } from './services/parserService';
import { distributeWorkload } from './services/distributionService';
import { generateExportText } from './services/exportService';
import Header from './components/Header';
import ScholarSetup from './components/ScholarSetup';
import ResultsDisplay from './components/ResultsDisplay';
import WorkloadSummary from './components/WorkloadSummary';
import ExportModal from './components/ExportModal';
import RulesDisplay from './components/RulesDisplay';
import ProcedureGradeTable from './components/ProcedureGradeTable';

const App: React.FC = () => {
  const [femaleInputText, setFemaleInputText] = useState<string>(DEFAULT_FEMALE_INPUT_TEXT);
  const [maleInputText, setMaleInputText] = useState<string>(DEFAULT_MALE_INPUT_TEXT);
  const [previousDayInputText, setPreviousDayInputText] = useState<string>('');
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
            const femalePatients = parsePatientProcedures(femaleInputText, Gender.FEMALE);
            const malePatients = parsePatientProcedures(maleInputText, Gender.MALE);
            const allPatients = [...femalePatients, ...malePatients];

            const previousAssignments = parsePreviousAssignments(previousDayInputText);
            const newAssignments = distributeWorkload(allPatients, scholars, previousAssignments);
            setAssignments(newAssignments);
        } catch(error) {
            console.error("Error during workload distribution:", error);
            alert("An error occurred. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    }, 500);
  }, [femaleInputText, maleInputText, scholars, previousDayInputText]);
  
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="p-6 space-y-6">
                 <div>
                    <label htmlFor="femaleInput" className="block text-sm font-bold text-gray-700 mb-2">
                        <i className="fas fa-venus text-pink-500 mr-2"></i>Female Patients
                    </label>
                    <textarea
                        id="femaleInput"
                        value={femaleInputText}
                        onChange={(e) => setFemaleInputText(e.target.value)}
                        className="w-full h-64 p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow duration-200 text-sm font-mono"
                        placeholder="Paste the list of female patients and their procedures..."
                    />
                  </div>
                   <div>
                    <label htmlFor="maleInput" className="block text-sm font-bold text-gray-700 mb-2">
                        <i className="fas fa-mars text-blue-500 mr-2"></i>Male Patients
                    </label>
                    <textarea
                        id="maleInput"
                        value={maleInputText}
                        onChange={(e) => setMaleInputText(e.target.value)}
                        className="w-full h-48 p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow duration-200 text-sm font-mono"
                        placeholder="Paste the list of male patients and their procedures..."
                    />
                  </div>
                  <div>
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
              </div>
              <div className="p-4 bg-gray-50/75 border-t border-gray-200">
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
