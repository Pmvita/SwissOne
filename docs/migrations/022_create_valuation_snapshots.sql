-- Migration: Create valuation_snapshots table
-- Date: 2025-01
-- Description: Store point-in-time AUM calculations for real-time valuation tracking

CREATE TABLE valuation_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
  snapshot_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  total_aum DECIMAL(20, 2) NOT NULL,
  total_aum_base_currency DECIMAL(20, 2) NOT NULL,
  base_currency TEXT NOT NULL,
  holdings_count INTEGER DEFAULT 0,
  asset_class_breakdown JSONB,
  portfolio_weights JSONB,
  daily_change DECIMAL(20, 2),
  daily_change_percent DECIMAL(10, 4),
  annual_return DECIMAL(10, 4),
  year_to_date_return DECIMAL(10, 4),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, portfolio_id, snapshot_at)
);

-- Create indexes for efficient queries
CREATE INDEX valuation_snapshots_user_snapshot_idx ON valuation_snapshots(user_id, snapshot_at DESC);
CREATE INDEX valuation_snapshots_portfolio_snapshot_idx ON valuation_snapshots(portfolio_id, snapshot_at DESC);
CREATE INDEX valuation_snapshots_snapshot_at_idx ON valuation_snapshots(snapshot_at DESC);

-- Enable RLS
ALTER TABLE valuation_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own valuation snapshots
CREATE POLICY "Users can read own valuation snapshots"
  ON valuation_snapshots FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert/update snapshots (via API routes with service role)
-- Note: In production, use service role key for snapshot creation

-- Add comments
COMMENT ON TABLE valuation_snapshots IS 'Stores point-in-time AUM calculations for real-time portfolio valuation';
COMMENT ON COLUMN valuation_snapshots.asset_class_breakdown IS 'JSON object with asset class codes and values: {"EQUITY": 450000000, "BOND": 240000000}';
COMMENT ON COLUMN valuation_snapshots.portfolio_weights IS 'JSON object with portfolio IDs and percentage weights: {"portfolio-id": 30.0}';

