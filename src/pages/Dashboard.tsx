import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useWeb3 } from '../hooks/useWeb3';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  BarChart3, 
  Clock, 
  Star,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Wallet,
  Target
} from 'lucide-react';
import AnimatedCard from '../components/common/AnimatedCard';
import StatsCard from '../components/common/StatsCard';
import ProgressBar from '../components/common/ProgressBar';

const Dashboard: React.FC = () => {
  const { user, isConnected: authConnected } = useAuthStore();
  const { isConnected: web3Connected, address } = useWeb3();

  // Check both auth store and web3 connection
  const isFullyConnected = authConnected && web3Connected && user && user.address;

  if (!isFullyConnected) {
    return (
      <div className="min-h-screen py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-24">
            <AnimatedCard direction="scale">
              <div className="glass rounded-2xl p-12 border border-gray-700/50 max-w-md mx-auto">
                <Wallet className="h-16 w-16 text-blue-400 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
                <p className="text-gray-300 mb-8">Please connect your wallet to access the dashboard.</p>
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold"
                >
                  Go Home
                </Link>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'bronze':
        return 'from-orange-600 to-orange-500';
      case 'silver':
        return 'from-gray-400 to-gray-300';
      case 'gold':
        return 'from-yellow-500 to-yellow-400';
      case 'platinum':
        return 'from-purple-500 to-purple-400';
      default:
        return 'from-gray-500 to-gray-400';
    }
  };

  // Mock data
  const portfolioValue = 15420;
  const totalInvested = 12500;
  const activeInvestments = 3;
  const completedInvestments = 7;

  const recentTransactions = [
    { id: '1', type: 'purchase', token: 'DFT', amount: 1000, value: 100, date: '2024-01-15', status: 'confirmed' },
    { id: '2', type: 'claim', token: 'GFP', amount: 500, value: 25, date: '2024-01-14', status: 'confirmed' },
    { id: '3', type: 'stake', token: 'LAUNCH', amount: 2000, value: 400, date: '2024-01-13', status: 'confirmed' },
  ];

  const vestingSchedules = [
    { id: '1', token: 'DFT', total: 10000, claimed: 2000, nextUnlock: '2024-02-01', unlockAmount: 1000 },
    { id: '2', token: 'MVC', total: 5000, claimed: 5000, nextUnlock: 'Fully Vested', unlockAmount: 0 },
  ];

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: portfolioValue,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      iconColor: 'text-green-400'
    },
    {
      title: 'Total Invested',
      value: totalInvested,
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: TrendingUp,
      iconColor: 'text-blue-400'
    },
    {
      title: 'Active Investments',
      value: activeInvestments,
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: Target,
      iconColor: 'text-purple-400'
    },
    {
      title: 'Completed Sales',
      value: completedInvestments,
      change: '+5.7%',
      changeType: 'positive' as const,
      icon: BarChart3,
      iconColor: 'text-yellow-400'
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedCard direction="down" className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="gradient-text">
              Dashboard
            </span>
          </h1>
          <p className="text-gray-300">Welcome back! Here's your investment overview.</p>
        </AnimatedCard>

        {/* User Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Wallet Info */}
          <AnimatedCard delay={100} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Wallet</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-300 text-sm mb-2">Connected Address</p>
              <p className="text-white font-mono text-sm break-all">
                {user.address?.slice(0, 6)}...{user.address?.slice(-4)}
              </p>
            </div>
          </AnimatedCard>

          {/* Tier Status */}
          <AnimatedCard delay={200} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Participation Tier</h3>
                <Star className="h-5 w-5 text-gray-400" />
              </div>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getTierColor(user.tier)} animate-glow`}>
                {user.tier?.toUpperCase() || 'UNRANKED'}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Staked: {(user.stakedAmount || 0).toLocaleString()} LAUNCH
              </p>
              <Link
                to="/staking"
                className="block mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Increase Tier →
              </Link>
            </div>
          </AnimatedCard>
        </div>

        {/* Portfolio Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              iconColor={stat.iconColor}
              delay={300 + index * 100}
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <AnimatedCard delay={700} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
                <Link to="/transactions" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  View All →
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentTransactions.map((tx, index) => (
                  <AnimatedCard key={tx.id} delay={800 + index * 100} direction="left">
                    <div className="flex items-center justify-between p-4 glass-dark rounded-lg hover:bg-gray-800/50 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === 'purchase' ? 'bg-blue-500/20 text-blue-400' :
                          tx.type === 'claim' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {tx.type === 'purchase' ? '↗' : tx.type === 'claim' ? '↓' : '⟳'}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} {tx.token}
                          </div>
                          <div className="text-gray-400 text-sm">{tx.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {tx.amount.toLocaleString()} {tx.token}
                        </div>
                        <div className="text-gray-400 text-sm">
                          ${tx.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          </AnimatedCard>

          {/* Vesting Schedule */}
          <AnimatedCard delay={800} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Vesting Schedule</h3>
                <Link to="/vesting" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  View All →
                </Link>
              </div>
              
              <div className="space-y-4">
                {vestingSchedules.map((vesting, index) => (
                  <AnimatedCard key={vesting.id} delay={900 + index * 100} direction="right">
                    <div className="p-4 glass-dark rounded-lg hover:bg-gray-800/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-white font-medium">{vesting.token}</div>
                        <div className="text-gray-400 text-sm">
                          {Math.round((vesting.claimed / vesting.total) * 100)}% claimed
                        </div>
                      </div>
                      
                      <ProgressBar
                        value={vesting.claimed}
                        max={vesting.total}
                        color="primary"
                        size="sm"
                        className="mb-3"
                      />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {vesting.claimed.toLocaleString()} / {vesting.total.toLocaleString()}
                        </span>
                        <span className="text-gray-400">
                          Next: {vesting.nextUnlock}
                        </span>
                      </div>
                      
                      {vesting.unlockAmount > 0 && (
                        <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg text-sm transition-all duration-300 hover:scale-105">
                          Claim {vesting.unlockAmount.toLocaleString()} {vesting.token}
                        </button>
                      )}
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;