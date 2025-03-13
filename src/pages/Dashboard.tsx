import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useStaking } from '../hooks/useStaking';
import { formatTokenAmount, formatAddress } from '../utils/formatters';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StakesList from '../components/staking/StakesList';
import RewardsDisplay from '../components/staking/RewardsDisplay';
import Loader from '../components/common/Loader';

const Dashboard: React.FC = () => {
  const { connected, address, balance, getWalletName } = useWallet();
  const { stakingPositions, stakingStats, loading, tokenBalance } = useStaking();
  const [timeOfDay, setTimeOfDay] = useState<string>('');

  // Determine greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('morning');
    } else if (hour < 18) {
      setTimeOfDay('afternoon');
    } else {
      setTimeOfDay('evening');
    }
  }, []);

  // Calculate total value (staked + rewards)
  const calculateTotalValue = (): string => {
    if (stakingPositions.length === 0) return '0';

    const totalStaked = stakingPositions.reduce(
      (sum, stake) => sum + parseFloat(stake.amount),
      0
    );

    const totalRewards = stakingPositions.reduce((sum, stake) => {
      // This assumes useStaking hook provides a calculatePendingRewards function
      const rewards = parseFloat(stake.amount) * (stake.rewardRate / 100) * 
        (Math.min(Date.now() / 1000, stake.endTime) - stake.startTime) / 
        (365 * 24 * 60 * 60);
      return sum + rewards;
    }, 0);

    return (totalStaked + totalRewards).toString();
  };

  return (
    <Layout title="Dashboard">
      {!connected ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome to TARDI Staking
          </h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your staking positions and rewards.
          </p>
          <img 
            src="/images/tardi-logo.svg" 
            alt="TARDI Logo" 
            className="w-32 h-32 mx-auto mb-6" 
          />
          <p className="text-gray-500 text-sm mb-6">
            Stake TARDI tokens to earn rewards and support the ecosystem.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              // This would typically open a wallet selection modal
              // We'll assume there's a function to handle this in the parent component
              document.dispatchEvent(new CustomEvent('open-wallet-modal'));
            }}
          >
            Connect Wallet
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-1">
              Good {timeOfDay}, {formatAddress(address || '')}
            </h2>
            <p className="text-blue-100">
              Welcome to your TARDI staking dashboard
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Wallet Balance">
              <div className="flex flex-col items-center p-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  {formatTokenAmount(tokenBalance)} TARDI
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Connected to {getWalletName()}
                </p>
              </div>
            </Card>
            
            <Card title="Total Staked">
              <div className="flex flex-col items-center p-4">
                {loading ? (
                  <Loader size="md" />
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {formatTokenAmount(
                        stakingPositions.reduce(
                          (sum, stake) => sum + parseFloat(stake.amount),
                          0
                        ).toString()
                      )} TARDI
                    </h3>
                    <p className="text-gray-500 text-sm mt-2">
                      Across {stakingPositions.length} staking positions
                    </p>
                  </>
                )}
              </div>
            </Card>
            
            <Card title="Total Value">
              <div className="flex flex-col items-center p-4">
                {loading ? (
                  <Loader size="md" />
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-green-600">
                      {formatTokenAmount(calculateTotalValue())} TARDI
                    </h3>
                    <p className="text-gray-500 text-sm mt-2">
                      Staked amount + pending rewards
                    </p>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Global Stats */}
          <Card title="Platform Statistics">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Value Locked</p>
                <p className="text-xl font-bold text-gray-800">
                  {formatTokenAmount(stakingStats.totalStaked, 2, true)} TARDI
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Stakers</p>
                <p className="text-xl font-bold text-gray-800">
                  {stakingStats.totalStakers.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Max APY</p>
                <p className="text-xl font-bold text-green-600">
                  {Math.max(...Object.values(stakingStats.apyRates))}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Rewards Pool</p>
                <p className="text-xl font-bold text-gray-800">
                  {formatTokenAmount(stakingStats.rewardsAvailable, 2, true)} TARDI
                </p>
              </div>
            </div>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StakesList />
            <RewardsDisplay />
          </div>

          {/* Tardigrade Fun Fact */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-indigo-700 mb-2">🔬 Tardigrade Fun Fact</h3>
            <p className="text-sm text-indigo-600">
              Tardigrades can survive in extreme conditions that would kill most other life forms, 
              including the vacuum of space, radiation, dehydration, and temperatures from near absolute zero to 300°F.
              Just like TARDI tokens—resilient in all market conditions!
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;