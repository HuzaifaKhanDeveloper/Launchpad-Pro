// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TierSystem
 * @dev Manages user tiers based on staking, NFT ownership, and participation history
 */
contract TierSystem is Ownable {
    enum Tier { BRONZE, SILVER, GOLD, PLATINUM }

    struct TierConfig {
        uint256 minStakeAmount;
        uint256 allocationMultiplier; 
        uint256 earlyAccessHours;
        bool nftRequired;
        uint256 minParticipations;
    }

    struct UserData {
        uint256 stakedAmount;
        uint256 participationCount;
        uint256 lastParticipation;
        Tier currentTier;
        bool hasNFT;
    }

    IERC20 public stakingToken;
    IERC721 public tierNFT;
    
    mapping(Tier => TierConfig) public tierConfigs;
    mapping(address => UserData) public userData;
    mapping(address => uint256) public stakedBalances;
    
    uint256 public totalStaked;
    uint256 public participationWindow = 180 days; // 6 months

    event TierUpdated(address indexed user, Tier newTier);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event ParticipationRecorded(address indexed user);

    constructor(
        address _stakingToken,
        address _tierNFT,
        address _initialOwner
    ) Ownable(_initialOwner) {
        stakingToken = IERC20(_stakingToken);
        tierNFT = IERC721(_tierNFT);
        
        // Initialize tier configurations
        tierConfigs[Tier.BRONZE] = TierConfig({
            minStakeAmount: 0,
            allocationMultiplier: 100, // 1%
            earlyAccessHours: 0,
            nftRequired: false,
            minParticipations: 0
        });
        
        tierConfigs[Tier.SILVER] = TierConfig({
            minStakeAmount: 1000 * 1e18, // 1000 tokens
            allocationMultiplier: 250, // 2.5%
            earlyAccessHours: 1,
            nftRequired: false,
            minParticipations: 1
        });
        
        tierConfigs[Tier.GOLD] = TierConfig({
            minStakeAmount: 5000 * 1e18, // 5000 tokens
            allocationMultiplier: 500, // 5%
            earlyAccessHours: 2,
            nftRequired: false,
            minParticipations: 3
        });
        
        tierConfigs[Tier.PLATINUM] = TierConfig({
            minStakeAmount: 10000 * 1e18, // 10000 tokens
            allocationMultiplier: 1000, // 10%
            earlyAccessHours: 4,
            nftRequired: true,
            minParticipations: 5
        });
    }

    /**
     * @dev Stake tokens to increase tier
     */
    function stakeTokens(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        
        stakingToken.transferFrom(msg.sender, address(this), amount);
        
        userData[msg.sender].stakedAmount += amount;
        stakedBalances[msg.sender] += amount;
        totalStaked += amount;
        
        _updateUserTier(msg.sender);
        
        emit TokensStaked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens (may reduce tier)
     */
    function unstakeTokens(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");
        
        userData[msg.sender].stakedAmount -= amount;
        stakedBalances[msg.sender] -= amount;
        totalStaked -= amount;
        
        stakingToken.transfer(msg.sender, amount);
        
        _updateUserTier(msg.sender);
        
        emit TokensUnstaked(msg.sender, amount);
    }

    /**
     * @dev Record user participation in a sale
     */
    function recordParticipation(address user) external onlyOwner {
        userData[user].participationCount++;
        userData[user].lastParticipation = block.timestamp;
        
        _updateUserTier(user);
        
        emit ParticipationRecorded(user);
    }

    /**
     * @dev Update user tier based on current criteria
     */
    function _updateUserTier(address user) internal {
        UserData storage data = userData[user];
        
        // Check NFT ownership
        data.hasNFT = tierNFT.balanceOf(user) > 0;
        
        // Calculate active participations (within the participation window)
        uint256 activeParticipations = 0;
        if (block.timestamp - data.lastParticipation <= participationWindow) {
            activeParticipations = data.participationCount;
        }
        
        Tier newTier = Tier.BRONZE;
        
        // Check from highest tier to lowest
        for (uint8 i = uint8(Tier.PLATINUM); i >= uint8(Tier.BRONZE); i--) {
            Tier tier = Tier(i);
            TierConfig memory config = tierConfigs[tier];
            
            bool meetsStakeRequirement = data.stakedAmount >= config.minStakeAmount;
            bool meetsNFTRequirement = !config.nftRequired || data.hasNFT;
            bool meetsParticipationRequirement = activeParticipations >= config.minParticipations;
            
            if (meetsStakeRequirement && meetsNFTRequirement && meetsParticipationRequirement) {
                newTier = tier;
                break;
            }
            
            if (i == 0) break; // Prevent underflow
        }
        
        if (data.currentTier != newTier) {
            data.currentTier = newTier;
            emit TierUpdated(user, newTier);
        }
    }

    /**
     * @dev Get user's current tier and allocation
     */
    function getUserTierInfo(address user) external view returns (
        Tier tier,
        uint256 allocationMultiplier,
        uint256 earlyAccessHours,
        uint256 stakedAmount,
        uint256 participationCount
    ) {
        UserData memory data = userData[user];
        TierConfig memory config = tierConfigs[data.currentTier];
        
        return (
            data.currentTier,
            config.allocationMultiplier,
            config.earlyAccessHours,
            data.stakedAmount,
            data.participationCount
        );
    }

    /**
     * @dev Update tier configuration
     */
    function updateTierConfig(
        Tier tier,
        uint256 minStakeAmount,
        uint256 allocationMultiplier,
        uint256 earlyAccessHours,
        bool nftRequired,
        uint256 minParticipations
    ) external onlyOwner {
        tierConfigs[tier] = TierConfig({
            minStakeAmount: minStakeAmount,
            allocationMultiplier: allocationMultiplier,
            earlyAccessHours: earlyAccessHours,
            nftRequired: nftRequired,
            minParticipations: minParticipations
        });
    }

    /**
     * @dev Update participation window
     */
    function updateParticipationWindow(uint256 newWindow) external onlyOwner {
        participationWindow = newWindow;
    }

    /**
     * @dev Force update user tier (admin function)
     */
    function forceUpdateUserTier(address user) external onlyOwner {
        _updateUserTier(user);
    }

    /**
     * @dev Get tier configuration
     */
    function getTierConfig(Tier tier) external view returns (TierConfig memory) {
        return tierConfigs[tier];
    }
}
