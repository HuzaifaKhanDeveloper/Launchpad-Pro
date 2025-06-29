import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Github, Twitter, MessageCircle, ExternalLink, Shield, Zap, BarChart3, Users } from 'lucide-react';
import AnimatedCard from './AnimatedCard';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Token Sales', href: '/sales', icon: BarChart3 },
        { name: 'Create Sale', href: '/create-sale', icon: Rocket },
        { name: 'Staking', href: '/staking', icon: Zap },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '#', icon: ExternalLink },
        { name: 'API Reference', href: '#', icon: ExternalLink },
        { name: 'Help Center', href: '#', icon: ExternalLink },
        { name: 'Security', href: '#', icon: Shield }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#', icon: Users },
        { name: 'Blog', href: '#', icon: ExternalLink },
        { name: 'Careers', href: '#', icon: ExternalLink },
        { name: 'Contact', href: '#', icon: ExternalLink }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '#', icon: ExternalLink },
        { name: 'Terms of Service', href: '#', icon: ExternalLink },
        { name: 'Cookie Policy', href: '#', icon: ExternalLink },
        { name: 'Compliance', href: '#', icon: Shield }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: Twitter, color: 'hover:text-blue-400' },
    { name: 'GitHub', href: '#', icon: Github, color: 'hover:text-gray-300' },
    { name: 'Discord', href: '#', icon: MessageCircle, color: 'hover:text-purple-400' }
  ];

  const features = [
    { name: 'Enterprise Security', icon: Shield },
    { name: 'Multi-Chain Support', icon: Zap },
    { name: 'Real-time Analytics', icon: BarChart3 },
    { name: 'Professional Support', icon: Users }
  ];

  return (
    <footer className="bg-slate-900 border-t border-gray-800/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid opacity-5"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <AnimatedCard direction="up" delay={100}>
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group mb-6">
                <div className="relative p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl group-hover:scale-105 transition-transform duration-300 shadow-lg">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold gradient-text">
                    LaunchPad Pro
                  </span>
                  <div className="text-sm text-gray-400 font-medium">
                    Professional Platform
                  </div>
                </div>
              </Link>
              
              {/* Description */}
              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
                The most secure and compliant decentralized ICO/IDO platform. 
                Launch your project with confidence on Ethereum Sepolia testnet.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div 
                    key={feature.name}
                    className="flex items-center space-x-2 text-sm text-gray-400 animate-fade-in-up"
                    style={{ animationDelay: `${200 + index * 100}ms` }}
                  >
                    <feature.icon className="h-4 w-4 text-blue-400" />
                    <span>{feature.name}</span>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`p-3 glass rounded-xl text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 animate-fade-in-up`}
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </AnimatedCard>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-3 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.map((section, sectionIndex) => (
              <AnimatedCard 
                key={section.title} 
                direction="up" 
                delay={200 + sectionIndex * 100}
              >
                <div>
                  <h3 className="text-white font-semibold text-lg mb-6">
                    {section.title}
                  </h3>
                  <ul className="space-y-4">
                    {section.links.map((link, linkIndex) => (
                      <li 
                        key={link.name}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${300 + sectionIndex * 100 + linkIndex * 50}ms` }}
                      >
                        <Link
                          to={link.href}
                          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 group"
                        >
                          <link.icon className="h-4 w-4 group-hover:text-blue-400 transition-colors duration-300" />
                          <span>{link.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <AnimatedCard direction="up" delay={600}>
          <div className="pt-8 border-t border-gray-800/50">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              {/* Copyright */}
              <div className="text-gray-400 text-center lg:text-left">
                <p className="text-sm">
                  © {currentYear} LaunchPad Pro. All rights reserved.
                </p>
                <p className="text-xs mt-1 text-gray-500">
                  Built on Ethereum Sepolia Testnet • Professional Grade Security
                </p>
              </div>

              {/* Network Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 glass rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Sepolia Network</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 glass rounded-lg">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Additional Info */}
        <AnimatedCard direction="up" delay={700} className="mt-8">
          <div className="glass rounded-2xl p-6 border border-gray-700/50">
            <div className="text-center">
              <h4 className="text-white font-semibold mb-2">Ready to Launch?</h4>
              <p className="text-gray-400 text-sm mb-4">
                Join the next generation of decentralized token launches
              </p>
              <Link
                to="/create-sale"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Rocket className="h-4 w-4" />
                <span>Start Your Sale</span>
              </Link>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </footer>
  );
};

export default Footer;