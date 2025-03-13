import { MATH, STAKING_DURATION, STAKING_APY } from './constants';

/**
 * Calculate rewards for a stake based on amount, APY, and time elapsed
 * 
 * @param amount - Staked amount
 * @param apy - Annual Percentage Yield (e.g., 5 for 5%)
 * @param timeElapsedSeconds - Time elapsed in seconds
 * @returns Calculated rewards
 */
export const calculateRewards = (
  amount: string | number,
  apy: number,
  timeElapsedSeconds: number
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Convert APY to decimal (e.g., 5% -> 0.05)
  const apyDecimal = apy / 100;
  
  // Calculate time as fraction of year
  const timeInYears = timeElapsedSeconds / MATH.SECONDS_PER_YEAR;
  
  // Simple interest formula: principal * rate * time
  const rewards = numAmount * apyDecimal * timeInYears;
  
  return rewards.toString();
};

/**
 * Calculate compound interest for a stake
 * 
 * @param amount - Initial staked amount
 * @param apy - Annual Percentage Yield (e.g., 5 for 5%)
 * @param timeElapsedSeconds - Time elapsed in seconds
 * @param compoundingFrequency - Number of compounding periods per year
 * @returns Final amount after compounding
 */
export const calculateCompoundInterest = (
  amount: string | number,
  apy: number,
  timeElapsedSeconds: number,
  compoundingFrequency: number = 365 // Daily compounding by default
): string => {
  const principal = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Convert APY to decimal
  const apyDecimal = apy / 100;
  
  // Calculate time as fraction of year
  const timeInYears = timeElapsedSeconds / MATH.SECONDS_PER_YEAR;
  
  // Compound interest formula: P * (1 + r/n)^(n*t)
  const ratePerPeriod = apyDecimal / compoundingFrequency;
  const numberOfPeriods = compoundingFrequency * timeInYears;
  
  const finalAmount = principal * Math.pow(1 + ratePerPeriod, numberOfPeriods);
  
  return finalAmount.toString();
};

/**
 * Calculate APY based on staking duration
 * 
 * @param durationSeconds - Staking duration in seconds
 * @returns APY rate
 */
export const getApyForDuration = (durationSeconds: number): number => {
  return STAKING_APY[durationSeconds] || 0;
};

/**
 * Calculate time remaining for a stake
 * 
 * @param endTimeSeconds - End time in seconds since epoch
 * @returns Time components in days, hours, minutes, seconds
 */
export const calculateTimeRemaining = (endTimeSeconds: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} => {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemainingSeconds = Math.max(0, endTimeSeconds - currentTime);
  
  const days = Math.floor(timeRemainingSeconds / (24 * 3600));
  const hours = Math.floor((timeRemainingSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
  const seconds = timeRemainingSeconds % 60;
  
  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: timeRemainingSeconds
  };
};

/**
 * Check if a stake is unlocked (available for withdrawal)
 * 
 * @param endTimeSeconds - End time in seconds since epoch
 * @returns True if stake is unlocked
 */
export const isStakeUnlocked = (endTimeSeconds: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= endTimeSeconds;
};

/**
 * Calculate total rewards across multiple staking positions
 * 
 * @param stakes - Array of staking positions
 * @param calculateStakeRewards - Function to calculate rewards for a single stake
 * @returns Total rewards across all positions
 */
export const calculateTotalRewards = (
  stakes: Array<{
    amount: string;
    rewardRate: number;
    startTime: number;
    endTime: number;
    lastCompoundTime?: number;
  }>,
  calculateStakeRewards: (stake: any) => string
): string => {
  const totalRewards = stakes.reduce((sum, stake) => {
    const stakeRewards = parseFloat(calculateStakeRewards(stake));
    return sum + stakeRewards;
  }, 0);
  
  return totalRewards.toString();
};

/**
 * Calculate stake value including principal and rewards
 * 
 * @param principal - Initial staked amount
 * @param rewards - Earned rewards
 * @returns Total stake value
 */
export const calculateTotalValue = (
  principal: string | number,
  rewards: string | number
): string => {
  const numPrincipal = typeof principal === 'string' ? parseFloat(principal) : principal;
  const numRewards = typeof rewards === 'string' ? parseFloat(rewards) : rewards;
  
  return (numPrincipal + numRewards).toString();
};

/**
 * Calculate the optimal staking duration for a target return
 * 
 * @param targetReturn - Desired return percentage
 * @param maxDurationSeconds - Maximum acceptable duration in seconds
 * @returns Optimal duration in seconds
 */
export const calculateOptimalDuration = (
  targetReturn: number,
  maxDurationSeconds: number = STAKING_DURATION.ONE_YEAR
): number => {
  const availableDurations = Object.keys(STAKING_DURATION)
    .map(key => STAKING_DURATION[key as keyof typeof STAKING_DURATION])
    .filter(duration => duration <= maxDurationSeconds)
    .sort((a, b) => a - b);
  
  // Find the shortest duration that meets or exceeds the target return
  for (const duration of availableDurations) {
    const apy = getApyForDuration(duration);
    if (apy >= targetReturn) {
      return duration;
    }
  }
  
  // If no duration meets the target, return the max available
  return availableDurations[availableDurations.length - 1];
};

/**
 * Compare returns between standard interest and compound interest
 * 
 * @param principal - Initial staked amount
 * @param apy - Annual Percentage Yield
 * @param durationSeconds - Staking duration in seconds
 * @param compoundingFrequency - Number of compounds per year
 * @returns Comparison data
 */
export const compareInterestMethods = (
  principal: string | number,
  apy: number,
  durationSeconds: number,
  compoundingFrequency: number = 365
): {
  principal: number;
  simpleInterest: number;
  compoundInterest: number;
  difference: number;
  percentageImprovement: number;
} => {
  const numPrincipal = typeof principal === 'string' ? parseFloat(principal) : principal;
  const timeInYears = durationSeconds / MATH.SECONDS_PER_YEAR;
  
  // Simple interest
  const simpleInterest = numPrincipal * (1 + (apy / 100) * timeInYears);
  
  // Compound interest
  const ratePerPeriod = (apy / 100) / compoundingFrequency;
  const periods = compoundingFrequency * timeInYears;
  const compoundInterest = numPrincipal * Math.pow(1 + ratePerPeriod, periods);
  
  // Difference and percentage improvement
  const difference = compoundInterest - simpleInterest;
  const percentageImprovement = (difference / (simpleInterest - numPrincipal)) * 100;
  
  return {
    principal: numPrincipal,
    simpleInterest,
    compoundInterest,
    difference,
    percentageImprovement
  };
};