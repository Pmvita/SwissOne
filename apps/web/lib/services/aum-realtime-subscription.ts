// apps/web/lib/services/aum-realtime-subscription.ts
// Real-time AUM subscription service using Supabase Realtime

import { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { AUMCalculationService } from './aum-calculation-service';
import { PricingService } from './pricing-service';

export interface AUMUpdate {
  totalAum: number;
  totalAumBaseCurrency: number;
  baseCurrency: string;
  assetClassBreakdown: Record<string, number>;
  portfolioWeights: Record<string, number>;
  dailyChange: number;
  dailyChangePercent: number;
  annualReturn: number;
  yearToDateReturn: number;
  lastUpdated: Date;
  holdingsCount: number;
}

export class AUMRealtimeSubscription {
  private supabase = createClient();
  private channel: RealtimeChannel | null = null;
  private aumService: AUMCalculationService;
  private userId: string;
  private portfolioId?: string;
  private onUpdateCallback?: (update: AUMUpdate) => void;
  private onErrorCallback?: (error: Error) => void;
  private refreshInterval?: NodeJS.Timeout;

  constructor(userId: string, portfolioId?: string) {
    this.userId = userId;
    this.portfolioId = portfolioId;
    const pricingService = new PricingService();
    this.aumService = new AUMCalculationService(pricingService);
  }

  /**
   * Subscribe to real-time AUM updates
   * Uses Supabase Realtime to listen for market_price changes
   * and triggers AUM recalculation
   */
  async subscribe(
    onUpdate: (update: AUMUpdate) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    this.onUpdateCallback = onUpdate;
    this.onErrorCallback = onError;

    // Subscribe to market_prices table changes
    // When prices update, recalculate AUM
    this.channel = this.supabase
      .channel(`aum-updates-${this.userId}-${this.portfolioId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'market_prices',
          filter: this.portfolioId
            ? undefined // Listen to all price changes
            : undefined,
        },
        async (payload) => {
          try {
            // Recalculate AUM when prices change
            const aum = await this.aumService.calculateRealtimeAUM(
              this.userId,
              this.portfolioId
            );

            const update: AUMUpdate = {
              totalAum: aum.totalAum,
              totalAumBaseCurrency: aum.totalAumBaseCurrency,
              baseCurrency: aum.baseCurrency,
              assetClassBreakdown: aum.assetClassBreakdown,
              portfolioWeights: aum.portfolioWeights,
              dailyChange: aum.dailyChange,
              dailyChangePercent: aum.dailyChangePercent,
              annualReturn: aum.annualReturn,
              yearToDateReturn: aum.yearToDateReturn,
              lastUpdated: aum.lastUpdated,
              holdingsCount: aum.holdingsCount,
            };

            this.onUpdateCallback?.(update);
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.onErrorCallback?.(err);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Initial AUM calculation
          this.refreshAUM();
        } else if (status === 'CHANNEL_ERROR') {
          this.onErrorCallback?.(new Error('Failed to subscribe to AUM updates'));
        }
      });

    // Also set up a polling fallback (every 30 seconds) in case Realtime misses updates
    this.refreshInterval = setInterval(() => {
      this.refreshAUM();
    }, 30000);
  }

  /**
   * Manually refresh AUM calculation
   */
  async refreshAUM(): Promise<void> {
    try {
      const aum = await this.aumService.calculateRealtimeAUM(
        this.userId,
        this.portfolioId
      );

      const update: AUMUpdate = {
        totalAum: aum.totalAum,
        totalAumBaseCurrency: aum.totalAumBaseCurrency,
        baseCurrency: aum.baseCurrency,
        assetClassBreakdown: aum.assetClassBreakdown,
        portfolioWeights: aum.portfolioWeights,
        dailyChange: aum.dailyChange,
        dailyChangePercent: aum.dailyChangePercent,
        annualReturn: aum.annualReturn,
        yearToDateReturn: aum.yearToDateReturn,
        lastUpdated: aum.lastUpdated,
        holdingsCount: aum.holdingsCount,
      };

      this.onUpdateCallback?.(update);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onErrorCallback?.(err);
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  async unsubscribe(): Promise<void> {
    if (this.channel) {
      await this.supabase.removeChannel(this.channel);
      this.channel = null;
    }

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }

    this.onUpdateCallback = undefined;
    this.onErrorCallback = undefined;
  }
}

