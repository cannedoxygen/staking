import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';
import { 
  getStakingInfo, 
  getStakingRates,
  getTokenBalance
} from '../services/sui/contract';
import { StakePosition, StakingStats } from '../types/staking';
import { STAKING_DURATION, STAKING_APY } from '../utils/constants';

// Define the context interface
interface StakingContextProps {
  // States
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  stakingPositions: StakePosition[];
  stakingStats: StakingStats;
  tokenBalance: string;
  
  // Actions
  refreshData: () => Promise<void>;
  clearError: () => void;
}

// Default values for stats
const defaultStats: StakingStats = {
  totalStaked: '0',
  rewardsAvailable: '0',
  totalStakers: 0,
  apyRates: {
    [STAKING_DURATION.ONE_MONTH]: STAKING_APY[STAKING_DURATION.ONE_MONTH],
    [STAKING_DURATION.THREE_MONTHS]: STAKING_APY[STAKING_DURATION.THREE_MONTHS],
    [STAKING_DURATION.SIX_MONTHS]: STAKING_APY[STAKING_DURATION.SIX_MONTHS],
    [STAKING_DURATION.ONE_YEAR]: STAKING_APY[STAKING_DURATION.ONE_YEAR]
  }
};

// Create the context with default values
export const StakingContext = createContext<StakingContextProps>({
  loading: false,
  refreshing: false,
  error: null,
  stakingPositions: [],
  stakingStats: defaultStats,
  tokenBalance: '0',
  
  refreshData: async () => {},
  clearError: () => {}
});

// Provider component
export const StakingContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // States
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stakingPositions, setStakingPositions] = useState<StakePosition[]>([]);
  const [stakingStats, setStakingStats] = useState<StakingStats>(defaultStats);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  
  // Get wallet info
  const { connected, address } = useWallet();
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Fetch staking data
  const fetchStakingData = useCallback(async () => {
    if (!connected || !address) {
      setStakingPositions([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      clearError();
      
      // Fetch staking positions and stats
      const { positions, stats } = await getStakingInfo(address);
      setStakingPositions(positions);
      
      // Update stats with APY rates if available
      const apyRates = await getStakingRates();
      setStakingStats({
        totalStaked: stats.totalStaked.toString(),
        rewardsAvailable: stats.rewardsAvailable.toString(),
        totalStakers: stats.totalStakers,
        apyRates: apyRates || defaultStats.apyRates
      });
      
      // Get token balance
      const balance = await getTokenBalance(address);
      setTokenBalance(balance);
    } catch (err: any) {
      console.error('Error fetching staking data:', err);
      setError(err.message || 'Failed to load staking information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [connected, address, clearError]);
  
  // Refresh data (for manual refresh)
  const refreshData = useCallback(async () => {
    if (!connected || !address) return;
    
    try {
      setRefreshing(true);
      clearError();
      
      // Fetch updated data
      const { positions, stats } = await getStakingInfo(address);
      setStakingPositions(positions);
      
      // Update stats
      setStakingStats(prevStats => ({
        ...prevStats,
        totalStaked: stats.totalStaked.toString(),
        rewardsAvailable: stats.rewardsAvailable.toString(),
        totalStakers: stats.totalStakers,
      }));
      
      // Update token balance
      const balance = await getTokenBalance(address);
      setTokenBalance(balance);
    } catch (err: any) {
      console.error('Error refreshing staking data:', err);
      setError(err.message || 'Failed to refresh staking information. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [connected, address, clearError]);
  
  // Initialize data when wallet connects
  useEffect(() => {
    fetchStakingData();
  }, [fetchStakingData]);
  
  // Set up periodic refresh (every 60 seconds)
  useEffect(() => {
    if (connected) {
      const interval = setInterval(() => {
        refreshData();
      }, 60000); // 60 seconds
      
      return () => clearInterval(interval);
    }
  }, [connected, refreshData]);
  
  const contextValue: StakingContextProps = {
    loading,
    refreshing,
    error,
    stakingPositions,
    stakingStats,
    tokenBalance,
    
    refreshData,
    clearError
  };
  
  return (
    <StakingContext.Provider value={contextValue}>
      {children}
    </StakingContext.Provider>
  );
};

export default StakingContext;