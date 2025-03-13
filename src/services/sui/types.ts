/**
 * Type definitions for Sui blockchain interactions
 */

import { TransactionBlock } from '@mysten/sui.js/transactions';

/**
 * Gas budget configuration
 */
export interface GasBudgetConfig {
  budget: number;         // Gas budget in MIST
  priorityFee?: number;   // Optional priority fee for faster processing
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  showEffects?: boolean;  // Include transaction effects in response
  showEvents?: boolean;   // Include transaction events in response
  showInput?: boolean;    // Include transaction input in response
  showObjectChanges?: boolean; // Include object changes in response
  gasBudget?: GasBudgetConfig; // Gas budget for transaction
}

/**
 * Transaction execution result
 */
export interface TransactionResult {
  digest: string;       // Transaction digest (hash)
  success: boolean;     // Whether the transaction was successful
  status: string;       // Transaction status
  gasUsed: {            // Gas information
    computationCost: string;
    storageCost: string;
    storageRebate: string;
    nonRefundableStorageFee: string;
  };
  errorMessage?: string; // Error message if transaction failed
  timestamp?: string;    // Transaction timestamp
  events?: any[];        // Events emitted during transaction execution
  objectChanges?: any[]; // Object changes resulting from transaction
}

/**
 * Simplified object data
 */
export interface SuiObjectData {
  objectId: string;           // Object ID
  version: string;            // Object version
  digest: string;             // Object digest
  type?: string;              // Object type
  owner?: {                   // Object owner
    type: 'AddressOwner' | 'ObjectOwner' | 'Shared' | 'Immutable';
    address?: string;         // Owner address if AddressOwner
    objectId?: string;        // Owner object ID if ObjectOwner
  };
  content?: any;              // Object content
}

/**
 * Simplified coin object
 */
export interface CoinObject {
  coinType: string;           // Coin type
  coinObjectId: string;       // Coin object ID
  balance: string;            // Coin balance
  lockedUntilEpoch?: string;  // If coin is locked, until which epoch
}

/**
 * Staking pool object
 */
export interface StakingPoolObject {
  objectId: string;                // Object ID
  stakedBalance: string;           // Total staked balance
  rewardBalance: string;           // Total reward balance 
  totalStaked: string;             // Total amount staked
  totalStakesCount: number;        // Number of active stakes
}

/**
 * Staking position object
 */
export interface StakingPositionObject {
  objectId: string;                // Object ID
  owner: string;                   // Owner address
  amount: string;                  // Staked amount
  startTime: number;               // Start time (seconds since epoch)
  lockDuration: number;            // Lock duration in seconds
  endTime: number;                 // End time (seconds since epoch)
  rewardRate: number;              // Reward rate (APY)
  autoCompound: boolean;           // Whether auto-compound is enabled
  lastCompoundTime: number;        // Last compound time (seconds since epoch)
}

/**
 * Transaction request for signing
 */
export interface TransactionRequest {
  tx: TransactionBlock;            // Transaction block
  options?: TransactionOptions;    // Transaction options
}

/**
 * Simplified event data
 */
export interface EventData {
  id: {                             // Event ID
    txDigest: string;               // Transaction digest
    eventSeq: string;               // Event sequence number
  };
  packageId: string;                // Package ID
  transactionModule: string;        // Transaction module
  sender: string;                   // Sender address
  type: string;                     // Event type
  parsedJson?: any;                 // Parsed event data
  timestamp?: string;               // Event timestamp
}

/**
 * Balance summary for an address
 */
export interface BalanceSummary {
  [coinType: string]: {            // Coin type as key
    totalBalance: string;          // Total balance
    availableBalance?: string;     // Available balance (excluding locked)
    lockedBalance?: string;        // Locked balance
    coinObjects?: CoinObject[];    // Coin objects
  }
}

/**
 * Package metadata
 */
export interface PackageMetadata {
  id: string;                       // Package ID
  version: string;                  // Package version
  modules: string[];                // Modules in the package
  digest: string;                   // Package digest
}

/**
 * Checkpoint data
 */
export interface CheckpointData {
  epoch: string;                    // Epoch number
  sequenceNumber: string;           // Sequence number
  digest: string;                   // Checkpoint digest
  timestamp: string;                // Checkpoint timestamp
  transactions: string[];           // Transactions in checkpoint
  validatorSignatures: string[];    // Validator signatures
}

/**
 * Network metadata
 */
export interface NetworkMetadata {
  chainId: string;                  // Chain ID
  epoch: string;                    // Current epoch
  protocolVersion: string;          // Protocol version
  referenceGasPrice: string;        // Reference gas price
  totalTransactions: string;        // Total transactions
  lastCheckpointId: string;         // Last checkpoint ID
}