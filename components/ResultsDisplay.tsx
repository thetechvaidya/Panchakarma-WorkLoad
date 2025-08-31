import React from 'react';
import type { Assignment, AssignedProcedure } from '../types.ts';
import { Gender } from '../types.ts';

interface ResultsDisplayProps {
  assignments: Map<string, Assignment>;
}

const getGradeColor = (grade: 1 | 2 | 3) => {
  switch (grade) {
    case 1: return 'bg-red-100 text-red-800';
    case 2: return 'bg-yellow-100 text-yellow-800';
    case 3: return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const ProcedureItem: React.FC<{ item: AssignedProcedure }> = ({ item }) => (
  <li className="flex justify-between items-center p-2 rounded-md hover:bg-slate-100 transition-colors duration-200">
    <div>
      <span className="font-medium text-gray-700">{item.patientName}</span>
      <span className={`ml-2 text-xs font-semibold ${item.patientGender === Gender.MALE ? 'text-blue-500' : 'text-pink-500'}`}>
        ({item.patientGender})
      </span>
      <p className="text-sm text-gray-500">{item.procedure.name}</p>
    </div>
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getGradeColor(item.procedure.grade)}`}>
      {item.procedure.points} pts
    </span>
  </li>
);

const ScholarCard: React.FC<{ assignment: Assignment }> = ({ assignment }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col">
    <div className="p-4 bg-slate-50 border-b border-gray-200 flex justify-between items-center">
      <div>
        <h3 className="font-bold text-lg text-gray-800">
          {assignment.scholar.name} 
          <span className="ml-2 text-xs font-medium text-white bg-teal-500 px-2 py-0.5 rounded-full">{assignment.scholar.year}yr</span>
        </h3>
        <p className="text-sm text-gray-500">
          {assignment.scholar.gender === Gender.MALE ? 'Male' : 'Female'} Scholar
          {!assignment.scholar.isPosted && <span className="ml-2 text-xs font-bold text-orange-600">(Not Posted)</span>}
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-teal-600">{assignment.totalPoints}</p>
        <p className="text-xs text-gray-500">Total Points</p>
      </div>
    </div>
    <div className="p-2 flex-grow overflow-y-auto">
      {assignment.procedures.length > 0 ? (
        <ul className="space-y-1">
          {assignment.procedures.map((item, index) => <ProcedureItem key={index} item={item} />)}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          No procedures assigned.
        </div>
      )}
    </div>
  </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ assignments }) => {
  const sortedAssignments = Array.from(assignments.values()).sort((a, b) => {
    if (a.scholar.year !== b.scholar.year) return a.scholar.year - b.scholar.year;
    return a.scholar.name.localeCompare(b.scholar.name);
  });

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Assigned Workload</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedAssignments.map(assignment => (
          <ScholarCard key={assignment.scholar.id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;