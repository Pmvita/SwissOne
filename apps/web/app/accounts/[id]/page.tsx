import { redirect } from "next/navigation";
import { createClient, createAuthenticatedClient } from "@/lib/supabase/server";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { Wallet, Building2, TrendingUp, CreditCard, User, Shield, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { SupabaseClient } from "@supabase/supabase-js";

async function getAccount(supabase: SupabaseClient, accountId: string, userId: string) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching account:", error);
    return null;
  }
  return data;
}

async function getTransactions(supabase: SupabaseClient, accountId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", accountId)
    .order("transaction_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
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

interface AccountDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { id: accountId } = await params;
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
    .select("role, email, username")
    .eq("id", userId)
    .maybeSingle();

  const isAdminOrStaff = profile?.role === "admin" || profile?.role === "staff";

  // Fetch account
  const account = await getAccount(authenticatedSupabase, accountId, userId);

  if (!account) {
    redirect("/accounts");
  }

  // Fetch transactions
  const transactions = await getTransactions(authenticatedSupabase, accountId, 20);

  const IconComponent = getAccountIcon(account.type);
  const colorClass = getAccountColor(account.type);

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
        {/* Page Header */}
        <FadeIn delay={0.1}>
          <div className="mb-6">
            <Link href="/accounts" className="inline-flex items-center text-sm text-primary-700 hover:text-primary-900 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Accounts
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className={`${colorClass} p-3 rounded-lg`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{account.name}</h2>
                <p className="text-sm text-gray-600 capitalize mt-1">{account.type} Account</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Account Overview Card */}
        <FadeIn delay={0.2}>
          <AnimatedCard className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(Number(account.balance || 0), account.currency || "USD")}
                </p>
              </div>
              {account.account_number && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Account Number</p>
                  <p className="text-lg font-mono text-gray-900">
                    ****{account.account_number.toString().slice(-4)}
                  </p>
                </div>
              )}
              {account.iban && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">IBAN</p>
                  <p className="text-lg font-mono text-gray-900 break-all">
                    {account.iban}
                  </p>
                </div>
              )}
            </div>
          </AnimatedCard>
        </FadeIn>

        {/* Recent Transactions */}
        <FadeIn delay={0.3}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <AnimatedCard className="p-12">
                <div className="text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-500">Transactions will appear here once available</p>
                </div>
              </AnimatedCard>
            ) : (
              <AnimatedCard className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{transaction.description || "N/A"}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 capitalize">{transaction.type || "N/A"}</td>
                          <td className={`py-3 px-4 text-sm font-semibold text-right ${
                            transaction.type === "credit" || transaction.type === "deposit" 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}>
                            {transaction.type === "credit" || transaction.type === "deposit" ? "+" : "-"}
                            {formatCurrency(Math.abs(Number(transaction.amount || 0)), transaction.currency || account.currency || "USD")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AnimatedCard>
            )}
          </div>
        </FadeIn>
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

