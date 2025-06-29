import React, { useState, useEffect } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import AnimatedCard from './AnimatedCard';

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

const StatsCard: React.FC<StatsCardProps> = ({
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

    const duration = 2000; // 2 seconds
    const steps = 60;
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
    <AnimatedCard
      delay={delay}
      hoverEffect="lift"
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
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
    </AnimatedCard>
  );
};

export default StatsCard;