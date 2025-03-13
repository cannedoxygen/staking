import React, { createContext, useState, useEffect, useCallback } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAdapter, WalletProvider, SuiWallet, EthosWallet, SuietWallet, MartianWallet } from '../types/wallet';
import { STORAGE_KEYS, CURRENT_NETWORK, SUPPORTED_WALLETS } from '../utils/constants';

// Initialize SUI client based on network
const suiClient = new SuiClient({ url: getFullnodeUrl(CURRENT_NETWORK) });

// Interface for wallet context
interface WalletContextProps {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  balance: string;
  chainId: string | null;
  provider: WalletProvider | null;
  supportedWallets: WalletAdapter[];
  
  // Methods
  connect: (providerId: WalletProvider) => Promise<boolean>;
  disconnect: () => void;
  isConnected: () => boolean;
  signAndExecuteTransaction: (transactionBlock: TransactionBlock) => Promise<any>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

// Create the context with default values
export const WalletContext = createContext<WalletContextProps>({
  connected: false,
  connecting: false,
  address: null,
  balance: '0',
  chainId: null,
  provider: null,
  supportedWallets: [],
  
  connect: async () => false,
  disconnect: () => {},
  isConnected: () => false,
  signAndExecuteTransaction: async () => ({}),
  
  error: null,
  clearError: () => {},
});

// Available wallet adapters
const walletAdapters: WalletAdapter[] = [
  {
    id: 'sui' as WalletProvider.SUI,
    name: 'Sui Wallet',
    icon: '/images/wallets/sui-wallet.svg',
    adapter: new SuiWallet()
  },
  {
    id: 'ethos' as WalletProvider.ETHOS,
    name: 'Ethos Wallet',
    icon: '/images/wallets/ethos-wallet.svg',
    adapter: new EthosWallet()
  },
  {
    id: 'suiet' as WalletProvider.SUIET,
    name: 'Suiet Wallet',
    icon: '/images/wallets/suiet-wallet.svg',
    adapter: new SuietWallet()
  },
  {
    id: 'martian' as WalletProvider.MARTIAN,
    name: 'Martian Wallet',
    icon: '/images/wallets/martian-wallet.svg',
    adapter: new MartianWallet()
  }
];

// Provider component
export const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State variables
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<string | null>(null);
  const [provider, setProvider] = useState<WalletProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAdapter, setCurrentAdapter] = useState<any>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch wallet balance
  const fetchBalance = useCallback(async (walletAddress: string) => {
    try {
      const coinBalances = await suiClient.getAllBalances({
        owner: walletAddress,
      });
      
      // Find SUI balance
      const suiBalance = coinBalances.find(
        (coin) => coin.coinType === '0x2::sui::SUI'
      );
      
      if (suiBalance) {
        // Convert from MIST to SUI (9 decimals)
        const formattedBalance = (parseInt(suiBalance.totalBalance) / 10**9).toFixed(4);
        setBalance(formattedBalance);
      } else {
        setBalance('0');
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance('0');
    }
  }, []);

  // Check if wallet is connected
  const isConnected = useCallback(() => {
    return connected && !!address;
  }, [connected, address]);

  // Connect to wallet
  const connect = useCallback(async (providerId: WalletProvider) => {
    try {
      setConnecting(true);
      clearError();
      
      // Find adapter for the selected provider
      const selected = walletAdapters.find((wallet) => wallet.id === providerId);
      
      if (!selected) {
        throw new Error('Wallet provider not supported');
      }
      
      const adapter = selected.adapter;
      setCurrentAdapter(adapter);
      
      // Check if wallet is installed
      if (!(await adapter.isInstalled())) {
        throw new Error(`${selected.name} is not installed. Please install the extension and try again.`);
      }
      
      // Connect to wallet
      await adapter.connect();
      
      // Get wallet account info
      const accounts = await adapter.getAccounts();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const walletAddress = accounts[0];
      const chain = await adapter.getChainId();
      
      // Update state
      setAddress(walletAddress);
      setChainId(chain);
      setProvider(providerId);
      setConnected(true);
      
      // Fetch balance
      await fetchBalance(walletAddress);
      
      // Save provider to local storage
      localStorage.setItem(STORAGE_KEYS.WALLET_PROVIDER, providerId);
      localStorage.setItem(STORAGE_KEYS.LAST_CONNECTED, Date.now().toString());
      
      return true;
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setConnecting(false);
    }
  }, [clearError, fetchBalance]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    try {
      if (currentAdapter) {
        currentAdapter.disconnect();
      }
      
      // Clear state
      setConnected(false);
      setAddress(null);
      setBalance('0');
      setChainId(null);
      setProvider(null);
      setCurrentAdapter(null);
      
      // Remove from local storage
      localStorage.removeItem(STORAGE_KEYS.WALLET_PROVIDER);
      localStorage.removeItem(STORAGE_KEYS.LAST_CONNECTED);
    } catch (err: any) {
      console.error('Error disconnecting wallet:', err);
      setError(err.message || 'Failed to disconnect wallet');
    }
  }, [currentAdapter]);

  // Sign and execute transaction
  const signAndExecuteTransaction = useCallback(async (transactionBlock: TransactionBlock) => {
    try {
      if (!currentAdapter || !connected) {
        throw new Error('Wallet not connected');
      }
      
      // Sign and execute transaction
      const response = await currentAdapter.signAndExecuteTransaction(transactionBlock);
      return response;
    } catch (err: any) {
      console.error('Error executing transaction:', err);
      setError(err.message || 'Failed to execute transaction');
      throw err; // Re-throw to allow handling in the calling component
    }
  }, [currentAdapter, connected]);

  // Auto-connect on initial load if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const savedProvider = localStorage.getItem(STORAGE_KEYS.WALLET_PROVIDER) as WalletProvider;
      const lastConnected = localStorage.getItem(STORAGE_KEYS.LAST_CONNECTED);
      
      // Only auto-connect if last connected within past 3 days
      if (savedProvider && lastConnected) {
        const timeSinceConnection = Date.now() - parseInt(lastConnected);
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
        
        if (timeSinceConnection < threeDaysInMs) {
          await connect(savedProvider);
        }
      }
    };
    
    autoConnect();
  }, [connect]);

  // Refresh balance periodically when connected
  useEffect(() => {
    if (connected && address) {
      const interval = setInterval(() => {
        fetchBalance(address);
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [connected, address, fetchBalance]);

  const contextValue: WalletContextProps = {
    connected,
    connecting,
    address,
    balance,
    chainId,
    provider,
    supportedWallets: walletAdapters,
    
    connect,
    disconnect,
    isConnected,
    signAndExecuteTransaction,
    
    error,
    clearError,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;