import { useState, useCallback } from 'react';
import { web3Service, CONTRACT_ADDRESSES, VESTING_ABI } from '../lib/web3';
import { toast } from 'react-hot-toast';

export const useVesting = () => {
  const [isLoading, setIsLoading] = useState(false);

  const claimVestedTokens = useCallback(async (scheduleId: string) => {
    if (!CONTRACT_ADDRESSES.VESTING) {
      toast.error('Vesting contract not configured');
      return;
    }

    setIsLoading(true);
    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.VESTING, VESTING_ABI);
      
      const tx = await contract.claimTokens(scheduleId, {
        gasLimit: 200000
      });

      toast.loading('Claiming vested tokens...', { id: 'claim-vested' });
      
      const receipt = await web3Service.waitForTransaction(tx.hash);
      
      if (receipt.status === 1) {
        toast.success('Vested tokens claimed successfully!', { id: 'claim-vested' });
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to claim vested tokens:', error);
      toast.error(error.message || 'Failed to claim vested tokens', { id: 'claim-vested' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getClaimableAmount = useCallback(async (scheduleId: string) => {
    if (!CONTRACT_ADDRESSES.VESTING) {
      throw new Error('Vesting contract not configured');
    }

    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.VESTING, VESTING_ABI);
      const claimableAmount = await contract.getClaimableAmount(scheduleId);
      return claimableAmount;
    } catch (error: any) {
      console.error('Failed to get claimable amount:', error);
      throw error;
    }
  }, []);

  const getNextUnlock = useCallback(async (scheduleId: string) => {
    if (!CONTRACT_ADDRESSES.VESTING) {
      throw new Error('Vesting contract not configured');
    }

    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.VESTING, VESTING_ABI);
      const [unlockTime, unlockAmount] = await contract.getNextUnlock(scheduleId);
      return { unlockTime, unlockAmount };
    } catch (error: any) {
      console.error('Failed to get next unlock:', error);
      throw error;
    }
  }, []);

  const getUserVestingSchedules = useCallback(async (userAddress: string) => {
    if (!CONTRACT_ADDRESSES.VESTING) {
      throw new Error('Vesting contract not configured');
    }

    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.VESTING, VESTING_ABI);
      const scheduleIds = await contract.getUserVestingSchedules(userAddress);
      return scheduleIds;
    } catch (error: any) {
      console.error('Failed to get user vesting schedules:', error);
      throw error;
    }
  }, []);

  const getVestingSchedule = useCallback(async (scheduleId: string) => {
    if (!CONTRACT_ADDRESSES.VESTING) {
      throw new Error('Vesting contract not configured');
    }

    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.VESTING, VESTING_ABI);
      const schedule = await contract.getVestingSchedule(scheduleId);
      
      return {
        beneficiary: schedule[0],
        totalAmount: schedule[1],
        claimedAmount: schedule[2],
        startTime: schedule[3],
        cliffDuration: schedule[4],
        vestingDuration: schedule[5],
        revocable: schedule[6],
        revoked: schedule[7],
        token: schedule[8]
      };
    } catch (error: any) {
      console.error('Failed to get vesting schedule:', error);
      throw error;
    }
  }, []);

  return {
    isLoading,
    claimVestedTokens,
    getClaimableAmount,
    getNextUnlock,
    getUserVestingSchedules,
    getVestingSchedule
  };
};