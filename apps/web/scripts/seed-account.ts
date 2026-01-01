// scripts/seed-account.ts
// Seed account with UHNWI wealth structure data for Pierre Mvita
// Uses service role key to bypass RLS
// Run with: npx tsx scripts/seed-account.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const USER_ID = 'b55ef620-c283-48f1-9127-90be294d160e';
const USER_EMAIL = 'petermvita@hotmail.com';

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

const ACCOUNTS: SeedAccount[] = [
  // Family Office Account (Swiss Private Banking)
  {
    name: 'Mvita Reserve Holdings LLC - Family Office Account',
    type: 'investment',
    currency: 'USD',
    balance: 60000000,
    account_number: 'CH-001-FO',
    iban: 'CH9300762011623852957',
  },
  // Offshore Account (Swiss Private Banking - 9% ROI)
  {
    name: 'Mvita Reserve Holdings LLC - Offshore Account',
    type: 'investment',
    currency: 'USD',
    balance: 57125000,
    account_number: 'CH-002-OFF',
    iban: 'CH9300762011623852958',
  },
  // Mvita Capital Investments - Swiss Private Banking
  {
    name: 'Mvita Capital Investments - Swiss Private Banking (Primary)',
    type: 'investment',
    currency: 'USD',
    balance: 500000000,
    account_number: 'CH-003-MCI-1',
    iban: 'CH9300762011623852959',
  },
  {
    name: 'Mvita Capital Investments - Swiss Private Banking (Secondary)',
    type: 'investment',
    currency: 'USD',
    balance: 100000000,
    account_number: 'CH-003-MCI-2',
    iban: 'CH9300762011623852960',
  },
  // Mvita Venture Capital - Swiss Private Banking
  {
    name: 'Mvita Venture Capital - Swiss Private Banking',
    type: 'investment',
    currency: 'USD',
    balance: 500000000,
    account_number: 'CH-004-MVC',
    iban: 'CH9300762011623852961',
  },
  // Mvita Syndicate - BMO Private Wealth
  {
    name: 'Mvita Syndicate - BMO Private Wealth',
    type: 'investment',
    currency: 'USD',
    balance: 100000000,
    account_number: 'CA-BMO-001',
    iban: 'CA0210000123456789012',
  },
  // Mvita Syndicate - RBC Private Wealth
  {
    name: 'Mvita Syndicate - RBC Private Wealth',
    type: 'investment',
    currency: 'USD',
    balance: 50000000,
    account_number: 'CA-RBC-001',
    iban: 'CA0210000123456789013',
  },
  // Mvita Capital - Emirates NBD Private Banking
  {
    name: 'Mvita Capital - Emirates NBD Private Banking',
    type: 'investment',
    currency: 'USD',
    balance: 5000000,
    account_number: 'AE-ENBD-001',
    iban: 'AE070331234567890123456',
  },
  // Mvita Capital - First Abu Dhabi Private Banking
  {
    name: 'Mvita Capital - First Abu Dhabi Private Banking',
    type: 'investment',
    currency: 'USD',
    balance: 5000000,
    account_number: 'AE-FAB-001',
    iban: 'AE070331234567890123457',
  },
  // Mvita Capital - WIO Business Banking
  {
    name: 'Mvita Capital - WIO Business Banking',
    type: 'checking',
    currency: 'USD',
    balance: 1000000,
    account_number: 'AE-WIO-001',
    iban: 'AE070331234567890123458',
  },
  // Mvita Inc - Liechtenstein Private Banking (Primary)
  {
    name: 'Mvita Inc - Liechtenstein Private Banking (Primary)',
    type: 'investment',
    currency: 'USD',
    balance: 100000000,
    account_number: 'LI-001-MI-1',
    iban: 'LI21088100002324013AA',
  },
  // Mvita Inc - Liechtenstein Private Banking (Secondary)
  {
    name: 'Mvita Inc - Liechtenstein Private Banking (Secondary)',
    type: 'investment',
    currency: 'USD',
    balance: 100000000,
    account_number: 'LI-001-MI-2',
    iban: 'LI21088100002324014AA',
  },
];

const PORTFOLIOS: SeedPortfolio[] = [
  {
    name: 'Venture Capital & Private Equity Portfolio',
    currency: 'USD',
    holdings: [
      {
        symbol: 'SECURENET',
        market_symbol: 'PRIVATE',
        name: 'SecureNet - 60% Equity',
        quantity: 1,
        purchase_price: 1200000000,
        current_price: 1200000000,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'daily',
      },
      {
        symbol: 'SYNDICATE-X',
        market_symbol: 'PRIVATE',
        name: 'Syndicate X - 60% Equity',
        quantity: 1,
        purchase_price: 1800000000,
        current_price: 1800000000,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'daily',
      },
      {
        symbol: 'MAPLE-AI',
        market_symbol: 'PRIVATE',
        name: 'MapleAI - 60% Equity',
        quantity: 1,
        purchase_price: 2000000000,
        current_price: 2000000000,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'daily',
      },
      {
        symbol: 'ORBITECH',
        market_symbol: 'PRIVATE',
        name: 'OrbitTech - 60% Equity',
        quantity: 1,
        purchase_price: 5100000000,
        current_price: 5100000000,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'daily',
      },
    ],
  },
  {
    name: 'Private Equity Holdings Portfolio',
    currency: 'USD',
    holdings: [
      {
        symbol: 'GOLDEN-MAPLE',
        market_symbol: 'PRIVATE',
        name: 'Golden Maple Circuit - 60% Equity',
        quantity: 1,
        purchase_price: 720000000,
        current_price: 720000000,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'daily',
      },
      {
        symbol: 'AGAPE-RECORDS',
        market_symbol: 'PRIVATE',
        name: 'Agape Records - 80% Equity',
        quantity: 1,
        purchase_price: 320000000,
        current_price: 320000000,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'daily',
      },
      {
        symbol: 'MAISON-AGAPE',
        market_symbol: 'PRIVATE',
        name: 'Maison Agape - 80% Equity',
        quantity: 1,
        purchase_price: 68000000,
        current_price: 68000000,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'daily',
      },
      {
        symbol: 'KINSHASA-SKY',
        market_symbol: 'PRIVATE',
        name: 'Kinshasa Sky Residences - 100% Equity',
        quantity: 1,
        purchase_price: 1000000000,
        current_price: 1000000000,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'daily',
      },
      {
        symbol: 'KIEAT-UNIV',
        market_symbol: 'PRIVATE',
        name: 'KIEAT University - 100% Equity',
        quantity: 1,
        purchase_price: 500000000,
        current_price: 500000000,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'daily',
      },
    ],
  },
  {
    name: 'Public Markets Portfolio',
    currency: 'USD',
    holdings: [
      {
        symbol: 'SPY',
        market_symbol: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        quantity: 100000,
        purchase_price: 450.00,
        current_price: 450.00,
        currency: 'USD',
        asset_type: 'etf',
        refresh_cadence: 'realtime',
      },
      {
        symbol: 'QQQ',
        market_symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        quantity: 50000,
        purchase_price: 380.00,
        current_price: 380.00,
        currency: 'USD',
        asset_type: 'etf',
        refresh_cadence: 'realtime',
      },
      {
        symbol: 'AAPL',
        market_symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10000,
        purchase_price: 175.00,
        current_price: 175.00,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'realtime',
      },
      {
        symbol: 'MSFT',
        market_symbol: 'MSFT',
        name: 'Microsoft Corporation',
        quantity: 10000,
        purchase_price: 380.00,
        current_price: 380.00,
        currency: 'USD',
        asset_type: 'equity',
        refresh_cadence: 'realtime',
      },
      {
        symbol: 'US10Y',
        market_symbol: '^TNX',
        name: 'US 10-Year Treasury Bond',
        quantity: 10000000,
        purchase_price: 100.00,
        current_price: 100.00,
        currency: 'USD',
        asset_type: 'bond',
        refresh_cadence: 'daily',
      },
    ],
  },
  {
    name: 'Crypto Reserves',
    currency: 'USD',
    holdings: [
      {
        symbol: 'BTC',
        market_symbol: 'BTC-USD',
        name: 'Bitcoin',
        quantity: 1000,
        purchase_price: 45000.00,
        current_price: 45000.00,
        currency: 'USD',
        asset_type: 'cash',
        refresh_cadence: 'realtime',
      },
      {
        symbol: 'ETH',
        market_symbol: 'ETH-USD',
        name: 'Ethereum',
        quantity: 10000,
        purchase_price: 3000.00,
        current_price: 3000.00,
        currency: 'USD',
        asset_type: 'cash',
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

    // Create portfolios and holdings
    console.log('\n📊 Creating portfolios and holdings...');
    const createdPortfolios = [];
    let portfoliosCreated = 0;
    let holdingsCreated = 0;

    for (const portfolioData of PORTFOLIOS) {
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
      createdPortfolios.push(portfolio);

      // Create holdings for this portfolio
      const holdingsToInsert = portfolioData.holdings.map((holding) => ({
        portfolio_id: portfolio.id,
        user_id: USER_ID,
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
    const familyOfficeAccount = createdAccounts?.find((acc) =>
      acc.name.includes('Family Office Account')
    );
    const offshoreAccount = createdAccounts?.find((acc) =>
      acc.name.includes('Offshore Account')
    );

    if (familyOfficeAccount) {
      // Annual dividends received
      transactions.push(
        {
          account_id: familyOfficeAccount.id,
          user_id: USER_ID,
          type: 'credit',
          amount: 30000000,
          currency: 'USD',
          description: 'SecureNet - Annual Dividend',
          category: 'dividend',
          date: new Date('2024-01-15').toISOString(),
        },
        {
          account_id: familyOfficeAccount.id,
          user_id: USER_ID,
          type: 'credit',
          amount: 42000000,
          currency: 'USD',
          description: 'Syndicate X - Annual Dividend',
          category: 'dividend',
          date: new Date('2024-01-15').toISOString(),
        },
        {
          account_id: familyOfficeAccount.id,
          user_id: USER_ID,
          type: 'credit',
          amount: 40000000,
          currency: 'USD',
          description: 'MapleAI - Annual Dividend',
          category: 'dividend',
          date: new Date('2024-01-15').toISOString(),
        },
        {
          account_id: familyOfficeAccount.id,
          user_id: USER_ID,
          type: 'credit',
          amount: 85000000,
          currency: 'USD',
          description: 'OrbitTech - Annual Dividend',
          category: 'dividend',
          date: new Date('2024-01-15').toISOString(),
        },
        {
          account_id: familyOfficeAccount.id,
          user_id: USER_ID,
          type: 'debit',
          amount: 10805000,
          currency: 'USD',
          description: 'Family Office - Staff Salaries',
          category: 'expense',
          date: new Date('2024-01-31').toISOString(),
        },
        {
          account_id: familyOfficeAccount.id,
          user_id: USER_ID,
          type: 'debit',
          amount: 10000000,
          currency: 'USD',
          description: 'Charity & Tithes',
          category: 'charity',
          date: new Date('2024-01-31').toISOString(),
        }
      );
    }

    if (offshoreAccount) {
      transactions.push({
        account_id: offshoreAccount.id,
        user_id: USER_ID,
        type: 'credit',
        amount: 57125000,
        currency: 'USD',
        description: 'Annual Income Allocation from VC&PE',
        category: 'income',
        date: new Date('2024-01-01').toISOString(),
      });
    }

    if (transactions.length > 0) {
      const { error: transactionsError } = await supabase.from('transactions').insert(transactions);

      if (transactionsError) {
        console.error('❌ Error creating transactions:', transactionsError.message);
      } else {
        console.log(`✅ Created ${transactions.length} transactions`);
      }
    }

    // Calculate total balance
    const totalBalance = ACCOUNTS.reduce((sum, acc) => sum + acc.balance, 0);
    console.log(`\n💰 Total Account Balance: $${(totalBalance / 1_000_000).toFixed(2)}M USD`);

    console.log('\n✅ Seeding completed successfully!');
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

