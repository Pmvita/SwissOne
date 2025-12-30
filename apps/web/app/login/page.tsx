"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AnimatedButton, FadeIn, SlideIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft, Eye, EyeOff, Lock, ExternalLink } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          username_lookup: username.trim(),
        });

      if (profileError) {
        console.error("Profile lookup error:", profileError);
        // Check if the function doesn't exist
        if (profileError.message?.includes("function") || profileError.code === "42883") {
          setError("Database configuration error. Please contact support.");
        } else {
          setError(`Login error: ${profileError.message || "Invalid username or password"}`);
        }
        setLoading(false);
        return;
      }

      if (!profileData || profileData.length === 0) {
        console.error("No profile found for username:", username);
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      // Extract email and phone from the function result
      const userCredentials = profileData[0];
      if (!userCredentials || !userCredentials.email) {
        console.error("No email found in profile data:", userCredentials);
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userCredentials.email,
        password: password,
      });

      if (error) {
        console.error("Login error:", error);
        setError(error.message || "Invalid username or password");
        setLoading(false);
        return;
      }

      // Verify user was authenticated
      if (!data?.user) {
        console.error("Login failed - no user in response");
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Verify session exists - createBrowserClient automatically handles cookies
      // If no session in initial response, wait briefly and check again
      if (!data.session) {
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 200));
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.error("Session error:", sessionError);
          setError("Failed to establish session. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Login successful - redirect to dashboard with full page reload
      // This ensures cookies are properly read by middleware
      console.log("Login successful, redirecting to dashboard...");
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Professional Header */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Back Button - Left Side */}
            <div className="flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Home
              </Link>
            </div>

            {/* Logo - Right Side */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <Logo size="sm" className="flex-shrink-0" />
                <span className="text-lg lg:text-xl font-semibold text-primary-900 hidden sm:inline-block">
                  SwissOne
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="w-full max-w-6xl">
            {/* Centered White Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 lg:p-12">
              {/* Title with Lock Icon */}
              <div className="flex items-center justify-center mb-8">
                <Lock className="w-5 h-5 text-primary-700 mr-2" />
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Sign in
                </h1>
              </div>

              {/* Two-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column - Sign-in Form */}
                <div className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}

                    {/* Username Field */}
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="relative block w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors"
                        placeholder="Enter your username"
                      />
                      <div className="mt-2">
                        <Link
                          href="#"
                          className="text-sm text-primary-700 hover:text-primary-800 hover:underline transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            // TODO: Implement forgot username functionality
                          }}
                        >
                          Forgot your Username?
                        </Link>
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="relative block w-full rounded-md border border-gray-300 px-3 py-2.5 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <div className="mt-2">
                        <Link
                          href="#"
                          className="text-sm text-primary-700 hover:text-primary-800 hover:underline transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            // TODO: Implement forgot password functionality
                          }}
                        >
                          Forgot your Password?
                        </Link>
                      </div>
                    </div>

                    {/* Sign In Button */}
                    <SlideIn direction="up" delay={0.2}>
                      <div>
                        <AnimatedButton
                          type="submit"
                          disabled={loading}
                          variant="primary"
                          size="lg"
                          className="w-full"
                        >
                          {loading ? "Signing in..." : "SIGN IN"}
                        </AnimatedButton>
                      </div>
                    </SlideIn>
                  </form>
                </div>

                {/* Right Column - Informational Sections */}
                <div className="space-y-8 border-t lg:border-t-0 lg:border-l border-gray-200 pt-8 lg:pt-0 lg:pl-8">
                  {/* Register Section */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Register for online banking
                    </h2>
                    <div className="space-y-3">
                      <Link
                        href="/signup"
                        className="inline-flex items-center text-primary-700 hover:text-primary-800 hover:underline font-medium text-sm transition-colors group"
                      >
                        Create New Account
                        <ExternalLink className="w-4 h-4 ml-1.5 mb-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        New to SwissOne? Create an account to access your banking services online.
                      </p>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-start">
                      <Lock className="w-5 h-5 text-primary-700 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Your security always comes first.
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          We&apos;ve made Online Banking more convenient, while still using advanced security technologies that keep your money and information safe.
                        </p>
                        <Link
                          href="#"
                          className="inline-flex items-center text-sm text-primary-700 hover:text-primary-800 hover:underline font-medium transition-colors group"
                          onClick={(e) => {
                            e.preventDefault();
                            // TODO: Link to security documentation
                          }}
                        >
                          Learn more about how we protect you.
                          <ExternalLink className="w-4 h-4 ml-1.5 mb-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
