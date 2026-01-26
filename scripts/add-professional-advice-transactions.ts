// scripts/add-professional-advice-transactions.ts
// Add Professional Advice & Structure account annual cost transactions
// Run with: npx tsx scripts/add-professional-advice-transactions.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables - try multiple locations
const envPaths = [
  resolve(process.cwd(), 'apps/web/.env.local'),
  resolve(process.cwd(), '.env.local'),
  resolve(process.cwd(), '.env'),
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
  dotenv.config();
}

const USER_ID = 'b55ef620-c283-48f1-9127-90be294d160e';

async function addTransactions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('🔍 Finding Professional Advice & Structure account...');

  // Find the Professional Advice account
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, name, balance')
    .eq('user_id', USER_ID)
    .ilike('name', '%Professional Advice%');

  if (accountsError) {
    console.error('❌ Error finding account:', accountsError.message);
    process.exit(1);
  }

  if (!accounts || accounts.length === 0) {
    console.error('❌ Professional Advice & Structure account not found');
    console.error('   Please run the seed script first: npx tsx apps/web/scripts/seed-account.ts');
    process.exit(1);
  }

  const professionalAccount = accounts[0];
  console.log(`✅ Found account: ${professionalAccount.name} (Balance: $${(Number(professionalAccount.balance) / 1_000_000).toFixed(0)}M)`);

  // Check if transactions already exist
  const { data: existingTransactions, error: checkError } = await supabase
    .from('transactions')
    .select('id')
    .eq('account_id', professionalAccount.id)
    .eq('user_id', USER_ID)
    .limit(1);

  if (checkError) {
    console.error('❌ Error checking existing transactions:', checkError.message);
    process.exit(1);
  }

  if (existingTransactions && existingTransactions.length > 0) {
    console.log('⚠️  Transactions already exist for this account.');
    console.log('   To re-add, delete existing transactions first.');
    return;
  }

  // Calculate costs (same as seed script)
  const familyOfficeAnnual = 4_000_000;
  const familyOfficeQuarterly = familyOfficeAnnual / 4;
  const trustAdminAnnual = 1_000_000;
  const bankManagementAnnual = 3_500_000;
  const bankManagementQuarterly = bankManagementAnnual / 4;
  const bankCustodyAnnual = 1_000_000;
  const bankCustodyQuarterly = bankCustodyAnnual / 4;
  const legalTaxAnnual = 1_400_000;
  const legalTaxQuarterly = legalTaxAnnual / 4;
  const complianceAnnual = 650_000;
  const complianceQuarterly = complianceAnnual / 4;
  const auditAnnual = 400_000;
  const insuranceAnnual = 275_000;
  const operatingCoAnnual = 550_000;
  const operatingCoQuarterly = operatingCoAnnual / 4;

  // Use current year dates
  const currentYear = new Date().getFullYear();
  const transactions = [];

  // Q1 transactions (January)
  transactions.push(
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: familyOfficeQuarterly,
      currency: 'USD',
      description: 'Q1 Family Office Costs (Executive team, operations, technology, infrastructure)',
      category: 'expense',
      date: new Date(`${currentYear}-01-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: bankManagementQuarterly,
      currency: 'USD',
      description: 'Q1 Bank Management Fees (0.25-0.45% of AUM, negotiated rate)',
      category: 'expense',
      date: new Date(`${currentYear}-01-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: bankCustodyQuarterly,
      currency: 'USD',
      description: 'Q1 Bank Custody & Reporting Fees',
      category: 'expense',
      date: new Date(`${currentYear}-01-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: legalTaxQuarterly,
      currency: 'USD',
      description: 'Q1 Legal & Tax Advisors (Multi-jurisdiction planning)',
      category: 'expense',
      date: new Date(`${currentYear}-01-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: complianceQuarterly,
      currency: 'USD',
      description: 'Q1 Compliance & Reporting (T1141, T1135, FATCA, CRS)',
      category: 'expense',
      date: new Date(`${currentYear}-01-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: operatingCoQuarterly,
      currency: 'USD',
      description: 'Q1 Operating Company Management',
      category: 'expense',
      date: new Date(`${currentYear}-01-15`).toISOString(),
    }
  );

  // Annual transactions (January)
  transactions.push(
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: trustAdminAnnual,
      currency: 'USD',
      description: 'Annual Trust Administration (Multiple trusts across jurisdictions)',
      category: 'expense',
      date: new Date(`${currentYear}-01-31`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: auditAnnual,
      currency: 'USD',
      description: 'Annual Audit & Accounting',
      category: 'expense',
      date: new Date(`${currentYear}-01-31`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: insuranceAnnual,
      currency: 'USD',
      description: 'Annual Insurance & Risk Management',
      category: 'expense',
      date: new Date(`${currentYear}-01-31`).toISOString(),
    }
  );

  // Q2 transactions (April)
  transactions.push(
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: familyOfficeQuarterly,
      currency: 'USD',
      description: 'Q2 Family Office Costs',
      category: 'expense',
      date: new Date(`${currentYear}-04-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: bankManagementQuarterly,
      currency: 'USD',
      description: 'Q2 Bank Management Fees',
      category: 'expense',
      date: new Date(`${currentYear}-04-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: bankCustodyQuarterly,
      currency: 'USD',
      description: 'Q2 Bank Custody & Reporting Fees',
      category: 'expense',
      date: new Date(`${currentYear}-04-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: legalTaxQuarterly,
      currency: 'USD',
      description: 'Q2 Legal & Tax Advisors',
      category: 'expense',
      date: new Date(`${currentYear}-04-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: complianceQuarterly,
      currency: 'USD',
      description: 'Q2 Compliance & Reporting',
      category: 'expense',
      date: new Date(`${currentYear}-04-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: operatingCoQuarterly,
      currency: 'USD',
      description: 'Q2 Operating Company Management',
      category: 'expense',
      date: new Date(`${currentYear}-04-15`).toISOString(),
    }
  );

  // Q3 transactions (July)
  transactions.push(
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: familyOfficeQuarterly,
      currency: 'USD',
      description: 'Q3 Family Office Costs',
      category: 'expense',
      date: new Date(`${currentYear}-07-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: bankManagementQuarterly,
      currency: 'USD',
      description: 'Q3 Bank Management Fees',
      category: 'expense',
      date: new Date(`${currentYear}-07-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: bankCustodyQuarterly,
      currency: 'USD',
      description: 'Q3 Bank Custody & Reporting Fees',
      category: 'expense',
      date: new Date(`${currentYear}-07-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: legalTaxQuarterly,
      currency: 'USD',
      description: 'Q3 Legal & Tax Advisors',
      category: 'expense',
      date: new Date(`${currentYear}-07-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: complianceQuarterly,
      currency: 'USD',
      description: 'Q3 Compliance & Reporting',
      category: 'expense',
      date: new Date(`${currentYear}-07-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: operatingCoQuarterly,
      currency: 'USD',
      description: 'Q3 Operating Company Management',
      category: 'expense',
      date: new Date(`${currentYear}-07-15`).toISOString(),
    }
  );

  // Q4 transactions (October)
  transactions.push(
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: familyOfficeQuarterly,
      currency: 'USD',
      description: 'Q4 Family Office Costs',
      category: 'expense',
      date: new Date(`${currentYear}-10-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: bankManagementQuarterly,
      currency: 'USD',
      description: 'Q4 Bank Management Fees',
      category: 'expense',
      date: new Date(`${currentYear}-10-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: bankCustodyQuarterly,
      currency: 'USD',
      description: 'Q4 Bank Custody & Reporting Fees',
      category: 'expense',
      date: new Date(`${currentYear}-10-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: legalTaxQuarterly,
      currency: 'USD',
      description: 'Q4 Legal & Tax Advisors',
      category: 'expense',
      date: new Date(`${currentYear}-10-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: complianceQuarterly,
      currency: 'USD',
      description: 'Q4 Compliance & Reporting',
      category: 'expense',
      date: new Date(`${currentYear}-10-15`).toISOString(),
    },
    {
      account_id: professionalAccount.id,
      user_id: USER_ID,
      type: 'debit',
      amount: operatingCoQuarterly,
      currency: 'USD',
      description: 'Q4 Operating Company Management',
      category: 'expense',
      date: new Date(`${currentYear}-10-15`).toISOString(),
    }
  );

  console.log(`\n💳 Creating ${transactions.length} transactions...`);

  const { data, error } = await supabase
    .from('transactions')
    .insert(transactions)
    .select('id');

  if (error) {
    console.error('❌ Error creating transactions:', error.message);
    console.error('   Details:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log(`✅ Successfully created ${data?.length || 0} transactions`);
  console.log('\n📊 Transaction Summary:');
  console.log(`   - Q1 transactions: 6 quarterly + 3 annual = 9 transactions`);
  console.log(`   - Q2 transactions: 6 quarterly`);
  console.log(`   - Q3 transactions: 6 quarterly`);
  console.log(`   - Q4 transactions: 6 quarterly`);
  console.log(`   - Total: ${transactions.length} transactions`);
  console.log(`   - Total Annual Costs: ~$12.825M`);
  console.log('\n✅ Done! Transactions should now be visible on the transactions page and account detail page.');
}

addTransactions()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
