"use client";

import { useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft, Eye, EyeOff, Lock, ExternalLink } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.mfaRequired && data.email) {
          sessionStorage.setItem("mfa_email", data.email);
          if (data.phone) sessionStorage.setItem("mfa_phone", data.phone);
          if (data.userId) sessionStorage.setItem("mfa_user_id", data.userId);
        }

        setTimeout(() => {
          window.location.href = data.redirect || "/dashboard";
        }, 100);
        return;
      }

      console.error("[LOGIN PAGE] Error response:", response.status);
      let errorMessage = "Invalid username or password";
      try {
        const data = await response.json();
        errorMessage = data.error || errorMessage;
        console.error("[LOGIN PAGE] Error data:", data);
      } catch (err) {
        console.error("[LOGIN PAGE] Failed to parse error response:", err);
      }
      setError(errorMessage);
      setLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col alpine-mist">
      <header className="w-full bg-snow/90 border-b border-line backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <Link
              href="/landing"
              className="inline-flex items-center text-sm font-medium text-slate hover:text-ink transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
            <Link href="/landing" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Logo size="sm" className="flex-shrink-0 h-10 w-10" />
              <span className="font-display text-xl lg:text-2xl text-ink hidden sm:inline-block">
                SwissOne
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="w-full max-w-5xl">
            <div className="bg-snow border border-line rounded-md p-8 lg:p-12">
              <div className="flex items-center justify-center mb-8 gap-2">
                <Lock className="w-5 h-5 text-alpine" />
                <h1 className="font-display text-3xl lg:text-4xl text-ink">Sign in</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="rounded-md bg-alpine/5 border border-alpine/30 p-4">
                        <p className="text-sm text-alpine">{error}</p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-slate mb-2">
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
                        disabled={loading}
                        className="relative block w-full rounded-md border border-line bg-snow px-3 py-2.5 text-ink placeholder:text-slate/50 focus:z-10 focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/30 sm:text-sm disabled:bg-glacier disabled:cursor-not-allowed"
                        placeholder="Enter your username"
                      />
                      <div className="mt-2">
                        <Link
                          href="#"
                          className="text-sm text-alpine hover:text-primary-800 hover:underline"
                          onClick={(e) => e.preventDefault()}
                        >
                          Forgot your Username?
                        </Link>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate mb-2">
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
                          disabled={loading}
                          className="relative block w-full rounded-md border border-line bg-snow px-3 py-2.5 pr-10 text-ink placeholder:text-slate/50 focus:z-10 focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/30 sm:text-sm disabled:bg-glacier disabled:cursor-not-allowed"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate hover:text-ink disabled:cursor-not-allowed"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="mt-2">
                        <Link
                          href="#"
                          className="text-sm text-alpine hover:text-primary-800 hover:underline"
                          onClick={(e) => e.preventDefault()}
                        >
                          Forgot your Password?
                        </Link>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 text-lg font-semibold rounded-md bg-alpine text-snow hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-brass focus:ring-offset-2 disabled:bg-slate disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Signing in..." : "SIGN IN"}
                    </button>
                  </form>
                </div>

                <div className="space-y-8 border-t lg:border-t-0 lg:border-l border-line pt-8 lg:pt-0 lg:pl-8">
                  <div>
                    <h2 className="font-display text-xl text-ink mb-4">Register for online banking</h2>
                    <div className="space-y-3">
                      <Link
                        href="/signup"
                        className="inline-flex items-center text-alpine hover:text-primary-800 hover:underline font-medium text-sm"
                      >
                        Create New Account
                        <ExternalLink className="w-4 h-4 ml-1.5 mb-0.5" />
                      </Link>
                      <p className="text-sm text-slate leading-relaxed">
                        New to SwissOne? Create an account to access your banking services online.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-line">
                    <div className="flex items-start">
                      <Lock className="w-5 h-5 text-brass mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-display text-xl text-ink mb-2">Your security always comes first.</h3>
                        <p className="text-sm text-slate mb-3 leading-relaxed">
                          We&apos;ve made Online Banking more convenient, while still using advanced security
                          technologies that keep your money and information safe.
                        </p>
                        <Link
                          href="#"
                          className="inline-flex items-center text-sm text-alpine hover:text-primary-800 hover:underline font-medium"
                          onClick={(e) => e.preventDefault()}
                        >
                          Learn more about how we protect you.
                          <ExternalLink className="w-4 h-4 ml-1.5 mb-0.5" />
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
