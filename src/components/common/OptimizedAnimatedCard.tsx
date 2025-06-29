import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { getOptimizedAnimationDuration, prefersReducedMotion } from '../../utils/performance';

interface OptimizedAnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  onClick?: () => void;
  disableAnimation?: boolean;
}

const OptimizedAnimatedCard: React.FC<OptimizedAnimatedCardProps> = ({
  children,
  className = '',
  hoverEffect = 'lift',
  delay = 0,
  direction = 'up',
  onClick,
  disableAnimation = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { elementRef, isIntersecting, hasTriggered } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  const shouldAnimate = !disableAnimation && !prefersReducedMotion();
  const animationDuration = getOptimizedAnimationDuration(500);

  const animationClasses = useMemo(() => {
    if (!shouldAnimate) return 'opacity-100';
    
    if (!hasTriggered) {
      switch (direction) {
        case 'up':
          return 'opacity-0 translate-y-4';
        case 'down':
          return 'opacity-0 -translate-y-4';
        case 'left':
          return 'opacity-0 translate-x-4';
        case 'right':
          return 'opacity-0 -translate-x-4';
        case 'scale':
          return 'opacity-0 scale-95';
        default:
          return 'opacity-0 translate-y-4';
      }
    }
    return 'opacity-100 translate-y-0 translate-x-0 scale-100';
  }, [shouldAnimate, hasTriggered, direction]);

  const hoverClasses = useMemo(() => {
    if (!isHovered || !shouldAnimate) return '';
    
    switch (hoverEffect) {
      case 'lift':
        return 'transform -translate-y-1 shadow-lg';
      case 'glow':
        return 'shadow-lg shadow-blue-500/20';
      case 'scale':
        return 'transform scale-102';
      default:
        return '';
    }
  }, [isHovered, hoverEffect, shouldAnimate]);

  const transitionStyle = useMemo(() => ({
    transitionDuration: `${animationDuration}ms`,
    transitionDelay: `${delay}ms`,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }), [animationDuration, delay]);

  return (
    <div
      ref={elementRef}
      onClick={onClick}
      className={`
        transition-all will-change-transform
        ${animationClasses}
        ${hoverClasses}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={transitionStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export default OptimizedAnimatedCard;