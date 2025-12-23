import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  EyeOff
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";

async function getAccounts(userId: string) {
  const supabase = await createClient();
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

async function getTransactions(userId: string, limit: number = 5) {
  const supabase = await createClient();
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

export default async function DashboardPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    const accounts = await getAccounts(user.id);
    const recentTransactions = await getTransactions(user.id, 5);

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
  } catch (error) {
    console.error("Dashboard error:", error);
    redirect("/login");
  }
}
