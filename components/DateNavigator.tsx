import React, { useState } from 'react';

// Utility to check if a date is today
const isToday = (someDate: Date) => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};

// Utility to check if two dates are the same
const isSameDate = (date1: Date, date2: Date) => {
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
};

// Utility to format date string
const formatDate = (date: Date) => {
  if (isToday(date)) return "Today";
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDate(date, yesterday)) return "Yesterday";
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDate(date, tomorrow)) return "Tomorrow";
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const formatDateShort = (date: Date) => {
  if (isToday(date)) return "Today";
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
  isLoading: boolean;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange, isLoading }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showQuickNav, setShowQuickNav] = useState(false);

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

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };
  
  const handleToday = () => {
    onDateChange(new Date());
    setShowQuickNav(false);
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onDateChange(newDate);
    setShowDatePicker(false);
  };

  const getQuickDates = () => {
    const dates = [];
    const today = new Date();
    
    // Last 7 days
    for (let i = 7; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push({
        date,
        label: i === 1 ? 'Yesterday' : `${i} days ago`,
        isPast: true
      });
    }
    
    // Today
    dates.push({
      date: today,
      label: 'Today',
      isPast: false
    });
    
    return dates;
  };

  const canGoForward = !isToday(selectedDate);
  const todayDate = new Date();
  const maxDate = todayDate.toISOString().split('T')[0];
  const selectedDateString = selectedDate.toISOString().split('T')[0];

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0f766e 0%, #059669 50%, #0d9488 100%)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    color: 'white',
    boxShadow: '0 8px 32px rgba(15, 118, 110, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 50%)',
    pointerEvents: 'none'
  };

  return (
    <div style={headerStyle}>
      <div style={overlayStyle}></div>
      
      {/* Main Header */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fas fa-calendar-alt" style={{ fontSize: '28px' }}></i>
              Panchakarma WLD
            </h1>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
              Workload Distribution System
            </p>
          </div>
          
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '20px' }}></i>
              <span style={{ fontSize: '14px' }}>Loading...</span>
            </div>
          )}
        </div>

        {/* Date Navigation */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.15)', 
          borderRadius: '12px', 
          padding: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Current Date Display */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                {formatDate(selectedDate)}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowQuickNav(!showQuickNav)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fas fa-clock"></i>
                Quick
              </button>
              
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fas fa-calendar"></i>
                Pick Date
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {/* Month Navigation */}
            <button 
              onClick={handlePrevMonth}
              disabled={isLoading}
              style={{
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                textAlign: 'center'
              }}
            >
              <i className="fas fa-angle-double-left" style={{ display: 'block', marginBottom: '4px' }}></i>
              Month
            </button>

            {/* Week Navigation */}
            <button 
              onClick={handlePrevWeek}
              disabled={isLoading}
              style={{
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                textAlign: 'center'
              }}
            >
              <i className="fas fa-angle-left" style={{ display: 'block', marginBottom: '4px' }}></i>
              Week
            </button>

            {/* Day Navigation */}
            <button 
              onClick={handlePrevDay}
              disabled={isLoading}
              style={{
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                textAlign: 'center'
              }}
            >
              <i className="fas fa-chevron-left" style={{ display: 'block', marginBottom: '4px' }}></i>
              Day
            </button>

            {/* Today Button */}
            <button 
              onClick={handleToday}
              disabled={isLoading || isToday(selectedDate)}
              style={{
                padding: '10px',
                backgroundColor: isToday(selectedDate) ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                border: isToday(selectedDate) ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: (isLoading || isToday(selectedDate)) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || isToday(selectedDate)) ? 0.5 : 1,
                textAlign: 'center'
              }}
            >
              <i className="fas fa-home" style={{ display: 'block', marginBottom: '4px' }}></i>
              Today
            </button>
          </div>

          {/* Forward Navigation (when not today) */}
          {canGoForward && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button 
                onClick={handleNextDay}
                disabled={isLoading}
                style={{
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  textAlign: 'center'
                }}
              >
                <i className="fas fa-chevron-right" style={{ marginRight: '4px' }}></i>
                Next Day
              </button>
              
              <button 
                onClick={handleNextWeek}
                disabled={isLoading}
                style={{
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  textAlign: 'center'
                }}
              >
                <i className="fas fa-angle-right" style={{ marginRight: '4px' }}></i>
                Next Week
              </button>
              
              <button 
                onClick={handleNextMonth}
                disabled={isLoading}
                style={{
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  textAlign: 'center'
                }}
              >
                <i className="fas fa-angle-double-right" style={{ marginRight: '4px' }}></i>
                Next Month
              </button>
            </div>
          )}
        </div>

        {/* Quick Navigation Dropdown */}
        {showQuickNav && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '20px',
            right: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            marginTop: '8px',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                Quick Navigation
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {getQuickDates().map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onDateChange(item.date);
                      setShowQuickNav(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: isSameDate(item.date, selectedDate) ? '#0f766e' : '#f9fafb',
                      color: isSameDate(item.date, selectedDate) ? 'white' : '#374151',
                      border: '1px solid',
                      borderColor: isSameDate(item.date, selectedDate) ? '#0f766e' : '#e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{item.label}</span>
                      <span style={{ fontSize: '12px', opacity: 0.7 }}>
                        {formatDateShort(item.date)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Date Picker */}
        {showDatePicker && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '20px',
            right: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            marginTop: '8px',
            zIndex: 1000,
            padding: '16px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              Select Date
            </h3>
            <input
              type="date"
              value={selectedDateString}
              max={maxDate}
              onChange={handleDateSelect}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
              <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
              You can only select dates up to today
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showQuickNav || showDatePicker) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => {
            setShowQuickNav(false);
            setShowDatePicker(false);
          }}
        />
      )}
    </div>
  );
};

export default DateNavigator;
