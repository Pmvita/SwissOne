-- Migration: Extend holdings table for real-time price tracking
-- Date: 2025-01
-- Description: Add fields to holdings table to support real-time market price tracking

-- Add market_symbol column for price lookups
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS market_symbol TEXT;

-- Add last_price_update timestamp
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMP WITH TIME ZONE;

-- Add price_source_id reference
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS price_source_id UUID REFERENCES price_sources(id) ON DELETE SET NULL;

-- Add refresh_cadence column
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS refresh_cadence TEXT DEFAULT 'realtime' CHECK (refresh_cadence IN ('realtime', 'hourly', '4_hours', 'daily'));

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS holdings_market_symbol_idx ON holdings(market_symbol) WHERE market_symbol IS NOT NULL;
CREATE INDEX IF NOT EXISTS holdings_refresh_cadence_idx ON holdings(refresh_cadence);
CREATE INDEX IF NOT EXISTS holdings_price_source_idx ON holdings(price_source_id) WHERE price_source_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN holdings.market_symbol IS 'Market symbol for price lookups (e.g., AAPL, SPY, US10Y)';
COMMENT ON COLUMN holdings.refresh_cadence IS 'How often to refresh price: realtime (equities/ETFs), hourly, 4_hours (bonds), daily (cash)';
COMMENT ON COLUMN holdings.last_price_update IS 'Timestamp of last successful price update';

