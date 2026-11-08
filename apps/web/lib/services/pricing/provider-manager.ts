// apps/web/lib/services/pricing/provider-manager.ts
// Manages multiple free providers with automatic failover (internal only)

import { BaseMarketDataProvider, MarketPrice, ProviderHealth } from './base-provider';
import { YahooFinanceProvider } from './providers/yahoo-finance-provider';
import { AlphaVantageProvider } from './providers/alpha-vantage-provider';
import { IEXCloudProvider } from './providers/iex-cloud-provider';
import { FinnhubProvider } from './providers/finnhub-provider';
import { getEnabledProviders } from './provider-config';

export class ProviderManager {
  private providers: BaseMarketDataProvider[] = [];
  private providerHealth: Map<string, ProviderHealth> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    const configs = getEnabledProviders();

    for (const config of configs) {
      try {
        let provider: BaseMarketDataProvider | null = null;

        switch (config.name) {
          case 'yahoo_finance':
            provider = new YahooFinanceProvider();
            break;
          case 'alpha_vantage':
            const alphaKey = process.env.ALPHA_VANTAGE_API_KEY;
            if (alphaKey) {
              provider = new AlphaVantageProvider(alphaKey);
            }
            break;
          case 'iex_cloud':
            const iexKey = process.env.IEX_CLOUD_API_KEY;
            if (iexKey) {
              provider = new IEXCloudProvider(iexKey);
            }
            break;
          case 'finnhub':
            const finnhubKey = process.env.FINNHUB_API_KEY;
            if (finnhubKey) {
              provider = new FinnhubProvider(finnhubKey);
            }
            break;
        }

        if (provider) {
          this.providers.push(provider);
          this.providerHealth.set(provider.getName(), {
            name: provider.getName(),
            isHealthy: true,
            failureCount: 0,
          });
        }
      } catch (error) {
        console.error(`Failed to initialize provider ${config.name}:`, error);
      }
    }
  }

  /**
   * Fetch price with automatic failover between providers
   */
  async fetchPrice(symbol: string, assetType: string): Promise<MarketPrice> {
    const errors: Error[] = [];

    for (const provider of this.providers) {
      try {
        const price = await provider.fetchPrice(symbol, assetType);
        
        // Mark provider as healthy
        this.updateProviderHealth(provider.getName(), true);
        
        return price;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
        this.updateProviderHealth(provider.getName(), false);
        // Continue to next provider
      }
    }

    // All providers failed
    throw new Error(
      `All providers failed to fetch price for ${symbol}: ${errors.map((e) => e.message).join('; ')}`
    );
  }

  /**
   * Fetch batch prices with automatic failover
   */
  async fetchBatchPrices(symbols: string[]): Promise<MarketPrice[]> {
    const errors: Error[] = [];

    for (const provider of this.providers) {
      try {
        const prices = await provider.fetchBatchPrices(symbols);
        
        // Mark provider as healthy
        this.updateProviderHealth(provider.getName(), true);
        
        return prices;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
        this.updateProviderHealth(provider.getName(), false);
        // Continue to next provider
      }
    }

    // All providers failed - try individual fetches as fallback
    const prices: MarketPrice[] = [];
    for (const symbol of symbols) {
      try {
        const price = await this.fetchPrice(symbol, 'equity');
        prices.push(price);
      } catch (error) {
        console.error(`Failed to fetch ${symbol} from all providers`);
      }
    }

    return prices;
  }

  /**
   * Get active provider for a symbol (first healthy provider)
   */
  getActiveProvider(symbol: string): BaseMarketDataProvider | null {
    for (const provider of this.providers) {
      const health = this.providerHealth.get(provider.getName());
      if (health?.isHealthy) {
        return provider;
      }
    }
    return this.providers[0] || null; // Return first provider even if unhealthy
  }

  /**
   * Health check all providers
   */
  async checkProviderHealth(): Promise<ProviderHealth[]> {
    const healthChecks: Promise<void>[] = [];

    for (const provider of this.providers) {
      healthChecks.push(
        provider
          .isHealthy()
          .then((isHealthy) => {
            this.updateProviderHealth(provider.getName(), isHealthy);
          })
          .catch(() => {
            this.updateProviderHealth(provider.getName(), false);
          })
      );
    }

    await Promise.all(healthChecks);

    return Array.from(this.providerHealth.values());
  }

  /**
   * Update provider health status
   */
  private updateProviderHealth(name: string, isHealthy: boolean): void {
    const health = this.providerHealth.get(name) || {
      name,
      isHealthy: true,
      failureCount: 0,
    };

    if (isHealthy) {
      health.isHealthy = true;
      health.lastSuccess = new Date();
      health.failureCount = 0;
    } else {
      health.failureCount += 1;
      health.lastFailure = new Date();
      
      // Mark as unhealthy after 3 consecutive failures
      if (health.failureCount >= 3) {
        health.isHealthy = false;
      }
    }

    this.providerHealth.set(name, health);
  }
}

