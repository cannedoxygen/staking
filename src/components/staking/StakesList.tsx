import React, { useState } from 'react';
import { useStaking } from '../../hooks/useStaking';
import { StakePosition } from '../../types/staking';
import { formatDate, formatTokenAmount } from '../../utils/formatters';
import { STAKING_DURATION } from '../../utils/constants';
import Button from '../common/Button';
import Card from '../common/Card';
import Loader from '../common/Loader';
import WithdrawModal from './WithdrawModal';
import Notification from '../common/Notification';

const StakesList: React.FC = () => {
  // States
  const [selectedStake, setSelectedStake] = useState<StakePosition | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Hooks
  const { 
    stakingPositions, 
    loading, 
    error, 
    calculatePendingRewards, 
    calculateTimeLeft, 
    isStakeUnlocked,
    claimStakingRewards,
    compound,
    setAutoCompound
  } = useStaking();

  // Handle withdraw button click
  const handleWithdraw = (stake: StakePosition) => {
    setSelectedStake(stake);
    setShowWithdrawModal(true);
  };

  // Handle claim rewards
  const handleClaimRewards = async (stake: StakePosition) => {
    try {
      const success = await claimStakingRewards(stake.id);
      if (success) {
        setNotification({
          type: 'success',
          message: 'Rewards claimed successfully!'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to claim rewards.'
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while claiming rewards.'
      });
    }
  };

  // Handle compound rewards
  const handleCompound = async (stake: StakePosition) => {
    try {
      const success = await compound(stake.id);
      if (success) {
        setNotification({
          type: 'success',
          message: 'Rewards compounded successfully!'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to compound rewards.'
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while compounding rewards.'
      });
    }
  };

  // Handle toggle auto-compound
  const handleToggleAutoCompound = async (stake: StakePosition) => {
    try {
      const newState = !stake.autoCompound;
      const success = await setAutoCompound(stake.id, newState);
      if (success) {
        setNotification({
          type: 'success',
          message: `Auto-compound ${newState ? 'enabled' : 'disabled'} successfully!`
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to update auto-compound setting.'
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while updating auto-compound setting.'
      });
    }
  };

  // Format duration text
  const formatDuration = (durationSeconds: number): string => {
    switch (durationSeconds) {
      case STAKING_DURATION.ONE_MONTH:
        return '1 Month';
      case STAKING_DURATION.THREE_MONTHS:
        return '3 Months';
      case STAKING_DURATION.SIX_MONTHS:
        return '6 Months';
      case STAKING_DURATION.ONE_YEAR:
        return '1 Year';
      default:
        return `${Math.floor(durationSeconds / (24 * 60 * 60))} Days`;
    }
  };

  // Clear notification after 5 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Display error from staking hook
  React.useEffect(() => {
    if (error) {
      setNotification({
        type: 'error',
        message: error
      });
    }
  }, [error]);

  // Render loading state
  if (loading && stakingPositions.length === 0) {
    return (
      <Card title="Your Stakes">
        <div className="flex justify-center items-center p-8">
          <Loader size="lg" />
        </div>
      </Card>
    );
  }

  // Render empty state
  if (stakingPositions.length === 0) {
    return (
      <Card title="Your Stakes">
        <div className="text-center p-8">
          <p className="text-gray-500 mb-4">You don't have any active stakes yet.</p>
          <p className="text-gray-600">Start staking TARDI tokens to earn rewards!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <Card title="Your Stakes">
        <div className="space-y-4 divide-y divide-gray-100">
          {stakingPositions.map((stake) => {
            const { days, hours, minutes } = calculateTimeLeft(stake);
            const pendingRewards = calculatePendingRewards(stake);
            const unlocked = isStakeUnlocked(stake);
            
            return (
              <div key={stake.id} className="pt-4 first:pt-0">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">
                      {formatTokenAmount(stake.amount)} TARDI
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      unlocked 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Started</p>
                        <p className="text-sm font-medium">
                          {formatDate(stake.startTime * 1000)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Unlocks</p>
                        <p className="text-sm font-medium">
                          {formatDate(stake.endTime * 1000)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium">
                          {formatDuration(stake.lockDuration)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">APY</p>
                        <p className="text-sm font-medium text-green-600">
                          {stake.rewardRate}%
                        </p>
                      </div>
                    </div>
                    
                    {!unlocked && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Time Remaining</p>
                        <div className="flex space-x-2">
                          <div className="bg-gray-100 rounded px-2 py-1 text-center flex-1">
                            <p className="text-sm font-bold">{days}</p>
                            <p className="text-xs text-gray-500">Days</p>
                          </div>
                          <div className="bg-gray-100 rounded px-2 py-1 text-center flex-1">
                            <p className="text-sm font-bold">{hours}</p>
                            <p className="text-xs text-gray-500">Hours</p>
                          </div>
                          <div className="bg-gray-100 rounded px-2 py-1 text-center flex-1">
                            <p className="text-sm font-bold">{minutes}</p>
                            <p className="text-xs text-gray-500">Minutes</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-gray-500">Pending Rewards</p>
                        <p className="text-xs">
                          Auto-compound: 
                          <button 
                            onClick={() => handleToggleAutoCompound(stake)}
                            className="ml-1 underline text-blue-600 hover:text-blue-800"
                          >
                            {stake.autoCompound ? 'On' : 'Off'}
                          </button>
                        </p>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        {formatTokenAmount(pendingRewards)} TARDI
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {unlocked ? (
                        <Button
                          variant="primary"
                          className="flex-1"
                          onClick={() => handleWithdraw(stake)}
                        >
                          Withdraw
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => handleClaimRewards(stake)}
                            disabled={parseFloat(pendingRewards) <= 0}
                          >
                            Claim Rewards
                          </Button>
                          <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => handleCompound(stake)}
                            disabled={parseFloat(pendingRewards) <= 0}
                          >
                            Compound
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Withdraw Modal */}
      {selectedStake && (
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          stake={selectedStake}
          onWithdrawSuccess={() => {
            setShowWithdrawModal(false);
            setNotification({
              type: 'success',
              message: 'Stake withdrawn successfully!'
            });
          }}
        />
      )}
    </div>
  );
};

export default StakesList;