import React, { useState, useEffect } from 'react';
import { useStaking } from '../../hooks/useStaking';
import { useWallet } from '../../hooks/useWallet';
import { getTokenBalance } from '../../services/sui/contract';
import { STAKING_DURATION } from '../../utils/constants';
import { validateAmount } from '../../utils/validators';
import { calculateEstimatedRewards } from '../../services/sui/contract';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import Notification from '../common/Notification';
import DurationSelector from './DurationSelector';
import AutoCompoundToggle from './AutoCompoundToggle';
import Loader from '../common/Loader';

const StakingForm: React.FC = () => {
  // States
  const [amount, setAmount] = useState<string>('');
  const [duration, setDuration] = useState<number>(STAKING_DURATION.ONE_MONTH);
  const [autoCompound, setAutoCompound] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>('0');
  const [estimatedRewards, setEstimatedRewards] = useState<string>('0');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Hooks
  const { address, connected } = useWallet();
  const { stake, loading, error, stakingStats } = useStaking();

  // Fetch user's token balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && address) {
        try {
          const tokenBalance = await getTokenBalance(address);
          setBalance(tokenBalance);
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      }
    };

    fetchBalance();
  }, [connected, address]);

  // Update estimated rewards whenever inputs change
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const apy = stakingStats.apyRates[duration] || 0;
      const rewards = calculateEstimatedRewards(amount, duration, apy);
      setEstimatedRewards(rewards);
    } else {
      setEstimatedRewards('0');
    }
  }, [amount, duration, stakingStats.apyRates]);

  // Handle input changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
  };

  const handleAutoCompoundChange = (enabled: boolean) => {
    setAutoCompound(enabled);
  };

  // Handle max button click
  const handleMaxClick = () => {
    setAmount(balance);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!validateAmount(amount, balance)) {
      setNotification({
        type: 'error',
        message: 'Invalid amount. Please enter a valid amount within your balance.'
      });
      return;
    }

    try {
      const success = await stake(amount, duration, autoCompound);

      if (success) {
        setNotification({
          type: 'success',
          message: 'Staking successful! Your tokens have been staked.'
        });
        // Reset form
        setAmount('');
      } else {
        setNotification({
          type: 'error',
          message: 'Staking failed. Please try again.'
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while staking. Please try again.'
      });
    }
  };

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Display error from staking hook
  useEffect(() => {
    if (error) {
      setNotification({
        type: 'error',
        message: error
      });
    }
  }, [error]);

  return (
    <Card title="Stake TARDI">
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount to Stake
            </label>
            <span className="text-xs text-gray-500">
              Balance: {parseFloat(balance).toFixed(4)} TARDI
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.0"
              className="flex-grow"
              min="0"
              step="0.000001"
              required
            />
            <Button
              type="button"
              onClick={handleMaxClick}
              variant="secondary"
              className="w-16"
            >
              Max
            </Button>
          </div>
        </div>
        
        <DurationSelector 
          selectedDuration={duration} 
          onChange={handleDurationChange} 
        />
        
        <AutoCompoundToggle 
          enabled={autoCompound} 
          onChange={handleAutoCompoundChange} 
        />
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Staking Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Staking Amount:</span>
              <span className="font-medium">
                {parseFloat(amount || '0').toFixed(6)} TARDI
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lock Duration:</span>
              <span className="font-medium">
                {duration === STAKING_DURATION.ONE_MONTH ? '1 Month' :
                 duration === STAKING_DURATION.THREE_MONTHS ? '3 Months' :
                 duration === STAKING_DURATION.SIX_MONTHS ? '6 Months' : '1 Year'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">APY:</span>
              <span className="font-medium text-green-600">
                {stakingStats.apyRates[duration]}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Auto-Compound:</span>
              <span className="font-medium">
                {autoCompound ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span className="text-gray-600">Estimated Rewards:</span>
              <span className="font-medium text-green-600">
                {parseFloat(estimatedRewards).toFixed(6)} TARDI
              </span>
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!connected || loading || !amount || parseFloat(amount) <= 0}
        >
          {loading ? <Loader size="sm" /> : 'Stake TARDI'}
        </Button>
      </form>
    </Card>
  );
};

export default StakingForm;