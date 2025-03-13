import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { 
  createStake, 
  withdrawStake, 
  claimRewards, 
  compoundRewards, 
  toggleAutoCompound, 
  getStakingInfo 
} from '../services/sui/contract';
import { StakePosition, StakingStats } from '../types/staking';
import { formatBalance } from '../utils/formatters';
import { STAKING_DURATION } from '../utils/constants';

export const useStaking = () => {
  const { connected, address, signAndExecuteTransaction } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stakingPositions, setStakingPositions] = useState<StakePosition[]>([]);
  const [stakingStats, setStakingStats] = useState<StakingStats>({
    totalStaked: '0',
    rewardsAvailable: '0',
    totalStakers: 0,
    apyRates: {
      [STAKING_DURATION.ONE_MONTH]: 5,
      [STAKING_DURATION.THREE_MONTHS]: 8,
      [STAKING_DURATION.SIX_MONTHS]: 12,
      [STAKING_DURATION.ONE_YEAR]: 20
    }
  });

  // Fetch user staking positions and global stats
  const fetchStakingData = useCallback(async () => {
    if (!connected || !address) return;

    try {
      setLoading(true);
      setError(null);
      
      const { positions, stats } = await getStakingInfo(address);
      
      setStakingPositions(positions);
      setStakingStats({
        totalStaked: formatBalance(stats.totalStaked),
        rewardsAvailable: formatBalance(stats.rewardsAvailable),
        totalStakers: stats.totalStakers,
        apyRates: stats.apyRates || stakingStats.apyRates
      });
    } catch (err) {
      console.error('Error fetching staking data:', err);
      setError('Failed to load staking information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [connected, address, stakingStats.apyRates]);

  // Initialize data when wallet connects
  useEffect(() => {
    if (connected) {
      fetchStakingData();
    } else {
      // Reset state when wallet disconnects
      setStakingPositions([]);
    }
  }, [connected, fetchStakingData]);

  // Create a new stake
  const stake = async (amount: string, duration: number, autoCompound: boolean) => {
    if (!connected || !address) {
      setError('Please connect your wallet');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txPayload = await createStake(amount, duration, autoCompound);
      const response = await signAndExecuteTransaction(txPayload);
      
      if (response && response.effects?.status?.status === 'success') {
        await fetchStakingData(); // Refresh data
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error creating stake:', err);
      setError(err.message || 'Failed to create stake. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Withdraw stake and rewards
  const withdraw = async (stakeId: string) => {
    if (!connected || !address) {
      setError('Please connect your wallet');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txPayload = await withdrawStake(stakeId);
      const response = await signAndExecuteTransaction(txPayload);
      
      if (response && response.effects?.status?.status === 'success') {
        await fetchStakingData(); // Refresh data
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error withdrawing stake:', err);
      setError(err.message || 'Failed to withdraw stake. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Claim rewards without withdrawing stake
  const claimStakingRewards = async (stakeId: string) => {
    if (!connected || !address) {
      setError('Please connect your wallet');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txPayload = await claimRewards(stakeId);
      const response = await signAndExecuteTransaction(txPayload);
      
      if (response && response.effects?.status?.status === 'success') {
        await fetchStakingData(); // Refresh data
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error claiming rewards:', err);
      setError(err.message || 'Failed to claim rewards. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Compound rewards into stake
  const compound = async (stakeId: string) => {
    if (!connected || !address) {
      setError('Please connect your wallet');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txPayload = await compoundRewards(stakeId);
      const response = await signAndExecuteTransaction(txPayload);
      
      if (response && response.effects?.status?.status === 'success') {
        await fetchStakingData(); // Refresh data
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error compounding rewards:', err);
      setError(err.message || 'Failed to compound rewards. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle auto-compound setting
  const setAutoCompound = async (stakeId: string, enabled: boolean) => {
    if (!connected || !address) {
      setError('Please connect your wallet');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const txPayload = await toggleAutoCompound(stakeId, enabled);
      const response = await signAndExecuteTransaction(txPayload);
      
      if (response && response.effects?.status?.status === 'success') {
        // Update local state to avoid refetching
        setStakingPositions(positions => 
          positions.map(pos => 
            pos.id === stakeId 
              ? { ...pos, autoCompound: enabled } 
              : pos
          )
        );
        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error toggling auto-compound:', err);
      setError(err.message || 'Failed to update auto-compound setting. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calculate pending rewards for a stake
  const calculatePendingRewards = (stake: StakePosition): string => {
    // If the contract doesn't provide this directly, we could calculate an estimate
    // This is a simplified calculation
    const now = Math.floor(Date.now() / 1000);
    const startTime = stake.startTime;
    const endTime = stake.endTime;
    
    // Use the minimum of current time and end time
    const currentTime = Math.min(now, endTime);
    
    // Calculate elapsed time in seconds
    const timeElapsed = currentTime - startTime;
    
    // If no time has passed yet
    if (timeElapsed <= 0) return '0';
    
    // Calculate rewards based on APY
    // rewards = (amount * apy * timeElapsed) / (100 * secondsPerYear)
    const secondsPerYear = 365 * 24 * 60 * 60;
    const amountNum = parseFloat(stake.amount);
    const apyRate = stake.rewardRate;
    
    const rewards = (amountNum * apyRate * timeElapsed) / (100 * secondsPerYear);
    
    return rewards.toFixed(6);
  };

  // Calculate time left for a stake
  const calculateTimeLeft = (stake: StakePosition): { days: number, hours: number, minutes: number } => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = Math.max(0, stake.endTime - now);
    
    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
    
    return { days, hours, minutes };
  };

  // Check if a stake is unlocked (available for withdrawal)
  const isStakeUnlocked = (stake: StakePosition): boolean => {
    const now = Math.floor(Date.now() / 1000);
    return now >= stake.endTime;
  };

  return {
    // State
    loading,
    error,
    stakingPositions,
    stakingStats,
    
    // Actions
    stake,
    withdraw,
    claimStakingRewards,
    compound,
    setAutoCompound,
    fetchStakingData,
    
    // Helpers
    calculatePendingRewards,
    calculateTimeLeft,
    isStakeUnlocked
  };
};