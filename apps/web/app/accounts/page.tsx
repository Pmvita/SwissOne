import { redirect } from "next/navigation";
import { createClient, createAuthenticatedClient } from "@/lib/supabase/server";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { Wallet, Building2, TrendingUp, CreditCard, User, Shield, ArrowLeft, ShoppingBag, Briefcase, PiggyBank, CheckCircle2, ArrowRight, ArrowUp, Plus, Gem } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { SupabaseClient } from "@supabase/supabase-js";

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

function getAccountIcon(type: string) {
  switch (type) {
    case "checking":
      return Wallet;
    case "savings":
      return Building2;
    case "investment":
      return TrendingUp;
    case "credit":
      return CreditCard;
    default:
      return Wallet;
  }
}

function getAccountColor(type: string) {
  switch (type) {
    case "checking":
      return "bg-primary-600";
    case "savings":
      return "bg-accent-600";
    case "investment":
      return "bg-green-600";
    case "credit":
      return "bg-orange-600";
    default:
      return "bg-gray-600";
  }
}

interface WealthAllocationCategory {
  id: string;
  name: string;
  shortName: string;
  percentage: number;
  value: number;
  dailyGain: number;
  description: string;
  icon: any;
  accountId?: string;
}

// Map accounts to wealth allocation categories
// Supports both seed-account.ts structure and API route structure
function mapAccountsToCategories(accounts: any[], totalBalance: number): WealthAllocationCategory[] {
  const categories: WealthAllocationCategory[] = [];
  const matchedAccountIds = new Set<string>();
  
  // === Seed-account.ts structure ===
  
  // Find Safety & Financial Foundation Account (40%)
  const safetyAccount = accounts.find(acc => acc.name.includes('Safety & Financial Foundation'));
  if (safetyAccount) {
    matchedAccountIds.add(safetyAccount.id);
    categories.push({
      id: 'safety',
      name: 'Safety & Stability',
      shortName: 'Safety & Stability',
      percentage: (Number(safetyAccount.balance || 0) / totalBalance) * 100,
      value: Number(safetyAccount.balance || 0),
      dailyGain: Number(safetyAccount.balance || 0) * 0.0002, // Mock 0.02% daily gain
      description: 'High Interest Savings, U.S. Treasury bonds + Money Market Funds',
      icon: Shield,
      accountId: safetyAccount.id,
    });
  }
  
  // Find Long Term Investing Account (30%)
  const longTermAccount = accounts.find(acc => acc.name.includes('Long Term Investing'));
  if (longTermAccount) {
    matchedAccountIds.add(longTermAccount.id);
    categories.push({
      id: 'longterm',
      name: 'Long Term Investing',
      shortName: 'Long Term Investing',
      percentage: (Number(longTermAccount.balance || 0) / totalBalance) * 100,
      value: Number(longTermAccount.balance || 0),
      dailyGain: Number(longTermAccount.balance || 0) * 0.0021, // Mock 0.21% daily gain
      description: 'Global Equity ETPs • Dividend Growth Stocks',
      icon: TrendingUp,
      accountId: longTermAccount.id,
    });
  }
  
  // Find Lifestyle Allocation Checking Account (10%)
  const lifestyleAccount = accounts.find(acc => acc.name.includes('Lifestyle Allocation'));
  if (lifestyleAccount) {
    matchedAccountIds.add(lifestyleAccount.id);
    categories.push({
      id: 'lifestyle',
      name: 'Lifestyle Allocation',
      shortName: 'Lifestyle Allocation',
      percentage: (Number(lifestyleAccount.balance || 0) / totalBalance) * 100,
      value: Number(lifestyleAccount.balance || 0),
      dailyGain: Number(lifestyleAccount.balance || 0) * 0.0002, // Mock 0.02% daily gain
      description: 'Personal expenses + Large purchase purchases',
      icon: ShoppingBag,
      accountId: lifestyleAccount.id,
    });
  }
  
  // Find Professional Advice & Structure Checking Account (5%)
  const professionalAccount = accounts.find(acc => acc.name.includes('Professional Advice'));
  if (professionalAccount) {
    matchedAccountIds.add(professionalAccount.id);
    categories.push({
      id: 'professional',
      name: 'Professional Advice',
      shortName: 'Professional Advice',
      percentage: (Number(professionalAccount.balance || 0) / totalBalance) * 100,
      value: Number(professionalAccount.balance || 0),
      dailyGain: Number(professionalAccount.balance || 0) * 0.0005, // Mock 0.05% daily gain
      description: 'Tax, legal, & estate planning',
      icon: Briefcase,
      accountId: professionalAccount.id,
    });
  }
  
  // Find Cash Reserve Checking Account (5%)
  const cashReserveAccount = accounts.find(acc => acc.name.includes('Cash Reserve'));
  if (cashReserveAccount) {
    matchedAccountIds.add(cashReserveAccount.id);
    categories.push({
      id: 'cashreserve',
      name: 'Cash Reserve',
      shortName: 'Cash Reserve',
      percentage: (Number(cashReserveAccount.balance || 0) / totalBalance) * 100,
      value: Number(cashReserveAccount.balance || 0),
      dailyGain: Number(cashReserveAccount.balance || 0) * 0.0015, // Mock 0.15% daily gain
      description: 'High liquidity, immediate cash reserve',
      icon: PiggyBank,
      accountId: cashReserveAccount.id,
    });
  }

  // === API route structure ===
  
  // Find Public Markets Investment Account (40%)
  const publicMarketsAccount = accounts.find(acc => acc.name.includes('Public Markets'));
  if (publicMarketsAccount && !matchedAccountIds.has(publicMarketsAccount.id)) {
    matchedAccountIds.add(publicMarketsAccount.id);
    categories.push({
      id: 'public-markets',
      name: 'Public Markets',
      shortName: 'Public Markets',
      percentage: (Number(publicMarketsAccount.balance || 0) / totalBalance) * 100,
      value: Number(publicMarketsAccount.balance || 0),
      dailyGain: Number(publicMarketsAccount.balance || 0) * 0.0021, // Mock 0.21% daily gain
      description: 'Stocks, ETFs, and Bonds',
      icon: TrendingUp,
      accountId: publicMarketsAccount.id,
    });
  }
  
  // Find Private Equity & Venture Capital Account (30%)
  const peVcAccount = accounts.find(acc => acc.name.includes('Private Equity') || acc.name.includes('Venture Capital'));
  if (peVcAccount && !matchedAccountIds.has(peVcAccount.id)) {
    matchedAccountIds.add(peVcAccount.id);
    categories.push({
      id: 'pe-vc',
      name: 'Private Equity & VC',
      shortName: 'PE & VC',
      percentage: (Number(peVcAccount.balance || 0) / totalBalance) * 100,
      value: Number(peVcAccount.balance || 0),
      dailyGain: Number(peVcAccount.balance || 0) * 0.0015, // Mock 0.15% daily gain
      description: 'Private equity funds and venture capital investments',
      icon: Building2,
      accountId: peVcAccount.id,
    });
  }
  
  // Find Cash & Money Market Account (20%)
  const cashMoneyMarketAccount = accounts.find(acc => acc.name.includes('Cash & Money Market') || acc.name.includes('Money Market'));
  if (cashMoneyMarketAccount && !matchedAccountIds.has(cashMoneyMarketAccount.id)) {
    matchedAccountIds.add(cashMoneyMarketAccount.id);
    categories.push({
      id: 'cash-money-market',
      name: 'Cash & Money Market',
      shortName: 'Cash & MM',
      percentage: (Number(cashMoneyMarketAccount.balance || 0) / totalBalance) * 100,
      value: Number(cashMoneyMarketAccount.balance || 0),
      dailyGain: Number(cashMoneyMarketAccount.balance || 0) * 0.0002, // Mock 0.02% daily gain
      description: 'High liquidity cash and money market funds',
      icon: PiggyBank,
      accountId: cashMoneyMarketAccount.id,
    });
  }
  
  // Find Alternative Investments Account (10%)
  const altInvestmentsAccount = accounts.find(acc => acc.name.includes('Alternative Investments'));
  if (altInvestmentsAccount && !matchedAccountIds.has(altInvestmentsAccount.id)) {
    matchedAccountIds.add(altInvestmentsAccount.id);
    categories.push({
      id: 'alternative',
      name: 'Alternative Investments',
      shortName: 'Alternatives',
      percentage: (Number(altInvestmentsAccount.balance || 0) / totalBalance) * 100,
      value: Number(altInvestmentsAccount.balance || 0),
      dailyGain: Number(altInvestmentsAccount.balance || 0) * 0.001, // Mock 0.10% daily gain
      description: 'Crypto, REITs, Commodities, and other alternatives',
      icon: Gem,
      accountId: altInvestmentsAccount.id,
    });
  }
  
  return categories.sort((a, b) => b.value - a.value);
}

export default async function AccountsPage() {
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

  // Get user profile
  const { data: profile } = await authenticatedSupabase
    .from("profiles")
    .select("role, email, username, full_name, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  const isAdminOrStaff = profile?.role === "admin" || profile?.role === "staff";

  // Fetch accounts
  const accounts = await getAccounts(authenticatedSupabase, userId);

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  
  // Calculate daily change (mock calculation - 0.083% daily gain for now)
  const dailyChangeAmount = totalBalance * 0.00083;
  const dailyChangePercent = 0.08;
  
  // Map accounts to wealth allocation categories
  const allocationCategories = mapAccountsToCategories(accounts, totalBalance);
  
  // Get display name
  const displayName = profile?.full_name || 
    (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : null) ||
    profile?.username ||
    user.email?.split('@')[0] ||
    'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-3">
              <Logo size="sm" className="flex-shrink-0" />
              <h1 className="text-xl font-bold text-white">SwissOne</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/80 hidden sm:inline">{user.email}</span>
              {isAdminOrStaff && (
                <Link
                  href="/security"
                  className="px-3 py-1.5 text-sm font-semibold border-2 border-white/30 text-white rounded-lg hover:bg-white/10 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 transition-colors"
                >
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

      {/* Navigation Bar (Desktop) */}
      <nav className="hidden md:block bg-primary-100 border-b border-primary-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 justify-end">
            <Link href="/accounts" className="px-3 py-4 text-sm font-medium text-primary-900 border-b-2 border-primary-700">
              Accounts
            </Link>
            <Link href="/dashboard" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section: Profile (Left) + Total Value (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Profile Section */}
          <FadeIn delay={0.1}>
            <AnimatedCard className="p-6 h-full">
              <div className="flex items-center gap-4 h-full">
                {/* Profile Picture Placeholder with Verification Badge */}
                <div className="relative flex-shrink-0">
                  <div className="h-[100px] w-[100px] bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-primary-700" />
                  </div>
                  {/* Verification Badge */}
                  <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-600 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 truncate">{displayName}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-medium text-gray-600">{profile?.role || 'Client'}</span>
                    <span className="text-sm font-medium text-gray-600">Verified Account</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </FadeIn>

          {/* Total Value Section */}
          <FadeIn delay={0.2}>
            <AnimatedCard className="p-6 h-full">
              <div className="text-right flex flex-col justify-center h-full">
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {formatCurrency(totalBalance, "USD")}
                </p>
                <div className="flex items-center justify-end gap-2 text-green-600">
                  <ArrowUp className="h-4 w-4" />
                  <span className="text-lg font-semibold">+{formatCurrency(dailyChangeAmount, "USD")}</span>
                  <span className="text-lg font-semibold">+{dailyChangePercent.toFixed(2)}%</span>
                </div>
              </div>
            </AnimatedCard>
          </FadeIn>
        </div>

        {/* Wealth Allocation Cards */}
        {allocationCategories.length === 0 ? (
          <FadeIn delay={0.4}>
            <AnimatedCard className="p-12">
              <div className="text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts found</h3>
                <p className="text-gray-500">Accounts will appear here once created</p>
              </div>
            </AnimatedCard>
          </FadeIn>
        ) : (
          <div className="space-y-4">
            {allocationCategories.map((category, index) => {
              const IconComponent = category.icon;
              const dailyGainPercent = (category.dailyGain / category.value) * 100;
              
              // Format description - split by comma and add plus signs between items
              const descriptionParts = category.description
                .split(',')
                .map(part => part.trim().replace(/\s*[+•]\s*/g, ' ').trim())
                .filter(part => part.length > 0);
              
              return (
                <FadeIn key={category.id} delay={0.4 + index * 0.1}>
                  {category.accountId ? (
                    <Link href={`/accounts/${category.accountId}`}>
                      <AnimatedCard className="p-3 hover:shadow-lg transition-all cursor-pointer group">
                        <div className="flex items-start gap-3">
                          {/* Icon - Larger, darker green */}
                          <div className="bg-green-700 p-2.5 rounded-lg flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          
                          {/* Main Content Area */}
                          <div className="flex-1 min-w-0">
                            {/* Title row with value and arrow on the right */}
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900">
                                  {category.name}
                                </h3>
                                <span className="text-sm font-medium text-gray-500">
                                  ({category.percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">
                                  {formatCurrency(category.value, "USD")}
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-primary-700 transition-colors" />
                              </div>
                            </div>
                            
                            {/* Description with plus signs */}
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap text-xs text-gray-600">
                              {descriptionParts.map((part, idx) => (
                                <span key={idx} className="flex items-center gap-1">
                                  {idx > 0 && <Plus className="h-2.5 w-2.5 text-green-600 flex-shrink-0" />}
                                  <span>{part}</span>
                                </span>
                              ))}
                            </div>
                            
                            {/* Daily gain badge - compact, below value area */}
                            <div className="flex justify-end">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-md">
                                <ArrowUp className="h-2.5 w-2.5 text-green-600" />
                                <span className="text-xs font-semibold text-green-600">
                                  +{formatCurrency(category.dailyGain, "USD")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>
                    </Link>
                  ) : (
                    <AnimatedCard className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-700 p-2.5 rounded-lg flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-gray-900">
                                {category.name}
                              </h3>
                              <span className="text-sm font-medium text-gray-500">
                                ({category.percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(category.value, "USD")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap text-xs text-gray-600">
                            {descriptionParts.map((part, idx) => (
                              <span key={idx} className="flex items-center gap-1">
                                {idx > 0 && <Plus className="h-2.5 w-2.5 text-green-600 flex-shrink-0" />}
                                <span>{part}</span>
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-end">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-md">
                              <ArrowUp className="h-2.5 w-2.5 text-green-600" />
                              <span className="text-xs font-semibold text-green-600">
                                +{formatCurrency(category.dailyGain, "USD")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AnimatedCard>
                  )}
                </FadeIn>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-10">
        <div className="flex justify-around h-16">
          <Link href="/accounts" className="flex flex-col items-center justify-center text-xs text-primary-700">
            <Wallet className="h-5 w-5 mb-1" />
            Accounts
          </Link>
          <Link href="/transactions" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-primary-700 transition-colors">
            <TrendingUp className="h-5 w-5 mb-1" />
            Transfers
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-primary-700 transition-colors">
            <TrendingUp className="h-5 w-5 mb-1" />
            Investments
          </Link>
          <Link href="/support" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-primary-700 transition-colors">
            <Shield className="h-5 w-5 mb-1" />
            More
          </Link>
        </div>
      </nav>
      <div className="md:hidden h-16"></div>
    </div>
  );
}
