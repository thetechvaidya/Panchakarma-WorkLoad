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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-white to-gray-50">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center sm:justify-start">
          <i className="fas fa-calendar-day text-teal-600 mr-2"></i>
          Workload Management
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Viewing: <span className="font-semibold text-teal-600">{formatDate(selectedDate)}</span>
        </p>
      </div>
      <div className="flex items-center space-x-2">
         {isLoading && <i className="fas fa-spinner fa-spin text-teal-600 text-lg"></i>}
        <button 
          onClick={handlePrevDay} 
          disabled={isLoading} 
          className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          aria-label="Previous day"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        {!isToday(selectedDate) && (
            <button onClick={handleToday} disabled={isLoading} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-md">
                <i className="fas fa-home mr-1"></i> Today
            </button>
        )}
        <button 
          onClick={handleNextDay} 
          disabled={!canGoForward || isLoading} 
          className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          aria-label="Next day"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default DateNavigator;
