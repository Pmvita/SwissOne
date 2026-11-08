// apps/web/lib/services/pricing/providers/iex-cloud-provider.ts
// IEX Cloud provider - free tier: 50,000 messages/month

import { BaseMarketDataProvider, MarketPrice, ProviderConfig } from '../base-provider';

export class IEXCloudProvider extends BaseMarketDataProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    super('iex_cloud', {
      baseUrl: 'https://cloud.iexapis.com/stable',
      apiKey,
      rateLimitPerMinute: 60, // Approximate
      isFree: true,
    });
    this.apiKey = apiKey;
  }

  async fetchPrice(symbol: string, assetType: string): Promise<MarketPrice> {
    if (!this.apiKey) {
      throw new Error('IEX Cloud API key is required');
    }

    try {
      const url = `${this.config.baseUrl}/stock/${symbol}/quote?token=${this.apiKey}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('IEX Cloud API limit exceeded');
        }
        throw new Error(`IEX Cloud API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.latestPrice) {
        throw new Error(`No price data for symbol: ${symbol}`);
      }

      const changeAmount = data.change || 0;
      const changePercent = data.changePercent ? data.changePercent * 100 : 0;

      return {
        symbol: symbol.toUpperCase(),
        price: data.latestPrice,
        currency: data.currency || 'USD',
        volume: data.latestVolume,
        changePercent,
        changeAmount,
        timestamp: new Date(data.latestUpdate || Date.now()),
      };
    } catch (error) {
      throw new Error(`IEX Cloud fetch failed for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchBatchPrices(symbols: string[]): Promise<MarketPrice[]> {
    if (!this.apiKey) {
      throw new Error('IEX Cloud API key is required');
    }

    try {
      // IEX Cloud supports batch quotes
      const symbolsParam = symbols.map((s) => s.toUpperCase()).join(',');
      const url = `${this.config.baseUrl}/stock/market/batch?symbols=${symbolsParam}&types=quote&token=${this.apiKey}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('IEX Cloud API limit exceeded');
        }
        throw new Error(`IEX Cloud batch API error: ${response.status}`);
      }

      const data = await response.json();
      const prices: MarketPrice[] = [];

      for (const symbol of symbols) {
        const symbolUpper = symbol.toUpperCase();
        const quote = data[symbolUpper]?.quote;
        
        if (!quote || !quote.latestPrice) {
          continue;
        }

        const changeAmount = quote.change || 0;
        const changePercent = quote.changePercent ? quote.changePercent * 100 : 0;

        prices.push({
          symbol: symbolUpper,
          price: quote.latestPrice,
          currency: quote.currency || 'USD',
          volume: quote.latestVolume,
          changePercent,
          changeAmount,
          timestamp: new Date(quote.latestUpdate || Date.now()),
        });
      }

      return prices;
    } catch (error) {
      throw new Error(`IEX Cloud batch fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

