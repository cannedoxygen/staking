import { TransactionBlock } from '@mysten/sui.js/transactions';
import { getSuiClient } from './connection';
import { StakingPositionObject, StakingPoolObject } from './types';
import { CONTRACT, NETWORK, TRANSACTION } from '../../utils/constants';
import { StakePosition, StakingStats } from '../../types/staking';
import { NetworkType } from '../../types/common';

// Default network
const DEFAULT_NETWORK: NetworkType = NETWORK.MAINNET;

/**
 * Create a new staking transaction
 * 
 * @param amount - Amount to stake (in TARDI)
 * @param duration - Staking duration in seconds
 * @param autoCompound - Whether to enable auto-compounding
 * @param network - Network to use
 * @returns Transaction block ready for signing
 */
export const createStake = async (
  amount: string,
  duration: number,
  autoCompound: boolean,
  network: NetworkType = DEFAULT_NETWORK
): Promise<TransactionBlock> => {
  // Convert amount to MIST (smallest unit on Sui)
  const amountMist = BigInt(Math.floor(parseFloat(amount) * 10**9));
  
  // Create transaction block
  const txb = new TransactionBlock();
  
  // Split coin to exact amount needed for staking
  const [coin] = txb.splitCoins(txb.gas, [txb.pure(amountMist)]);
  
  // Call contract's create_stake function
  txb.moveCall({
    target: `${CONTRACT.PACKAGE_ID}::${CONTRACT.MODULE_NAME}::create_stake`,
    arguments: [
      txb.object(CONTRACT.STAKING_POOL_ID),
      coin,
      txb.pure(duration),
      txb.pure(autoCompound),
      txb.object(CONTRACT.CLOCK_ID)
    ],
  });
  
  // Set gas budget
  txb.setGasBudget(TRANSACTION.DEFAULT_GAS_BUDGET);
  
  return txb;
};

/**
 * Create a transaction to withdraw stake and rewards
 * 
 * @param stakeId - ID of the stake position to withdraw
 * @param network - Network to use
 * @returns Transaction block ready for signing
 */
export const withdrawStake = async (
  stakeId: string,
  network: NetworkType = DEFAULT_NETWORK
): Promise<TransactionBlock> => {
  // Create transaction block
  const txb = new TransactionBlock();
  
  // Call contract's withdraw_stake function
  txb.moveCall({
    target: `${CONTRACT.PACKAGE_ID}::${CONTRACT.MODULE_NAME}::withdraw_stake`,
    arguments: [
      txb.object(CONTRACT.STAKING_POOL_ID),
      txb.object(stakeId),
      txb.object(CONTRACT.CLOCK_ID)
    ],
  });
  
  // Set gas budget
  txb.setGasBudget(TRANSACTION.DEFAULT_GAS_BUDGET);
  
  return txb;
};

/**
 * Create a transaction to claim rewards without withdrawing the stake
 * 
 * @param stakeId - ID of the stake position to claim rewards from
 * @param network - Network to use
 * @returns Transaction block ready for signing
 */
export const claimRewards = async (
  stakeId: string,
  network: NetworkType = DEFAULT_NETWORK
): Promise<TransactionBlock> => {
  // Create transaction block
  const txb = new TransactionBlock();
  
  // Call contract's claim_rewards function
  txb.moveCall({
    target: `${CONTRACT.PACKAGE_ID}::${CONTRACT.MODULE_NAME}::claim_rewards`,
    arguments: [
      txb.object(CONTRACT.STAKING_POOL_ID),
      txb.object(stakeId),
      txb.object(CONTRACT.CLOCK_ID)
    ],
  });
  
  // Set gas budget
  txb.setGasBudget(TRANSACTION.DEFAULT_GAS_BUDGET);
  
  return txb;
};

/**
 * Create a transaction to compound rewards back into the stake
 * 
 * @param stakeId - ID of the stake position to compound rewards for
 * @param network - Network to use
 * @returns Transaction block ready for signing
 */
export const compoundRewards = async (
  stakeId: string,
  network: NetworkType = DEFAULT_NETWORK
): Promise<TransactionBlock> => {
  // Create transaction block
  const txb = new TransactionBlock();
  
  // Call contract's compound_rewards function
  txb.moveCall({
    target: `${CONTRACT.PACKAGE_ID}::${CONTRACT.MODULE_NAME}::compound_rewards`,
    arguments: [
      txb.object(CONTRACT.STAKING_POOL_ID),
      txb.object(stakeId),
      txb.object(CONTRACT.CLOCK_ID)
    ],
  });
  
  // Set gas budget
  txb.setGasBudget(TRANSACTION.DEFAULT_GAS_BUDGET);
  
  return txb;
};

/**
 * Create a transaction to toggle auto-compounding setting
 * 
 * @param stakeId - ID of the stake position to toggle auto-compound for
 * @param enabled - Whether to enable or disable auto-compounding
 * @param network - Network to use
 * @returns Transaction block ready for signing
 */
export const toggleAutoCompound = async (
  stakeId: string,
  enabled: boolean,
  network: NetworkType = DEFAULT_NETWORK
): Promise<TransactionBlock> => {
  // Create transaction block
  const txb = new TransactionBlock();
  
  // Call contract's toggle_auto_compound function
  txb.moveCall({
    target: `${CONTRACT.PACKAGE_ID}::${CONTRACT.MODULE_NAME}::toggle_auto_compound`,
    arguments: [
      txb.object(stakeId),
      txb.pure(enabled)
    ],
  });
  
  // Set gas budget
  txb.setGasBudget(TRANSACTION.DEFAULT_GAS_BUDGET);
  
  return txb;
};

/**
 * Get staking information for an address
 * 
 * @param address - Address to get staking info for
 * @param network - Network to use
 * @returns Staking positions and stats
 */
export const getStakingInfo = async (
  address: string,
  network: NetworkType = DEFAULT_NETWORK
): Promise<{ positions: StakePosition[], stats: StakingStats }> => {
  try {
    const client = getSuiClient(network);
    
    // Get all stake positions owned by the address
    const { data: ownedObjects } = await client.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${CONTRACT.PACKAGE_ID}::${CONTRACT.MODULE_NAME}::StakePosition`
      },
      options: {
        showContent: true,
        showDisplay: true
      }
    });
    
    // Get the staking pool object
    const { data: stakingPoolData } = await client.getObject({
      id: CONTRACT.STAKING_POOL_ID,
      options: {
        showContent: true
      }
    });
    
    // Parse stake positions
    const positions: StakePosition[] = ownedObjects.map(obj => {
      const content = obj.data!.content as any;
      const fields = content.fields;
      
      return {
        id: obj.data!.objectId,
        owner: fields.owner,
        amount: (parseInt(fields.amount) / 10**9).toString(), // Convert from MIST to TARDI
        startTime: parseInt(fields.start_time),
        lockDuration: parseInt(fields.lock_duration),
        endTime: parseInt(fields.end_time),
        rewardRate: parseInt(fields.reward_rate) / 100, // Convert basis points to percentage
        autoCompound: fields.auto_compound,
        lastCompoundTime: parseInt(fields.last_compound_time)
      };
    });
    
    // Parse staking pool data
    const poolContent = stakingPoolData.data!.content as any;
    const poolFields = poolContent.fields;
    
    const stats: StakingStats = {
      totalStaked: (parseInt(poolFields.total_staked) / 10**9).toString(), // Convert from MIST to TARDI
      rewardsAvailable: (parseInt(poolFields.reward_balance.fields.value) / 10**9).toString(), // Convert from MIST to TARDI
      totalStakers: parseInt(poolFields.total_stakes_count),
      apyRates: {
        // Duration in seconds to APY rate in percentage
        2592000: 5,    // 30 days - 5%
        7776000: 8,    // 90 days - 8%
        15552000: 12,  // 180 days - 12%
        31536000: 20   // 365 days - 20%
      }
    };
    
    return { positions, stats };
  } catch (error) {
    console.error('Error fetching staking info:', error);
    
    // Return empty data on error
    return { 
      positions: [], 
      stats: {
        totalStaked: '0',
        rewardsAvailable: '0',
        totalStakers: 0,
        apyRates: {
          2592000: 5,
          7776000: 8,
          15552000: 12,
          31536000: 20
        }
      } 
    };
  }
};

/**
 * Get TARDI token balance for an address
 * 
 * @param address - Address to get balance for
 * @param network - Network to use
 * @returns Token balance as string
 */
export const getTokenBalance = async (
  address: string,
  network: NetworkType = DEFAULT_NETWORK
): Promise<string> => {
  try {
    const client = getSuiClient(network);
    
    const { totalBalance } = await client.getBalance({
      owner: address,
      coinType: CONTRACT.TARDI_COIN_TYPE
    });
    
    // Convert from MIST to TARDI
    return (parseInt(totalBalance) / 10**9).toString();
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0';
  }
};

/**
 * Get staking APY rates
 * 
 * @param network - Network to use
 * @returns Record of duration to APY rate
 */
export const getStakingRates = async (
  network: NetworkType = DEFAULT_NETWORK
): Promise<Record<string, number>> => {
  try {
    // In a real-world scenario, this would be fetched from the contract
    // For simplicity, we're using hardcoded values
    return {
      '2592000': 5,    // 30 days - 5%
      '7776000': 8,    // 90 days - 8%
      '15552000': 12,  // 180 days - 12%
      '31536000': 20   // 365 days - 20%
    };
  } catch (error) {
    console.error('Error fetching staking rates:', error);
    throw error;
  }
};

/**
 * Calculate estimated rewards for a staking position
 * 
 * @param amount - Staked amount
 * @param duration - Staking duration in seconds
 * @param apy - APY rate as percentage
 * @returns Estimated rewards
 */
export const calculateEstimatedRewards = (
  amount: string,
  duration: number,
  apy: number
): string => {
  const amountValue = parseFloat(amount);
  const durationYears = duration / (365 * 24 * 60 * 60); // Convert seconds to years
  
  // Simple APY formula: principal * rate * time
  const rewards = amountValue * (apy / 100) * durationYears;
  
  return rewards.toFixed(6);
};

/**
 * Get detailed information about a specific stake position
 * 
 * @param stakeId - ID of the stake position
 * @param network - Network to use
 * @returns Stake position details
 */
export const getStakeDetails = async (
  stakeId: string,
  network: NetworkType = DEFAULT_NETWORK
): Promise<StakePosition | null> => {
  try {
    const client = getSuiClient(network);
    
    const { data } = await client.getObject({
      id: stakeId,
      options: {
        showContent: true
      }
    });
    
    if (!data || !data.content) {
      return null;
    }
    
    const content = data.content as any;
    const fields = content.fields;
    
    return {
      id: data.objectId,
      owner: fields.owner,
      amount: (parseInt(fields.amount) / 10**9).toString(), // Convert from MIST to TARDI
      startTime: parseInt(fields.start_time),
      lockDuration: parseInt(fields.lock_duration),
      endTime: parseInt(fields.end_time),
      rewardRate: parseInt(fields.reward_rate) / 100, // Convert basis points to percentage
      autoCompound: fields.auto_compound,
      lastCompoundTime: parseInt(fields.last_compound_time)
    };
  } catch (error) {
    console.error('Error fetching stake details:', error);
    return null;
  }
};

/**
 * Get detailed information about the staking pool
 * 
 * @param network - Network to use
 * @returns Staking pool details
 */
export const getStakingPoolDetails = async (
  network: NetworkType = DEFAULT_NETWORK
): Promise<StakingStats | null> => {
  try {
    const client = getSuiClient(network);
    
    const { data } = await client.getObject({
      id: CONTRACT.STAKING_POOL_ID,
      options: {
        showContent: true
      }
    });
    
    if (!data || !data.content) {
      return null;
    }
    
    const content = data.content as any;
    const fields = content.fields;
    
    return {
      totalStaked: (parseInt(fields.total_staked) / 10**9).toString(), // Convert from MIST to TARDI
      rewardsAvailable: (parseInt(fields.reward_balance.fields.value) / 10**9).toString(), // Convert from MIST to TARDI
      totalStakers: parseInt(fields.total_stakes_count),
      apyRates: {
        2592000: 5,
        7776000: 8,
        15552000: 12,
        31536000: 20
      }
    };
  } catch (error) {
    console.error('Error fetching staking pool details:', error);
    return null;
  }
};