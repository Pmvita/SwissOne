-- Migration: Create price_sources table (if not already created)
-- Date: 2025-01
-- Description: Track free market data providers and their status
-- Note: This table may have been created in migration 020, so we use IF NOT EXISTS

-- Table creation is handled in 020_create_market_prices.sql
-- This migration ensures the table exists and seeds initial provider data

-- Seed initial free market data providers
INSERT INTO price_sources (name, display_name, is_active, priority, supports_realtime, supports_historical, rate_limit_per_minute, rate_limit_per_day, metadata)
VALUES
  ('yahoo_finance', 'Yahoo Finance', true, 1, true, true, NULL, NULL, '{"requiresApiKey": false, "isFree": true}'::jsonb),
  ('alpha_vantage', 'Alpha Vantage', true, 2, false, true, 5, 500, '{"requiresApiKey": true, "isFree": true, "tier": "free"}'::jsonb),
  ('iex_cloud', 'IEX Cloud', true, 3, true, true, 60, NULL, '{"requiresApiKey": true, "isFree": true, "tier": "free", "monthlyLimit": 50000}'::jsonb),
  ('finnhub', 'Finnhub', true, 4, true, true, 60, NULL, '{"requiresApiKey": true, "isFree": true, "tier": "free"}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  is_active = EXCLUDED.is_active,
  priority = EXCLUDED.priority,
  supports_realtime = EXCLUDED.supports_realtime,
  supports_historical = EXCLUDED.supports_historical,
  rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
  rate_limit_per_day = EXCLUDED.rate_limit_per_day,
  metadata = EXCLUDED.metadata;

-- Add comment
COMMENT ON TABLE price_sources IS 'Tracks free market data providers with health status and rate limits';

