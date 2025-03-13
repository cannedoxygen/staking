import { useState, useCallback } from 'react';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useWallet } from './useWallet';
import connectionService from '../services/sui/connection-enhanced';
import { TransactionResult } from '../services/sui/types';
import { NETWORK } from '../utils/constants';
import { NetworkType } from '../types/common';

/**
 * Interface for transaction tracking
 */
interface Transaction {
  id: string;               // Unique local ID
  digest?: string;          // Blockchain transaction digest
  description: string;      // Human-readable description
  status: 'pending' | 'confirming' | 'success' | 'error';
  timestamp: number;        // Creation timestamp
  error?: string;           // Error message if failed
  gasUsed?: string;         // Gas used (formatted)
}

/**
 * Hook for enhanced transaction management
 */
export const useTransactions = () => {
  const { signAndExecuteTransaction, connected, address } = useWallet();
  
  // State for tracking transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Generate a unique transaction ID
   */
  const generateTransactionId = (): string => {
    return `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };
  
  /**
   * Submit a transaction with enhanced error handling and tracking
   */
  const submitTransaction = useCallback(async (
    transaction: TransactionBlock,
    description: string,
    network: NetworkType = NETWORK.MAINNET,
    waitForConfirmation: boolean = true
  ): Promise<TransactionResult | null> => {
    if (!connected || !address) {
      setError("Wallet not connected");
      return null;
    }
    
    // Create local transaction tracking object
    const txId = generateTransactionId();
    const newTransaction: Transaction = {
      id: txId,
      description,
      status: 'pending',
      timestamp: Date.now()
    };
    
    try {
      // Update state
      setIsSubmitting(true);
      setCurrentTransaction(newTransaction);
      setError(null);
      
      // Add to transactions list
      setTransactions(prev => [newTransaction, ...prev].slice(0, 50)); // Keep last 50 tx
      
      // Execute transaction through the enhanced connection service
      const result = await connectionService.executeTransaction(
        transaction,
        signAndExecuteTransaction
      );
      
      // Update transaction in state with digest
      const updatedTx: Transaction = {
        ...newTransaction,
        digest: result.digest,
        status: result.success ? 'success' : 'error',
        error: result.errorMessage,
        gasUsed: `${parseFloat(result.gasUsed.computationCost) / 1e9} SUI`
      };
      
      setTransactions(prev => 
        prev.map(tx => tx.id === txId ? updatedTx : tx)
      );
      
      // Wait for confirmation if needed
      if (waitForConfirmation && result.success) {
        try {
          // Update status to confirming
          setTransactions(prev => 
            prev.map(tx => tx.id === txId ? {...tx, status: 'confirming'} : tx)
          );
          
          // Wait for transaction to be confirmed
          await connectionService.waitForTransaction(result.digest, network);
          
          // Final update to success
          setTransactions(prev => 
            prev.map(tx => tx.id === txId ? {...tx, status: 'success'} : tx)
          );
        } catch (confirmError: any) {
          // Update transaction with confirmation error
          setTransactions(prev => 
            prev.map(tx => tx.id === txId ? {
              ...tx, 
              status: 'error', 
              error: confirmError.message || 'Transaction confirmation failed'
            } : tx)
          );
          
          throw confirmError;
        }
      }
      
      // Dispatch event for other parts of the app to know about the transaction
      if (result.success) {
        document.dispatchEvent(new CustomEvent('transaction-success', {
          detail: { txId: result.digest }
        }));
      } else {
        document.dispatchEvent(new CustomEvent('transaction-error', {
          detail: { txId: result.digest, error: result.errorMessage || 'Transaction failed' }
        }));
      }
      
      return result;
    } catch (err: any) {
      // Format error message
      const errorMessage = err.message || 'Transaction failed';
      setError(errorMessage);
      
      // Update transaction in state
      const failedTx: Transaction = {
        ...newTransaction,
        status: 'error',
        error: errorMessage
      };
      
      setTransactions(prev => 
        prev.map(tx => tx.id === txId ? failedTx : tx)
      );
      
      // Dispatch error event
      document.dispatchEvent(new CustomEvent('transaction-error', {
        detail: { txId, error: errorMessage }
      }));
      
      return null;
    } finally {
      setIsSubmitting(false);
      setCurrentTransaction(null);
    }
  }, [connected, address, signAndExecuteTransaction]);
  
  /**
   * Clear a transaction from history
   */
  const clearTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);
  
  /**
   * Clear all transactions
   */
  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
  }, []);
  
  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Get transaction by ID or digest
   */
  const getTransaction = useCallback((idOrDigest: string): Transaction | undefined => {
    return transactions.find(tx => tx.id === idOrDigest || tx.digest === idOrDigest);
  }, [transactions]);
  
  /**
   * Get recent transactions
   */
  const getRecentTransactions = useCallback((limit: number = 5): Transaction[] => {
    return transactions.slice(0, limit);
  }, [transactions]);
  
  /**
   * Check if a transaction was successful
   */
  const wasTransactionSuccessful = useCallback((idOrDigest: string): boolean => {
    const tx = transactions.find(tx => tx.id === idOrDigest || tx.digest === idOrDigest);
    return tx?.status === 'success';
  }, [transactions]);
  
  /**
   * View transaction in explorer
   */
  const viewInExplorer = useCallback((idOrDigest: string, network: NetworkType = NETWORK.MAINNET) => {
    const tx = transactions.find(tx => tx.id === idOrDigest || tx.digest === idOrDigest);
    
    if (tx?.digest) {
      let explorerUrl = 'https://explorer.sui.io/txblock/';
      
      if (network === NETWORK.TESTNET) {
        explorerUrl = 'https://testnet.explorer.sui.io/txblock/';
      } else if (network === NETWORK.DEVNET) {
        explorerUrl = 'https://devnet.explorer.sui.io/txblock/';
      }
      
      window.open(`${explorerUrl}${tx.digest}`, '_blank');
    }
  }, [transactions]);
  
  return {
    // Transaction submission
    submitTransaction,
    isSubmitting,
    currentTransaction,
    error,
    clearError,
    
    // Transaction history
    transactions,
    clearTransaction,
    clearAllTransactions,
    getTransaction,
    getRecentTransactions,
    wasTransactionSuccessful,
    viewInExplorer
  };
};

export default useTransactions;