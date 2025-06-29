import React, { useState, useRef, useEffect } from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverEffect = 'lift',
  delay = 0,
  direction = 'up'
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
    if (!isVisible) return 'opacity-0';
    
    switch (direction) {
      case 'up':
        return 'animate-fade-in-up';
      case 'down':
        return 'animate-fade-in-down';
      case 'left':
        return 'animate-slide-in-left';
      case 'right':
        return 'animate-slide-in-right';
      case 'scale':
        return 'animate-scale-in';
      default:
        return 'animate-fade-in-up';
    }
  };

  const getHoverClass = () => {
    if (!isHovered) return '';
    
    switch (hoverEffect) {
      case 'lift':
        return 'transform -translate-y-2 shadow-2xl';
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
      className={`
        transition-all duration-300 ease-out
        ${getAnimationClass()}
        ${getHoverClass()}
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