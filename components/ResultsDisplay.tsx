import React, { useState, useMemo } from 'react';
import type { Assignment, AssignedProcedure } from '../types';
import { Gender } from '../types';

interface ResultsDisplayProps {
  assignments: Map<string, Assignment>;
  onExport: () => void;
}

const getPointBadgeColor = (points: number) => {
  if (points === 3) return 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200/50';
  if (points === 2) return 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200/50';
  return 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200/50';
};

const ProcedureItem: React.FC<{ item: AssignedProcedure }> = ({ item }) => (
  <li className="py-2.5 px-3 border-b border-gray-200 last:border-b-0">
    <div className="flex justify-between items-start gap-2">
      <div className="flex-grow">
        <div className="font-semibold text-gray-800 flex items-center text-sm">
          <i className={`w-4 text-center fas ${item.patientGender === Gender.MALE ? 'fa-mars text-blue-500' : 'fa-venus text-pink-500'} mr-2`}></i>
          {item.patientName}
        </div>
        <p className="text-sm text-gray-500 ml-6">
            {item.procedure.name} <span className="font-mono text-xs text-gray-400">({item.procedure.code})</span>
        </p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getPointBadgeColor(item.procedure.points)}`}>
        {item.procedure.points} pts
      </span>
    </div>
  </li>
);


const ScholarCard: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
    const yearColors: Record<number, string> = {
        1: 'border-sky-500',
        2: 'border-indigo-500',
        3: 'border-emerald-500'
    };
    return (
        <div className={`bg-white rounded-xl shadow-md flex flex-col min-h-[450px] border-t-4 ${yearColors[assignment.scholar.year] || 'border-gray-300'}`}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-start">
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
                <p className="text-4xl font-extrabold text-teal-600">
                    {assignment.totalPoints}
                    <span className="text-xl font-semibold text-gray-400">/{Math.round(assignment.targetPoints)}</span>
                </p>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Actual / Target</p>
            </div>
            </div>
            <div className="p-1.5 flex-grow overflow-y-auto bg-gray-50/75">
            {assignment.procedures.length > 0 ? (
                <ul className="space-y-0.5">
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
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ assignments, onExport }) => {
  const [sortBy, setSortBy] = useState<'year' | 'name' | 'points'>('year');

  const sortedAssignments = useMemo(() => {
    return Array.from(assignments.values()).sort((a, b) => {
      switch (sortBy) {
        case 'points':
          if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
          return a.scholar.name.localeCompare(b.scholar.name);
        case 'name':
          return a.scholar.name.localeCompare(b.scholar.name);
        case 'year':
        default:
          if (a.scholar.year !== b.scholar.year) return a.scholar.year - b.scholar.year;
          return a.scholar.name.localeCompare(b.scholar.name);
      }
    });
  }, [assignments, sortBy]);
  
  const SortButton = ({ value, label }: { value: typeof sortBy, label: string }) => (
    <button
      onClick={() => setSortBy(value)}
      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${sortBy === value ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
    >
      {label}
    </button>
  );

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-700">Assigned Workload</h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 space-x-1">
                    <span className="text-sm font-semibold text-gray-500 mr-2 ml-1">Sort by:</span>
                    <SortButton value="year" label="Year" />
                    <SortButton value="points" label="Points" />
                    <SortButton value="name" label="Name" />
                </div>
                <button
                    onClick={onExport}
                    className="bg-white text-teal-600 border border-teal-600 font-bold py-2 px-4 rounded-lg hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 flex items-center space-x-2 text-sm ml-auto"
                >
                    <i className="fas fa-file-export"></i>
                    <span>Export</span>
                </button>
            </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedAssignments.map(assignment => (
          <ScholarCard key={assignment.scholar.id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;