import React, { useMemo } from 'react';
import { UNIQUE_PROCEDURES_INFO } from '../constants';
import type { ProcedureGradeInfo } from '../types';

const ProcedureGradeTable: React.FC = () => {
  const proceduresByGrade = useMemo(() => {
    // Group unique procedures by grade
    return UNIQUE_PROCEDURES_INFO.reduce((acc, proc) => {
      (acc[proc.grade] = acc[proc.grade] || []).push(proc);
      return acc;
    }, {} as Record<number, ProcedureGradeInfo[]>);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-book-medical mr-2 text-teal-600"></i>
        Procedure Grade Reference
      </h3>
      <div className="space-y-6">
        {Object.entries(proceduresByGrade)
          .sort(([gradeA], [gradeB]) => Number(gradeA) - Number(gradeB))
          .map(([grade, procedures]) => (
            <div key={grade}>
              <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-gray-700">
                    Grade {grade} Procedures
                  </h4>
                  <span className="text-sm font-bold bg-teal-100 text-teal-700 px-3 py-1 rounded-full">
                    {procedures[0]?.points} Points
                  </span>
              </div>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 list-disc list-inside">
                {procedures.map(proc => (
                  <li key={proc.name} className="truncate" title={proc.name}>
                    <span className="ml-1">{proc.name} <span className="font-mono text-xs text-gray-400">({proc.code})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProcedureGradeTable;
