import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

// Contract ABIs
export const TOKEN_SALE_FACTORY_ABI = [
  "function createSale(address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bool,bytes32) external returns (uint256)",
  "function buyTokens(uint256,uint256) external payable",
  "function claimTokens(uint256) external",
  "function finalizeSale(uint256) external",
  "function getSaleInfo(uint256) external view returns (address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,uint256)",
  "function getUserContribution(uint256,address) external view returns (uint256)",
  "function getUserSales(address) external view returns (uint256[])",
  "function saleCounter() external view returns (uint256)",
  "event SaleCreated(uint256 indexed,address indexed,address indexed,uint256,uint256)",
  "event TokensPurchased(uint256 indexed,address indexed,uint256,uint256)",
  "event SaleFinalized(uint256 indexed,uint256)"
];

export const VESTING_ABI = [
  "function createVestingSchedule(address,uint256,uint256,uint256,uint256,bool,address) external",
  "function claimTokens(bytes32) external",
  "function getClaimableAmount(bytes32) external view returns (uint256)",
  "function getNextUnlock(bytes32) external view returns (uint256,uint256)",
  "function getUserVestingSchedules(address) external view returns (bytes32[])",
  "function getVestingSchedule(bytes32) external view returns (address,uint256,uint256,uint256,uint256,uint256,bool,bool,address)"
];

export const TIER_SYSTEM_ABI = [
  "function stakeTokens(uint256) external",
  "function unstakeTokens(uint256) external",
  "function getUserTierInfo(address) external view returns (uint8,uint256,uint256,uint256,uint256)",
  "function recordParticipation(address) external",
  "function getTierConfig(uint8) external view returns (uint256,uint256,uint256,bool,uint256)",
  "function updateTierConfig(uint8,uint256,uint256,uint256,uint256,uint256) external",
  "function forceUpdateUserTier(address) external",
  "function participationWindow() external view returns (uint256)",
  "function stakedBalances(address) external view returns (uint256)",
  "function totalStaked() external view returns (uint256)",
  "event TierUpdated(address indexed,uint8)",
  "event TokensStaked(address indexed,uint256)",
  "event TokensUnstaked(address indexed,uint256)",
  "event ParticipationRecorded(address indexed)"
];

export const STAKING_CONTRACT_ABI = [
  "function stake(uint256) external",
  "function unstake(uint256) external",
  "function claimRewards() external",
  "function calculatePendingRewards(address) external view returns (uint256)",
  "function getUserStakeInfo(address) external view returns (uint256,uint256,uint8,uint256,uint256,uint256,uint256)",
  "function getTierConfig(uint8) external view returns (uint256,uint256,uint256,uint256,uint256)",
  "function getPlatformStats() external view returns (uint256,uint256,uint256,uint256)",
  "function totalStaked() external view returns (uint256)",
  "function rewardPool() external view returns (uint256)",
  "function fundRewardPool(uint256) external",
  "event Staked(address indexed,uint256,uint8)",
  "event Unstaked(address indexed,uint256)",
  "event RewardsClaimed(address indexed,uint256)",
  "event TierUpdated(address indexed,uint8,uint8)"
];

export const ERC20_ABI = [
  "function balanceOf(address) external view returns (uint256)",
  "function transfer(address,uint256) external returns (bool)",
  "function transferFrom(address,address,uint256) external returns (bool)",
  "function approve(address,uint256) external returns (bool)",
  "function allowance(address,address) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function faucet(uint256) external"
];

export const ERC721_ABI = [
  "function balanceOf(address) external view returns (uint256)",
  "function ownerOf(uint256) external view returns (address)",
  "function mint(address) external",
  "function publicMint() external",
  "function tokenURI(uint256) external view returns (string)"
];

// Contract addresses from environment variables
export const CONTRACT_ADDRESSES = {
  TOKEN_SALE_FACTORY: import.meta.env.VITE_TOKEN_SALE_CONTRACT || '',
  VESTING: import.meta.env.VITE_VESTING_CONTRACT || '',
  TIER_SYSTEM: import.meta.env.VITE_TIER_SYSTEM_CONTRACT || '',
  STAKING_TOKEN: import.meta.env.VITE_STAKING_TOKEN_CONTRACT || '',
  STAKING_CONTRACT: import.meta.env.VITE_STAKING_CONTRACT || '',
  TIER_NFT: import.meta.env.VITE_TIER_NFT_CONTRACT || ''
};

// Network configuration
export const SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/4b10e92a256845688ea82b2894de73ca'
};

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private isInitialized: boolean = false;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.isInitialized = true;
      
      // Check if we're on Sepolia
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== SEPOLIA_CONFIG.chainId) {
        await this.switchToSepolia();
      }

      const address = await this.signer.getAddress();
      return address;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async initializeProvider(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    if (!this.isInitialized) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize provider:', error);
        throw error;
      }
    }
  }

  async switchToSepolia(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SEPOLIA_CONFIG.chainId.toString(16)}`,
              chainName: SEPOLIA_CONFIG.name,
              nativeCurrency: {
                name: SEPOLIA_CONFIG.currency,
                symbol: SEPOLIA_CONFIG.currency,
                decimals: 18,
              },
              rpcUrls: [SEPOLIA_CONFIG.rpcUrl],
              blockExplorerUrls: [SEPOLIA_CONFIG.explorerUrl],
            }],
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }

  getContract(address: string, abi: any[]): ethers.Contract {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return new ethers.Contract(address, abi, this.signer);
  }

  getReadOnlyContract(address: string, abi: any[]): ethers.Contract {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return new ethers.Contract(address, abi, this.provider);
  }

  getProvider(): ethers.BrowserProvider {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return this.provider;
  }

  getSigner(): ethers.JsonRpcSigner {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    return this.signer;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      await this.initializeProvider();
    }
    
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  formatEther(value: bigint | string | number): string {
    return ethers.formatEther(value);
  }

  parseEther(value: string): bigint {
    return ethers.parseEther(value);
  }

  async waitForTransaction(txHash: string): Promise<ethers.TransactionReceipt | null> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return this.provider.waitForTransaction(txHash);
  }

  // Contract interaction helpers
  async callContract(
    contractAddress: string,
    abi: any[],
    method: string,
    params: any[] = [],
    options: any = {}
  ): Promise<any> {
    try {
      const contract = this.getContract(contractAddress, abi);
      return await contract[method](...params, options);
    } catch (error: any) {
      console.error(`Contract call failed for ${method}:`, error);
      throw this.parseContractError(error);
    }
  }

  async readContract(
    contractAddress: string,
    abi: any[],
    method: string,
    params: any[] = []
  ): Promise<any> {
    try {
      const contract = this.getReadOnlyContract(contractAddress, abi);
      return await contract[method](...params);
    } catch (error: any) {
      console.error(`Contract read failed for ${method}:`, error);
      throw this.parseContractError(error);
    }
  }

  private parseContractError(error: any): Error {
    if (error.reason) {
      return new Error(error.reason);
    }
    if (error.message.includes('user rejected')) {
      return new Error('Transaction cancelled by user');
    }
    if (error.message.includes('insufficient funds')) {
      return new Error('Insufficient funds for transaction');
    }
    if (error.message.includes('execution reverted')) {
      return new Error('Transaction failed - contract execution reverted');
    }
    return new Error(error.message || 'Transaction failed');
  }

  // Tier system integration
  async getUserTierFromContract(userAddress: string): Promise<{
    tier: number;
    allocationMultiplier: number;
    earlyAccessHours: number;
    stakedAmount: number;
    participationCount: number;
  }> {
    if (!CONTRACT_ADDRESSES.TIER_SYSTEM) {
      // Fallback to staking contract if tier system not available
      return this.getUserTierFromStaking(userAddress);
    }

    try {
      const tierInfo = await this.readContract(
        CONTRACT_ADDRESSES.TIER_SYSTEM,
        TIER_SYSTEM_ABI,
        'getUserTierInfo',
        [userAddress]
      );

      return {
        tier: Number(tierInfo[0]),
        allocationMultiplier: Number(tierInfo[1]),
        earlyAccessHours: Number(tierInfo[2]),
        stakedAmount: parseFloat(this.formatEther(tierInfo[3])),
        participationCount: Number(tierInfo[4])
      };
    } catch (error) {
      console.warn('Failed to get tier from tier system, falling back to staking contract:', error);
      return this.getUserTierFromStaking(userAddress);
    }
  }

  private async getUserTierFromStaking(userAddress: string): Promise<{
    tier: number;
    allocationMultiplier: number;
    earlyAccessHours: number;
    stakedAmount: number;
    participationCount: number;
  }> {
    if (!CONTRACT_ADDRESSES.STAKING_CONTRACT) {
      return {
        tier: 0,
        allocationMultiplier: 100,
        earlyAccessHours: 0,
        stakedAmount: 0,
        participationCount: 0
      };
    }

    try {
      const stakeInfo = await this.readContract(
        CONTRACT_ADDRESSES.STAKING_CONTRACT,
        STAKING_CONTRACT_ABI,
        'getUserStakeInfo',
        [userAddress]
      );

      return {
        tier: Number(stakeInfo[2]),
        allocationMultiplier: [100, 250, 500, 1000][Number(stakeInfo[2])] || 100,
        earlyAccessHours: [0, 1, 2, 4][Number(stakeInfo[2])] || 0,
        stakedAmount: parseFloat(this.formatEther(stakeInfo[0])),
        participationCount: 0 // Not available in staking contract
      };
    } catch (error) {
      console.error('Failed to get tier from staking contract:', error);
      return {
        tier: 0,
        allocationMultiplier: 100,
        earlyAccessHours: 0,
        stakedAmount: 0,
        participationCount: 0
      };
    }
  }

  // Check contract availability
  isContractAvailable(contractName: keyof typeof CONTRACT_ADDRESSES): boolean {
    return Boolean(CONTRACT_ADDRESSES[contractName]);
  }

  // Get all available contracts
  getAvailableContracts(): string[] {
    return Object.entries(CONTRACT_ADDRESSES)
      .filter(([_, address]) => Boolean(address))
      .map(([name, _]) => name);
  }
}

// Global Web3 service instance
export const web3Service = new Web3Service();

// Utility functions
export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTokenAmount = (amount: bigint | string | number, decimals: number = 18): string => {
  return ethers.formatUnits(amount, decimals);  
};

export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  return ethers.parseUnits(amount, decimals);
};

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}