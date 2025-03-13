import React, { useState } from 'react';
import { useStaking } from '../../hooks/useStaking';
import { StakePosition } from '../../types/staking';
import { formatTokenAmount } from '../../utils/formatters';
import Button from '../common/Button';
import Loader from '../common/Loader';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  stake: StakePosition;
  onWithdrawSuccess: () => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  stake,
  onWithdrawSuccess,
}) => {
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { withdraw, calculatePendingRewards, isStakeUnlocked } = useStaking();

  // Make sure the stake is actually unlocked
  if (!isStakeUnlocked(stake)) {
    onClose();
    return null;
  }

  // Handle withdraw action
  const handleWithdraw = async () => {
    try {
      setWithdrawing(true);
      setError(null);
      
      const success = await withdraw(stake.id);
      
      if (success) {
        onWithdrawSuccess();
      } else {
        setError('Withdrawal failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during withdrawal.');
    } finally {
      setWithdrawing(false);
    }
  };

  // Calculate total to receive (stake amount + rewards)
  const pendingRewards = calculatePendingRewards(stake);
  const totalToReceive = parseFloat(stake.amount) + parseFloat(pendingRewards);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Withdraw Stake
            </h3>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              disabled={withdrawing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Your stake is now unlocked and ready to withdraw. You'll receive your staked TARDI plus any earned rewards.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Staked Amount:</span>
                  <span className="text-sm font-medium">
                    {formatTokenAmount(stake.amount)} TARDI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Earned Rewards:</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatTokenAmount(pendingRewards)} TARDI
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Total to Receive:</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatTokenAmount(totalToReceive.toString())} TARDI
                  </span>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={onClose}
                disabled={withdrawing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? <Loader size="sm" /> : 'Withdraw'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;