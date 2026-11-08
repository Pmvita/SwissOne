-- Migration: Create calculate_realtime_aum function
-- Date: 2025-01
-- Description: Database function to calculate real-time AUM from holdings and latest market prices

CREATE OR REPLACE FUNCTION calculate_realtime_aum(
  p_user_id UUID,
  p_portfolio_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_aum DECIMAL(20, 2),
  total_aum_base_currency DECIMAL(20, 2),
  base_currency TEXT,
  asset_class_breakdown JSONB,
  portfolio_weights JSONB,
  daily_change DECIMAL(20, 2),
  daily_change_percent DECIMAL(10, 4)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_curr TEXT;
  total_value DECIMAL(20, 2);
  total_value_base DECIMAL(20, 2);
  prev_day_value DECIMAL(20, 2);
  asset_breakdown JSONB;
  portfolio_weights_json JSONB;
  portfolio_record RECORD;
  portfolio_value DECIMAL(20, 2);
BEGIN
  -- Get user's base currency
  SELECT base_currency INTO base_curr
  FROM profiles
  WHERE id = p_user_id;
  
  IF base_curr IS NULL THEN
    base_curr := 'USD';
  END IF;
  
  -- Calculate total AUM from holdings with latest prices
  SELECT 
    COALESCE(SUM(h.quantity * mp.price), 0),
    COALESCE(SUM(convert_currency(h.quantity * mp.price, mp.currency, base_curr, CURRENT_DATE)), 0)
  INTO total_value, total_value_base
  FROM holdings h
  INNER JOIN portfolios p ON p.id = h.portfolio_id
  LEFT JOIN LATERAL (
    SELECT price, currency
    FROM market_prices
    WHERE symbol = h.market_symbol
      AND is_realtime = true
    ORDER BY effective_at DESC
    LIMIT 1
  ) mp ON true
  WHERE p.user_id = p_user_id
    AND (p_portfolio_id IS NULL OR p.id = p_portfolio_id)
    AND h.market_symbol IS NOT NULL;
  
  -- Get previous day value for change calculation
  SELECT total_aum_base_currency INTO prev_day_value
  FROM valuation_snapshots
  WHERE user_id = p_user_id
    AND (p_portfolio_id IS NULL OR portfolio_id = p_portfolio_id)
    AND snapshot_at::date = CURRENT_DATE - INTERVAL '1 day'
  ORDER BY snapshot_at DESC
  LIMIT 1;
  
  -- Calculate asset class breakdown
  SELECT jsonb_object_agg(
    ac.code,
    COALESCE(SUM(convert_currency(h.quantity * mp.price, mp.currency, base_curr, CURRENT_DATE)), 0)
  )
  INTO asset_breakdown
  FROM holdings h
  INNER JOIN portfolios p ON p.id = h.portfolio_id
  INNER JOIN asset_classes ac ON ac.id = h.asset_class_id
  LEFT JOIN LATERAL (
    SELECT price, currency
    FROM market_prices
    WHERE symbol = h.market_symbol
      AND is_realtime = true
    ORDER BY effective_at DESC
    LIMIT 1
  ) mp ON true
  WHERE p.user_id = p_user_id
    AND (p_portfolio_id IS NULL OR p.id = p_portfolio_id)
    AND h.market_symbol IS NOT NULL
  GROUP BY ac.code;
  
  -- Calculate portfolio weights
  SELECT jsonb_object_agg(
    p.id::text,
    CASE 
      WHEN total_value_base > 0 THEN 
        (COALESCE(SUM(convert_currency(h.quantity * mp.price, mp.currency, base_curr, CURRENT_DATE)), 0) / total_value_base) * 100
      ELSE 0
    END
  )
  INTO portfolio_weights_json
  FROM portfolios p
  LEFT JOIN holdings h ON h.portfolio_id = p.id
  LEFT JOIN LATERAL (
    SELECT price, currency
    FROM market_prices
    WHERE symbol = h.market_symbol
      AND is_realtime = true
    ORDER BY effective_at DESC
    LIMIT 1
  ) mp ON true
  WHERE p.user_id = p_user_id
    AND (p_portfolio_id IS NULL OR p.id = p_portfolio_id)
  GROUP BY p.id;
  
  RETURN QUERY SELECT
    total_value,
    total_value_base,
    base_curr,
    COALESCE(asset_breakdown, '{}'::jsonb),
    COALESCE(portfolio_weights_json, '{}'::jsonb),
    total_value_base - COALESCE(prev_day_value, 0),
    CASE 
      WHEN prev_day_value > 0 THEN 
        ((total_value_base - prev_day_value) / prev_day_value) * 100
      ELSE 0
    END;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_realtime_aum(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_realtime_aum(UUID, UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION calculate_realtime_aum IS 'Calculates real-time AUM from holdings and latest market prices, with asset class breakdown and portfolio weights';

