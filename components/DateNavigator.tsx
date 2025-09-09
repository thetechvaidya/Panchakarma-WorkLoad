import React from 'react';

// Utility to check if a date is today
const isToday = (someDate: Date) => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};

// Utility to format date string
const formatDate = (date: Date) => {
    if (isToday(date)) return "Today";
    return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
  isLoading: boolean;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange, isLoading }) => {
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };
  
  const handleToday = () => {
      onDateChange(new Date());
  }

  const canGoForward = !isToday(selectedDate);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <h2 className="text-xl font-bold text-gray-800 text-center sm:text-left">
        Workload for: <span className="text-teal-600">{formatDate(selectedDate)}</span>
      </h2>
      <div className="flex items-center space-x-2">
         {isLoading && <i className="fas fa-spinner fa-spin text-teal-600 text-lg"></i>}
        <button 
          onClick={handlePrevDay} 
          disabled={isLoading} 
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous day"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        {!isToday(selectedDate) && (
            <button onClick={handleToday} disabled={isLoading} className="px-4 py-2 bg-teal-100 text-teal-700 font-semibold rounded-lg hover:bg-teal-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                Go to Today
            </button>
        )}
        <button 
          onClick={handleNextDay} 
          disabled={!canGoForward || isLoading} 
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next day"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default DateNavigator;
