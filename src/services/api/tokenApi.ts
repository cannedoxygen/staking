import { ApiResponse } from '../../types/common';
import { CONTRACT, API } from '../../utils/constants';

/**
 * Token price data structure
 */
interface TokenPrice {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  updatedAt: string;
}

/**
 * Token supply data structure
 */
interface TokenSupply {
  totalSupply: number;
  circulatingSupply: number;
  burnt: number;
  staked: number;
  updatedAt: string;
}

/**
 * Token statistics data structure
 */
interface TokenStats {
  holders: number;
  transactions: number;
  updatedAt: string;
}

/**
 * Comprehensive token data structure
 */
export interface TokenData {
  price: TokenPrice;
  supply: TokenSupply;
  stats: TokenStats;
}

/**
 * Get current token price and 24h change
 * 
 * @returns Promise with token price data
 */
export const getTokenPrice = async (): Promise<ApiResponse<TokenPrice>> => {
  try {
    const response = await fetch(`${API.TOKEN_PRICE}?token=${CONTRACT.TARDI_COIN_TYPE}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch token price: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data: data
    };
  } catch (error: any) {
    console.error('Error fetching token price:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch token price'
    };
  }
};

/**
 * Get token supply information
 * 
 * @returns Promise with token supply data
 */
export const getTokenSupply = async (): Promise<ApiResponse<TokenSupply>> => {
  try {
    // In a real app, this would be an actual API call
    // For now, we'll return mock data as an example
    const mockSupply: TokenSupply = {
      totalSupply: 1000000000,
      circulatingSupply: 750000000,
      burnt: 50000000,
      staked: 200000000,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockSupply
    };
  } catch (error: any) {
    console.error('Error fetching token supply:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch token supply'
    };
  }
};

/**
 * Get token statistics
 * 
 * @returns Promise with token statistics
 */
export const getTokenStats = async (): Promise<ApiResponse<TokenStats>> => {
  try {
    // In a real app, this would be an actual API call
    // For now, we'll return mock data as an example
    const mockStats: TokenStats = {
      holders: 45682,
      transactions: 234567,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockStats
    };
  } catch (error: any) {
    console.error('Error fetching token stats:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch token stats'
    };
  }
};

/**
 * Get comprehensive token data
 * 
 * @returns Promise with all token data
 */
export const getTokenData = async (): Promise<ApiResponse<TokenData>> => {
  try {
    // Make all API calls in parallel for better performance
    const [priceResponse, supplyResponse, statsResponse] = await Promise.all([
      getTokenPrice(),
      getTokenSupply(),
      getTokenStats()
    ]);
    
    // Check if all requests were successful
    if (!priceResponse.success || !supplyResponse.success || !statsResponse.success) {
      throw new Error('One or more token data requests failed');
    }
    
    return {
      success: true,
      data: {
        price: priceResponse.data!,
        supply: supplyResponse.data!,
        stats: statsResponse.data!
      }
    };
  } catch (error: any) {
    console.error('Error fetching token data:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch token data'
    };
  }
};

/**
 * Get historical token price data
 * 
 * @param days - Number of days of historical data to fetch
 * @returns Promise with historical price data
 */
export const getTokenPriceHistory = async (days: number = 30): Promise<ApiResponse<Array<{date: string, price: number}>>> => {
  try {
    // In a real app, this would be an actual API call
    // For now, we'll generate mock data
    const historicalData = [];
    const endDate = new Date();
    const startPrice = 0.00015; // Starting price
    let currentPrice = startPrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      
      // Random price fluctuation with overall upward trend
      const change = (Math.random() - 0.4) * 0.05; // -4% to +6% daily change
      currentPrice = currentPrice * (1 + change);
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        price: currentPrice
      });
    }
    
    return {
      success: true,
      data: historicalData
    };
  } catch (error: any) {
    console.error('Error fetching token price history:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch token price history'
    };
  }
};

/**
 * Get trading pair information for the token
 * 
 * @returns Promise with trading pair data
 */
export const getTradingPairs = async (): Promise<ApiResponse<Array<{
  exchange: string;
  pair: string;
  price: number;
  volume24h: number;
  url: string;
}>>> => {
  try {
    // Mock data for trading pairs
    const mockPairs = [
      {
        exchange: 'CetusSwap',
        pair: 'TARDI/SUI',
        price: 0.00018,
        volume24h: 456789,
        url: 'https://app.cetus.zone/swap'
      },
      {
        exchange: 'Turbos Finance',
        pair: 'TARDI/USDC',
        price: 0.00017,
        volume24h: 345678,
        url: 'https://app.turbos.finance/'
      },
      {
        exchange: 'BlueMove',
        pair: 'TARDI/SUI',
        price: 0.00018,
        volume24h: 234567,
        url: 'https://app.bluemove.net/swap'
      }
    ];
    
    return {
      success: true,
      data: mockPairs
    };
  } catch (error: any) {
    console.error('Error fetching trading pairs:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch trading pairs'
    };
  }
};