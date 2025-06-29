import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressiveLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  delay?: number;
  minLoadingTime?: number;
  className?: string;
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  isLoading,
  children,
  skeleton,
  delay = 0,
  minLoadingTime = 500,
  className = ''
}) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setLoadingStartTime(Date.now());
      setShowContent(false);
      
      const timer = setTimeout(() => {
        setShowSkeleton(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      const now = Date.now();
      const elapsed = loadingStartTime ? now - loadingStartTime : 0;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);

      setTimeout(() => {
        setShowSkeleton(false);
        setShowContent(true);
      }, remainingTime);
    }
  }, [isLoading, delay, minLoadingTime, loadingStartTime]);

  if (isLoading && showSkeleton && skeleton) {
    return <div className={className}>{skeleton}</div>;
  }

  if (isLoading && showSkeleton && !skeleton) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (showContent) {
    return <div className={className}>{children}</div>;
  }

  return null;
};

export default ProgressiveLoader;