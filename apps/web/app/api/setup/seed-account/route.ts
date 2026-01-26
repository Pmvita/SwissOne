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

    // Define accounts for $1B AUM portfolio
    // Total AUM: $1,000,000,000 USD
    const accounts: SeedAccount[] = [
      // Public Markets Account (40% = $400M)
      {
        name: 'Public Markets Investment Account',
        type: 'investment',
        currency: 'USD',
        balance: 400_000_000,
        account_number: 'CH-001-PUBLIC',
        iban: 'CH9300762011623852957',
      },
      // Private Equity & Venture Capital Account (30% = $300M)
      {
        name: 'Private Equity & Venture Capital Account',
        type: 'investment',
        currency: 'USD',
        balance: 300_000_000,
        account_number: 'CH-002-PE-VC',
        iban: 'CH9300762011623852958',
      },
      // Cash & Money Market Account (20% = $200M)
      {
        name: 'Cash & Money Market Account',
        type: 'savings',
        currency: 'USD',
        balance: 200_000_000,
        account_number: 'CH-003-CASH',
        iban: 'CH9300762011623852959',
      },
      // Alternative Investments Account (10% = $100M)
      {
        name: 'Alternative Investments Account',
        type: 'investment',
        currency: 'USD',
        balance: 100_000_000,
        account_number: 'CH-004-ALT',
        iban: 'CH9300762011623852960',
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

    // Define portfolios with holdings for $1B AUM
    const portfolios: SeedPortfolio[] = [
      {
        name: 'Public Markets Portfolio',
        currency: 'USD',
        holdings: [
          // S&P 500 ETF - $150M
          {
            symbol: 'SPY',
            market_symbol: 'SPY',
            name: 'SPDR S&P 500 ETF Trust',
            quantity: 333_333, // ~$150M at $450/share
            purchase_price: 450.00,
            current_price: 450.00,
            currency: 'USD',
            asset_type: 'etf',
            refresh_cadence: 'realtime',
          },
          // NASDAQ ETF - $50M
          {
            symbol: 'QQQ',
            market_symbol: 'QQQ',
            name: 'Invesco QQQ Trust',
            quantity: 131_579, // ~$50M at $380/share
            purchase_price: 380.00,
            current_price: 380.00,
            currency: 'USD',
            asset_type: 'etf',
            refresh_cadence: 'realtime',
          },
          // Apple Stock - $100M
          {
            symbol: 'AAPL',
            market_symbol: 'AAPL',
            name: 'Apple Inc.',
            quantity: 571_429, // ~$100M at $175/share
            purchase_price: 175.00,
            current_price: 175.00,
            currency: 'USD',
            asset_type: 'equity',
            refresh_cadence: 'realtime',
          },
          // Microsoft Stock - $50M
          {
            symbol: 'MSFT',
            market_symbol: 'MSFT',
            name: 'Microsoft Corporation',
            quantity: 131_579, // ~$50M at $380/share
            purchase_price: 380.00,
            current_price: 380.00,
            currency: 'USD',
            asset_type: 'equity',
            refresh_cadence: 'realtime',
          },
          // US 10-Year Treasury Bond - $50M
          {
            symbol: 'US10Y',
            market_symbol: '^TNX',
            name: 'US 10-Year Treasury Bond',
            quantity: 500_000, // $50M at $100 par value
            purchase_price: 100.00,
            current_price: 100.00,
            currency: 'USD',
            asset_type: 'bond',
            refresh_cadence: 'daily',
          },
        ],
      },
      {
        name: 'Private Equity & Venture Capital Portfolio',
        currency: 'USD',
        holdings: [
          // Private Equity Fund 1 - $100M
          {
            symbol: 'PE-FUND-1',
            market_symbol: 'PRIVATE',
            name: 'Private Equity Fund I',
            quantity: 1,
            purchase_price: 100_000_000,
            current_price: 100_000_000,
            currency: 'USD',
            asset_type: 'equity',
            refresh_cadence: 'daily',
          },
          // Private Equity Fund 2 - $100M
          {
            symbol: 'PE-FUND-2',
            market_symbol: 'PRIVATE',
            name: 'Private Equity Fund II',
            quantity: 1,
            purchase_price: 100_000_000,
            current_price: 100_000_000,
            currency: 'USD',
            asset_type: 'equity',
            refresh_cadence: 'daily',
          },
          // Venture Capital Fund - $100M
          {
            symbol: 'VC-FUND-1',
            market_symbol: 'PRIVATE',
            name: 'Venture Capital Fund I',
            quantity: 1,
            purchase_price: 100_000_000,
            current_price: 100_000_000,
            currency: 'USD',
            asset_type: 'equity',
            refresh_cadence: 'daily',
          },
        ],
      },
      {
        name: 'Cash & Money Market Portfolio',
        currency: 'USD',
        holdings: [
          // Prime Money Market Fund - $200M
          {
            symbol: 'MMF-PRIME',
            market_symbol: 'PRIVATE',
            name: 'Prime Money Market Fund',
            quantity: 200_000_000,
            purchase_price: 1.00,
            current_price: 1.00,
            currency: 'USD',
            asset_type: 'money_market',
            refresh_cadence: 'daily',
          },
        ],
      },
      {
        name: 'Alternative Investments Portfolio',
        currency: 'USD',
        holdings: [
          // Bitcoin - $45M
          {
            symbol: 'BTC',
            market_symbol: 'BTC-USD',
            name: 'Bitcoin',
            quantity: 1000, // ~$45M at $45,000/coin
            purchase_price: 45000.00,
            current_price: 45000.00,
            currency: 'USD',
            asset_type: 'cash',
            refresh_cadence: 'realtime',
          },
          // Real Estate Investment Trust - $30M
          {
            symbol: 'REIT-FUND',
            market_symbol: 'PRIVATE',
            name: 'Commercial Real Estate Fund',
            quantity: 1,
            purchase_price: 30_000_000,
            current_price: 30_000_000,
            currency: 'USD',
            asset_type: 'equity',
            refresh_cadence: 'daily',
          },
          // Commodities Fund - $25M
          {
            symbol: 'COMM-FUND',
            market_symbol: 'PRIVATE',
            name: 'Commodities Investment Fund',
            quantity: 1,
            purchase_price: 25_000_000,
            current_price: 25_000_000,
            currency: 'USD',
            asset_type: 'equity',
            refresh_cadence: 'daily',
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
    const publicMarketsAccount = createdAccounts?.find((acc) =>
      acc.name.includes('Public Markets')
    );
    const peVcAccount = createdAccounts?.find((acc) =>
      acc.name.includes('Private Equity')
    );
    const cashAccount = createdAccounts?.find((acc) =>
      acc.name.includes('Cash & Money Market')
    );

    if (publicMarketsAccount) {
      // Quarterly dividends from public markets (estimated 2% annual yield on $400M = $8M/year = $2M/quarter)
      transactions.push(
        {
          account_id: publicMarketsAccount.id,
          user_id: userId,
          type: 'credit',
          amount: 2_000_000, // Quarterly dividend
          currency: 'USD',
          description: 'Public Markets - Quarterly Dividend Distribution',
          category: 'dividend',
          date: new Date('2024-01-15').toISOString(),
        }
      );
    }

    if (peVcAccount) {
      // Annual distributions from PE/VC funds (estimated 8% annual return on $300M = $24M/year)
      transactions.push({
        account_id: peVcAccount.id,
        user_id: userId,
        type: 'credit',
        amount: 24_000_000, // Annual distribution
        currency: 'USD',
        description: 'Private Equity & VC - Annual Distribution',
        category: 'income',
        date: new Date('2024-01-31').toISOString(),
      });
    }

    if (cashAccount) {
      // Interest income from money market (estimated 4% annual yield on $200M = $8M/year)
      transactions.push({
        account_id: cashAccount.id,
        user_id: userId,
        type: 'credit',
        amount: 2_000_000, // Quarterly interest
        currency: 'USD',
        description: 'Money Market - Quarterly Interest',
        category: 'interest',
        date: new Date('2024-01-15').toISOString(),
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

