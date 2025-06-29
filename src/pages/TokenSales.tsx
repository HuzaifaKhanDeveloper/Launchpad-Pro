import React, { useEffect, useState } from 'react';
import { Search, Filter, TrendingUp, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useTokenSaleStore } from '../store/tokenSaleStore';
import TokenSaleCard from '../components/sales/TokenSaleCard';
import TokenSaleCardSkeleton from '../components/sales/TokenSaleCardSkeleton';
import AnimatedCard from '../components/common/AnimatedCard';
import LoadingStates from '../components/common/LoadingStates';
import ProgressiveLoader from '../components/common/ProgressiveLoader';
import { TokenSale } from '../types';
import { debounce } from '../utils/performance';

const TokenSales: React.FC = () => {
  const { sales, fetchSales, isLoading, error } = useTokenSaleStore();
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredSales, setFilteredSales] = useState<TokenSale[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Debounced search to improve performance
  const debouncedSearch = debounce((term: string) => {
    setIsSearching(false);
    applyFilters(term, filter, sortBy);
  }, 300);

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      debouncedSearch(searchTerm);
    } else {
      setIsSearching(false);
      applyFilters(searchTerm, filter, sortBy);
    }
  }, [searchTerm]);

  useEffect(() => {
    applyFilters(searchTerm, filter, sortBy);
  }, [sales, filter, sortBy]);

  const applyFilters = (search: string, filterType: string, sort: string) => {
    let filtered = [...sales];

    // Apply status filter
    if (filterType !== 'All') {
      filtered = filtered.filter(sale => 
        sale.status.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.name.toLowerCase().includes(searchLower) ||
        sale.symbol.toLowerCase().includes(searchLower) ||
        sale.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        break;
      case 'ending':
        filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
        break;
      case 'raised':
        filtered.sort((a, b) => b.raised - a.raised);
        break;
      case 'participants':
        filtered.sort((a, b) => b.participants - a.participants);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredSales(filtered);
  };

  const filterOptions = [
    { value: 'All', label: 'All Sales', icon: Filter, count: sales.length },
    { value: 'Active', label: 'Active', icon: TrendingUp, count: sales.filter(s => s.status === 'active').length },
    { value: 'Upcoming', label: 'Upcoming', icon: Clock, count: sales.filter(s => s.status === 'upcoming').length },
    { value: 'Ended', label: 'Ended', icon: CheckCircle, count: sales.filter(s => s.status === 'ended').length }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'ending', label: 'Ending Soon' },
    { value: 'raised', label: 'Most Raised' },
    { value: 'participants', label: 'Most Participants' },
    { value: 'alphabetical', label: 'A-Z' }
  ];

  const handleRetry = () => {
    fetchSales();
  };

  const renderSkeletonGrid = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <TokenSaleCardSkeleton key={index} delay={index * 100} />
      ))}
    </div>
  );

  const renderContent = () => {
    if (error) {
      return (
        <LoadingStates
          type="error"
          title="Failed to Load Token Sales"
          message="We couldn't load the token sales. Please check your connection and try again."
          onRetry={handleRetry}
        />
      );
    }

    if (!isLoading && filteredSales.length === 0 && sales.length === 0) {
      return (
        <LoadingStates
          type="empty"
          title="No Token Sales Yet"
          message="Be the first to launch your project on our platform! Create your token sale and reach thousands of potential investors."
          onRetry={handleRetry}
        />
      );
    }

    if (!isLoading && filteredSales.length === 0 && sales.length > 0) {
      return (
        <LoadingStates
          type="empty"
          title={searchTerm ? 'No Results Found' : `No ${filter} Sales`}
          message={
            searchTerm 
              ? `No sales match "${searchTerm}". Try adjusting your search terms.`
              : `There are currently no ${filter.toLowerCase()} token sales. Try a different filter.`
          }
          onRetry={() => {
            setSearchTerm('');
            setFilter('All');
          }}
        />
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSales.map((sale, index) => (
          <TokenSaleCard 
            key={sale.id} 
            sale={sale} 
            delay={index * 50} // Reduced delay for faster loading feel
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-12 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedCard direction="down" className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="gradient-text">
              Token Sales
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover and participate in carefully vetted token sales with built-in compliance and security features
          </p>
        </AnimatedCard>

        {/* Search and Filters */}
        <AnimatedCard direction="up" delay={200} className="mb-8">
          <div className="glass rounded-2xl p-6 border border-gray-700/50">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search token sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </AnimatedCard>

        {/* Filter Tabs */}
        <AnimatedCard direction="up" delay={300} className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {filterOptions.map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg border transition-all duration-300
                  ${filter === filterOption.value
                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'glass text-white border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                  }
                `}
              >
                <filterOption.icon className="h-4 w-4" />
                <span>{filterOption.label}</span>
                {filterOption.count > 0 && (
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${filter === filterOption.value 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-600/50 text-gray-300'
                    }
                  `}>
                    {filterOption.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </AnimatedCard>

        {/* Results Count */}
        {!isLoading && (
          <AnimatedCard direction="up" delay={400} className="mb-6">
            <div className="text-center">
              <p className="text-gray-400">
                {isSearching ? (
                  <span className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </span>
                ) : (
                  `Showing ${filteredSales.length} of ${sales.length} token sales`
                )}
              </p>
            </div>
          </AnimatedCard>
        )}

        {/* Sales Grid with Progressive Loading */}
        <ProgressiveLoader
          isLoading={isLoading}
          skeleton={renderSkeletonGrid()}
          delay={200}
          minLoadingTime={800}
        >
          {renderContent()}
        </ProgressiveLoader>

        {/* Load More Button */}
        {!isLoading && filteredSales.length > 0 && filteredSales.length >= 9 && (
          <AnimatedCard direction="up" delay={600} className="text-center mt-12">
            <button 
              onClick={() => {
                // Implement pagination logic here
                console.log('Load more sales');
              }}
              className="px-8 py-3 glass text-white rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 transition-all duration-300 group"
            >
              <span className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                <span>Load More Sales</span>
              </span>
            </button>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
};

export default TokenSales;