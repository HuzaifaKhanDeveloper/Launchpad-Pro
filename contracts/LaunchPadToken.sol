// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LaunchPadToken
 * @dev Enhanced LAUNCH token with governance, burning, and advanced features
 */
contract LaunchPadToken is ERC20, ERC20Burnable, ERC20Votes, ERC20Permit, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100 million tokens
    
    // Tokenomics
    mapping(address => bool) public minters;
    mapping(address => bool) public blacklisted;
    
    // Faucet functionality for testnet
    uint256 public faucetAmount = 1000 * 10**18; // 1000 tokens
    uint256 public faucetCooldown = 24 hours;
    mapping(address => uint256) public lastFaucetClaim;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event Blacklisted(address indexed account);
    event Unblacklisted(address indexed account);
    event FaucetClaimed(address indexed user, uint256 amount);

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Account is blacklisted");
        _;
    }

    constructor(address initialOwner) 
        ERC20("LaunchPad Token", "LAUNCH")
        ERC20Permit("LaunchPad Token")
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
        minters[initialOwner] = true;
    }

    /**
     * @dev Mint new tokens (only by authorized minters)
     */
    function mint(address to, uint256 amount) external onlyMinter whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Faucet function for testnet (allows users to get tokens for testing)
     */
    function faucet(uint256 amount) external whenNotPaused notBlacklisted(msg.sender) {
        require(amount <= faucetAmount, "Amount exceeds faucet limit");
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + faucetCooldown,
            "Faucet cooldown not met"
        );
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");

        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, amount);
        
        emit FaucetClaimed(msg.sender, amount);
    }

    /**
     * @dev Add a new minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove a minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Blacklist an account
     */
    function blacklist(address account) external onlyOwner {
        require(account != owner(), "Cannot blacklist owner");
        blacklisted[account] = true;
        emit Blacklisted(account);
    }

    /**
     * @dev Remove from blacklist
     */
    function unblacklist(address account) external onlyOwner {
        blacklisted[account] = false;
        emit Unblacklisted(account);
    }

    /**
     * @dev Update faucet parameters
     */
    function updateFaucetParams(uint256 newAmount, uint256 newCooldown) external onlyOwner {
        faucetAmount = newAmount;
        faucetCooldown = newCooldown;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override transfer to include blacklist check
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused notBlacklisted(from) notBlacklisted(to) {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Override _afterTokenTransfer for ERC20Votes
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    /**
     * @dev Override _mint for ERC20Votes
     */
    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    /**
     * @dev Override _burn for ERC20Votes
     */
    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }

    /**
     * @dev Get faucet info for a user
     */
    function getFaucetInfo(address user) external view returns (
        uint256 nextClaimTime,
        uint256 claimableAmount,
        bool canClaim
    ) {
        uint256 nextClaim = lastFaucetClaim[user] + faucetCooldown;
        bool eligible = block.timestamp >= nextClaim && !blacklisted[user];
        
        return (
            nextClaim,
            eligible ? faucetAmount : 0,
            eligible
        );
    }

    /**
     * @dev Emergency withdrawal (only owner, when paused)
     */
    function emergencyWithdraw() external onlyOwner whenPaused {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}