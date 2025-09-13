import React from 'react';

interface MobileViewContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const MobileViewContainer: React.FC<MobileViewContainerProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  className = '',
  showBackButton = false,
  onBack
}) => {
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 30,
    paddingTop: 'env(safe-area-inset-top)'
  };

  const headerContentStyle: React.CSSProperties = {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const titleSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0
  };

  const backButtonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    paddingBottom: window.innerWidth < 640 ? '80px' : '16px'
  };

  const contentStyle: React.CSSProperties = {
    padding: '16px'
  };

  return (
    <div style={{ ...containerStyle }} className={className}>
      {/* Mobile Header */}
      {(title || showBackButton || headerActions) && (
        <header style={headerStyle}>
          <div style={headerContentStyle}>
            <div style={titleSectionStyle}>
              {showBackButton && (
                <button
                  onClick={onBack}
                  style={backButtonStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                >
                  <i className="fas fa-arrow-left" style={{ color: '#6b7280' }}></i>
                </button>
              )}
              
              {title && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={titleStyle}>{title}</h1>
                  {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
                </div>
              )}
            </div>
            
            {headerActions && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {headerActions}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main style={mainStyle}>
        <div style={contentStyle}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MobileViewContainer;