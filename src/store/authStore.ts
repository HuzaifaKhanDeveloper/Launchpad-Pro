import { create } from 'zustand';
import { User } from '../types';
import { web3Service } from '../lib/web3';

interface AuthState {
  user: User | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => void;
  updateTier: (tier: User['tier']) => void;
  updateStakedAmount: (amount: number) => void;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isConnected: false,
  isLoading: false,

  connectWallet: async (address: string) => {
    set({ isLoading: true });
    
    try {
      // Load existing user data or create new user
      const existingUser = localStorage.getItem(`user_${address}`);
      
      let user: User;
      if (existingUser) {
        user = JSON.parse(existingUser);
        user.address = address; // Ensure current address
      } else {
        user = {
          id: address,
          address,
          email: '',
          tier: 'bronze',
          stakedAmount: 0,
          createdAt: new Date(),
        };
      }

      // Try to get tier info from contracts
      try {
        const tierInfo = await web3Service.getUserTierFromContract(address);
        const tierNames = ['bronze', 'silver', 'gold', 'platinum'] as const;
        user.tier = tierNames[tierInfo.tier] || 'bronze';
        user.stakedAmount = tierInfo.stakedAmount;
      } catch (error) {
        console.warn('Could not fetch tier info from contracts:', error);
      }

      // Save updated user data
      localStorage.setItem(`user_${address}`, JSON.stringify(user));
      
      set({ 
        user, 
        isConnected: true, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to connect wallet in auth store:', error);
      set({ isLoading: false });
    }
  },

  disconnectWallet: () => {
    set({ 
      user: null, 
      isConnected: false 
    });
  },

  updateTier: (tier: User['tier']) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, tier };
      localStorage.setItem(`user_${user.address}`, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  updateStakedAmount: (stakedAmount: number) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, stakedAmount };
      localStorage.setItem(`user_${user.address}`, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  refreshUserData: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const tierInfo = await web3Service.getUserTierFromContract(user.address);
      const tierNames = ['bronze', 'silver', 'gold', 'platinum'] as const;
      
      const updatedUser = {
        ...user,
        tier: tierNames[tierInfo.tier] || 'bronze',
        stakedAmount: tierInfo.stakedAmount
      };

      localStorage.setItem(`user_${user.address}`, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.warn('Could not refresh user data from contracts:', error);
    }
  },
}));