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
  const [username, setUsername] = useState("");
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
      
      // First, look up the user's email and phone from their username
      // Using a database function to bypass RLS for login purposes
      const { data: profileData, error: profileError } = await supabase
        .rpc("get_user_credentials_by_username", {
          username_lookup: username,
        });

      if (profileError || !profileData || profileData.length === 0) {
        console.error("Profile lookup error:", profileError);
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      // Extract email and phone from the function result
      const userCredentials = profileData[0];
      if (!userCredentials || !userCredentials.email) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      // Sign in with email and password to verify credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userCredentials.email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      // Store user info for MFA before signing out
      if (data.user) {
        // Store email and phone in sessionStorage for MFA page
        sessionStorage.setItem("mfa_email", userCredentials.email);
        sessionStorage.setItem("mfa_phone", userCredentials.phone || "");
        sessionStorage.setItem("mfa_user_id", data.user.id);
        
        // Sign out to require MFA verification
        await supabase.auth.signOut();
        
        // Redirect to MFA page
        setLoading(false);
        router.push("/mfa");
        return;
      }

      setError("Login failed. Please try again.");
      setLoading(false);
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
              href="/landing"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <SlideIn direction="down">
            <div className="flex flex-col items-center">
              <FadeIn delay={0.1}>
                <Logo size="2xl" className="mb-6" />
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
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="Username"
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

