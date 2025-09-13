import React from 'react';

interface ResponsiveTestProps {
  children: React.ReactNode;
}

const ResponsiveTest: React.FC<ResponsiveTestProps> = ({ children }) => {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState('');
  const [screenInfo, setScreenInfo] = React.useState({
    width: 0,
    height: 0,
    ratio: 0,
    orientation: 'portrait'
  });

  React.useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint = '';
      if (width < 375) breakpoint = 'xs';
      else if (width < 640) breakpoint = 'sm';
      else if (width < 768) breakpoint = 'md';
      else if (width < 1024) breakpoint = 'lg';
      else if (width < 1280) breakpoint = 'xl';
      else breakpoint = '2xl';

      setCurrentBreakpoint(breakpoint);
      setScreenInfo({
        width,
        height,
        ratio: window.devicePixelRatio || 1,
        orientation: height > width ? 'portrait' : 'landscape'
      });
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  // Only show in development
  if (import.meta.env.PROD) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Development Screen Info Overlay */}
      <div className="fixed top-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-bl-lg z-50 font-mono">
        <div>BP: {currentBreakpoint}</div>
        <div>{screenInfo.width}×{screenInfo.height}</div>
        <div>DPR: {screenInfo.ratio}</div>
        <div>{screenInfo.orientation}</div>
      </div>
    </>
  );
};

export default ResponsiveTest;