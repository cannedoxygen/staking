import React, { useState, useEffect } from 'react';
import { useStaking } from '../../hooks/useStaking';
import { formatTokenAmount } from '../../utils/formatters';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';

interface RewardsDisplayProps {
  className?: string;
}

const RewardsDisplay: React.FC<RewardsDisplayProps> = ({ className = '' }) => {
  // Calculate total rewards across all staking positions
  const { stakingPositions, calculatePendingRewards, loading, refreshData } = useStaking();
  const [totalRewards, setTotalRewards] = useState<string>('0');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Calculate total pending rewards
  useEffect(() => {
    if (stakingPositions.length > 0) {
      const total = stakingPositions.reduce((sum, stake) => {
        const rewards = parseFloat(calculatePendingRewards(stake));
        return sum + rewards;
      }, 0);
      
      setTotalRewards(total.toString());
    } else {
      setTotalRewards('0');
    }
  }, [stakingPositions, calculatePendingRewards]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Calculate annual projected rewards
  const calculateAnnualProjection = (): string => {
    if (stakingPositions.length === 0) return '0';

    const projection = stakingPositions.reduce((sum, stake) => {
      const amount = parseFloat(stake.amount);
      const apy = stake.rewardRate;
      
      // Simple annual projection based on APY
      const annualReward = amount * (apy / 100);
      return sum + annualReward;
    }, 0);

    return projection.toString();
  };

  // Calculate average APY across all stakes
  const calculateAverageAPY = (): string => {
    if (stakingPositions.length === 0) return '0';

    const totalAmount = stakingPositions.reduce(
      (sum, stake) => sum + parseFloat(stake.amount),
      0
    );

    const weightedAPY = stakingPositions.reduce((sum, stake) => {
      const amount = parseFloat(stake.amount);
      const weight = amount / totalAmount;
      return sum + (stake.rewardRate * weight);
    }, 0);

    return weightedAPY.toFixed(2);
  };

  return (
    <Card 
      title="Your Rewards" 
      className={className}
      action={
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? <Loader size="xs" /> : 'Refresh'}
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Loader size="lg" />
        </div>
      ) : stakingPositions.length === 0 ? (
        <div className="text-center p-6">
          <p className="text-gray-500 mb-3">No staking positions found</p>
          <p className="text-gray-600 text-sm">
            Stake TARDI tokens to start earning rewards!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Total Pending Rewards */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Total Pending Rewards</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatTokenAmount(totalRewards)} TARDI
            </p>
            <p className="text-xs text-blue-500 mt-1">
              Rewards are calculated based on your staking positions
            </p>
          </div>

          {/* Rewards Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Annual Projection</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatTokenAmount(calculateAnnualProjection())} TARDI
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Average APY</p>
              <p className="text-lg font-semibold text-green-600">
                {calculateAverageAPY()}%
              </p>
            </div>
          </div>

          {/* Rewards by Position */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Rewards by Position</h3>
            <div className="space-y-2">
              {stakingPositions.map((stake) => (
                <div
                  key={stake.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatTokenAmount(stake.amount)} TARDI
                    </p>
                    <p className="text-xs text-gray-500">
                      APY: {stake.rewardRate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {formatTokenAmount(calculatePendingRewards(stake))} TARDI
                    </p>
                    <p className="text-xs text-gray-500">
                      {stake.autoCompound ? 'Auto-compounding' : 'Manual compounding'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-700">
            <p className="font-medium mb-1">💡 Tips to maximize rewards:</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li>Stake for longer durations to get higher APY</li>
              <li>Enable auto-compounding to boost your earnings</li>
              <li>Add to your staking positions regularly</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RewardsDisplay;