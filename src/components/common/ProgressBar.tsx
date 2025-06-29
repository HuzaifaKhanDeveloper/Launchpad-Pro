import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  animated = true,
  className = ''
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (!animated) {
      setAnimatedValue(percentage);
      return;
    }

    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [percentage, animated]);

  const colors = {
    primary: 'from-blue-500 to-cyan-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    danger: 'from-red-500 to-pink-500'
  };

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-white">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`
            ${heights[size]} 
            bg-gradient-to-r ${colors[color]} 
            rounded-full transition-all duration-1000 ease-out
            relative overflow-hidden
          `}
          style={{ width: `${animatedValue}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;