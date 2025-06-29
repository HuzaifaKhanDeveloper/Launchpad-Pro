import React, { useState, useRef, useEffect } from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverEffect = 'lift',
  delay = 0,
  direction = 'up',
  onClick
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getAnimationClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'opacity-0 translate-y-8';
        case 'down':
          return 'opacity-0 -translate-y-8';
        case 'left':
          return 'opacity-0 translate-x-8';
        case 'right':
          return 'opacity-0 -translate-x-8';
        case 'scale':
          return 'opacity-0 scale-95';
        default:
          return 'opacity-0 translate-y-8';
      }
    }
    return 'opacity-100 translate-y-0 translate-x-0 scale-100';
  };

  const getHoverClass = () => {
    if (!isHovered) return '';
    
    switch (hoverEffect) {
      case 'lift':
        return 'transform -translate-y-2 shadow-2xl shadow-blue-500/10';
      case 'glow':
        return 'shadow-2xl shadow-blue-500/25';
      case 'scale':
        return 'transform scale-105';
      default:
        return '';
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`
        transition-all duration-500 ease-out
        ${getAnimationClass()}
        ${getHoverClass()}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;