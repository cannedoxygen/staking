module tardi::tardi_staking {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::clock::{Self, Clock};
    use tardi::tardi::{TARDI};
    use std::string::{String};
    use std::vector;

    // ======== Constants ========

    // Staking durations in days
    const STAKING_DURATION_30_DAYS: u64 = 2592000; // 30 days in seconds
    const STAKING_DURATION_90_DAYS: u64 = 7776000; // 90 days in seconds
    const STAKING_DURATION_180_DAYS: u64 = 15552000; // 180 days in seconds
    const STAKING_DURATION_365_DAYS: u64 = 31536000; // 365 days in seconds

    // APY rates (basis points: 100 = 1%)
    const APY_30_DAYS: u64 = 500; // 5%
    const APY_90_DAYS: u64 = 800; // 8%
    const APY_180_DAYS: u64 = 1200; // 12%
    const APY_365_DAYS: u64 = 2000; // 20%

    // Scaling factor for calculations
    const SECONDS_PER_YEAR: u64 = 31536000; // 365 days in seconds
    const BASIS_POINTS_DENOMINATOR: u64 = 10000; // 100% in basis points

    // Error codes
    const E_INSUFFICIENT_BALANCE: u64 = 0;
    const E_INVALID_DURATION: u64 = 1;
    const E_NOT_OWNER: u64 = 2;
    const E_STAKE_STILL_LOCKED: u64 = 3;
    const E_INVALID_AMOUNT: u64 = 4;
    const E_ZERO_REWARD: u64 = 5;

    // ======== Structs ========

    /// Represents a staking position owned by a user
    struct StakePosition has key, store {
        id: UID,
        owner: address,
        amount: u64,
        start_time: u64,
        lock_duration: u64,
        end_time: u64,
        reward_rate: u64,
        auto_compound: bool,
        last_compound_time: u64,
    }

    /// Represents the central staking pool that holds all staked tokens
    struct StakingPool has key {
        id: UID,
        staked_balance: Balance<TARDI>,
        reward_balance: Balance<TARDI>,
        total_staked: u64,
        total_stakes_count: u64,
    }

    /// Capability for the staking admin (for managing rewards)
    struct AdminCap has key {
        id: UID,
    }

    // ======== Events ========

    struct StakeCreated has copy, drop {
        stake_id: ID,
        owner: address,
        amount: u64,
        lock_duration: u64,
        reward_rate: u64,
        auto_compound: bool,
    }

    struct RewardClaimed has copy, drop {
        stake_id: ID,
        owner: address,
        reward_amount: u64,
    }

    struct StakeWithdrawn has copy, drop {
        stake_id: ID,
        owner: address,
        amount: u64,
    }

    struct RewardCompounded has copy, drop {
        stake_id: ID,
        owner: address,
        compound_amount: u64,
    }

    // ======== Init Function ========

    /// Initialize the staking module
    fun init(ctx: &mut TxContext) {
        // Create the staking pool
        let staking_pool = StakingPool {
            id: object::new(ctx),
            staked_balance: balance::zero<TARDI>(),
            reward_balance: balance::zero<TARDI>(),
            total_staked: 0,
            total_stakes_count: 0,
        };

        // Create the admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };

        // Transfer the staking pool to a shared object
        transfer::share_object(staking_pool);
        
        // Transfer the admin cap to the deployer
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // ======== Public Functions ========

    /// Create a new stake
    public entry fun create_stake(
        pool: &mut StakingPool,
        tokens: Coin<TARDI>,
        lock_duration: u64,
        auto_compound: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&tokens);
        assert!(amount > 0, E_INVALID_AMOUNT);

        // Validate duration and determine reward rate
        let reward_rate = get_reward_rate(lock_duration);
        assert!(reward_rate > 0, E_INVALID_DURATION);

        // Get current timestamp
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        
        // Calculate end time
        let end_time = current_time + lock_duration;

        // Create stake position
        let stake = StakePosition {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            amount,
            start_time: current_time,
            lock_duration,
            end_time,
            reward_rate,
            auto_compound,
            last_compound_time: current_time,
        };

        // Update staking pool
        let token_balance = coin::into_balance(tokens);
        balance::join(&mut pool.staked_balance, token_balance);
        pool.total_staked = pool.total_staked + amount;
        pool.total_stakes_count = pool.total_stakes_count + 1;

        // Emit stake created event
        event::emit(StakeCreated {
            stake_id: object::id(&stake),
            owner: tx_context::sender(ctx),
            amount,
            lock_duration,
            reward_rate,
            auto_compound,
        });

        // Transfer stake to user
        transfer::transfer(stake, tx_context::sender(ctx));
    }

    /// Withdraw a stake after lock period ends
    public entry fun withdraw_stake(
        pool: &mut StakingPool,
        stake: StakePosition,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(stake.owner == tx_context::sender(ctx), E_NOT_OWNER);

        // Verify lock period has ended
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        assert!(current_time >= stake.end_time, E_STAKE_STILL_LOCKED);

        // Calculate rewards
        let reward_amount = calculate_rewards(&stake, current_time);
        
        // Extract staked amount
        let amount = stake.amount;
        
        // Update staking pool
        pool.total_staked = pool.total_staked - amount;
        pool.total_stakes_count = pool.total_stakes_count - 1;
        
        // Transfer tokens back to user
        let staked_coins = coin::from_balance(balance::split(&mut pool.staked_balance, amount), ctx);
        transfer::public_transfer(staked_coins, tx_context::sender(ctx));
        
        // Transfer rewards if available
        if (reward_amount > 0) {
            // Make sure we have enough in the reward balance
            let available_rewards = balance::value(&pool.reward_balance);
            let real_reward = if (reward_amount > available_rewards) {
                available_rewards
            } else {
                reward_amount
            };
            
            if (real_reward > 0) {
                let reward_coins = coin::from_balance(balance::split(&mut pool.reward_balance, real_reward), ctx);
                transfer::public_transfer(reward_coins, tx_context::sender(ctx));
                
                // Emit reward claimed event
                event::emit(RewardClaimed {
                    stake_id: object::id(&stake),
                    owner: tx_context::sender(ctx),
                    reward_amount: real_reward,
                });
            };
        };
        
        // Emit stake withdrawn event
        event::emit(StakeWithdrawn {
            stake_id: object::id(&stake),
            owner: tx_context::sender(ctx),
            amount,
        });
        
        // Delete the stake
        let StakePosition { id, owner: _, amount: _, start_time: _, lock_duration: _, end_time: _, reward_rate: _, auto_compound: _, last_compound_time: _ } = stake;
        object::delete(id);
    }

    /// Claim rewards without withdrawing the stake
    public entry fun claim_rewards(
        pool: &mut StakingPool,
        stake: &mut StakePosition,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(stake.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        // Calculate rewards
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        let reward_amount = calculate_rewards(stake, current_time);
        assert!(reward_amount > 0, E_ZERO_REWARD);
        
        // Make sure we have enough in the reward balance
        let available_rewards = balance::value(&pool.reward_balance);
        let real_reward = if (reward_amount > available_rewards) {
            available_rewards
        } else {
            reward_amount
        };
        
        assert!(real_reward > 0, E_ZERO_REWARD);
        
        // Update last compound time (since we're resetting the reward calculation)
        stake.last_compound_time = current_time;
        
        // Transfer rewards to user
        let reward_coins = coin::from_balance(balance::split(&mut pool.reward_balance, real_reward), ctx);
        transfer::public_transfer(reward_coins, tx_context::sender(ctx));
        
        // Emit reward claimed event
        event::emit(RewardClaimed {
            stake_id: object::id(stake),
            owner: tx_context::sender(ctx),
            reward_amount: real_reward,
        });
    }

    /// Compound rewards into the stake
    public entry fun compound_rewards(
        pool: &mut StakingPool,
        stake: &mut StakePosition,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(stake.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        // Calculate rewards
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        let reward_amount = calculate_rewards(stake, current_time);
        assert!(reward_amount > 0, E_ZERO_REWARD);
        
        // Make sure we have enough in the reward balance
        let available_rewards = balance::value(&pool.reward_balance);
        let real_reward = if (reward_amount > available_rewards) {
            available_rewards
        } else {
            reward_amount
        };
        
        assert!(real_reward > 0, E_ZERO_REWARD);
        
        // Add rewards to the stake amount
        stake.amount = stake.amount + real_reward;
        
        // Update last compound time
        stake.last_compound_time = current_time;
        
        // Update pool staked balance
        balance::join(&mut pool.staked_balance, balance::split(&mut pool.reward_balance, real_reward));
        pool.total_staked = pool.total_staked + real_reward;
        
        // Emit reward compounded event
        event::emit(RewardCompounded {
            stake_id: object::id(stake),
            owner: tx_context::sender(ctx),
            compound_amount: real_reward,
        });
    }

    /// Toggle auto-compound setting
    public entry fun toggle_auto_compound(
        stake: &mut StakePosition,
        auto_compound: bool,
        ctx: &mut TxContext
    ) {
        // Verify ownership
        assert!(stake.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        // Update auto-compound flag
        stake.auto_compound = auto_compound;
    }

    /// Add rewards to the staking pool (admin only)
    public entry fun add_rewards(
        pool: &mut StakingPool,
        _admin_cap: &AdminCap,
        rewards: Coin<TARDI>,
        ctx: &mut TxContext
    ) {
        let reward_balance = coin::into_balance(rewards);
        balance::join(&mut pool.reward_balance, reward_balance);
    }

    // ======== View Functions ========

    /// Get the reward rate for a given duration
    public fun get_reward_rate(lock_duration: u64): u64 {
        if (lock_duration == STAKING_DURATION_30_DAYS) {
            return APY_30_DAYS
        } else if (lock_duration == STAKING_DURATION_90_DAYS) {
            return APY_90_DAYS
        } else if (lock_duration == STAKING_DURATION_180_DAYS) {
            return APY_180_DAYS
        } else if (lock_duration == STAKING_DURATION_365_DAYS) {
            return APY_365_DAYS
        } else {
            return 0
        }
    }

    /// Calculate rewards for a stake
    public fun calculate_rewards(stake: &StakePosition, current_time: u64): u64 {
        // Ensure we don't calculate beyond end time
        let calculation_time = if (current_time > stake.end_time) {
            stake.end_time
        } else {
            current_time
        };
        
        // Calculate time elapsed since last compound
        let time_elapsed = calculation_time - stake.last_compound_time;
        
        // Calculate rewards using APY formula:
        // rewards = (staked_amount * reward_rate * time_elapsed) / (BASIS_POINTS_DENOMINATOR * SECONDS_PER_YEAR)
        let rewards = (stake.amount as u128) * (stake.reward_rate as u128) * (time_elapsed as u128);
        rewards = rewards / ((BASIS_POINTS_DENOMINATOR as u128) * (SECONDS_PER_YEAR as u128));
        
        (rewards as u64)
    }

    /// Get stake details
    public fun get_stake_details(stake: &StakePosition): (address, u64, u64, u64, u64, bool) {
        (
            stake.owner,
            stake.amount,
            stake.start_time,
            stake.lock_duration,
            stake.end_time,
            stake.auto_compound
        )
    }

    /// Get pool details
    public fun get_pool_details(pool: &StakingPool): (u64, u64, u64) {
        (
            balance::value(&pool.staked_balance),
            balance::value(&pool.reward_balance),
            pool.total_stakes_count
        )
    }
}