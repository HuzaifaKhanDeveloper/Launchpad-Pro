import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

const NetworkGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNetwork();
    
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', checkNetwork);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', checkNetwork);
      }
    };
  }, []);

  const checkNetwork = async () => {
    if (!window.ethereum) return;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
    } catch (error) {
      console.error('Failed to check network:', error);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed');
      return;
    }

    setIsLoading(true);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/4b10e92a256845688ea82b2894de73ca'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
        }
      } else {
        console.error('Failed to switch to Sepolia:', switchError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isCorrectNetwork) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center">
          <div className="w-16 h-16 bg-warning-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="h-8 w-8 text-warning-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Wrong Network</h2>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            You are connected to the wrong network. This platform only works on the Sepolia Testnet. 
            Please switch to continue using the platform.
          </p>
          
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-400 mb-2">Required Network:</div>
            <div className="text-white font-semibold">Sepolia Testnet</div>
            <div className="text-xs text-gray-500 mt-1">Chain ID: 11155111</div>
          </div>
          
          <button
            onClick={switchToSepolia}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Switching...</span>
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-5 w-5" />
                <span>Switch to Sepolia</span>
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Need Sepolia ETH? Visit the{' '}
            <a 
              href="https://sepoliafaucet.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300"
            >
              Sepolia Faucet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkGuard;