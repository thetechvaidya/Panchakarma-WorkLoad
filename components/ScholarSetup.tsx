import React from 'react';
import type { Scholar } from '../types';
import { Gender } from '../types';

interface ScholarSetupProps {
  scholars: Scholar[];
  onToggleScholarStatus: (id: string, currentStatus: boolean) => void;
}

const ScholarSetup: React.FC<ScholarSetupProps> = ({ scholars, onToggleScholarStatus }) => {

  const scholarsByYear = scholars.reduce((acc, scholar) => {
    (acc[scholar.year] = acc[scholar.year] || []).push(scholar);
    return acc;
  }, {} as Record<number, Scholar[]>);
  
  // Ensure years are sorted numerically
  const sortedYears = Object.keys(scholarsByYear).map(Number).sort((a,b) => a-b);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">PG Scholar Posting Status</h3>
      <div className="space-y-4">
        {sortedYears.map(year => (
          <div key={year}>
            <h4 className="font-semibold text-gray-600 mb-2 border-b pb-1">
              {year}{year === 1 ? 'st' : year === 2 ? 'nd' : 'rd'} Year Scholars
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
              {scholarsByYear[year].map(scholar => (
                <div key={scholar.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`scholar-${scholar.id}`}
                    checked={scholar.isPosted}
                    onChange={() => onToggleScholarStatus(scholar.id, scholar.isPosted)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor={`scholar-${scholar.id}`} className="ml-2 block text-sm text-gray-700 truncate">
                    {scholar.name}
                    <span className={`ml-1 text-xs ${scholar.gender === Gender.MALE ? 'text-blue-500' : 'text-pink-500'}`}>
                      ({scholar.gender})
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScholarSetup;
