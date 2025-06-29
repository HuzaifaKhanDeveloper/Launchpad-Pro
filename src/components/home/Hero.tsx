import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Box, BarChart3, Sparkles, TrendingUp, Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedCard from '../common/AnimatedCard';
import GradientButton from '../common/GradientButton';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMetric, setCurrentMetric] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
    
    // Rotate metrics every 3 seconds
    const interval = setInterval(() => {
      setCurrentMetric(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Audit-Ready Security",
      description: "Built with OpenZeppelin standards and comprehensive security measures for maximum protection.",
      iconBg: "bg-blue-500",
      delay: 100
    },
    {
      icon: Box,
      title: "Multi-Sale Types",
      description: "Fixed price, Dutch auctions, and lottery-based sales with automated smart contract execution.",
      iconBg: "bg-teal-500",
      delay: 200
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time metrics, tier-based participation, and comprehensive reporting dashboards.",
      iconBg: "bg-cyan-500",
      delay: 300
    }
  ];

  const metrics = [
    { value: '$2.8M+', label: 'Total Value Launched', subtext: 'Across 50+ projects', icon: TrendingUp },
    { value: '15,420', label: 'Active Participants', subtext: 'Verified investors', icon: Shield },
    { value: '99.9%', label: 'Platform Uptime', subtext: 'Enterprise reliability', icon: Zap },
    { value: '150+', label: 'Successful Launches', subtext: 'Zero security incidents', icon: Box }
  ];

  const floatingElements = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/10 to-purple-900/10"></div>
        
        {/* Floating elements */}
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-full bg-blue-500/5 blur-xl animate-float"
            style={{
              width: element.size,
              height: element.size,
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`
            }}
          />
        ))}

        {/* Mouse follower */}
        <div
          className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <AnimatedCard delay={0} direction="down" className="mb-8">
            <div className="inline-flex items-center space-x-2 glass rounded-full px-6 py-3 border border-slate-700/50">
              <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-blue-400 font-medium text-sm">Next-Gen Token Launchpad</span>
            </div>
          </AnimatedCard>
          
          {/* Main Heading */}
          <AnimatedCard delay={200} direction="up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="block gradient-text text-shadow">
                Launch Your Token
              </span>
              <span className="block text-white mt-2 text-shadow">
                Securely & Efficiently
              </span>
            </h1>
          </AnimatedCard>
          
          <AnimatedCard delay={400} direction="up">
            <p className="text-xl lg:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              The most advanced decentralized ICO/IDO platform with multi-tier participation, 
              automated vesting schedules, and audit-ready smart contracts on Ethereum Sepolia testnet.
            </p>
          </AnimatedCard>
          
          {/* CTA Buttons */}
          <AnimatedCard delay={600} direction="up" className="mb-20">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sales">
                <GradientButton variant="primary" size="lg" className="group">
                  <TrendingUp className="h-5 w-5" />
                  <span>Explore Token Sales</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </GradientButton>
              </Link>
              
              <Link to="/create-sale">
                <GradientButton variant="secondary" size="lg" className="group">
                  <Lock className="h-5 w-5" />
                  <span>Launch Your Project</span>
                </GradientButton>
              </Link>
            </div>
          </AnimatedCard>
          
          {/* Live Metrics */}
          <AnimatedCard delay={700} direction="scale" className="mb-16">
            <div className="glass rounded-2xl p-8 border border-slate-700/30 max-w-md mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {(() => {
                    const Icon = metrics[currentMetric].icon;
                    return <Icon className="h-8 w-8 text-blue-400 mr-3" />;
                  })()}
                  <div className="text-4xl font-bold gradient-text transition-all duration-500">
                    {metrics[currentMetric].value}
                  </div>
                </div>
                <div className="text-white font-semibold mb-1">
                  {metrics[currentMetric].label}
                </div>
                <div className="text-slate-400 text-sm">
                  {metrics[currentMetric].subtext}
                </div>
              </div>
              
              {/* Metric indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {metrics.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentMetric ? 'bg-blue-400 scale-125' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </AnimatedCard>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <AnimatedCard
                key={index}
                delay={800 + index * 100}
                direction="up"
                hoverEffect="lift"
                className="glass rounded-2xl p-8 border border-slate-700/30 group"
              >
                {/* Icon Container */}
                <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg animate-glow`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300 leading-relaxed text-center">
                  {feature.description}
                </p>
              </AnimatedCard>
            ))}
          </div>
          
          {/* Bottom Stats */}
          <AnimatedCard delay={1200} direction="up" className="mt-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: '50+', label: 'Projects Launched' },
                { value: '$2.8M+', label: 'Total Raised' },
                { value: '15K+', label: 'Active Users' },
                { value: '99.9%', label: 'Platform Uptime' }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-3xl lg:text-4xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 font-medium mt-2 group-hover:text-slate-300 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>

          {/* Call to Action */}
          <AnimatedCard delay={1400} direction="scale" className="mt-20">
            <div className="glass rounded-3xl p-12 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300">
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Launch Your Token?
              </h3>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of successful projects that have launched on our platform with complete security and transparency.
              </p>
              <Link to="/create-sale">
                <GradientButton variant="primary" size="lg" className="group">
                  <span>Get Started Today</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </GradientButton>
              </Link>
            </div>
          </AnimatedCard>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Hero;