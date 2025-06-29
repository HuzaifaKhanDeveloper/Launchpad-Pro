import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => void;
  updateTier: (tier: User['tier']) => void;
  updateStakedAmount: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isConnected: false,
  isLoading: false,

  connectWallet: async (address: string) => {
    set({ isLoading: true });
    
    try {
      // In a real app, you would fetch user data from your backend API
      // For now, we'll create a mock user or load from localStorage
      const existingUser = localStorage.getItem(`user_${address}`);
      
      let user: User;
      if (existingUser) {
        user = JSON.parse(existingUser);
        // Ensure the user object has the current address
        user.address = address;
      } else {
        // Create new user (removed KYC status)
        user = {
          id: address,
          address,
          email: '',
          tier: 'bronze',
          stakedAmount: 0,
          createdAt: new Date(),
        };
        localStorage.setItem(`user_${address}`, JSON.stringify(user));
      }

      console.log('Auth store - connecting wallet with user:', user);
      
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
    console.log('Auth store - disconnecting wallet');
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
}));