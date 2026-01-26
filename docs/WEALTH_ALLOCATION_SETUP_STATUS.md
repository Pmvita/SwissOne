# Wealth Allocation Model Setup Status

## ✅ Completed (Automated)

1. **Seed Script Updated** - `apps/web/scripts/seed-account.ts`
   - Updated to match new wealth allocation model ($1.5B total)
   - 6 accounts with correct allocations
   - 2 portfolios with proper asset mixes
   - Holdings with correct asset types

2. **Wealth Allocation Service Created** - `lib/services/wealth-allocation-service.ts`
   - Methods for calculating allocations, charity, and income distributions

3. **API Endpoints Created**:
   - `/api/wealth/allocation` - Wealth allocation breakdown
   - `/api/wealth/charity` - Charity calculations
   - `/api/wealth/income` - Monthly income distribution

4. **Migration File Created** - `docs/migrations/028_add_asset_type_to_holdings.sql`
   - Adds `asset_type` column to holdings table

5. **Documentation Created**:
   - `docs/WEALTH_ALLOCATION_MODEL.md` - Complete model documentation
   - `docs/SETUP_INSTRUCTIONS.md` - Setup instructions for wealth allocation model

## ⚠️ Manual Steps Required

### 1. Run Database Migration

The `asset_type` column needs to be added to the `holdings` table. 

**Go to Supabase Dashboard → SQL Editor and run:**

```sql
-- Migration: Add asset_type column to holdings table
ALTER TABLE holdings 
  ADD COLUMN IF NOT EXISTS asset_type TEXT 
  CHECK (asset_type IN ('equity', 'etf', 'bond', 'money_market', 'cash'));

CREATE INDEX IF NOT EXISTS holdings_asset_type_idx ON holdings(asset_type);

COMMENT ON COLUMN holdings.asset_type IS 'Asset class type: equity, etf, bond, money_market, cash';
```

Or copy from: `docs/migrations/028_add_asset_type_to_holdings.sql`

### 2. Verify Service Role Key

The seed script requires a valid `SUPABASE_SERVICE_ROLE_KEY` in `apps/web/.env.local`.

**To get your service role key:**
1. Go to Supabase Dashboard → Settings → API
2. Scroll down to "service_role" key
3. Click "Reveal" to show the key
4. Copy the entire key

**Update `apps/web/.env.local`:**
```env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

⚠️ **Important**: The key should be a long JWT token (starts with `eyJ...`). If you see "Invalid API key" error, the key is incorrect or for a different project.

### 3. Run Seed Script

Once the migration is run and the service role key is correct:

```bash
cd apps/web
npx tsx scripts/seed-account.ts
```

This will create:
- 6 accounts ($1.5B total allocation)
- 2 portfolios
- Holdings with proper asset types
- Sample transactions

## Expected Output

After successful seeding, you should see:

```
🌱 Starting account seeding for: petermvita@hotmail.com
💰 Total Net Worth: $1500M USD
✅ User found: petermvita@hotmail.com
✅ Profile verified: pmvita (admin)
📦 Creating accounts...
✅ Created 6 accounts
📊 Account Allocation Summary:
   Safety & Financial Foundation Account: $600M (40.0%)
   Long Term Investing Account: $450M (30.0%)
   Lifestyle Allocation Checking Account: $150M (10.0%)
   Professional Advice & Structure Checking Account: $75M (5.0%)
   Cash Reserve Checking Account: $75M (5.0%)
   Charity & Giving Account: $0M (0.0%)
📊 Creating portfolios and holdings...
✅ Created 2 portfolios
✅ Created 9 holdings
💳 Creating sample transactions...
✅ Created 3 sample transactions
✅ Seeding completed successfully!
```

## Verification

After seeding, verify in Supabase Dashboard:

1. **Accounts Table**: Should have 6 accounts totaling $1.5B
2. **Portfolios Table**: Should have 2 portfolios
3. **Holdings Table**: Should have 9 holdings with `asset_type` populated
4. **Transactions Table**: Should have sample transactions

## Troubleshooting

### Error: "Invalid API key"
- Verify the service role key is correct and for the right project
- Key should start with `eyJ...` (JWT format)
- Get the key from: Supabase Dashboard → Settings → API → service_role key

### Error: "column asset_type does not exist"
- Run the migration first (step 1 above)

### Error: "Accounts already exist"
- The script detects existing accounts and skips seeding
- To re-seed, delete existing accounts first in Supabase Dashboard

