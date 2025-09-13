import React, { useState } from 'react';

interface MobileNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isVisible: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  currentView, 
  onViewChange, 
  isVisible 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navigationItems = [
    { id: 'patients', label: 'Patients', icon: 'fa-user-plus', color: '#0d9488' },
    { id: 'distribute', label: 'Distribute', icon: 'fa-brain', color: '#8b5cf6' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-bar', color: '#3b82f6' },
    { id: 'menu', label: 'Menu', icon: 'fa-bars', color: '#6b7280' },
  ];

  if (!isVisible) return null;

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb',
    zIndex: 50,
    paddingBottom: 'env(safe-area-inset-bottom)',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 16px'
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    minWidth: '44px',
    minHeight: '44px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer'
  };

  const getButtonStyle = (item: any) => ({
    ...buttonStyle,
    color: currentView === item.id ? item.color : '#6b7280',
    backgroundColor: currentView === item.id ? `${item.color}15` : 'transparent'
  });

  const iconStyle: React.CSSProperties = {
    fontSize: '18px',
    marginBottom: '4px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '500'
  };

  const handleItemClick = (item: any) => {
    if (item.id === 'menu') {
      setIsExpanded(!isExpanded);
    } else {
      onViewChange(item.id);
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Expanded Menu Overlay */}
      {isExpanded && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 45
          }}
          onClick={() => setIsExpanded(false)}
        >
          <div 
            style={{
              position: 'absolute',
              bottom: '70px',
              left: '16px',
              right: '16px',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <button
                style={{
                  padding: '16px 12px',
                  backgroundColor: '#f9fafb',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onClick={() => {
                  onViewChange('patients');
                  setIsExpanded(false);
                }}
              >
                <i className="fas fa-user-plus" style={{ fontSize: '24px', color: '#0d9488', display: 'block', marginBottom: '8px' }}></i>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Add Patient</span>
              </button>
              
              <button
                style={{
                  padding: '16px 12px',
                  backgroundColor: '#f9fafb',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onClick={() => {
                  onViewChange('distribute');
                  setIsExpanded(false);
                }}
              >
                <i className="fas fa-brain" style={{ fontSize: '24px', color: '#8b5cf6', display: 'block', marginBottom: '8px' }}></i>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Smart Distribute</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={navStyle}>
        <div style={containerStyle}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              style={getButtonStyle(item)}
              onClick={() => handleItemClick(item)}
            >
              <i className={`fas ${item.icon}`} style={iconStyle}></i>
              <span style={labelStyle}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;