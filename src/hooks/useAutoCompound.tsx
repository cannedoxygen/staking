import { useState, useCallback, useEffect } from 'react';
import { useStaking } from './useStaking';
import { useWallet } from './useWallet';
import { StakePosition } from '../types/staking';
import { calculateCompoundInterest } from '../utils/calculations';

/**
 * Custom hook for managing auto-compounding functionality
 */
export const useAutoCompound = () => {
  const { connected } = useWallet();
  const { 
    stakingPositions, 
    setAutoCompound, 
    loading,
    error: stakingError
  } = useStaking();
  
  // States
  const [processingStakeId, setProcessingStakeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Enable auto-compounding for a stake
   * 
   * @param stakeId ID of the stake to enable auto-compounding for
   * @returns Promise resolving to success status
   */
  const enableAutoCompound = async (stakeId: string): Promise<boolean> => {
    try {
      setProcessingStakeId(stakeId);
      setError(null);
      
      const success = await setAutoCompound(stakeId, true);
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to enable auto-compounding');
      return false;
    } finally {
      setProcessingStakeId(null);
    }
  };
  
  /**
   * Disable auto-compounding for a stake
   * 
   * @param stakeId ID of the stake to disable auto-compounding for
   * @returns Promise resolving to success status
   */
  const disableAutoCompound = async (stakeId: string): Promise<boolean> => {
    try {
      setProcessingStakeId(stakeId);
      setError(null);
      
      const success = await setAutoCompound(stakeId, false);
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to disable auto-compounding');
      return false;
    } finally {
      setProcessingStakeId(null);
    }
  };
  
  /**
   * Toggle auto-compounding for a stake
   * 
   * @param stakeId ID of the stake to toggle auto-compounding for
   * @param enabled New state (true for enabled, false for disabled)
   * @returns Promise resolving to success status
   */
  const toggleAutoCompound = async (stakeId: string, enabled: boolean): Promise<boolean> => {
    return enabled ? enableAutoCompound(stakeId) : disableAutoCompound(stakeId);
  };
  
  /**
   * Enable auto-compounding for all stakes
   * 
   * @returns Promise resolving to success status
   */
  const enableAutoCompoundAll = async (): Promise<boolean> => {
    if (!stakingPositions.length) {
      return false;
    }
    
    try {
      setError(null);
      
      let allSuccessful = true;
      
      // Filter for stakes that don't have auto-compound enabled
      const stakesToUpdate = stakingPositions.filter(stake => !stake.autoCompound);
      
      for (const stake of stakesToUpdate) {
        setProcessingStakeId(stake.id);
        const success = await setAutoCompound(stake.id, true);
        
        if (!success) {
          allSuccessful = false;
        }
      }
      
      return allSuccessful;
    } catch (err: any) {
      setError(err.message || 'Failed to enable auto-compounding for all stakes');
      return false;
    } finally {
      setProcessingStakeId(null);
    }
  };
  
  /**
   * Disable auto-compounding for all stakes
   * 
   * @returns Promise resolving to success status
   */
  const disableAutoCompoundAll = async (): Promise<boolean> => {
    if (!stakingPositions.length) {
      return false;
    }
    
    try {
      setError(null);
      
      let allSuccessful = true;
      
      // Filter for stakes that have auto-compound enabled
      const stakesToUpdate = stakingPositions.filter(stake => stake.autoCompound);
      
      for (const stake of stakesToUpdate) {
        setProcessingStakeId(stake.id);
        const success = await setAutoCompound(stake.id, false);
        
        if (!success) {
          allSuccessful = false;
        }
      }
      
      return allSuccessful;
    } catch (err: any) {
      setError(err.message || 'Failed to disable auto-compounding for all stakes');
      return false;
    } finally {
      setProcessingStakeId(null);
    }
  };
  
  /**
   * Calculate the impact of auto-compounding for a stake
   * 
   * @param stake Stake position to analyze
   * @param compoundingFrequency How often compounding occurs (default: 365 for daily)
   * @returns Analysis of auto-compounding impact
   */
  const calculateAutoCompoundImpact = (
    stake: StakePosition,
    compoundingFrequency: number = 365
  ): {
    withAutoCompound: string;
    withoutAutoCompound: string;
    difference: string;
    percentageIncrease: string;
  } => {
    const principal = parseFloat(stake.amount);
    const apy = stake.rewardRate;
    
    // Calculate time remaining in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = Math.max(0, stake.endTime - currentTime);
    
    // If already unlocked or very close to unlock, auto-compound has no impact
    if (timeRemaining < 86400) { // Less than 1 day
      return {
        withAutoCompound: '0',
        withoutAutoCompound: '0',
        difference: '0',
        percentageIncrease: '0'
      };
    }
    
    // Calculate final amount with simple interest (no auto-compound)
    const timeRemainingYears = timeRemaining / (365 * 24 * 60 * 60);
    const simpleInterest = principal * (1 + (apy / 100) * timeRemainingYears);
    const simpleInterestRewards = simpleInterest - principal;
    
    // Calculate final amount with compound interest
    const compoundInterestValue = parseFloat(calculateCompoundInterest(
      principal.toString(),
      apy,
      timeRemaining,
      compoundingFrequency
    ));
    const compoundInterestRewards = compoundInterestValue - principal;
    
    // Calculate difference and percentage increase
    const difference = compoundInterestRewards - simpleInterestRewards;
    const percentageIncrease = simpleInterestRewards > 0 
      ? (difference / simpleInterestRewards) * 100 
      : 0;
    
    return {
      withAutoCompound: compoundInterestRewards.toFixed(6),
      withoutAutoCompound: simpleInterestRewards.toFixed(6),
      difference: difference.toFixed(6),
      percentageIncrease: percentageIncrease.toFixed(2)
    };
  };
  
  /**
   * Get auto-compound stats across all stakes
   * 
   * @returns Statistics about auto-compounding usage
   */
  const getAutoCompoundStats = useCallback(() => {
    if (!stakingPositions.length) {
      return {
        enabledCount: 0,
        disabledCount: 0,
        enabledPercentage: 0,
        totalBenefit: '0',
        averageIncrease: '0'
      };
    }
    
    // Count enabled and disabled
    const enabledStakes = stakingPositions.filter(stake => stake.autoCompound);
    const enabledCount = enabledStakes.length;
    const disabledCount = stakingPositions.length - enabledCount;
    const enabledPercentage = (enabledCount / stakingPositions.length) * 100;
    
    // Calculate total benefit from auto-compounding
    let totalBenefit = 0;
    let totalPercentageIncrease = 0;
    
    stakingPositions.forEach(stake => {
      if (stake.autoCompound) {
        const impact = calculateAutoCompoundImpact(stake);
        totalBenefit += parseFloat(impact.difference);
        totalPercentageIncrease += parseFloat(impact.percentageIncrease);
      }
    });
    
    const averageIncrease = enabledCount > 0 
      ? totalPercentageIncrease / enabledCount 
      : 0;
    
    return {
      enabledCount,
      disabledCount,
      enabledPercentage: parseFloat(enabledPercentage.toFixed(2)),
      totalBenefit: totalBenefit.toFixed(6),
      averageIncrease: averageIncrease.toFixed(2)
    };
  }, [stakingPositions]);
  
  /**
   * Find stakes that would benefit most from auto-compounding
   * 
   * @param limit Maximum number of stakes to return
   * @returns Array of stakes sorted by auto-compound benefit
   */
  const findHighImpactStakes = useCallback((limit: number = 3): Array<{
    stake: StakePosition;
    impact: ReturnType<typeof calculateAutoCompoundImpact>;
  }> => {
    if (!stakingPositions.length) {
      return [];
    }
    
    // Calculate impact for all stakes
    const stakesWithImpact = stakingPositions
      .filter(stake => {
        // Filter out already unlocked stakes
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime < stake.endTime;
      })
      .map(stake => ({
        stake,
        impact: calculateAutoCompoundImpact(stake)
      }))
      .filter(item => parseFloat(item.impact.difference) > 0)
      .sort((a, b) => {
        // Sort by percentage increase, descending
        return parseFloat(b.impact.percentageIncrease) - parseFloat(a.impact.percentageIncrease);
      });
    
    return stakesWithImpact.slice(0, limit);
  }, [stakingPositions]);
  
  return {
    // Actions
    enableAutoCompound,
    disableAutoCompound,
    toggleAutoCompound,
    enableAutoCompoundAll,
    disableAutoCompoundAll,
    
    // Status
    loading,
    processingStakeId,
    error: error || stakingError,
    
    // Analysis
    calculateAutoCompoundImpact,
    getAutoCompoundStats,
    findHighImpactStakes,
    
    // State access
    autoCompoundEnabledStakes: stakingPositions.filter(stake => stake.autoCompound),
    autoCompoundDisabledStakes: stakingPositions.filter(stake => !stake.autoCompound)
  };
};

export default useAutoCompound;