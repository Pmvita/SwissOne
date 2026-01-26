# Supabase Setup and Schema

This document describes the Supabase database schema for SwissOne.

## Environment Variables

Set the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

For mobile app, also set:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

### Users Table

The `auth.users` table is managed by Supabase Auth. We extend it with a `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Indexes for efficient lookups
CREATE INDEX profiles_username_idx ON profiles(username);
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_role_idx ON profiles(role);
```

### Accounts Table

```sql
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment', 'credit', 'loan')),
  currency TEXT NOT NULL DEFAULT 'CHF' CHECK (currency IN ('CHF', 'EUR', 'USD', 'GBP')),
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  account_number TEXT,
  iban TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own accounts
CREATE POLICY "Users can read own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own accounts
CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own accounts
CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own accounts
CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX accounts_user_id_idx ON accounts(user_id);
```

### Transactions Table

```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'transfer')),
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CHF',
  description TEXT NOT NULL,
  category TEXT,
  reference TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_account_id_idx ON transactions(account_id);
CREATE INDEX transactions_date_idx ON transactions(date DESC);
```

### Portfolio Table

```sql
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  total_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CHF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own portfolios
CREATE POLICY "Users can read own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can manage their own portfolios
CREATE POLICY "Users can manage own portfolios"
  ON portfolios FOR ALL
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX portfolios_user_id_idx ON portfolios(user_id);
```

### Holdings Table

```sql
CREATE TABLE holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(15, 4) NOT NULL,
  purchase_price DECIMAL(15, 2) NOT NULL,
  current_price DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CHF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read holdings from their portfolios
CREATE POLICY "Users can read own holdings"
  ON holdings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Policy: Users can manage holdings in their portfolios
CREATE POLICY "Users can manage own holdings"
  ON holdings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Index
CREATE INDEX holdings_portfolio_id_idx ON holdings(portfolio_id);
```

## Functions and Triggers

### Update updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Migrations

### Running Migrations

If you have an existing database, run the migration files in order:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files from `docs/migrations/` in order:
   - `001_update_profiles_table.sql` - Adds username, first_name, last_name, phone fields and INSERT policy
   - `002_add_username_lookup_function.sql` - Adds function for username lookup during login
   - `003_add_role_to_profiles.sql` - Adds role column for user authorization (admin/user)
   - `020_create_market_prices.sql` - Creates `market_prices` table for real-time AUM
   - `021_create_price_sources.sql` - Creates `price_sources` table
   - `022_create_valuation_snapshots.sql` - Creates `valuation_snapshots` table
   - `023_create_aum_history.sql` - Creates `aum_history` table
   - `024_extend_holdings_for_realtime.sql` - Extends `holdings` table with `market_symbol`, `asset_type`, `refresh_cadence`
   - `025_create_realtime_aum_function.sql` - Creates `calculate_realtime_aum` SQL function
   - `026_seed_price_sources.sql` - Seeds `price_sources` table with initial free provider configurations
   - `027_create_user_sessions.sql` - Creates `user_sessions` table for session tracking

### Migration: Update Profiles Table (001)

This migration adds the following to the `profiles` table:
- `username` (TEXT, UNIQUE) - For username-based login
- `first_name` (TEXT) - User's first name
- `last_name` (TEXT) - User's last name  
- `phone` (TEXT) - User's phone number
- Index on `username` for efficient login lookups
- INSERT policy so users can create their profile during signup

### Migration: Add Username Lookup Function (002)

This migration adds a database function that allows unauthenticated users to look up email and phone by username for login purposes:

- `get_user_credentials_by_username(username_lookup TEXT)` - Returns email and phone for a given username
- Uses `SECURITY DEFINER` to bypass RLS while keeping the query secure
- Only returns non-sensitive data (email and phone) needed for authentication
- Grants execute permission to `anon` and `authenticated` roles

**Why this is needed:** The profiles table has RLS enabled, which prevents unauthenticated users from querying profiles. During login, users need to look up their email by username before they can authenticate. This function provides a secure way to do that lookup.

### Migration: Add Role to Profiles (003)

This migration adds role-based authorization to the `profiles` table:

- `role` (TEXT, NOT NULL, DEFAULT 'user') - User role: 'admin' (full system access) or 'user' (standard access)
- CHECK constraint to ensure only valid roles ('admin', 'user')
- Index on `role` for efficient role-based queries
- Updates existing dev user (petermvita@hotmail.com) to 'admin' role and sets username to 'pmvita'

**Role Definitions:**
- **admin**: Full system access, can manage all users and data
- **user**: Standard banking access, limited to own data

**Note:** The role field defaults to 'user' for new registrations. Only administrators can change user roles.

### Migration: Create User Sessions Table (027)

This migration creates the `user_sessions` table for tracking active user sessions across dev and production environments:

- `user_sessions` table - Stores active user sessions with login time, last activity, IP address, and user agent
- Session tracking enables monitoring of active users across all server instances
- Sessions automatically expire after 24 hours of inactivity
- Admin and staff users can view active sessions via the Security Dashboard

**Key Features:**
- Sessions are shared across all server instances (dev/production)
- Automatic cleanup of expired sessions
- IP address and user agent tracking for security monitoring
- Role-based access control (admin/staff can view all sessions)

## Real-Time AUM Valuation System

The SwissOne platform includes a comprehensive real-time AUM (Assets Under Management) valuation system that uses free market data APIs to calculate live portfolio values.

### Architecture Overview

The system is built with a **provider-agnostic architecture** that abstracts all market data providers behind an internal `PricingService`. This means:

- **Client applications never call external APIs directly** - all market data requests go through internal server-side APIs
- **API keys are never exposed to the client** - all provider credentials are stored server-side only
- **Providers can be swapped without touching frontend code** - change provider configuration, and the system automatically uses the new provider
- **Automatic failover** - if one provider fails, the system automatically tries the next provider in priority order

### Database Schema

#### Market Prices Table

Stores real-time and historical market prices for various asset types:

```sql
CREATE TABLE market_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL, -- e.g., 'AAPL', 'SPY', 'US10Y'
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
```

#### Price Sources Table

Tracks free market data providers and their configurations:

```sql
CREATE TABLE price_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., 'yahoo_finance', 'alpha_vantage'
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Lower number = higher priority
  rate_limit_per_minute INTEGER,
  rate_limit_per_day INTEGER,
  api_key_required BOOLEAN DEFAULT false,
  base_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Valuation Snapshots Table

Stores point-in-time AUM calculations for historical tracking:

```sql
CREATE TABLE valuation_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  total_aum DECIMAL(20, 8) NOT NULL,
  total_aum_base_currency DECIMAL(20, 8) NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  daily_change DECIMAL(20, 8) DEFAULT 0,
  daily_change_percent DECIMAL(10, 4) DEFAULT 0,
  annual_return DECIMAL(10, 4),
  year_to_date_return DECIMAL(10, 4),
  snapshot_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### AUM History Table

Tracks historical AUM values for performance analysis:

```sql
CREATE TABLE aum_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  aum_value DECIMAL(20, 8) NOT NULL,
  base_currency TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Holdings Extensions

The `holdings` table has been extended with real-time pricing fields:

```sql
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS market_symbol TEXT;
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS refresh_cadence TEXT DEFAULT 'realtime' CHECK (refresh_cadence IN ('realtime', 'hourly', 'daily'));
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMP WITH TIME ZONE;
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS last_price DECIMAL(20, 8);
```

### Internal Pricing Service Architecture

The `PricingService` (`lib/services/pricing-service.ts`) is the **single point of access** for all market data. It:

1. **Abstracts all providers** - Client code never knows which provider is being used
2. **Manages failover** - Automatically tries providers in priority order if one fails
3. **Caches responses** - Reduces API calls and improves performance
4. **Handles rate limiting** - Respects provider rate limits automatically
5. **Validates data** - Ensures all price data meets schema requirements

**Usage Example:**

```typescript
import { PricingService } from '@/lib/services/pricing-service';

const pricingService = new PricingService();

// Get prices - provider is completely abstracted
const prices = await pricingService.getPrices([
  { symbol: 'AAPL', assetType: 'equity' },
  { symbol: 'SPY', assetType: 'etf' },
]);
```

### Supported Free Market Data Providers

The system supports multiple free market data providers with automatic failover:

1. **Yahoo Finance** (Default, Highest Priority)
   - No API key required
   - Completely free
   - Supports equities, ETFs, and some bonds

2. **Alpha Vantage** (Free Tier)
   - API key required (free at https://www.alphavantage.co/support/#api-key)
   - Rate limit: 5 calls/min, 500/day
   - Supports equities, ETFs, bonds, forex

3. **IEX Cloud** (Free Tier)
   - API key required (free at https://iexcloud.io/console/tokens)
   - Rate limit: 50k messages/month
   - Supports equities, ETFs, market data

4. **Finnhub** (Free Tier)
   - API key required (free at https://finnhub.io/register)
   - Rate limit: 60 calls/min
   - Supports equities, ETFs, market data

### Provider Configuration

Provider priority and configuration is managed in `lib/services/provider-config.ts`. To change provider priority:

1. Edit `provider-config.ts` and update the `PROVIDER_PRIORITY` array
2. Or set `MARKET_DATA_PROVIDER_PRIORITY` environment variable (comma-separated list)

**Example:**

```env
MARKET_DATA_PROVIDER_PRIORITY=yahoo_finance,alpha_vantage,iex_cloud,finnhub
```

### Swapping Providers

To swap providers without touching frontend code:

1. **Update provider priority** in `provider-config.ts` or environment variable
2. **Add/remove providers** by implementing the `MarketDataProvider` interface in `lib/services/providers/base-provider.ts`
3. **Register the provider** in `provider-config.ts`
4. **No frontend changes needed** - the `PricingService` handles everything

### Background Price Fetching

A background cron job (`/api/cron/fetch-prices`) runs daily to fetch and store market prices:

- **Vercel Cron Configuration**: Defined in `vercel.json`
- **Schedule**: Daily at 9:00 AM UTC (`0 9 * * *`)
- **Note**: Vercel Hobby plan limits cron jobs to once per day. For more frequent updates, consider:
  - Upgrading to Vercel Pro plan (allows minute/hourly schedules)
  - Using external cron services (e.g., cron-job.org, EasyCron)
  - Using Supabase Edge Functions with pg_cron
- **Refresh Cadence**:
  - Equities & ETFs: Daily (9 AM UTC)
  - Bonds & Cash: Daily (9 AM UTC)
- **Automatic Retry**: Failed requests are retried with the next provider in priority order

### Real-Time AUM Calculation

The `AUMCalculationService` (`lib/services/aum-calculation-service.ts`) calculates AUM by:

1. Fetching user holdings with `market_symbol`
2. Getting latest prices from `PricingService` (provider-agnostic)
3. Calculating market values for each holding
4. Aggregating total AUM across portfolios
5. Computing performance metrics (daily change, annual return, YTD return)

### Real-Time Updates via Supabase Realtime

The system uses **Supabase Realtime** (WebSocket-based) for real-time AUM updates:

- **Subscription Service**: `lib/services/aum-realtime-subscription.ts`
- **React Hook**: `hooks/use-realtime-aum.ts`
- **How it works**:
  1. Client subscribes to `market_prices` table changes via Supabase Realtime
  2. When prices update, AUM is automatically recalculated
  3. Updates are pushed to subscribed clients in real-time

**Usage Example:**

```typescript
import { useRealtimeAUM } from '@/hooks/use-realtime-aum';

function Dashboard() {
  const { aum, isLoading, error } = useRealtimeAUM({
    portfolioId: 'optional-portfolio-id',
    enabled: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Total AUM: ${aum?.totalAumBaseCurrency}</div>;
}
```

### API Endpoints

#### GET `/api/aum/realtime`

Get real-time AUM for the authenticated user.

**Query Parameters:**
- `portfolio_id` (optional): Filter by specific portfolio

**Response:**
```json
{
  "totalAum": 1000000.00,
  "totalAumBaseCurrency": 1000000.00,
  "baseCurrency": "USD",
  "assetClassBreakdown": { "EQUITY": 800000, "BOND": 200000 },
  "portfolioWeights": { "portfolio-1": 60, "portfolio-2": 40 },
  "dailyChange": 5000.00,
  "dailyChangePercent": 0.5,
  "annualReturn": 12.5,
  "yearToDateReturn": 8.3,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "holdingsCount": 25
}
```

#### GET `/api/portfolio/valuation`

Get detailed portfolio valuation.

**Query Parameters:**
- `portfolio_id` (required): Portfolio ID
- `include_history` (optional): Include historical snapshots

**Response:**
```json
{
  "portfolioId": "uuid",
  "portfolioName": "Growth Portfolio",
  "currentValue": 500000.00,
  "baseCurrency": "USD",
  "holdings": [...],
  "assetClassBreakdown": {...},
  "performance": {
    "dailyReturn": 0.5,
    "yearToDateReturn": 8.3,
    "annualReturn": 12.5
  },
  "history": [...]
}
```

### Environment Variables

Add the following to your `.env.local` (server-side only):

```env
# Free Market Data Provider API Keys (Server-Side Only)
# These keys are NEVER exposed to the client

# Alpha Vantage (optional - free tier: 5 calls/min, 500/day)
ALPHA_VANTAGE_API_KEY=your_key_here

# IEX Cloud (optional - free tier: 50k messages/month)
IEX_CLOUD_API_KEY=your_key_here

# Finnhub (optional - free tier: 60 calls/min)
FINNHUB_API_KEY=your_key_here

# Provider Priority (optional - defaults to: yahoo_finance, alpha_vantage, iex_cloud, finnhub)
MARKET_DATA_PROVIDER_PRIORITY=yahoo_finance,alpha_vantage,iex_cloud,finnhub
```

**Note:** Yahoo Finance requires no API key and is used by default.

### Migrations

Run the following migrations in order:

1. `020_create_market_prices.sql` - Creates `market_prices` table
2. `021_create_price_sources.sql` - Creates `price_sources` table
3. `022_create_valuation_snapshots.sql` - Creates `valuation_snapshots` table
4. `023_create_aum_history.sql` - Creates `aum_history` table
5. `024_extend_holdings_realtime.sql` - Extends `holdings` table with real-time fields
6. `025_create_realtime_aum_function.sql` - Creates database function for AUM calculation
7. `026_seed_price_sources.sql` - Seeds `price_sources` table with provider configurations

### Security Considerations

- **API Keys**: All provider API keys are stored server-side only and never exposed to the client
- **RLS Policies**: All tables have Row-Level Security enabled to ensure users can only access their own data
- **Rate Limiting**: Provider rate limits are respected to prevent API abuse
- **Data Validation**: All price data is validated against schema constraints before storage
- **Error Handling**: Partial API failures are handled gracefully with automatic failover

## Setup Instructions

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema scripts above in the Supabase SQL Editor
3. If you have an existing database, run the migration files from `docs/migrations/` in order
4. Copy your project URL and API keys from Settings > API
5. Add them to your `.env` files (see Environment Variables section)
6. (Optional) Add free market data provider API keys to `.env.local` for additional providers
7. Enable Supabase Realtime for the `market_prices` table in Supabase Dashboard > Database > Replication

