// apps/web/lib/services/aum-calculation-service.ts
// AUM calculation service that uses PricingService to aggregate holdings and calculate AUM

import { PricingService } from './pricing-service';
import { createClient } from '@/lib/supabase/server';

export interface AUMResult {
  totalAum: number;
  totalAumBaseCurrency: number;
  baseCurrency: string;
  assetClassBreakdown: Record<string, number>;
  portfolioWeights: Record<string, number>;
  dailyChange: number;
  dailyChangePercent: number;
  annualReturn?: number;
  yearToDateReturn?: number;
  lastUpdated: Date;
  holdingsCount: number;
}

export interface PortfolioValuation {
  portfolioId: string;
  portfolioName: string;
  currentValue: number;
  baseCurrency: string;
  holdings: Array<{
    symbol: string;
    name: string;
    quantity: number;
    currentPrice: number;
    marketValue: number;
    dailyChange: number;
    dailyChangePercent: number;
    weight: number;
  }>;
  assetClassBreakdown: Record<string, number>;
  performance: {
    dailyReturn: number;
    monthlyReturn?: number;
    yearToDateReturn: number;
    annualReturn: number;
  };
  history?: Array<{
    date: string;
    value: number;
    change: number;
    changePercent: number;
  }>;
}

export class AUMCalculationService {
  private pricingService: PricingService;

  constructor(pricingService: PricingService) {
    this.pricingService = pricingService;
  }

  /**
   * Calculate real-time AUM for a user
   * Uses internal PricingService - provider is completely abstracted
   */
  async calculateRealtimeAUM(
    userId: string,
    portfolioId?: string
  ): Promise<AUMResult> {
    const supabase = await createClient();

    // Get user's base currency
    const { data: profile } = await supabase
      .from('profiles')
      .select('base_currency')
      .eq('id', userId)
      .single();

    const baseCurrency = profile?.base_currency || 'USD';

    // Get holdings with market_symbol
    // Note: market_symbol may not exist yet if migration 024 hasn't run, so we check both
    let holdingsQuery = supabase
      .from('holdings')
      .select(`
        id,
        portfolio_id,
        market_symbol,
        symbol,
        quantity,
        currency,
        portfolios!inner(user_id, name)
      `)
      .or('market_symbol.not.is.null,symbol.not.is.null')
      .eq('portfolios.user_id', userId);

    if (portfolioId) {
      holdingsQuery = holdingsQuery.eq('portfolio_id', portfolioId);
    }

    const { data: holdings, error } = await holdingsQuery;

    if (error) {
      throw new Error(`Failed to fetch holdings: ${error.message}`);
    }

    if (!holdings || holdings.length === 0) {
      return {
        totalAum: 0,
        totalAumBaseCurrency: 0,
        baseCurrency,
        assetClassBreakdown: {},
        portfolioWeights: {},
        dailyChange: 0,
        dailyChangePercent: 0,
        lastUpdated: new Date(),
        holdingsCount: 0,
      };
    }

    // Get latest prices using internal pricing service
    const symbols = holdings.map((h) => h.market_symbol || h.symbol);
    const uniqueSymbols = [...new Set(symbols)];

    const priceRequests = uniqueSymbols.map((symbol) => ({
      symbol,
      assetType: 'equity' as const, // Default, could be enhanced to use asset_type from holdings
    }));

    const prices = await this.pricingService.getPrices(priceRequests);
    const priceMap = new Map(prices.map((p) => [p.symbol.toUpperCase(), p]));

    // Calculate AUM
    let totalAum = 0;
    const portfolioValues: Map<string, number> = new Map();
    const assetClassValues: Map<string, number> = new Map();

    for (const holding of holdings) {
      const symbol = (holding.market_symbol || holding.symbol).toUpperCase();
      const price = priceMap.get(symbol);

      if (!price) {
        continue; // Skip holdings without price data
      }

      const marketValue = Number(holding.quantity) * price.price;
      totalAum += marketValue;

      // Track portfolio values
      const portfolioId = holding.portfolio_id;
      const currentPortfolioValue = portfolioValues.get(portfolioId) || 0;
      portfolioValues.set(portfolioId, currentPortfolioValue + marketValue);

      // Track asset class values (simplified - would need asset_class_id from holdings)
      // For now, we'll use a default asset class
      const assetClass = 'EQUITY'; // This should come from holdings.asset_class_id
      const currentAssetValue = assetClassValues.get(assetClass) || 0;
      assetClassValues.set(assetClass, currentAssetValue + marketValue);
    }

    // Get previous day value for change calculation
    const { data: previousSnapshot } = await supabase
      .from('valuation_snapshots')
      .select('total_aum_base_currency')
      .eq('user_id', userId)
      .eq('portfolio_id', portfolioId || null)
      .lt('snapshot_at', new Date().toISOString().split('T')[0])
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .single();

    const previousValue = previousSnapshot?.total_aum_base_currency || 0;
    const dailyChange = totalAum - previousValue;
    const dailyChangePercent = previousValue > 0 ? (dailyChange / previousValue) * 100 : 0;

    // Calculate portfolio weights
    const portfolioWeights: Record<string, number> = {};
    for (const [pid, value] of portfolioValues.entries()) {
      portfolioWeights[pid] = totalAum > 0 ? (value / totalAum) * 100 : 0;
    }

    // Convert asset class breakdown to object
    const assetClassBreakdown: Record<string, number> = {};
    for (const [ac, value] of assetClassValues.entries()) {
      assetClassBreakdown[ac] = value;
    }

    return {
      totalAum,
      totalAumBaseCurrency: totalAum, // Simplified - would need currency conversion
      baseCurrency,
      assetClassBreakdown,
      portfolioWeights,
      dailyChange,
      dailyChangePercent,
      lastUpdated: new Date(),
      holdingsCount: holdings.length,
    };
  }

  /**
   * Get detailed portfolio valuation
   * Uses internal PricingService - provider is completely abstracted
   */
  async getPortfolioValuation(
    userId: string,
    portfolioId: string,
    includeHistory = false
  ): Promise<PortfolioValuation> {
    const supabase = await createClient();

    // Get portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, name, currency, user_id')
      .eq('id', portfolioId)
      .eq('user_id', userId)
      .single();

    if (portfolioError || !portfolio) {
      throw new Error(`Portfolio not found: ${portfolioError?.message}`);
    }

    // Get holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select('id, symbol, name, quantity, currency, market_symbol')
      .eq('portfolio_id', portfolioId)
      .not('market_symbol', 'is', null);

    if (holdingsError) {
      throw new Error(`Failed to fetch holdings: ${holdingsError.message}`);
    }

    if (!holdings || holdings.length === 0) {
      return {
        portfolioId,
        portfolioName: portfolio.name,
        currentValue: 0,
        baseCurrency: portfolio.currency,
        holdings: [],
        assetClassBreakdown: {},
        performance: {
          dailyReturn: 0,
          yearToDateReturn: 0,
          annualReturn: 0,
        },
      };
    }

    // Get prices using internal pricing service
    const symbols = holdings.map((h) => h.market_symbol || h.symbol);
    const uniqueSymbols = [...new Set(symbols)];

    const priceRequests = uniqueSymbols.map((symbol) => ({
      symbol,
      assetType: 'equity' as const,
    }));

    const prices = await this.pricingService.getPrices(priceRequests);
    const priceMap = new Map(prices.map((p) => [p.symbol.toUpperCase(), p]));

    // Calculate holdings with prices
    let totalValue = 0;
    const holdingsWithPrices = holdings
      .map((holding) => {
        const symbol = (holding.market_symbol || holding.symbol).toUpperCase();
        const price = priceMap.get(symbol);

        if (!price) {
          return null;
        }

        const marketValue = Number(holding.quantity) * price.price;
        totalValue += marketValue;

        return {
          symbol,
          name: holding.name,
          quantity: Number(holding.quantity),
          currentPrice: price.price,
          marketValue,
          dailyChange: price.changeAmount || 0,
          dailyChangePercent: price.changePercent || 0,
          weight: 0, // Will calculate after totalValue is known
        };
      })
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .map((h) => ({
        ...h,
        weight: totalValue > 0 ? (h.marketValue / totalValue) * 100 : 0,
      }));

    // Get performance metrics
    const { data: snapshots } = await supabase
      .from('valuation_snapshots')
      .select('total_aum_base_currency, snapshot_at, daily_change_percent, annual_return, year_to_date_return')
      .eq('portfolio_id', portfolioId)
      .order('snapshot_at', { ascending: false })
      .limit(30);

    const latestSnapshot = snapshots?.[0];
    const dailyReturn = latestSnapshot?.daily_change_percent || 0;
    const annualReturn = latestSnapshot?.annual_return || 0;
    const yearToDateReturn = latestSnapshot?.year_to_date_return || 0;

    // Get history if requested
    let history: PortfolioValuation['history'] = undefined;
    if (includeHistory && snapshots) {
      history = snapshots.map((snapshot) => ({
        date: snapshot.snapshot_at,
        value: Number(snapshot.total_aum_base_currency),
        change: 0, // Could calculate from previous snapshot
        changePercent: snapshot.daily_change_percent || 0,
      }));
    }

    return {
      portfolioId,
      portfolioName: portfolio.name,
      currentValue: totalValue,
      baseCurrency: portfolio.currency,
      holdings: holdingsWithPrices,
      assetClassBreakdown: {}, // Would need asset_class_id from holdings
      performance: {
        dailyReturn,
        yearToDateReturn,
        annualReturn,
      },
      history,
    };
  }
}

