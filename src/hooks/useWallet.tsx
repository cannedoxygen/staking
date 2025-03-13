import { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';
import { WalletProvider } from '../types/wallet';

/**
 * Custom hook to access the wallet context
 * 
 * Provides wallet connection status, account information,
 * and methods to interact with connected wallets
 */
export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within a WalletContextProvider');
  }

  return {
    // Connection state
    connected: context.connected,
    connecting: context.connecting,
    
    // Account info
    address: context.address,
    balance: context.balance,
    chainId: context.chainId,
    
    // Wallet provider
    provider: context.provider,
    supportedWallets: context.supportedWallets,
    
    // Methods
    connect: context.connect,
    disconnect: context.disconnect,
    isConnected: context.isConnected,
    signAndExecuteTransaction: context.signAndExecuteTransaction,
    
    // Error handling
    error: context.error,
    clearError: context.clearError,
    
    // Helper methods
    isSuiWallet: () => context.provider === WalletProvider.SUI,
    isEthosWallet: () => context.provider === WalletProvider.ETHOS,
    isSuietWallet: () => context.provider === WalletProvider.SUIET,
    isMartianWallet: () => context.provider === WalletProvider.MARTIAN,
    
    // Format address for display (e.g., 0x1234...5678)
    getFormattedAddress: () => {
      if (!context.address) return '';
      
      const addr = context.address;
      if (addr.length <= 12) return addr;
      
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    },
    
    // Get wallet name
    getWalletName: () => {
      if (!context.provider) return '';
      
      const wallet = context.supportedWallets.find(w => w.id === context.provider);
      return wallet ? wallet.name : '';
    },
    
    // Get wallet icon
    getWalletIcon: () => {
      if (!context.provider) return '';
      
      const wallet = context.supportedWallets.find(w => w.id === context.provider);
      return wallet ? wallet.icon : '';
    },
    
    // Check if a specific wallet is installed
    isWalletInstalled: async (providerId: WalletProvider) => {
      const wallet = context.supportedWallets.find(w => w.id === providerId);
      if (!wallet) return false;
      
      try {
        return await wallet.adapter.isInstalled();
      } catch (err) {
        console.error(`Error checking if ${wallet.name} is installed:`, err);
        return false;
      }
    }
  };
};

export default useWallet;