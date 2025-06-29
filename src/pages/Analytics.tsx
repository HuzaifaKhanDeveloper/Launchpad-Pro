import React, { useEffect, useState } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTokenSaleStore } from '../store/tokenSaleStore';

const Analytics: React.FC = () => {
  const { sales, fetchSales } = useTokenSaleStore();
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Enhanced mock data for charts
  const volumeData = [
    { date: '2024-01-01', volume: 12000, participants: 45, sales: 2 },
    { date: '2024-01-02', volume: 15000, participants: 52, sales: 3 },
    { date: '2024-01-03', volume: 18000, participants: 61, sales: 2 },
    { date: '2024-01-04', volume: 22000, participants: 73, sales: 4 },
    { date: '2024-01-05', volume: 28000, participants: 89, sales: 3 },
    { date: '2024-01-06', volume: 35000, participants: 102, sales: 5 },
    { date: '2024-01-07', volume: 42000, participants: 118, sales: 4 },
  ];

  const tierDistribution = [
    { name: 'Bronze', value: 45, color: '#ea580c' },
    { name: 'Silver', value: 30, color: '#9ca3af' },
    { name: 'Gold', value: 20, color: '#eab308' },
    { name: 'Platinum', value: 5, color: '#a855f7' },
  ];

  const saleTypeData = [
    { type: 'Fixed Price', count: 12, raised: 450000, avgParticipants: 156 },
    { type: 'Dutch Auction', count: 8, raised: 320000, avgParticipants: 203 },
    { type: 'Lottery', count: 5, raised: 180000, avgParticipants: 89 },
  ];

  const monthlyData = [
    { month: 'Jan', sales: 8, volume: 250000, participants: 1200 },
    { month: 'Feb', sales: 12, volume: 380000, participants: 1850 },
    { month: 'Mar', sales: 15, volume: 520000, participants: 2400 },
    { month: 'Apr', sales: 18, volume: 680000, participants: 3100 },
    { month: 'May', sales: 22, volume: 850000, participants: 3800 },
    { month: 'Jun', sales: 25, volume: 1200000, participants: 4500 },
  ];

  const topProjects = [
    { name: 'GameFi Protocol', symbol: 'GFP', raised: 185000, participants: 756, roi: '+245%' },
    { name: 'DeFi Token', symbol: 'DFT', raised: 156000, participants: 623, roi: '+189%' },
    { name: 'AI Protocol', symbol: 'AIP', raised: 142000, participants: 534, roi: '+167%' },
    { name: 'MetaVerse Coin', symbol: 'MVC', raised: 128000, participants: 445, roi: '+134%' },
  ];

  // Calculate stats from sales data
  const totalRaised = sales.reduce((sum, sale) => sum + sale.raised, 0);
  const totalParticipants = sales.reduce((sum, sale) => sum + sale.participants, 0);
  const activeSales = sales.filter(sale => sale.status === 'active').length;
  const avgSaleSize = sales.length > 0 ? totalRaised / sales.length : 0;

  const stats = [
    {
      name: 'Total Volume',
      value: `$${(totalRaised + 1200000).toLocaleString()}`, // Add some base volume
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-blue-400'
    },
    {
      name: 'Total Participants',
      value: (totalParticipants + 8500).toLocaleString(), // Add base participants
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-400'
    },
    {
      name: 'Active Sales',
      value: activeSales.toString(),
      change: '+15.3%',
      changeType: 'positive',
      icon: BarChart3,
      color: 'text-pink-400'
    },
    {
      name: 'Avg Sale Size',
      value: `$${(avgSaleSize + 45000).toLocaleString()}`, // Add base average
      change: '+5.7%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Analytics
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Comprehensive platform metrics and insights
            </p>
          </div>
          
          <div className="flex space-x-2">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  timeRange === range
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-500'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">
                {stat.name}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Volume Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Trading Volume</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#3b82f6" 
                  fill="url(#volumeGradient)" 
                />
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Participants Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Participants Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="participants" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Tier Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Tier Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Sale Types */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Sale Types</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={saleTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="type" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Performance */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Monthly Performance</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="sales" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Projects & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Projects */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Top Performing Projects</h2>
            
            <div className="space-y-4">
              {topProjects.map((project, index) => (
                <div key={project.symbol} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{project.name}</div>
                      <div className="text-gray-400 text-sm">{project.symbol}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">
                      ${project.raised.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {project.participants} participants
                    </div>
                  </div>
                  
                  <div className="text-green-400 font-medium text-sm">
                    {project.roi}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
              {sales.slice(0, 4).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={sale.logo} 
                      alt={sale.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-white font-medium">{sale.name}</div>
                      <div className="text-gray-400 text-sm">{sale.symbol}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">
                      ${sale.raised.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {sale.participants} participants
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                    sale.status === 'active' ? 'bg-green-500' :
                    sale.status === 'upcoming' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}>
                    {sale.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Insights */}
        <div className="mt-12 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-6">Platform Insights</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">98.5%</div>
              <div className="text-white font-medium mb-1">Success Rate</div>
              <div className="text-gray-400 text-sm">Projects reaching soft cap</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">2.3x</div>
              <div className="text-white font-medium mb-1">Average ROI</div>
              <div className="text-gray-400 text-sm">For early participants</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">24h</div>
              <div className="text-white font-medium mb-1">Avg Launch Time</div>
              <div className="text-gray-400 text-sm">From submission to live</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;