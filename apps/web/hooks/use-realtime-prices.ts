// apps/web/hooks/use-realtime-prices.ts
// Unified hook for fetching real-time prices (same as mobile portfolio screen)
// Uses /api/prices endpoint with proper rate limiting and caching

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PriceData {
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

export interface RealtimePriceData extends PriceData {
  realtimePrice: number;
  realtimeChangePercent?: number;
  realtimeChangeAmount?: number;
  priceLastUpdated?: string;
  priceSource?: string;
}

interface UseRealtimePricesOptions {
  symbols: string[];
  assetTypes?: string[];
  refreshInterval?: number; // Auto-refresh interval in ms (default: 30 seconds)
  enabled?: boolean; // Whether to enable auto-refresh (default: true)
  onError?: (error: Error) => void;
}

interface UseRealtimePricesReturn {
  prices: Map<string, RealtimePriceData>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
  rateLimitRemaining: number | null;
  rateLimitReset: Date | null;
}

/**
 * Hook for fetching real-time prices (same API as mobile)
 * Automatically handles rate limiting, caching, and periodic refresh
 */
export function useRealtimePrices(
  options: UseRealtimePricesOptions
): UseRealtimePricesReturn {
  const {
    symbols,
    assetTypes,
    refreshInterval = 30000, // 30 seconds
    enabled = true,
    onError,
  } = options;

  const [prices, setPrices] = useState<Map<string, RealtimePriceData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const [rateLimitReset, setRateLimitReset] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch prices from API
   */
  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) {
      return;
    }

    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      // Get auth token
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Fetch prices
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          symbols: symbols.map((s) => s.toUpperCase()),
          assetTypes,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Extract rate limit headers
      const rateLimitRemainingHeader = response.headers.get('X-RateLimit-Remaining');
      const rateLimitResetHeader = response.headers.get('X-RateLimit-Reset');

      if (rateLimitRemainingHeader) {
        setRateLimitRemaining(parseInt(rateLimitRemainingHeader, 10));
      }

      if (rateLimitResetHeader) {
        setRateLimitReset(new Date(rateLimitResetHeader));
      }

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          throw new Error(
            data.message || 'Rate limit exceeded. Please wait a moment.'
          );
        }

        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success || !data.prices) {
        throw new Error('Invalid response from price API');
      }

      // Convert to Map with realtime price data
      const priceMap = new Map<string, RealtimePriceData>();

      data.prices.forEach((price: PriceData) => {
        priceMap.set(price.symbol.toUpperCase(), {
          ...price,
          realtimePrice: price.price,
          realtimeChangePercent: price.changePercent,
          realtimeChangeAmount: price.changeAmount,
          priceLastUpdated: price.timestamp,
          priceSource: price.source,
        });
      });

      setPrices(priceMap);
      setLastUpdated(new Date());
    } catch (err) {
      // Don't set error for aborted requests
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);

      // Silently fail in production - prices will use stored current_price
      if (process.env.NODE_ENV === 'development') {
        console.warn('[useRealtimePrices] Failed to fetch prices:', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [symbols, assetTypes, onError]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchPrices();
  }, [fetchPrices]);

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    if (!enabled || symbols.length === 0) {
      return;
    }

    // Initial fetch
    fetchPrices();

    // Set up auto-refresh interval
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchPrices();
      }, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [symbols, assetTypes, enabled, refreshInterval, fetchPrices]);

  return {
    prices,
    loading,
    error,
    refresh,
    lastUpdated,
    rateLimitRemaining,
    rateLimitReset,
  };
}
