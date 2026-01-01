import { redirect } from "next/navigation";
import { createClient, createAuthenticatedClient } from "@/lib/supabase/server";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Wallet, User, Shield, TrendingUp, ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { SupabaseClient } from "@supabase/supabase-js";

async function getTransactions(supabase: SupabaseClient, userId: string, limit?: number) {
  const query = supabase
    .from("transactions")
    .select("*, accounts(name, type)")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
  return data || [];
}

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;

  // Get session tokens for authenticated client
  const { data: session } = await supabase.auth.getSession();
  const accessToken = session?.session?.access_token || null;
  const refreshToken = session?.session?.refresh_token || null;

  // Create authenticated client for RLS
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

  // Fetch all transactions
  const transactions = await getTransactions(authenticatedSupabase, userId);

  // Calculate summary
  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netAmount = totalCredits - totalDebits;

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
          <div className="flex space-x-8">
            <Link href="/accounts" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Accounts
            </Link>
            <Link href="/dashboard" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Investments
            </Link>
            <Link href="/transactions" className="px-3 py-4 text-sm font-medium text-primary-900 border-b-2 border-primary-700">
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
            <Link href="/dashboard" className="inline-flex items-center text-sm text-primary-700 hover:text-primary-900 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Transaction History</h2>
            <p className="mt-2 text-gray-600">View all your transfers and transactions</p>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <FadeIn delay={0.2}>
            <AnimatedCard className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ArrowDownRight className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalCredits, "USD")}
              </p>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.3}>
            <AnimatedCard className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Debits</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalDebits, "USD")}
              </p>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.4}>
            <AnimatedCard className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="h-5 w-5 text-primary-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Net Amount</p>
              <p className={`text-2xl font-bold ${netAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(netAmount, "USD")}
              </p>
            </AnimatedCard>
          </FadeIn>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <FadeIn delay={0.5}>
            <AnimatedCard className="p-12">
              <div className="text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUpRight className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">Your transaction history will appear here</p>
              </div>
            </AnimatedCard>
          </FadeIn>
        ) : (
          <FadeIn delay={0.5}>
            <AnimatedCard className="p-0 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction, index) => {
                  const isCredit = transaction.type === "credit";
                  const amount = Number(transaction.amount || 0);
                  const Icon = isCredit ? ArrowDownRight : ArrowUpRight;

                  return (
                    <div
                      key={transaction.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCredit ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${isCredit ? "text-green-600" : "text-red-600"}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {transaction.description || "Transaction"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {transaction.accounts?.name || "Account"}
                              </p>
                              <span className="text-xs text-gray-300">•</span>
                              <p className="text-xs text-gray-500">
                                {formatDate(transaction.date)}
                              </p>
                              {transaction.category && (
                                <>
                                  <span className="text-xs text-gray-300">•</span>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {transaction.category}
                                  </p>
                                </>
                              )}
                            </div>
                            {transaction.reference && (
                              <p className="text-xs text-gray-400 mt-1 font-mono">
                                Ref: {transaction.reference}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-right">
                          <p
                            className={`text-lg font-semibold ${
                              isCredit ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {formatCurrency(amount, transaction.currency || "USD")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>
          </FadeIn>
        )}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-10">
        <div className="flex justify-around h-16">
          <Link href="/accounts" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-primary-700 transition-colors">
            <Wallet className="h-5 w-5 mb-1" />
            Accounts
          </Link>
          <Link href="/transactions" className="flex flex-col items-center justify-center text-xs text-primary-700">
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

