import { redirect } from "next/navigation";
import { createClient, createAuthenticatedClient } from "@/lib/supabase/server";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { 
  Wallet, 
  Building2, 
  TrendingUp, 
  CreditCard, 
  User, 
  Shield, 
  ArrowRight, 
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  MoreVertical,
  Copy,
  CheckCircle2,
  Clock,
  DollarSign
} from "lucide-react";
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

function getAccountTypeLabel(type: string): string {
  switch (type) {
    case "checking":
      return "Checking";
    case "savings":
      return "Savings";
    case "investment":
      return "Investment";
    case "credit":
      return "Credit";
    default:
      return "Account";
  }
}

function getAccountTypeColor(type: string): string {
  switch (type) {
    case "checking":
      return "bg-blue-600";
    case "savings":
      return "bg-green-600";
    case "investment":
      return "bg-purple-600";
    case "credit":
      return "bg-orange-600";
    default:
      return "bg-gray-600";
  }
}

function maskAccountNumber(accountNumber: string | number | null): string {
  if (!accountNumber) return "**** ****";
  const str = accountNumber.toString();
  if (str.length <= 4) return `**** ${str}`;
  return `****${str.slice(-4)}`;
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

  // Group accounts by type (standard banking order: checking, savings, investment, credit)
  const accountTypeOrder = ['checking', 'savings', 'investment', 'credit', 'loan'];
  const groupedAccounts = accounts.reduce((acc, account) => {
    const type = account.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>);

  // Sort accounts within each group by balance (highest first)
  Object.keys(groupedAccounts).forEach(type => {
    groupedAccounts[type].sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));
  });

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const accountCount = accounts.length;
  
  // Calculate balances by type
  const checkingBalance = accounts
    .filter(acc => acc.type === 'checking')
    .reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const savingsBalance = accounts
    .filter(acc => acc.type === 'savings')
    .reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  
  // Get display name
  const displayName = profile?.full_name || 
    (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : null) ||
    profile?.username ||
    user.email?.split('@')[0] ||
    'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-3">
              <Logo size="sm" className="flex-shrink-0" />
              <h1 className="text-xl font-bold text-gray-900">SwissOne Private Banking</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline">{user.email}</span>
              {isAdminOrStaff && (
                <Link
                  href="/security"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Shield className="h-4 w-4 inline mr-1" />
                  Security
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar (Desktop) */}
      <nav className="hidden md:block bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/accounts" className="px-3 py-4 text-sm font-semibold text-primary-700 border-b-2 border-primary-700">
              Accounts
            </Link>
            <Link href="/dashboard" className="px-3 py-4 text-sm font-medium text-gray-700 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Investments
            </Link>
            <Link href="/transactions" className="px-3 py-4 text-sm font-medium text-gray-700 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Transfers
            </Link>
            <Link href="/documents" className="px-3 py-4 text-sm font-medium text-gray-700 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Documents
            </Link>
            <Link href="/support" className="px-3 py-4 text-sm font-medium text-gray-700 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">My Accounts</h2>
          <p className="text-sm text-gray-600 mt-1">View and manage your accounts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <FadeIn delay={0.1}>
            <AnimatedCard className="p-6 bg-gradient-to-br from-primary-700 to-primary-800 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white/90">Total Balance</p>
                <DollarSign className="h-5 w-5 text-white/80" />
              </div>
              <p className="text-3xl md:text-4xl font-bold mb-1">
                {formatCurrency(totalBalance, "USD")}
              </p>
              <p className="text-xs text-white/80">Across {accountCount} {accountCount === 1 ? 'account' : 'accounts'}</p>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.2}>
            <AnimatedCard className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Checking & Savings</p>
                <Wallet className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {formatCurrency(checkingBalance + savingsBalance, "USD")}
              </p>
              <p className="text-xs text-gray-500">Available for transactions</p>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.3}>
            <AnimatedCard className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{accountCount}</p>
              <p className="text-xs text-gray-500">All accounts active</p>
            </AnimatedCard>
          </FadeIn>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Transfer Money
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Statements
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View All Transactions
            </button>
          </div>
        </div>

        {/* Accounts List - Grouped by Type */}
        {accounts.length === 0 ? (
          <FadeIn delay={0.4}>
            <AnimatedCard className="p-12 bg-white border border-gray-200">
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
          <div className="space-y-6">
            {accountTypeOrder.map((type, typeIndex) => {
              const typeAccounts = groupedAccounts[type] || [];
              if (typeAccounts.length === 0) return null;

              const typeLabel = getAccountTypeLabel(type);
              let delay = 0.4 + typeIndex * 0.1;

              return (
                <div key={type}>
                  {/* Section Header */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{typeLabel} Accounts</h3>
                    <p className="text-sm text-gray-500">
                      {typeAccounts.length} {typeAccounts.length === 1 ? 'account' : 'accounts'}
                    </p>
                  </div>

                  {/* Accounts in this group */}
                  <div className="space-y-3">
                    {typeAccounts.map((account, accountIndex) => {
                      const IconComponent = getAccountIcon(account.type);
                      const accountTypeLabel = getAccountTypeLabel(account.type);
                      const accountTypeColor = getAccountTypeColor(account.type);
                      const balance = Number(account.balance || 0);
                      const accountNumber = maskAccountNumber(account.account_number);

                      return (
                        <FadeIn key={account.id} delay={delay + accountIndex * 0.05}>
                          <AnimatedCard className="bg-white border border-gray-200 hover:shadow-md transition-all">
                            <Link href={`/accounts/${account.id}`}>
                              <div className="p-5">
                                <div className="flex items-center justify-between">
                                  {/* Account Info */}
                                  <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* Account Icon */}
                                    <div className={`${accountTypeColor} p-3 rounded-lg flex-shrink-0`}>
                                      <IconComponent className="h-5 w-5 text-white" />
                                    </div>
                                    
                                    {/* Account Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-base font-semibold text-gray-900 truncate">
                                          {account.name}
                                        </h4>
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-gray-600">
                                        {account.account_number && (
                                          <span className="font-mono">{accountNumber}</span>
                                        )}
                                        {account.iban && (
                                          <span className="font-mono truncate max-w-[200px]">{account.iban}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Balance */}
                                  <div className="text-right flex-shrink-0 ml-4">
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                                      {formatCurrency(balance, account.currency || "USD")}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">Available</p>
                                  </div>

                                  {/* Arrow */}
                                  <div className="ml-4 flex-shrink-0">
                                    <ArrowRight className="h-5 w-5 text-gray-400" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </AnimatedCard>
                        </FadeIn>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Information */}
        {accounts.length > 0 && (
          <FadeIn delay={0.6}>
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Secure Banking</h4>
                  <p className="text-xs text-blue-800">
                    Your accounts are protected by Swiss banking security standards. All transactions are encrypted and monitored 24/7.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
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
            <ArrowUpRight className="h-5 w-5 mb-1" />
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
