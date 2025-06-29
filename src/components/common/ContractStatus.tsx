import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESSES, web3Service } from '../../lib/web3';
import AnimatedCard from './AnimatedCard';

interface ContractInfo {
  name: string;
  address: string;
  isAvailable: boolean;
  displayName: string;
}

const ContractStatus: React.FC = () => {
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const contractList: ContractInfo[] = [
      {
        name: 'TOKEN_SALE_FACTORY',
        address: CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY,
        isAvailable: web3Service.isContractAvailable('TOKEN_SALE_FACTORY'),
        displayName: 'Token Sale Factory'
      },
      {
        name: 'STAKING_CONTRACT',
        address: CONTRACT_ADDRESSES.STAKING_CONTRACT,
        isAvailable: web3Service.isContractAvailable('STAKING_CONTRACT'),
        displayName: 'Staking Contract'
      },
      {
        name: 'TIER_SYSTEM',
        address: CONTRACT_ADDRESSES.TIER_SYSTEM,
        isAvailable: web3Service.isContractAvailable('TIER_SYSTEM'),
        displayName: 'Tier System'
      },
      {
        name: 'VESTING',
        address: CONTRACT_ADDRESSES.VESTING,
        isAvailable: web3Service.isContractAvailable('VESTING'),
        displayName: 'Vesting Contract'
      },
      {
        name: 'STAKING_TOKEN',
        address: CONTRACT_ADDRESSES.STAKING_TOKEN,
        isAvailable: web3Service.isContractAvailable('STAKING_TOKEN'),
        displayName: 'LAUNCH Token'
      },
      {
        name: 'TIER_NFT',
        address: CONTRACT_ADDRESSES.TIER_NFT,
        isAvailable: web3Service.isContractAvailable('TIER_NFT'),
        displayName: 'Tier NFT'
      }
    ];

    setContracts(contractList);
  }, []);

  const availableContracts = contracts.filter(c => c.isAvailable);
  const unavailableContracts = contracts.filter(c => !c.isAvailable);

  const getStatusIcon = (isAvailable: boolean) => {
    return isAvailable ? (
      <CheckCircle className="h-4 w-4 text-green-400" />
    ) : (
      <XCircle className="h-4 w-4 text-red-400" />
    );
  };

  const openEtherscan = (address: string) => {
    window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
  };

  return (
    <AnimatedCard className="mb-8">
      <div className="glass rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {availableContracts.length === contracts.length ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : availableContracts.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <span className="text-white font-medium">
                Contract Status ({availableContracts.length}/{contracts.length})
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {availableContracts.length}
            </div>
            <div className="text-sm text-gray-400">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {unavailableContracts.length}
            </div>
            <div className="text-sm text-gray-400">Unavailable</div>
          </div>
        </div>

        {/* Detailed Status */}
        {isExpanded && (
          <div className="space-y-3 pt-4 border-t border-gray-700/50">
            {contracts.map((contract) => (
              <div
                key={contract.name}
                className="flex items-center justify-between p-3 glass-dark rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(contract.isAvailable)}
                  <div>
                    <div className="text-white font-medium text-sm">
                      {contract.displayName}
                    </div>
                    {contract.isAvailable && (
                      <div className="text-xs text-gray-400 font-mono">
                        {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                      </div>
                    )}
                  </div>
                </div>
                
                {contract.isAvailable && (
                  <button
                    onClick={() => openEtherscan(contract.address)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fallback Notice */}
        {unavailableContracts.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm">
                Some contracts are not deployed. The platform will use fallback functionality where possible.
              </span>
            </div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default ContractStatus;