import React, { useEffect, useState } from 'react';
import { Search, Filter, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useTokenSaleStore } from '../store/tokenSaleStore';
import TokenSaleCard from '../components/sales/TokenSaleCard';
import AnimatedCard from '../components/common/AnimatedCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { TokenSale } from '../types';

const TokenSales: React.FC = () => {
  const { sales, fetchSales, isLoading } = useTokenSaleStore();
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredSales, setFilteredSales] = useState<TokenSale[]>([]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    let filtered = sales;

    // Apply status filter
    if (filter !== 'All') {
      filtered = filtered.filter(sale => 
        sale.status.toLowerCase() === filter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
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
    }

    setFilteredSales(filtered);
  }, [sales, filter, searchTerm, sortBy]);

  const filterOptions = [
    { value: 'All', label: 'All Sales', icon: Filter },
    { value: 'Active', label: 'Active', icon: TrendingUp },
    { value: 'Upcoming', label: 'Upcoming', icon: Clock },
    { value: 'Ended', label: 'Ended', icon: CheckCircle }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'ending', label: 'Ending Soon' },
    { value: 'raised', label: 'Most Raised' },
    { value: 'participants', label: 'Most Participants' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-400 mt-4">Loading token sales...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              </button>
            ))}
          </div>
        </AnimatedCard>

        {/* Sales Grid */}
        {filteredSales.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSales.map((sale, index) => (
              <TokenSaleCard 
                key={sale.id} 
                sale={sale} 
                delay={index * 100}
              />
            ))}
          </div>
        ) : (
          <AnimatedCard direction="scale" delay={400}>
            <div className="text-center py-12">
              <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'No Results Found' : 
                 filter === 'All' ? 'No Token Sales Yet' : `No ${filter} Sales`}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? `No sales match "${searchTerm}"` :
                 filter === 'All' 
                   ? 'Be the first to launch your project on our platform'
                   : `There are currently no ${filter.toLowerCase()} token sales`
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setFilter('All')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  View All Sales
                </button>
              )}
            </div>
          </AnimatedCard>
        )}

        {/* Load More */}
        {filteredSales.length > 0 && (
          <AnimatedCard direction="up" delay={600} className="text-center mt-12">
            <button className="px-8 py-3 glass text-white rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 transition-all duration-300">
              Load More Sales
            </button>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
};

export default TokenSales;