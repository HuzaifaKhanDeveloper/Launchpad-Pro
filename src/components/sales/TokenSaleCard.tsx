import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, UsersIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { TokenSale } from '../../types';
import { useTokenSale } from '../../hooks/useTokenSale';
import { useWeb3 } from '../../hooks/useWeb3';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import OptimizedAnimatedCard from '../common/OptimizedAnimatedCard';
import ProgressBar from '../common/ProgressBar';
import GradientButton from '../common/GradientButton';
import LazyImage from '../common/LazyImage';

interface TokenSaleCardProps {
  sale: TokenSale;
  delay?: number;
}

const TokenSaleCard: React.FC<TokenSaleCardProps> = memo(({ sale, delay = 0 }) => {
  const { buyTokens, isLoading } = useTokenSale();
  const { isConnected } = useWeb3();
  const { user } = useAuthStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-yellow-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSaleTypeColor = (type: string) => {
    switch (type) {
      case 'fixed':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'dutch':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'lottery':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const handleQuickBuy = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (sale.status !== 'active') {
      toast.error('Sale is not active');
      return;
    }

    if (!sale.id || isNaN(parseInt(sale.id))) {
      toast.error('Invalid sale ID');
      return;
    }

    try {
      const ethAmount = '0.1';
      const tokenAmount = (0.1 / sale.tokenPrice).toFixed(6);
      
      if (parseFloat(tokenAmount) <= 0) {
        toast.error('Invalid token amount calculated');
        return;
      }

      const remainingTokens = sale.totalSupply - (sale.raised / sale.tokenPrice);
      if (parseFloat(tokenAmount) > remainingTokens) {
        toast.error('Not enough tokens remaining in sale');
        return;
      }

      await buyTokens(parseInt(sale.id), tokenAmount, ethAmount);
    } catch (error: any) {
      console.error('Quick buy failed:', error);
      
      if (error.message.includes('Invalid sale ID')) {
        toast.error('This sale is not available for purchase');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient ETH balance');
      } else if (error.message.includes('exceeds available supply')) {
        toast.error('Not enough tokens available');
      } else if (error.message.includes('user rejected')) {
        toast.error('Transaction cancelled by user');
      } else {
        toast.error('Transaction failed. Please try again.');
      }
    }
  };

  const progressPercentage = Math.min((sale.raised / sale.hardCap) * 100, 100);

  return (
    <OptimizedAnimatedCard 
      delay={delay} 
      hoverEffect="lift" 
      className="glass rounded-2xl p-6 border border-gray-700/50 group will-change-transform"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <LazyImage 
              src={sale.logo} 
              alt={sale.name}
              className="w-12 h-12 rounded-xl ring-2 ring-gray-600/50 group-hover:ring-blue-500/50 transition-all duration-300"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
              {sale.name}
            </h3>
            <p className="text-gray-400">{sale.symbol}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(sale.status)} animate-pulse`}>
            {sale.status.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded border text-xs font-medium ${getSaleTypeColor(sale.saleType)}`}>
            {sale.saleType.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-6 line-clamp-3 group-hover:text-gray-200 transition-colors duration-300">
        {sale.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-dark rounded-lg p-3 group-hover:bg-gray-800/50 transition-all duration-300">
          <div className="flex items-center space-x-2 mb-1">
            <CurrencyDollarIcon className="h-4 w-4 text-green-400" />
            <span className="text-xs text-gray-400">Raised</span>
          </div>
          <div className="text-white font-semibold">
            ${sale.raised.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            / ${sale.hardCap.toLocaleString()}
          </div>
        </div>

        <div className="glass-dark rounded-lg p-3 group-hover:bg-gray-800/50 transition-all duration-300">
          <div className="flex items-center space-x-2 mb-1">
            <UsersIcon className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-gray-400">Participants</span>
          </div>
          <div className="text-white font-semibold">
            {sale.participants}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar
          value={sale.raised}
          max={sale.hardCap}
          label="Progress"
          color="primary"
          animated={true}
        />
      </div>

      {/* Time Info */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
        <div className="flex items-center space-x-1">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {sale.status === 'upcoming' ? 'Starts' : 'Ends'}: {format(sale.status === 'upcoming' ? sale.startTime : sale.endTime, 'MMM dd, yyyy')}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <ClockIcon className="h-4 w-4" />
          <span>${sale.tokenPrice}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sale.vestingEnabled && (
          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">
            Vesting
          </span>
        )}
        {sale.whitelist && (
          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20">
            Whitelist Only
          </span>
        )}
        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">
          ✓ Audit Ready
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Link
          to={`/sales/${sale.id}`}
          className="flex-1 px-4 py-3 glass text-white text-center rounded-lg font-medium transition-all hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50"
        >
          View Details
        </Link>
        
        {sale.status === 'active' && (
          <div className="flex-1">
            <GradientButton
              onClick={handleQuickBuy}
              disabled={isLoading || !isConnected}
              loading={isLoading}
              variant="primary"
              className="w-full"
            >
              {!isConnected ? 'Connect Wallet' : 'Quick Buy (0.1 ETH)'}
            </GradientButton>
          </div>
        )}
      </div>
    </OptimizedAnimatedCard>
  );
});

TokenSaleCard.displayName = 'TokenSaleCard';

export default TokenSaleCard;