import { create } from 'zustand';
import { TokenSale } from '../types';
import { web3Service, CONTRACT_ADDRESSES, TOKEN_SALE_FACTORY_ABI, ERC20_ABI } from '../lib/web3';

interface TokenSaleState {
  sales: TokenSale[];
  activeSale: TokenSale | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  fetchSales: () => Promise<void>;
  fetchSaleFromContract: (saleId: number) => Promise<TokenSale | null>;
  setSales: (sales: TokenSale[]) => void;
  setActiveSale: (sale: TokenSale | null) => void;
  clearError: () => void;
}

// Enhanced mock data for development
const mockSales: TokenSale[] = [
  {
    id: '0',
    name: 'Sample Project Token',
    symbol: 'SPT',
    description: 'A sample token sale for testing the platform functionality with real smart contracts.',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    saleType: 'fixed',
    startTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    totalSupply: 100000,
    tokenPrice: 0.001,
    softCap: 10,
    hardCap: 100,
    raised: 0,
    participants: 0,
    status: 'upcoming',
    whitelist: false,
    vestingEnabled: false,
    logo: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    website: 'https://sampleproject.io',
    twitter: 'https://twitter.com/sampleproject',
    telegram: 'https://t.me/sampleproject'
  },
  {
    id: '1',
    name: 'DeFi Token',
    symbol: 'DFT',
    description: 'Revolutionary DeFi protocol token with advanced yield farming capabilities and cross-chain interoperability.',
    tokenAddress: '0x1234567890123456789012345678901234567890',
    saleType: 'fixed',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalSupply: 1000000,
    tokenPrice: 0.1,
    softCap: 50,
    hardCap: 500,
    raised: 35,
    participants: 145,
    status: 'upcoming',
    whitelist: true,
    vestingEnabled: true,
    logo: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    website: 'https://defitoken.io',
    twitter: 'https://twitter.com/defitoken',
    telegram: 'https://t.me/defitoken'
  },
  {
    id: '2',
    name: 'GameFi Protocol',
    symbol: 'GFP',
    description: 'Next-generation gaming and NFT ecosystem with play-to-earn mechanics, metaverse integration, and DAO governance.',
    tokenAddress: '0x8765432109876543210987654321098765432109',
    saleType: 'dutch',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    totalSupply: 2000000,
    tokenPrice: 0.05,
    softCap: 25,
    hardCap: 250,
    raised: 142,
    participants: 298,
    status: 'active',
    whitelist: false,
    vestingEnabled: false,
    logo: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    website: 'https://gamefiprotocol.com',
    twitter: 'https://twitter.com/gamefiprotocol',
    telegram: 'https://t.me/gamefiprotocol'
  },
  {
    id: '3',
    name: 'AI Protocol',
    symbol: 'AIP',
    description: 'Cutting-edge artificial intelligence platform for decentralized machine learning and data processing.',
    tokenAddress: '0x9876543210987654321098765432109876543210',
    saleType: 'lottery',
    startTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    totalSupply: 1500000,
    tokenPrice: 0.08,
    softCap: 40,
    hardCap: 400,
    raised: 89,
    participants: 234,
    status: 'active',
    whitelist: true,
    vestingEnabled: true,
    logo: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    website: 'https://aiprotocol.io',
    twitter: 'https://twitter.com/aiprotocol',
    telegram: 'https://t.me/aiprotocol'
  },
  {
    id: '4',
    name: 'MetaVerse Coin',
    symbol: 'MVC',
    description: 'Virtual reality metaverse platform with immersive experiences and digital asset ownership.',
    tokenAddress: '0x5432109876543210987654321098765432109876',
    saleType: 'fixed',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    totalSupply: 800000,
    tokenPrice: 0.12,
    softCap: 30,
    hardCap: 300,
    raised: 267,
    participants: 456,
    status: 'ended',
    whitelist: false,
    vestingEnabled: true,
    logo: 'https://images.pexels.com/photos/2007647/pexels-photo-2007647.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    website: 'https://metaversecoin.io',
    twitter: 'https://twitter.com/metaversecoin',
    telegram: 'https://t.me/metaversecoin'
  },
  {
    id: '5',
    name: 'Green Energy Token',
    symbol: 'GRN',
    description: 'Sustainable energy blockchain platform promoting renewable energy adoption and carbon credit trading.',
    tokenAddress: '0x1098765432109876543210987654321098765432',
    saleType: 'dutch',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    totalSupply: 1200000,
    tokenPrice: 0.06,
    softCap: 20,
    hardCap: 200,
    raised: 178,
    participants: 312,
    status: 'ended',
    whitelist: true,
    vestingEnabled: false,
    logo: 'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    website: 'https://greenenergy.io',
    twitter: 'https://twitter.com/greenenergy',
    telegram: 'https://t.me/greenenergy'
  }
];

export const useTokenSaleStore = create<TokenSaleState>((set, get) => ({
  sales: [],
  activeSale: null,
  isLoading: false,
  error: null,
  lastFetch: null,

  fetchSales: async () => {
    const now = Date.now();
    const lastFetch = get().lastFetch;
    
    // Avoid fetching too frequently (cache for 30 seconds)
    if (lastFetch && now - lastFetch < 30000) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      // Try to fetch from contract if available
      if (CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY) {
        const realSales = await get().fetchRealSales();
        if (realSales.length > 0) {
          set({ 
            sales: realSales, 
            isLoading: false, 
            error: null,
            lastFetch: now 
          });
          return;
        }
      }
      
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Fallback to mock data
      set({ 
        sales: mockSales, 
        isLoading: false, 
        error: null,
        lastFetch: now 
      });
    } catch (error: any) {
      console.error('Failed to fetch sales:', error);
      
      // Set error state
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch token sales'
      });
      
      // Fallback to mock data after a delay
      setTimeout(() => {
        set({ 
          sales: mockSales, 
          error: null,
          lastFetch: now 
        });
      }, 2000);
    }
  },

  fetchRealSales: async (): Promise<TokenSale[]> => {
    if (!CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY) {
      return [];
    }

    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY, TOKEN_SALE_FACTORY_ABI);
      const saleCounter = await contract.saleCounter();
      const sales: TokenSale[] = [];

      for (let i = 0; i < Number(saleCounter); i++) {
        const sale = await get().fetchSaleFromContract(i);
        if (sale) {
          sales.push(sale);
        }
      }

      return sales;
    } catch (error) {
      console.error('Failed to fetch real sales:', error);
      return [];
    }
  },

  fetchSaleFromContract: async (saleId: number): Promise<TokenSale | null> => {
    if (!CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY) {
      return null;
    }

    try {
      const contract = web3Service.getContract(CONTRACT_ADDRESSES.TOKEN_SALE_FACTORY, TOKEN_SALE_FACTORY_ABI);
      const saleInfo = await contract.getSaleInfo(saleId);

      // Get token info
      let tokenName = `Token ${saleId}`;
      let tokenSymbol = 'TKN';
      
      try {
        const tokenContract = web3Service.getContract(saleInfo[0], ERC20_ABI);
        tokenName = await tokenContract.name();
        tokenSymbol = await tokenContract.symbol();
      } catch (error) {
        console.warn('Could not fetch token info:', error);
      }

      // Calculate raised amount
      const soldAmount = parseFloat(web3Service.formatEther(saleInfo[4]));
      const tokenPrice = parseFloat(web3Service.formatEther(saleInfo[2]));
      const raised = soldAmount * tokenPrice;

      // Map contract data to TokenSale interface
      const sale: TokenSale = {
        id: saleId.toString(),
        name: tokenName,
        symbol: tokenSymbol,
        description: `Professional token sale for ${tokenName} with smart contract automation.`,
        tokenAddress: saleInfo[0],
        saleType: ['fixed', 'dutch', 'lottery'][Number(saleInfo[9])] as 'fixed' | 'dutch' | 'lottery',
        startTime: new Date(Number(saleInfo[7]) * 1000),
        endTime: new Date(Number(saleInfo[8]) * 1000),
        totalSupply: parseFloat(web3Service.formatEther(saleInfo[3])),
        tokenPrice: tokenPrice,
        softCap: parseFloat(web3Service.formatEther(saleInfo[5])),
        hardCap: parseFloat(web3Service.formatEther(saleInfo[6])),
        raised: raised,
        participants: Number(saleInfo[11]),
        status: ['upcoming', 'active', 'ended', 'cancelled'][Number(saleInfo[10])] as 'upcoming' | 'active' | 'ended' | 'cancelled',
        whitelist: false, // Would need to check contract
        vestingEnabled: false, // Would need to check contract
        logo: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        website: '',
        twitter: '',
        telegram: ''
      };

      return sale;
    } catch (error) {
      console.error(`Failed to fetch sale ${saleId}:`, error);
      return null;
    }
  },

  setSales: (sales) => set({ sales }),
  setActiveSale: (sale) => set({ activeSale: sale }),
  clearError: () => set({ error: null }),
}));