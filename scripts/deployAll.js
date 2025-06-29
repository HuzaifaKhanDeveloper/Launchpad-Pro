const { ethers } = require("hardhat");

async function main() {
  console.log("Starting comprehensive deployment of all LaunchPad contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  const deployedContracts = {};

  try {
    // 1. Deploy LaunchPad Token (Enhanced LAUNCH token)
    console.log("\n1. Deploying LaunchPad Token...");
    const LaunchPadToken = await ethers.getContractFactory("LaunchPadToken");
    const launchToken = await LaunchPadToken.deploy(deployer.address);
    await launchToken.waitForDeployment();
    deployedContracts.LaunchPadToken = await launchToken.getAddress();
    console.log("LaunchPad Token deployed to:", deployedContracts.LaunchPadToken);

    // 2. Deploy Registry
    console.log("\n2. Deploying LaunchPad Registry...");
    const LaunchPadRegistry = await ethers.getContractFactory("LaunchPadRegistry");
    const registry = await LaunchPadRegistry.deploy(deployer.address, deployer.address);
    await registry.waitForDeployment();
    deployedContracts.LaunchPadRegistry = await registry.getAddress();
    console.log("LaunchPad Registry deployed to:", deployedContracts.LaunchPadRegistry);

    // 3. Deploy Staking Contract
    console.log("\n3. Deploying Staking Contract...");
    const StakingContract = await ethers.getContractFactory("StakingContract");
    const stakingContract = await StakingContract.deploy(deployedContracts.LaunchPadToken, deployer.address);
    await stakingContract.waitForDeployment();
    deployedContracts.StakingContract = await stakingContract.getAddress();
    console.log("Staking Contract deployed to:", deployedContracts.StakingContract);

    // 4. Deploy Tier NFT
    console.log("\n4. Deploying Tier NFT...");
    const MockERC721 = await ethers.getContractFactory("MockERC721");
    const tierNFT = await MockERC721.deploy("LaunchPad Tier NFT", "LPTIER");
    await tierNFT.waitForDeployment();
    deployedContracts.TierNFT = await tierNFT.getAddress();
    console.log("Tier NFT deployed to:", deployedContracts.TierNFT);

    // 5. Deploy Tier System
    console.log("\n5. Deploying Tier System...");
    const TierSystem = await ethers.getContractFactory("TierSystem");
    const tierSystem = await TierSystem.deploy(
      deployedContracts.LaunchPadToken,
      deployedContracts.TierNFT,
      deployer.address
    );
    await tierSystem.waitForDeployment();
    deployedContracts.TierSystem = await tierSystem.getAddress();
    console.log("Tier System deployed to:", deployedContracts.TierSystem);

    // 6. Deploy Vesting Contract
    console.log("\n6. Deploying Vesting Contract...");
    const VestingContract = await ethers.getContractFactory("VestingContract");
    const vestingContract = await VestingContract.deploy(deployer.address);
    await vestingContract.waitForDeployment();
    deployedContracts.VestingContract = await vestingContract.getAddress();
    console.log("Vesting Contract deployed to:", deployedContracts.VestingContract);

    // 7. Deploy Enhanced Token Sale Factory
    console.log("\n7. Deploying Enhanced Token Sale Factory...");
    const TokenSaleFactoryV2 = await ethers.getContractFactory("TokenSaleFactoryV2");
    const tokenSaleFactory = await TokenSaleFactoryV2.deploy(
      deployedContracts.StakingContract,
      deployedContracts.TierSystem,
      deployer.address, // Fee recipient
      deployer.address  // Initial owner
    );
    await tokenSaleFactory.waitForDeployment();
    deployedContracts.TokenSaleFactory = await tokenSaleFactory.getAddress();
    console.log("Enhanced Token Sale Factory deployed to:", deployedContracts.TokenSaleFactory);

    // 8. Deploy Timelock for Governance
    console.log("\n8. Deploying Timelock Controller...");
    const TimelockController = await ethers.getContractFactory("TimelockController");
    const timelock = await TimelockController.deploy(
      2 * 24 * 60 * 60, // 2 days delay
      [deployer.address], // Proposers
      [deployer.address], // Executors
      deployer.address // Admin
    );
    await timelock.waitForDeployment();
    deployedContracts.TimelockController = await timelock.getAddress();
    console.log("Timelock Controller deployed to:", deployedContracts.TimelockController);

    // 9. Deploy Governance
    console.log("\n9. Deploying LaunchPad Governance...");
    const LaunchPadGovernance = await ethers.getContractFactory("LaunchPadGovernance");
    const governance = await LaunchPadGovernance.deploy(
      deployedContracts.LaunchPadToken, // Voting token
      deployedContracts.TimelockController, // Timelock
      1, // Voting delay (1 block)
      50400, // Voting period (1 week in blocks)
      ethers.parseEther("1000"), // Proposal threshold (1000 tokens)
      4 // Quorum percentage (4%)
    );
    await governance.waitForDeployment();
    deployedContracts.LaunchPadGovernance = await governance.getAddress();
    console.log("LaunchPad Governance deployed to:", deployedContracts.LaunchPadGovernance);

    // 10. Register contracts in registry
    console.log("\n10. Registering contracts in registry...");
    await registry.registerContract("LaunchPadToken", deployedContracts.LaunchPadToken, "1.0.0");
    await registry.registerContract("StakingContract", deployedContracts.StakingContract, "1.0.0");
    await registry.registerContract("TierSystem", deployedContracts.TierSystem, "1.0.0");
    await registry.registerContract("TierNFT", deployedContracts.TierNFT, "1.0.0");
    await registry.registerContract("VestingContract", deployedContracts.VestingContract, "1.0.0");
    await registry.registerContract("TokenSaleFactory", deployedContracts.TokenSaleFactory, "2.0.0");
    await registry.registerContract("LaunchPadGovernance", deployedContracts.LaunchPadGovernance, "1.0.0");
    await registry.registerContract("TimelockController", deployedContracts.TimelockController, "1.0.0");
    console.log("All contracts registered in registry");

    // 11. Setup initial configurations
    console.log("\n11. Setting up initial configurations...");
    
    // Fund staking contract with rewards
    const rewardAmount = ethers.parseEther("1000000"); // 1M tokens for rewards
    await launchToken.transfer(deployedContracts.StakingContract, rewardAmount);
    await stakingContract.fundRewardPool(rewardAmount);
    console.log("Funded staking contract with rewards");

    // Add staking contract as minter for the token
    await launchToken.addMinter(deployedContracts.StakingContract);
    await launchToken.addMinter(deployedContracts.TierSystem);
    console.log("Added contracts as token minters");

    // 12. Deploy sample token for testing
    console.log("\n12. Deploying sample token for testing...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const sampleToken = await MockERC20.deploy("Sample Project Token", "SPT", ethers.parseEther("1000000"));
    await sampleToken.waitForDeployment();
    deployedContracts.SampleToken = await sampleToken.getAddress();
    console.log("Sample Token deployed to:", deployedContracts.SampleToken);

    // 13. Create sample token sale
    console.log("\n13. Creating sample token sale...");
    const saleAmount = ethers.parseEther("100000"); // 100k tokens for sale
    await sampleToken.approve(deployedContracts.TokenSaleFactory, saleAmount);
    
    const startTime = Math.floor(Date.now() / 1000) + 300; // Start in 5 minutes
    const endTime = startTime + (7 * 24 * 60 * 60); // End in 7 days
    
    const createSaleTx = await tokenSaleFactory.createSaleWithMetadata(
      deployedContracts.SampleToken,
      ethers.parseEther("0.001"), // 0.001 ETH per token
      saleAmount,
      ethers.parseEther("10"), // 10 ETH soft cap
      ethers.parseEther("100"), // 100 ETH hard cap
      startTime,
      endTime,
      0, // FIXED sale type
      false, // No whitelist
      ethers.ZeroHash, // No merkle root
      "Sample Project Token",
      "A sample token sale for testing the enhanced LaunchPad platform with full functionality.",
      "https://sampleproject.io",
      "https://twitter.com/sampleproject",
      "https://t.me/sampleproject",
      "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
    );
    await createSaleTx.wait();
    console.log("Sample token sale created with enhanced metadata");

    // 14. Final verification
    console.log("\n14. Verifying deployments...");
    
    // Check token supply and minters
    const totalSupply = await launchToken.totalSupply();
    const stakingBalance = await launchToken.balanceOf(deployedContracts.StakingContract);
    console.log("LAUNCH Token - Total Supply:", ethers.formatEther(totalSupply));
    console.log("LAUNCH Token - Staking Contract Balance:", ethers.formatEther(stakingBalance));
    
    // Check staking contract
    const platformStats = await stakingContract.getPlatformStats();
    console.log("Staking Contract - Reward Pool:", ethers.formatEther(platformStats[2]));
    
    // Check token sale factory
    const saleCounter = await tokenSaleFactory.saleCounter();
    const platformAnalytics = await tokenSaleFactory.getPlatformAnalytics();
    console.log("Token Sale Factory - Sales Created:", saleCounter.toString());
    console.log("Token Sale Factory - Total Volume:", ethers.formatEther(platformAnalytics[0]));

    // Check registry
    const contractNames = await registry.getAllContractNames();
    console.log("Registry - Registered Contracts:", contractNames.length);

    // Generate deployment summary
    const deploymentInfo = {
      network: "sepolia",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      sampleSale: {
        tokenAddress: deployedContracts.SampleToken,
        startTime: new Date(startTime * 1000).toISOString(),
        endTime: new Date(endTime * 1000).toISOString(),
        tokenPrice: "0.001 ETH",
        totalSupply: "100,000 SPT"
      },
      features: [
        "Enhanced LAUNCH token with governance and faucet",
        "Comprehensive staking system with tier benefits",
        "Advanced tier system with NFT integration",
        "Professional token sale factory with metadata",
        "Decentralized governance with timelock",
        "Central registry for contract management",
        "Automated vesting schedules",
        "Sample token sale for testing"
      ]
    };

    console.log("\n=== COMPREHENSIVE DEPLOYMENT SUMMARY ===");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Generate environment variables
    console.log("\n=== ENVIRONMENT VARIABLES FOR .env ===");
    console.log(`VITE_STAKING_TOKEN_CONTRACT=${deployedContracts.LaunchPadToken}`);
    console.log(`VITE_STAKING_CONTRACT=${deployedContracts.StakingContract}`);
    console.log(`VITE_TOKEN_SALE_CONTRACT=${deployedContracts.TokenSaleFactory}`);
    console.log(`VITE_VESTING_CONTRACT=${deployedContracts.VestingContract}`);
    console.log(`VITE_TIER_NFT_CONTRACT=${deployedContracts.TierNFT}`);
    console.log(`VITE_TIER_SYSTEM_CONTRACT=${deployedContracts.TierSystem}`);
    console.log(`VITE_REGISTRY_CONTRACT=${deployedContracts.LaunchPadRegistry}`);
    console.log(`VITE_GOVERNANCE_CONTRACT=${deployedContracts.LaunchPadGovernance}`);

    console.log("\n=== NEXT STEPS ===");
    console.log("1. Update your .env file with the contract addresses above");
    console.log("2. Verify contracts on Etherscan using the verification commands");
    console.log("3. Test all platform functionality with the deployed contracts");
    console.log("4. Use the enhanced faucet to get LAUNCH tokens for testing");
    console.log("5. Create test token sales using the enhanced factory");

    console.log("\n✅ COMPREHENSIVE DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("🚀 All contracts deployed and configured!");
    console.log("🎯 Platform ready for professional use!");

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });