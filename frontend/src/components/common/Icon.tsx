import React from 'react';

interface IconProps {
  icon: React.ComponentType<any>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: { width: 12, height: 12 },
  sm: { width: 16, height: 16 },
  md: { width: 20, height: 20 },
  lg: { width: 24, height: 24 },
};

export const Icon: React.FC<IconProps> = ({ icon: IconComponent, size = 'sm', className = '' }) => {
  const dimensions = sizeMap[size];
  
  return (
    <IconComponent 
      className={`flex-shrink-0 ${className}`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        minWidth: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
        maxWidth: `${dimensions.width}px`,
        maxHeight: `${dimensions.height}px`,
      }}
    />
  );
};
