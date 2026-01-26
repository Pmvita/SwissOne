// apps/web/app/api/setup/seed-account/route.ts
// Seed account with UHNWI wealth structure data for Pierre Mvita

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user - try standard getUser first
    const {
      data: { user: fetchedUser },
      error: authError,
    } = await supabase.auth.getUser();

    let user = fetchedUser;

    // Fallback: If getUser failed, extract user from cookie directly and set session
    if (!user) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      // Use same cookie name as dashboard (hardcoded for consistency)
      const authCookie = cookieStore.get('sb-amjjhdsbvpnjdgdlvoka-auth-token');
      
      if (authCookie?.value && authCookie.value.startsWith('{')) {
        try {
          const sessionData = JSON.parse(authCookie.value);
          if (sessionData.user && sessionData.access_token) {
            // Set the session on the Supabase client so RLS works correctly
            const { data: sessionSet, error: sessionError } = await supabase.auth.setSession({
              access_token: sessionData.access_token,
              refresh_token: sessionData.refresh_token || '',
            });
            
            if (!sessionError && sessionSet?.user) {
              user = sessionSet.user;
            } else {
              // Fallback: verify token and use user from cookie
              try {
                const verifyResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
                  {
                    headers: {
                      'Authorization': `Bearer ${sessionData.access_token}`,
                      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    },
                  }
                );
                
                if (verifyResponse.ok) {
                  const verifiedUser = await verifyResponse.json();
                  user = verifiedUser;
                  // Try to set session again with verified user
                  await supabase.auth.setSession({
                    access_token: sessionData.access_token,
                    refresh_token: sessionData.refresh_token || '',
                  });
                } else {
                  // Token invalid, use user from cookie anyway
                  user = sessionData.user;
                }
              } catch {
                // Verification failed, use user from cookie
                user = sessionData.user;
              }
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    if (authError && !user) {
      console.error('[Seed Account] Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('[Seed Account] No user found');
      return NextResponse.json({ error: 'Unauthorized', details: 'No user found. Please log in first.' }, { status: 401 });
    }

    // Check if user is admin - profile should already exist
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email, username')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle() to handle missing profiles gracefully

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = not found (0 rows)
      console.error('[Seed Account] Profile query error:', profileError);
      return NextResponse.json(
        { 
          error: 'Failed to check user role', 
          details: profileError.message,
          code: profileError.code 
        },
        { status: 500 }
      );
    }

    if (!profile) {
      // Profile doesn't exist - use fix-profile endpoint instead or SQL
      return NextResponse.json(
        { 
          error: 'Profile not found',
          details: 'Your profile does not exist in the database. Please contact support or run the fix-profile endpoint.',
          hint: 'Profile should exist but query returned no results. This may be an RLS issue.'
        },
        { status: 404 }
      );
    }

    // Verify admin role
    if (!profile) {
      return NextResponse.json(
        { 
          error: 'Profile not found',
          details: 'Your profile does not exist. Please contact support.',
        },
        { status: 404 }
      );
    }

    if (profile.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Admin access required', 
          details: `Current role: ${profile.role}. Admin role required.` 
        },
        { status: 403 }
      );
    }

    const userId = user.id;

    // Define accounts based on Manifestation.md data
    const accounts: SeedAccount[] = [
      // Family Office Account (Swiss Private Banking)
      {
        name: 'Mvita Reserve Holdings LLC - Family Office Account',
        type: 'investment',
        currency: 'USD',
        balance: 60000000, // $60M/yr from VC&PE
        account_number: 'CH-001-FO',
        iban: 'CH9300762011623852957',
      },
      // Offshore Account (Swiss Private Banking - 9% ROI)
      {
        name: 'Mvita Reserve Holdings LLC - Offshore Account',
        type: 'investment',
        currency: 'USD',
        balance: 57125000, // $57.125M/yr from VC&PE
        account_number: 'CH-002-OFF',
        iban: 'CH9300762011623852958',
      },
      // Mvita Capital Investments - Swiss Private Banking
      {
        name: 'Mvita Capital Investments - Swiss Private Banking (Primary)',
        type: 'investment',
        currency: 'USD',
        balance: 500000000, // $500M
        account_number: 'CH-003-MCI-1',
        iban: 'CH9300762011623852959',
      },
      {
        name: 'Mvita Capital Investments - Swiss Private Banking (Secondary)',
        type: 'investment',
        currency: 'USD',
        balance: 100000000, // $100M
        account_number: 'CH-003-MCI-2',
        iban: 'CH9300762011623852960',
      },
      // Mvita Venture Capital - Swiss Private Banking
      {
        name: 'Mvita Venture Capital - Swiss Private Banking',
        type: 'investment',
        currency: 'USD',
        balance: 500000000, // $500M
        account_number: 'CH-004-MVC',
        iban: 'CH9300762011623852961',
      },
      // Mvita Syndicate - BMO Private Wealth
      {
        name: 'Mvita Syndicate - BMO Private Wealth',
        type: 'investment',
        currency: 'USD',
        balance: 100000000, // $100M
        account_number: 'CA-BMO-001',
        iban: 'CA0210000123456789012',
      },
      // Mvita Syndicate - RBC Private Wealth
      {
        name: 'Mvita Syndicate - RBC Private Wealth',
        type: 'investment',
        currency: 'USD',
        balance: 50000000, // $50M
        account_number: 'CA-RBC-001',
        iban: 'CA0210000123456789013',
      },
      // Mvita Capital - Emirates NBD Private Banking
      {
        name: 'Mvita Capital - Emirates NBD Private Banking',
        type: 'investment',
        currency: 'USD',
        balance: 5000000, // $5M
        account_number: 'AE-ENBD-001',
        iban: 'AE070331234567890123456',
      },
      // Mvita Capital - First Abu Dhabi Private Banking
      {
        name: 'Mvita Capital - First Abu Dhabi Private Banking',
        type: 'investment',
        currency: 'USD',
        balance: 5000000, // $5M
        account_number: 'AE-FAB-001',
        iban: 'AE070331234567890123457',
      },
      // Mvita Capital - WIO Business Banking
      {
        name: 'Mvita Capital - WIO Business Banking',
        type: 'checking',
        currency: 'USD',
        balance: 1000000, // $1M
        account_number: 'AE-WIO-001',
        iban: 'AE070331234567890123458',
      },
      // Mvita Inc - Liechtenstein Private Banking (Primary)
      {
        name: 'Mvita Inc - Liechtenstein Private Banking (Primary)',
        type: 'investment',
        currency: 'USD',
        balance: 100000000, // $100M
        account_number: 'LI-001-MI-1',
        iban: 'LI21088100002324013AA',
      },
      // Mvita Inc - Liechtenstein Private Banking (Secondary)
      {
        name: 'Mvita Inc - Liechtenstein Private Banking (Secondary)',
        type: 'investment',
        currency: 'USD',
        balance: 100000000, // $100M
        account_number: 'LI-001-MI-2',
        iban: 'LI21088100002324014AA',
      },
    ];

    // Create accounts
    const { data: createdAccounts, error: accountsError } = await supabase
      .from('accounts')
      .insert(
        accounts.map((acc) => ({
          user_id: userId,
          ...acc,
        }))
      )
      .select();

    if (accountsError) {
      console.error('Error creating accounts:', accountsError);
      return NextResponse.json(
        { error: 'Failed to create accounts', details: accountsError.message },
        { status: 500 }
      );
    }

    // Define portfolios with holdings
    const portfolios: SeedPortfolio[] = [
      {
        name: 'Venture Capital & Private Equity Portfolio',
        currency: 'USD',
        holdings: [
          // SecureNet (60% Equity - $1.2B)
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
          // Syndicate X (60% Equity - $1.8B)
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
          // MapleAI (60% Equity - $2.0B)
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
          // OrbitTech (60% Equity - $5.1B)
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
          // Golden Maple Circuit (60% Equity - $720M)
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
          // Agape Records (80% Equity - $320M)
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
          // Maison Agape (80% Equity - $68M)
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
          // Kinshasa Sky Residences (100% Equity - $1.0B)
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
          // KIEAT University (100% Equity - $500M)
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
          // S&P 500 ETF
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
          // NASDAQ ETF
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
          // Apple Stock
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
          // Microsoft Stock
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
          // US 10-Year Treasury Bond
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
          // Bitcoin
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
          // Ethereum
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

    // Create portfolios and holdings
    const createdPortfolios = [];
    for (const portfolio of portfolios) {
      const { data: createdPortfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          user_id: userId,
          name: portfolio.name,
          currency: portfolio.currency,
          total_value: 0, // Will be calculated from holdings
        })
        .select()
        .single();

      if (portfolioError) {
        console.error('Error creating portfolio:', portfolioError);
        continue;
      }

      // Create holdings for this portfolio
      const { error: holdingsError } = await supabase.from('holdings').insert(
        portfolio.holdings.map((holding) => ({
          portfolio_id: createdPortfolio.id,
          symbol: holding.symbol,
          market_symbol: holding.market_symbol || holding.symbol,
          name: holding.name,
          quantity: holding.quantity,
          purchase_price: holding.purchase_price,
          current_price: holding.current_price,
          currency: holding.currency,
          asset_type: holding.asset_type,
          refresh_cadence: holding.refresh_cadence,
        }))
      );

      if (holdingsError) {
        console.error('Error creating holdings:', holdingsError);
      } else {
        createdPortfolios.push(createdPortfolio);
      }
    }

    // Create sample transactions (dividends, interest, expenses)
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
          user_id: userId,
          type: 'credit',
          amount: 30000000, // SecureNet dividend
          currency: 'USD',
          description: 'SecureNet - Annual Dividend',
          category: 'dividend',
          date: new Date('2024-01-15').toISOString(),
        },
        {
          account_id: familyOfficeAccount.id,
          user_id: userId,
          type: 'credit',
          amount: 42000000, // Syndicate X dividend
          currency: 'USD',
          description: 'Syndicate X - Annual Dividend',
          category: 'dividend',
          date: new Date('2024-01-15').toISOString(),
        },
        {
          account_id: familyOfficeAccount.id,
          user_id: userId,
          type: 'credit',
          amount: 40000000, // MapleAI dividend
          currency: 'USD',
          description: 'MapleAI - Annual Dividend',
          category: 'dividend',
          date: new Date('2024-01-15').toISOString(),
        },
        {
          account_id: familyOfficeAccount.id,
          user_id: userId,
          type: 'credit',
          amount: 85000000, // OrbitTech dividend
          currency: 'USD',
          description: 'OrbitTech - Annual Dividend',
          category: 'dividend',
          date: new Date('2024-01-15').toISOString(),
        }
      );

      // Operating expenses
      transactions.push(
        {
          account_id: familyOfficeAccount.id,
          user_id: userId,
          type: 'debit',
          amount: 10805000, // Staff salaries
          currency: 'USD',
          description: 'Family Office - Staff Salaries',
          category: 'expense',
          date: new Date('2024-01-31').toISOString(),
        },
        {
          account_id: familyOfficeAccount.id,
          user_id: userId,
          type: 'debit',
          amount: 10000000, // Charity & Tithes
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
        user_id: userId,
        type: 'credit',
        amount: 57125000, // Annual income allocation
        currency: 'USD',
        description: 'Annual Income Allocation from VC&PE',
        category: 'income',
        date: new Date('2024-01-01').toISOString(),
      });
    }

    if (transactions.length > 0) {
      const { error: transactionsError } = await supabase
        .from('transactions')
        .insert(transactions);

      if (transactionsError) {
        console.error('Error creating transactions:', transactionsError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account seeded successfully',
      data: {
        accountsCreated: createdAccounts?.length || 0,
        portfoliosCreated: createdPortfolios.length,
        transactionsCreated: transactions.length,
      },
    });
  } catch (error: any) {
    console.error('Error seeding account:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed account',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

