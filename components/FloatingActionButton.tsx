import React, { useState } from 'react';

interface FloatingActionButtonProps {
  onQuickDistribute: () => void;
  onAddPatient: () => void;
  onShowAnalytics: () => void;
  disabled?: boolean;
  isVisible?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onQuickDistribute,
  onAddPatient,
  onShowAnalytics,
  disabled = false,
  isVisible = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      id: 'distribute',
      label: 'Quick Distribute',
      icon: 'fa-brain',
      color: '#0d9488',
      action: onQuickDistribute,
    },
    {
      id: 'add-patient',
      label: 'Add Patient',
      icon: 'fa-user-plus',
      color: '#3b82f6',
      action: onAddPatient,
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      icon: 'fa-chart-bar',
      color: '#8b5cf6',
      action: onShowAnalytics,
    },
  ];

  if (!isVisible) return null;

  const fabContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '100px',
    right: '16px',
    zIndex: 40,
    display: window.innerWidth < 640 ? 'block' : 'none'
  };

  const expandedActionsStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '70px',
    right: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const actionButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer'
  };

  const actionIconStyle = (color: string): React.CSSProperties => ({
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: color,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s ease'
  });

  const labelStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: 'white',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '6px',
    whiteSpace: 'nowrap'
  };

  const mainFabStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0d9488, #0f766e)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    opacity: disabled ? 0.5 : 1,
    transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)'
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1
  };

  return (
    <div style={fabContainerStyle}>
      {/* Expanded Actions */}
      {isExpanded && (
        <div style={expandedActionsStyle}>
          {quickActions.map((action) => (
            <div key={action.id} style={actionButtonStyle}>
              <span style={labelStyle}>{action.label}</span>
              <button
                onClick={() => {
                  action.action();
                  setIsExpanded(false);
                }}
                disabled={disabled}
                style={actionIconStyle(action.color)}
                onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <i className={`fas ${action.icon}`} style={{ fontSize: '18px' }}></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div style={backdropStyle} onClick={() => setIsExpanded(false)}></div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        style={mainFabStyle}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = `scale(1.1) rotate(${isExpanded ? '45deg' : '0deg'})`)}
        onMouseLeave={(e) => (e.currentTarget.style.transform = `scale(1) rotate(${isExpanded ? '45deg' : '0deg'})`)}
      >
        <i className={`fas ${isExpanded ? 'fa-times' : 'fa-plus'}`} style={{ fontSize: '20px', transition: 'transform 0.2s ease' }}></i>
      </button>
    </div>
  );
};

export default FloatingActionButton;