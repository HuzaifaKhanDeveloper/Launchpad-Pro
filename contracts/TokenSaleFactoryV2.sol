// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./StakingContract.sol";
import "./TierSystem.sol";

/**
 * @title TokenSaleFactoryV2
 * @dev Enhanced factory contract with better tier integration and analytics
 */
contract TokenSaleFactoryV2 is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    enum SaleType { FIXED, DUTCH_AUCTION, LOTTERY }
    enum SaleStatus { UPCOMING, ACTIVE, ENDED, CANCELLED }

    struct Sale {
        IERC20 token;
        address creator;
        uint256 tokenPrice;
        uint256 totalSupply;
        uint256 soldAmount;
        uint256 softCap;
        uint256 hardCap;
        uint256 startTime;
        uint256 endTime;
        SaleType saleType;
        SaleStatus status;
        bool whitelistEnabled;
        bytes32 merkleRoot;
        mapping(address => uint256) contributions;
        mapping(address => bool) claimed;
        uint256 participantCount;
        string name;
        string description;
        string website;
        string twitter;
        string telegram;
        string logoUrl;
    }

    StakingContract public stakingContract;
    TierSystem public tierSystem;
    
    mapping(uint256 => Sale) public sales;
    mapping(address => uint256[]) public userSales;
    mapping(address => uint256[]) public userParticipations;
    
    uint256 public saleCounter;
    uint256 public platformFee = 250; // 2.5% in basis points
    address public feeRecipient;
    
    // Enhanced tier system
    uint256[4] public tierAllocations = [100, 250, 500, 1000]; // 1%, 2.5%, 5%, 10%
    uint256[4] public tierEarlyAccess = [0, 1 hours, 2 hours, 4 hours];

    // Analytics
    uint256 public totalVolumeRaised;
    uint256 public totalParticipants;
    mapping(address => uint256) public userTotalInvested;

    event SaleCreated(
        uint256 indexed saleId, 
        address indexed creator,
        address indexed token, 
        uint256 tokenPrice,
        uint256 totalSupply,
        string name
    );
    event TokensPurchased(
        uint256 indexed saleId, 
        address indexed buyer, 
        uint256 amount, 
        uint256 cost
    );
    event TokensClaimed(
        uint256 indexed saleId, 
        address indexed claimer, 
        uint256 amount
    );
    event SaleStatusUpdated(uint256 indexed saleId, SaleStatus status);
    event SaleFinalized(uint256 indexed saleId, uint256 totalRaised);

    modifier validSale(uint256 saleId) {
        require(saleId < saleCounter, "Invalid sale ID");
        _;
    }

    modifier saleActive(uint256 saleId) {
        Sale storage sale = sales[saleId];
        require(sale.status == SaleStatus.ACTIVE, "Sale not active");
        require(block.timestamp >= sale.startTime, "Sale not started");
        require(block.timestamp <= sale.endTime, "Sale ended");
        _;
    }

    constructor(
        address _stakingContract,
        address _tierSystem,
        address _feeRecipient,
        address _initialOwner
    ) Ownable(_initialOwner) {
        stakingContract = StakingContract(_stakingContract);
        tierSystem = TierSystem(_tierSystem);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Create a new token sale with enhanced metadata
     */
    function createSaleWithMetadata(
        address _token,
        uint256 _tokenPrice,
        uint256 _totalSupply,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _startTime,
        uint256 _endTime,
        SaleType _saleType,
        bool _whitelistEnabled,
        bytes32 _merkleRoot,
        string memory _name,
        string memory _description,
        string memory _website,
        string memory _twitter,
        string memory _telegram,
        string memory _logoUrl
    ) external whenNotPaused returns (uint256) {
        require(_token != address(0), "Invalid token address");
        require(_tokenPrice > 0, "Invalid token price");
        require(_totalSupply > 0, "Invalid total supply");
        require(_softCap < _hardCap, "Invalid caps");
        require(_startTime > block.timestamp, "Invalid start time");
        require(_endTime > _startTime, "Invalid end time");
        require(bytes(_name).length > 0, "Name required");

        uint256 saleId = saleCounter++;
        Sale storage sale = sales[saleId];
        
        sale.token = IERC20(_token);
        sale.creator = msg.sender;
        sale.tokenPrice = _tokenPrice;
        sale.totalSupply = _totalSupply;
        sale.softCap = _softCap;
        sale.hardCap = _hardCap;
        sale.startTime = _startTime;
        sale.endTime = _endTime;
        sale.saleType = _saleType;
        sale.status = SaleStatus.UPCOMING;
        sale.whitelistEnabled = _whitelistEnabled;
        sale.merkleRoot = _merkleRoot;
        sale.name = _name;
        sale.description = _description;
        sale.website = _website;
        sale.twitter = _twitter;
        sale.telegram = _telegram;
        sale.logoUrl = _logoUrl;

        userSales[msg.sender].push(saleId);

        // Transfer tokens to contract
        sale.token.safeTransferFrom(msg.sender, address(this), _totalSupply);

        emit SaleCreated(saleId, msg.sender, _token, _tokenPrice, _totalSupply, _name);
        return saleId;
    }

    /**
     * @dev Purchase tokens with enhanced tier checking
     */
    function buyTokens(
        uint256 saleId,
        uint256 tokenAmount
    ) external payable nonReentrant whenNotPaused validSale(saleId) saleActive(saleId) {
        Sale storage sale = sales[saleId];
        
        // Get user's tier info (try tier system first, then staking)
        uint8 userTier = 0;
        uint256 allocationMultiplier = 100;
        uint256 earlyAccessHours = 0;
        
        try {
            (userTier, allocationMultiplier, earlyAccessHours,,) = tierSystem.getUserTierInfo(msg.sender);
        } catch {
            try {
                (,, userTier,,,) = stakingContract.getUserStakeInfo(msg.sender);
                allocationMultiplier = tierAllocations[userTier];
                earlyAccessHours = tierEarlyAccess[userTier];
            } catch {
                // Default to bronze tier
                userTier = 0;
                allocationMultiplier = 100;
                earlyAccessHours = 0;
            }
        }
        
        // Check tier-based early access
        if (block.timestamp < sale.startTime + (earlyAccessHours * 1 hours)) {
            require(userTier > 0, "Early access not available for your tier");
        }

        uint256 cost = (tokenAmount * sale.tokenPrice) / 1e18;
        require(msg.value >= cost, "Insufficient payment");
        require(sale.soldAmount + tokenAmount <= sale.totalSupply, "Exceeds available supply");

        // Check tier allocation limits
        uint256 maxAllocation = (sale.totalSupply * allocationMultiplier) / 10000;
        require(
            sale.contributions[msg.sender] + tokenAmount <= maxAllocation, 
            "Exceeds tier allocation"
        );

        // Update sale data
        if (sale.contributions[msg.sender] == 0) {
            sale.participantCount++;
            userParticipations[msg.sender].push(saleId);
            
            // Update global participant count
            if (userTotalInvested[msg.sender] == 0) {
                totalParticipants++;
            }
        }
        
        sale.soldAmount += tokenAmount;
        sale.contributions[msg.sender] += tokenAmount;
        
        // Update analytics
        userTotalInvested[msg.sender] += cost;
        totalVolumeRaised += cost;

        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }

        emit TokensPurchased(saleId, msg.sender, tokenAmount, cost);

        // Auto-finalize if hard cap reached
        if (sale.soldAmount >= sale.totalSupply) {
            _finalizeSale(saleId);
        }
    }

    /**
     * @dev Get enhanced sale information with metadata
     */
    function getSaleInfoWithMetadata(uint256 saleId) external view validSale(saleId) returns (
        address token,
        address creator,
        uint256 tokenPrice,
        uint256 totalSupply,
        uint256 soldAmount,
        uint256 softCap,
        uint256 hardCap,
        uint256 startTime,
        uint256 endTime,
        SaleType saleType,
        SaleStatus status,
        uint256 participantCount,
        string memory name,
        string memory description,
        string memory website,
        string memory logoUrl
    ) {
        Sale storage sale = sales[saleId];
        return (
            address(sale.token),
            sale.creator,
            sale.tokenPrice,
            sale.totalSupply,
            sale.soldAmount,
            sale.softCap,
            sale.hardCap,
            sale.startTime,
            sale.endTime,
            sale.saleType,
            sale.status,
            sale.participantCount,
            sale.name,
            sale.description,
            sale.website,
            sale.logoUrl
        );
    }

    /**
     * @dev Get user's participation history
     */
    function getUserParticipations(address user) external view returns (uint256[] memory) {
        return userParticipations[user];
    }

    /**
     * @dev Get platform analytics
     */
    function getPlatformAnalytics() external view returns (
        uint256 _totalVolumeRaised,
        uint256 _totalParticipants,
        uint256 _totalSales,
        uint256 _activeSales
    ) {
        uint256 activeSales = 0;
        for (uint256 i = 0; i < saleCounter; i++) {
            if (sales[i].status == SaleStatus.ACTIVE) {
                activeSales++;
            }
        }
        
        return (totalVolumeRaised, totalParticipants, saleCounter, activeSales);
    }

    /**
     * @dev Internal function to finalize sale
     */
    function _finalizeSale(uint256 saleId) internal {
        Sale storage sale = sales[saleId];
        sale.status = SaleStatus.ENDED;

        uint256 totalRaised = (sale.soldAmount * sale.tokenPrice) / 1e18;
        
        if (totalRaised >= sale.softCap) {
            // Successful sale
            uint256 fee = (totalRaised * platformFee) / 10000;
            uint256 creatorAmount = totalRaised - fee;
            
            // Transfer funds
            payable(feeRecipient).transfer(fee);
            payable(sale.creator).transfer(creatorAmount);
            
            // Return unsold tokens to creator
            uint256 unsoldTokens = sale.totalSupply - sale.soldAmount;
            if (unsoldTokens > 0) {
                sale.token.safeTransfer(sale.creator, unsoldTokens);
            }
        } else {
            // Failed sale - return all tokens to creator
            sale.token.safeTransfer(sale.creator, sale.totalSupply);
        }

        emit SaleFinalized(saleId, totalRaised);
        emit SaleStatusUpdated(saleId, SaleStatus.ENDED);
    }

    // Include all other functions from TokenSaleFactory.sol
    function claimTokens(uint256 saleId) external nonReentrant validSale(saleId) {
        Sale storage sale = sales[saleId];
        require(block.timestamp > sale.endTime || sale.status == SaleStatus.ENDED, "Sale not ended");
        require(!sale.claimed[msg.sender], "Already claimed");
        require(sale.contributions[msg.sender] > 0, "No tokens to claim");

        uint256 tokenAmount = sale.contributions[msg.sender];
        sale.claimed[msg.sender] = true;

        uint256 totalRaised = (sale.soldAmount * sale.tokenPrice) / 1e18;
        if (totalRaised >= sale.softCap) {
            sale.token.safeTransfer(msg.sender, tokenAmount);
            emit TokensClaimed(saleId, msg.sender, tokenAmount);
        } else {
            uint256 refundAmount = (tokenAmount * sale.tokenPrice) / 1e18;
            payable(msg.sender).transfer(refundAmount);
        }
    }

    function finalizeSale(uint256 saleId) external validSale(saleId) {
        Sale storage sale = sales[saleId];
        require(
            block.timestamp > sale.endTime || sale.soldAmount >= sale.totalSupply,
            "Sale not ready for finalization"
        );
        require(sale.status == SaleStatus.ACTIVE, "Sale already finalized");

        _finalizeSale(saleId);
    }

    function getSaleInfo(uint256 saleId) external view validSale(saleId) returns (
        address token,
        address creator,
        uint256 tokenPrice,
        uint256 totalSupply,
        uint256 soldAmount,
        uint256 softCap,
        uint256 hardCap,
        uint256 startTime,
        uint256 endTime,
        SaleType saleType,
        SaleStatus status,
        uint256 participantCount
    ) {
        Sale storage sale = sales[saleId];
        return (
            address(sale.token),
            sale.creator,
            sale.tokenPrice,
            sale.totalSupply,
            sale.soldAmount,
            sale.softCap,
            sale.hardCap,
            sale.startTime,
            sale.endTime,
            sale.saleType,
            sale.status,
            sale.participantCount
        );
    }

    function getUserContribution(uint256 saleId, address user) external view returns (uint256) {
        return sales[saleId].contributions[user];
    }

    function getUserSales(address user) external view returns (uint256[] memory) {
        return userSales[user];
    }

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high");
        platformFee = newFee;
    }

    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    function updateSaleStatus(uint256 saleId, SaleStatus status) external onlyOwner validSale(saleId) {
        sales[saleId].status = status;
        emit SaleStatusUpdated(saleId, status);
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner whenPaused {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}