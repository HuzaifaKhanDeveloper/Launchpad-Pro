import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWeb3 } from '../../hooks/useWeb3';
import { shortenAddress } from '../../lib/web3';

const ConnectWalletButton: React.FC = () => {
  const { isConnected, address, connectWallet, disconnectWallet, isLoading, balance } = useWeb3();

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs text-gray-400">Balance</span>
          <span className="text-sm text-white font-medium">
            {parseFloat(balance).toFixed(4)} ETH
          </span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-300 font-mono">
            {shortenAddress(address)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="flex items-center space-x-2 px-3 py-2 bg-error-500 hover:bg-error-600 text-white rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isLoading}
      className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Wallet className="h-4 w-4" />
      <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
};

export default ConnectWalletButton;