import React from 'react';
import SkeletonLoader from '../common/SkeletonLoader';
import AnimatedCard from '../common/AnimatedCard';

interface TokenSaleCardSkeletonProps {
  delay?: number;
}

const TokenSaleCardSkeleton: React.FC<TokenSaleCardSkeletonProps> = ({ delay = 0 }) => {
  return (
    <AnimatedCard 
      delay={delay} 
      className="glass rounded-2xl p-6 border border-gray-700/50"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <SkeletonLoader variant="circular" width={48} height={48} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
          </div>
          <div>
            <SkeletonLoader variant="text" width={120} height={20} className="mb-2" />
            <SkeletonLoader variant="text" width={60} height={16} />
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <SkeletonLoader variant="rectangular" width={80} height={24} className="rounded-full" />
          <SkeletonLoader variant="rectangular" width={60} height={20} className="rounded" />
        </div>
      </div>

      {/* Description */}
      <SkeletonLoader variant="text" lines={3} className="mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-dark rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <SkeletonLoader variant="circular" width={16} height={16} />
            <SkeletonLoader variant="text" width={40} height={12} />
          </div>
          <SkeletonLoader variant="text" width={80} height={18} className="mb-1" />
          <SkeletonLoader variant="text" width={60} height={12} />
        </div>

        <div className="glass-dark rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <SkeletonLoader variant="circular" width={16} height={16} />
            <SkeletonLoader variant="text" width={60} height={12} />
          </div>
          <SkeletonLoader variant="text" width={40} height={18} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <SkeletonLoader variant="text" width={60} height={12} />
          <SkeletonLoader variant="text" width={40} height={12} />
        </div>
        <SkeletonLoader variant="rectangular" width="100%" height={8} className="rounded-full" />
      </div>

      {/* Time Info */}
      <div className="flex items-center justify-between text-sm mb-6">
        <div className="flex items-center space-x-1">
          <SkeletonLoader variant="circular" width={16} height={16} />
          <SkeletonLoader variant="text" width={100} height={12} />
        </div>
        <div className="flex items-center space-x-1">
          <SkeletonLoader variant="circular" width={16} height={16} />
          <SkeletonLoader variant="text" width={60} height={12} />
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <SkeletonLoader variant="rectangular" width={60} height={24} className="rounded" />
        <SkeletonLoader variant="rectangular" width={80} height={24} className="rounded" />
        <SkeletonLoader variant="rectangular" width={70} height={24} className="rounded" />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <SkeletonLoader variant="rectangular" width="50%" height={48} className="rounded-lg" />
        <SkeletonLoader variant="rectangular" width="50%" height={48} className="rounded-lg" />
      </div>
    </AnimatedCard>
  );
};

export default TokenSaleCardSkeleton;