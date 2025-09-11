import React, { useState, useMemo } from 'react';
import type { Patient, Procedure, ProcedureGradeInfo } from '../types';
import { Gender } from '../types';
import { UNIQUE_PROCEDURES_INFO } from '../constants';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import ErrorDisplay from './ErrorDisplay';
import { useErrorHandler, createValidationError } from '../hooks/useErrorHandler';

interface PatientInputProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'isAttendant'>) => void;
  onDeletePatient: (patientId: string) => void;
  onUpdatePatient?: (patientId: string, updatedPatient: Partial<Patient>) => void;
  disabled: boolean;
}

const PatientInput: React.FC<PatientInputProps> = ({ patients, onAddPatient, onDeletePatient, onUpdatePatient, disabled }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.FEMALE);
  const [currentProcedures, setCurrentProcedures] = useState<Procedure[]>([]);
  const [procedureFilter, setProcedureFilter] = useState('');
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [showProcedureManager, setShowProcedureManager] = useState<string | null>(null);
  const { error, isError, logError, clearError } = useErrorHandler();

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
    clearError();
    
    // Validation
    if (!name.trim()) {
      logError(createValidationError('Please provide a patient name.', 'patientName'));
      return;
    }
    
    if (currentProcedures.length === 0) {
      logError(createValidationError('Please select at least one procedure.', 'procedures'));
      return;
    }
    
    // Check for duplicate patient names
    const duplicatePatient = patients.find(p => 
      p.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    
    if (duplicatePatient) {
      logError(createValidationError('A patient with this name already exists today.', 'patientName'));
      return;
    }
    
    try {
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
    } catch (err) {
      logError(err as Error, 'Adding patient');
    }
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

  const handleAddProcedureToPatient = (patientId: string, procedureInfo: ProcedureGradeInfo) => {
    if (!onUpdatePatient) return;
    
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    
    const newProcedure: Procedure = {
      ...procedureInfo,
      id: `${procedureInfo.code}-${Date.now()}`
    };
    
    const updatedProcedures = [...patient.procedures, newProcedure].sort((a, b) => a.name.localeCompare(b.name));
    onUpdatePatient(patientId, { procedures: updatedProcedures });
  };

  const handleRemoveProcedureFromPatient = (patientId: string, procedureId: string) => {
    if (!onUpdatePatient) return;
    
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    
    const updatedProcedures = patient.procedures.filter(p => p.id !== procedureId);
    onUpdatePatient(patientId, { procedures: updatedProcedures });
  };

  const getAvailableProceduresForPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return [];
    
    const existingCodes = new Set(patient.procedures.map(p => p.code));
    return UNIQUE_PROCEDURES_INFO.filter(proc => !existingCodes.has(proc.code));
  };


  return (
    <Card 
      title="Add Patient" 
      icon="user-plus"
      variant="elevated"
      className="overflow-hidden"
    >
        {/* Error Display */}
        {isError && (
          <div className="mb-4">
            <ErrorDisplay 
              error={error}
              onDismiss={clearError}
              variant="inline"
            />
          </div>
        )}
        
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={disabled} className="space-y-4">
                    <Input
                        id="patientName"
                        label="Patient Name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (isError) clearError(); // Clear error on input change
                        }}
                        placeholder="Enter patient name"
                        leftIcon="user"
                        required
                        disabled={disabled}
                        fullWidth
                        error={isError && error?.details?.field === 'patientName' ? error.message : undefined}
                    />
                    <div>
                        <span className="block text-sm font-bold text-gray-700 mb-3">Gender</span>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors min-h-[44px] touch-manipulation">
                                <input type="radio" name="gender" value={Gender.FEMALE} checked={gender === Gender.FEMALE} onChange={() => setGender(Gender.FEMALE)} className="h-5 w-5 text-teal-600 focus:ring-teal-500" /> 
                                <span className="ml-3 text-base font-medium text-gray-700">Female</span>
                            </label>
                            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors min-h-[44px] touch-manipulation">
                                <input type="radio" name="gender" value={Gender.MALE} checked={gender === Gender.MALE} onChange={() => setGender(Gender.MALE)} className="h-5 w-5 text-teal-600 focus:ring-teal-500" /> 
                                <span className="ml-3 text-base font-medium text-gray-700">Male</span>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Procedures ({currentProcedures.length} selected)
                        </label>
                        <Input
                            value={procedureFilter}
                            onChange={(e) => setProcedureFilter(e.target.value)}
                            placeholder="Search procedures..."
                            leftIcon="search"
                            disabled={disabled}
                            fullWidth
                            className="mb-2"
                        />
                        <div className={`max-h-48 sm:max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1 bg-gray-50/75 shadow-inner ${isError && error?.details?.field === 'procedures' ? 'border-red-300' : ''}`}>
                            {filteredProcedures.length > 0 ? (
                            filteredProcedures.map(procInfo => (
                                <label key={procInfo.code} className="flex items-center p-3 rounded-md hover:bg-teal-50 transition-colors cursor-pointer min-h-[44px] touch-manipulation">
                                    <input
                                        type="checkbox"
                                        checked={isProcedureSelected(procInfo.code)}
                                        onChange={e => {
                                          handleProcedureToggle(procInfo, e.target.checked);
                                          if (isError) clearError(); // Clear error on selection change
                                        }}
                                        className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <div className="ml-3 flex-1 min-w-0">
                                         <div className="text-base font-medium text-gray-900 truncate">{procInfo.name}</div>
                                         <div className="text-sm text-gray-500 flex items-center space-x-2">
                                             <span className="font-mono">{procInfo.code}</span>
                                             <span className="text-teal-600 font-semibold">{procInfo.points} pts</span>
                                         </div>
                                     </div>
                                </label>
                            ))
                            ) : (
                            <div className="text-center text-gray-500 py-4">
                                <p>No procedures found.</p>
                            </div>
                            )}
                        </div>
                        {isError && error?.details?.field === 'procedures' && (
                          <p className="mt-1 text-sm text-red-600">{error.message}</p>
                        )}
                    </div>
                </fieldset>
                <Button
                    type="submit"
                    disabled={!name.trim() || currentProcedures.length === 0 || disabled}
                    variant="primary"
                    size="lg"
                    icon="plus"
                    fullWidth
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:ring-teal-500"
                >
                    Add Patient to List
                </Button>
            </form>
        </div>
        
        <div className="border-t border-gray-200 bg-gray-50/50 p-4 sm:p-6">
            <Card 
                title={`Today's Patient List (${patients.length})`}
                icon="list"
                variant="outlined"
                className="-m-4 sm:-m-6"
            >
                {patients.length > 0 ? (
                    <ul className="space-y-3 max-h-[26rem] overflow-y-auto pr-2 -mr-2">
                    {patients.map(patient => (
                        <li key={patient.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <p className="font-bold text-gray-800 flex items-center">
                                        <i className={`w-4 text-center fas ${patient.gender === Gender.MALE ? 'fa-mars text-blue-500' : 'fa-venus text-pink-500'} mr-2`}></i>
                                        {patient.name}
                                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            {patient.procedures.length} procedure{patient.procedures.length !== 1 ? 's' : ''}
                                        </span>
                                    </p>
                                    <div className="mt-2">
                                        {patient.procedures.length > 0 ? (
                                            <ul className="space-y-1 text-sm text-gray-600">
                                                {patient.procedures.map(proc => (
                                                    <li key={proc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                        <span className="flex items-center">
                                                            <i className="fas fa-stethoscope text-teal-500 mr-2 text-xs"></i>
                                                            {proc.name}
                                                            <span className="ml-2 text-xs text-gray-500">({proc.points} pts)</span>
                                                        </span>
                                                        {!disabled && onUpdatePatient && (
                                            <Button
                                                onClick={() => handleRemoveProcedureFromPatient(patient.id, proc.id)}
                                                variant="ghost"
                                                size="xs"
                                                icon="times"
                                                className="text-red-400 hover:text-red-600"
                                                aria-label={`Remove ${proc.name}`}
                                            />
                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No procedures assigned</p>
                                        )}
                                        
                                        {!disabled && onUpdatePatient && (
                                            <div className="mt-2">
                                                {showProcedureManager === patient.id ? (
                                            <Card 
                                                title="Add Procedure"
                                                icon="plus-circle"
                                                variant="outlined"
                                                className="border-gray-200 bg-gray-50"
                                            >
                                                <div className="flex justify-end mb-2">
                                                    <Button
                                                        onClick={() => setShowProcedureManager(null)}
                                                        variant="ghost"
                                                        size="xs"
                                                        icon="times"
                                                        className="text-gray-400 hover:text-gray-600"
                                                    />
                                                </div>
                                                <div className="max-h-32 overflow-y-auto space-y-1">
                                                    {getAvailableProceduresForPatient(patient.id).map(procInfo => (
                                                        <Button
                                                            key={procInfo.code}
                                                            onClick={() => {
                                                                handleAddProcedureToPatient(patient.id, procInfo);
                                                                setShowProcedureManager(null);
                                                            }}
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full justify-between text-xs bg-white hover:bg-teal-50 border-gray-200"
                                                        >
                                                            <span>{procInfo.name}</span>
                                                            <span className="text-gray-500">{procInfo.points} pts</span>
                                                        </Button>
                                                    ))}
                                                    {getAvailableProceduresForPatient(patient.id).length === 0 && (
                                                        <p className="text-xs text-gray-500 text-center py-2">All procedures already assigned</p>
                                                    )}
                                                </div>
                                            </Card>
                                                ) : (
                                                    <Button
                                                        onClick={() => setShowProcedureManager(patient.id)}
                                                        variant="outline"
                                                        size="sm"
                                                        icon="plus"
                                                        className="text-teal-600 hover:text-teal-700 border-teal-200 hover:bg-teal-50"
                                                    >
                                                        Add Procedure
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!disabled && (
                                    <Button
                                        onClick={() => onDeletePatient(patient.id)}
                                        variant="ghost"
                                        size="sm"
                                        icon="trash-alt"
                                        className="text-gray-400 hover:text-red-600 ml-2"
                                        aria-label={`Delete patient ${patient.name}`}
                                    />
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
            </Card>
        </div>
    </Card>
  )
}

export default PatientInput;