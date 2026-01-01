// apps/web/lib/services/pricing/providers/finnhub-provider.ts
// Finnhub provider - free tier: 60 calls/min

import { BaseMarketDataProvider, MarketPrice, ProviderConfig } from '../base-provider';

export class FinnhubProvider extends BaseMarketDataProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    super('finnhub', {
      baseUrl: 'https://finnhub.io/api/v1',
      apiKey,
      rateLimitPerMinute: 60,
      isFree: true,
    });
    this.apiKey = apiKey;
  }

  async fetchPrice(symbol: string, assetType: string): Promise<MarketPrice> {
    if (!this.apiKey) {
      throw new Error('Finnhub API key is required');
    }

    try {
      const url = `${this.config.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`Finnhub API error: ${data.error}`);
      }

      if (!data.c) {
        throw new Error(`No price data for symbol: ${symbol}`);
      }

      const currentPrice = data.c;
      const previousClose = data.pc || currentPrice;
      const changeAmount = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (changeAmount / previousClose) * 100 : 0;

      return {
        symbol: symbol.toUpperCase(),
        price: currentPrice,
        currency: 'USD', // Finnhub free tier is USD
        changePercent,
        changeAmount,
        timestamp: new Date(data.t * 1000), // t is Unix timestamp in seconds
      };
    } catch (error) {
      throw new Error(`Finnhub fetch failed for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchBatchPrices(symbols: string[]): Promise<MarketPrice[]> {
    // Finnhub free tier doesn't support batch - fetch sequentially
    // But respect rate limits (60 calls/min = 1 call/second)
    const prices: MarketPrice[] = [];
    const delay = 1000; // 1 second between calls

    for (let i = 0; i < symbols.length; i++) {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      
      try {
        const price = await this.fetchPrice(symbols[i], 'equity');
        prices.push(price);
      } catch (error) {
        // Log error but continue with other symbols
        console.error(`Failed to fetch ${symbols[i]}:`, error);
      }
    }

    return prices;
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Test with a well-known symbol
      await this.fetchPrice('AAPL', 'equity');
      return true;
    } catch {
      return false;
    }
  }
}

