import React, { useState, useCallback, useEffect } from 'react';
import { collection, doc, onSnapshot, getDocs, writeBatch, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, query, orderBy, limit, where } from 'firebase/firestore';
import type { Scholar, Patient, Assignment, HistoricalAssignmentRecord } from './types';
import { INITIAL_SCHOLARS } from './constants';
import { distributeWorkload } from './services/distributionService';
import { generateExportText } from './services/exportService';
import { getLatestAssignmentsForContinuity } from './services/historyService';
import { db, isFirebaseConfigured } from './firebaseConfig';

import Header from './components/Header';
import ScholarSetup from './components/ScholarSetup';
import ResultsDisplay from './components/ResultsDisplay';
import WorkloadSummary from './components/WorkloadSummary';
import ExportModal from './components/ExportModal';
import RulesDisplay from './components/RulesDisplay';
import ProcedureGradeTable from './components/ProcedureGradeTable';
import PatientInput from './components/PatientInput';
import WeeklyAnalysisModal from './components/WeeklyAnalysisModal';
import FirebaseSetup from './components/FirebaseSetup';

const getISODateString = (date: Date): string => date.toISOString().split('T')[0];
const todayStr = getISODateString(new Date());

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDistributing, setIsDistributing] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isExportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [exportText, setExportText] = useState<string>('');
  
  // Seed initial scholars to Firestore if they don't exist
  useEffect(() => {
    if (!db) return;
    const scholarsCol = collection(db, 'scholars');
    getDocs(scholarsCol).then(snapshot => {
      if (snapshot.empty) {
        console.log("No scholars found in Firestore, seeding initial data...");
        const batch = writeBatch(db);
        INITIAL_SCHOLARS.forEach(scholar => {
          const docRef = doc(db, 'scholars', scholar.id);
          batch.set(docRef, scholar);
        });
        batch.commit();
      }
    });
  }, []);

  // Set up real-time listeners for scholars and today's patients/assignments
  useEffect(() => {
    if (!db) {
        setIsLoading(false);
        return;
    }

    // Listener for scholars
    const scholarsUnsub = onSnapshot(collection(db, 'scholars'), (snapshot) => {
      const scholarsData = snapshot.docs.map(doc => doc.data() as Scholar);
      setScholars(scholarsData);
      setIsLoading(false);
    });

    // Listener for today's data (patients and assignments)
    const todayDocRef = doc(db, 'daily_data', todayStr);
    const dailyUnsub = onSnapshot(todayDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data() as HistoricalAssignmentRecord;
            setPatients(data.patients || []);
            if (data.assignments && data.assignments.length > 0) {
              const assignmentsMap = new Map(data.assignments.map(a => [a.scholar.id, a]));
              setAssignments(assignmentsMap);
              setShowResults(true);
            } else {
              setAssignments(new Map());
            }
        } else {
            // No data for today yet
            setPatients([]);
            setAssignments(new Map());
        }
    });

    return () => {
      scholarsUnsub();
      dailyUnsub();
    };
  }, []);
  
  const handleAddPatient = useCallback(async (patientData: Omit<Patient, 'id' | 'isAttendant'>) => {
      if (!db) return;
      const newPatient: Patient = {
        ...patientData,
        id: `patient-${patientData.name.trim().replace(/\s/g, '')}-${Date.now()}`,
        isAttendant: false,
      }
      const todayDocRef = doc(db, 'daily_data', todayStr);
      await setDoc(todayDocRef, { date: todayStr, patients: arrayUnion(newPatient) }, { merge: true });
  }, []);

  const handleDeletePatient = useCallback(async (patientId: string) => {
      if (!db) return;
      const patientToDelete = patients.find(p => p.id === patientId);
      if (patientToDelete) {
        const todayDocRef = doc(db, 'daily_data', todayStr);
        await updateDoc(todayDocRef, { patients: arrayRemove(patientToDelete) });
      }
  }, [patients]);
  
  const handleToggleScholarStatus = useCallback(async (scholarId: string, currentStatus: boolean) => {
      if (!db) return;
      const scholarDocRef = doc(db, 'scholars', scholarId);
      await updateDoc(scholarDocRef, { isPosted: !currentStatus });
  }, []);

  const handleDistribute = useCallback(async () => {
    if (!db) return;
    setIsDistributing(true);
    setShowResults(true);
    
    try {
        const previousAssignments = await getLatestAssignmentsForContinuity();
        const newAssignments = distributeWorkload(patients, scholars, previousAssignments);
        const newAssignmentsArray = Array.from(newAssignments.values());

        const todayDocRef = doc(db, 'daily_data', todayStr);
        await setDoc(todayDocRef, { date: todayStr, assignments: newAssignmentsArray }, { merge: true });
        
    } catch(error) {
        console.error("Error during workload distribution:", error);
        alert("An error occurred. Please check the console for details.");
    } finally {
        setIsDistributing(false);
    }
  }, [patients, scholars]);
  
  const handleExport = () => {
    const text = generateExportText(assignments);
    setExportText(text);
    setExportModalOpen(true);
  };

  if (!isFirebaseConfigured) {
    return <FirebaseSetup />;
  }

  if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-teal-600"></i>
              <p className="mt-4 text-lg text-gray-600">Connecting to the department server...</p>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <PatientInput patients={patients} onAddPatient={handleAddPatient} onDeletePatient={handleDeletePatient} />
            
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="p-6">
                  <div className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <i className="fas fa-user-clock text-green-600 mr-2"></i>Continuity is now Automatic
                  </div>
                  <p className="text-xs text-gray-500 mb-2">The system will automatically check yesterday's assignments to maintain patient-scholar continuity. The manual list is no longer needed.</p>
              </div>
              <div className="p-4 bg-gray-50/75 border-t border-gray-200 space-y-3">
                <button
                    onClick={handleDistribute}
                    disabled={isDistributing}
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
                  className="w-full bg-white text-teal-600 border border-teal-600 font-bold py-3 px-4 rounded-lg hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-chart-line"></i>
                  <span>View Weekly Analysis</span>
                </button>
              </div>
            </div>

            <ScholarSetup scholars={scholars} onToggleScholarStatus={handleToggleScholarStatus} />
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
