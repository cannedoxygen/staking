import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import RewardsDisplay from '../components/staking/RewardsDisplay';
import Loader from '../components/common/Loader';
import { useWallet } from '../hooks/useWallet';
import { useStaking } from '../hooks/useStaking';
import { formatTokenAmount } from '../utils/formatters';

const Rewards: React.FC = () => {
  const { connected, address } = useWallet();
  const { 
    stakingPositions, 
    calculatePendingRewards, 
    loading, 
    claimStakingRewards, 
    compound,
    fetchStakingData 
  } = useStaking();
  
  const [claimingAll, setClaimingAll] = useState<boolean>(false);
  const [compoundingAll, setCompoundingAll] = useState<boolean>(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);
  const [compoundSuccess, setCompoundSuccess] = useState<boolean>(false);
  
  // Calculate total pending rewards
  const totalPendingRewards = stakingPositions.reduce((total, stake) => {
    return total + parseFloat(calculatePendingRewards(stake));
  }, 0);
  
  // Count unlocked stakes
  const unlockedStakes = stakingPositions.filter(stake => {
    const now = Math.floor(Date.now() / 1000);
    return now >= stake.endTime;
  });
  
  // Calculate total rewards by duration
  const rewardsByDuration = stakingPositions.reduce((acc, stake) => {
    const duration = stake.lockDuration;
    const rewards = parseFloat(calculatePendingRewards(stake));
    
    if (!acc[duration]) {
      acc[duration] = 0;
    }
    
    acc[duration] += rewards;
    return acc;
  }, {} as Record<number, number>);
  
  // Format duration label
  const getDurationLabel = (seconds: number): string => {
    const days = seconds / (24 * 60 * 60);
    
    if (days === 30) return '1 Month';
    if (days === 90) return '3 Months';
    if (days === 180) return '6 Months';
    if (days === 365) return '1 Year';
    
    return `${days} Days`;
  };
  
  // Handle claim all rewards
  const handleClaimAll = async () => {
    if (stakingPositions.length === 0 || totalPendingRewards <= 0) return;
    
    try {
      setClaimingAll(true);
      setClaimSuccess(false);
      
      // Process each stake with rewards sequentially
      for (const stake of stakingPositions) {
        const pendingReward = parseFloat(calculatePendingRewards(stake));
        
        if (pendingReward > 0.000001) { // Only claim if there are meaningful rewards
          await claimStakingRewards(stake.id);
        }
      }
      
      // Refresh data after all claims
      await fetchStakingData();
      setClaimSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setClaimSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error claiming all rewards:', error);
    } finally {
      setClaimingAll(false);
    }
  };
  
  // Handle compound all rewards
  const handleCompoundAll = async () => {
    if (stakingPositions.length === 0 || totalPendingRewards <= 0) return;
    
    try {
      setCompoundingAll(true);
      setCompoundSuccess(false);
      
      // Process each stake with rewards sequentially
      for (const stake of stakingPositions) {
        const pendingReward = parseFloat(calculatePendingRewards(stake));
        
        // Only compound locked stakes with meaningful rewards
        if (pendingReward > 0.000001 && stake.endTime > Math.floor(Date.now() / 1000)) {
          await compound(stake.id);
        }
      }
      
      // Refresh data after all compounds
      await fetchStakingData();
      setCompoundSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setCompoundSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error compounding all rewards:', error);
    } finally {
      setCompoundingAll(false);
    }
  };
  
  return (
    <Layout 
      title="Rewards" 
      description="Track and manage your TARDI staking rewards"
    >
      <div className="space-y-6">
        {!connected ? (
          <Card>
            <div className="p-6 text-center">
              <h2 className="text-lg font-medium text-gray-800 mb-3">
                Connect Wallet to View Rewards
              </h2>
              <p className="text-gray-600 mb-4">
                Connect your wallet to view and manage your TARDI staking rewards.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  document.dispatchEvent(new CustomEvent('open-wallet-modal'));
                }}
              >
                Connect Wallet
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Rewards Summary Card */}
            <Card>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      Your Staking Rewards
                    </h2>
                    <p className="text-gray-600">
                      Manage and track rewards from your staked TARDI tokens
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      onClick={handleClaimAll}
                      disabled={claimingAll || totalPendingRewards <= 0}
                    >
                      {claimingAll ? <Loader size="sm" className="mr-2" /> : null}
                      Claim All Rewards
                    </Button>
                    
                    <Button
                      variant="primary"
                      onClick={handleCompoundAll}
                      disabled={compoundingAll || totalPendingRewards <= 0}
                    >
                      {compoundingAll ? <Loader size="sm" className="mr-2" /> : null}
                      Compound All
                    </Button>
                  </div>
                </div>
                
                {claimSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                    Successfully claimed all rewards!
                  </div>
                )}
                
                {compoundSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                    Successfully compounded all rewards!
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Total Pending Rewards</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {loading ? (
                        <Loader size="sm" />
                      ) : (
                        formatTokenAmount(totalPendingRewards.toString())
                      )}
                      <span className="text-sm ml-1">TARDI</span>
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Active Staking Positions</p>
                    <p className="text-2xl font-bold text-green-700">
                      {loading ? (
                        <Loader size="sm" />
                      ) : (
                        stakingPositions.length
                      )}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Unlocked Positions</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {loading ? (
                        <Loader size="sm" />
                      ) : (
                        unlockedStakes.length
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rewards Information */}
              <div className="lg:col-span-2">
                <RewardsDisplay />
              </div>
              
              {/* Rewards by Duration */}
              <div className="lg:col-span-1">
                <Card title="Rewards by Duration">
                  {loading ? (
                    <div className="flex justify-center items-center p-8">
                      <Loader size="lg" />
                    </div>
                  ) : Object.keys(rewardsByDuration).length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No staking rewards yet</p>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="space-y-4">
                        {Object.entries(rewardsByDuration).map(([duration, amount]) => (
                          <div key={duration} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">
                              {getDurationLabel(parseInt(duration))}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {formatTokenAmount(amount.toString())} TARDI
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Total</span>
                          <span className="text-sm font-bold text-green-600">
                            {formatTokenAmount(totalPendingRewards.toString())} TARDI
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
                
                {/* Reinvestment Calculator */}
                <Card title="Reinvestment Benefits" className="mt-6">
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Compounding your rewards can significantly increase your returns over time.
                    </p>
                    
                    <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-yellow-700 mb-2">
                        Why Compound?
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                        <li>Earn interest on your interest</li>
                        <li>Maximize your long-term returns</li>
                        <li>Increase your stake size automatically</li>
                      </ul>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      Example: 1,000 TARDI staked for 1 year at 20% APY
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Without Compounding</p>
                        <p className="text-sm font-medium">
                          1,200 TARDI
                        </p>
                        <p className="text-xs text-gray-500">
                          +200 TARDI (+20%)
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-500 mb-1">With Daily Compounding</p>
                        <p className="text-sm font-medium text-blue-700">
                          1,221.40 TARDI
                        </p>
                        <p className="text-xs text-blue-500">
                          +221.40 TARDI (+22.14%)
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Link to="/stake">
                        <Button variant="secondary" className="w-full text-sm">
                          Stake More TARDI
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Rewards Tips */}
            <Card title="Tips to Maximize Your Rewards">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-700 mb-2">
                      Longer Staking Periods
                    </h3>
                    <p className="text-sm text-gray-700">
                      Stake for longer periods to access higher APY rates. A 1-year stake offers
                      4 times the APY of a 1-month stake.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-700 mb-2">
                      Enable Auto-Compounding
                    </h3>
                    <p className="text-sm text-gray-700">
                      Automatically reinvest your rewards to take advantage of compound interest
                      and significantly boost your long-term returns.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-700 mb-2">
                      Regular Contributions
                    </h3>
                    <p className="text-sm text-gray-700">
                      Add to your staking positions regularly to build a diverse portfolio of
                      stakes with different durations and maturity dates.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Rewards;