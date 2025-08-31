import React from 'react';
import type { Assignment, AssignedProcedure } from '../types';
import { Gender } from '../types';

interface ResultsDisplayProps {
  assignments: Map<string, Assignment>;
}

const getPointBadgeColor = (points: number) => {
  if (points >= 5) return 'bg-red-200 text-red-800';
  if (points >= 3) return 'bg-yellow-200 text-yellow-800';
  return 'bg-green-200 text-green-800';
};

const ProcedureItem: React.FC<{ item: AssignedProcedure }> = ({ item }) => (
  <li className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200">
    <div>
      <span className="font-semibold text-gray-800">{item.patientName}</span>
      <span className={`ml-2 text-xs font-bold ${item.patientGender === Gender.MALE ? 'text-blue-600' : 'text-pink-600'}`}>
        ({item.patientGender})
      </span>
      <p className="text-sm text-gray-500">{item.procedure.name}</p>
    </div>
    <span className={`text-sm font-bold px-3 py-1 rounded-full ${getPointBadgeColor(item.procedure.points)}`}>
      {item.procedure.points} pts
    </span>
  </li>
);

const ScholarCard: React.FC<{ assignment: Assignment }> = ({ assignment }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col h-[450px]">
    <div className="p-4 bg-slate-50 border-b border-gray-200 flex justify-between items-start">
      <div>
        <h3 className="font-bold text-xl text-gray-800 flex items-center">
          {assignment.scholar.name} 
          <span className="ml-2 text-xs font-semibold text-white bg-cyan-500 px-2 py-0.5 rounded-full">{assignment.scholar.year}yr</span>
        </h3>
        <p className="text-sm text-gray-500 font-medium">
          {assignment.scholar.gender === Gender.MALE ? 'Male' : 'Female'} Scholar
          {!assignment.scholar.isPosted && <span className="ml-2 text-xs font-bold text-orange-600">(Not Posted)</span>}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-3xl font-extrabold text-teal-600">{assignment.totalPoints}</p>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Points</p>
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
    <div>
      <h2 className="text-xl font-bold text-gray-700 mb-4">Assigned Workload</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedAssignments.map(assignment => (
          <ScholarCard key={assignment.scholar.id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;