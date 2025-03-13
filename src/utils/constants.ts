/**
 * Network-related constants
 */
export const NETWORK = {
    MAINNET: 'mainnet',
    TESTNET: 'testnet',
    DEVNET: 'devnet',
  };
  
  export const CURRENT_NETWORK = NETWORK.MAINNET;
  
  /**
   * Contract-related constants
   */
  export const CONTRACT = {
    PACKAGE_ID: '0x4cf08813756dfa7519cb480a1a1a3472b5b4ec067592a8bee0f826808d218158',
    MODULE_NAME: 'tardi_staking',
    STAKING_POOL_ID: '0x...', // To be updated after deployment
    TARDI_COIN_TYPE: '0x4cf08813756dfa7519cb480a1a1a3472b5b4ec067592a8bee0f826808d218158::tardi::TARDI',
    CLOCK_ID: '0x6', // Sui system clock object ID
  };
  
  /**
   * Staking durations in seconds
   */
  export const STAKING_DURATION = {
    ONE_MONTH: 2592000,   // 30 days in seconds
    THREE_MONTHS: 7776000,  // 90 days in seconds
    SIX_MONTHS: 15552000,   // 180 days in seconds
    ONE_YEAR: 31536000,     // 365 days in seconds
  };
  
  /**
   * APY rates for different staking durations
   */
  export const STAKING_APY = {
    [STAKING_DURATION.ONE_MONTH]: 5,      // 5%
    [STAKING_DURATION.THREE_MONTHS]: 8,   // 8%
    [STAKING_DURATION.SIX_MONTHS]: 12,    // 12%
    [STAKING_DURATION.ONE_YEAR]: 20,      // 20%
  };
  
  /**
   * Duration labels for display
   */
  export const DURATION_LABELS = {
    [STAKING_DURATION.ONE_MONTH]: '1 Month',
    [STAKING_DURATION.THREE_MONTHS]: '3 Months',
    [STAKING_DURATION.SIX_MONTHS]: '6 Months',
    [STAKING_DURATION.ONE_YEAR]: '1 Year',
  };
  
  /**
   * Transaction-related constants
   */
  export const TRANSACTION = {
    DEFAULT_GAS_BUDGET: 10000000, // 10M gas units
    SLIPPAGE_TOLERANCE: 3, // 3%
  };
  
  /**
   * UI-related constants
   */
  export const UI = {
    TOAST_DURATION: 5000, // 5 seconds
    THEME_COLORS: {
      PRIMARY: '#4c35e0',    // TARDI primary color
      SECONDARY: '#35b0e0',  // TARDI secondary color
      SUCCESS: '#10b981',    // Success green
      ERROR: '#ef4444',      // Error red
      WARNING: '#f59e0b',    // Warning yellow
      INFO: '#3b82f6',       // Info blue
    },
    BREAKPOINTS: {
      SM: 640,
      MD: 768,
      LG: 1024,
      XL: 1280,
    },
  };
  
  /**
   * App metadata
   */
  export const APP_META = {
    NAME: 'TARDI Staking',
    DESCRIPTION: 'Stake TARDI tokens and earn rewards',
    VERSION: '1.0.0',
    WEBSITE: 'https://tardi.org',
    SOCIAL: {
      TWITTER: 'https://twitter.com/TardiToken',
      TELEGRAM: 'https://t.me/TardiToken',
      DISCORD: 'https://discord.gg/tarditoken',
    },
  };
  
  /**
   * Local storage keys
   */
  export const STORAGE_KEYS = {
    WALLET_PROVIDER: 'tardi_wallet_provider',
    THEME: 'tardi_theme',
    LAST_CONNECTED: 'tardi_last_connected',
  };
  
  /**
   * Supported wallets
   */
  export const SUPPORTED_WALLETS = [
    { id: 'sui', name: 'Sui Wallet', icon: '/images/wallets/sui-wallet.svg' },
    { id: 'ethos', name: 'Ethos Wallet', icon: '/images/wallets/ethos-wallet.svg' },
    { id: 'suiet', name: 'Suiet Wallet', icon: '/images/wallets/suiet-wallet.svg' },
    { id: 'martian', name: 'Martian Wallet', icon: '/images/wallets/martian-wallet.svg' },
  ];
  
  /**
   * API endpoints
   */
  export const API = {
    TOKEN_PRICE: 'https://api.tardi.org/price',
    STAKING_STATS: 'https://api.tardi.org/staking/stats',
  };
  
  /**
   * Mathematical constants
   */
  export const MATH = {
    SECONDS_PER_DAY: 86400,
    SECONDS_PER_YEAR: 31536000,
    BASIS_POINTS_DENOMINATOR: 10000,
    TOKEN_DECIMALS: 9, // TARDI has 9 decimals
  };