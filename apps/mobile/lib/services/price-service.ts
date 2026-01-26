// Mobile price fetching service with client-side caching and rate limiting

interface PriceResponse {
  symbol: string;
  price: number;
  currency: string;
  volume?: number;
  changePercent?: number;
  changeAmount?: number;
  timestamp: string;
  source: string;
  cached: boolean;
}

interface CachedPrice {
  price: PriceResponse;
  expiresAt: number;
}

class PriceService {
  private cache: Map<string, CachedPrice> = new Map();
  private readonly CACHE_TTL_MS = 30000; // 30 seconds
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  /**
   * Get the API base URL from environment
   * Returns null if not configured (for graceful degradation)
   */
  private getApiBaseUrl(): string | null {
    // Try multiple environment variable options (in order of preference)
    const apiUrl = 
      process.env.EXPO_PUBLIC_API_URL || 
      process.env.EXPO_PUBLIC_WEB_URL ||
      process.env.EXPO_PUBLIC_APP_URL || // Fallback to app URL if API URL not set
      process.env.NEXT_PUBLIC_APP_URL;
    
    if (!apiUrl) {
      // Don't use localhost fallback - it won't work on physical devices
      return null;
    }
    
    return apiUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Get auth token from Supabase
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Rate-limited fetch with queue
   */
  private async rateLimitedFetch<T>(
    url: string,
    options: RequestInit
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          // Wait for minimum interval between requests
          const timeSinceLastRequest = Date.now() - this.lastRequestTime;
          if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            await new Promise(resolve => 
              setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
            );
          }

          const response = await fetch(url, options);
          this.lastRequestTime = Date.now();

          if (!response.ok) {
            if (response.status === 429) {
              throw new Error('Rate limit exceeded. Please wait a moment.');
            }
            throw new Error(`API error: ${response.statusText}`);
          }

          const data = await response.json();
          resolve(data as T);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process request queue one at a time
   */
  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Error processing price request:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Fetch prices for multiple symbols
   */
  async getPrices(
    symbols: string[],
    assetTypes?: string[]
  ): Promise<Map<string, PriceResponse>> {
    if (symbols.length === 0) {
      return new Map();
    }

    // Check cache first
    const cachedPrices = new Map<string, PriceResponse>();
    const uncachedSymbols: string[] = [];
    const uncachedAssetTypes: string[] = [];

    symbols.forEach((symbol, index) => {
      const cacheKey = symbol.toUpperCase();
      const cached = this.cache.get(cacheKey);
      
      if (cached && cached.expiresAt > Date.now()) {
        cachedPrices.set(cacheKey, cached.price);
      } else {
        uncachedSymbols.push(symbol);
        if (assetTypes && assetTypes[index]) {
          uncachedAssetTypes.push(assetTypes[index]);
        }
      }
    });

    // If all prices are cached, return them
    if (uncachedSymbols.length === 0) {
      return cachedPrices;
    }

    // Fetch uncached prices
    try {
      const apiBaseUrl = this.getApiBaseUrl();
      if (!apiBaseUrl) {
        // API URL not configured - return cached prices only
        console.warn('Price API not configured. Set EXPO_PUBLIC_API_URL or EXPO_PUBLIC_WEB_URL to enable real-time prices.');
        return cachedPrices;
      }

      const authToken = await this.getAuthToken();
      if (!authToken) {
        console.warn('Not authenticated - cannot fetch prices');
        return cachedPrices;
      }

      const apiUrl = `${apiBaseUrl}/api/prices`;
      
      const response = await this.rateLimitedFetch<{
        success: boolean;
        prices: PriceResponse[];
      }>(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          symbols: uncachedSymbols,
          assetTypes: uncachedAssetTypes.length > 0 ? uncachedAssetTypes : undefined,
        }),
      });

      // Cache and return prices
      const priceMap = new Map<string, PriceResponse>(cachedPrices);
      
      if (response.prices) {
        response.prices.forEach((price) => {
          const cacheKey = price.symbol.toUpperCase();
          priceMap.set(cacheKey, price);
          
          // Cache the price
          this.cache.set(cacheKey, {
            price,
            expiresAt: Date.now() + this.CACHE_TTL_MS,
          });
        });
      }

      return priceMap;
    } catch (error) {
      // Silently fail - return cached prices or empty map
      // Don't log errors in production to avoid spam
      if (__DEV__) {
        console.warn('Error fetching prices (using cached/fallback):', error instanceof Error ? error.message : error);
      }
      return cachedPrices;
    }
  }

  /**
   * Get a single price
   */
  async getPrice(symbol: string, assetType: string = 'equity'): Promise<PriceResponse | null> {
    const prices = await this.getPrices([symbol], [assetType]);
    return prices.get(symbol.toUpperCase()) || null;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (cached.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const priceService = new PriceService();

// Clean up expired cache entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    priceService.clearExpiredCache();
  }, 60000); // Every minute
}
