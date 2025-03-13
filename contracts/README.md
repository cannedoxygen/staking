# TARDI Staking Smart Contracts

This directory contains the Move smart contracts for the TARDI staking platform on the Sui blockchain.

## Overview

The TARDI staking platform allows users to stake TARDI tokens and earn rewards over time. The contracts implement a single-sided staking model with various lock durations and corresponding APY rates.

### Key Features

- Multiple staking durations (1 month, 3 months, 6 months, 1 year) with different APY rates
- Auto-compounding functionality
- Locked staking to reward long-term holders
- Secure design with proper testing and auditing

## Contract Structure

- `tardi_staking.move`: Main staking contract with core functionality
- `tests/staking_tests.move`: Comprehensive tests for the staking contract

## Technical Details

### Staking Model

The TARDI staking platform uses a single-sided staking model where users stake TARDI tokens to earn more TARDI. The key components include:

1. **StakePosition**: Individual staking position owned by a user
2. **StakingPool**: Central pool that holds all staked tokens and rewards
3. **AdminCap**: Capability object for administrative functions

### Staking Durations and APY

| Duration | APY    | Lock Period |
|----------|--------|-------------|
| 1 month  | 5%     | 30 days     |
| 3 months | 8%     | 90 days     |
| 6 months | 12%    | 180 days    |
| 1 year   | 20%    | 365 days    |

### Key Functions

#### User Functions

- `create_stake`: Create a new staking position
- `withdraw_stake`: Withdraw tokens after the lock period ends
- `claim_rewards`: Claim rewards without withdrawing the principal
- `compound_rewards`: Reinvest rewards to increase the staking amount
- `toggle_auto_compound`: Enable or disable auto-compounding

#### Administrative Functions

- `add_rewards`: Add tokens to the reward pool (admin only)

## Deployment

### Prerequisites

- [Sui CLI](https://docs.sui.io/build/install) installed
- [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil) set up

### Building the Contracts

```bash
# Navigate to the contracts directory
cd contracts

# Build the contract
sui move build

# Run tests
sui move test
```

### Deploying to Testnet

```bash
# Publish the package
sui client publish --gas-budget 50000000
```

Note the package ID after deployment, which will be needed for frontend integration.

### Initializing the Staking Pool

After deployment, you'll need to:

1. Create the staking pool
2. Fund it with initial rewards

This is handled automatically by the deployment script.

## Testing

The contract includes comprehensive tests covering:

- Staking functionality
- Reward calculations
- Auto-compounding logic
- Access control
- Edge cases and error conditions

Run tests with:

```bash
sui move test
```

## Security Considerations

- The contract uses the Sui resource model for secure ownership
- Tokens are held in a shared object with controlled access
- Time-based calculations use the Sui system clock
- No early withdrawal of staked tokens

## License

This code is licensed under the MIT License. See LICENSE file for details.

## Contract Address

- Package ID: `0x4cf08813756dfa7519cb480a1a1a3472b5b4ec067592a8bee0f826808d218158`
- TARDI Token: `0x4cf08813756dfa7519cb480a1a1a3472b5b4ec067592a8bee0f826808d218158::tardi::TARDI`

## Getting Help

For more information or assistance, please reach out through:
- [Website](https://tardi.org)
- [Discord](https://discord.gg/tarditoken)
- [Telegram](https://t.me/TardiToken)