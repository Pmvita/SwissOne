// apps/web/lib/services/pricing/providers/alpha-vantage-provider.ts
// Alpha Vantage provider - free tier: 5 calls/min, 500/day

import { BaseMarketDataProvider, MarketPrice, ProviderConfig } from '../base-provider';

export class AlphaVantageProvider extends BaseMarketDataProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    super('alpha_vantage', {
      baseUrl: 'https://www.alphavantage.co/query',
      apiKey,
      rateLimitPerMinute: 5,
      rateLimitPerDay: 500,
      isFree: true,
    });
    this.apiKey = apiKey;
  }

  async fetchPrice(symbol: string, assetType: string): Promise<MarketPrice> {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key is required');
    }

    try {
      const url = `${this.config.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }

      const data = await response.json();

      // Check for API limit message
      if (data['Note'] || data['Information']) {
        throw new Error('Alpha Vantage API rate limit exceeded');
      }

      if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
        throw new Error(`No price data for symbol: ${symbol}`);
      }

      const quote = data['Global Quote'];
      const price = parseFloat(quote['05. price']);
      const previousClose = parseFloat(quote['08. previous close']);
      const changeAmount = price - previousClose;
      const changePercent = previousClose > 0 ? (changeAmount / previousClose) * 100 : 0;

      return {
        symbol: symbol.toUpperCase(),
        price,
        currency: 'USD', // Alpha Vantage free tier is USD only
        volume: quote['06. volume'] ? parseInt(quote['06. volume']) : undefined,
        changePercent,
        changeAmount,
        timestamp: new Date(quote['07. latest trading day'] || new Date()),
      };
    } catch (error) {
      throw new Error(`Alpha Vantage fetch failed for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchBatchPrices(symbols: string[]): Promise<MarketPrice[]> {
    // Alpha Vantage free tier doesn't support batch - fetch sequentially
    // But respect rate limits (5 calls/min)
    const prices: MarketPrice[] = [];
    const delay = 12000; // 12 seconds between calls to stay under 5/min limit

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

