import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { AnimatedLinkButton } from "@/components/ui/animated/AnimatedLinkButton";
import { Logo } from "@/components/ui/Logo";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-3">
                <Logo size="sm" className="flex-shrink-0" />
                <h1 className="text-xl font-bold text-primary-900">SwissOne</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
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
        <FadeIn delay={0.1}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-2 text-gray-600">Welcome to your banking dashboard</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatedCard delay={0.2} className="overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">CHF</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Balance
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      CHF 0.00
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Portfolio Value
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      CHF 0.00
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.4} className="overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Accounts
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <FadeIn delay={0.5}>
          <div className="mt-8">
            <AnimatedCard>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <AnimatedLinkButton href="/accounts" variant="outline" size="md" className="w-full justify-center">
                    View Accounts
                  </AnimatedLinkButton>
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-white cursor-not-allowed"
                    disabled
                  >
                    Transfer Funds
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-white cursor-not-allowed"
                    disabled
                  >
                    View Transactions
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-white cursor-not-allowed"
                    disabled
                  >
                    Portfolio
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

