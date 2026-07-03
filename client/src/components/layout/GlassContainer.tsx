import React from 'react';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  bright?: boolean;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className = '',
  bright = false,
}) => {
  return (
    <div
      className={`
        ${bright ? 'glass-container-bright' : 'glass-container'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
