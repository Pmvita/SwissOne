// apps/web/hooks/use-realtime-aum.ts
// React hook for subscribing to real-time AUM updates

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { AUMRealtimeSubscription, AUMUpdate } from '@/lib/services/aum-realtime-subscription';
import { createClient } from '@/lib/supabase/client';

export interface UseRealtimeAUMOptions {
  portfolioId?: string;
  enabled?: boolean;
  refreshInterval?: number; // milliseconds
}

export interface UseRealtimeAUMReturn {
  aum: AUMUpdate | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * React hook for subscribing to real-time AUM updates
 * Uses Supabase Realtime subscriptions (WebSocket-based)
 */
export function useRealtimeAUM(
  options: UseRealtimeAUMOptions = {}
): UseRealtimeAUMReturn {
  const { portfolioId, enabled = true, refreshInterval = 30000 } = options;

  const [aum, setAUM] = useState<AUMUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const subscriptionRef = useRef<AUMRealtimeSubscription | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get user ID on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (user && !error) {
        setUserId(user.id);
      } else {
        setError(new Error('User not authenticated'));
        setIsLoading(false);
      }
    });
  }, []);

  // Refresh function
  const refresh = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const subscription = subscriptionRef.current;
      if (subscription) {
        // Trigger manual refresh
        await subscription.refreshAUM();
      } else {
        // Fallback: fetch from API
        const response = await fetch(
          `/api/aum/realtime${portfolioId ? `?portfolio_id=${portfolioId}` : ''}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch AUM');
        }
        const data = await response.json();
        setAUM({
          ...data,
          lastUpdated: new Date(data.lastUpdated),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [userId, portfolioId]);

  // Set up subscription
  useEffect(() => {
    if (!enabled || !userId) {
      setIsLoading(false);
      return;
    }

    let subscription: AUMRealtimeSubscription | null = null;

    const setupSubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);

        subscription = new AUMRealtimeSubscription(userId, portfolioId);

        await subscription.subscribe(
          (update) => {
            setAUM(update);
            setIsLoading(false);
            setError(null);
          },
          (err) => {
            setError(err);
            setIsLoading(false);
          }
        );

        subscriptionRef.current = subscription;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    setupSubscription();

    // Cleanup
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [enabled, userId, portfolioId]);

  // Optional: Set up polling fallback if refreshInterval is provided
  useEffect(() => {
    if (!enabled || !userId || refreshInterval <= 0) return;

    refreshTimeoutRef.current = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [enabled, userId, refreshInterval, refresh]);

  return {
    aum,
    isLoading,
    error,
    refresh,
  };
}

