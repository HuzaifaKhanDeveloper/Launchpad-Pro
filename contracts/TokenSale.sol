// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title TokenSale
 * @dev Advanced token sale contract with multiple sale types, KYC integration, and tier-based access
 */
contract TokenSale is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    enum SaleType { FIXED, DUTCH_AUCTION, LOTTERY }
    enum SaleStatus { UPCOMING, ACTIVE, ENDED, CANCELLED }

    struct Sale {
        IERC20 token;
        uint256 tokenPrice;
        uint256 totalSupply;
        uint256 soldAmount;
        uint256 softCap;
        uint256 hardCap;
        uint256 startTime;
        uint256 endTime;
        SaleType saleType;
        SaleStatus status;
        bool kycRequired;
        bool whitelistEnabled;
        bytes32 merkleRoot;
        mapping(address => uint256) contributions;
        mapping(address => bool) claimed;
    }

    struct UserTier {
        uint8 tier; // 0: Bronze, 1: Silver, 2: Gold, 3: Platinum
        uint256 allocation;
        uint256 earlyAccessTime;
    }

    mapping(uint256 => Sale) public sales;
    mapping(address => bool) public kycApproved;
    mapping(address => UserTier) public userTiers;
    mapping(uint256 => mapping(address => uint256)) public userContributions;
    
    uint256 public saleCounter;
    address public kycRegistry;
    address public vestingContract;
    
    // Tier configurations
    uint256[4] public tierAllocations = [100, 250, 500, 1000]; // in basis points (1% = 100)
    uint256[4] public tierEarlyAccess = [0, 1 hours, 2 hours, 4 hours];

    event SaleCreated(uint256 indexed saleId, address indexed token, uint256 tokenPrice);
    event TokensPurchased(uint256 indexed saleId, address indexed buyer, uint256 amount, uint256 cost);
    event TokensClaimed(uint256 indexed saleId, address indexed claimer, uint256 amount);
    event KYCStatusUpdated(address indexed user, bool approved);
    event TierUpdated(address indexed user, uint8 tier);
    event SaleStatusUpdated(uint256 indexed saleId, SaleStatus status);

    modifier onlyKYCApproved() {
        require(!sales[saleCounter].kycRequired || kycApproved[msg.sender], "KYC approval required");
        _;
    }

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

    constructor(address _kycRegistry, address _vestingContract, address _initialOwner) Ownable(_initialOwner) {
        kycRegistry = _kycRegistry;
        vestingContract = _vestingContract;
    }

    /**
     * @dev Create a new token sale
     */
    function createSale(
        address _token,
        uint256 _tokenPrice,
        uint256 _totalSupply,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _startTime,
        uint256 _endTime,
        SaleType _saleType,
        bool _kycRequired,
        bool _whitelistEnabled,
        bytes32 _merkleRoot
    ) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(_tokenPrice > 0, "Invalid token price");
        require(_totalSupply > 0, "Invalid total supply");
        require(_softCap < _hardCap, "Invalid caps");
        require(_startTime > block.timestamp, "Invalid start time");
        require(_endTime > _startTime, "Invalid end time");

        uint256 saleId = saleCounter++;
        Sale storage sale = sales[saleId];
        
        sale.token = IERC20(_token);
        sale.tokenPrice = _tokenPrice;
        sale.totalSupply = _totalSupply;
        sale.softCap = _softCap;
        sale.hardCap = _hardCap;
        sale.startTime = _startTime;
        sale.endTime = _endTime;
        sale.saleType = _saleType;
        sale.status = SaleStatus.UPCOMING;
        sale.kycRequired = _kycRequired;
        sale.whitelistEnabled = _whitelistEnabled;
        sale.merkleRoot = _merkleRoot;

        // Transfer tokens to contract
        sale.token.safeTransferFrom(msg.sender, address(this), _totalSupply);

        emit SaleCreated(saleId, _token, _tokenPrice);
    }

    /**
     * @dev Purchase tokens in a sale
     */
    function buyTokens(
        uint256 saleId,
        uint256 tokenAmount,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant whenNotPaused onlyKYCApproved validSale(saleId) saleActive(saleId) {
        Sale storage sale = sales[saleId];
        
        // Whitelist verification
        if (sale.whitelistEnabled) {
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            require(MerkleProof.verify(merkleProof, sale.merkleRoot, leaf), "Not whitelisted");
        }

        // Tier-based access control
        UserTier memory tier = userTiers[msg.sender];
        if (block.timestamp < sale.startTime + tierEarlyAccess[tier.tier]) {
            require(tier.tier > 0, "Early access not available for your tier");
        }

        uint256 cost = tokenAmount * sale.tokenPrice / 1e18;
        require(msg.value >= cost, "Insufficient payment");
        require(sale.soldAmount + tokenAmount <= sale.totalSupply, "Exceeds available supply");

        // Tier allocation limits
        uint256 maxAllocation = (sale.totalSupply * tierAllocations[tier.tier]) / 10000;
        require(userContributions[saleId][msg.sender] + tokenAmount <= maxAllocation, "Exceeds tier allocation");

        sale.soldAmount += tokenAmount;
        userContributions[saleId][msg.sender] += tokenAmount;

        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }

        emit TokensPurchased(saleId, msg.sender, tokenAmount, cost);
    }

    /**
     * @dev Claim purchased tokens (after sale ends)
     */
    function claimTokens(uint256 saleId) external nonReentrant validSale(saleId) {
        Sale storage sale = sales[saleId];
        require(block.timestamp > sale.endTime, "Sale not ended");
        require(!sale.claimed[msg.sender], "Already claimed");
        require(userContributions[saleId][msg.sender] > 0, "No tokens to claim");

        uint256 tokenAmount = userContributions[saleId][msg.sender];
        sale.claimed[msg.sender] = true;

        // If vesting is enabled, transfer to vesting contract
        if (vestingContract != address(0)) {
            sale.token.safeTransfer(vestingContract, tokenAmount);
            // Call vesting contract to set up schedule
            // IVesting(vestingContract).createVestingSchedule(msg.sender, tokenAmount, saleId);
        } else {
            sale.token.safeTransfer(msg.sender, tokenAmount);
        }

        emit TokensClaimed(saleId, msg.sender, tokenAmount);
    }

    /**
     * @dev Update KYC status for a user
     */
    function updateKYCStatus(address user, bool approved) external onlyOwner {
        kycApproved[user] = approved;
        emit KYCStatusUpdated(user, approved);
    }

    /**
     * @dev Update user tier
     */
    function updateUserTier(address user, uint8 tier, uint256 allocation) external onlyOwner {
        require(tier < 4, "Invalid tier");
        userTiers[user] = UserTier(tier, allocation, tierEarlyAccess[tier]);
        emit TierUpdated(user, tier);
    }

    /**
     * @dev Update sale status
     */
    function updateSaleStatus(uint256 saleId, SaleStatus status) external onlyOwner validSale(saleId) {
        sales[saleId].status = status;
        emit SaleStatusUpdated(saleId, status);
    }

    /**
     * @dev Withdraw funds (only after successful sale)
     */
    function withdrawFunds(uint256 saleId) external onlyOwner validSale(saleId) {
        Sale storage sale = sales[saleId];
        require(block.timestamp > sale.endTime, "Sale not ended");
        require(address(this).balance >= sale.softCap, "Soft cap not reached");
        
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Emergency refund (if soft cap not reached)
     */
    function refund(uint256 saleId) external nonReentrant validSale(saleId) {
        Sale storage sale = sales[saleId];
        require(block.timestamp > sale.endTime, "Sale not ended");
        require(address(this).balance < sale.softCap, "Soft cap reached");
        require(userContributions[saleId][msg.sender] > 0, "No contribution to refund");

        uint256 refundAmount = userContributions[saleId][msg.sender] * sale.tokenPrice / 1e18;
        userContributions[saleId][msg.sender] = 0;
        
        payable(msg.sender).transfer(refundAmount);
    }

    /**
     * @dev Get sale information
     */
    function getSaleInfo(uint256 saleId) external view validSale(saleId) returns (
        address token,
        uint256 tokenPrice,
        uint256 totalSupply,
        uint256 soldAmount,
        uint256 softCap,
        uint256 hardCap,
        uint256 startTime,
        uint256 endTime,
        SaleType saleType,
        SaleStatus status
    ) {
        Sale storage sale = sales[saleId];
        return (
            address(sale.token),
            sale.tokenPrice,
            sale.totalSupply,
            sale.soldAmount,
            sale.softCap,
            sale.hardCap,
            sale.startTime,
            sale.endTime,
            sale.saleType,
            sale.status
        );
    }

    /**
     * @dev Get user's contribution for a sale
     */
    function getUserContribution(uint256 saleId, address user) external view returns (uint256) {
        return userContributions[saleId][user];
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