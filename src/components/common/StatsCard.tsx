import React, { useState, useEffect, memo } from 'react';
import { LucideIcon } from 'lucide-react';
import OptimizedAnimatedCard from './OptimizedAnimatedCard';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
  animated?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = memo(({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-blue-400',
  delay = 0,
  animated = true
}) => {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated || typeof value !== 'number') return;

    const duration = 1500; // Reduced from 2000ms
    const steps = 30; // Reduced from 60
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animated]);

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <OptimizedAnimatedCard
      delay={delay}
      hoverEffect="lift"
      className="glass rounded-2xl p-6 border border-gray-700/50 will-change-transform"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`h-8 w-8 ${iconColor}`} />
        {change && (
          <div className={`flex items-center text-sm ${getChangeColor()}`}>
            <span>{change}</span>
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-white mb-2">
        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
      </div>
      
      <div className="text-gray-400 text-sm font-medium">
        {title}
      </div>
    </OptimizedAnimatedCard>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;