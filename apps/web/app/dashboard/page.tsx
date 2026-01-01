import { redirect } from "next/navigation";
import { createClient, createAuthenticatedClient } from "@/lib/supabase/server";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { AnimatedLinkButton } from "@/components/ui/animated/AnimatedLinkButton";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Building2,
  Plus,
  Eye,
  Shield
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { SupabaseClient } from "@supabase/supabase-js";

async function getAccounts(supabase: SupabaseClient, userId: string) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:getAccounts:entry',message:'getAccounts called',data:{userId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Check if client has active session
  const { data: sessionCheck } = await supabase.auth.getSession();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:getAccounts:session',message:'Session check before query',data:{hasSession:!!sessionCheck?.session,userId:sessionCheck?.session?.user?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:getAccounts:result',message:'Accounts query result',data:{error:error?.message,errorCode:error?.code,dataLength:data?.length||0,hasData:!!data,firstAccountId:data?.[0]?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:getTransactions:result',message:'Transactions query result',data:{error:error?.message,errorCode:error?.code,dataLength:data?.length||0,hasData:!!data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
  return data || [];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:DashboardPage:entry',message:'DashboardPage started',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Try standard getUser first
  const {
    data: { user: fetchedUser },
    error: getUserError,
  } = await supabase.auth.getUser();
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:DashboardPage:getUser',message:'getUser result',data:{hasUser:!!fetchedUser,userId:fetchedUser?.id,getUserError:getUserError?.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
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
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:DashboardPage:userId',message:'User ID extracted',data:{userId,hasAccessToken:!!accessToken},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
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
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:DashboardPage:beforeQueries',message:'Before queries',data:{hasAccessToken:!!accessToken,usingAuthenticatedClient:!!accessToken,queryUserId:userId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  // Use authenticated client for queries so RLS works correctly
  const accounts = await getAccounts(authenticatedSupabase, userId);
  const recentTransactions = await getTransactions(authenticatedSupabase, userId, 5);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard/page.tsx:DashboardPage:afterQueries',message:'Queries completed',data:{accountsCount:accounts.length,transactionsCount:recentTransactions.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const accountCount = accounts.length;
  const transactionCount = recentTransactions.length;

  // Get account type icon
  const getAccountIcon = (type: string) => {
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
  };

  // Get account type color
  const getAccountColor = (type: string) => {
    switch (type) {
      case "checking":
        return "bg-primary-500";
      case "savings":
        return "bg-accent-500";
      case "investment":
        return "bg-green-500";
      case "credit":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-3">
              <Logo size="sm" className="flex-shrink-0" />
              <h1 className="text-xl font-bold text-primary-900">SwissOne</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 hidden sm:inline">{user.email}</span>
              {/* Show Security Dashboard link for admin/staff */}
              {isAdminOrStaff && (
                <Link
                  href="/security"
                  className="px-3 py-1.5 text-sm font-semibold border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Security
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm font-semibold border-2 border-primary-700 text-primary-700 rounded-lg hover:bg-primary-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <FadeIn delay={0.1}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Banking Dashboard</h2>
            <p className="mt-2 text-gray-600">Welcome back, manage your accounts and transactions</p>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <AnimatedCard delay={0.2} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalBalance, "CHF")}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary-700" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Active Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">{accountCount}</p>
                </div>
                <div className="h-12 w-12 bg-accent-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-accent-700" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.4} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Recent Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{transactionCount}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.5} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Portfolio Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(0, "CHF")}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Accounts Section */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.6}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Your Accounts</h3>
                <AnimatedLinkButton 
                  href="/accounts" 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View All
                </AnimatedLinkButton>
              </div>
            </FadeIn>

            {accounts.length === 0 ? (
              <AnimatedCard delay={0.7}>
                <div className="p-12 text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h4>
                  <p className="text-gray-500 mb-6">Get started by creating your first banking account</p>
                  <AnimatedLinkButton href="/accounts" variant="primary" size="md" className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Account
                  </AnimatedLinkButton>
                </div>
              </AnimatedCard>
            ) : (
              <div className="space-y-4">
                {accounts.slice(0, 3).map((account, index) => {
                  const Icon = getAccountIcon(account.type);
                  const colorClass = getAccountColor(account.type);
                  return (
                    <AnimatedCard key={account.id} delay={0.7 + index * 0.1} className="hover:shadow-md transition-shadow">
                      <Link href="/accounts" className="block">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className={`h-12 w-12 ${colorClass} rounded-lg flex items-center justify-center`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{account.name}</h4>
                                <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(Number(account.balance || 0), account.currency || "CHF")}
                              </p>
                              {account.account_number && (
                                <p className="text-xs text-gray-400 mt-1">****{account.account_number.slice(-4)}</p>
                              )}
                            </div>
                          </div>
                          {account.iban && (
                            <div className="pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-500">IBAN: {account.iban}</p>
                            </div>
                          )}
                        </div>
                      </Link>
                    </AnimatedCard>
                  );
                })}
                {accounts.length > 3 && (
                  <AnimatedCard delay={1.0}>
                    <Link href="/accounts" className="block p-6 text-center">
                      <p className="text-primary-700 font-medium">
                        View {accounts.length - 3} more account{accounts.length - 3 !== 1 ? "s" : ""}
                      </p>
                    </Link>
                  </AnimatedCard>
                )}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.6}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                <AnimatedLinkButton 
                  href="/transactions" 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                >
                  View All
                </AnimatedLinkButton>
              </div>
            </FadeIn>

            {recentTransactions.length === 0 ? (
              <AnimatedCard delay={0.7}>
                <div className="p-8 text-center">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ArrowUpRight className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No transactions yet</p>
                </div>
              </AnimatedCard>
            ) : (
              <AnimatedCard delay={0.7}>
                <div className="divide-y divide-gray-100">
                  {recentTransactions.map((transaction, index) => {
                    const isCredit = transaction.type === "credit";
                    const amount = Number(transaction.amount || 0);
                    return (
                      <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              isCredit ? "bg-green-100" : "bg-red-100"
                            }`}>
                              {isCredit ? (
                                <ArrowDownRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {transaction.description || "Transaction"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {transaction.accounts?.name || "Account"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              isCredit ? "text-green-600" : "text-red-600"
                            }`}>
                              {isCredit ? "+" : "-"}{formatCurrency(Math.abs(amount), transaction.currency || "CHF")}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AnimatedCard>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <FadeIn delay={0.8}>
          <div className="mt-8">
            <AnimatedCard>
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <AnimatedLinkButton 
                    href="/accounts" 
                    variant="outline" 
                    size="md" 
                    className="w-full justify-center flex-col h-auto py-4 gap-2"
                  >
                    <Wallet className="h-5 w-5" />
                    <span>Accounts</span>
                  </AnimatedLinkButton>
                  <AnimatedLinkButton 
                    href="/transactions" 
                    variant="outline" 
                    size="md" 
                    className="w-full justify-center flex-col h-auto py-4 gap-2"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                    <span>Transactions</span>
                  </AnimatedLinkButton>
                  <AnimatedLinkButton 
                    href="/portfolio" 
                    variant="outline" 
                    size="md" 
                    className="w-full justify-center flex-col h-auto py-4 gap-2"
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span>Portfolio</span>
                  </AnimatedLinkButton>
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center px-4 py-4 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-white cursor-not-allowed gap-2"
                    disabled
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Transfer</span>
                  </button>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </FadeIn>
      </main>
    </div>
  );
}
