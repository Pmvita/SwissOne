import { redirect } from "next/navigation";
import { createClient, createAuthenticatedClient } from "@/lib/supabase/server";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { HelpCircle, Mail, Phone, MessageSquare, User, Shield, Wallet, TrendingUp, ArrowLeft } from "lucide-react";

export default async function SupportPage() {
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
            <Link href="/transactions" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Transfers
            </Link>
            <Link href="/documents" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Documents
            </Link>
            <Link href="/support" className="px-3 py-4 text-sm font-medium text-primary-900 border-b-2 border-primary-700">
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Support Center</h2>
            <p className="mt-2 text-gray-600">Get help and contact your private wealth advisor</p>
          </div>
        </FadeIn>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <FadeIn delay={0.2}>
            <AnimatedCard className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-sm text-gray-600 mb-4">Speak with a wealth advisor</p>
              <a href="tel:+41123456789" className="text-primary-700 font-medium hover:text-primary-900">
                +41 XX XXX XX XX
              </a>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.3}>
            <AnimatedCard className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-sm text-gray-600 mb-4">Send us an email</p>
              <a href="mailto:support@swissone.ch" className="text-primary-700 font-medium hover:text-primary-900">
                support@swissone.ch
              </a>
            </AnimatedCard>
          </FadeIn>

          <FadeIn delay={0.4}>
            <AnimatedCard className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Center</h3>
              <p className="text-sm text-gray-600 mb-4">Send a secure message</p>
              <button className="text-primary-700 font-medium hover:text-primary-900">
                Open Messages
              </button>
            </AnimatedCard>
          </FadeIn>
        </div>

        {/* FAQ Section */}
        <FadeIn delay={0.5}>
          <AnimatedCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-6 w-6 text-primary-700" />
              <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
            </div>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  How do I transfer funds between accounts?
                </h4>
                <p className="text-sm text-gray-600">
                  You can transfer funds using the Transfers page. Navigate to the Transfers section from the main navigation.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  How do I view my investment portfolio?
                </h4>
                <p className="text-sm text-gray-600">
                  Your portfolio overview is available on the Investments dashboard. You can see your holdings, asset allocation, and performance metrics.
                </p>
              </div>
              <div className="pb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  How do I contact my private wealth advisor?
                </h4>
                <p className="text-sm text-gray-600">
                  You can contact your advisor through the phone, email, or message center options above. Your advisor's contact information is also available on the Investments dashboard.
                </p>
              </div>
            </div>
          </AnimatedCard>
        </FadeIn>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-10">
        <div className="flex justify-around h-16">
          <Link href="/accounts" className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-primary-700 transition-colors">
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
          <Link href="/support" className="flex flex-col items-center justify-center text-xs text-primary-700">
            <Shield className="h-5 w-5 mb-1" />
            More
          </Link>
        </div>
      </nav>
      <div className="md:hidden h-16"></div>
    </div>
  );
}


