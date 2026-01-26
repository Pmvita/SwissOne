// apps/web/lib/services/pricing-service.ts
// Internal Pricing Service - Single point of access for all market data
// This is the ONLY service that should be used by the application

import { ProviderManager } from './pricing/provider-manager';
import { MarketPrice } from './pricing/base-provider';

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
  private lastProviderRequestTime: number = 0;
  private readonly MIN_PROVIDER_REQUEST_INTERVAL = 200; // 200ms between provider requests (5 req/sec max)
  private providerRequestQueue: Array<() => Promise<void>> = [];
  private isProcessingProviderQueue = false;

  constructor() {
    this.providerManager = new ProviderManager();
  }

  /**
   * Rate-limited provider request queue
   */
  private async rateLimitedProviderRequest<T>(
    requestFn: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.providerRequestQueue.push(async () => {
        try {
          // Wait for minimum interval between provider requests
          const timeSinceLastRequest = Date.now() - this.lastProviderRequestTime;
          if (timeSinceLastRequest < this.MIN_PROVIDER_REQUEST_INTERVAL) {
            await new Promise((r) =>
              setTimeout(r, this.MIN_PROVIDER_REQUEST_INTERVAL - timeSinceLastRequest)
            );
          }

          const result = await requestFn();
          this.lastProviderRequestTime = Date.now();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processProviderQueue();
    });
  }

  /**
   * Process provider request queue one at a time
   */
  private async processProviderQueue(): Promise<void> {
    if (this.isProcessingProviderQueue || this.providerRequestQueue.length === 0) {
      return;
    }

    this.isProcessingProviderQueue = true;

    while (this.providerRequestQueue.length > 0) {
      const request = this.providerRequestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('[PricingService] Error processing provider request:', error);
        }
      }
    }

    this.isProcessingProviderQueue = false;
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

    // Fetch from provider (with automatic failover and rate limiting)
    const marketPrice = await this.rateLimitedProviderRequest(() =>
      this.providerManager.fetchPrice(request.symbol, request.assetType)
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

    // Fetch uncached prices (with rate limiting)
    if (uncachedRequests.length > 0) {
      const symbols = uncachedRequests.map((r) => r.symbol);
      
      // Batch requests to respect provider rate limits
      // Process in chunks to avoid overwhelming providers
      const BATCH_SIZE = 10; // Process 10 symbols at a time
      const marketPrices: any[] = [];
      
      for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
        const batch = symbols.slice(i, i + BATCH_SIZE);
        const batchPrices = await this.rateLimitedProviderRequest(() =>
          this.providerManager.fetchBatchPrices(batch)
        );
        marketPrices.push(...batchPrices);
        
        // Small delay between batches to respect rate limits
        if (i + BATCH_SIZE < symbols.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

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

