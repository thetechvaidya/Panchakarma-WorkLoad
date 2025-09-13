import React from 'react';

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

  const navigationItems = [
    { id: 'home', label: 'HOME', icon: 'fa-home', color: '#059669' },
    { id: 'patients', label: 'Patients List', icon: 'fa-users', color: '#0d9488' },
    { id: 'distribute', label: 'Distribute', icon: 'fa-share-alt', color: '#8b5cf6' },
    { id: 'rules', label: 'Rules & Points', icon: 'fa-gavel', color: '#f59e0b' },
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
    fontSize: '10px',
    fontWeight: '500',
    textAlign: 'center'
  };

  const handleItemClick = (item: any) => {
    onViewChange(item.id);
  };

  return (
    <>
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