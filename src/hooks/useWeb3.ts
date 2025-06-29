import { useState, useEffect, useCallback, useRef } from 'react';
import { web3Service } from '../lib/web3';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export const useWeb3 = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  
  // Use useRef to track toast state across renders without causing re-renders
  const hasShownConnectedToast = useRef(false);
  const isInitialMount = useRef(true);
  const connectionAttempted = useRef(false);
  
  const { connectWallet: connectAuthWallet, disconnectWallet: disconnectAuthWallet } = useAuthStore();

  const connectWallet = useCallback(async () => {
    if (isConnected) {
      return; // Already connected, don't show duplicate toasts
    }

    setIsLoading(true);
    connectionAttempted.current = true;
    
    try {
      const walletAddress = await web3Service.connectWallet();
      setAddress(walletAddress);
      setIsConnected(true);
      
      // Get balance
      const walletBalance = await web3Service.getBalance(walletAddress);
      setBalance(walletBalance);
      
      // Get chain ID
      const provider = web3Service.getProvider();
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      
      // Connect to auth store
      await connectAuthWallet(walletAddress);
      
      // Show success toast only for manual connections (not auto-reconnections)
      if (!hasShownConnectedToast.current && !isInitialMount.current) {
        toast.success('Wallet connected successfully!');
        hasShownConnectedToast.current = true;
      }
      
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      if (error.message !== 'User rejected the request.') {
        toast.error(error.message || 'Failed to connect wallet');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, connectAuthWallet]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress('');
    setBalance('0');
    setChainId(null);
    hasShownConnectedToast.current = false;
    isInitialMount.current = true;
    connectionAttempted.current = false;
    disconnectAuthWallet();
    toast.success('Wallet disconnected');
  }, [disconnectAuthWallet]);

  const refreshBalance = useCallback(async () => {
    if (address && isConnected) {
      try {
        const walletBalance = await web3Service.getBalance(address);
        setBalance(walletBalance);
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      }
    }
  }, [address, isConnected]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== address && accounts[0]) {
          setAddress(accounts[0]);
          // Don't show toast for account switches
          refreshBalance();
          // Update auth store with new address
          connectAuthWallet(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        refreshBalance();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address, disconnectWallet, refreshBalance, connectAuthWallet]);

  // Check if already connected on mount (auto-reconnection)
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && !isConnected && isInitialMount.current && !connectionAttempted.current) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // This is an auto-reconnection, don't show toast
            hasShownConnectedToast.current = true;
            
            // Initialize provider first
            await web3Service.initializeProvider();
            
            // Set connection state immediately
            setAddress(accounts[0]);
            setIsConnected(true);
            
            // Get balance and chain info
            const walletBalance = await web3Service.getBalance(accounts[0]);
            setBalance(walletBalance);
            
            const provider = web3Service.getProvider();
            const network = await provider.getNetwork();
            setChainId(Number(network.chainId));
            
            // Connect to auth store
            await connectAuthWallet(accounts[0]);
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        } finally {
          // After initial check, mark as no longer initial mount
          isInitialMount.current = false;
        }
      }
    };

    checkConnection();
  }, [connectAuthWallet, isConnected]);

  return {
    isConnected,
    address,
    balance,
    chainId,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBalance
  };
};