import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { NETWORK, CONTRACT } from '../../utils/constants';
import { NetworkType } from '../../types/common';

// Default network if not specified
const DEFAULT_NETWORK: NetworkType = NETWORK.MAINNET;

// Cache for SuiClient instances
const clientCache: Record<NetworkType, SuiClient> = {} as Record<NetworkType, SuiClient>;

/**
 * Create or retrieve a cached SuiClient for a specific network
 * 
 * @param network - Network type (mainnet, testnet, devnet)
 * @returns SuiClient instance
 */
export const getSuiClient = (network: NetworkType = DEFAULT_NETWORK): SuiClient => {
  if (!clientCache[network]) {
    clientCache[network] = new SuiClient({ url: getFullnodeUrl(network) });
  }
  
  return clientCache[network];
};

/**
 * Check if a connection to Sui network is active
 * 
 * @param network - Network to check
 * @returns Promise resolving to boolean indicating connection status
 */
export const checkConnection = async (network: NetworkType = DEFAULT_NETWORK): Promise<boolean> => {
  try {
    const client = getSuiClient(network);
    await client.getLatestCheckpointSequenceNumber();
    return true;
  } catch (error) {
    console.error('Failed to connect to Sui network:', error);
    return false;
  }
};

/**
 * Get the current gas price for the network
 * 
 * @param network - Network to query
 * @returns Promise resolving to current gas price (in MIST)
 */
export const getGasPrice = async (network: NetworkType = DEFAULT_NETWORK): Promise<string> => {
  try {
    const client = getSuiClient(network);
    const { reference_gas_price } = await client.getReferenceGasPrice();
    return reference_gas_price.toString();
  } catch (error) {
    console.error('Failed to get gas price:', error);
    throw error;
  }
};

/**
 * Get the current chain ID
 * 
 * @param network - Network to query
 * @returns Promise resolving to chain ID
 */
export const getChainId = async (network: NetworkType = DEFAULT_NETWORK): Promise<string> => {
  try {
    const client = getSuiClient(network);
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
    throw error;
  }
};

/**
 * Get token balance for an address
 * 
 * @param address - Wallet address to check
 * @param coinType - Optional coin type (defaults to TARDI token)
 * @param network - Network to query
 * @returns Promise resolving to token balance
 */
export const getTokenBalance = async (
  address: string,
  coinType: string = CONTRACT.TARDI_COIN_TYPE,
  network: NetworkType = DEFAULT_NETWORK
): Promise<string> => {
  try {
    const client = getSuiClient(network);
    
    const { totalBalance } = await client.getBalance({
      owner: address,
      coinType
    });
    
    return totalBalance;
  } catch (error) {
    console.error('Failed to get token balance:', error);
    return '0';
  }
};

/**
 * Generate a new keypair for testing purposes
 * 
 * This should only be used for development/testing
 * 
 * @returns New Ed25519Keypair
 */
export const generateKeypair = (): Ed25519Keypair => {
  return new Ed25519Keypair();
};

/**
 * Estimate gas for a transaction
 * 
 * @param txb - Transaction block to estimate
 * @param sender - Sender address
 * @param network - Network to query
 * @returns Promise resolving to estimated gas cost
 */
export const estimateGas = async (
  txb: TransactionBlock,
  sender: string,
  network: NetworkType = DEFAULT_NETWORK
): Promise<bigint> => {
  try {
    const client = getSuiClient(network);
    
    const { gasEstimation } = await client.dryRunTransactionBlock({
      transactionBlock: txb,
      sender
    });
    
    if (!gasEstimation) {
      throw new Error('Gas estimation failed');
    }
    
    return BigInt(gasEstimation.computationCost) + 
           BigInt(gasEstimation.storageCost) - 
           BigInt(gasEstimation.storageRebate);
  } catch (error) {
    console.error('Failed to estimate gas:', error);
    throw error;
  }
};

/**
 * Get the block height of the Sui blockchain
 * 
 * @param network - Network to query
 * @returns Promise resolving to current block height
 */
export const getBlockHeight = async (network: NetworkType = DEFAULT_NETWORK): Promise<number> => {
  try {
    const client = getSuiClient(network);
    const seq = await client.getLatestCheckpointSequenceNumber();
    return Number(seq);
  } catch (error) {
    console.error('Failed to get block height:', error);
    throw error;
  }
};

/**
 * Get transaction by digest
 * 
 * @param digest - Transaction digest
 * @param network - Network to query
 * @returns Promise resolving to transaction data
 */
export const getTransaction = async (
  digest: string,
  network: NetworkType = DEFAULT_NETWORK
) => {
  try {
    const client = getSuiClient(network);
    return await client.getTransactionBlock({
      digest,
      options: {
        showEffects: true,
        showEvents: true,
        showInput: true,
        showObjectChanges: true,
      }
    });
  } catch (error) {
    console.error('Failed to get transaction:', error);
    throw error;
  }
};

/**
 * Get all transactions for an address
 * 
 * @param address - Address to query
 * @param limit - Maximum number of transactions to return
 * @param network - Network to query
 * @returns Promise resolving to transaction data
 */
export const getAddressTransactions = async (
  address: string,
  limit: number = 10,
  network: NetworkType = DEFAULT_NETWORK
) => {
  try {
    const client = getSuiClient(network);
    return await client.queryTransactionBlocks({
      filter: {
        FromAddress: address
      },
      limit,
      options: {
        showEffects: true,
        showEvents: true,
        showInput: true,
      }
    });
  } catch (error) {
    console.error('Failed to get address transactions:', error);
    throw error;
  }
};

/**
 * Check if object exists
 * 
 * @param objectId - Object ID to check
 * @param network - Network to query
 * @returns Promise resolving to boolean indicating if object exists
 */
export const objectExists = async (
  objectId: string,
  network: NetworkType = DEFAULT_NETWORK
): Promise<boolean> => {
  try {
    const client = getSuiClient(network);
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
};