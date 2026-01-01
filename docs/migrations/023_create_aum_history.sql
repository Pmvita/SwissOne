-- Migration: Create aum_history table
-- Date: 2025-01
-- Description: Store historical AUM values for trend analysis and reporting

CREATE TABLE aum_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  total_aum DECIMAL(20, 2) NOT NULL,
  total_aum_base_currency DECIMAL(20, 2) NOT NULL,
  base_currency TEXT NOT NULL,
  daily_change DECIMAL(20, 2),
  daily_change_percent DECIMAL(10, 4),
  period_type TEXT NOT NULL CHECK (period_type IN ('realtime', 'hourly', 'daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recorded_at, period_type)
);

-- Create indexes for efficient queries
CREATE INDEX aum_history_user_recorded_idx ON aum_history(user_id, recorded_at DESC);
CREATE INDEX aum_history_period_type_idx ON aum_history(period_type, recorded_at DESC);
CREATE INDEX aum_history_user_period_idx ON aum_history(user_id, period_type, recorded_at DESC);

-- Enable RLS
ALTER TABLE aum_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own AUM history
CREATE POLICY "Users can read own aum history"
  ON aum_history FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert history records (via API routes with service role)
-- Note: In production, use service role key for history creation

-- Add comments
COMMENT ON TABLE aum_history IS 'Stores historical AUM values for trend analysis and performance reporting';
COMMENT ON COLUMN aum_history.period_type IS 'Type of period: realtime (live updates), hourly, daily, weekly, monthly';

