// scripts/verify-and-cleanup-aum.ts
// Verify and clean up database to ensure $1B AUM for admin account
// Uses service role key to bypass RLS
// Run with: npx tsx scripts/verify-and-cleanup-aum.ts [--cleanup]

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables - try multiple locations
const envPaths = [
  resolve(process.cwd(), '.env.local'),           // Root .env.local
  resolve(process.cwd(), 'apps/web/.env.local'), // Web app .env.local
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
const TARGET_AUM = 1_000_000_000; // $1B USD

interface VerificationResult {
  accountsTotal: number;
  accountsCount: number;
  holdingsTotal: number;
  holdingsCount: number;
  portfoliosCount: number;
  transactionsCount: number;
  accounts: any[];
  portfolios: any[];
  holdings: any[];
  issues: string[];
}

async function verifyDatabase(supabase: any): Promise<VerificationResult> {
  const result: VerificationResult = {
    accountsTotal: 0,
    accountsCount: 0,
    holdingsTotal: 0,
    holdingsCount: 0,
    portfoliosCount: 0,
    transactionsCount: 0,
    accounts: [],
    portfolios: [],
    holdings: [],
    issues: [],
  };

  console.log('🔍 Verifying database state...\n');

  // Get accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false });

  if (accountsError) {
    console.error('❌ Error fetching accounts:', accountsError.message);
    result.issues.push(`Failed to fetch accounts: ${accountsError.message}`);
    return result;
  }

  result.accounts = accounts || [];
  result.accountsCount = result.accounts.length;
  result.accountsTotal = result.accounts.reduce(
    (sum, acc) => sum + Number(acc.balance || 0),
    0
  );

  // Get portfolios
  const { data: portfolios, error: portfoliosError } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false });

  if (portfoliosError) {
    console.error('❌ Error fetching portfolios:', portfoliosError.message);
    result.issues.push(`Failed to fetch portfolios: ${portfoliosError.message}`);
  } else {
    result.portfolios = portfolios || [];
    result.portfoliosCount = result.portfolios.length;
  }

  // Get holdings
  if (result.portfolios.length > 0) {
    const portfolioIds = result.portfolios.map((p: any) => p.id);
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select('*')
      .in('portfolio_id', portfolioIds);

    if (holdingsError) {
      console.error('❌ Error fetching holdings:', holdingsError.message);
      result.issues.push(`Failed to fetch holdings: ${holdingsError.message}`);
    } else {
      result.holdings = holdings || [];
      result.holdingsCount = result.holdings.length;
      result.holdingsTotal = result.holdings.reduce(
        (sum, h) => sum + Number(h.quantity || 0) * Number(h.current_price || 0),
        0
      );
    }
  }

  // Get transactions count
  const { count: transactionsCount, error: transactionsError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', USER_ID);

  if (!transactionsError) {
    result.transactionsCount = transactionsCount || 0;
  }

  // Check for issues
  const aumDifference = result.accountsTotal - TARGET_AUM;
  if (Math.abs(aumDifference) > 1000) {
    // Allow $1K tolerance for rounding
    result.issues.push(
      `AUM mismatch: Accounts total $${(result.accountsTotal / 1_000_000).toFixed(2)}M, expected $${(TARGET_AUM / 1_000_000).toFixed(0)}M (difference: $${(aumDifference / 1_000_000).toFixed(2)}M)`
    );
  }

  if (result.accountsCount === 0) {
    result.issues.push('No accounts found for user');
  }

  return result;
}

function printVerificationReport(result: VerificationResult) {
  console.log('📊 Verification Report\n');
  console.log('═'.repeat(60));
  console.log(`User: ${USER_EMAIL}`);
  console.log(`User ID: ${USER_ID}`);
  console.log('═'.repeat(60));
  console.log('\n📦 Accounts:');
  console.log(`   Count: ${result.accountsCount}`);
  console.log(`   Total Balance: $${(result.accountsTotal / 1_000_000).toFixed(2)}M`);
  console.log(`   Target AUM: $${(TARGET_AUM / 1_000_000).toFixed(0)}M`);
  const aumDiff = result.accountsTotal - TARGET_AUM;
  if (Math.abs(aumDiff) > 1000) {
    console.log(`   ⚠️  Difference: $${(aumDiff / 1_000_000).toFixed(2)}M`);
  } else {
    console.log(`   ✅ AUM matches target`);
  }

  if (result.accounts.length > 0) {
    console.log('\n   Account Details:');
    result.accounts.forEach((acc) => {
      const percentage = (Number(acc.balance || 0) / TARGET_AUM) * 100;
      console.log(
        `   - ${acc.name}: $${(Number(acc.balance || 0) / 1_000_000).toFixed(2)}M (${percentage.toFixed(1)}%)`
      );
    });
  }

  console.log('\n📊 Portfolios:');
  console.log(`   Count: ${result.portfoliosCount}`);
  if (result.portfolios.length > 0) {
    console.log('\n   Portfolio Details:');
    result.portfolios.forEach((p) => {
      console.log(`   - ${p.name}`);
    });
  }

  console.log('\n💼 Holdings:');
  console.log(`   Count: ${result.holdingsCount}`);
  console.log(`   Total Value: $${(result.holdingsTotal / 1_000_000).toFixed(2)}M`);
  if (result.holdings.length > 0) {
    const holdingsByPortfolio = new Map<string, any[]>();
    result.holdings.forEach((h) => {
      const portfolio = result.portfolios.find((p) => p.id === h.portfolio_id);
      const portfolioName = portfolio?.name || 'Unknown';
      if (!holdingsByPortfolio.has(portfolioName)) {
        holdingsByPortfolio.set(portfolioName, []);
      }
      holdingsByPortfolio.get(portfolioName)!.push(h);
    });

    console.log('\n   Holdings by Portfolio:');
    for (const [portfolioName, holdings] of holdingsByPortfolio.entries()) {
      const portfolioValue = holdings.reduce(
        (sum, h) => sum + Number(h.quantity || 0) * Number(h.current_price || 0),
        0
      );
      console.log(`   - ${portfolioName}: $${(portfolioValue / 1_000_000).toFixed(2)}M (${holdings.length} holdings)`);
    }
  }

  console.log('\n💳 Transactions:');
  console.log(`   Count: ${result.transactionsCount}`);

  if (result.issues.length > 0) {
    console.log('\n⚠️  Issues Found:');
    result.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  } else {
    console.log('\n✅ No issues found!');
  }

  console.log('\n' + '═'.repeat(60));
}

async function cleanupDatabase(supabase: any, result: VerificationResult) {
  console.log('\n🧹 Starting cleanup...\n');

  // Delete transactions first (foreign key constraints)
  if (result.transactionsCount > 0) {
    console.log(`   Deleting ${result.transactionsCount} transactions...`);
    const { error: transactionsError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', USER_ID);

    if (transactionsError) {
      console.error(`   ❌ Error deleting transactions: ${transactionsError.message}`);
    } else {
      console.log(`   ✅ Deleted ${result.transactionsCount} transactions`);
    }
  }

  // Delete holdings (foreign key constraints)
  if (result.holdingsCount > 0) {
    console.log(`   Deleting ${result.holdingsCount} holdings...`);
    if (result.portfolios.length > 0) {
      const portfolioIds = result.portfolios.map((p: any) => p.id);
      const { error: holdingsError } = await supabase
        .from('holdings')
        .delete()
        .in('portfolio_id', portfolioIds);

      if (holdingsError) {
        console.error(`   ❌ Error deleting holdings: ${holdingsError.message}`);
      } else {
        console.log(`   ✅ Deleted ${result.holdingsCount} holdings`);
      }
    }
  }

  // Delete portfolios
  if (result.portfoliosCount > 0) {
    console.log(`   Deleting ${result.portfoliosCount} portfolios...`);
    const { error: portfoliosError } = await supabase
      .from('portfolios')
      .delete()
      .eq('user_id', USER_ID);

    if (portfoliosError) {
      console.error(`   ❌ Error deleting portfolios: ${portfoliosError.message}`);
    } else {
      console.log(`   ✅ Deleted ${result.portfoliosCount} portfolios`);
    }
  }

  // Delete accounts
  if (result.accountsCount > 0) {
    console.log(`   Deleting ${result.accountsCount} accounts...`);
    const { error: accountsError } = await supabase
      .from('accounts')
      .delete()
      .eq('user_id', USER_ID);

    if (accountsError) {
      console.error(`   ❌ Error deleting accounts: ${accountsError.message}`);
    } else {
      console.log(`   ✅ Deleted ${result.accountsCount} accounts`);
    }
  }

  console.log('\n✅ Cleanup completed!');
  console.log('   You can now run the seed script to create fresh $1B AUM data.');
  console.log('   Run: npx tsx apps/web/scripts/seed-account.ts\n');
}

async function main() {
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
    process.exit(1);
  }

  // Create admin client with service role (bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Verify user exists
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(USER_ID);

  if (authError || !authUser.user) {
    console.error('❌ User not found:', authError?.message);
    process.exit(1);
  }

  console.log(`✅ User found: ${authUser.user.email}\n`);

  // Verify database
  const result = await verifyDatabase(supabase);
  printVerificationReport(result);

  // Check if cleanup is requested
  const args = process.argv.slice(2);
  const shouldCleanup = args.includes('--cleanup') || args.includes('-c');

  if (shouldCleanup) {
    console.log('\n⚠️  WARNING: This will delete all accounts, portfolios, holdings, and transactions for this user!');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await cleanupDatabase(supabase, result);
  } else if (result.issues.length > 0) {
    console.log('\n💡 To clean up and re-seed, run:');
    console.log('   npx tsx scripts/verify-and-cleanup-aum.ts --cleanup');
    console.log('   Then: npx tsx apps/web/scripts/seed-account.ts\n');
  }

  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
