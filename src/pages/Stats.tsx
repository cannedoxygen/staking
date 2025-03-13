import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { useStaking } from '../hooks/useStaking';
import { useWallet } from '../hooks/useWallet';
import { STAKING_DURATION, DURATION_LABELS } from '../utils/constants';
import { formatTokenAmount, formatNumberWithSuffix } from '../utils/formatters';

const Stats: React.FC = () => {
  const { stakingStats, stakingPositions, loading } = useStaking();
  const { connected } = useWallet();
  
  // Time periods for historical data
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'all'>('month');
  
  // Mock historical data (in a real app, this would come from an API)
  const [historicalData, setHistoricalData] = useState<{
    tvl: { date: string; value: number }[];
    stakers: { date: string; value: number }[];
    rewards: { date: string; value: number }[];
  }>({
    tvl: [],
    stakers: [],
    rewards: []
  });
  
  // Generate mock historical data based on current stats
  useEffect(() => {
    if (loading) return;
    
    const currentTVL = parseFloat(stakingStats.totalStaked);
    const currentStakers = stakingStats.totalStakers;
    const currentRewards = parseFloat(stakingStats.rewardsAvailable);
    
    // Helper to generate random data trend
    const generateTrend = (currentValue: number, volatility: number, days: number) => {
      const data = [];
      let value = currentValue * 0.7; // Start at 70% of current value
      
      // Generate daily data points for the specified number of days
      for (let i = days; i >= 0; i--) {
        // Random fluctuation with overall upward trend
        const change = (Math.random() - 0.3) * volatility;
        value = value * (1 + change);
        
        // Ensure we end up at the current value
        if (i === 0) {
          value = currentValue;
        }
        
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.max(0, Math.round(value))
        });
      }
      
      return data;
    };
    
    // Generate data based on selected time period
    const days = timePeriod === 'week' ? 7 : timePeriod === 'month' ? 30 : 90;
    
    setHistoricalData({
      tvl: generateTrend(currentTVL, 0.02, days),
      stakers: generateTrend(currentStakers, 0.03, days),
      rewards: generateTrend(currentRewards, 0.05, days)
    });
  }, [loading, stakingStats, timePeriod]);
  
  // Calculate distribution of stakes by duration
  const durationDistribution = stakingPositions.reduce((acc, stake) => {
    const duration = stake.lockDuration;
    if (!acc[duration]) {
      acc[duration] = 0;
    }
    acc[duration] += parseFloat(stake.amount);
    return acc;
  }, {} as Record<number, number>);
  
  // Calculate total staked across all durations
  const totalStaked = Object.values(durationDistribution).reduce((sum, amount) => sum + amount, 0);
  
  // Calculate percentages
  const durationPercentages = Object.entries(durationDistribution).reduce((acc, [duration, amount]) => {
    acc[duration] = totalStaked > 0 ? (amount / totalStaked) * 100 : 0;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <Layout
      title="Platform Statistics"
      description="Analytics and statistics for TARDI staking platform"
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-1">Total Value Locked</p>
              {loading ? (
                <Loader size="sm" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatTokenAmount(stakingStats.totalStaked, 2, true)} TARDI
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Across {stakingStats.totalStakers.toLocaleString()} stakers
                  </div>
                </>
              )}
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-1">Reward Pool</p>
              {loading ? (
                <Loader size="sm" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-green-600">
                    {formatTokenAmount(stakingStats.rewardsAvailable, 2, true)} TARDI
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Available for distribution to stakers
                  </div>
                </>
              )}
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-1">Average APY</p>
              {loading ? (
                <Loader size="sm" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-blue-600">
                    {Object.values(stakingStats.apyRates).reduce((sum, rate) => sum + rate, 0) / 
                      Object.values(stakingStats.apyRates).length}%
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Ranging from {Math.min(...Object.values(stakingStats.apyRates))}% to {Math.max(...Object.values(stakingStats.apyRates))}%
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
        
        {/* Historical Charts */}
        <Card title="Historical Performance">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                Platform growth over time
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimePeriod('week')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    timePeriod === 'week'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTimePeriod('month')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    timePeriod === 'month'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setTimePeriod('all')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    timePeriod === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  90 Days
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* TVL Chart */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Total Value Locked</h3>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="h-40 relative">
                      {/* Simple chart visualization using div heights */}
                      <div className="absolute inset-0 flex items-end justify-between px-2">
                        {historicalData.tvl.map((item, index) => {
                          const max = Math.max(...historicalData.tvl.map(d => d.value));
                          const height = max > 0 ? (item.value / max) * 100 : 0;
                          return (
                            <div 
                              key={index}
                              className="w-2 bg-blue-400 rounded-t"
                              style={{ height: `${height}%` }}
                              title={`${item.date}: ${formatTokenAmount(item.value.toString())} TARDI`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-blue-700 font-medium">
                      {historicalData.tvl.length > 0 && (
                        <>
                          {formatTokenAmount(historicalData.tvl[0].value.toString())} → {formatTokenAmount(historicalData.tvl[historicalData.tvl.length - 1].value.toString())} TARDI
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Stakers Chart */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Total Stakers</h3>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="h-40 relative">
                      {/* Simple chart visualization using div heights */}
                      <div className="absolute inset-0 flex items-end justify-between px-2">
                        {historicalData.stakers.map((item, index) => {
                          const max = Math.max(...historicalData.stakers.map(d => d.value));
                          const height = max > 0 ? (item.value / max) * 100 : 0;
                          return (
                            <div 
                              key={index}
                              className="w-2 bg-green-400 rounded-t"
                              style={{ height: `${height}%` }}
                              title={`${item.date}: ${item.value.toLocaleString()} stakers`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-green-700 font-medium">
                      {historicalData.stakers.length > 0 && (
                        <>
                          {formatNumberWithSuffix(historicalData.stakers[0].value)} → {formatNumberWithSuffix(historicalData.stakers[historicalData.stakers.length - 1].value)} stakers
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Rewards Chart */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Reward Pool</h3>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="h-40 relative">
                      {/* Simple chart visualization using div heights */}
                      <div className="absolute inset-0 flex items-end justify-between px-2">
                        {historicalData.rewards.map((item, index) => {
                          const max = Math.max(...historicalData.rewards.map(d => d.value));
                          const height = max > 0 ? (item.value / max) * 100 : 0;
                          return (
                            <div 
                              key={index}
                              className="w-2 bg-yellow-400 rounded-t"
                              style={{ height: `${height}%` }}
                              title={`${item.date}: ${formatTokenAmount(item.value.toString())} TARDI`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-yellow-700 font-medium">
                      {historicalData.rewards.length > 0 && (
                        <>
                          {formatTokenAmount(historicalData.rewards[0].value.toString())} → {formatTokenAmount(historicalData.rewards[historicalData.rewards.length - 1].value.toString())} TARDI
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
        
        {/* Duration Distribution (for connected users) */}
        {connected && (
          <Card title="Your Staking Distribution">
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader size="lg" />
                </div>
              ) : stakingPositions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">You don't have any active stakes yet</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Distribution of your staked TARDI tokens by duration
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(durationDistribution).map(([duration, amount]) => (
                      <div key={duration}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">
                            {DURATION_LABELS[duration as unknown as number] || `${duration} seconds`}
                          </span>
                          <span className="text-gray-600">
                            {formatTokenAmount(amount.toString())} TARDI ({durationPercentages[duration].toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${durationPercentages[duration]}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
        
        {/* APY Comparison */}
        <Card title="APY Comparison">
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader size="lg" />
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Compare APY rates across different staking durations
                  </p>
                </div>
                
                <div className="space-y-6">
                  {Object.entries(stakingStats.apyRates).map(([duration, rate]) => {
                    const durationKey = parseInt(duration);
                    const durationText = DURATION_LABELS[durationKey] || `${Math.floor(durationKey / (24 * 60 * 60))} days`;
                    
                    return (
                      <div key={duration}>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium text-gray-700">
                            {durationText} Staking
                          </h3>
                          <span className="text-sm font-bold text-green-600">
                            {rate}% APY
                          </span>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500 mb-1">Initial Stake</p>
                              <p className="font-medium">1,000 TARDI</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Rewards</p>
                              <p className="font-medium text-green-600">
                                +{(1000 * rate / 100).toFixed(0)} TARDI
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Final Value</p>
                              <p className="font-medium text-blue-600">
                                {(1000 + 1000 * rate / 100).toFixed(0)} TARDI
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    * APY calculations are based on annual rates. Actual rewards may vary based on 
                    platform usage and other factors. The examples show potential returns for a 
                    1,000 TARDI stake over the full staking period.
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
        
        {/* Platform Insights */}
        <Card title="Platform Insights">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">
                  Growth Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New Stakers (24h)</span>
                    <span className="text-sm font-medium">+{Math.floor(Math.random() * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New Stakes (24h)</span>
                    <span className="text-sm font-medium">+{Math.floor(Math.random() * 200)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">TVL Growth (7d)</span>
                    <span className="text-sm font-medium text-green-600">+{(Math.random() * 10).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Stake Size</span>
                    <span className="text-sm font-medium">
                      {formatTokenAmount((parseInt(stakingStats.totalStaked) / Math.max(1, stakingStats.totalStakers)).toString())} TARDI
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">
                  Staking Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Most Popular Duration</span>
                    <span className="text-sm font-medium">{DURATION_LABELS[STAKING_DURATION.SIX_MONTHS]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Auto-Compound Enabled</span>
                    <span className="text-sm font-medium">{Math.floor(40 + Math.random() * 30)}% of stakes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Lock Time</span>
                    <span className="text-sm font-medium">{Math.floor(120 + Math.random() * 60)} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rewards Claimed (24h)</span>
                    <span className="text-sm font-medium">
                      {formatTokenAmount((Math.random() * 10000).toFixed(0))} TARDI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Stats;