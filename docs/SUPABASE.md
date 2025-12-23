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
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
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

## Setup Instructions

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema scripts above in the Supabase SQL Editor
3. Copy your project URL and API keys from Settings > API
4. Add them to your `.env` files (see Environment Variables section)

