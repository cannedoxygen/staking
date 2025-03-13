import { TransactionBlock } from '@mysten/sui.js/transactions';

/**
 * Supported wallet providers
 */
export enum WalletProvider {
  SUI = 'sui',
  ETHOS = 'ethos',
  SUIET = 'suiet',
  MARTIAN = 'martian'
}

/**
 * Base interface for wallet adapters
 */
export interface WalletAdapterInterface {
  /**
   * Check if the wallet extension is installed
   */
  isInstalled(): Promise<boolean>;

  /**
   * Connect to the wallet
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the wallet
   */
  disconnect(): Promise<void>;

  /**
   * Get connected accounts (addresses)
   */
  getAccounts(): Promise<string[]>;

  /**
   * Get current chain ID
   */
  getChainId(): Promise<string>;

  /**
   * Sign and execute a transaction
   * @param transaction - Transaction block to sign and execute
   */
  signAndExecuteTransaction(transaction: TransactionBlock): Promise<any>;
}

/**
 * Sui Wallet implementation
 */
export class SuiWallet implements WalletAdapterInterface {
  async isInstalled(): Promise<boolean> {
    return typeof window !== 'undefined' && 
      window.suiWallet !== undefined;
  }

  async connect(): Promise<void> {
    if (!(await this.isInstalled())) {
      throw new Error('Sui Wallet is not installed');
    }

    try {
      await window.suiWallet.requestPermissions();
    } catch (error) {
      throw new Error('Failed to connect to Sui Wallet');
    }
  }

  async disconnect(): Promise<void> {
    // Sui wallet doesn't have a disconnect method, but we can clear local state
    // Implementation depends on how the dApp manages connection state
  }

  async getAccounts(): Promise<string[]> {
    if (!(await this.isInstalled())) {
      throw new Error('Sui Wallet is not installed');
    }

    try {
      const accounts = await window.suiWallet.getAccounts();
      return accounts;
    } catch (error) {
      throw new Error('Failed to get accounts from Sui Wallet');
    }
  }

  async getChainId(): Promise<string> {
    if (!(await this.isInstalled())) {
      throw new Error('Sui Wallet is not installed');
    }

    try {
      const { chain } = await window.suiWallet.getNetwork();
      return chain;
    } catch (error) {
      throw new Error('Failed to get chain ID from Sui Wallet');
    }
  }

  async signAndExecuteTransaction(transaction: TransactionBlock): Promise<any> {
    if (!(await this.isInstalled())) {
      throw new Error('Sui Wallet is not installed');
    }

    try {
      return await window.suiWallet.signAndExecuteTransactionBlock({
        transactionBlock: transaction,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }
}

/**
 * Ethos Wallet implementation
 */
export class EthosWallet implements WalletAdapterInterface {
  async isInstalled(): Promise<boolean> {
    return typeof window !== 'undefined' && 
      window.ethosWallet !== undefined;
  }

  async connect(): Promise<void> {
    if (!(await this.isInstalled())) {
      throw new Error('Ethos Wallet is not installed');
    }

    try {
      await window.ethosWallet.connect();
    } catch (error) {
      throw new Error('Failed to connect to Ethos Wallet');
    }
  }

  async disconnect(): Promise<void> {
    if (await this.isInstalled()) {
      try {
        await window.ethosWallet.disconnect();
      } catch (error) {
        console.error('Error disconnecting from Ethos Wallet:', error);
      }
    }
  }

  async getAccounts(): Promise<string[]> {
    if (!(await this.isInstalled())) {
      throw new Error('Ethos Wallet is not installed');
    }

    try {
      const { accounts } = await window.ethosWallet.getAccounts();
      return accounts;
    } catch (error) {
      throw new Error('Failed to get accounts from Ethos Wallet');
    }
  }

  async getChainId(): Promise<string> {
    if (!(await this.isInstalled())) {
      throw new Error('Ethos Wallet is not installed');
    }

    try {
      const { chain } = await window.ethosWallet.getChain();
      return chain;
    } catch (error) {
      throw new Error('Failed to get chain ID from Ethos Wallet');
    }
  }

  async signAndExecuteTransaction(transaction: TransactionBlock): Promise<any> {
    if (!(await this.isInstalled())) {
      throw new Error('Ethos Wallet is not installed');
    }

    try {
      return await window.ethosWallet.signAndExecuteTransactionBlock({
        transactionBlock: transaction,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }
}

/**
 * Suiet Wallet implementation
 */
export class SuietWallet implements WalletAdapterInterface {
  async isInstalled(): Promise<boolean> {
    return typeof window !== 'undefined' && 
      window.suiet !== undefined;
  }

  async connect(): Promise<void> {
    if (!(await this.isInstalled())) {
      throw new Error('Suiet Wallet is not installed');
    }

    try {
      await window.suiet.connect();
    } catch (error) {
      throw new Error('Failed to connect to Suiet Wallet');
    }
  }

  async disconnect(): Promise<void> {
    if (await this.isInstalled()) {
      try {
        await window.suiet.disconnect();
      } catch (error) {
        console.error('Error disconnecting from Suiet Wallet:', error);
      }
    }
  }

  async getAccounts(): Promise<string[]> {
    if (!(await this.isInstalled())) {
      throw new Error('Suiet Wallet is not installed');
    }

    try {
      const accounts = await window.suiet.getAccounts();
      return accounts;
    } catch (error) {
      throw new Error('Failed to get accounts from Suiet Wallet');
    }
  }

  async getChainId(): Promise<string> {
    if (!(await this.isInstalled())) {
      throw new Error('Suiet Wallet is not installed');
    }

    try {
      const { chain } = await window.suiet.getNetwork();
      return chain;
    } catch (error) {
      throw new Error('Failed to get chain ID from Suiet Wallet');
    }
  }

  async signAndExecuteTransaction(transaction: TransactionBlock): Promise<any> {
    if (!(await this.isInstalled())) {
      throw new Error('Suiet Wallet is not installed');
    }

    try {
      return await window.suiet.signAndExecuteTransactionBlock({
        transactionBlock: transaction,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }
}

/**
 * Martian Wallet implementation
 */
export class MartianWallet implements WalletAdapterInterface {
  async isInstalled(): Promise<boolean> {
    return typeof window !== 'undefined' && 
      window.martian !== undefined;
  }

  async connect(): Promise<void> {
    if (!(await this.isInstalled())) {
      throw new Error('Martian Wallet is not installed');
    }

    try {
      await window.martian.connect();
    } catch (error) {
      throw new Error('Failed to connect to Martian Wallet');
    }
  }

  async disconnect(): Promise<void> {
    if (await this.isInstalled()) {
      try {
        await window.martian.disconnect();
      } catch (error) {
        console.error('Error disconnecting from Martian Wallet:', error);
      }
    }
  }

  async getAccounts(): Promise<string[]> {
    if (!(await this.isInstalled())) {
      throw new Error('Martian Wallet is not installed');
    }

    try {
      const accounts = await window.martian.getAccounts();
      return accounts;
    } catch (error) {
      throw new Error('Failed to get accounts from Martian Wallet');
    }
  }

  async getChainId(): Promise<string> {
    if (!(await this.isInstalled())) {
      throw new Error('Martian Wallet is not installed');
    }

    try {
      const { chain } = await window.martian.getNetwork();
      return chain;
    } catch (error) {
      throw new Error('Failed to get chain ID from Martian Wallet');
    }
  }

  async signAndExecuteTransaction(transaction: TransactionBlock): Promise<any> {
    if (!(await this.isInstalled())) {
      throw new Error('Martian Wallet is not installed');
    }

    try {
      return await window.martian.signAndExecuteTransactionBlock({
        transactionBlock: transaction,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }
}

/**
 * Wallet adapter with metadata for UI
 */
export interface WalletAdapter {
  id: WalletProvider;
  name: string;
  icon: string;
  adapter: WalletAdapterInterface;
}

// Type definitions for wallet window objects
declare global {
  interface Window {
    suiWallet?: any;
    ethosWallet?: any;
    suiet?: any;
    martian?: any;
  }
}