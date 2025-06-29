import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Box, BarChart3, Sparkles, TrendingUp, Lock, Zap, Rocket, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedCard from '../common/AnimatedCard';
import GradientButton from '../common/GradientButton';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMetric, setCurrentMetric] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particlePositions, setParticlePositions] = useState<Array<{x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    setIsLoaded(true);
    
    // Generate particle positions
    const particles = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticlePositions(particles);
    
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
      title: "Enterprise Security",
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
    { value: '$2.8M+', label: 'Total Value Launched', subtext: 'Across 50+ projects', icon: TrendingUp, color: 'from-green-400 to-emerald-400' },
    { value: '15,420', label: 'Active Participants', subtext: 'Verified investors', icon: Shield, color: 'from-blue-400 to-cyan-400' },
    { value: '99.9%', label: 'Platform Uptime', subtext: 'Enterprise reliability', icon: Zap, color: 'from-yellow-400 to-orange-400' },
    { value: '150+', label: 'Successful Launches', subtext: 'Zero security incidents', icon: Box, color: 'from-purple-400 to-pink-400' }
  ];

  const testimonials = [
    { name: "Alex Chen", role: "DeFi Protocol Founder", text: "LaunchPad Pro made our token launch seamless and secure." },
    { name: "Sarah Johnson", role: "GameFi Developer", text: "The tier system and analytics are game-changing for our community." },
    { name: "Michael Rodriguez", role: "Crypto Investor", text: "Best platform for discovering and participating in quality token sales." }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/10 to-purple-900/10"></div>
        
        {/* Floating particles */}
        {particlePositions.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}

        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

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
            <div className="inline-flex items-center space-x-2 glass rounded-full px-6 py-3 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
              <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-blue-400 font-medium text-sm">Next-Gen Token Launchpad</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </AnimatedCard>
          
          {/* Main Heading */}
          <AnimatedCard delay={200} direction="up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="block gradient-text text-shadow animate-gradient-shift">
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
                <GradientButton variant="primary" size="lg" className="group relative overflow-hidden">
                  <TrendingUp className="h-5 w-5" />
                  <span>Explore Token Sales</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </GradientButton>
              </Link>
              
              <Link to="/create-sale">
                <GradientButton variant="secondary" size="lg" className="group relative overflow-hidden">
                  <Rocket className="h-5 w-5" />
                  <span>Launch Your Project</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </GradientButton>
              </Link>
            </div>
          </AnimatedCard>
          
          {/* Live Metrics */}
          <AnimatedCard delay={700} direction="scale" className="mb-16">
            <div className="glass rounded-2xl p-8 border border-slate-700/30 max-w-md mx-auto hover:border-slate-600/50 transition-all duration-300">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {(() => {
                    const Icon = metrics[currentMetric].icon;
                    return (
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${metrics[currentMetric].color} mr-3 animate-glow`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    );
                  })()}
                  <div className={`text-4xl font-bold bg-gradient-to-r ${metrics[currentMetric].color} bg-clip-text text-transparent transition-all duration-500`}>
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
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {features.map((feature, index) => (
              <AnimatedCard
                key={index}
                delay={800 + index * 100}
                direction="up"
                hoverEffect="lift"
                className="glass rounded-2xl p-8 border border-slate-700/30 group hover:border-slate-600/50 transition-all duration-300"
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
          
          {/* Testimonials */}
          <AnimatedCard delay={1200} direction="up" className="mb-16">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-8">Trusted by Industry Leaders</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index}
                    className="glass rounded-xl p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${1300 + index * 100}ms` }}
                  >
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-300 text-sm mb-4 italic">"{testimonial.text}"</p>
                    <div>
                      <div className="text-white font-medium text-sm">{testimonial.name}</div>
                      <div className="text-slate-400 text-xs">{testimonial.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>
          
          {/* Bottom Stats */}
          <AnimatedCard delay={1500} direction="up" className="mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: '50+', label: 'Projects Launched', icon: Rocket },
                { value: '$2.8M+', label: 'Total Raised', icon: TrendingUp },
                { value: '15K+', label: 'Active Users', icon: Shield },
                { value: '99.9%', label: 'Platform Uptime', icon: Zap }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
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

          {/* Final CTA */}
          <AnimatedCard delay={1700} direction="scale">
            <div className="glass rounded-3xl p-12 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center animate-glow">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Launch Your Token?
              </h3>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of successful projects that have launched on our platform with complete security and transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/create-sale">
                  <GradientButton variant="primary" size="lg" className="group">
                    <span>Get Started Today</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </GradientButton>
                </Link>
                <Link to="/analytics">
                  <GradientButton variant="secondary" size="lg">
                    <BarChart3 className="h-5 w-5" />
                    <span>View Analytics</span>
                  </GradientButton>
                </Link>
              </div>
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