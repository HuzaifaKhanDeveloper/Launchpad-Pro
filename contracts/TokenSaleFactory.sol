// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./StakingContract.sol";

/**
 * @title TokenSaleFactory
 * @dev Factory contract for creating and managing token sales with tier integration
 */
contract TokenSaleFactory is Ownable, ReentrancyGuard, Pausable {
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
    }

    StakingContract public stakingContract;
    
    mapping(uint256 => Sale) public sales;
    mapping(address => uint256[]) public userSales;
    
    uint256 public saleCounter;
    uint256 public platformFee = 250; // 2.5% in basis points
    address public feeRecipient;
    
    // Tier multipliers for allocation (basis points)
    uint256[4] public tierAllocations = [100, 250, 500, 1000]; // 1%, 2.5%, 5%, 10%
    uint256[4] public tierEarlyAccess = [0, 1 hours, 2 hours, 4 hours];

    event SaleCreated(
        uint256 indexed saleId, 
        address indexed creator,
        address indexed token, 
        uint256 tokenPrice,
        uint256 totalSupply
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
        address _feeRecipient,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_stakingContract != address(0), "Invalid staking contract");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        stakingContract = StakingContract(_stakingContract);
        feeRecipient = _feeRecipient;
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
        bool _whitelistEnabled,
        bytes32 _merkleRoot
    ) external whenNotPaused returns (uint256) {
        require(_token != address(0), "Invalid token address");
        require(_tokenPrice > 0, "Invalid token price");
        require(_totalSupply > 0, "Invalid total supply");
        require(_softCap < _hardCap, "Invalid caps");
        require(_startTime > block.timestamp, "Invalid start time");
        require(_endTime > _startTime, "Invalid end time");

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

        userSales[msg.sender].push(saleId);

        // Transfer tokens to contract
        sale.token.safeTransferFrom(msg.sender, address(this), _totalSupply);

        emit SaleCreated(saleId, msg.sender, _token, _tokenPrice, _totalSupply);
        return saleId;
    }

    /**
     * @dev Purchase tokens in a sale with tier-based allocation
     */
    function buyTokens(
        uint256 saleId,
        uint256 tokenAmount
    ) external payable nonReentrant whenNotPaused validSale(saleId) saleActive(saleId) {
        Sale storage sale = sales[saleId];
        
        // Get user's tier info from staking contract
        (,, StakingContract.Tier tier,,,, uint256 unlockTime) = stakingContract.getUserStakeInfo(msg.sender);
        
        // Check tier-based early access
        uint256 tierIndex = uint256(tier);
        if (block.timestamp < sale.startTime + tierEarlyAccess[tierIndex]) {
            require(tierIndex > 0, "Early access not available for your tier");
        }

        uint256 cost = (tokenAmount * sale.tokenPrice) / 1e18;
        require(msg.value >= cost, "Insufficient payment");
        require(sale.soldAmount + tokenAmount <= sale.totalSupply, "Exceeds available supply");

        // Check tier allocation limits
        uint256 maxAllocation = (sale.totalSupply * tierAllocations[tierIndex]) / 10000;
        require(
            sale.contributions[msg.sender] + tokenAmount <= maxAllocation, 
            "Exceeds tier allocation"
        );

        // Update sale data
        if (sale.contributions[msg.sender] == 0) {
            sale.participantCount++;
        }
        
        sale.soldAmount += tokenAmount;
        sale.contributions[msg.sender] += tokenAmount;

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
     * @dev Claim purchased tokens (after sale ends)
     */
    function claimTokens(uint256 saleId) external nonReentrant validSale(saleId) {
        Sale storage sale = sales[saleId];
        require(block.timestamp > sale.endTime || sale.status == SaleStatus.ENDED, "Sale not ended");
        require(!sale.claimed[msg.sender], "Already claimed");
        require(sale.contributions[msg.sender] > 0, "No tokens to claim");

        uint256 tokenAmount = sale.contributions[msg.sender];
        sale.claimed[msg.sender] = true;

        // Check if soft cap was reached
        uint256 totalRaised = (sale.soldAmount * sale.tokenPrice) / 1e18;
        if (totalRaised >= sale.softCap) {
            // Successful sale - transfer tokens
            sale.token.safeTransfer(msg.sender, tokenAmount);
            emit TokensClaimed(saleId, msg.sender, tokenAmount);
        } else {
            // Failed sale - refund ETH
            uint256 refundAmount = (tokenAmount * sale.tokenPrice) / 1e18;
            payable(msg.sender).transfer(refundAmount);
        }
    }

    /**
     * @dev Finalize sale (can be called by anyone after end time)
     */
    function finalizeSale(uint256 saleId) external validSale(saleId) {
        Sale storage sale = sales[saleId];
        require(
            block.timestamp > sale.endTime || sale.soldAmount >= sale.totalSupply,
            "Sale not ready for finalization"
        );
        require(sale.status == SaleStatus.ACTIVE, "Sale already finalized");

        _finalizeSale(saleId);
    }

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

    /**
     * @dev Get sale information
     */
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

    /**
     * @dev Get user's contribution for a sale
     */
    function getUserContribution(uint256 saleId, address user) external view returns (uint256) {
        return sales[saleId].contributions[user];
    }

    /**
     * @dev Get user's sales
     */
    function getUserSales(address user) external view returns (uint256[] memory) {
        return userSales[user];
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    /**
     * @dev Update sale status (only owner)
     */
    function updateSaleStatus(uint256 saleId, SaleStatus status) external onlyOwner validSale(saleId) {
        sales[saleId].status = status;
        emit SaleStatusUpdated(saleId, status);
    }

    /**
     * @dev Emergency withdraw (only owner, when paused)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner whenPaused {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
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

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}