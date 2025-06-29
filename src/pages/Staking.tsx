import React, { useState, useEffect } from 'react';
import { StarIcon, LockClosedIcon, GiftIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWeb3 } from '../hooks/useWeb3';
import { useStaking, StakingInfo, TierConfig, PlatformStats } from '../hooks/useStaking';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const Staking: React.FC = () => {
  const { user, isConnected: authConnected, updateTier, updateStakedAmount } = useAuthStore();
  const { isConnected: web3Connected, address } = useWeb3();
  const { 
    stakeTokens, 
    unstakeTokens, 
    claimRewards,
    getStakingInfo, 
    getTierConfig,
    getPlatformStats,
    getTokenBalance,
    requestTokensFromFaucet,
    isLoading 
  } = useStaking();
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>({
    stakedAmount: 0,
    stakedAt: 0,
    tier: 0,
    pendingRewards: 0,
    totalRewardsEarned: 0,
    totalRewardsClaimed: 0,
    unlockTime: 0
  });
  const [tierConfigs, setTierConfigs] = useState<TierConfig[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalStaked: 0,
    totalRewardsDistributed: 0,
    rewardPool: 0,
    totalStakers: 0
  });
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Check if fully connected (both auth and web3)
  const isFullyConnected = authConnected && web3Connected && user && address;

  useEffect(() => {
    if (isFullyConnected && address) {
      loadAllData();
    }
  }, [isFullyConnected, address]);

  const loadAllData = async () => {
    if (!address) return;
    
    setIsLoadingData(true);
    try {
      // Load staking info
      const info = await getStakingInfo(address);
      setStakingInfo(info);

      // Load tier configs
      const configs = await Promise.all([
        getTierConfig(0), // Bronze
        getTierConfig(1), // Silver
        getTierConfig(2), // Gold
        getTierConfig(3)  // Platinum
      ]);
      setTierConfigs(configs);

      // Load platform stats
      const stats = await getPlatformStats();
      setPlatformStats(stats);

      // Load token balance
      const balance = await getTokenBalance(address);
      setTokenBalance(balance);

      // Update auth store with current staking info
      updateStakedAmount(info.stakedAmount);
      const tierName = ['bronze', 'silver', 'gold', 'platinum'][info.tier] as 'bronze' | 'silver' | 'gold' | 'platinum';
      updateTier(tierName);

    } catch (error) {
      console.error('Failed to load staking data:', error);
      toast.error('Failed to load staking data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(stakeAmount) > tokenBalance) {
      toast.error('Insufficient token balance');
      return;
    }

    try {
      await stakeTokens(stakeAmount);
      setStakeAmount('');
      await loadAllData();
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(unstakeAmount) > stakingInfo.stakedAmount) {
      toast.error('Insufficient staked amount');
      return;
    }

    try {
      await unstakeTokens(unstakeAmount);
      setUnstakeAmount('');
      await loadAllData();
    } catch (error) {
      console.error('Unstaking failed:', error);
    }
  };

  const handleClaimRewards = async () => {
    if (stakingInfo.pendingRewards <= 0) {
      toast.error('No rewards to claim');
      return;
    }

    try {
      await claimRewards();
      await loadAllData();
    } catch (error) {
      console.error('Claiming rewards failed:', error);
    }
  };

  const handleFaucet = async () => {
    try {
      await requestTokensFromFaucet('1000');
      await loadAllData();
    } catch (error) {
      console.error('Faucet request failed:', error);
    }
  };

  const getTierInfo = (tier: number) => {
    const tiers = [
      { name: 'Bronze', color: 'from-orange-600 to-orange-500' },
      { name: 'Silver', color: 'from-gray-400 to-gray-300' },
      { name: 'Gold', color: 'from-yellow-500 to-yellow-400' },
      { name: 'Platinum', color: 'from-purple-500 to-purple-400' }
    ];
    return tiers[tier] || tiers[0];
  };

  const currentTierInfo = getTierInfo(stakingInfo.tier);
  const nextTier = stakingInfo.tier < 3 ? stakingInfo.tier + 1 : null;
  const nextTierConfig = nextTier !== null ? tierConfigs[nextTier] : null;

  const isLocked = stakingInfo.unlockTime > Date.now() / 1000;
  const unlockDate = new Date(stakingInfo.unlockTime * 1000);

  if (!isFullyConnected) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-24">
            <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-gray-300 mb-8">Please connect your wallet to access staking features.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Staking
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stake LAUNCH tokens to increase your participation tier and earn rewards
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <LockClosedIcon className="h-8 w-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{platformStats.totalStaked.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Total Staked</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <GiftIcon className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{platformStats.rewardPool.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Reward Pool</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{platformStats.totalRewardsDistributed.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Rewards Distributed</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <StarIcon className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{currentTierInfo.name}</div>
                <div className="text-gray-400 text-sm">Your Tier</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Staking Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Status */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Your Staking Status</h2>
              
              {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <LockClosedIcon className="h-5 w-5 text-primary-400" />
                        <span className="text-gray-400 text-sm">Staked</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {stakingInfo.stakedAmount.toLocaleString()} LAUNCH
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <GiftIcon className="h-5 w-5 text-success-400" />
                        <span className="text-gray-400 text-sm">Pending Rewards</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {stakingInfo.pendingRewards.toFixed(4)} LAUNCH
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <StarIcon className="h-5 w-5 text-warning-400" />
                        <span className="text-gray-400 text-sm">Current Tier</span>
                      </div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${currentTierInfo.color}`}>
                        {currentTierInfo.name}
                      </div>
                    </div>
                  </div>

                  {/* Lock Status */}
                  {isLocked && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-5 w-5 text-yellow-400" />
                        <div className="text-yellow-300">
                          <strong>Tokens Locked:</strong> Unlocks on {format(unlockDate, 'PPP p')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress to Next Tier */}
                  {nextTierConfig && (
                    <div className="mb-8">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress to {getTierInfo(nextTier!).name}</span>
                        <span>{Math.min((stakingInfo.stakedAmount / nextTierConfig.minStakeAmount) * 100, 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getTierInfo(nextTier!).color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min((stakingInfo.stakedAmount / nextTierConfig.minStakeAmount) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-400 mt-2">
                        Need {Math.max(nextTierConfig.minStakeAmount - stakingInfo.stakedAmount, 0).toLocaleString()} more LAUNCH
                      </div>
                    </div>
                  )}

                  {/* Token Balance & Faucet */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-blue-300 font-medium">Token Balance: {tokenBalance.toLocaleString()} LAUNCH</div>
                        <div className="text-blue-400 text-sm">Need more tokens for testing?</div>
                      </div>
                      <button
                        onClick={handleFaucet}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all disabled:opacity-50"
                      >
                        Get 1000 LAUNCH
                      </button>
                    </div>
                  </div>

                  {/* Rewards Section */}
                  {stakingInfo.pendingRewards > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-green-300 font-medium">Rewards Available: {stakingInfo.pendingRewards.toFixed(4)} LAUNCH</div>
                          <div className="text-green-400 text-sm">Total Earned: {stakingInfo.totalRewardsEarned.toFixed(4)} LAUNCH</div>
                        </div>
                        <button
                          onClick={handleClaimRewards}
                          disabled={isLoading}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-all disabled:opacity-50"
                        >
                          Claim Rewards
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stake Form */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Stake Tokens</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Amount to Stake
                          </label>
                          <input
                            type="number"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <div className="text-sm text-gray-400 mt-1">
                            Available: {tokenBalance.toLocaleString()} LAUNCH
                          </div>
                        </div>
                        <button
                          onClick={handleStake}
                          disabled={isLoading || !stakeAmount}
                          className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Staking...' : 'Stake Tokens'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Unstake Tokens</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Amount to Unstake
                          </label>
                          <input
                            type="number"
                            value={unstakeAmount}
                            onChange={(e) => setUnstakeAmount(e.target.value)}
                            placeholder="Enter amount"
                            disabled={isLocked}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                          />
                          <div className="text-sm text-gray-400 mt-1">
                            Staked: {stakingInfo.stakedAmount.toLocaleString()} LAUNCH
                            {isLocked && <span className="text-yellow-400 ml-2">(Locked)</span>}
                          </div>
                        </div>
                        <button
                          onClick={handleUnstake}
                          disabled={isLoading || !unstakeAmount || isLocked}
                          className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Unstaking...' : isLocked ? 'Tokens Locked' : 'Unstake Tokens'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Staking Benefits */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Staking Benefits</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                      <StarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Higher Tier Access</div>
                      <div className="text-gray-400 text-sm">Unlock better allocation percentages</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary-500 rounded-lg flex items-center justify-center">
                      <GiftIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Staking Rewards</div>
                      <div className="text-gray-400 text-sm">Earn passive income on staked tokens</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Early Access</div>
                      <div className="text-gray-400 text-sm">Get early access to token sales</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-warning-500 rounded-lg flex items-center justify-center">
                      <LockClosedIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Guaranteed Allocations</div>
                      <div className="text-gray-400 text-sm">Secure your spot in popular sales</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier Information */}
          <div className="space-y-6">
            {/* Current Tier */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Current Tier</h3>
              
              <div className={`p-4 rounded-lg bg-gradient-to-r ${currentTierInfo.color} mb-4`}>
                <div className="text-white font-bold text-xl">{currentTierInfo.name}</div>
              </div>
              
              {tierConfigs[stakingInfo.tier] && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Stake</span>
                    <span className="text-white">{tierConfigs[stakingInfo.tier].minStakeAmount.toLocaleString()} LAUNCH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reward Rate</span>
                    <span className="text-white">{(tierConfigs[stakingInfo.tier].rewardRate / 100).toFixed(1)}% APR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lock Period</span>
                    <span className="text-white">{Math.floor(tierConfigs[stakingInfo.tier].lockPeriod / 86400)} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Allocation</span>
                    <span className="text-white">{(tierConfigs[stakingInfo.tier].allocationMultiplier / 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Early Access</span>
                    <span className="text-white">{tierConfigs[stakingInfo.tier].earlyAccessHours}h</span>
                  </div>
                </div>
              )}
            </div>

            {/* All Tiers */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">All Tiers</h3>
              
              <div className="space-y-4">
                {tierConfigs.map((config, index) => {
                  const tierInfo = getTierInfo(index);
                  const isCurrentTier = stakingInfo.tier === index;
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        isCurrentTier 
                          ? 'border-primary-500 bg-primary-500/10' 
                          : 'border-gray-700 bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${tierInfo.color}`}>
                          {tierInfo.name}
                        </div>
                        {isCurrentTier && (
                          <span className="text-primary-400 text-sm">Current</span>
                        )}
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min Stake:</span>
                          <span className="text-white">{config.minStakeAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">APR:</span>
                          <span className="text-white">{(config.rewardRate / 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Lock:</span>
                          <span className="text-white">{Math.floor(config.lockPeriod / 86400)}d</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;