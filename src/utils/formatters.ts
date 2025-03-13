import { MATH } from './constants';

/**
 * Format a token amount with proper decimals
 * 
 * @param amount - The amount to format (string or number)
 * @param decimals - Number of decimal places to show (default: 6)
 * @param abbreviate - Whether to abbreviate large numbers (default: false)
 * @returns Formatted amount as a string
 */
export const formatTokenAmount = (
  amount: string | number,
  decimals: number = 6,
  abbreviate: boolean = false
): string => {
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN or undefined
  if (isNaN(numAmount)) return '0';
  
  // For zero or very small amounts
  if (numAmount === 0 || Math.abs(numAmount) < 1e-9) return '0';
  
  // For abbreviating large numbers
  if (abbreviate && numAmount >= 1000000) {
    if (numAmount >= 1000000000) {
      // Billions
      return `${(numAmount / 1000000000).toFixed(2)}B`;
    } else {
      // Millions
      return `${(numAmount / 1000000).toFixed(2)}M`;
    }
  }
  
  // Regular formatting
  return numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a date as a human-readable string
 * 
 * @param timestamp - Date timestamp (in milliseconds)
 * @param includeTime - Whether to include the time (default: false)
 * @returns Formatted date string
 */
export const formatDate = (
  timestamp: number,
  includeTime: boolean = false
): string => {
  const date = new Date(timestamp);
  
  try {
    if (includeTime) {
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  } catch (error) {
    // Fallback if locale formatting fails
    return date.toISOString().split('T')[0];
  }
};

/**
 * Format a time duration in a human-readable format
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(seconds / 86400);
  return `${days} day${days !== 1 ? 's' : ''}`;
};

/**
 * Format a time duration as days, hours, minutes
 * 
 * @param seconds - Duration in seconds
 * @returns Object with days, hours, minutes components
 */
export const formatTimeComponents = (
  seconds: number
): { days: number; hours: number; minutes: number; seconds: number } => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return { days, hours, minutes, seconds: remainingSeconds };
};

/**
 * Format a wallet address by shortening it
 * 
 * @param address - The full wallet address
 * @param prefixLength - Number of characters to keep at the start (default: 6)
 * @param suffixLength - Number of characters to keep at the end (default: 4)
 * @returns Shortened address string
 */
export const formatAddress = (
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string => {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};

/**
 * Format a percentage value
 * 
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | string,
  decimals: number = 2
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Format a balance in MIST to token amount
 * 
 * @param mistBalance - Balance in MIST (smallest unit)
 * @param decimals - Token decimals (default: MATH.TOKEN_DECIMALS)
 * @returns Formatted token amount
 */
export const formatBalanceFromMist = (
  mistBalance: string | number,
  decimals: number = MATH.TOKEN_DECIMALS
): string => {
  const balance = typeof mistBalance === 'string' 
    ? BigInt(mistBalance) 
    : BigInt(Math.floor(mistBalance));
  
  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = balance / divisor;
  const fractionalPart = balance % divisor;
  
  // Format fractional part with leading zeros
  let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  // Trim trailing zeros
  fractionalStr = fractionalStr.replace(/0+$/, '');
  
  if (fractionalStr === '') {
    return integerPart.toString();
  }
  
  return `${integerPart}.${fractionalStr}`;
};

/**
 * Format a number with appropriate suffixes for readability
 * 
 * @param num - The number to format
 * @returns Formatted number with suffix
 */
export const formatNumberWithSuffix = (num: number): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format APY as a string with percentage
 * 
 * @param apy - APY value (e.g. 5 for 5%)
 * @returns Formatted APY string
 */
export const formatAPY = (apy: number): string => {
  if (apy >= 100) {
    return `${Math.floor(apy)}%`;
  }
  return `${apy.toFixed(1)}%`;
};

/**
 * Format a gas value from MIST to SUI
 * 
 * @param gas - Gas value in MIST
 * @returns Formatted gas value in SUI
 */
export const formatGas = (gas: string | number): string => {
  const gasValue = typeof gas === 'string' ? parseFloat(gas) : gas;
  // Convert from MIST to SUI (9 decimals)
  const suiValue = gasValue / 1e9;
  
  if (suiValue < 0.001) {
    return `${(suiValue * 1e6).toFixed(2)} µSUI`;
  }
  
  return `${suiValue.toFixed(6)} SUI`;
};

/**
 * Format a number as currency (USD)
 * 
 * @param value - The value to format
 * @param minimumFractionDigits - Minimum fraction digits (default: 2)
 * @param maximumFractionDigits - Maximum fraction digits (default: 2)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | string,
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 2
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(numValue);
};

/**
 * Format a timestamp to relative time (e.g., "2 hours ago")
 * 
 * @param timestamp - Timestamp in milliseconds or seconds
 * @param inSeconds - Whether the timestamp is in seconds (default: false)
 * @returns Relative time string
 */
export const formatRelativeTime = (
  timestamp: number,
  inSeconds: boolean = false
): string => {
  // Convert to milliseconds if in seconds
  const msTimestamp = inSeconds ? timestamp * 1000 : timestamp;
  const now = Date.now();
  const diffMs = now - msTimestamp;
  
  // Handle future times
  if (diffMs < 0) {
    return 'in the future';
  }
  
  // Convert to seconds
  const diffSeconds = Math.floor(diffMs / 1000);
  
  if (diffSeconds < 60) {
    return diffSeconds === 1 ? '1 second ago' : `${diffSeconds} seconds ago`;
  }
  
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  }
  
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
};

/**
 * Format a number to have a fixed number of decimal places without trailing zeros
 * 
 * @param value - Number to format
 * @param maxDecimals - Maximum number of decimal places
 * @returns Formatted number string
 */
export const formatDecimal = (
  value: number | string,
  maxDecimals: number = 6
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  // Convert to string with fixed decimals
  const fixed = numValue.toFixed(maxDecimals);
  
  // Remove trailing zeros after decimal point
  return fixed.replace(/\.?0+$/, '');
};