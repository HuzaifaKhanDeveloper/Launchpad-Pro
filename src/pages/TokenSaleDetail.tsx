import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, UsersIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { TokenSale } from '../types';
import { useTokenSaleStore } from '../store/tokenSaleStore';
import { useTokenSale } from '../hooks/useTokenSale';
import { useWeb3 } from '../hooks/useWeb3';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

const TokenSaleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { sales, fetchSales, isLoading } = useTokenSaleStore();
  const { buyTokens, isLoading: isBuying } = useTokenSale();
  const { isConnected } = useWeb3();
  const { user } = useAuthStore();
  
  const [sale, setSale] = useState<TokenSale | null>(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [ethAmount, setEthAmount] = useState('');

  useEffect(() => {
    if (!sales.length) {
      fetchSales();
    }
  }, [sales.length, fetchSales]);

  useEffect(() => {
    if (id && sales.length > 0) {
      const foundSale = sales.find(s => s.id === id);
      setSale(foundSale || null);
    }
  }, [id, sales]);

  const handleBuyAmountChange = (value: string) => {
    setBuyAmount(value);
    if (sale && value) {
      const ethValue = (parseFloat(value) * sale.tokenPrice).toString();
      setEthAmount(ethValue);
    } else {
      setEthAmount('');
    }
  };

  const handleBuyTokens = async () => {
    if (!sale || !buyAmount || !ethAmount) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (sale.status !== 'active') {
      toast.error('Sale is not active');
      return;
    }

    try {
      await buyTokens(parseInt(sale.id), buyAmount, ethAmount);
      setBuyAmount('');
      setEthAmount('');
      // Refresh sale data
      fetchSales();
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-24">
            <h1 className="text-3xl font-bold text-white mb-4">Sale Not Found</h1>
            <p className="text-gray-300 mb-8">The token sale you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/sales"
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all"
            >
              Back to Sales
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-500';
      case 'upcoming':
        return 'bg-warning-500';
      case 'ended':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const progressPercentage = Math.min((sale.raised / sale.hardCap) * 100, 100);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/sales"
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Token Sales</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src={sale.logo} 
                    alt={sale.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{sale.name}</h1>
                    <p className="text-gray-400 text-lg">{sale.symbol}</p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(sale.status)}`}>
                  {sale.status.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {sale.description}
              </p>

              {/* Links */}
              <div className="flex flex-wrap gap-4">
                {sale.website && (
                  <a
                    href={sale.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Website
                  </a>
                )}
                {sale.twitter && (
                  <a
                    href={sale.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Twitter
                  </a>
                )}
                {sale.telegram && (
                  <a
                    href={sale.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Telegram
                  </a>
                )}
              </div>
            </div>

            {/* Sale Progress */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Sale Progress</h2>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    ${sale.raised.toLocaleString()}
                  </div>
                  <div className="text-gray-400">Raised</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    ${sale.hardCap.toLocaleString()}
                  </div>
                  <div className="text-gray-400">Hard Cap</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {sale.participants}
                  </div>
                  <div className="text-gray-400">Participants</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">
                    ${sale.tokenPrice}
                  </div>
                  <div className="text-gray-400">Token Price</div>
                </div>
              </div>
            </div>

            {/* Sale Details */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Sale Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-primary-400" />
                    <div>
                      <div className="text-white font-medium">Start Time</div>
                      <div className="text-gray-400">{format(sale.startTime, 'PPP p')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-secondary-400" />
                    <div>
                      <div className="text-white font-medium">End Time</div>
                      <div className="text-gray-400">{format(sale.endTime, 'PPP p')}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CurrencyDollarIcon className="h-5 w-5 text-accent-400" />
                    <div>
                      <div className="text-white font-medium">Total Supply</div>
                      <div className="text-gray-400">{sale.totalSupply.toLocaleString()} {sale.symbol}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <UsersIcon className="h-5 w-5 text-warning-400" />
                    <div>
                      <div className="text-white font-medium">Sale Type</div>
                      <div className="text-gray-400 capitalize">{sale.saleType}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
                <div className="flex flex-wrap gap-3">
                  {sale.vestingEnabled && (
                    <div className="flex items-center space-x-2 px-3 py-2 bg-primary-500/10 text-primary-400 rounded-lg">
                      <ClockIcon className="h-4 w-4" />
                      <span>Vesting Enabled</span>
                    </div>
                  )}
                  {sale.whitelist && (
                    <div className="flex items-center space-x-2 px-3 py-2 bg-warning-500/10 text-warning-400 rounded-lg">
                      <UsersIcon className="h-4 w-4" />
                      <span>Whitelist Only</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 px-3 py-2 bg-success-500/10 text-success-400 rounded-lg">
                    <span>✓</span>
                    <span>Audit Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Purchase Tokens</h2>
              
              {sale.status === 'active' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Token Amount
                    </label>
                    <input
                      type="number"
                      value={buyAmount}
                      onChange={(e) => handleBuyAmountChange(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ETH Amount
                    </label>
                    <input
                      type="number"
                      value={ethAmount}
                      readOnly
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                    />
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Token Price</span>
                      <span className="text-white">${sale.tokenPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">You will receive</span>
                      <span className="text-white">{buyAmount || '0'} {sale.symbol}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total cost</span>
                      <span className="text-white">{ethAmount || '0'} ETH</span>
                    </div>
                  </div>

                  <button
                    onClick={handleBuyTokens}
                    disabled={isBuying || !isConnected || !buyAmount}
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuying ? 'Processing...' : 
                     !isConnected ? 'Connect Wallet' :
                     'Buy Tokens'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    {sale.status === 'upcoming' ? 'Sale has not started yet' :
                     sale.status === 'ended' ? 'Sale has ended' :
                     'Sale is not available'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {sale.status === 'upcoming' && `Starts ${format(sale.startTime, 'PPP p')}`}
                    {sale.status === 'ended' && `Ended ${format(sale.endTime, 'PPP p')}`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSaleDetail;