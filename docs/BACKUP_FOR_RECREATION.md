# SwissOne Project Backup - For Full Recreation

This document contains everything needed to recreate the SwissOne project from scratch.

## ⚠️ Important Credentials

### Dev User Account
- **Email:** `petermvita@hotmail.com`
- **Username:** `pmvita`
- **Password:** `admin123`
- **Role:** Admin

---

## Complete Database Schema

Run this in the Supabase SQL Editor to create the full database schema:

```sql
-- ============================================
-- PROFILES TABLE
-- ============================================
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

-- Policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Indexes
CREATE INDEX profiles_username_idx ON profiles(username);
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_role_idx ON profiles(role);

-- ============================================
-- ACCOUNTS TABLE
-- ============================================
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

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX accounts_user_id_idx ON accounts(user_id);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
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

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_account_id_idx ON transactions(account_id);
CREATE INDEX transactions_date_idx ON transactions(date DESC);

-- ============================================
-- PORTFOLIOS TABLE
-- ============================================
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  total_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CHF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own portfolios"
  ON portfolios FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX portfolios_user_id_idx ON portfolios(user_id);

-- ============================================
-- HOLDINGS TABLE
-- ============================================
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

ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own holdings"
  ON holdings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own holdings"
  ON holdings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = holdings.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE INDEX holdings_portfolio_id_idx ON holdings(portfolio_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Username lookup function for login
CREATE OR REPLACE FUNCTION public.get_user_credentials_by_username(username_lookup TEXT)
RETURNS TABLE (
  email TEXT,
  phone TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.email,
    p.phone
  FROM profiles p
  WHERE p.username = username_lookup
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_credentials_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_credentials_by_username(TEXT) TO authenticated;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Environment Variables

After creating the new Supabase project, update these in `.env.local` (web) and `.env` (mobile):

```env
NEXT_PUBLIC_SUPABASE_URL=your_new_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_supabase_service_role_key

# For mobile app:
EXPO_PUBLIC_SUPABASE_URL=your_new_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_new_supabase_anon_key
```

---

## Steps to Recreate

1. **Delete Supabase Project:**
   - Go to https://supabase.com/dashboard
   - Navigate to your project settings
   - Delete the project

2. **Create New Supabase Project:**
   - Create a new project
   - Choose the same region if possible
   - Copy the project URL and API keys

3. **Run the SQL Schema:**
   - Go to SQL Editor
   - Paste and run the complete schema above

4. **Create Dev User:**
   - Go to Authentication → Users
   - Click "Add User" → "Create new user"
   - Email: `petermvita@hotmail.com`
   - Password: `admin123`
   - After creating, update the profile:
     ```sql
     UPDATE profiles
     SET username = 'pmvita', role = 'admin'
     WHERE email = 'petermvita@hotmail.com';
     ```

5. **Update Environment Variables:**
   - Update `.env.local` and `.env` files with new credentials

6. **Test Login:**
   - Use `pmvita` / `admin123` to login

---

## Project Structure Notes

- Monorepo with npm workspaces
- `apps/web` - Next.js app
- `apps/mobile` - React Native/Expo app
- `packages/shared` - Shared code

