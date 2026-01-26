// scripts/seed-account.ts
// Seed account with UHNWI wealth structure data for Pierre Mvita
// Uses service role key to bypass RLS
// Run with: npx tsx scripts/seed-account.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables - try multiple locations
const envPaths = [
  resolve(process.cwd(), 'apps/web/.env.local'), // Web app .env.local (when run from root)
  resolve(process.cwd(), '.env.local'),           // Root .env.local
  resolve(process.cwd(), '.env'),                 // Root .env
];

let loaded = false;
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    const relativePath = envPath.replace(process.cwd() + '/', '');
    console.log(`📄 Loaded environment from ${relativePath}`);
    loaded = true;
    break;
  }
}

if (!loaded) {
  console.warn('⚠️  No .env file found. Trying default locations...');
  dotenv.config(); // Try default dotenv behavior
}

const USER_ID = 'b55ef620-c283-48f1-9127-90be294d160e';
const USER_EMAIL = 'petermvita@hotmail.com';

// Total AUM: $1,000,000,000 USD
const TOTAL_NET_WORTH = 1_000_000_000;

interface SeedAccount {
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit' | 'loan';
  currency: 'USD' | 'CHF' | 'EUR' | 'GBP';
  balance: number;
  account_number?: string;
  iban?: string;
}

interface SeedPortfolio {
  name: string;
  account_name: string; // Which account this portfolio belongs to
  currency: 'USD' | 'CHF' | 'EUR' | 'GBP';
  holdings: Array<{
    symbol: string;
    market_symbol?: string;
    name: string;
    quantity: number;
    purchase_price: number;
    current_price: number;
    currency: 'USD' | 'CHF' | 'EUR' | 'GBP';
    asset_type: 'equity' | 'etf' | 'bond' | 'money_market' | 'cash';
    refresh_cadence: 'realtime' | 'daily' | 'weekly' | 'monthly';
  }>;
}

// Wealth Allocation Model - Total: $1,000,000,000 USD
const ACCOUNTS: SeedAccount[] = [
  // 1. Safety & Financial Foundation Account (40% = $400M)
  {
    name: 'Safety & Financial Foundation Account',
    type: 'savings',
    currency: 'USD',
    balance: 400_000_000,
    account_number: 'CH-001-SAFETY',
    iban: 'CH9300762011623852957',
  },
  
  // 2. Long Term Investing Account (30% = $300M)
  {
    name: 'Long Term Investing Account',
    type: 'investment',
    currency: 'USD',
    balance: 300_000_000,
    account_number: 'CH-002-LT-INVEST',
    iban: 'CH9300762011623852958',
  },
  
  // 3. Lifestyle Allocation Checking Account 1 (10% = $100M)
  {
    name: 'Lifestyle Allocation Checking Account',
    type: 'checking',
    currency: 'USD',
    balance: 100_000_000,
    account_number: 'CH-003-LIFESTYLE',
    iban: 'CH9300762011623852959',
  },
  
  // 4. Professional Advice & Structure Checking Account 2 (5% = $50M)
  {
    name: 'Professional Advice & Structure Checking Account',
    type: 'checking',
    currency: 'USD',
    balance: 50_000_000,
    account_number: 'CH-004-PROF-ADV',
    iban: 'CH9300762011623852960',
  },
  
  // 5. Cash Reserve Checking Account 3 (5% = $50M)
  {
    name: 'Cash Reserve Checking Account',
    type: 'checking',
    currency: 'USD',
    balance: 50_000_000,
    account_number: 'CH-005-CASH-RES',
    iban: 'CH9300762011623852961',
  },
  
  // 6. Charity Account (Checking Account 4) - Funded from 10% of annual returns
  {
    name: 'Charity & Giving Account',
    type: 'checking',
    currency: 'USD',
    balance: 0, // Starts at $0, funded annually from returns
    account_number: 'CH-006-CHARITY',
    iban: 'CH9300762011623852962',
  },
];

// Portfolios mapped to accounts with appropriate asset mixes
const PORTFOLIOS: SeedPortfolio[] = [
  // Safety & Financial Foundation Portfolio (40% = $400M)
  // Asset mix: High interest savings, Government bonds, Money market funds
  {
    name: 'Safety & Financial Foundation Portfolio',
    account_name: 'Safety & Financial Foundation Account',
    currency: 'USD',
    holdings: [
      // Government Bonds - 60% of Safety Account ($240M)
      {
        symbol: 'US10Y',
        market_symbol: '^TNX',
        name: 'US 10-Year Treasury Bond',
        quantity: 1_600_000, // $160M at $100 par value
        purchase_price: 100.00,
        current_price: 100.00,
        currency: 'USD',
        asset_type: 'bond',
        refresh_cadence: 'daily',
      },
      {
        symbol: 'US30Y',
        market_symbol: '^TYX',
        name: 'US 30-Year Treasury Bond',
        quantity: 800_000, // $80M at $100 par value
        purchase_price: 100.00,
        current_price: 100.00,
        currency: 'USD',
        asset_type: 'bond',
        refresh_cadence: 'daily',
      },
      // Money Market Funds - 40% of Safety Account ($160M)
      {
        symbol: 'MMF-PRIME',
        market_symbol: 'PRIVATE',
        name: 'Prime Money Market Fund',
        quantity: 160_000_000,
        purchase_price: 1.00,
        current_price: 1.00,
        currency: 'USD',
        asset_type: 'money_market',
        refresh_cadence: 'daily',
      },
    ],
  },
  
  // Long Term Investing Portfolio (30% = $300M)
  // Asset mix: Global equity ETFs, Dividend paying stocks
  // This is the base for "living off returns" (4% withdrawal rate = $12M/year)
  {
    name: 'Long Term Investing Portfolio',
    account_name: 'Long Term Investing Account',
    currency: 'USD',
    holdings: [
      // Global Equity ETFs - 60% of Long Term Account ($180M)
      {
        symbol: 'SPY',
        market_symbol: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        quantity: 333_333, // $150M at $450/share
        purchase_price: 450.00,
        current_price: 450.00,
        currency: 'USD',
        asset_type: 'etf',
        refresh_cadence: 'realtime',
      },
      {
        symbol: 'VT',
        market_symbol: 'VT',
        name: 'Vanguard Total World Stock ETF',
        quantity: 66_667, // $30M at $450/share
        purchase_price: 450.00,
        current_price: 450.00,
        currency: 'USD',
        asset_type: 'etf',
        refresh_cadence: 'realtime',
      },
      // Dividend Paying Stocks - 40% of Long Term Account ($120M)
      {
        symbol: 'AAPL',
        market_symbol: 'AAPL',
        name: 'Apple Inc. (Dividend Stock)',
        quantity: 571_428, // $100M at $175/share (exact: 571428.571...)
        purchase_price: 175.00,
        current_price: 175.00,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'realtime',
      },
      {
        symbol: 'MSFT',
        market_symbol: 'MSFT',
        name: 'Microsoft Corporation (Dividend Stock)',
        quantity: 52_631, // $20M at $380/share (exact: 52631.578...)
        purchase_price: 380.00,
        current_price: 380.00,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'realtime',
      },
    ],
  },
];

async function seedAccount() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not configured');
    console.error('   Make sure .env.local exists and contains NEXT_PUBLIC_SUPABASE_URL');
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured');
    console.error('   Add it to .env.local:');
    console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
    console.error('');
    console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
    console.error('   (Note: This key bypasses RLS - keep it secret!)');
    process.exit(1);
  }

  // Create admin client with service role (bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('🌱 Starting account seeding for:', USER_EMAIL);
  console.log(`💰 Total Net Worth: $${(TOTAL_NET_WORTH / 1_000_000).toFixed(0)}M USD`);

  try {
    // Verify user exists
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(USER_ID);

    if (authError || !authUser.user) {
      console.error('❌ User not found:', authError?.message);
      process.exit(1);
    }

    console.log('✅ User found:', authUser.user.email);

    // Verify profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, username, role')
      .eq('id', USER_ID)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError?.message);
      process.exit(1);
    }

    if (profile.role !== 'admin') {
      console.error('❌ User is not an admin. Role:', profile.role);
      process.exit(1);
    }

    console.log('✅ Profile verified:', profile.username, `(${profile.role})`);

    // Check if accounts already exist
    const { data: existingAccounts, error: accountsCheckError } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('user_id', USER_ID)
      .limit(1);

    if (accountsCheckError) {
      console.error('❌ Error checking existing accounts:', accountsCheckError.message);
      process.exit(1);
    }

    if (existingAccounts && existingAccounts.length > 0) {
      console.log('⚠️  Accounts already exist. Skipping seed.');
      console.log('   To re-seed, delete existing accounts first.');
      return;
    }

    // Create accounts
    console.log('\n📦 Creating accounts...');
    const accountsToInsert = ACCOUNTS.map((acc) => ({
      user_id: USER_ID,
      name: acc.name,
      type: acc.type,
      currency: acc.currency,
      balance: acc.balance,
      account_number: acc.account_number,
      iban: acc.iban,
    }));

    const { data: createdAccounts, error: accountsError } = await supabase
      .from('accounts')
      .insert(accountsToInsert)
      .select('id, name, balance, currency');

    if (accountsError) {
      console.error('❌ Error creating accounts:', accountsError.message);
      process.exit(1);
    }

    console.log(`✅ Created ${createdAccounts?.length || 0} accounts`);
    
    // Log account allocation
    console.log('\n📊 Account Allocation Summary:');
    for (const acc of ACCOUNTS) {
      const percentage = ((acc.balance / TOTAL_NET_WORTH) * 100).toFixed(1);
      console.log(`   ${acc.name}: $${(acc.balance / 1_000_000).toFixed(0)}M (${percentage}%)`);
    }

    // Verify total
    const totalBalance = ACCOUNTS.reduce((sum, acc) => sum + acc.balance, 0);
    console.log(`\n   Total: $${(totalBalance / 1_000_000).toFixed(0)}M USD`);

    // Create portfolios and holdings
    console.log('\n📊 Creating portfolios and holdings...');
    const createdPortfolios = [];
    let portfoliosCreated = 0;
    let holdingsCreated = 0;

    for (const portfolioData of PORTFOLIOS) {
      // Find the account for this portfolio
      const account = createdAccounts?.find((acc) => acc.name === portfolioData.account_name);
      
      if (!account) {
        console.error(`❌ Account not found for portfolio ${portfolioData.name}: ${portfolioData.account_name}`);
        continue;
      }

      // Create portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          user_id: USER_ID,
          name: portfolioData.name,
          currency: portfolioData.currency,
          total_value: 0, // Will be calculated from holdings
        })
        .select('id')
        .single();

      if (portfolioError) {
        console.error(`❌ Error creating portfolio ${portfolioData.name}:`, portfolioError.message);
        continue;
      }

      portfoliosCreated++;
      createdPortfolios.push({ ...portfolio, account_id: account.id });

      // Create holdings for this portfolio
      const holdingsToInsert = portfolioData.holdings.map((holding) => ({
        portfolio_id: portfolio.id,
        symbol: holding.symbol,
        market_symbol: holding.market_symbol || holding.symbol,
        name: holding.name,
        quantity: holding.quantity,
        purchase_price: holding.purchase_price,
        current_price: holding.current_price,
        currency: holding.currency,
        asset_type: holding.asset_type,
        refresh_cadence: holding.refresh_cadence,
      }));

      const { error: holdingsError } = await supabase.from('holdings').insert(holdingsToInsert);

      if (holdingsError) {
        console.error(`❌ Error creating holdings for ${portfolioData.name}:`, holdingsError.message);
        continue;
      }

      holdingsCreated += holdingsToInsert.length;
    }

    console.log(`✅ Created ${portfoliosCreated} portfolios`);
    console.log(`✅ Created ${holdingsCreated} holdings`);

    // Create sample transactions
    console.log('\n💳 Creating sample transactions...');
    const transactions = [];
    
    const lifestyleAccount = createdAccounts?.find((acc) =>
      acc.name.includes('Lifestyle Allocation')
    );
    const charityAccount = createdAccounts?.find((acc) =>
      acc.name.includes('Charity')
    );
    const longTermAccount = createdAccounts?.find((acc) =>
      acc.name.includes('Long Term Investing')
    );

    // Sample transactions for Lifestyle Account
    if (lifestyleAccount) {
      // Annual personal income: $12M (4% of $300M Long Term Investing Account)
      // After charity (10% of returns = $1.2M), remaining $10.8M goes to Lifestyle Account
      // Monthly income: $900K
      transactions.push(
        {
          account_id: lifestyleAccount.id,
          user_id: USER_ID,
          type: 'credit',
          amount: 900_000,
          currency: 'USD',
          description: 'Monthly Income Distribution (Living Off Returns)',
          category: 'income',
          date: new Date('2024-01-01').toISOString(),
        },
        {
          account_id: lifestyleAccount.id,
          user_id: USER_ID,
          type: 'debit',
          amount: 300_000,
          currency: 'USD',
          description: 'Monthly Personal Expenses',
          category: 'expense',
          date: new Date('2024-01-15').toISOString(),
        }
      );
    }

    // Sample charity transaction (10% of annual returns from Long Term Investing)
    // Annual returns on $300M @ 5-7% = $15M - $21M
    // Charity: 10% of $18M (avg) = $1.8M
    if (charityAccount && longTermAccount) {
      transactions.push({
        account_id: charityAccount.id,
        user_id: USER_ID,
        type: 'credit',
        amount: 1_800_000,
        currency: 'USD',
        description: 'Annual Charity Distribution (10% of Long Term Investing Returns)',
        category: 'income',
        date: new Date('2024-01-31').toISOString(),
      });
    }

    if (transactions.length > 0) {
      const { error: transactionsError } = await supabase.from('transactions').insert(transactions);

      if (transactionsError) {
        console.error('❌ Error creating transactions:', transactionsError.message);
      } else {
        console.log(`✅ Created ${transactions.length} sample transactions`);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📋 Wealth Allocation Model Summary:');
    console.log('   1. Safety & Financial Foundation: $400M (40%)');
    console.log('   2. Long Term Investing: $300M (30%)');
    console.log('   3. Lifestyle Allocation: $100M (10%)');
    console.log('   4. Professional Advice & Structure: $50M (5%)');
    console.log('   5. Cash Reserve: $50M (5%)');
    console.log('   6. Charity Account: Funded annually from 10% of returns');
    console.log('\n💰 Living Off Returns Logic:');
    console.log('   - Invested Base: $300M (Long Term Investing Account)');
    console.log('   - Annual Withdrawal Rate: 4%');
    console.log('   - Annual Personal Income: $12M');
    console.log('   - Monthly Income: $900K');
    console.log('   - Charity: 10% of annual returns (approx $1.8M/year)');
    console.log('   - Remaining Income: $10.2M/year to Lifestyle Account');
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed script
seedAccount()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
