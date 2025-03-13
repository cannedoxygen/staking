import React from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import { CONTRACT } from '../utils/constants';

const About: React.FC = () => {
  return (
    <Layout
      title="About TARDI Staking"
      description="Learn about the TARDI token and staking platform"
    >
      <div className="space-y-6">
        {/* TARDI Introduction */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center mb-6">
              <img
                src="/images/tardi-logo.svg"
                alt="TARDI Logo"
                className="w-32 h-32 mb-4 md:mb-0 md:mr-6"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  TARDI Token: Nature's Most Resilient Meme Coin
                </h2>
                <p className="text-gray-600">
                  TARDI is the most resilient meme coin on the Sui blockchain, inspired by the nearly
                  indestructible tardigrade—the toughest creature in existence! Just like tardigrades can
                  survive extreme conditions that would kill most organisms, TARDI is designed to
                  withstand market volatility and thrive in any environment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-700 mb-2">Extreme Resilience</h3>
                <p className="text-sm text-gray-700">
                  Tardigrades can survive in space, extreme temperatures, radiation, and dehydration.
                  Similarly, TARDI is built to survive market extremes.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-700 mb-2">Longevity</h3>
                <p className="text-sm text-gray-700">
                  Tardigrades have existed for over 500 million years. TARDI implements sustainable
                  tokenomics designed for long-term growth and stability.
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-medium text-purple-700 mb-2">Adaptability</h3>
                <p className="text-sm text-gray-700">
                  Tardigrades thrive in diverse environments. TARDI's ecosystem adapts through
                  governance and community-driven development.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Staking Platform */}
        <Card title="About The Staking Platform">
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              The TARDI Staking Platform allows users to stake TARDI tokens and earn rewards over time.
              We've created a simple yet powerful system that incentivizes long-term holding while
              providing competitive returns.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Key Features</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>
                <span className="font-medium">Multiple staking durations</span> with different APYs to suit your investment strategy
              </li>
              <li>
                <span className="font-medium">Auto-compounding</span> to maximize your earnings through the power of compound interest
              </li>
              <li>
                <span className="font-medium">Locked staking</span> for up to 1 year to reward long-term holders
              </li>
              <li>
                <span className="font-medium">Single-sided staking</span> - no need for liquidity pairing, just stake your TARDI
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Technical Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Token Contract:</p>
                  <p className="text-sm text-gray-600 break-all">
                    {CONTRACT.TARDI_COIN_TYPE}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Staking Contract:</p>
                  <p className="text-sm text-gray-600 break-all">
                    {CONTRACT.PACKAGE_ID}::{CONTRACT.MODULE_NAME}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Roadmap */}
        <Card title="Roadmap">
          <div className="p-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 sm:left-1/2 h-full w-0.5 bg-gray-200 transform -translate-x-1/2"></div>

              {/* Timeline items */}
              <div className="space-y-12">
                {/* Q1 2025 */}
                <div className="relative flex flex-col sm:flex-row items-center">
                  <div className="flex-1 sm:pr-8 sm:text-right mb-4 sm:mb-0">
                    <div className="bg-blue-50 p-4 rounded-lg sm:ml-12">
                      <h4 className="text-blue-700 font-bold">Q1 2025</h4>
                      <h5 className="font-medium text-gray-800 mb-2">Staking Platform Launch</h5>
                      <ul className="text-sm text-gray-600 list-disc pl-4">
                        <li>Initial staking platform release</li>
                        <li>Core staking functionality</li>
                        <li>User dashboard and analytics</li>
                      </ul>
                    </div>
                  </div>
                  <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white">
                    1
                  </div>
                  <div className="flex-1 sm:pl-8 hidden sm:block"></div>
                </div>

                {/* Q2 2025 */}
                <div className="relative flex flex-col sm:flex-row items-center">
                  <div className="flex-1 sm:pr-8 hidden sm:block"></div>
                  <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white">
                    2
                  </div>
                  <div className="flex-1 sm:pl-8 mb-4 sm:mb-0">
                    <div className="bg-green-50 p-4 rounded-lg sm:mr-12">
                      <h4 className="text-green-700 font-bold">Q2 2025</h4>
                      <h5 className="font-medium text-gray-800 mb-2">Enhanced Rewards</h5>
                      <ul className="text-sm text-gray-600 list-disc pl-4">
                        <li>Boosted staking rewards</li>
                        <li>Community governance integration</li>
                        <li>Staking leaderboards and achievements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Q3 2025 */}
                <div className="relative flex flex-col sm:flex-row items-center">
                  <div className="flex-1 sm:pr-8 sm:text-right mb-4 sm:mb-0">
                    <div className="bg-purple-50 p-4 rounded-lg sm:ml-12">
                      <h4 className="text-purple-700 font-bold">Q3 2025</h4>
                      <h5 className="font-medium text-gray-800 mb-2">DeFi Expansion</h5>
                      <ul className="text-sm text-gray-600 list-disc pl-4">
                        <li>Multi-token rewards</li>
                        <li>TARDI as collateral for borrowing</li>
                        <li>Cross-chain bridging capabilities</li>
                      </ul>
                    </div>
                  </div>
                  <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white">
                    3
                  </div>
                  <div className="flex-1 sm:pl-8 hidden sm:block"></div>
                </div>

                {/* Q4 2025 */}
                <div className="relative flex flex-col sm:flex-row items-center">
                  <div className="flex-1 sm:pr-8 hidden sm:block"></div>
                  <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-yellow-600 text-white">
                    4
                  </div>
                  <div className="flex-1 sm:pl-8">
                    <div className="bg-yellow-50 p-4 rounded-lg sm:mr-12">
                      <h4 className="text-yellow-700 font-bold">Q4 2025</h4>
                      <h5 className="font-medium text-gray-800 mb-2">Ecosystem Growth</h5>
                      <ul className="text-sm text-gray-600 list-disc pl-4">
                        <li>TARDI DAO launch</li>
                        <li>NFT integration with staking benefits</li>
                        <li>Expanded partnerships across DeFi</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Team & Community */}
        <Card title="Team & Community">
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              TARDI is a community-driven project backed by a team of experienced developers and
              blockchain enthusiasts. We believe in building a resilient ecosystem that rewards
              long-term holders and active community members.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Our Vision</h3>
                <p className="text-gray-600">
                  To create the most resilient and adaptable meme token on the Sui blockchain,
                  backed by strong utility and an engaged community. Just as tardigrades have
                  survived on Earth for millions of years through countless extinctions, TARDI
                  aims to thrive throughout market cycles.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Community Governance</h3>
                <p className="text-gray-600">
                  We believe in decentralization and community ownership. Future development of
                  the TARDI ecosystem will be guided by community governance, where staked TARDI
                  tokens will grant voting power for important decisions.
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-indigo-700 mb-2">Join Our Community</h3>
              <p className="text-gray-700 mb-4">
                Be part of the TARDI journey and connect with fellow holders across our social channels.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://twitter.com/TardiToken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <svg className="h-4 w-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  Twitter
                </a>

                <a
                  href="https://t.me/TardiToken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <svg className="h-4 w-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Telegram
                </a>

                <a
                  href="https://discord.gg/tarditoken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <svg className="h-4 w-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  Discord
                </a>

                <a
                  href="https://tardi.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Website
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Terms and Privacy (anchor points for Footer links) */}
        <div id="terms" className="pt-6">
          <Card title="Terms of Service">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                By using the TARDI Staking Platform, you agree to the following terms:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                <li>
                  TARDI staking involves locking tokens for a fixed period. Once staked, tokens cannot be withdrawn until the lock period ends.
                </li>
                <li>
                  APY rates are not guaranteed and may fluctuate based on various factors including total staked amount and platform usage.
                </li>
                <li>
                  Using blockchain technology involves inherent risks. Users are responsible for securing their private keys and wallet access.
                </li>
                <li>
                  The TARDI team is not responsible for any losses incurred while using the platform, including smart contract vulnerabilities or market volatility.
                </li>
                <li>
                  Users are responsible for understanding the tax implications of staking rewards in their jurisdiction.
                </li>
              </ul>
            </div>
          </Card>
        </div>

        <div id="privacy" className="pt-6">
          <Card title="Privacy Policy">
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Your privacy is important to us. Here's how we handle your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                <li>
                  The TARDI Staking Platform operates on the Sui blockchain, which is public and transparent by design.
                </li>
                <li>
                  Your wallet address and transaction history are publicly visible on the blockchain.
                </li>
                <li>
                  We do not collect personal information beyond what is necessary for the platform to function.
                </li>
                <li>
                  Our website may use cookies to enhance user experience and analyze usage patterns.
                </li>
                <li>
                  We will never share or sell your data to third parties for marketing purposes.
                </li>
              </ul>
            </div>
          </Card>
        </div>

        <div id="faq" className="pt-6">
          <Card title="Frequently Asked Questions">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-2">
                  What is TARDI?
                </h3>
                <p className="text-sm text-gray-600">
                  TARDI is a meme token on the Sui blockchain inspired by tardigrades, Earth's most resilient creatures.
                  The token combines the fun aspects of meme coins with real utility through our staking platform.
                </p>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-800 mb-2">
                  How do I get TARDI tokens?
                </h3>
                <p className="text-sm text-gray-600">
                  TARDI tokens can be purchased on decentralized exchanges on the Sui blockchain.
                  Check our website or social channels for the latest trading pairs and exchange information.
                </p>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-800 mb-2">
                  Is there a minimum staking amount?
                </h3>
                <p className="text-sm text-gray-600">
                  There is no minimum amount required to stake TARDI tokens, but transaction fees on the
                  Sui blockchain apply to all staking operations. For optimal efficiency, we recommend
                  staking amounts that make the rewards worthwhile relative to gas costs.
                </p>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-800 mb-2">
                  How can I maximize my staking rewards?
                </h3>
                <p className="text-sm text-gray-600">
                  To maximize your rewards, consider staking for longer durations to access higher APY rates.
                  Additionally, enabling auto-compounding will automatically reinvest your rewards, leveraging
                  the power of compound interest to boost your returns over time.
                </p>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-800 mb-2">
                  Is the staking contract audited?
                </h3>
                <p className="text-sm text-gray-600">
                  Yes, the TARDI staking contract has undergone a comprehensive security audit by independent
                  security researchers. However, like all smart contracts, there are inherent risks involved.
                  We encourage users to do their own research and only stake amounts they're comfortable with.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default About;