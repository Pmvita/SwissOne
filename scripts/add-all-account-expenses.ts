// scripts/add-all-account-expenses.ts
// Add realistic expenses for all accounts based on their type and purpose
// Run with: npx tsx scripts/add-all-account-expenses.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables
const envPaths = [
  resolve(process.cwd(), 'apps/web/.env.local'),
  resolve(process.cwd(), '.env.local'),
  resolve(process.cwd(), '.env'),
];

let loaded = false;
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loaded = true;
    break;
  }
}

if (!loaded) {
  dotenv.config();
}

const USER_ID = 'b55ef620-c283-48f1-9127-90be294d160e';

interface ExpenseConfig {
  accountNamePattern: string;
  expenses: Array<{
    description: string;
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'annual';
    category: string;
    months?: number[]; // Specific months (1-12) for annual expenses
  }>;
}

// Define realistic expenses for each account type
const EXPENSE_CONFIGS: ExpenseConfig[] = [
  {
    accountNamePattern: 'Safety & Financial Foundation',
    expenses: [
      {
        description: 'Account Maintenance Fee',
        amount: 500,
        frequency: 'monthly',
        category: 'fees',
      },
      {
        description: 'Investment Management Fee (0.15% of balance)',
        amount: 50_000, // 0.15% of $400M / 12 months ≈ $50K/month
        frequency: 'monthly',
        category: 'fees',
      },
      {
        description: 'Custody & Safekeeping Fee',
        amount: 2_000,
        frequency: 'monthly',
        category: 'fees',
      },
    ],
  },
  {
    accountNamePattern: 'Long Term Investing',
    expenses: [
      {
        description: 'Portfolio Management Fee (0.20% of balance)',
        amount: 50_000, // 0.20% of $300M / 12 months ≈ $50K/month
        frequency: 'monthly',
        category: 'fees',
      },
      {
        description: 'Trading & Execution Fees',
        amount: 15_000,
        frequency: 'monthly',
        category: 'fees',
      },
      {
        description: 'Performance Reporting & Analytics',
        amount: 3_000,
        frequency: 'monthly',
        category: 'fees',
      },
      {
        description: 'Tax Reporting & Documentation',
        amount: 5_000,
        frequency: 'quarterly',
        category: 'fees',
      },
    ],
  },
  {
    accountNamePattern: 'Lifestyle Allocation',
    expenses: [
      {
        description: 'Monthly Personal Expenses',
        amount: 300_000,
        frequency: 'monthly',
        category: 'expense',
      },
      {
        description: 'Property Maintenance & Upkeep',
        amount: 25_000,
        frequency: 'monthly',
        category: 'expense',
      },
      {
        description: 'Insurance Premiums (Property, Health, Life)',
        amount: 15_000,
        frequency: 'monthly',
        category: 'expense',
      },
      {
        description: 'Utilities & Services',
        amount: 8_000,
        frequency: 'monthly',
        category: 'expense',
      },
      {
        description: 'Travel & Leisure',
        amount: 50_000,
        frequency: 'monthly',
        category: 'expense',
      },
      {
        description: 'Charitable Donations (Personal)',
        amount: 20_000,
        frequency: 'monthly',
        category: 'expense',
      },
      {
        description: 'Dining & Entertainment',
        amount: 15_000,
        frequency: 'monthly',
        category: 'expense',
      },
      {
        description: 'Shopping & Personal Items',
        amount: 30_000,
        frequency: 'monthly',
        category: 'expense',
      },
      {
        description: 'Healthcare & Wellness',
        amount: 10_000,
        frequency: 'monthly',
        category: 'expense',
      },
      {
        description: 'Education & Personal Development',
        amount: 5_000,
        frequency: 'monthly',
        category: 'expense',
      },
      {
        description: 'Annual Property Tax',
        amount: 200_000,
        frequency: 'annual',
        category: 'expense',
        months: [1], // January
      },
      {
        description: 'Annual Insurance Renewal',
        amount: 50_000,
        frequency: 'annual',
        category: 'expense',
        months: [1], // January
      },
      {
        description: 'Annual Club Memberships',
        amount: 75_000,
        frequency: 'annual',
        category: 'expense',
        months: [1], // January
      },
    ],
  },
  {
    accountNamePattern: 'Professional Advice',
    expenses: [
      // These are already added by the previous script, but we'll keep them here for reference
      // and add any missing ones
      {
        description: 'Account Service Fee',
        amount: 1_000,
        frequency: 'monthly',
        category: 'fees',
      },
    ],
  },
  {
    accountNamePattern: 'Cash Reserve',
    expenses: [
      {
        description: 'Account Maintenance Fee',
        amount: 200,
        frequency: 'monthly',
        category: 'fees',
      },
      {
        description: 'Wire Transfer Fees',
        amount: 500,
        frequency: 'monthly',
        category: 'fees',
      },
    ],
  },
  {
    accountNamePattern: 'Charity',
    expenses: [
      // Charity account typically has outgoing donations, not expenses
      // But we might have processing fees
      {
        description: 'Donation Processing Fee',
        amount: 100,
        frequency: 'monthly',
        category: 'fees',
      },
    ],
  },
];

async function addAllExpenses() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('🔍 Fetching all accounts...');

  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, name, type, balance')
    .eq('user_id', USER_ID);

  if (accountsError) {
    console.error('❌ Error fetching accounts:', accountsError.message);
    process.exit(1);
  }

  if (!accounts || accounts.length === 0) {
    console.error('❌ No accounts found');
    process.exit(1);
  }

  console.log(`✅ Found ${accounts.length} accounts\n`);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const allTransactions: any[] = [];

  // Process each expense config
  for (const config of EXPENSE_CONFIGS) {
    // Find matching account
    const account = accounts.find((acc) =>
      acc.name.toLowerCase().includes(config.accountNamePattern.toLowerCase())
    );

    if (!account) {
      console.log(`⚠️  Account not found for pattern: ${config.accountNamePattern}`);
      continue;
    }

    console.log(`📝 Processing: ${account.name}`);

    // Check if expenses already exist for this account
    const { data: existing, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .eq('account_id', account.id)
      .eq('user_id', USER_ID)
      .eq('type', 'debit')
      .limit(1);

    if (checkError) {
      console.error(`   ❌ Error checking existing transactions: ${checkError.message}`);
      continue;
    }

    // Check if we should skip (only skip if there are many existing expenses)
    // Allow adding if there are very few existing expenses
    if (existing && existing.length > 5) {
      console.log(`   ⏭️  Expenses already exist (${existing.length} found), skipping...`);
      continue;
    }

    let accountTransactions = 0;

    // Generate transactions for each expense
    for (const expense of config.expenses) {
      let dates: Date[] = [];

      if (expense.frequency === 'monthly') {
        // Generate for all 12 months
        for (let month = 1; month <= 12; month++) {
          dates.push(new Date(`${currentYear}-${String(month).padStart(2, '0')}-15`));
        }
      } else if (expense.frequency === 'quarterly') {
        // Q1, Q2, Q3, Q4
        dates = [
          new Date(`${currentYear}-01-15`),
          new Date(`${currentYear}-04-15`),
          new Date(`${currentYear}-07-15`),
          new Date(`${currentYear}-10-15`),
        ];
      } else if (expense.frequency === 'annual') {
        // Use specified months or default to January
        const months = expense.months || [1];
        dates = months.map((month) => new Date(`${currentYear}-${String(month).padStart(2, '0')}-15`));
      }

      // Create transactions for each date
      for (const date of dates) {
        allTransactions.push({
          account_id: account.id,
          user_id: USER_ID,
          type: 'debit',
          amount: expense.amount,
          currency: 'USD',
          description: expense.description,
          category: expense.category,
          date: date.toISOString(),
        });
        accountTransactions++;
      }
    }

    console.log(`   ✅ Added ${accountTransactions} expense transactions`);
  }

  if (allTransactions.length === 0) {
    console.log('\n⚠️  No new transactions to add (expenses may already exist)');
    return;
  }

  console.log(`\n💳 Creating ${allTransactions.length} expense transactions...`);

  // Insert in batches to avoid overwhelming the database
  const BATCH_SIZE = 50;
  let totalInserted = 0;

  for (let i = 0; i < allTransactions.length; i += BATCH_SIZE) {
    const batch = allTransactions.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from('transactions')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      continue;
    }

    totalInserted += data?.length || 0;
    console.log(`   ✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${data?.length || 0} transactions)`);
  }

  console.log(`\n✅ Successfully created ${totalInserted} expense transactions`);
  console.log('\n📊 Summary by Account:');
  
  // Show summary
  for (const config of EXPENSE_CONFIGS) {
    const account = accounts.find((acc) =>
      acc.name.toLowerCase().includes(config.accountNamePattern.toLowerCase())
    );
    if (account) {
      const accountExpenses = allTransactions.filter((t) => t.account_id === account.id);
      const totalAnnual = accountExpenses.reduce((sum, t) => sum + t.amount, 0);
      console.log(`   ${account.name}: ${accountExpenses.length} transactions, $${(totalAnnual / 1_000_000).toFixed(2)}M annually`);
    }
  }

  console.log('\n✅ Done! All realistic expenses have been added.');
}

addAllExpenses()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
