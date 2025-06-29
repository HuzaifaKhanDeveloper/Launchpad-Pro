const { ethers } = require("hardhat");

async function main() {
  console.log("Starting comprehensive deployment to Sepolia...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy mock ERC20 token for staking
  console.log("\n1. Deploying Mock Staking Token...");
  const MockToken = await ethers.getContractFactory("MockERC20");
  const stakingToken = await MockToken.deploy("LaunchPad Token", "LAUNCH", ethers.parseEther("10000000"));
  await stakingToken.waitForDeployment();
  const stakingTokenAddress = await stakingToken.getAddress();
  console.log("Staking Token deployed to:", stakingTokenAddress);

  // Deploy Staking Contract
  console.log("\n2. Deploying Staking Contract...");
  const StakingContract = await ethers.getContractFactory("StakingContract");
  const stakingContract = await StakingContract.deploy(stakingTokenAddress, deployer.address);
  await stakingContract.waitForDeployment();
  const stakingContractAddress = await stakingContract.getAddress();
  console.log("Staking Contract deployed to:", stakingContractAddress);

  // Deploy Token Sale Factory
  console.log("\n3. Deploying Token Sale Factory...");
  const TokenSaleFactory = await ethers.getContractFactory("TokenSaleFactory");
  const tokenSaleFactory = await TokenSaleFactory.deploy(
    stakingContractAddress,
    deployer.address, // Fee recipient
    deployer.address  // Initial owner
  );
  await tokenSaleFactory.waitForDeployment();
  const tokenSaleFactoryAddress = await tokenSaleFactory.getAddress();
  console.log("Token Sale Factory deployed to:", tokenSaleFactoryAddress);

  // Deploy Vesting Contract
  console.log("\n4. Deploying Vesting Contract...");
  const VestingContract = await ethers.getContractFactory("VestingContract");
  const vestingContract = await VestingContract.deploy(deployer.address);
  await vestingContract.waitForDeployment();
  const vestingContractAddress = await vestingContract.getAddress();
  console.log("Vesting Contract deployed to:", vestingContractAddress);

  // Deploy mock NFT for tier system
  console.log("\n5. Deploying Mock Tier NFT...");
  const MockNFT = await ethers.getContractFactory("MockERC721");
  const tierNFT = await MockNFT.deploy("LaunchPad Tier NFT", "LPTIER");
  await tierNFT.waitForDeployment();
  const tierNFTAddress = await tierNFT.getAddress();
  console.log("Tier NFT deployed to:", tierNFTAddress);

  // Deploy Tier System
  console.log("\n6. Deploying Tier System...");
  const TierSystem = await ethers.getContractFactory("TierSystem");
  const tierSystem = await TierSystem.deploy(stakingTokenAddress, tierNFTAddress, deployer.address);
  await tierSystem.waitForDeployment();
  const tierSystemAddress = await tierSystem.getAddress();
  console.log("Tier System deployed to:", tierSystemAddress);

  // Fund staking contract with reward tokens
  console.log("\n7. Funding Staking Contract with Rewards...");
  const rewardAmount = ethers.parseEther("1000000"); // 1M tokens for rewards
  await stakingToken.transfer(stakingContractAddress, rewardAmount);
  await stakingContract.fundRewardPool(rewardAmount);
  console.log("Funded staking contract with", ethers.formatEther(rewardAmount), "LAUNCH tokens");

  // Create sample token for testing sales
  console.log("\n8. Deploying Sample Sale Token...");
  const sampleToken = await MockToken.deploy("Sample Project Token", "SPT", ethers.parseEther("1000000"));
  await sampleToken.waitForDeployment();
  const sampleTokenAddress = await sampleToken.getAddress();
  console.log("Sample Token deployed to:", sampleTokenAddress);

  // Create a sample token sale
  console.log("\n9. Creating Sample Token Sale...");
  const saleAmount = ethers.parseEther("100000"); // 100k tokens for sale
  await sampleToken.approve(tokenSaleFactoryAddress, saleAmount);
  
  const startTime = Math.floor(Date.now() / 1000) + 300; // Start in 5 minutes
  const endTime = startTime + (7 * 24 * 60 * 60); // End in 7 days
  
  const createSaleTx = await tokenSaleFactory.createSale(
    sampleTokenAddress,
    ethers.parseEther("0.001"), // 0.001 ETH per token
    saleAmount,
    ethers.parseEther("10"), // 10 ETH soft cap
    ethers.parseEther("100"), // 100 ETH hard cap
    startTime,
    endTime,
    0, // FIXED sale type
    false, // No whitelist
    ethers.ZeroHash // No merkle root
  );
  await createSaleTx.wait();
  console.log("Sample token sale created");

  // Verify all deployments
  console.log("\n10. Verifying Deployments...");
  
  // Check staking contract
  const totalStaked = await stakingContract.totalStaked();
  const rewardPool = await stakingContract.rewardPool();
  console.log("Staking Contract - Total Staked:", ethers.formatEther(totalStaked));
  console.log("Staking Contract - Reward Pool:", ethers.formatEther(rewardPool));
  
  // Check token sale factory
  const saleCounter = await tokenSaleFactory.saleCounter();
  console.log("Token Sale Factory - Sales Created:", saleCounter.toString());

  // Save deployment addresses
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      StakingToken: stakingTokenAddress,
      StakingContract: stakingContractAddress,
      TokenSaleFactory: tokenSaleFactoryAddress,
      VestingContract: vestingContractAddress,
      TierNFT: tierNFTAddress,
      TierSystem: tierSystemAddress,
      SampleToken: sampleTokenAddress
    },
    sampleSale: {
      tokenAddress: sampleTokenAddress,
      startTime: new Date(startTime * 1000).toISOString(),
      endTime: new Date(endTime * 1000).toISOString(),
      tokenPrice: "0.001 ETH",
      totalSupply: "100,000 SPT"
    }
  };

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Generate environment variables
  console.log("\n=== ENVIRONMENT VARIABLES FOR .env ===");
  console.log(`VITE_STAKING_TOKEN_CONTRACT=${stakingTokenAddress}`);
  console.log(`VITE_STAKING_CONTRACT=${stakingContractAddress}`);
  console.log(`VITE_TOKEN_SALE_CONTRACT=${tokenSaleFactoryAddress}`);
  console.log(`VITE_VESTING_CONTRACT=${vestingContractAddress}`);
  console.log(`VITE_TIER_NFT_CONTRACT=${tierNFTAddress}`);
  console.log(`VITE_TIER_SYSTEM_CONTRACT=${tierSystemAddress}`);

  console.log("\n=== NEXT STEPS ===");
  console.log("1. Update your .env file with the contract addresses above");
  console.log("2. Verify contracts on Etherscan using:");
  console.log(`   npx hardhat verify --network sepolia ${stakingTokenAddress} "LaunchPad Token" "LAUNCH" "10000000000000000000000000"`);
  console.log(`   npx hardhat verify --network sepolia ${stakingContractAddress} ${stakingTokenAddress} ${deployer.address}`);
  console.log(`   npx hardhat verify --network sepolia ${tokenSaleFactoryAddress} ${stakingContractAddress} ${deployer.address} ${deployer.address}`);
  console.log("3. Test the platform functionality");
  console.log("4. Use the faucet to get LAUNCH tokens for testing");

  console.log("\n✅ Professional deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });