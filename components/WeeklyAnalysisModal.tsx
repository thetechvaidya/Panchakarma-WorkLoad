import React, { useState, useEffect, useMemo } from 'react';
import type { Scholar, HistoricalAssignmentRecord } from '../types';
import { getWeeklyHistory } from '../services/historyService';

interface WeeklyAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  scholars: Scholar[];
}

interface ScholarWeeklyStats {
  id: string;
  name: string;
  totalPoints: number;
  dailyPoints: (number | null)[];
}

const getISODateString = (date: Date): string => date.toISOString().split('T')[0];

const WeeklyAnalysisModal: React.FC<WeeklyAnalysisModalProps> = ({ isOpen, onClose, scholars }) => {
  const [history, setHistory] = useState<HistoricalAssignmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getWeeklyHistory()
        .then(setHistory)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();
  }, []);

  const weeklyStats = useMemo<ScholarWeeklyStats[]>(() => {
    const historyMap = new Map(history.map(h => [h.date, h.assignments]));

    return scholars.map(scholar => {
      const dailyPoints = last7Days.map(day => {
        const dayStr = getISODateString(day);
        const dayAssignments = historyMap.get(dayStr);
        if (dayAssignments === undefined) return null; // No data for this day
        
        const scholarAssignment = dayAssignments.find(a => a.scholar.id === scholar.id);
        return scholarAssignment ? scholarAssignment.totalPoints : 0; // Scholar was present but had 0 points
      });

      const totalPoints = dailyPoints.reduce((sum, points) => sum + (points || 0), 0);

      return {
        id: scholar.id,
        name: scholar.name,
        totalPoints,
        dailyPoints
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [scholars, history, last7Days]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all" role="dialog" aria-modal="true">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center"><i className="fas fa-chart-line mr-2 text-teal-600"></i>Weekly Workload Analysis</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times fa-lg"></i>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
            {isLoading ? (
                 <div className="text-center text-gray-500 py-16">
                    <i className="fas fa-spinner fa-spin text-4xl text-teal-600 mb-4"></i>
                    <p>Loading historical data...</p>
                </div>
            ) : weeklyStats.length > 0 && history.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3 rounded-l-lg">Scholar Name</th>
                                {last7Days.map(day => (
                                    <th key={day.toISOString()} scope="col" className="px-4 py-3 text-center whitespace-nowrap">
                                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                        <br/>
                                        <span className="font-normal text-gray-500">{day.toLocaleDateString('en-US', { day: '2-digit', month: 'short'})}</span>
                                    </th>
                                ))}
                                <th scope="col" className="px-4 py-3 text-center rounded-r-lg">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weeklyStats.map(stat => (
                                <tr key={stat.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {stat.name}
                                    </th>
                                    {stat.dailyPoints.map((points, index) => (
                                        <td key={index} className="px-4 py-4 text-center">
                                            {points === null ? (
                                                <span className="text-gray-300">-</span>
                                            ) : (
                                                <span className={`font-bold ${points > 0 ? 'text-gray-800' : 'text-gray-400'}`}>{points}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-4 py-4 text-center font-extrabold text-teal-700 bg-teal-50">
                                        {stat.totalPoints}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-16">
                    <i className="fas fa-ghost text-4xl text-gray-300 mb-4"></i>
                    <h4 className="font-bold text-lg text-gray-600">No Historical Data Found</h4>
                    <p>Distribute a workload to start tracking weekly progress.</p>
                </div>
            )}
        </div>
        <div className="p-4 bg-slate-50 rounded-b-xl flex justify-end">
            <button
                onClick={onClose}
                className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyAnalysisModal;
