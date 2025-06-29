import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { web3Service, CONTRACT_ADDRESSES, TOKEN_SALE_FACTORY_ABI, ERC20_ABI } from '../lib/web3';
import { toast } from 'react-hot-toast';

export const useTokenSale = () => {
  const [isLoading, setIsLoading] = useState(false);

  const buyTokens = useCallback(async (
    saleId: number,
    tokenAmount: string,
    ethAmount: string
  ) => {
    if (!CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY) {
      toast.error('Token sale contract not configured');
      return;
    }

    // Validate inputs
    if (!tokenAmount || !ethAmount || parseFloat(tokenAmount) <= 0 || parseFloat(ethAmount) <= 0) {
      toast.error('Invalid purchase amounts');
      return;
    }

    setIsLoading(true);
    try {
      // Parse amounts with proper precision
      const tokenAmountWei = web3Service.parseEther(tokenAmount);
      const ethAmountWei = web3Service.parseEther(ethAmount);

      // Validate sale exists and is active
      try {
        const saleInfo = await web3Service.readContract(
          CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY,
          TOKEN_SALE_FACTORY_ABI,
          'getSaleInfo',
          [saleId]
        );
        
        if (!saleInfo || saleInfo[10] !== 1) { // status should be 1 for active
          throw new Error('Sale is not active or does not exist');
        }
      } catch (error) {
        throw new Error('Invalid sale ID or sale not found');
      }

      // Get user's tier info for allocation checking
      const signer = web3Service.getSigner();
      const userAddress = await signer.getAddress();
      
      try {
        const tierInfo = await web3Service.getUserTierFromContract(userAddress);
        console.log('User tier info:', tierInfo);
      } catch (error) {
        console.warn('Could not get tier info, proceeding with purchase:', error);
      }

      // Execute transaction
      const tx = await web3Service.callContract(
        CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY,
        TOKEN_SALE_FACTORY_ABI,
        'buyTokens',
        [saleId, tokenAmountWei],
        { value: ethAmountWei }
      );

      toast.loading('Transaction submitted...', { id: 'buy-tokens' });
      
      const receipt = await web3Service.waitForTransaction(tx.hash);
      
      if (receipt && receipt.status === 1) {
        toast.success('Tokens purchased successfully!', { id: 'buy-tokens' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to buy tokens:', error);
      toast.error(error.message || 'Failed to buy tokens', { id: 'buy-tokens' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claimTokens = useCallback(async (saleId: number) => {
    if (!CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY) {
      toast.error('Token sale contract not configured');
      return;
    }

    setIsLoading(true);
    try {
      const tx = await web3Service.callContract(
        CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY,
        TOKEN_SALE_FACTORY_ABI,
        'claimTokens',
        [saleId]
      );

      toast.loading('Claiming tokens...', { id: 'claim-tokens' });
      
      const receipt = await web3Service.waitForTransaction(tx.hash);
      
      if (receipt && receipt.status === 1) {
        toast.success('Tokens claimed successfully!', { id: 'claim-tokens' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to claim tokens:', error);
      toast.error(error.message || 'Failed to claim tokens', { id: 'claim-tokens' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSaleInfo = useCallback(async (saleId: number) => {
    if (!CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY) {
      throw new Error('Token sale contract not configured');
    }

    try {
      const saleInfo = await web3Service.readContract(
        CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY,
        TOKEN_SALE_FACTORY_ABI,
        'getSaleInfo',
        [saleId]
      );
      
      return {
        token: saleInfo[0],
        creator: saleInfo[1],
        tokenPrice: saleInfo[2],
        totalSupply: saleInfo[3],
        soldAmount: saleInfo[4],
        softCap: saleInfo[5],
        hardCap: saleInfo[6],
        startTime: saleInfo[7],
        endTime: saleInfo[8],
        saleType: saleInfo[9],
        status: saleInfo[10],
        participantCount: saleInfo[11]
      };
    } catch (error: any) {
      console.error('Failed to get sale info:', error);
      throw error;
    }
  }, []);

  const getUserContribution = useCallback(async (saleId: number, userAddress: string) => {
    if (!CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY) {
      throw new Error('Token sale contract not configured');
    }

    try {
      const contribution = await web3Service.readContract(
        CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY,
        TOKEN_SALE_FACTORY_ABI,
        'getUserContribution',
        [saleId, userAddress]
      );
      return contribution;
    } catch (error: any) {
      console.error('Failed to get user contribution:', error);
      throw error;
    }
  }, []);

  const createSale = useCallback(async (saleData: {
    tokenAddress: string;
    tokenPrice: string;
    totalSupply: string;
    softCap: string;
    hardCap: string;
    startTime: number;
    endTime: number;
    saleType: number;
    whitelistEnabled: boolean;
  }) => {
    if (!CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY) {
      toast.error('Token sale factory not configured');
      return;
    }

    setIsLoading(true);
    try {
      // First approve tokens
      const totalSupplyWei = web3Service.parseEther(saleData.totalSupply);
      
      const tokenContract = web3Service.getContract(saleData.tokenAddress, ERC20_ABI);
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY, totalSupplyWei);
      toast.loading('Approving tokens...', { id: 'create-sale' });
      await web3Service.waitForTransaction(approveTx.hash);
      
      // Create sale
      const tx = await web3Service.callContract(
        CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY,
        TOKEN_SALE_FACTORY_ABI,
        'createSale',
        [
          saleData.tokenAddress,
          web3Service.parseEther(saleData.tokenPrice),
          totalSupplyWei,
          web3Service.parseEther(saleData.softCap),
          web3Service.parseEther(saleData.hardCap),
          saleData.startTime,
          saleData.endTime,
          saleData.saleType,
          saleData.whitelistEnabled,
          ethers.ZeroHash // No merkle root for now
        ]
      );

      toast.loading('Creating sale...', { id: 'create-sale' });
      const receipt = await web3Service.waitForTransaction(tx.hash);
      
      if (receipt && receipt.status === 1) {
        toast.success('Sale created successfully!', { id: 'create-sale' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to create sale:', error);
      toast.error(error.message || 'Failed to create sale', { id: 'create-sale' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    buyTokens,
    claimTokens,
    getSaleInfo,
    getUserContribution,
    createSale
  };
};