"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AnimatedButton, FadeIn, SlideIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for error in URL params (e.g., from auth callback)
    // Use window.location.search to avoid Next.js 15 searchParams issues
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const errorParam = searchParams.get("error");
      const messageParam = searchParams.get("message");
      if (errorParam) {
        setError(errorParam);
      } else if (messageParam) {
        setError(messageParam);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      // Check if user is confirmed
      // Note: You can disable email confirmation requirement in Supabase Dashboard:
      // Authentication → Settings → "Enable email confirmations" (toggle off)
      if (data.user && !data.user.email_confirmed_at) {
        console.warn("Email not confirmed, but proceeding with login");
        // For development: Allow login even if email not confirmed
        // For production: Uncomment below to require email confirmation
        // setError("Please confirm your email address before signing in. Check your inbox for the confirmation link.");
        // setLoading(false);
        // return;
      }

      // Verify session is established
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Session error:", sessionError);
        setError("Failed to establish session. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Login successful, session established:", {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!session,
        sessionExpiresAt: session?.expires_at
      });

      // Ensure profile exists (trigger should handle this, but double-check)
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            }, {
              onConflict: "id"
            });

          if (profileError) {
            console.warn("Profile upsert warning:", profileError);
            // Don't block login if profile creation fails
          } else {
            console.log("Profile verified/created successfully");
          }
        } catch (profileErr) {
          console.warn("Profile check error (non-blocking):", profileErr);
        }
      }

      // Successfully signed in - clear states
      setError(null);
      
      // Wait a moment to ensure session cookies are set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify session one more time before redirect
      const { data: { session: finalSession } } = await supabase.auth.getSession();
      if (!finalSession) {
        console.error("Session lost before redirect");
        setError("Session was lost. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Redirecting to dashboard...");
      setLoading(false);
      
      // Use window.location for reliable redirect that forces full page reload
      // This ensures cookies are properly set and middleware can verify the session
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Safety timeout to reset loading state if something goes wrong
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false);
        setError("Login is taking longer than expected. Please try again.");
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <FadeIn>
        <div className="w-full max-w-md space-y-8 relative">
          {/* Back Button */}
          <div className="absolute -top-12 left-0">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <SlideIn direction="down">
            <div className="flex flex-col items-center">
              <FadeIn delay={0.1}>
                <Logo size="md" className="mb-6" />
              </FadeIn>
              <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                Sign in to SwissOne
              </h2>
            </div>
          </SlideIn>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <SlideIn direction="up" delay={0.3}>
            <div>
              <AnimatedButton
                type="submit"
                disabled={loading}
                variant="primary"
                size="md"
                className="w-full"
              >
                {loading ? "Signing in..." : "Sign in"}
              </AnimatedButton>
            </div>
          </SlideIn>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </FadeIn>
    </div>
  );
}

