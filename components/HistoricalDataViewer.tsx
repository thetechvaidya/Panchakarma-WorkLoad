import React, { useState, useEffect } from 'react';
import type { HistoricalAssignmentRecord } from '../types';
import { 
  getDateRangeHistory, 
  getMonthlyHistory, 
  getCurrentMonthHistory, 
  getDayWiseHistory, 
  getDateRangeStats 
} from '../services/historyService';
import ErrorDisplay from './ErrorDisplay';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useLoadingState } from '../hooks/useLoadingState';

interface HistoricalDataViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'date-range' | 'monthly' | 'day-wise' | 'current-month';

const HistoricalDataViewer: React.FC<HistoricalDataViewerProps> = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('current-month');
  const [historicalData, setHistoricalData] = useState<HistoricalAssignmentRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const { error, isError, logError, clearError, withErrorHandling } = useErrorHandler();
  const { isLoading: loading, withLoading } = useLoadingState();
  
  // Date range inputs
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Monthly inputs
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Day-wise inputs
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [dayLimit, setDayLimit] = useState(30);

  const fetchData = async () => {
    clearError();
    
    const result = await withLoading(async () => {
      return await withErrorHandling(async () => {
        let data: HistoricalAssignmentRecord[] = [];
        let statsData = null;
        
        switch (viewMode) {
          case 'current-month':
            data = await getCurrentMonthHistory();
            break;
            
          case 'date-range':
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              data = await getDateRangeHistory(start, end);
              statsData = await getDateRangeStats(start, end);
            }
            break;
            
          case 'monthly':
            data = await getMonthlyHistory(selectedYear, selectedMonth);
            break;
            
          case 'day-wise':
            data = await getDayWiseHistory(dayOfWeek, dayLimit);
            break;
        }
        
        setHistoricalData(data);
        setStats(statsData);
        return data;
      }, `Fetching ${viewMode} historical data`);
    }, { message: 'Loading historical data...', minDuration: 300 });
    
    if (!result) {
      setHistoricalData([]);
      setStats(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, viewMode]);

  const getDayName = (dayNum: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  const getMonthName = (monthNum: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center">
              <i className="fas fa-history mr-3"></i>
              Historical Data Viewer
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Error Display */}
          {isError && (
            <ErrorDisplay 
              error={error}
              onRetry={fetchData}
              onDismiss={clearError}
              variant="inline"
            />
          )}
          
          {/* View Mode Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Select View Mode</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setViewMode('current-month')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  viewMode === 'current-month'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-calendar-month mb-2 block"></i>
                Current Month
              </button>
              
              <button
                onClick={() => setViewMode('date-range')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  viewMode === 'date-range'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-calendar-range mb-2 block"></i>
                Date Range
              </button>
              
              <button
                onClick={() => setViewMode('monthly')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  viewMode === 'monthly'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-calendar-alt mb-2 block"></i>
                Monthly View
              </button>
              
              <button
                onClick={() => setViewMode('day-wise')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  viewMode === 'day-wise'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-calendar-day mb-2 block"></i>
                Day-wise
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            {viewMode === 'date-range' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchData}
                    disabled={!startDate || !endDate || loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                  >
                    {loading && <i className="fas fa-spinner fa-spin mr-2"></i>}
                    {loading ? 'Loading...' : 'Fetch Data'}
                  </button>
                </div>
              </div>
            )}

            {viewMode === 'monthly' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                  >
                    {loading && <i className="fas fa-spinner fa-spin mr-2"></i>}
                    {loading ? 'Loading...' : 'Fetch Data'}
                  </button>
                </div>
              </div>
            )}

            {viewMode === 'day-wise' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 7 }, (_, i) => (
                      <option key={i} value={i}>
                        {getDayName(i)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limit (Records)
                  </label>
                  <input
                    type="number"
                    value={dayLimit}
                    onChange={(e) => setDayLimit(parseInt(e.target.value))}
                    min="1"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? 'Loading...' : 'Fetch Data'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Statistics */}
          {stats && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                <i className="fas fa-chart-bar mr-2 text-green-600"></i>
                Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total_days}</div>
                  <div className="text-sm text-gray-600">Total Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.total_scholars}</div>
                  <div className="text-sm text-gray-600">Total Scholars</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.total_patients}</div>
                  <div className="text-sm text-gray-600">Total Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.total_assignments}</div>
                  <div className="text-sm text-gray-600">Total Assignments</div>
                </div>
              </div>
              {stats.most_active_scholar && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-600">Most Active Scholar: </span>
                  <span className="font-semibold text-blue-600">{stats.most_active_scholar}</span>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
              <p className="text-gray-600">Loading historical data...</p>
            </div>
          )}

          {/* Historical Data Display */}
          {!loading && historicalData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <i className="fas fa-database mr-2 text-blue-600"></i>
                Historical Records ({historicalData.length} days)
              </h3>
              
              <div className="grid gap-4">
                {historicalData.map((record, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-800">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h4>
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <span><i className="fas fa-user-graduate mr-1"></i>{record.scholars?.length || 0} scholars</span>
                        <span><i className="fas fa-user-injured mr-1"></i>{record.patients?.length || 0} patients</span>
                        <span><i className="fas fa-tasks mr-1"></i>{record.assignments?.length || 0} assignments</span>
                      </div>
                    </div>
                    
                    {record.assignments && record.assignments.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {record.assignments.map((assignment: any, assignIndex: number) => (
                          <div key={assignIndex} className="bg-gray-50 p-3 rounded border">
                            <div className="font-medium text-gray-800 mb-2">
                              {assignment.scholar?.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {assignment.procedures?.length || 0} procedures assigned
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Data State */}
          {!loading && historicalData.length === 0 && !isError && (
            <div className="text-center py-8">
              <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No historical data found for the selected criteria.</p>
              <button
                onClick={fetchData}
                className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center mx-auto"
              >
                <i className="fas fa-refresh mr-2"></i>
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricalDataViewer;