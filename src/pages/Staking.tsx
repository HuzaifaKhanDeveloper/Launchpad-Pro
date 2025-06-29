import React, { useState, useEffect } from 'react';
import { StarIcon, LockClosedIcon, GiftIcon, ChartBarIcon, ClockIcon, Zap, Users, Target, Award } from '@heroicons/react/24/outline';
import { TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWeb3 } from '../hooks/useWeb3';
import { useStaking, StakingInfo, TierConfig, PlatformStats } from '../hooks/useStaking';
import { useTierSystem } from '../hooks/useTierSystem';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import ContractStatus from '../components/common/ContractStatus';
import AnimatedCard from '../components/common/AnimatedCard';
import GradientButton from '../components/common/GradientButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Staking: React.FC = () => {
  const { user, isConnected: authConnected, updateTier, updateStakedAmount, refreshUserData } = useAuthStore();
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
  
  const {
    getUserTierInfo,
    getTokenBalance: getTierTokenBalance,
    getNFTBalance,
    mintTierNFT,
    getAvailableContracts,
    isLoading: isTierLoading
  } = useTierSystem();
  
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
  const [nftBalance, setNftBalance] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [availableContracts, setAvailableContracts] = useState<string[]>([]);

  // Check if fully connected (both auth and web3)
  const isFullyConnected = authConnected && web3Connected && user && address;

  useEffect(() => {
    if (isFullyConnected && address) {
      loadAllData();
    }
  }, [isFullyConnected, address]);

  useEffect(() => {
    setAvailableContracts(getAvailableContracts());
  }, [getAvailableContracts]);

  const loadAllData = async () => {
    if (!address) return;
    
    setIsLoadingData(true);
    try {
      // Load staking info (try staking contract first, then tier system)
      let info: StakingInfo;
      try {
        info = await getStakingInfo(address);
      } catch (error) {
        console.warn('Staking contract not available, trying tier system:', error);
        try {
          const tierInfo = await getUserTierInfo(address);
          info = {
            stakedAmount: tierInfo.stakedAmount,
            stakedAt: Date.now() / 1000,
            tier: tierInfo.tier,
            pendingRewards: 0,
            totalRewardsEarned: 0,
            totalRewardsClaimed: 0,
            unlockTime: 0
          };
        } catch (tierError) {
          console.warn('Tier system also not available:', tierError);
          info = {
            stakedAmount: 0,
            stakedAt: 0,
            tier: 0,
            pendingRewards: 0,
            totalRewardsEarned: 0,
            totalRewardsClaimed: 0,
            unlockTime: 0
          };
        }
      }
      setStakingInfo(info);

      // Load tier configs
      try {
        const configs = await Promise.all([
          getTierConfig(0), // Bronze
          getTierConfig(1), // Silver
          getTierConfig(2), // Gold
          getTierConfig(3)  // Platinum
        ]);
        setTierConfigs(configs);
      } catch (error) {
        console.warn('Could not load tier configs:', error);
        // Set default configs
        setTierConfigs([
          { minStakeAmount: 0, rewardRate: 500, lockPeriod: 0, allocationMultiplier: 100, earlyAccessHours: 0 },
          { minStakeAmount: 1000, rewardRate: 800, lockPeriod: 604800, allocationMultiplier: 250, earlyAccessHours: 1 },
          { minStakeAmount: 5000, rewardRate: 1200, lockPeriod: 2592000, allocationMultiplier: 500, earlyAccessHours: 2 },
          { minStakeAmount: 10000, rewardRate: 1500, lockPeriod: 7776000, allocationMultiplier: 1000, earlyAccessHours: 4 }
        ]);
      }

      // Load platform stats
      try {
        const stats = await getPlatformStats();
        setPlatformStats(stats);
      } catch (error) {
        console.warn('Could not load platform stats:', error);
        setPlatformStats({
          totalStaked: 0,
          totalRewardsDistributed: 0,
          rewardPool: 0,
          totalStakers: 0
        });
      }

      // Load token balance
      try {
        const balance = await getTokenBalance(address);
        setTokenBalance(balance);
      } catch (error) {
        console.warn('Could not load token balance from staking contract, trying tier system:', error);
        try {
          const balance = await getTierTokenBalance(address);
          setTokenBalance(balance);
        } catch (tierError) {
          console.warn('Could not load token balance from tier system:', tierError);
          setTokenBalance(0);
        }
      }

      // Load NFT balance
      try {
        const nftBal = await getNFTBalance(address);
        setNftBalance(nftBal);
      } catch (error) {
        console.warn('Could not load NFT balance:', error);
        setNftBalance(0);
      }

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
      await refreshUserData();
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
      await refreshUserData();
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

  const handleMintNFT = async () => {
    try {
      await mintTierNFT();
      await loadAllData();
    } catch (error) {
      console.error('NFT minting failed:', error);
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
      <div className="min-h-screen py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedCard direction="scale" className="text-center py-24">
            <div className="glass rounded-2xl p-12 border border-gray-700/50 max-w-md mx-auto">
              <Zap className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
              <p className="text-gray-300 mb-8">Please connect your wallet to access staking features.</p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedCard direction="down" className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="gradient-text">
              Staking & Tiers
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stake LAUNCH tokens to increase your participation tier and earn rewards
          </p>
        </AnimatedCard>

        {/* Contract Status */}
        <ContractStatus />

        {/* Platform Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <AnimatedCard delay={100} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <LockClosedIcon className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{platformStats.totalStaked.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Total Staked</div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={200} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <GiftIcon className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{platformStats.rewardPool.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Reward Pool</div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={300} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="h-8 w-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{platformStats.totalRewardsDistributed.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Rewards Distributed</div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={400} hoverEffect="lift">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <StarIcon className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{currentTierInfo.name}</div>
                  <div className="text-gray-400 text-sm">Your Tier</div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Staking Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Status */}
            <AnimatedCard delay={500} hoverEffect="lift">
              <div className="glass rounded-2xl p-8 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Your Staking Status</h2>
                
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="glass-dark rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <LockClosedIcon className="h-5 w-5 text-blue-400" />
                          <span className="text-gray-400 text-sm">Staked</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {stakingInfo.stakedAmount.toLocaleString()} LAUNCH
                        </div>
                      </div>

                      <div className="glass-dark rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <GiftIcon className="h-5 w-5 text-green-400" />
                          <span className="text-gray-400 text-sm">Pending Rewards</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {stakingInfo.pendingRewards.toFixed(4)} LAUNCH
                        </div>
                      </div>

                      <div className="glass-dark rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <StarIcon className="h-5 w-5 text-yellow-400" />
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
                        <GradientButton
                          onClick={handleFaucet}
                          disabled={isLoading}
                          loading={isLoading}
                          variant="primary"
                          size="sm"
                        >
                          Get 1000 LAUNCH
                        </GradientButton>
                      </div>
                    </div>

                    {/* NFT Status */}
                    {availableContracts.includes('TIER_NFT') && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-purple-300 font-medium">Tier NFTs: {nftBalance}</div>
                            <div className="text-purple-400 text-sm">NFTs provide additional tier benefits</div>
                          </div>
                          {nftBalance === 0 && (
                            <GradientButton
                              onClick={handleMintNFT}
                              disabled={isTierLoading}
                              loading={isTierLoading}
                              variant="secondary"
                              size="sm"
                            >
                              Mint Tier NFT
                            </GradientButton>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rewards Section */}
                    {stakingInfo.pendingRewards > 0 && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-green-300 font-medium">Rewards Available: {stakingInfo.pendingRewards.toFixed(4)} LAUNCH</div>
                            <div className="text-green-400 text-sm">Total Earned: {stakingInfo.totalRewardsEarned.toFixed(4)} LAUNCH</div>
                          </div>
                          <GradientButton
                            onClick={handleClaimRewards}
                            disabled={isLoading}
                            loading={isLoading}
                            variant="success"
                            size="sm"
                          >
                            Claim Rewards
                          </GradientButton>
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
                              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="text-sm text-gray-400 mt-1">
                              Available: {tokenBalance.toLocaleString()} LAUNCH
                            </div>
                          </div>
                          <GradientButton
                            onClick={handleStake}
                            disabled={isLoading || !stakeAmount}
                            loading={isLoading}
                            variant="primary"
                            className="w-full"
                          >
                            Stake Tokens
                          </GradientButton>
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
                              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                            />
                            <div className="text-sm text-gray-400 mt-1">
                              Staked: {stakingInfo.stakedAmount.toLocaleString()} LAUNCH
                              {isLocked && <span className="text-yellow-400 ml-2">(Locked)</span>}
                            </div>
                          </div>
                          <GradientButton
                            onClick={handleUnstake}
                            disabled={isLoading || !unstakeAmount || isLocked}
                            loading={isLoading}
                            variant="warning"
                            className="w-full"
                          >
                            {isLocked ? 'Tokens Locked' : 'Unstake Tokens'}
                          </GradientButton>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </AnimatedCard>

            {/* Staking Benefits */}
            <AnimatedCard delay={600} hoverEffect="lift">
              <div className="glass rounded-2xl p-8 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Staking Benefits</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <StarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Higher Tier Access</div>
                        <div className="text-gray-400 text-sm">Unlock better allocation percentages</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
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
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <ChartBarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Early Access</div>
                        <div className="text-gray-400 text-sm">Get early access to token sales</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
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
            </AnimatedCard>
          </div>

          {/* Tier Information */}
          <div className="space-y-6">
            {/* Current Tier */}
            <AnimatedCard delay={700} hoverEffect="lift">
              <div className="glass rounded-2xl p-6 border border-gray-700/50">
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
            </AnimatedCard>

            {/* All Tiers */}
            <AnimatedCard delay={800} hoverEffect="lift">
              <div className="glass rounded-2xl p-6 border border-gray-700/50">
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
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-gray-700 bg-gray-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${tierInfo.color}`}>
                            {tierInfo.name}
                          </div>
                          {isCurrentTier && (
                            <span className="text-blue-400 text-sm">Current</span>
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
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;