import React from 'react';

interface IconProps {
  icon: React.ComponentType<any>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ 
  icon: IconComponent, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',   // 16px
    sm: 'w-5 h-5',   // 20px
    md: 'w-6 h-6',   // 24px
    lg: 'w-8 h-8',   // 32px
    xl: 'w-10 h-10'  // 40px
  };

  return (
    <IconComponent 
      className={`${sizeClasses[size]} ${className}`} 
      aria-hidden="true"
    />
  );
};
