import { redirect } from "next/navigation";
import { createClient, createAuthenticatedClient } from "@/lib/supabase/server";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { FileText, User, Shield, Wallet, TrendingUp, ArrowLeft, Upload } from "lucide-react";

export default async function DocumentsPage() {
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
            <Link href="/accounts" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Accounts
            </Link>
            <Link href="/dashboard" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Investments
            </Link>
            <Link href="/transactions" className="px-3 py-4 text-sm font-medium text-primary-900 hover:text-primary-700 border-b-2 border-transparent hover:border-primary-700 transition-colors">
              Transfers
            </Link>
            <Link href="/documents" className="px-3 py-4 text-sm font-medium text-primary-900 border-b-2 border-primary-700">
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Documents</h2>
            <p className="mt-2 text-gray-600">Access and manage your financial documents</p>
          </div>
        </FadeIn>

        {/* Documents Content */}
        <FadeIn delay={0.2}>
          <AnimatedCard className="p-12">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Management</h3>
              <p className="text-gray-500 mb-6">
                Document management features will be available here. You'll be able to view, upload, and download your financial documents.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center justify-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
                <button className="inline-flex items-center justify-center px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  View All Documents
                </button>
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


