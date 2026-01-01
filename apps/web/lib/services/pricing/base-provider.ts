// apps/web/lib/services/pricing/base-provider.ts
// Base interface for all free market data providers (internal implementation detail)

export interface MarketPrice {
  symbol: string;
  price: number;
  currency: string;
  volume?: number;
  changePercent?: number;
  changeAmount?: number;
  timestamp: Date;
}

export interface ProviderConfig {
  apiKey?: string; // Optional - some free APIs don't need keys
  baseUrl: string;
  rateLimitPerMinute?: number;
  rateLimitPerDay?: number;
  isFree: boolean; // Must be true for all providers
}

export interface ProviderHealth {
  name: string;
  isHealthy: boolean;
  lastSuccess?: Date;
  lastFailure?: Date;
  failureCount: number;
}

export abstract class BaseMarketDataProvider {
  protected config: ProviderConfig;
  protected name: string;
  
  constructor(name: string, config: ProviderConfig) {
    this.name = name;
    this.config = {
      ...config,
      isFree: true, // Enforce free-only providers
    };
  }
  
  /**
   * Fetch a single price for a symbol
   */
  abstract fetchPrice(symbol: string, assetType: string): Promise<MarketPrice>;
  
  /**
   * Fetch prices for multiple symbols (batch operation)
   */
  abstract fetchBatchPrices(symbols: string[]): Promise<MarketPrice[]>;
  
  /**
   * Check if the provider is healthy and available
   */
  abstract isHealthy(): Promise<boolean>;
  
  /**
   * Must return true - all providers must be free
   */
  isFree(): boolean {
    return true;
  }
  
  /**
   * Get provider name
   */
  getName(): string {
    return this.name;
  }
  
  /**
   * Get rate limit information
   */
  getRateLimits(): { perMinute?: number; perDay?: number } {
    return {
      perMinute: this.config.rateLimitPerMinute,
      perDay: this.config.rateLimitPerDay,
    };
  }
}

