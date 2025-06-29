import { useState, useCallback } from 'react';
import { web3Service, CONTRACT_ADDRESSES, STAKING_CONTRACT_ABI, ERC20_ABI } from '../lib/web3';
import { toast } from 'react-hot-toast';

export interface StakingInfo {
  stakedAmount: number;
  stakedAt: number;
  tier: number;
  pendingRewards: number;
  totalRewardsEarned: number;
  totalRewardsClaimed: number;
  unlockTime: number;
}

export interface TierConfig {
  minStakeAmount: number;
  rewardRate: number;
  lockPeriod: number;
  allocationMultiplier: number;
  earlyAccessHours: number;
}

export interface PlatformStats {
  totalStaked: number;
  totalRewardsDistributed: number;
  rewardPool: number;
  totalStakers: number;
}

export const useStaking = () => {
  const [isLoading, setIsLoading] = useState(false);

  const stakeTokens = useCallback(async (amount: string) => {
    if (!CONTRACT_ADDRESSES.STAKING_CONTRACT || !CONTRACT_ADDRESSES.STAKING_TOKEN) {
      toast.error('Staking contracts not configured');
      return;
    }

    setIsLoading(true);
    try {
      const amountWei = web3Service.parseEther(amount);
      
      // First approve the staking contract to spend tokens
      const tokenContract = web3Service.getContract(CONTRACT_ADDRESSES.STAKING_TOKEN, ERC20_ABI);
      
      // Check current allowance
      const signer = web3Service.getSigner();
      const userAddress = await signer.getAddress();
      const currentAllowance = await tokenContract.allowance(userAddress, CONTRACT_ADDRESSES.STAKING_CONTRACT);
      
      if (currentAllowance < amountWei) {
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.STAKING_CONTRACT, amountWei);
        toast.loading('Approving tokens...', { id: 'stake-approve' });
        await web3Service.waitForTransaction(approveTx.hash);
        toast.success('Tokens approved!', { id: 'stake-approve' });
      }

      // Then stake the tokens
      const stakingContract = web3Service.getContract(CONTRACT_ADDRESSES.STAKING_CONTRACT, STAKING_CONTRACT_ABI);
      const stakeTx = await stakingContract.stake(amountWei);
      
      toast.loading('Staking tokens...', { id: 'stake-tokens' });
      const receipt = await web3Service.waitForTransaction(stakeTx.hash);
      
      if (receipt && receipt.status === 1) {
        toast.success('Tokens staked successfully!', { id: 'stake-tokens' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to stake tokens:', error);
      
      let errorMessage = 'Failed to stake tokens';
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient token balance';
      } else if (error.message.includes('exceeds balance')) {
        errorMessage = 'Amount exceeds your token balance';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: 'stake-tokens' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unstakeTokens = useCallback(async (amount: string) => {
    if (!CONTRACT_ADDRESSES.STAKING_CONTRACT) {
      toast.error('Staking contract not configured');
      return;
    }

    setIsLoading(true);
    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.STAKING_CONTRACT, STAKING_CONTRACT_ABI);
      const amountWei = web3Service.parseEther(amount);
      
      const tx = await contract.unstake(amountWei);
      
      toast.loading('Unstaking tokens...', { id: 'unstake-tokens' });
      const receipt = await web3Service.waitForTransaction(tx.hash);
      
      if (receipt && receipt.status === 1) {
        toast.success('Tokens unstaked successfully!', { id: 'unstake-tokens' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to unstake tokens:', error);
      
      let errorMessage = 'Failed to unstake tokens';
      if (error.message.includes('Tokens are still locked')) {
        errorMessage = 'Tokens are still in lock period';
      } else if (error.message.includes('Insufficient staked amount')) {
        errorMessage = 'Insufficient staked amount';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: 'unstake-tokens' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claimRewards = useCallback(async () => {
    if (!CONTRACT_ADDRESSES.STAKING_CONTRACT) {
      toast.error('Staking contract not configured');
      return;
    }

    setIsLoading(true);
    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.STAKING_CONTRACT, STAKING_CONTRACT_ABI);
      
      const tx = await contract.claimRewards();
      
      toast.loading('Claiming rewards...', { id: 'claim-rewards' });
      const receipt = await web3Service.waitForTransaction(tx.hash);
      
      if (receipt && receipt.status === 1) {
        toast.success('Rewards claimed successfully!', { id: 'claim-rewards' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to claim rewards:', error);
      
      let errorMessage = 'Failed to claim rewards';
      if (error.message.includes('No rewards to claim')) {
        errorMessage = 'No rewards available to claim';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: 'claim-rewards' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStakingInfo = useCallback(async (userAddress: string): Promise<StakingInfo> => {
    if (!CONTRACT_ADDRESSES.STAKING_CONTRACT) {
      throw new Error('Staking contract not configured');
    }

    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.STAKING_CONTRACT, STAKING_CONTRACT_ABI);
      const stakeInfo = await contract.getUserStakeInfo(userAddress);
      
      return {
        stakedAmount: parseFloat(web3Service.formatEther(stakeInfo[0])),
        stakedAt: Number(stakeInfo[1]),
        tier: Number(stakeInfo[2]),
        pendingRewards: parseFloat(web3Service.formatEther(stakeInfo[3])),
        totalRewardsEarned: parseFloat(web3Service.formatEther(stakeInfo[4])),
        totalRewardsClaimed: parseFloat(web3Service.formatEther(stakeInfo[5])),
        unlockTime: Number(stakeInfo[6])
      };
    } catch (error: any) {
      console.error('Failed to get staking info:', error);
      throw error;
    }
  }, []);

  const getTierConfig = useCallback(async (tier: number): Promise<TierConfig> => {
    if (!CONTRACT_ADDRESSES.STAKING_CONTRACT) {
      throw new Error('Staking contract not configured');
    }

    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.STAKING_CONTRACT, STAKING_CONTRACT_ABI);
      const config = await contract.getTierConfig(tier);
      
      return {
        minStakeAmount: parseFloat(web3Service.formatEther(config[0])),
        rewardRate: Number(config[1]),
        lockPeriod: Number(config[2]),
        allocationMultiplier: Number(config[3]),
        earlyAccessHours: Number(config[4])
      };
    } catch (error: any) {
      console.error('Failed to get tier config:', error);
      throw error;
    }
  }, []);

  const getPlatformStats = useCallback(async (): Promise<PlatformStats> => {
    if (!CONTRACT_ADDRESSES.STAKING_CONTRACT) {
      throw new Error('Staking contract not configured');
    }

    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.STAKING_CONTRACT, STAKING_CONTRACT_ABI);
      const stats = await contract.getPlatformStats();
      
      return {
        totalStaked: parseFloat(web3Service.formatEther(stats[0])),
        totalRewardsDistributed: parseFloat(web3Service.formatEther(stats[1])),
        rewardPool: parseFloat(web3Service.formatEther(stats[2])),
        totalStakers: Number(stats[3])
      };
    } catch (error: any) {
      console.error('Failed to get platform stats:', error);
      throw error;
    }
  }, []);

  const getTokenBalance = useCallback(async (userAddress: string): Promise<number> => {
    if (!CONTRACT_ADDRESSES.STAKING_TOKEN) {
      throw new Error('Staking token contract not configured');
    }

    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.STAKING_TOKEN, ERC20_ABI);
      const balance = await contract.balanceOf(userAddress);
      return parseFloat(web3Service.formatEther(balance));
    } catch (error: any) {
      console.error('Failed to get token balance:', error);
      throw error;
    }
  }, []);

  const requestTokensFromFaucet = useCallback(async (amount: string) => {
    if (!CONTRACT_ADDRESSES.STAKING_TOKEN) {
      toast.error('Staking token contract not configured');
      return;
    }

    setIsLoading(true);
    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.STAKING_TOKEN, ERC20_ABI);
      const amountWei = web3Service.parseEther(amount);
      
      const tx = await contract.faucet(amountWei);
      
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

  return {
    isLoading,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    getStakingInfo,
    getTierConfig,
    getPlatformStats,
    getTokenBalance,
    requestTokensFromFaucet
  };
};