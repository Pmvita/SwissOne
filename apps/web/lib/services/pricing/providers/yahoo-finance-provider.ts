// apps/web/lib/services/pricing/providers/yahoo-finance-provider.ts
// Yahoo Finance provider - completely free, no API key required

import { BaseMarketDataProvider, MarketPrice, ProviderConfig } from '../base-provider';

export class YahooFinanceProvider extends BaseMarketDataProvider {
  constructor() {
    super('yahoo_finance', {
      baseUrl: 'https://query1.finance.yahoo.com',
      isFree: true,
      // No rate limits, but be respectful
    });
  }

  async fetchPrice(symbol: string, assetType: string): Promise<MarketPrice> {
    try {
      // Yahoo Finance API endpoint for quote
      const url = `${this.config.baseUrl}/v8/finance/chart/${symbol}?interval=1d&range=1d`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0', // Yahoo Finance requires User-Agent
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.chart?.result?.[0]) {
        throw new Error(`No data returned for symbol: ${symbol}`);
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];

      if (!meta || !quote) {
        throw new Error(`Invalid data structure for symbol: ${symbol}`);
      }

      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.previousClose || currentPrice;
      const changeAmount = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (changeAmount / previousClose) * 100 : 0;

      return {
        symbol: symbol.toUpperCase(),
        price: currentPrice,
        currency: meta.currency || 'USD',
        volume: meta.regularMarketVolume,
        changePercent,
        changeAmount,
        timestamp: new Date(meta.regularMarketTime * 1000),
      };
    } catch (error) {
      throw new Error(`Yahoo Finance fetch failed for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchBatchPrices(symbols: string[]): Promise<MarketPrice[]> {
    // Yahoo Finance supports batch requests via comma-separated symbols
    try {
      const symbolsParam = symbols.map((s) => s.toUpperCase()).join(',');
      const url = `${this.config.baseUrl}/v8/finance/chart/${symbolsParam}?interval=1d&range=1d`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance batch API error: ${response.status}`);
      }

      const data = await response.json();
      const prices: MarketPrice[] = [];

      if (!data.chart?.result) {
        return prices;
      }

      for (const result of data.chart.result) {
        const meta = result.meta;
        if (!meta) continue;

        const currentPrice = meta.regularMarketPrice || meta.previousClose;
        const previousClose = meta.previousClose || currentPrice;
        const changeAmount = currentPrice - previousClose;
        const changePercent = previousClose > 0 ? (changeAmount / previousClose) * 100 : 0;

        prices.push({
          symbol: meta.symbol?.toUpperCase() || '',
          price: currentPrice,
          currency: meta.currency || 'USD',
          volume: meta.regularMarketVolume,
          changePercent,
          changeAmount,
          timestamp: new Date(meta.regularMarketTime * 1000),
        });
      }

      return prices;
    } catch (error) {
      throw new Error(`Yahoo Finance batch fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

