import React, { useState, useMemo } from 'react';
import type { Patient, Procedure, ProcedureGradeInfo } from '../types';
import { Gender } from '../types';
import { UNIQUE_PROCEDURES_INFO } from '../constants';

interface PatientInputProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'isAttendant'>) => void;
  onDeletePatient: (patientId: string) => void;
  disabled: boolean;
}

const PatientInput: React.FC<PatientInputProps> = ({ patients, onAddPatient, onDeletePatient, disabled }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.FEMALE);
  const [currentProcedures, setCurrentProcedures] = useState<Procedure[]>([]);
  const [procedureFilter, setProcedureFilter] = useState('');

  const handleProcedureToggle = (procedureInfo: ProcedureGradeInfo, isChecked: boolean) => {
    if (isChecked) {
      const newProcedure: Procedure = {
        ...procedureInfo,
        id: `${procedureInfo.code}-${Date.now()}`
      };
      setCurrentProcedures(prev => [...prev, newProcedure].sort((a,b) => a.name.localeCompare(b.name)));
    } else {
      setCurrentProcedures(prev => prev.filter(p => p.code !== procedureInfo.code));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || currentProcedures.length === 0) {
      alert("Please provide a patient name and at least one procedure.");
      return;
    }
    onAddPatient({
      name: name.trim(),
      gender,
      procedures: currentProcedures,
    });

    // Reset form
    setName('');
    setGender(Gender.FEMALE);
    setCurrentProcedures([]);
    setProcedureFilter('');
  };

  const isProcedureSelected = (code: string) => currentProcedures.some(p => p.code === code);

  const filteredProcedures = useMemo(() => {
    if (!procedureFilter) {
      return UNIQUE_PROCEDURES_INFO;
    }
    return UNIQUE_PROCEDURES_INFO.filter(proc =>
      proc.name.toLowerCase().includes(procedureFilter.toLowerCase())
    );
  }, [procedureFilter]);


  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                <i className="fas fa-user-plus text-teal-600 mr-2 text-sm sm:text-base"></i>
                <span className="hidden sm:inline">Add Patient & Procedures</span>
                <span className="sm:hidden">Add Patient</span>
            </h3>
        </div>
        <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={disabled} className="space-y-4">
                    <div>
                        <label htmlFor="patientName" className="block text-sm font-bold text-gray-700 mb-2">Patient Name</label>
                        <input type="text" id="patientName" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 transition-all" required placeholder="Enter patient name" />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-700 mb-3">Gender</span>
                        <div className="flex gap-3 sm:gap-6">
                            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex-1 sm:flex-initial">
                                <input type="radio" name="gender" value={Gender.FEMALE} checked={gender === Gender.FEMALE} onChange={() => setGender(Gender.FEMALE)} className="h-4 w-4 text-teal-600 focus:ring-teal-500" /> 
                                <span className="ml-2 sm:ml-3 text-sm font-medium text-gray-700">Female</span>
                            </label>
                            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex-1 sm:flex-initial">
                                <input type="radio" name="gender" value={Gender.MALE} checked={gender === Gender.MALE} onChange={() => setGender(Gender.MALE)} className="h-4 w-4 text-teal-600 focus:ring-teal-500" /> 
                                <span className="ml-2 text-sm font-medium text-gray-700">Male</span>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Procedures ({currentProcedures.length} selected)
                        </label>
                        <div className="relative mb-2">
                            <input
                                type="text"
                                placeholder="Search procedures..."
                                value={procedureFilter}
                                onChange={e => setProcedureFilter(e.target.value)}
                                className="w-full p-2 pl-8 sm:pl-9 text-sm sm:text-base border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                                aria-label="Filter procedures"
                            />
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        </div>
                        <div className="max-h-48 sm:max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1 bg-gray-50/75 shadow-inner">
                            {filteredProcedures.length > 0 ? (
                            filteredProcedures.map(procInfo => (
                                <label key={procInfo.code} className="flex items-center p-2 rounded-md hover:bg-teal-50 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isProcedureSelected(procInfo.code)}
                                        onChange={e => handleProcedureToggle(procInfo, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="ml-3 text-sm text-gray-800 flex-grow">{procInfo.name}</span>
                                    <span className="text-xs font-semibold text-gray-500">{procInfo.points} pts</span>
                                </label>
                            ))
                            ) : (
                            <div className="text-center text-gray-500 py-4">
                                <p>No procedures found.</p>
                            </div>
                            )}
                        </div>
                    </div>
                </fieldset>
                <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm sm:text-base" disabled={!name.trim() || currentProcedures.length === 0 || disabled}>
                    <i className="fas fa-plus-circle mr-2"></i>
                    <span className="hidden sm:inline">Add Patient to List</span>
                    <span className="sm:hidden">Add Patient</span>
                </button>
            </form>
        </div>
        
        <div className="border-t border-gray-200 bg-gray-50/50 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Today's Patient List ({patients.length})</h3>
            {patients.length > 0 ? (
                <ul className="space-y-3 max-h-[26rem] overflow-y-auto pr-2 -mr-2">
                    {patients.map(patient => (
                        <li key={patient.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-800 flex items-center">
                                        <i className={`w-4 text-center fas ${patient.gender === Gender.MALE ? 'fa-mars text-blue-500' : 'fa-venus text-pink-500'} mr-2`}></i>
                                        {patient.name}
                                    </p>
                                    <ul className="mt-2 space-y-1 text-sm text-gray-600 pl-6">
                                        {patient.procedures.map(proc => <li key={proc.id} className="list-disc list-inside">{proc.name}</li>)}
                                    </ul>
                                </div>
                                {!disabled && (
                                    <button onClick={() => onDeletePatient(patient.id)} className="text-gray-400 hover:text-red-600 font-bold py-1 px-2 rounded-lg text-sm" aria-label={`Delete patient ${patient.name}`}>
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center text-gray-500 text-sm py-8 bg-slate-100 rounded-lg">
                    <p>{disabled ? "No patients were added on this day." : "No patients have been added yet."}</p>
                </div>
            )}
        </div>
    </div>
  )
}

export default PatientInput;