import { redirect } from "next/navigation";
import { createClient, createAuthenticatedClient } from "@/lib/supabase/server";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { Wallet, Building2, TrendingUp, CreditCard, User, Shield, ArrowLeft } from "lucide-react";
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

export default async function AccountsPage() {
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

  // Fetch accounts
  const accounts = await getAccounts(authenticatedSupabase, userId);

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

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
            <Link href="/dashboard" className="inline-flex items-center text-sm text-primary-700 hover:text-primary-900 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Your Accounts</h2>
            <p className="mt-2 text-gray-600">Manage and view all your banking accounts</p>
          </div>
        </FadeIn>

        {/* Summary Card */}
        <FadeIn delay={0.2}>
          <AnimatedCard className="p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Balance Across All Accounts</p>
                <p className="text-3xl font-bold text-primary-700">
                  {formatCurrency(totalBalance, "USD")}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-600 mb-1">Number of Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
              </div>
            </div>
          </AnimatedCard>
        </FadeIn>

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <FadeIn delay={0.3}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account, index) => {
              const IconComponent = getAccountIcon(account.type);
              const colorClass = getAccountColor(account.type);

              return (
                <FadeIn key={account.id} delay={0.3 + index * 0.1}>
                  <AnimatedCard className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${colorClass} p-3 rounded-lg`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Balance</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(Number(account.balance || 0), account.currency || "USD")}
                        </p>
                      </div>

                      {account.account_number && (
                        <div>
                          <p className="text-xs text-gray-500">Account Number</p>
                          <p className="text-sm font-mono text-gray-700">
                            ****{account.account_number.toString().slice(-4)}
                          </p>
                        </div>
                      )}

                      {account.iban && (
                        <div>
                          <p className="text-xs text-gray-500">IBAN</p>
                          <p className="text-sm font-mono text-gray-700 break-all">
                            {account.iban}
                          </p>
                        </div>
                      )}
                    </div>
                  </AnimatedCard>
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
