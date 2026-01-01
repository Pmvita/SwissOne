// apps/web/lib/services/price-fetching-service.ts
// Price fetching service that uses internal PricingService (never calls providers directly)

import { PricingService, PriceRequest } from './pricing-service';
import { createClient } from '@/lib/supabase/server';

interface Holding {
  id: string;
  portfolio_id: string;
  market_symbol: string | null;
  symbol: string; // Fallback to old symbol field
  asset_type?: string;
  refresh_cadence: string;
  last_price_update: string | null;
}

export class PriceFetchingService {
  private pricingService: PricingService;
  private supabase!: Awaited<ReturnType<typeof createClient>>;

  constructor() {
    this.pricingService = new PricingService();
  }

  /**
   * Fetch prices for all holdings that need updates
   * Uses internal PricingService - provider is completely abstracted
   */
  async fetchPricesForHoldings(): Promise<void> {
    const supabase = await createClient();
    this.supabase = supabase;

    // Get all holdings with market_symbol that need price updates
    const holdings = await this.getHoldingsNeedingUpdate();

    if (holdings.length === 0) {
      return;
    }

    // Prepare price requests using internal pricing service
    const priceRequests: PriceRequest[] = holdings.map((h) => ({
      symbol: h.market_symbol || h.symbol,
      assetType: this.mapAssetType(h.asset_type || 'equity'),
    }));

    // Use internal pricing service (provider-agnostic)
    const prices = await this.pricingService.getPrices(priceRequests);

    // Store prices in database
    await this.storePrices(prices, holdings);

    // Update holdings.last_price_update
    await this.updateHoldingsPriceTimestamp(holdings);
  }

  /**
   * Get holdings that need price updates based on refresh cadence
   */
  private async getHoldingsNeedingUpdate(): Promise<Holding[]> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get holdings with market_symbol
    const { data: allHoldings, error } = await this.supabase
      .from('holdings')
      .select('id, portfolio_id, market_symbol, symbol, refresh_cadence, last_price_update')
      .not('market_symbol', 'is', null);

    if (error) {
      console.error('Error fetching holdings:', error);
      return [];
    }

    if (!allHoldings) {
      return [];
    }

    // Filter holdings based on refresh cadence
    return allHoldings.filter((h) => {
      const lastUpdate = h.last_price_update ? new Date(h.last_price_update) : null;
      const marketSymbol = h.market_symbol || h.symbol;

      if (!marketSymbol) {
        return false;
      }

      switch (h.refresh_cadence) {
        case 'realtime':
          return !lastUpdate || lastUpdate < oneMinuteAgo;
        case 'hourly':
          return !lastUpdate || lastUpdate < oneHourAgo;
        case '4_hours':
          return !lastUpdate || lastUpdate < fourHoursAgo;
        case 'daily':
          return !lastUpdate || lastUpdate < oneDayAgo;
        default:
          return !lastUpdate || lastUpdate < oneMinuteAgo;
      }
    }) as Holding[];
  }

  /**
   * Store prices in market_prices table
   */
  private async storePrices(
    prices: Array<{
      symbol: string;
      price: number;
      currency: string;
      volume?: number;
      changePercent?: number;
      changeAmount?: number;
      timestamp: Date;
      source: string;
    }>,
    holdings: Holding[]
  ): Promise<void> {
    // Get price source IDs from database
    const { data: priceSources } = await this.supabase
      .from('price_sources')
      .select('id, name');

    const sourceMap = new Map<string, string>();
    priceSources?.forEach((ps) => {
      sourceMap.set(ps.name, ps.id);
    });

    // Prepare price records
    const priceRecords = prices.map((price) => {
      const holding = holdings.find(
        (h) => (h.market_symbol || h.symbol).toUpperCase() === price.symbol.toUpperCase()
      );

      return {
        symbol: price.symbol.toUpperCase(),
        asset_type: holding ? this.mapAssetType(holding.asset_type || 'equity') : 'equity',
        price: price.price,
        currency: price.currency,
        price_source_id: sourceMap.get(price.source) || null,
        fetched_at: new Date().toISOString(),
        effective_at: price.timestamp.toISOString(),
        is_realtime: true,
        volume: price.volume || null,
        change_percent: price.changePercent || null,
        change_amount: price.changeAmount || null,
      };
    });

    // Insert prices (use upsert to handle duplicates)
    if (priceRecords.length > 0) {
      const { error } = await this.supabase
        .from('market_prices')
        .upsert(priceRecords, {
          onConflict: 'symbol,effective_at,price_source_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error('Error storing prices:', error);
      }
    }
  }

  /**
   * Update last_price_update timestamp for holdings
   */
  private async updateHoldingsPriceTimestamp(holdings: Holding[]): Promise<void> {
    const now = new Date().toISOString();

    for (const holding of holdings) {
      await this.supabase
        .from('holdings')
        .update({ last_price_update: now })
        .eq('id', holding.id);
    }
  }

  /**
   * Map asset type string to valid enum value
   */
  private mapAssetType(assetType?: string): 'equity' | 'etf' | 'bond' | 'money_market' | 'cash' {
    if (!assetType) {
      return 'equity';
    }

    const normalized = assetType.toLowerCase();
    if (['equity', 'etf', 'bond', 'money_market', 'cash'].includes(normalized)) {
      return normalized as 'equity' | 'etf' | 'bond' | 'money_market' | 'cash';
    }

    // Default mapping
    if (normalized.includes('stock') || normalized.includes('equity')) {
      return 'equity';
    }
    if (normalized.includes('etf') || normalized.includes('fund')) {
      return 'etf';
    }
    if (normalized.includes('bond') || normalized.includes('fixed')) {
      return 'bond';
    }
    if (normalized.includes('cash') || normalized.includes('money')) {
      return 'cash';
    }

    return 'equity';
  }
}

