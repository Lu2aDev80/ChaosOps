import React, { useState, useEffect } from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className, 
  style 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsSmallMobile(width < 375);
      setIsMobile(width < 480);
      setIsTablet(width >= 480 && width < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const responsiveStyle: React.CSSProperties = {
    ...style,
    padding: isSmallMobile 
      ? '0.375rem' 
      : isMobile 
        ? '0.5rem' 
        : isTablet 
          ? '0.75rem' 
          : '1rem',
    gap: isSmallMobile 
      ? '0.375rem' 
      : isMobile 
        ? '0.5rem' 
        : isTablet 
          ? '0.75rem' 
          : '1rem',
    fontSize: isSmallMobile 
      ? '0.875rem' 
      : isMobile 
        ? '0.9rem' 
        : '1rem'
  };

  return (
    <div 
      className={className} 
      style={responsiveStyle}
      data-mobile={isMobile}
      data-tablet={isTablet}
      data-small-mobile={isSmallMobile}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;