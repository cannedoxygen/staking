import { SuiClient, getFullnodeUrl, SuiTransactionBlockResponse } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { NETWORK, CONTRACT } from '../../utils/constants';
import { NetworkType } from '../../types/common';
import { TransactionResult } from './types';

// Default network if not specified
const DEFAULT_NETWORK: NetworkType = NETWORK.MAINNET;

// Cache for SuiClient instances
const clientCache: Record<NetworkType, SuiClient> = {} as Record<NetworkType, SuiClient>;

/**
 * Connection service with enhanced error handling and transaction management
 */
class ConnectionService {
  /**
   * Get a SuiClient instance for the specified network
   * 
   * @param network - Network type (mainnet, testnet, devnet)
   * @returns SuiClient instance
   */
  public getSuiClient(network: NetworkType = DEFAULT_NETWORK): SuiClient {
    if (!clientCache[network]) {
      clientCache[network] = new SuiClient({ url: getFullnodeUrl(network) });
    }
    
    return clientCache[network];
  }
  
  /**
   * Check if a connection to Sui network is active
   * 
   * @param network - Network to check
   * @returns Promise resolving to boolean indicating connection status
   */
  public async checkConnection(network: NetworkType = DEFAULT_NETWORK): Promise<boolean> {
    try {
      const client = this.getSuiClient(network);
      await client.getLatestCheckpointSequenceNumber();
      return true;
    } catch (error) {
      console.error('Failed to connect to Sui network:', error);
      return false;
    }
  }
  
  /**
   * Get the current gas price for the network
   * 
   * @param network - Network to query
   * @returns Promise resolving to current gas price (in MIST)
   */
  public async getGasPrice(network: NetworkType = DEFAULT_NETWORK): Promise<string> {
    try {
      const client = this.getSuiClient(network);
      const { reference_gas_price } = await client.getReferenceGasPrice();
      return reference_gas_price.toString();
    } catch (error) {
      console.error('Failed to get gas price:', error);
      throw this.handleError(error, 'Failed to get gas price');
    }
  }
  
  /**
   * Get the current chain ID
   * 
   * @param network - Network to query
   * @returns Promise resolving to chain ID
   */
  public async getChainId(network: NetworkType = DEFAULT_NETWORK): Promise<string> {
    try {
      const client = this.getSuiClient(network);
      const { epoch } = await client.getLatestSuiSystemState();
      
      // On mainnet, chain ID is "mainnet"
      // On testnet, chain ID is testnet_<epoch>
      // On devnet, chain ID is devnet_<epoch>
      if (network === NETWORK.MAINNET) {
        return 'mainnet';
      } else {
        return `${network}_${epoch}`;
      }
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      throw this.handleError(error, 'Failed to get chain ID');
    }
  }
  
  /**
   * Get token balance for an address
   * 
   * @param address - Wallet address to check
   * @param coinType - Optional coin type (defaults to TARDI token)
   * @param network - Network to query
   * @returns Promise resolving to token balance
   */
  public async getTokenBalance(
    address: string,
    coinType: string = CONTRACT.TARDI_COIN_TYPE,
    network: NetworkType = DEFAULT_NETWORK
  ): Promise<string> {
    try {
      const client = this.getSuiClient(network);
      
      const { totalBalance } = await client.getBalance({
        owner: address,
        coinType
      });
      
      return totalBalance;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return '0';
    }
  }
  
  /**
   * Execute a transaction and handle common errors
   * 
   * @param transaction - Transaction block to execute
   * @param signer - Function to sign and execute the transaction
   * @returns Promise resolving to transaction result
   */
  public async executeTransaction(
    transaction: TransactionBlock,
    signer: (tx: TransactionBlock) => Promise<SuiTransactionBlockResponse>
  ): Promise<TransactionResult> {
    try {
      // Execute transaction
      const response = await signer(transaction);
      
      // Check if transaction was successful
      const success = response.effects?.status?.status === 'success';
      
      // Extract gas used
      const gasUsed = response.effects?.gasUsed || {
        computationCost: '0',
        storageCost: '0',
        storageRebate: '0',
        nonRefundableStorageFee: '0'
      };
      
      // Format result
      const result: TransactionResult = {
        digest: response.digest,
        success,
        status: response.effects?.status?.status || 'unknown',
        gasUsed,
        events: response.events || [],
        timestamp: response.timestampMs?.toString(),
      };
      
      // If transaction failed, include error message
      if (!success && response.effects?.status?.error) {
        result.errorMessage = response.effects.status.error;
      }
      
      return result;
    } catch (error) {
      console.error('Transaction execution failed:', error);
      throw this.handleError(error, 'Transaction execution failed');
    }
  }
  
  /**
   * Wait for a transaction to be confirmed on the blockchain
   * 
   * @param digest - Transaction digest
   * @param network - Network to query
   * @param maxAttempts - Maximum number of attempts (default: 20)
   * @param delayMs - Delay between attempts in milliseconds (default: 1000)
   * @returns Promise resolving to transaction details
   */
  public async waitForTransaction(
    digest: string,
    network: NetworkType = DEFAULT_NETWORK,
    maxAttempts: number = 20,
    delayMs: number = 1000
  ): Promise<SuiTransactionBlockResponse> {
    const client = this.getSuiClient(network);
    
    // Helper function to delay execution
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Try to fetch transaction multiple times
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const txResponse = await client.getTransactionBlock({
          digest,
          options: {
            showEffects: true,
            showEvents: true,
            showInput: true,
            showObjectChanges: true,
          }
        });
        
        return txResponse;
      } catch (error: any) {
        // If this is the last attempt, throw the error
        if (attempt === maxAttempts - 1) {
          throw this.handleError(error, `Transaction ${digest} not found after ${maxAttempts} attempts`);
        }
        
        // Otherwise, wait and try again
        await delay(delayMs);
      }
    }
    
    throw new Error(`Transaction ${digest} not found after ${maxAttempts} attempts`);
  }
  
  /**
   * Handle errors and convert to standardized format
   * 
   * @param error - Original error
   * @param defaultMessage - Default message if error is not recognized
   * @returns Standardized error
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    if (error instanceof Error) {
      // Extract useful message from Sui SDK errors
      if (error.message.includes('network error')) {
        return new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      if (error.message.includes('insufficient gas')) {
        return new Error('Transaction failed due to insufficient gas. Please ensure you have enough SUI for gas fees.');
      }
      
      if (error.message.includes('authority signature')) {
        return new Error('Transaction signature invalid or rejected. Please try again.');
      }
      
      return error;
    }
    
    // For unknown error types
    return new Error(defaultMessage);
  }
  
  /**
   * Get details of an object on the blockchain
   * 
   * @param objectId - ID of the object to fetch
   * @param network - Network to query
   * @returns Promise resolving to object details
   */
  public async getObject(
    objectId: string,
    network: NetworkType = DEFAULT_NETWORK
  ): Promise<any> {
    try {
      const client = this.getSuiClient(network);
      
      const response = await client.getObject({
        id: objectId,
        options: {
          showContent: true,
          showDisplay: true,
          showOwner: true,
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to get object ${objectId}:`, error);
      throw this.handleError(error, `Failed to get object ${objectId}`);
    }
  }
  
  /**
   * Check if an object exists on the blockchain
   * 
   * @param objectId - ID of the object to check
   * @param network - Network to query
   * @returns Promise resolving to boolean
   */
  public async objectExists(
    objectId: string,
    network: NetworkType = DEFAULT_NETWORK
  ): Promise<boolean> {
    try {
      const client = this.getSuiClient(network);
      await client.getObject({
        id: objectId,
        options: {
          showContent: false
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get events by event type and sender
   * 
   * @param eventType - Type of event to fetch
   * @param sender - Optional sender address to filter by
   * @param limit - Maximum number of events to return
   * @param network - Network to query
   * @returns Promise resolving to events
   */
  public async getEvents(
    eventType: string,
    sender?: string,
    limit: number = 50,
    network: NetworkType = DEFAULT_NETWORK
  ): Promise<any[]> {
    try {
      const client = this.getSuiClient(network);
      
      const filter: any = { MoveEventType: eventType };
      if (sender) {
        filter.Sender = sender;
      }
      
      const events = await client.queryEvents({
        query: { MoveEventType: eventType },
        limit
      });
      
      return events.data;
    } catch (error) {
      console.error('Failed to get events:', error);
      throw this.handleError(error, 'Failed to get events');
    }
  }
}

// Create a singleton instance
const connectionService = new ConnectionService();

export default connectionService;