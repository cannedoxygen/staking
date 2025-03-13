/**
 * Validate a token amount input
 * 
 * @param amount - The amount to validate as a string
 * @param balance - User's available balance as a string
 * @param minAmount - Minimum allowed amount (default: 0)
 * @returns True if valid, false otherwise
 */
export const validateAmount = (
    amount: string,
    balance: string,
    minAmount: number = 0
  ): boolean => {
    // Check if amount is a valid number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return false;
    
    // Check if amount is at least the minimum
    if (numAmount < minAmount) return false;
    
    // Check if amount is not negative
    if (numAmount <= 0) return false;
    
    // Check if user has enough balance
    const numBalance = parseFloat(balance);
    if (numAmount > numBalance) return false;
    
    return true;
  };
  
  /**
   * Validate a wallet address format
   * 
   * @param address - The wallet address to validate
   * @returns True if valid, false otherwise
   */
  export const validateAddress = (address: string): boolean => {
    // Check if address is empty
    if (!address || address.trim() === '') return false;
    
    // Check if address has the correct Sui format (0x followed by 64 hex characters)
    const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/;
    return suiAddressRegex.test(address);
  };
  
  /**
   * Validate a staking duration value
   * 
   * @param duration - The duration in seconds
   * @param allowedDurations - Array of allowed durations
   * @returns True if valid, false otherwise
   */
  export const validateDuration = (
    duration: number,
    allowedDurations: number[]
  ): boolean => {
    return allowedDurations.includes(duration);
  };
  
  /**
   * Validate if a token amount is within slippage tolerance
   * 
   * @param expectedAmount - Expected amount
   * @param actualAmount - Actual amount received
   * @param slippageTolerance - Tolerance percentage (e.g., 3 for 3%)
   * @returns True if within tolerance, false otherwise
   */
  export const validateSlippage = (
    expectedAmount: number,
    actualAmount: number,
    slippageTolerance: number
  ): boolean => {
    const minAcceptable = expectedAmount * (1 - slippageTolerance / 100);
    return actualAmount >= minAcceptable;
  };
  
  /**
   * Validate numeric input for forms
   * 
   * @param input - The input string to validate
   * @param allowDecimals - Whether to allow decimal points (default: true)
   * @param maxDecimals - Maximum number of decimal places (default: 9)
   * @returns True if valid, false otherwise
   */
  export const validateNumericInput = (
    input: string,
    allowDecimals: boolean = true,
    maxDecimals: number = 9
  ): boolean => {
    // Allow empty input for clearing the field
    if (input === '') return true;
    
    // Basic numeric check
    if (allowDecimals) {
      // Regex for numbers with optional decimal part
      const regex = new RegExp(`^\\d*(\\.\\d{0,${maxDecimals}})?$`);
      return regex.test(input);
    } else {
      // Only allow integers
      return /^\d+$/.test(input);
    }
  };
  
  /**
   * Validate that a transaction won't exceed max gas budget
   * 
   * @param estimatedGas - Estimated gas for the transaction
   * @param maxGasBudget - Maximum allowed gas budget
   * @param safetyFactor - Safety multiplier for gas estimate (default: 1.5)
   * @returns True if gas is within budget, false otherwise
   */
  export const validateGasBudget = (
    estimatedGas: number,
    maxGasBudget: number,
    safetyFactor: number = 1.5
  ): boolean => {
    const adjustedEstimate = estimatedGas * safetyFactor;
    return adjustedEstimate <= maxGasBudget;
  };
  
  /**
   * Validate if a stake is ready to withdraw (unlocked)
   * 
   * @param endTime - The stake end time (in seconds since epoch)
   * @returns True if unlocked, false otherwise
   */
  export const validateStakeUnlocked = (endTime: number): boolean => {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return currentTime >= endTime;
  };
  
  /**
   * Validates that a staking transaction meets minimum requirements
   * 
   * @param amount - Amount to stake
   * @param duration - Staking duration in seconds
   * @param balance - User's available balance
   * @param minimumStake - Minimum stake amount
   * @param allowedDurations - Array of allowed durations
   * @returns Object with validation result and error message if invalid
   */
  export const validateStakingTransaction = (
    amount: string,
    duration: number,
    balance: string,
    minimumStake: number = 1,
    allowedDurations: number[]
  ): { valid: boolean; errorMessage?: string } => {
    // Check amount
    if (!validateAmount(amount, balance, minimumStake)) {
      if (parseFloat(amount) < minimumStake) {
        return {
          valid: false,
          errorMessage: `Minimum stake amount is ${minimumStake} TARDI`
        };
      }
      if (parseFloat(amount) > parseFloat(balance)) {
        return {
          valid: false,
          errorMessage: 'Insufficient balance'
        };
      }
      return {
        valid: false,
        errorMessage: 'Invalid amount'
      };
    }
    
    // Check duration
    if (!validateDuration(duration, allowedDurations)) {
      return {
        valid: false,
        errorMessage: 'Invalid staking duration'
      };
    }
    
    return { valid: true };
  };
  
  /**
   * Validate an email address format
   * 
   * @param email - Email address to validate
   * @returns True if valid, false otherwise
   */
  export const validateEmail = (email: string): boolean => {
    // Basic email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate password strength
   * 
   * @param password - Password to validate
   * @param minLength - Minimum password length (default: 8)
   * @param requireSpecial - Whether to require special characters (default: true)
   * @returns Object with validation result and feedback
   */
  export const validatePassword = (
    password: string,
    minLength: number = 8,
    requireSpecial: boolean = true
  ): { valid: boolean; feedback: string } => {
    if (!password || password.length < minLength) {
      return {
        valid: false,
        feedback: `Password must be at least ${minLength} characters`
      };
    }
    
    // Check for at least one number
    if (!/\d/.test(password)) {
      return {
        valid: false,
        feedback: 'Password must contain at least one number'
      };
    }
    
    // Check for uppercase and lowercase
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      return {
        valid: false,
        feedback: 'Password must contain both uppercase and lowercase letters'
      };
    }
    
    // Check for special characters if required
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        valid: false,
        feedback: 'Password must contain at least one special character'
      };
    }
    
    return {
      valid: true,
      feedback: 'Password is strong'
    };
  };
  
  /**
   * Validate form input against maximum length
   * 
   * @param input - Input string to validate
   * @param maxLength - Maximum allowed length
   * @returns True if valid, false otherwise
   */
  export const validateMaxLength = (
    input: string,
    maxLength: number
  ): boolean => {
    return input.length <= maxLength;
  };
  
  /**
   * Validate form input against minimum length
   * 
   * @param input - Input string to validate
   * @param minLength - Minimum allowed length
   * @returns True if valid, false otherwise
   */
  export const validateMinLength = (
    input: string,
    minLength: number
  ): boolean => {
    return input.length >= minLength;
  };
  
  /**
   * Validate if a string contains only alphanumeric characters
   * 
   * @param input - Input string to validate
   * @param allowSpaces - Whether to allow spaces (default: false)
   * @returns True if valid, false otherwise
   */
  export const validateAlphanumeric = (
    input: string,
    allowSpaces: boolean = false
  ): boolean => {
    if (allowSpaces) {
      return /^[a-zA-Z0-9\s]*$/.test(input);
    }
    return /^[a-zA-Z0-9]*$/.test(input);
  };
  
  /**
   * Validate if a value is within a specified range
   * 
   * @param value - Value to validate
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   * @returns True if valid, false otherwise
   */
  export const validateRange = (
    value: number,
    min: number,
    max: number
  ): boolean => {
    return value >= min && value <= max;
  };