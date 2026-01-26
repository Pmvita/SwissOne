-- Migration: Seed price_sources table with free provider configurations
-- Date: 2025-01
-- Description: Initialize free market data providers in price_sources table
-- Note: This may have been partially done in 021, but this ensures complete seeding

-- Ensure price_sources table exists (created in 020)
-- This migration focuses on seeding/updating provider data

INSERT INTO price_sources (name, display_name, is_active, priority, supports_realtime, supports_historical, rate_limit_per_minute, rate_limit_per_day, metadata)
VALUES
  ('yahoo_finance', 'Yahoo Finance', true, 1, true, true, NULL, NULL, '{"requiresApiKey": false, "isFree": true, "description": "Unofficial API, no key required"}'::jsonb),
  ('alpha_vantage', 'Alpha Vantage', true, 2, false, true, 5, 500, '{"requiresApiKey": true, "isFree": true, "tier": "free", "description": "Free tier: 5 calls/min, 500/day"}'::jsonb),
  ('iex_cloud', 'IEX Cloud', true, 3, true, true, 60, NULL, '{"requiresApiKey": true, "isFree": true, "tier": "free", "monthlyLimit": 50000, "description": "Free tier: 50k messages/month"}'::jsonb),
  ('finnhub', 'Finnhub', true, 4, true, true, 60, NULL, '{"requiresApiKey": true, "isFree": true, "tier": "free", "description": "Free tier: 60 calls/min"}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  is_active = EXCLUDED.is_active,
  priority = EXCLUDED.priority,
  supports_realtime = EXCLUDED.supports_realtime,
  supports_historical = EXCLUDED.supports_historical,
  rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
  rate_limit_per_day = EXCLUDED.rate_limit_per_day,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Add comment
COMMENT ON TABLE price_sources IS 'Tracks free market data providers with health status, rate limits, and configuration';

