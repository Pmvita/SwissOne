import { redirect } from "next/navigation";
import { createClient, createAuthenticatedClient } from "@/lib/supabase/server";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { AnimatedLinkButton } from "@/components/ui/animated/AnimatedLinkButton";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { 
  Wallet, 
  TrendingUp, 
  Eye,
  Shield,
  User,
  Mail,
  Phone,
  ArrowUpRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { SupabaseClient } from "@supabase/supabase-js";
import { PortfolioOverview } from "./portfolio-overview";
import { PortfolioBreakdown } from "./portfolio-breakdown";
import { ViewToggleButtons } from "./view-toggle-buttons";

async function getAccounts(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
  return data || [];
}

async function getTransactions(supabase: SupabaseClient, userId: string, limit: number = 5) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, accounts(name, type)")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
  return data || [];
}

async function getPortfolios(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching portfolios:", error);
    return [];
  }
  return data || [];
}

async function getHoldingsWithPrices(supabase: SupabaseClient, userId: string) {
  try {
    // First, get all portfolio IDs for the user
    const { data: userPortfolios, error: portfoliosError } = await supabase
      .from("portfolios")
      .select("id")
      .eq("user_id", userId);

    if (portfoliosError) {
      console.error("Error fetching portfolios for holdings:", portfoliosError);
      return [];
    }

    if (!userPortfolios || userPortfolios.length === 0) {
      return [];
    }

    const portfolioIds = userPortfolios.map(p => p.id);

    // Then get all holdings for those portfolios
    // Note: asset_type and market_symbol columns don't exist in holdings table yet
    // The portfolio breakdown component handles missing asset_type with a fallback
    const { data: holdings, error } = await supabase
      .from("holdings")
      .select(`
        id,
        portfolio_id,
        symbol,
        name,
        quantity,
        purchase_price,
        current_price,
        currency,
        portfolios(id, name, user_id)
      `)
      .in("portfolio_id", portfolioIds);

    if (error) {
      console.error("Error fetching holdings:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return [];
    }

    return holdings || [];
  } catch (err) {
    console.error("Unexpected error in getHoldingsWithPrices:", err);
    return [];
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Try standard getUser first
  const {
    data: { user: fetchedUser },
  } = await supabase.auth.getUser();
  
  let user = fetchedUser;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  
  // Fallback: If getUser failed, extract user and tokens from cookie
  if (!user) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('sb-amjjhdsbvpnjdgdlvoka-auth-token');
    
    if (authCookie?.value && authCookie.value.startsWith('{')) {
      try {
        const sessionData = JSON.parse(authCookie.value);
        if (sessionData.user && sessionData.access_token) {
          accessToken = sessionData.access_token;
          refreshToken = sessionData.refresh_token || null;
          user = sessionData.user;
          
          // Verify token is still valid
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
            }
          } catch {
            // Verification failed, use user from cookie
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
  } else {
    // If getUser succeeded, get the session to extract tokens
    const { data: session } = await supabase.auth.getSession();
    accessToken = session?.session?.access_token || null;
    refreshToken = session?.session?.refresh_token || null;
  }

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  
  // Create authenticated client if we have access token (for RLS)
  const authenticatedSupabase = accessToken 
    ? await createAuthenticatedClient(accessToken, refreshToken || undefined)
    : supabase;
  
  // Get user profile to check role (use authenticated client)
  const { data: profile, error: profileError } = await authenticatedSupabase
    .from('profiles')
    .select('role, email, username')
    .eq('id', userId)
    .maybeSingle(); // Use maybeSingle() to handle missing profiles gracefully
  
  if (profileError && profileError.code !== 'PGRST116') {
    // PGRST116 = not found (0 rows), which is expected if profile doesn't exist
    console.error('[Dashboard] Profile query error:', profileError);
  }
  
  const isAdminOrStaff = profile?.role === 'admin' || profile?.role === 'staff';
  
  // Update session activity (silently fail if table doesn't exist)
  try {
    const { sessionTracker } = await import('@/lib/services/session-tracker');
    await sessionTracker.updateActivity(userId);
  } catch (error: any) {
    // Don't log PGRST205 errors (table doesn't exist - migration not run yet)
    if (error?.code !== 'PGRST205') {
      console.error('Failed to update session activity:', error);
    }
  }
  
  // Use authenticated client for queries so RLS works correctly
  const accounts = await getAccounts(authenticatedSupabase, userId);
  const recentTransactions = await getTransactions(authenticatedSupabase, userId, 5);
  const portfolios = await getPortfolios(authenticatedSupabase, userId);
  const holdings = await getHoldingsWithPrices(authenticatedSupabase, userId);

  // Calculate totals - AUM is the sum of account balances (~$1.5B USD)
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const totalAUM = totalBalance; // Total AUM = sum of account balances
  const accountCount = accounts.length;
  const transactionCount = recentTransactions.length;

  // Calculate portfolio holdings breakdown for display (these are investments within the accounts)
  let totalPortfolioValue = 0;
  const assetClassBreakdown: Record<string, number> = {};
  
  for (const holding of holdings) {
    const value = Number(holding.quantity || 0) * Number(holding.current_price || 0);
    totalPortfolioValue += value;
    
    // Group by asset type (defaults to 'equity' since asset_type column doesn't exist yet)
    const assetType = (holding as any).asset_type || 'equity';
    assetClassBreakdown[assetType] = (assetClassBreakdown[assetType] || 0) + value;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - matches BMO style */}
      <header className="bg-primary-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-3">
              <Logo size="sm" className="flex-shrink-0 text-white" />
              <h1 className="text-xl font-bold">SwissOne Private Wealth</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden sm:inline">Welcome, {profile?.username || user.email?.split('@')[0] || 'User'}</span>
              {isAdminOrStaff && (
                <Link
                  href="/security"
                  className="px-3 py-1.5 text-sm font-semibold border-2 border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Shield className="h-4 w-4 inline mr-1" />
                  Security
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm font-semibold border-2 border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar - Desktop */}
      <nav className="hidden md:block bg-primary-100 border-b border-primary-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 justify-end">
            <Link href="/accounts" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Accounts
            </Link>
            <Link href="/dashboard" className="px-3 py-4 text-sm font-medium text-primary-900 border-b-2 border-primary-700">
              Investments
            </Link>
            <Link href="/transactions" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Transfers
            </Link>
            <Link href="/documents" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Documents
            </Link>
            <Link href="/support" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden bg-primary-100 border-b border-primary-200">
        <div className="mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            <Link href="/accounts" className="px-3 py-4 text-sm font-medium text-primary-900 whitespace-nowrap">
              Accounts
            </Link>
            <Link href="/dashboard" className="px-3 py-4 text-sm font-medium text-primary-900 border-b-2 border-primary-700 whitespace-nowrap">
              Investments
            </Link>
            <Link href="/transactions" className="px-3 py-4 text-sm font-medium text-primary-900 whitespace-nowrap">
              Transfers
            </Link>
            <Link href="/more" className="px-3 py-4 text-sm font-medium text-primary-900 whitespace-nowrap">
              More
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Left Sidebar - Advisor Information (Hidden on mobile, shown on desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <FadeIn delay={0.1}>
              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Private Wealth Advisor</h3>
                <div className="flex flex-col items-center mb-4">
                  <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                    <User className="h-10 w-10 text-primary-700" />
                  </div>
                  <p className="font-medium text-gray-900">Advisor Name</p>
                  <p className="text-sm text-gray-600 mt-1">Senior Wealth Advisor</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4" />
                    <span>+41 XX XXX XX XX</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4" />
                    <span>advisor@swissone.ch</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <AnimatedLinkButton 
                    href="/contact" 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    Contact My Advisor
                  </AnimatedLinkButton>
                  <AnimatedLinkButton 
                    href="/messages" 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    Message Center
                  </AnimatedLinkButton>
                </div>
              </AnimatedCard>
            </FadeIn>
          </aside>

          {/* Main Content - Portfolio Overview */}
          <div className="lg:col-span-3">
            {/* Mobile Advisor Section */}
            <div className="lg:hidden mb-6">
              <FadeIn delay={0.1}>
                <AnimatedCard className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-8 w-8 text-primary-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">Your Private Wealth Advisor</h3>
                      <p className="text-sm text-gray-600 mt-0.5">Advisor Name</p>
                      <div className="flex items-center gap-3 mt-2">
                        <a href="tel:+41XXXXXXXXX" className="text-xs text-primary-700 hover:text-primary-900 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          +41 XX XXX XX XX
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <AnimatedLinkButton 
                        href="/contact" 
                        variant="outline" 
                        size="sm"
                        className="text-xs px-2 py-1"
                      >
                        Contact
                      </AnimatedLinkButton>
                      <AnimatedLinkButton 
                        href="/messages" 
                        variant="outline" 
                        size="sm"
                        className="text-xs px-2 py-1"
                      >
                        Messages
                      </AnimatedLinkButton>
                    </div>
                  </div>
                </AnimatedCard>
              </FadeIn>
            </div>
            <FadeIn delay={0.2}>
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Portfolio Overview</h2>
                
                {/* Total AUM - Mobile */}
                <div className="lg:hidden mb-4">
                  <AnimatedCard className="p-4 bg-primary-50">
                    <p className="text-sm text-gray-600 mb-1">Total AUM</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAUM, "USD")}</p>
                  </AnimatedCard>
                </div>
              </div>

              {/* Action Buttons - Above Portfolio Overview */}
              <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  Transfer Funds
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  Rebalance Portfolio
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  Add Investment
                </button>
                <ViewToggleButtons />
              </div>

              {/* Portfolio Overview Component */}
              <PortfolioOverview
                totalValue={totalAUM}
                assetClassBreakdown={assetClassBreakdown}
                holdings={holdings}
                portfolios={portfolios}
              />
            </FadeIn>

            {/* Portfolio Breakdown */}
            <FadeIn delay={0.4}>
              <div className="mt-8">
                <PortfolioBreakdown
                  holdings={holdings}
                  portfolios={portfolios}
                  totalAUM={totalAUM}
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          <Link href="/accounts" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-primary-700 transition-colors">
            <Wallet className="h-5 w-5 mb-1" />
            <span>Accounts</span>
          </Link>
          <Link href="/transactions" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-primary-700 transition-colors">
            <ArrowUpRight className="h-5 w-5 mb-1" />
            <span>Transfers</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center justify-center text-xs text-primary-700">
            <TrendingUp className="h-5 w-5 mb-1" />
            <span>Investments</span>
          </Link>
          <Link href="/more" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-primary-700 transition-colors">
            <Eye className="h-5 w-5 mb-1" />
            <span>More</span>
          </Link>
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16"></div>
    </div>
  );
}
