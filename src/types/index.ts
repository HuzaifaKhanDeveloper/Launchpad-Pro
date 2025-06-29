export interface User {
  id: string;
  address: string;
  email?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  stakedAmount: number;
  createdAt: Date;
}

export interface TokenSale {
  id: string;
  name: string;
  symbol: string;
  description: string;
  tokenAddress: string;
  saleType: 'fixed' | 'dutch' | 'lottery';
  startTime: Date;
  endTime: Date;
  totalSupply: number;
  tokenPrice: number;
  softCap: number;
  hardCap: number;
  raised: number;
  participants: number;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  whitelist: boolean;
  vestingEnabled: boolean;
  logo: string;
  website: string;
  twitter: string;
  telegram: string;
}

export interface VestingSchedule {
  id: string;
  tokenSaleId: string;
  userAddress: string;
  totalAmount: number;
  claimedAmount: number;
  cliffPeriod: number; // in days
  vestingPeriod: number; // in days
  startTime: Date;
  nextUnlockTime: Date;
  unlockedAmount: number;
}

export interface TierBenefit {
  tier: string;
  allocationPercentage: number;
  earlyAccessHours: number;
  guaranteedAllocation: boolean;
  minimumStake: number;
  color: string;
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'purchase' | 'claim' | 'stake' | 'unstake';
  amount: number;
  token: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
}