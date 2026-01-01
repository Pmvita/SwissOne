-- Migration: Create market_prices table
-- Date: 2025-01
-- Description: Store real-time and historical market prices from free market data providers

-- Create price_sources table first (referenced by market_prices)
CREATE TABLE IF NOT EXISTS price_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  api_endpoint TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  rate_limit_per_minute INTEGER,
  rate_limit_per_day INTEGER,
  last_successful_fetch TIMESTAMP WITH TIME ZONE,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  supports_realtime BOOLEAN DEFAULT false,
  supports_historical BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market_prices table
CREATE TABLE market_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('equity', 'etf', 'bond', 'money_market', 'cash')),
  price DECIMAL(20, 8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  price_source_id UUID REFERENCES price_sources(id) ON DELETE SET NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  effective_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_realtime BOOLEAN DEFAULT true,
  volume BIGINT,
  change_percent DECIMAL(10, 4),
  change_amount DECIMAL(20, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol, effective_at, price_source_id)
);

-- Create indexes for efficient queries
CREATE INDEX market_prices_symbol_idx ON market_prices(symbol);
CREATE INDEX market_prices_effective_at_idx ON market_prices(effective_at DESC);
CREATE INDEX market_prices_symbol_effective_idx ON market_prices(symbol, effective_at DESC);
CREATE INDEX market_prices_realtime_idx ON market_prices(is_realtime, effective_at DESC) WHERE is_realtime = true;
CREATE INDEX market_prices_price_source_idx ON market_prices(price_source_id);

-- Create index on price_sources for active providers
CREATE INDEX price_sources_active_priority_idx ON price_sources(is_active, priority) WHERE is_active = true;

-- Enable RLS on market_prices (users can read prices, but only system can write)
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read market prices (public data)
CREATE POLICY "Users can read market prices"
  ON market_prices FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update prices (via API routes)
-- Note: This requires service role key, not anon key
-- In production, use service role key for price updates

-- Add updated_at trigger for price_sources
CREATE TRIGGER update_price_sources_updated_at BEFORE UPDATE ON price_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE market_prices IS 'Stores real-time and historical market prices from free market data providers';
COMMENT ON TABLE price_sources IS 'Tracks market data provider status and configuration';
COMMENT ON COLUMN market_prices.symbol IS 'Market symbol (e.g., AAPL, SPY, US10Y)';
COMMENT ON COLUMN market_prices.is_realtime IS 'Whether this price is real-time or delayed';
COMMENT ON COLUMN price_sources.priority IS 'Lower number = higher priority for failover';

