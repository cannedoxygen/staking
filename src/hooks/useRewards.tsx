import { useState, useEffect, useCallback } from 'react';
import { useStaking } from './useStaking';
import { useWallet } from './useWallet';
import { calculateCompoundInterest } from '../utils/calculations';
import { formatTokenAmount } from '../utils/formatters';
import { StakePosition } from '../types/staking';

/**
 * Custom hook for managing and analyzing staking rewards
 */
export const useRewards = () => {
  const { connected, address } = useWallet();
  const { 
    stakingPositions, 
    calculatePendingRewards,
    claimStakingRewards,
    compound,
    stakingStats,
    loading,
    error 
  } = useStaking();
  
  // States for reward analytics
  const [totalRewards, setTotalRewards] = useState<string>('0');
  const [rewardsByDuration, setRewardsByDuration] = useState<Record<number, string>>({});
  const [projectedRewards, setProjectedRewards] = useState<{
    oneMonth: string;
    threeMonths: string;
    sixMonths: string;
    oneYear: string;
  }>({
    oneMonth: '0',
    threeMonths: '0',
    sixMonths: '0',
    oneYear: '0'
  });
  
  // States for reward operations
  const [claimingAll, setClaimingAll] = useState<boolean>(false);
  const [compoundingAll, setCompoundingAll] = useState<boolean>(false);
  const [processingStakeId, setProcessingStakeId] = useState<string | null>(null);
  
  // Internal error state specifically for the rewards hook
  const [rewardsError, setRewardsError] = useState<string | null>(null);
  
  /**
   * Calculate total pending rewards across all staking positions
   */
  const calculateTotalRewards = useCallback(() => {
    if (!stakingPositions.length) {
      setTotalRewards('0');
      return;
    }
    
    const total = stakingPositions.reduce((sum, stake) => {
      return sum + parseFloat(calculatePendingRewards(stake));
    }, 0);
    
    setTotalRewards(total.toString());
  }, [stakingPositions, calculatePendingRewards]);
  
  /**
   * Calculate rewards grouped by staking duration
   */
  const calculateRewardsByDuration = useCallback(() => {
    if (!stakingPositions.length) {
      setRewardsByDuration({});
      return;
    }
    
    const rewardsByDuration: Record<number, number> = {};
    
    stakingPositions.forEach(stake => {
      const duration = stake.lockDuration;
      const rewards = parseFloat(calculatePendingRewards(stake));
      
      if (!rewardsByDuration[duration]) {
        rewardsByDuration[duration] = 0;
      }
      
      rewardsByDuration[duration] += rewards;
    });
    
    // Convert to string values
    const stringRewards: Record<number, string> = {};
    Object.entries(rewardsByDuration).forEach(([duration, amount]) => {
      stringRewards[parseInt(duration)] = amount.toString();
    });
    
    setRewardsByDuration(stringRewards);
  }, [stakingPositions, calculatePendingRewards]);
  
  /**
   * Calculate projected rewards if current amount continued to be staked
   */
  const calculateProjectedRewards = useCallback(() => {
    if (!stakingPositions.length) {
      setProjectedRewards({
        oneMonth: '0',
        threeMonths: '0',
        sixMonths: '0',
        oneYear: '0'
      });
      return;
    }
    
    // Calculate total staked amount
    const totalStaked = stakingPositions.reduce((sum, stake) => {
      return sum + parseFloat(stake.amount);
    }, 0);
    
    // Calculate weighted average APY
    const weightedApy = stakingPositions.reduce((sum, stake) => {
      const weight = parseFloat(stake.amount) / totalStaked;
      return sum + (stake.rewardRate * weight);
    }, 0);
    
    // Calculate projected rewards for different time periods
    const oneMonthSeconds = 30 * 24 * 60 * 60;
    const threeMonthsSeconds = 90 * 24 * 60 * 60;
    const sixMonthsSeconds = 180 * 24 * 60 * 60;
    const oneYearSeconds = 365 * 24 * 60 * 60;
    
    // Use compounding for more accurate projections
    const oneMonth = calculateCompoundInterest(
      totalStaked.toString(), 
      weightedApy, 
      oneMonthSeconds, 
      30 // Monthly compounding
    );
    
    const threeMonths = calculateCompoundInterest(
      totalStaked.toString(), 
      weightedApy, 
      threeMonthsSeconds, 
      30 // Monthly compounding
    );
    
    const sixMonths = calculateCompoundInterest(
      totalStaked.toString(), 
      weightedApy, 
      sixMonthsSeconds, 
      30 // Monthly compounding
    );
    
    const oneYear = calculateCompoundInterest(
      totalStaked.toString(), 
      weightedApy, 
      oneYearSeconds, 
      30 // Monthly compounding
    );
    
    // Calculate just the rewards (subtract principal)
    const oneMonthRewards = (parseFloat(oneMonth) - totalStaked).toString();
    const threeMonthsRewards = (parseFloat(threeMonths) - totalStaked).toString();
    const sixMonthsRewards = (parseFloat(sixMonths) - totalStaked).toString();
    const oneYearRewards = (parseFloat(oneYear) - totalStaked).toString();
    
    setProjectedRewards({
      oneMonth: oneMonthRewards,
      threeMonths: threeMonthsRewards,
      sixMonths: sixMonthsRewards,
      oneYear: oneYearRewards
    });
  }, [stakingPositions]);
  
  /**
   * Calculate total value (staked + rewards)
   */
  const calculateTotalValue = useCallback((): string => {
    if (!stakingPositions.length) {
      return '0';
    }
    
    const totalStaked = stakingPositions.reduce((sum, stake) => {
      return sum + parseFloat(stake.amount);
    }, 0);
    
    const totalRewardsValue = parseFloat(totalRewards);
    
    return (totalStaked + totalRewardsValue).toString();
  }, [stakingPositions, totalRewards]);
  
  /**
   * Claim rewards for a specific stake
   */
  const claimRewards = async (stakeId: string): Promise<boolean> => {
    try {
      setProcessingStakeId(stakeId);
      setRewardsError(null);
      
      const success = await claimStakingRewards(stakeId);
      
      if (success) {
        // Recalculate rewards after successful claim
        calculateTotalRewards();
        calculateRewardsByDuration();
        return true;
      }
      
      return false;
    } catch (err: any) {
      setRewardsError(err.message || 'Failed to claim rewards');
      return false;
    } finally {
      setProcessingStakeId(null);
    }
  };
  
  /**
   * Compound rewards for a specific stake
   */
  const compoundRewards = async (stakeId: string): Promise<boolean> => {
    try {
      setProcessingStakeId(stakeId);
      setRewardsError(null);
      
      const success = await compound(stakeId);
      
      if (success) {
        // Recalculate rewards after successful compounding
        calculateTotalRewards();
        calculateRewardsByDuration();
        return true;
      }
      
      return false;
    } catch (err: any) {
      setRewardsError(err.message || 'Failed to compound rewards');
      return false;
    } finally {
      setProcessingStakeId(null);
    }
  };
  
  /**
   * Claim all rewards across all staking positions
   */
  const claimAllRewards = async (): Promise<boolean> => {
    if (!stakingPositions.length || parseFloat(totalRewards) <= 0) {
      return false;
    }
    
    try {
      setClaimingAll(true);
      setRewardsError(null);
      
      let allSuccessful = true;
      
      // Process stakes with meaningful rewards
      for (const stake of stakingPositions) {
        const pendingRewards = parseFloat(calculatePendingRewards(stake));
        
        if (pendingRewards > 0.000001) { // Only claim if there are meaningful rewards
          setProcessingStakeId(stake.id);
          const success = await claimStakingRewards(stake.id);
          
          if (!success) {
            allSuccessful = false;
          }
        }
      }
      
      // Recalculate rewards after all operations
      calculateTotalRewards();
      calculateRewardsByDuration();
      
      return allSuccessful;
    } catch (err: any) {
      setRewardsError(err.message || 'Failed to claim all rewards');
      return false;
    } finally {
      setClaimingAll(false);
      setProcessingStakeId(null);
    }
  };
  
  /**
   * Compound all rewards across eligible staking positions
   */
  const compoundAllRewards = async (): Promise<boolean> => {
    if (!stakingPositions.length || parseFloat(totalRewards) <= 0) {
      return false;
    }
    
    try {
      setCompoundingAll(true);
      setRewardsError(null);
      
      let allSuccessful = true;
      
      // Get current time to check for unlocked stakes
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Process stakes with meaningful rewards that aren't unlocked
      for (const stake of stakingPositions) {
        const pendingRewards = parseFloat(calculatePendingRewards(stake));
        const isUnlocked = currentTime >= stake.endTime;
        
        // Only compound locked stakes with meaningful rewards
        if (pendingRewards > 0.000001 && !isUnlocked) {
          setProcessingStakeId(stake.id);
          const success = await compound(stake.id);
          
          if (!success) {
            allSuccessful = false;
          }
        }
      }
      
      // Recalculate rewards after all operations
      calculateTotalRewards();
      calculateRewardsByDuration();
      
      return allSuccessful;
    } catch (err: any) {
      setRewardsError(err.message || 'Failed to compound all rewards');
      return false;
    } finally {
      setCompoundingAll(false);
      setProcessingStakeId(null);
    }
  };
  
  /**
   * Calculate the impact of compounding on a stake
   */
  const calculateCompoundingImpact = (stake: StakePosition): {
    withCompounding: string;
    withoutCompounding: string;
    difference: string;
    percentageIncrease: string;
  } => {
    const amount = parseFloat(stake.amount);
    const apy = stake.rewardRate;
    const duration = stake.lockDuration;
    
    // Calculate rewards with simple interest
    const simpleInterest = amount * (1 + (apy / 100) * (duration / 31536000));
    const simpleInterestRewards = simpleInterest - amount;
    
    // Calculate rewards with daily compounding
    const compoundInterestValue = parseFloat(calculateCompoundInterest(
      amount.toString(),
      apy,
      duration,
      365 // Daily compounding
    ));
    const compoundInterestRewards = compoundInterestValue - amount;
    
    // Calculate difference and percentage
    const difference = compoundInterestRewards - simpleInterestRewards;
    const percentageIncrease = (difference / simpleInterestRewards) * 100;
    
    return {
      withCompounding: compoundInterestRewards.toFixed(6),
      withoutCompounding: simpleInterestRewards.toFixed(6),
      difference: difference.toFixed(6),
      percentageIncrease: percentageIncrease.toFixed(2)
    };
  };
  
  /**
   * Find the stake with the highest pending rewards
   */
  const findHighestRewardStake = (): StakePosition | null => {
    if (!stakingPositions.length) {
      return null;
    }
    
    let highestStake: StakePosition | null = null;
    let highestReward = 0;
    
    stakingPositions.forEach(stake => {
      const rewards = parseFloat(calculatePendingRewards(stake));
      if (rewards > highestReward) {
        highestReward = rewards;
        highestStake = stake;
      }
    });
    
    return highestStake;
  };
  
  /**
   * Calculate average APY across all staking positions
   */
  const calculateAverageAPY = (): number => {
    if (!stakingPositions.length) {
      return 0;
    }
    
    const totalStaked = stakingPositions.reduce((sum, stake) => {
      return sum + parseFloat(stake.amount);
    }, 0);
    
    if (totalStaked === 0) {
      return 0;
    }
    
    const weightedApy = stakingPositions.reduce((sum, stake) => {
      const weight = parseFloat(stake.amount) / totalStaked;
      return sum + (stake.rewardRate * weight);
    }, 0);
    
    return parseFloat(weightedApy.toFixed(2));
  };
  
  // Calculate rewards on initial load and when staking positions change
  useEffect(() => {
    if (connected && !loading) {
      calculateTotalRewards();
      calculateRewardsByDuration();
      calculateProjectedRewards();
    }
  }, [connected, loading, stakingPositions, calculateTotalRewards, calculateRewardsByDuration, calculateProjectedRewards]);
  
  return {
    // Reward data
    totalRewards,
    rewardsByDuration,
    projectedRewards,
    totalValue: calculateTotalValue(),
    averageAPY: calculateAverageAPY(),
    
    // Actions
    claimRewards,
    compoundRewards,
    claimAllRewards,
    compoundAllRewards,
    
    // Status
    loading,
    claimingAll,
    compoundingAll,
    processingStakeId,
    error: rewardsError || error,
    
    // Analysis
    calculateCompoundingImpact,
    findHighestRewardStake,
    
    // Derived calculation functions
    calculateTotalRewards,
    calculateRewardsByDuration,
    calculateProjectedRewards
  };
};

export default useRewards;