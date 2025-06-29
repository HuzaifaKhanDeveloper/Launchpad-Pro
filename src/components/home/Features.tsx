import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Box, 
  BarChart3,
  Users,
  Lock,
  Globe,
  DollarSign,
  Clock,
  Zap,
  Target
} from 'lucide-react';
import AnimatedCard from '../common/AnimatedCard';
import StatsCard from '../common/StatsCard';

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      name: 'Multi-Sale Types',
      description: 'Fixed-price, Dutch auctions, and lottery-based token distributions with smart contract automation.',
      icon: DollarSign,
      iconBg: 'bg-green-500',
      details: [
        'Fixed price sales with guaranteed allocations',
        'Dutch auction with dynamic pricing',
        'Lottery system for fair distribution',
        'Automated smart contract execution'
      ]
    },
    {
      name: 'Advanced Security',
      description: 'OpenZeppelin standards, comprehensive audits, and GDPR-compliant data handling.',
      icon: Shield,
      iconBg: 'bg-blue-500',
      details: [
        'OpenZeppelin security standards',
        'Multi-signature wallet support',
        'Automated security checks',
        'Real-time monitoring'
      ]
    },
    {
      name: 'Smart Vesting',
      description: 'Configurable cliff periods, linear vesting schedules, and automated token distribution.',
      icon: Clock,
      iconBg: 'bg-purple-500',
      details: [
        'Flexible vesting schedules',
        'Cliff period configuration',
        'Automated token release',
        'Transparent tracking'
      ]
    },
    {
      name: 'Tier System',
      description: 'Multi-tier participation system based on staking, NFT ownership, and past activity.',
      icon: Users,
      iconBg: 'bg-orange-500',
      details: [
        'Stake-based tier system',
        'Early access benefits',
        'Allocation multipliers',
        'Loyalty rewards'
      ]
    },
    {
      name: 'Enterprise Security',
      description: 'Audit-ready contracts, CertiK-ready implementation, and comprehensive security measures.',
      icon: Lock,
      iconBg: 'bg-red-500',
      details: [
        'Audit-ready smart contracts',
        'Penetration testing',
        'Bug bounty programs',
        'Insurance coverage'
      ]
    },
    {
      name: 'Multi-Chain Ready',
      description: 'EVM-compatible chains starting with Ethereum Sepolia, expandable to mainnet.',
      icon: Globe,
      iconBg: 'bg-indigo-500',
      details: [
        'Ethereum compatibility',
        'Layer 2 integration',
        'Cross-chain bridges',
        'Scalable architecture'
      ]
    },
    {
      name: 'Real-Time Analytics',
      description: 'Comprehensive dashboards with participant tracking, fund monitoring, and performance metrics.',
      icon: BarChart3,
      iconBg: 'bg-cyan-500',
      details: [
        'Live participation metrics',
        'Fund tracking dashboard',
        'Performance analytics',
        'Custom reporting'
      ]
    },
    {
      name: 'Smart Automation',
      description: 'Automated fund collection, refunds, cap enforcement, and token distribution logic.',
      icon: Box,
      iconBg: 'bg-teal-500',
      details: [
        'Automated fund management',
        'Smart refund system',
        'Cap enforcement',
        'Token distribution'
      ]
    }
  ];

  const stats = [
    { 
      title: 'Total Value Launched', 
      value: 50000000, 
      change: '+12.5%', 
      changeType: 'positive' as const, 
      icon: DollarSign,
      iconColor: 'text-green-400'
    },
    { 
      title: 'Successful Projects', 
      value: 150, 
      change: '+8.2%', 
      changeType: 'positive' as const, 
      icon: Target,
      iconColor: 'text-blue-400'
    },
    { 
      title: 'Active Participants', 
      value: 25000, 
      change: '+15.3%', 
      changeType: 'positive' as const, 
      icon: Users,
      iconColor: 'text-purple-400'
    },
    { 
      title: 'Platform Uptime', 
      value: '99.9%', 
      change: '+0.1%', 
      changeType: 'positive' as const, 
      icon: Zap,
      iconColor: 'text-yellow-400'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="py-24 bg-slate-900 relative overflow-hidden" ref={sectionRef}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <AnimatedCard direction="down" className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 glass rounded-full px-6 py-3 border border-slate-700/50 mb-6">
            <Box className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">Complete Platform</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="gradient-text">
              Platform Features
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to launch a successful, compliant, and secure token sale
          </p>
        </AnimatedCard>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              iconColor={stat.iconColor}
              delay={index * 100}
            />
          ))}
        </div>

        {/* Interactive Features Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          {/* Feature List */}
          <div className="space-y-4">
            <AnimatedCard direction="left">
              <h3 className="text-2xl font-bold text-white mb-8">Core Features</h3>
            </AnimatedCard>
            
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <AnimatedCard
                  key={index}
                  delay={index * 100}
                  direction="left"
                  className={`
                    p-4 rounded-xl border transition-all duration-300 cursor-pointer
                    ${activeFeature === index 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50'
                    }
                  `}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center`}>
                      <FeatureIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{feature.name}</h4>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>

          {/* Feature Details */}
          <AnimatedCard direction="right" className="lg:sticky lg:top-8">
            <div className="glass rounded-2xl p-8 border border-slate-700/30">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-16 h-16 ${features[activeFeature].iconBg} rounded-2xl flex items-center justify-center animate-glow`}>
                  {(() => {
                    const ActiveIcon = features[activeFeature].icon;
                    return <ActiveIcon className="h-8 w-8 text-white" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{features[activeFeature].name}</h3>
                  <p className="text-gray-400">{features[activeFeature].description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {features[activeFeature].details.map((detail, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Bottom Section - Call to Action */}
        <AnimatedCard direction="scale" className="text-center">
          <div className="glass rounded-3xl p-12 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Launch Your Token?
            </h3>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of successful projects that have launched on our platform with complete security and compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                <span>Get Started Today</span>
                <Box className="inline-block h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button className="px-8 py-4 glass text-white rounded-xl font-semibold text-lg transition-all duration-300 border border-slate-600/50 hover:border-slate-500/50">
                View Documentation
              </button>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default Features;