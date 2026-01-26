-- Migration: Add asset_type column to holdings table
-- Date: 2025-01
-- Description: Add asset_type column to holdings table for proper asset class categorization

-- Add asset_type column to holdings
ALTER TABLE holdings 
  ADD COLUMN IF NOT EXISTS asset_type TEXT 
  CHECK (asset_type IN ('equity', 'etf', 'bond', 'money_market', 'cash'));

-- Create index for efficient asset type queries
CREATE INDEX IF NOT EXISTS holdings_asset_type_idx ON holdings(asset_type);

-- Add comment
COMMENT ON COLUMN holdings.asset_type IS 'Asset class type: equity, etf, bond, money_market, cash';

