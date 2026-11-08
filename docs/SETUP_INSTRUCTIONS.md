# Setup Instructions for Wealth Allocation Model

## Quick Setup Steps

### 1. Run Database Migration

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Migration: Add asset_type column to holdings table
ALTER TABLE holdings 
  ADD COLUMN IF NOT EXISTS asset_type TEXT 
  CHECK (asset_type IN ('equity', 'etf', 'bond', 'money_market', 'cash'));

CREATE INDEX IF NOT EXISTS holdings_asset_type_idx ON holdings(asset_type);

COMMENT ON COLUMN holdings.asset_type IS 'Asset class type: equity, etf, bond, money_market, cash';
```

Or use the migration file: `docs/migrations/028_add_asset_type_to_holdings.sql`

### 2. Add Service Role Key to .env.local

Add this line to `apps/web/.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get your service role key from: Supabase Dashboard → Settings → API → service_role key

⚠️ **Warning**: The service role key bypasses RLS - keep it secret!

### 3. Run Seed Script

```bash
cd apps/web
npx tsx scripts/seed-account.ts
```

This will:
- Create 6 accounts matching the wealth allocation model ($1.5B total)
- Create 2 portfolios (Safety & Long Term Investing)
- Create holdings with proper asset types
- Create sample transactions

### 4. Verify Setup

Check that accounts were created:
- Safety & Financial Foundation Account: $600M
- Long Term Investing Account: $450M
- Lifestyle Allocation Checking Account: $150M
- Professional Advice & Structure Checking Account: $75M
- Cash Reserve Checking Account: $75M
- Charity & Giving Account: $0

## API Endpoints Available

After setup, you can test these endpoints:

- `GET /api/wealth/allocation` - Wealth allocation breakdown
- `GET /api/wealth/charity?year=2024` - Charity calculation
- `GET /api/wealth/income` - Monthly income distribution

## Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY not configured"
- Make sure `.env.local` exists in `apps/web/`
- Add the service role key from Supabase Dashboard

### Error: "column asset_type does not exist"
- Run the migration first (step 1)

### Error: "Accounts already exist"
- The seed script detects existing accounts and skips seeding
- To re-seed, delete existing accounts first in Supabase Dashboard

