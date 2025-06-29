// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title StakingContract
 * @dev Professional staking contract with tier system, rewards, and flexible parameters
 */
contract StakingContract is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    enum Tier { BRONZE, SILVER, GOLD, PLATINUM }

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastRewardClaim;
        Tier tier;
        uint256 rewardsEarned;
        uint256 rewardsClaimed;
    }

    struct TierConfig {
        uint256 minStakeAmount;
        uint256 rewardRate; // Annual percentage rate in basis points (100 = 1%)
        uint256 lockPeriod; // Minimum lock period in seconds
        uint256 allocationMultiplier; // For token sales (100 = 1%)
        uint256 earlyAccessHours;
    }

    IERC20 public immutable stakingToken;
    
    mapping(address => StakeInfo) public stakes;
    mapping(Tier => TierConfig) public tierConfigs;
    
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    uint256 public rewardPool;
    uint256 public totalStakers;
    
    // Events
    event Staked(address indexed user, uint256 amount, Tier tier);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event TierUpdated(address indexed user, Tier oldTier, Tier newTier);
    event RewardPoolFunded(uint256 amount);
    event TierConfigUpdated(Tier tier, uint256 minStake, uint256 rewardRate);

    constructor(
        address _stakingToken,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_stakingToken != address(0), "Invalid staking token");
        stakingToken = IERC20(_stakingToken);
        
        _initializeTierConfigs();
    }

    function _initializeTierConfigs() internal {
        // Bronze Tier
        tierConfigs[Tier.BRONZE] = TierConfig({
            minStakeAmount: 0,
            rewardRate: 500, // 5% APR
            lockPeriod: 0,
            allocationMultiplier: 100, // 1%
            earlyAccessHours: 0
        });
        
        // Silver Tier
        tierConfigs[Tier.SILVER] = TierConfig({
            minStakeAmount: 1000 * 1e18, // 1000 tokens
            rewardRate: 800, // 8% APR
            lockPeriod: 7 days,
            allocationMultiplier: 250, // 2.5%
            earlyAccessHours: 1
        });
        
        // Gold Tier
        tierConfigs[Tier.GOLD] = TierConfig({
            minStakeAmount: 5000 * 1e18, // 5000 tokens
            rewardRate: 1200, // 12% APR
            lockPeriod: 30 days,
            allocationMultiplier: 500, // 5%
            earlyAccessHours: 2
        });
        
        // Platinum Tier
        tierConfigs[Tier.PLATINUM] = TierConfig({
            minStakeAmount: 10000 * 1e18, // 10000 tokens
            rewardRate: 1500, // 15% APR
            lockPeriod: 90 days,
            allocationMultiplier: 1000, // 10%
            earlyAccessHours: 4
        });
    }

    /**
     * @dev Stake tokens and automatically assign tier
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        StakeInfo storage userStake = stakes[msg.sender];
        bool isNewStaker = userStake.amount == 0;
        
        // Claim pending rewards before updating stake
        if (userStake.amount > 0) {
            _claimRewards(msg.sender);
        }
        
        // Update stake info
        userStake.amount += amount;
        userStake.stakedAt = block.timestamp;
        userStake.lastRewardClaim = block.timestamp;
        
        // Update tier based on new stake amount
        Tier oldTier = userStake.tier;
        Tier newTier = _calculateTier(userStake.amount);
        userStake.tier = newTier;
        
        totalStaked += amount;
        
        if (isNewStaker) {
            totalStakers++;
        }
        
        emit Staked(msg.sender, amount, newTier);
        
        if (oldTier != newTier) {
            emit TierUpdated(msg.sender, oldTier, newTier);
        }
    }

    /**
     * @dev Unstake tokens (respects lock period)
     */
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient staked amount");
        
        TierConfig memory config = tierConfigs[userStake.tier];
        require(
            block.timestamp >= userStake.stakedAt + config.lockPeriod,
            "Tokens are still locked"
        );
        
        // Claim pending rewards
        _claimRewards(msg.sender);
        
        // Update stake
        userStake.amount -= amount;
        totalStaked -= amount;
        
        // Update tier based on new stake amount
        Tier oldTier = userStake.tier;
        Tier newTier = _calculateTier(userStake.amount);
        userStake.tier = newTier;
        
        // If user unstaked everything, decrease total stakers
        if (userStake.amount == 0) {
            totalStakers--;
        }
        
        // Transfer tokens back to user
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
        
        if (oldTier != newTier) {
            emit TierUpdated(msg.sender, oldTier, newTier);
        }
    }

    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }

    function _claimRewards(address user) internal {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return;
        
        uint256 pendingRewards = calculatePendingRewards(user);
        if (pendingRewards == 0) return;
        
        require(rewardPool >= pendingRewards, "Insufficient reward pool");
        
        userStake.rewardsEarned += pendingRewards;
        userStake.rewardsClaimed += pendingRewards;
        userStake.lastRewardClaim = block.timestamp;
        
        rewardPool -= pendingRewards;
        totalRewardsDistributed += pendingRewards;
        
        stakingToken.safeTransfer(user, pendingRewards);
        
        emit RewardsClaimed(user, pendingRewards);
    }

    /**
     * @dev Calculate pending rewards for a user
     */
    function calculatePendingRewards(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        
        TierConfig memory config = tierConfigs[userStake.tier];
        uint256 timeStaked = block.timestamp - userStake.lastRewardClaim;
        
        // Calculate annual rewards and convert to time period
        uint256 annualRewards = (userStake.amount * config.rewardRate) / 10000;
        uint256 rewards = (annualRewards * timeStaked) / 365 days;
        
        return rewards;
    }

    /**
     * @dev Calculate tier based on stake amount
     */
    function _calculateTier(uint256 amount) internal view returns (Tier) {
        if (amount >= tierConfigs[Tier.PLATINUM].minStakeAmount) {
            return Tier.PLATINUM;
        } else if (amount >= tierConfigs[Tier.GOLD].minStakeAmount) {
            return Tier.GOLD;
        } else if (amount >= tierConfigs[Tier.SILVER].minStakeAmount) {
            return Tier.SILVER;
        } else {
            return Tier.BRONZE;
        }
    }

    /**
     * @dev Get user's complete staking information
     */
    function getUserStakeInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 stakedAt,
        Tier tier,
        uint256 pendingRewards,
        uint256 totalRewardsEarned,
        uint256 totalRewardsClaimed,
        uint256 unlockTime
    ) {
        StakeInfo memory userStake = stakes[user];
        TierConfig memory config = tierConfigs[userStake.tier];
        
        return (
            userStake.amount,
            userStake.stakedAt,
            userStake.tier,
            calculatePendingRewards(user),
            userStake.rewardsEarned,
            userStake.rewardsClaimed,
            userStake.stakedAt + config.lockPeriod
        );
    }

    /**
     * @dev Get tier configuration
     */
    function getTierConfig(Tier tier) external view returns (TierConfig memory) {
        return tierConfigs[tier];
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalRewardsDistributed,
        uint256 _rewardPool,
        uint256 _totalStakers
    ) {
        return (totalStaked, totalRewardsDistributed, rewardPool, totalStakers);
    }

    /**
     * @dev Fund the reward pool (only owner)
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardPoolFunded(amount);
    }

    /**
     * @dev Update tier configuration (only owner)
     */
    function updateTierConfig(
        Tier tier,
        uint256 minStakeAmount,
        uint256 rewardRate,
        uint256 lockPeriod,
        uint256 allocationMultiplier,
        uint256 earlyAccessHours
    ) external onlyOwner {
        tierConfigs[tier] = TierConfig({
            minStakeAmount: minStakeAmount,
            rewardRate: rewardRate,
            lockPeriod: lockPeriod,
            allocationMultiplier: allocationMultiplier,
            earlyAccessHours: earlyAccessHours
        });
        
        emit TierConfigUpdated(tier, minStakeAmount, rewardRate);
    }

    /**
     * @dev Emergency withdraw (only owner, when paused)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner whenPaused {
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @dev Pause/unpause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}