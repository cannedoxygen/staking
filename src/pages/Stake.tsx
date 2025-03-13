import React from 'react';
import Layout from '../components/layout/Layout';
import StakingForm from '../components/staking/StakingForm';
import StakesList from '../components/staking/StakesList';
import Card from '../components/common/Card';
import { useWallet } from '../hooks/useWallet';
import { useStaking } from '../hooks/useStaking';
import { STAKING_APY } from '../utils/constants';

const Stake: React.FC = () => {
  const { connected } = useWallet();
  const { stakingStats } = useStaking();
  
  // Get APY rates from staking stats
  const apyRates = Object.values(stakingStats.apyRates);
  const minApy = Math.min(...apyRates);
  const maxApy = Math.max(...apyRates);
  
  return (
    <Layout 
      title="Stake TARDI" 
      description="Stake your TARDI tokens to earn rewards and support the ecosystem."
    >
      <div className="space-y-6">
        {/* Header Info Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Staking TARDI - Resilient Like Tardigrades
            </h2>
            <p className="text-gray-600 mb-4">
              Stake your TARDI tokens to earn rewards over time. Choose your lock duration to 
              maximize your earnings - longer staking periods earn higher APY!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Flexible Durations</p>
                <p className="text-sm text-gray-700">
                  Choose from 1 month to 1 year lock periods to suit your investment strategy.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">Earn {minApy}%-{maxApy}% APY</p>
                <p className="text-sm text-gray-700">
                  Earn competitive rewards with our tiered APY system based on lock duration.
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 mb-1">Auto-Compound</p>
                <p className="text-sm text-gray-700">
                  Enable auto-compounding to reinvest your rewards automatically for maximum growth.
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staking Form */}
          <div className="lg:col-span-1">
            <StakingForm />
          </div>
          
          {/* Staking Positions */}
          <div className="lg:col-span-2">
            <StakesList />
          </div>
        </div>
        
        {/* Not Connected State */}
        {!connected && (
          <div className="mt-6 p-6 bg-yellow-50 rounded-lg text-center">
            <p className="text-yellow-700 mb-2">
              Connect your wallet to start staking TARDI tokens.
            </p>
          </div>
        )}
        
        {/* FAQ Section */}
        <Card title="Frequently Asked Questions">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-1">
                What is staking?
              </h3>
              <p className="text-sm text-gray-600">
                Staking is the process of locking your tokens in a smart contract to earn rewards over time.
                It's similar to a time deposit, where you commit to not using your tokens for a specific period.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-1">
                Can I withdraw early?
              </h3>
              <p className="text-sm text-gray-600">
                No, TARDI staking uses a locked staking model where tokens remain locked until the staking period ends.
                This ensures stability in the ecosystem and rewards long-term holders.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-1">
                What is auto-compounding?
              </h3>
              <p className="text-sm text-gray-600">
                Auto-compounding is a feature that automatically reinvests your earned rewards back into your stake,
                allowing you to earn interest on your interest. This can significantly increase your returns over time.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-1">
                How are rewards calculated?
              </h3>
              <p className="text-sm text-gray-600">
                Rewards are calculated based on your staked amount, the APY rate for your chosen duration,
                and the time elapsed since staking. The formula is: rewards = (staked_amount * APY * time_elapsed) / (100 * 365 days).
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Stake;