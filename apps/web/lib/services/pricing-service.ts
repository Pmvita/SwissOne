// apps/web/lib/services/pricing-service.ts
// Internal Pricing Service - Single point of access for all market data
// This is the ONLY service that should be used by the application

import { ProviderManager } from './services/pricing/provider-manager';
import { MarketPrice } from './services/pricing/base-provider';

export interface PriceRequest {
  symbol: string;
  assetType: 'equity' | 'etf' | 'bond' | 'money_market' | 'cash';
}

export interface PriceResponse {
  symbol: string;
  price: number;
  currency: string;
  volume?: number;
  changePercent?: number;
  changeAmount?: number;
  timestamp: Date;
  source: string; // Provider name for logging
  cached: boolean;
}

// In-memory cache for prices (30 second TTL)
interface CachedPrice {
  price: PriceResponse;
  expiresAt: number;
}

export class PricingService {
  private providerManager: ProviderManager;
  private cache: Map<string, CachedPrice> = new Map();
  private readonly CACHE_TTL_MS = 30000; // 30 seconds

  constructor() {
    this.providerManager = new ProviderManager();
  }

  /**
   * Get a single price - provider is completely abstracted
   */
  async getPrice(request: PriceRequest): Promise<PriceResponse> {
    const cacheKey = `${request.symbol}_${request.assetType}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { ...cached.price, cached: true };
    }

    // Fetch from provider (with automatic failover)
    const marketPrice = await this.providerManager.fetchPrice(
      request.symbol,
      request.assetType
    );

    const response: PriceResponse = {
      symbol: marketPrice.symbol,
      price: marketPrice.price,
      currency: marketPrice.currency,
      volume: marketPrice.volume,
      changePercent: marketPrice.changePercent,
      changeAmount: marketPrice.changeAmount,
      timestamp: marketPrice.timestamp,
      source: 'provider', // Will be set by provider manager
      cached: false,
    };

    // Cache the result
    this.cache.set(cacheKey, {
      price: response,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });

    return response;
  }

  /**
   * Get prices for multiple symbols - provider is completely abstracted
   */
  async getPrices(requests: PriceRequest[]): Promise<PriceResponse[]> {
    const responses: PriceResponse[] = [];
    const uncachedRequests: PriceRequest[] = [];

    // Check cache for each request
    for (const request of requests) {
      const cacheKey = `${request.symbol}_${request.assetType}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && cached.expiresAt > Date.now()) {
        responses.push({ ...cached.price, cached: true });
      } else {
        uncachedRequests.push(request);
      }
    }

    // Fetch uncached prices
    if (uncachedRequests.length > 0) {
      const symbols = uncachedRequests.map((r) => r.symbol);
      const marketPrices = await this.providerManager.fetchBatchPrices(symbols);

      for (let i = 0; i < uncachedRequests.length; i++) {
        const request = uncachedRequests[i];
        const marketPrice = marketPrices.find((p) => p.symbol === request.symbol.toUpperCase());

        if (marketPrice) {
          const response: PriceResponse = {
            symbol: marketPrice.symbol,
            price: marketPrice.price,
            currency: marketPrice.currency,
            volume: marketPrice.volume,
            changePercent: marketPrice.changePercent,
            changeAmount: marketPrice.changeAmount,
            timestamp: marketPrice.timestamp,
            source: 'provider',
            cached: false,
          };

          // Cache the result
          const cacheKey = `${request.symbol}_${request.assetType}`;
          this.cache.set(cacheKey, {
            price: response,
            expiresAt: Date.now() + this.CACHE_TTL_MS,
          });

          responses.push(response);
        }
      }
    }

    return responses;
  }

  /**
   * Refresh prices for all holdings (used by background job)
   */
  async refreshHoldingsPrices(): Promise<void> {
    // This will be implemented by PriceFetchingService
    // This method exists for the interface
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get provider health status (for monitoring)
   */
  async getProviderHealth() {
    return this.providerManager.checkProviderHealth();
  }
}

