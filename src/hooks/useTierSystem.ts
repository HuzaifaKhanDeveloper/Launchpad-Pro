import { useState, useCallback } from 'react';
import { web3Service, CONTRACT_ADDRESSES, TIER_SYSTEM_ABI, ERC20_ABI, ERC721_ABI } from '../lib/web3';
import { toast } from 'react-hot-toast';

export interface TierInfo {
  tier: number;
  allocationMultiplier: number;
  earlyAccessHours: number;
  stakedAmount: number;
  participationCount: number;
}

export interface TierConfig {
  minStakeAmount: number;
  allocationMultiplier: number;
  earlyAccessHours: number;
  nftRequired: boolean;
  minParticipations: number;
}

export const useTierSystem = () => {
  const [isLoading, setIsLoading] = useState(false);

  const stakeTokens = useCallback(async (amount: string) => {
    if (!CONTRACT_ADDRESSES.TIER_SYSTEM) {
      toast.error('Tier system contract not available');
      return;
    }

    setIsLoading(true);
    try {
      const amountWei = web3Service.parseEther(amount);
      
      // First approve the tier system contract to spend tokens
      if (CONTRACT_ADDRESSES.STAKING_TOKEN) {
        const signer = web3Service.getSigner();
        const userAddress = await signer.getAddress();
        
        const tokenContract = web3Service.getContract(CONTRACT_ADDRESSES.STAKING_TOKEN, ERC20_ABI);
        const currentAllowance = await tokenContract.allowance(userAddress, CONTRACT_ADDRESSES.TIER_SYSTEM);
        
        if (currentAllowance < amountWei) {
          const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.TIER_SYSTEM, amountWei);
          toast.loading('Approving tokens...', { id: 'tier-approve' });
          await web3Service.waitForTransaction(approveTx.hash);
          toast.success('Tokens approved!', { id: 'tier-approve' });
        }
      }

      // Then stake the tokens
      const tx = await web3Service.callContract(
        CONTRACT_ADDRESSES.TIER_SYSTEM,
        TIER_SYSTEM_ABI,
        'stakeTokens',
        [amountWei]
      );
      
      toast.loading('Staking tokens...', { id: 'tier-stake' });
      const receipt = await web3Service.waitForTransaction(tx.hash);
      
      if (receipt && receipt.status === 1) {
        toast.success('Tokens staked successfully!', { id: 'tier-stake' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to stake tokens:', error);
      toast.error(error.message || 'Failed to stake tokens', { id: 'tier-stake' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unstakeTokens = useCallback(async (amount: string) => {
    if (!CONTRACT_ADDRESSES.TIER_SYSTEM) {
      toast.error('Tier system contract not available');
      return;
    }

    setIsLoading(true);
    try {
      const amountWei = web3Service.parseEther(amount);
      
      const tx = await web3Service.callContract(
        CONTRACT_ADDRESSES.TIER_SYSTEM,
        TIER_SYSTEM_ABI,
        'unstakeTokens',
        [amountWei]
      );
      
      toast.loading('Unstaking tokens...', { id: 'tier-unstake' });
      const receipt = await web3Service.waitForTransaction(tx.hash);
      
      if (receipt && receipt.status === 1) {
        toast.success('Tokens unstaked successfully!', { id: 'tier-unstake' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to unstake tokens:', error);
      toast.error(error.message || 'Failed to unstake tokens', { id: 'tier-unstake' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserTierInfo = useCallback(async (userAddress: string): Promise<TierInfo> => {
    try {
      return await web3Service.getUserTierFromContract(userAddress);
    } catch (error: any) {
      console.error('Failed to get user tier info:', error);
      throw error;
    }
  }, []);

  const getTierConfig = useCallback(async (tier: number): Promise<TierConfig> => {
    if (!CONTRACT_ADDRESSES.TIER_SYSTEM) {
      // Return default tier configs if contract not available
      const defaultConfigs = [
        { minStakeAmount: 0, allocationMultiplier: 100, earlyAccessHours: 0, nftRequired: false, minParticipations: 0 },
        { minStakeAmount: 1000, allocationMultiplier: 250, earlyAccessHours: 1, nftRequired: false, minParticipations: 1 },
        { minStakeAmount: 5000, allocationMultiplier: 500, earlyAccessHours: 2, nftRequired: false, minParticipations: 3 },
        { minStakeAmount: 10000, allocationMultiplier: 1000, earlyAccessHours: 4, nftRequired: true, minParticipations: 5 }
      ];
      return defaultConfigs[tier] || defaultConfigs[0];
    }

    try {
      const config = await web3Service.readContract(
        CONTRACT_ADDRESSES.TIER_SYSTEM,
        TIER_SYSTEM_ABI,
        'getTierConfig',
        [tier]
      );
      
      return {
        minStakeAmount: parseFloat(web3Service.formatEther(config[0])),
        allocationMultiplier: Number(config[1]),
        earlyAccessHours: Number(config[2]),
        nftRequired: Boolean(config[3]),
        minParticipations: Number(config[4])
      };
    } catch (error: any) {
      console.error('Failed to get tier config:', error);
      throw error;
    }
  }, []);

  const getTokenBalance = useCallback(async (userAddress: string): Promise<number> => {
    if (!CONTRACT_ADDRESSES.STAKING_TOKEN) {
      return 0;
    }

    try {
      const balance = await web3Service.readContract(
        CONTRACT_ADDRESSES.STAKING_TOKEN,
        ERC20_ABI,
        'balanceOf',
        [userAddress]
      );
      return parseFloat(web3Service.formatEther(balance));
    } catch (error: any) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }, []);

  const getNFTBalance = useCallback(async (userAddress: string): Promise<number> => {
    if (!CONTRACT_ADDRESSES.TIER_NFT) {
      return 0;
    }

    try {
      const balance = await web3Service.readContract(
        CONTRACT_ADDRESSES.TIER_NFT,
        ERC721_ABI,
        'balanceOf',
        [userAddress]
      );
      return Number(balance);
    } catch (error: any) {
      console.error('Failed to get NFT balance:', error);
      return 0;
    }
  }, []);

  const mintTierNFT = useCallback(async () => {
    if (!CONTRACT_ADDRESSES.TIER_NFT) {
      toast.error('Tier NFT contract not available');
      return;
    }

    setIsLoading(true);
    try {
      const tx = await web3Service.callContract(
        CONTRACT_ADDRESSES.TIER_NFT,
        ERC721_ABI,
        'publicMint',
        []
      );
      
      toast.loading('Minting tier NFT...', { id: 'mint-nft' });
      const receipt = await web3Service.waitForTransaction(tx.hash);
      
      if (receipt && receipt.status === 1) {
        toast.success('Tier NFT minted successfully!', { id: 'mint-nft' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to mint tier NFT:', error);
      toast.error(error.message || 'Failed to mint tier NFT', { id: 'mint-nft' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestTokensFromFaucet = useCallback(async (amount: string) => {
    if (!CONTRACT_ADDRESSES.STAKING_TOKEN) {
      toast.error('Staking token contract not available');
      return;
    }

    setIsLoading(true);
    try {
      const amountWei = web3Service.parseEther(amount);
      
      const tx = await web3Service.callContract(
        CONTRACT_ADDRESSES.STAKING_TOKEN,
        ERC20_ABI,
        'faucet',
        [amountWei]
      );
      
      toast.loading('Requesting tokens from faucet...', { id: 'faucet-tokens' });
      const receipt = await web3Service.waitForTransaction(tx.hash);
      
      if (receipt && receipt.status === 1) {
        toast.success(`${amount} LAUNCH tokens received!`, { id: 'faucet-tokens' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to get tokens from faucet:', error);
      
      let errorMessage = 'Failed to get tokens from faucet';
      if (error.message.includes('Max 1000 tokens per request')) {
        errorMessage = 'Maximum 1000 tokens per request';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: 'faucet-tokens' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAvailableContracts = useCallback(() => {
    return web3Service.getAvailableContracts();
  }, []);

  return {
    isLoading,
    stakeTokens,
    unstakeTokens,
    getUserTierInfo,
    getTierConfig,
    getTokenBalance,
    getNFTBalance,
    mintTierNFT,
    requestTokensFromFaucet,
    getAvailableContracts
  };
};