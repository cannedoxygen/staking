/**
 * Represents a single staking position
 */
export interface StakePosition {
    // Unique identifier for the stake
    id: string;
    
    // Wallet address of the stake owner
    owner: string;
    
    // Amount of TARDI tokens staked (formatted as string for precision)
    amount: string;
    
    // Unix timestamp (seconds) when staking started
    startTime: number;
    
    // Duration of the lock period in seconds
    lockDuration: number;
    
    // Unix timestamp (seconds) when stake will be unlocked
    endTime: number;
    
    // APY rate for this stake (as a percentage)
    rewardRate: number;
    
    // Whether rewards are automatically compounded
    autoCompound: boolean;
    
    // Unix timestamp (seconds) of last compound action
    lastCompoundTime: number;
  }
  
  /**
   * Global staking statistics
   */
  export interface StakingStats {
    // Total TARDI tokens staked across all users
    totalStaked: string;
    
    // Total rewards available in the pool
    rewardsAvailable: string;
    
    // Number of unique stakers
    totalStakers: number;
    
    // APY rates for different staking durations
    apyRates: Record<number, number>;
  }
  
  /**
   * Staking transaction parameters
   */
  export interface StakingTransactionParams {
    // Amount to stake
    amount: string;
    
    // Duration of the stake in seconds
    duration: number;
    
    // Whether to enable auto-compounding
    autoCompound: boolean;
  }
  
  /**
   * Reward calculation parameters
   */
  export interface RewardCalculationParams {
    // Staked amount
    amount: string;
    
    // APY rate as a percentage
    apy: number;
    
    // Elapsed time in seconds
    timeElapsed: number;
  }
  
  /**
   * Countdown timer information
   */
  export interface CountdownInfo {
    // Days remaining
    days: number;
    
    // Hours remaining
    hours: number;
    
    // Minutes remaining
    minutes: number;
    
    // Seconds remaining
    seconds: number;
    
    // Whether the countdown has completed
    completed: boolean;
  }
  
  /**
   * Summary of a staking position
   */
  export interface StakingSummary {
    // Original staked amount
    stakedAmount: string;
    
    // Current rewards earned
    earnedRewards: string;
    
    // Total value (staked + rewards)
    totalValue: string;
    
    // APY rate
    apy: number;
    
    // Time remaining until unlock
    timeRemaining: CountdownInfo;
    
    // Whether the stake is unlocked
    isUnlocked: boolean;
    
    // Selected staking duration (e.g., "1 Month")
    durationLabel: string;
  }
  
  /**
   * Staking history entry
   */
  export interface StakingHistoryEntry {
    // Unique ID for the history entry
    id: string;
    
    // Type of event
    eventType: 'stake' | 'withdraw' | 'claim' | 'compound';
    
    // Associated stake ID
    stakeId: string;
    
    // Amount involved in the event
    amount: string;
    
    // Unix timestamp when the event occurred
    timestamp: number;
    
    // Transaction hash
    transactionHash: string;
  }
  
  /**
   * Analytics for staking performance
   */
  export interface StakingAnalytics {
    // Total value of all active stakes
    totalValue: string;
    
    // Total rewards earned (all time)
    totalRewardsEarned: string;
    
    // Average APY across all stakes
    averageApy: number;
    
    // Distribution of stakes by duration
    stakingDurationDistribution: Record<string, number>;
    
    // Historical rewards chart data
    rewardsChart: {
      date: string;
      rewards: number;
    }[];
  }