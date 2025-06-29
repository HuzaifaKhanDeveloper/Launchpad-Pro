import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    primary: 'border-blue-500/30 border-t-blue-500',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-500/30 border-t-gray-500'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        rounded-full animate-spin
        ${className}
      `}
    />
  );
};

export default LoadingSpinner;