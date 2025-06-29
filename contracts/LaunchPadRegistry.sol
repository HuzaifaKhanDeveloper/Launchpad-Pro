// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LaunchPadRegistry
 * @dev Central registry for all LaunchPad contracts and configurations
 */
contract LaunchPadRegistry is Ownable, Pausable {
    
    struct ContractInfo {
        address contractAddress;
        string name;
        string version;
        bool isActive;
        uint256 deployedAt;
    }

    struct ProjectInfo {
        address creator;
        string name;
        string description;
        string website;
        string twitter;
        string telegram;
        string logoUrl;
        address tokenAddress;
        uint256 saleId;
        bool isVerified;
        uint256 registeredAt;
    }

    // Contract registry
    mapping(string => ContractInfo) public contracts;
    mapping(address => bool) public authorizedContracts;
    string[] public contractNames;

    // Project registry
    mapping(uint256 => ProjectInfo) public projects;
    mapping(address => uint256[]) public creatorProjects;
    mapping(address => bool) public verifiedCreators;
    uint256 public projectCounter;

    // KYC and verification
    mapping(address => bool) public kycVerified;
    mapping(address => uint256) public verificationLevel; // 0: None, 1: Basic, 2: Advanced, 3: Premium

    // Platform settings
    uint256 public platformFee = 250; // 2.5%
    address public feeRecipient;
    uint256 public minSaleDuration = 1 days;
    uint256 public maxSaleDuration = 30 days;

    // Events
    event ContractRegistered(string indexed name, address indexed contractAddress, string version);
    event ContractUpdated(string indexed name, address indexed oldAddress, address indexed newAddress);
    event ProjectRegistered(uint256 indexed projectId, address indexed creator, string name);
    event ProjectVerified(uint256 indexed projectId, address indexed verifier);
    event KYCStatusUpdated(address indexed user, bool status);
    event VerificationLevelUpdated(address indexed user, uint256 level);

    constructor(address _feeRecipient, address _initialOwner) Ownable(_initialOwner) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Register a new contract in the registry
     */
    function registerContract(
        string memory name,
        address contractAddress,
        string memory version
    ) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        require(bytes(name).length > 0, "Name cannot be empty");

        contracts[name] = ContractInfo({
            contractAddress: contractAddress,
            name: name,
            version: version,
            isActive: true,
            deployedAt: block.timestamp
        });

        authorizedContracts[contractAddress] = true;
        contractNames.push(name);

        emit ContractRegistered(name, contractAddress, version);
    }

    /**
     * @dev Update an existing contract
     */
    function updateContract(
        string memory name,
        address newAddress,
        string memory newVersion
    ) external onlyOwner {
        require(contracts[name].contractAddress != address(0), "Contract not found");
        require(newAddress != address(0), "Invalid new address");

        address oldAddress = contracts[name].contractAddress;
        
        // Remove authorization from old address
        authorizedContracts[oldAddress] = false;
        
        // Update contract info
        contracts[name].contractAddress = newAddress;
        contracts[name].version = newVersion;
        
        // Authorize new address
        authorizedContracts[newAddress] = true;

        emit ContractUpdated(name, oldAddress, newAddress);
    }

    /**
     * @dev Register a new project
     */
    function registerProject(
        string memory name,
        string memory description,
        string memory website,
        string memory twitter,
        string memory telegram,
        string memory logoUrl,
        address tokenAddress,
        uint256 saleId
    ) external whenNotPaused returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(tokenAddress != address(0), "Invalid token address");

        uint256 projectId = projectCounter++;
        
        projects[projectId] = ProjectInfo({
            creator: msg.sender,
            name: name,
            description: description,
            website: website,
            twitter: twitter,
            telegram: telegram,
            logoUrl: logoUrl,
            tokenAddress: tokenAddress,
            saleId: saleId,
            isVerified: verifiedCreators[msg.sender],
            registeredAt: block.timestamp
        });

        creatorProjects[msg.sender].push(projectId);

        emit ProjectRegistered(projectId, msg.sender, name);
        return projectId;
    }

    /**
     * @dev Verify a project (only owner)
     */
    function verifyProject(uint256 projectId) external onlyOwner {
        require(projects[projectId].creator != address(0), "Project not found");
        
        projects[projectId].isVerified = true;
        emit ProjectVerified(projectId, msg.sender);
    }

    /**
     * @dev Update KYC status
     */
    function updateKYCStatus(address user, bool status) external onlyOwner {
        kycVerified[user] = status;
        emit KYCStatusUpdated(user, status);
    }

    /**
     * @dev Update verification level
     */
    function updateVerificationLevel(address user, uint256 level) external onlyOwner {
        require(level <= 3, "Invalid verification level");
        verificationLevel[user] = level;
        
        if (level >= 2) {
            verifiedCreators[user] = true;
        }
        
        emit VerificationLevelUpdated(user, level);
    }

    /**
     * @dev Get contract address by name
     */
    function getContract(string memory name) external view returns (address) {
        return contracts[name].contractAddress;
    }

    /**
     * @dev Check if address is authorized contract
     */
    function isAuthorizedContract(address contractAddress) external view returns (bool) {
        return authorizedContracts[contractAddress];
    }

    /**
     * @dev Get all contract names
     */
    function getAllContractNames() external view returns (string[] memory) {
        return contractNames;
    }

    /**
     * @dev Get projects by creator
     */
    function getCreatorProjects(address creator) external view returns (uint256[] memory) {
        return creatorProjects[creator];
    }

    /**
     * @dev Get user verification info
     */
    function getUserVerificationInfo(address user) external view returns (
        bool isKYCVerified,
        uint256 level,
        bool isVerifiedCreator
    ) {
        return (
            kycVerified[user],
            verificationLevel[user],
            verifiedCreators[user]
        );
    }

    /**
     * @dev Update platform settings
     */
    function updatePlatformSettings(
        uint256 newFee,
        address newFeeRecipient,
        uint256 newMinDuration,
        uint256 newMaxDuration
    ) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        require(newFeeRecipient != address(0), "Invalid fee recipient");
        require(newMinDuration <= newMaxDuration, "Invalid duration range");

        platformFee = newFee;
        feeRecipient = newFeeRecipient;
        minSaleDuration = newMinDuration;
        maxSaleDuration = newMaxDuration;
    }

    /**
     * @dev Pause the registry
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the registry
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Deactivate a contract
     */
    function deactivateContract(string memory name) external onlyOwner {
        require(contracts[name].contractAddress != address(0), "Contract not found");
        contracts[name].isActive = false;
        authorizedContracts[contracts[name].contractAddress] = false;
    }

    /**
     * @dev Reactivate a contract
     */
    function reactivateContract(string memory name) external onlyOwner {
        require(contracts[name].contractAddress != address(0), "Contract not found");
        contracts[name].isActive = true;
        authorizedContracts[contracts[name].contractAddress] = true;
    }
}