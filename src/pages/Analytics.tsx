import React, { useEffect, useState } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp, Activity, Target, Zap, Award } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { useTokenSaleStore } from '../store/tokenSaleStore';
import AnimatedCard from '../components/common/AnimatedCard';
import StatsCard from '../components/common/StatsCard';

const Analytics: React.FC = () => {
  const { sales, fetchSales } = useTokenSaleStore();
  const [selectedMetric, setSelectedMetric] = useState('volume');

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Enhanced mock data for charts with more realistic patterns
  const volumeData = [
    { date: '2024-01-01', volume: 12000, participants: 45, sales: 2, transactions: 156 },
    { date: '2024-01-02', volume: 15000, participants: 52, sales: 3, transactions: 203 },
    { date: '2024-01-03', volume: 18000, participants: 61, sales: 2, transactions: 245 },
    { date: '2024-01-04', volume: 22000, participants: 73, sales: 4, transactions: 312 },
    { date: '2024-01-05', volume: 28000, participants: 89, sales: 3, transactions: 398 },
    { date: '2024-01-06', volume: 35000, participants: 102, sales: 5, transactions: 456 },
    { date: '2024-01-07', volume: 42000, participants: 118, sales: 4, transactions: 523 },
  ];

  const tierDistribution = [
    { name: 'Bronze', value: 45, color: '#ea580c', users: 2250 },
    { name: 'Silver', value: 30, color: '#9ca3af', users: 1500 },
    { name: 'Gold', value: 20, color: '#eab308', users: 1000 },
    { name: 'Platinum', value: 5, color: '#a855f7', users: 250 },
  ];

  const saleTypeData = [
    { type: 'Fixed Price', count: 12, raised: 450000, avgParticipants: 156, successRate: 95 },
    { type: 'Dutch Auction', count: 8, raised: 320000, avgParticipants: 203, successRate: 88 },
    { type: 'Lottery', count: 5, raised: 180000, avgParticipants: 89, successRate: 92 },
  ];

  const monthlyData = [
    { month: 'Jan', sales: 8, volume: 250000, participants: 1200, avgRoi: 145 },
    { month: 'Feb', sales: 12, volume: 380000, participants: 1850, avgRoi: 167 },
    { month: 'Mar', sales: 15, volume: 520000, participants: 2400, avgRoi: 189 },
    { month: 'Apr', sales: 18, volume: 680000, participants: 3100, avgRoi: 203 },
    { month: 'May', sales: 22, volume: 850000, participants: 3800, avgRoi: 234 },
    { month: 'Jun', sales: 25, volume: 1200000, participants: 4500, avgRoi: 256 },
  ];

  const topProjects = [
    { name: 'GameFi Protocol', symbol: 'GFP', raised: 185000, participants: 756, roi: '+245%', category: 'Gaming' },
    { name: 'DeFi Token', symbol: 'DFT', raised: 156000, participants: 623, roi: '+189%', category: 'DeFi' },
    { name: 'AI Protocol', symbol: 'AIP', raised: 142000, participants: 534, roi: '+167%', category: 'AI' },
    { name: 'MetaVerse Coin', symbol: 'MVC', raised: 128000, participants: 445, roi: '+134%', category: 'Metaverse' },
    { name: 'Green Energy', symbol: 'GRN', raised: 98000, participants: 389, roi: '+112%', category: 'Sustainability' },
  ];

  const performanceMetrics = [
    { name: 'Success Rate', value: 94, target: 90, color: '#10b981' },
    { name: 'Avg ROI', value: 187, target: 150, color: '#3b82f6' },
    { name: 'Platform Uptime', value: 99.9, target: 99.5, color: '#8b5cf6' },
    { name: 'User Satisfaction', value: 4.8, target: 4.5, color: '#f59e0b' },
  ];

  const categoryData = [
    { category: 'DeFi', count: 15, volume: 450000, color: '#3b82f6' },
    { category: 'Gaming', count: 12, volume: 380000, color: '#10b981' },
    { category: 'AI/ML', count: 8, volume: 290000, color: '#8b5cf6' },
    { category: 'Metaverse', count: 6, volume: 220000, color: '#f59e0b' },
    { category: 'Infrastructure', count: 4, volume: 160000, color: '#ef4444' },
  ];

  // Calculate stats from sales data
  const totalRaised = sales.reduce((sum, sale) => sum + sale.raised, 0);
  const totalParticipants = sales.reduce((sum, sale) => sum + sale.participants, 0);
  const activeSales = sales.filter(sale => sale.status === 'active').length;

  const stats = [
    {
      name: 'Total Volume',
      value: `$${(totalRaised + 2800000).toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-blue-400'
    },
    {
      name: 'Total Participants',
      value: (totalParticipants + 15420).toLocaleString(),
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-400'
    },
    {
      name: 'Active Sales',
      value: (activeSales + 8).toString(),
      change: '+15.3%',
      changeType: 'positive',
      icon: Activity,
      color: 'text-pink-400'
    },
    {
      name: 'Success Rate',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: Target,
      color: 'text-green-400'
    }
  ];

  const metrics = [
    { value: 'volume', label: 'Volume', icon: DollarSign },
    { value: 'participants', label: 'Participants', icon: Users },
    { value: 'transactions', label: 'Transactions', icon: Activity },
    { value: 'sales', label: 'Sales', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen py-12 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedCard direction="down" className="mb-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              <span className="gradient-text">
                Analytics Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive platform metrics, insights, and performance analytics
            </p>
          </div>
        </AnimatedCard>

        {/* Metric Selector */}
        <AnimatedCard direction="up" delay={200} className="mb-8">
          <div className="glass rounded-2xl p-6 border border-gray-700/50">
            <div className="flex flex-wrap justify-center gap-4">
              {metrics.map((metric) => (
                <button
                  key={metric.value}
                  onClick={() => setSelectedMetric(metric.value)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg border transition-all duration-300 ${
                    selectedMetric === metric.value
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                      : 'glass text-white border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <metric.icon className="h-4 w-4" />
                  <span>{metric.label}</span>
                </button>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.name}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              iconColor={stat.color}
              delay={300 + index * 100}
            />
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Primary Chart */}
          <AnimatedCard delay={700} hoverEffect="lift" className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Trading Volume & Activity</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-400">Volume</span>
                  <div className="w-3 h-3 bg-purple-500 rounded-full ml-4"></div>
                  <span className="text-sm text-gray-400">Participants</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="participantsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
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
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="participants" 
                    stroke="#8b5cf6" 
                    fill="url(#participantsGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCard>

          {/* Performance Metrics */}
          <AnimatedCard delay={800} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Performance Metrics</h2>
              <div className="space-y-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={metric.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">{metric.name}</span>
                      <span className="text-white font-semibold">
                        {metric.name === 'User Satisfaction' ? `${metric.value}/5` : `${metric.value}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${Math.min((metric.value / (metric.name === 'User Satisfaction' ? 5 : 100)) * 100, 100)}%`,
                          backgroundColor: metric.color
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Target: {metric.name === 'User Satisfaction' ? `${metric.target}/5` : `${metric.target}%`}</span>
                      <span className={metric.value >= metric.target ? 'text-green-400' : 'text-yellow-400'}>
                        {metric.value >= metric.target ? '✓ On Target' : '⚠ Below Target'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Secondary Charts */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Tier Distribution */}
          <AnimatedCard delay={900} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-6">User Tier Distribution</h2>
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
                    formatter={(value, name, props) => [
                      `${value}% (${props.payload.users} users)`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {tierDistribution.map((tier) => (
                  <div key={tier.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tier.color }}
                    ></div>
                    <span className="text-sm text-gray-300">{tier.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>

          {/* Category Performance */}
          <AnimatedCard delay={1000} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Category Performance</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="category" type="category" stroke="#9ca3af" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="volume" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCard>

          {/* Monthly Trends */}
          <AnimatedCard delay={1100} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Monthly Growth</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgRoi" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCard>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Projects */}
          <AnimatedCard delay={1200} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Top Performing Projects</h2>
              
              <div className="space-y-4">
                {topProjects.map((project, index) => (
                  <div 
                    key={project.symbol} 
                    className="flex items-center justify-between p-4 glass-dark rounded-lg hover:bg-gray-800/50 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{project.name}</div>
                        <div className="text-gray-400 text-sm flex items-center space-x-2">
                          <span>{project.symbol}</span>
                          <span>•</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {project.category}
                          </span>
                        </div>
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
          </AnimatedCard>

          {/* Sale Types Analysis */}
          <AnimatedCard delay={1300} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Sale Type Analysis</h2>
              
              <div className="space-y-6">
                {saleTypeData.map((saleType, index) => (
                  <div 
                    key={saleType.type} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{saleType.type}</span>
                      <span className="text-gray-400 text-sm">{saleType.count} sales</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-gray-400">Total Raised</div>
                        <div className="text-white font-medium">${saleType.raised.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Avg Participants</div>
                        <div className="text-white font-medium">{saleType.avgParticipants}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Success Rate</div>
                        <div className="text-green-400 font-medium">{saleType.successRate}%</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${saleType.successRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Platform Insights */}
        <AnimatedCard delay={1400} className="mt-12">
          <div className="glass rounded-2xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Platform Insights</h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-blue-400 mb-2">98.5%</div>
                <div className="text-white font-medium mb-1">Success Rate</div>
                <div className="text-gray-400 text-sm">Projects reaching soft cap</div>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-purple-400 mb-2">2.3x</div>
                <div className="text-white font-medium mb-1">Average ROI</div>
                <div className="text-gray-400 text-sm">For early participants</div>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-green-400 mb-2">24h</div>
                <div className="text-white font-medium mb-1">Avg Launch Time</div>
                <div className="text-gray-400 text-sm">From submission to live</div>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">4.8/5</div>
                <div className="text-white font-medium mb-1">User Rating</div>
                <div className="text-gray-400 text-sm">Platform satisfaction</div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default Analytics;