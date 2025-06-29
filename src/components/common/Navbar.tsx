import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Rocket, User, ChevronDown, BarChart3, Coins, Zap, Wallet, Plus } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  dropdown?: DropdownItem[];
}

interface DropdownItem {
  name: string;
  href: string;
}

interface WalletState {
  address: string;
  balance: string;
  chainId: string;
  isConnecting: boolean;
}

// Declare ethereum on window object
declare global {
  interface Window {
    ethereum?: any;
  }
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [showWalletDropdown, setShowWalletDropdown] = useState<boolean>(false);
  const [wallet, setWallet] = useState<WalletState>({
    address: '',
    balance: '0.00',
    chainId: '',
    isConnecting: false
  });
  const location = useLocation();

  const isConnected = Boolean(wallet.address);

  // Enhanced navigation with create sale option
  const navigation: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { 
      name: 'Token Sales', 
      href: '/sales', 
      icon: Coins,
      dropdown: [
        { name: 'Browse Sales', href: '/sales' },
        { name: 'Create Sale', href: '/create-sale' }
      ]
    },
    { name: 'Staking', href: '/staking', icon: Zap },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Element;
      if (!target.closest('.wallet-dropdown')) {
        setShowWalletDropdown(false);
      }
      if (!target.closest('.nav-dropdown')) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async (): Promise<void> => {
    try {
      if (!window.ethereum) return;
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await updateWalletInfo(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const updateWalletInfo = async (address: string): Promise<void> => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Convert balance from wei to ETH
      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
      
      setWallet({
        address,
        balance: balanceInEth,
        chainId,
        isConnecting: false
      });
    } catch (error) {
      console.error('Error updating wallet info:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const handleAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setWallet({
        address: '',
        balance: '0.00',
        chainId: '',
        isConnecting: false
      });
    } else {
      // User switched accounts - don't show toast
      updateWalletInfo(accounts[0]);
    }
  };

  const handleChainChanged = (): void => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActive = (path: string): boolean => location.pathname === path;

  const handleMobileNavClick = (): void => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (index: number): void => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const connectWallet = async (): Promise<void> => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it to use this feature.');
      return;
    }

    try {
      setWallet(prev => ({ ...prev, isConnecting: true }));
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        await updateWalletInfo(accounts[0]);
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
      
      if (error.code === 4001) {
        // User rejected the request
        alert('Please connect to MetaMask to continue.');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    }
  };

  const disconnectWallet = (): void => {
    setWallet({
      address: '',
      balance: '0.00',
      chainId: '',
      isConnecting: false
    });
    setShowWalletDropdown(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg shadow-slate-900/20' 
        : 'bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative p-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg">
              <Rocket className="h-6 w-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                LaunchPad Pro
              </span>
              <div className="text-xs text-slate-400 font-medium">
                Professional Platform
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center max-w-lg">
            <div className="flex items-center space-x-1">
              {navigation.map((item, index) => (
                <div key={item.name} className="relative nav-dropdown">
                  {item.dropdown ? (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(index)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          isActive(item.href) || activeDropdown === index
                            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="hidden xl:inline">{item.name}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === index ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {activeDropdown === index && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-xl shadow-slate-900/30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {item.dropdown.map((dropItem) => (
                            <Link
                              key={dropItem.name}
                              to={dropItem.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center space-x-2 w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
                            >
                              {dropItem.name === 'Create Sale' && <Plus className="h-4 w-4" />}
                              <span>{dropItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span className="hidden xl:inline">{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            {/* Create Sale Button */}
            {isConnected && (
              <Link
                to="/create-sale"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>Create Sale</span>
              </Link>
            )}

            {isConnected ? (
              <div className="flex items-center space-x-2">
                {/* Compact Wallet Info with Dropdown */}
                <div className="relative wallet-dropdown">
                  <button
                    onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                    className="flex items-center space-x-3 px-3 py-2 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:bg-slate-700/60 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="text-left">
                        <div className="text-xs text-slate-400">Balance</div>
                        <div className="text-sm font-semibold text-white">{wallet.balance} ETH</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Address</div>
                      <div className="text-sm font-semibold text-green-400">{formatAddress(wallet.address)}</div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      showWalletDropdown ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Wallet Dropdown */}
                  {showWalletDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-xl shadow-slate-900/30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-700/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <div>
                            <div className="text-sm font-medium text-white">Wallet Connected</div>
                            <div className="text-xs text-slate-400">{wallet.address}</div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-b border-slate-700/50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Balance:</span>
                          <span className="text-sm font-semibold text-white">{wallet.balance} ETH</span>
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link 
                          to="/dashboard"
                          onClick={() => setShowWalletDropdown(false)}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
                        >
                          <User className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <button
                          onClick={disconnectWallet}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={wallet.isConnecting}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
              >
                {wallet.isConnecting ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${
        isOpen 
          ? 'max-h-screen opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50 px-4 py-6 space-y-1">
          {navigation.map((item, index) => (
            <div key={item.name}>
              {item.dropdown ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(index)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      activeDropdown === index
                        ? 'bg-slate-700/50 text-blue-300'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                      activeDropdown === index ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === index && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.dropdown.map((dropItem) => (
                        <Link
                          key={dropItem.name}
                          to={dropItem.href}
                          onClick={handleMobileNavClick}
                          className="flex items-center space-x-2 w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors duration-200"
                        >
                          {dropItem.name === 'Create Sale' && <Plus className="h-4 w-4" />}
                          <span>{dropItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href}
                  onClick={handleMobileNavClick}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
          
          {/* Mobile Wallet Section */}
          <div className="pt-6 border-t border-slate-700/50">
            {isConnected ? (
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Connected</span>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                      {formatAddress(wallet.address)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Balance:</span>
                    <span className="text-white font-medium">{wallet.balance} ETH</span>
                  </div>
                </div>
                <Link 
                  to="/create-sale"
                  onClick={handleMobileNavClick}
                  className="block w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium transition-all duration-300 text-center"
                >
                  Create Sale
                </Link>
                <Link 
                  to="/dashboard"
                  onClick={handleMobileNavClick}
                  className="block w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium transition-all duration-300 text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={disconnectWallet}
                  className="w-full px-4 py-3 text-slate-400 hover:text-white border border-slate-600 rounded-xl transition-colors duration-300"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={wallet.isConnecting}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300"
              >
                {wallet.isConnecting ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;