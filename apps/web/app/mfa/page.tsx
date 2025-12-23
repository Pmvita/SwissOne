"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AnimatedButton, FadeIn, SlideIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft } from "lucide-react";

export default function MFAPage() {
  const router = useRouter();
  const [mfaMethod, setMfaMethod] = useState<"phone" | "email" | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"select" | "verify">("select");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  useEffect(() => {
    // Get user info from sessionStorage
    const storedEmail = sessionStorage.getItem("mfa_email");
    const storedPhone = sessionStorage.getItem("mfa_phone");

    if (!storedEmail) {
      // If no email, redirect back to login
      router.push("/login?error=Session expired. Please login again.");
      return;
    }

    setEmail(storedEmail);
    setPhone(storedPhone || "");
  }, [router]);

  // Parse rate limit seconds from error message
  const parseRateLimitSeconds = (message: string): number | null => {
    const match = message.match(/after (\d+) seconds?/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimitSeconds !== null && rateLimitSeconds > 0) {
      const timer = setTimeout(() => {
        setRateLimitSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (rateLimitSeconds === 0) {
      setRateLimitSeconds(null);
      setError(null);
    }
  }, [rateLimitSeconds]);

  const handleSelectMethod = async (method: "phone" | "email") => {
    setError(null);
    setRateLimitSeconds(null);
    setMfaMethod(method);
    setLoading(true);

    try {
      const supabase = createClient();

      if (method === "phone") {
        if (!phone) {
          setError("Phone number not found. Please contact support.");
          setLoading(false);
          return;
        }

        const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            channel: "sms",
          },
        });

        if (error) {
          console.error("Send SMS code error:", error);
          
          // Handle phone provider not configured
          if (error.message.includes("Unsupported phone provider") || error.message.includes("phone_provider_disabled")) {
            setError("Phone authentication is not configured. Please use email verification instead.");
          } else {
            // Check for rate limit
            const seconds = parseRateLimitSeconds(error.message);
            if (seconds !== null) {
              setRateLimitSeconds(seconds);
              setError(`Please wait ${seconds} seconds before requesting another code.`);
            } else {
              setError(error.message);
            }
          }
          setLoading(false);
          setMfaMethod(null);
          return;
        }
      } else {
        // Email method
        const { error } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          console.error("Send email code error:", error);
          
          // Check for rate limit
          const seconds = parseRateLimitSeconds(error.message);
          if (seconds !== null) {
            setRateLimitSeconds(seconds);
            setError(`Please wait ${seconds} seconds before requesting another code.`);
          } else {
            setError(error.message);
          }
          setLoading(false);
          setMfaMethod(null);
          return;
        }
      }

      setStep("verify");
      setLoading(false);
    } catch (err) {
      console.error("Send code error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
      setMfaMethod(null);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!verificationCode) {
      setError("Please enter the verification code");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      if (mfaMethod === "phone") {
        const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
        const { data, error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: verificationCode,
          type: "sms",
        });

        if (error) {
          console.error("Verify code error:", error);
          setError(error.message);
          setLoading(false);
          return;
        }

        // Verify session is established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          setError("Failed to establish session. Please try again.");
          setLoading(false);
          return;
        }

        // Clear sessionStorage
        sessionStorage.removeItem("mfa_email");
        sessionStorage.removeItem("mfa_phone");
        sessionStorage.removeItem("mfa_user_id");

        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        // Email verification
        const { data, error } = await supabase.auth.verifyOtp({
          email: email,
          token: verificationCode,
          type: "email",
        });

        if (error) {
          console.error("Verify code error:", error);
          setError(error.message);
          setLoading(false);
          return;
        }

        // Verify session is established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          setError("Failed to establish session. Please try again.");
          setLoading(false);
          return;
        }

        // Clear sessionStorage
        sessionStorage.removeItem("mfa_email");
        sessionStorage.removeItem("mfa_phone");
        sessionStorage.removeItem("mfa_user_id");

        // Redirect to dashboard
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Verify code error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <FadeIn>
        <div className="w-full max-w-md space-y-8 relative">
          {/* Back Button */}
          <div className="absolute -top-12 left-0">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          <SlideIn direction="down">
            <div className="flex flex-col items-center">
              <FadeIn delay={0.1}>
                <Logo size="2xl" className="mb-6" />
              </FadeIn>
              <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                Multi-Factor Authentication
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Choose how you&apos;d like to receive your verification code
              </p>
            </div>
          </SlideIn>

          {step === "select" ? (
            <div className="mt-8 space-y-4">
              {error && (
                <div className={`rounded-md p-4 ${
                  rateLimitSeconds !== null 
                    ? "bg-yellow-50 border border-yellow-200" 
                    : "bg-red-50 border border-red-200"
                }`}>
                  <p className={`text-sm ${
                    rateLimitSeconds !== null 
                      ? "text-yellow-800" 
                      : "text-red-800"
                  }`}>
                    {error}
                    {rateLimitSeconds !== null && rateLimitSeconds > 0 && (
                      <span className="block mt-1 font-semibold">
                        Retry in {rateLimitSeconds} second{rateLimitSeconds !== 1 ? "s" : ""}...
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {phone && (
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("phone")}
                    disabled={loading || rateLimitSeconds !== null}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone Number</p>
                        <p className="text-sm text-gray-500">{phone}</p>
                      </div>
                      {loading && mfaMethod === "phone" && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                      )}
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSelectMethod("email")}
                  disabled={loading || rateLimitSeconds !== null}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Address</p>
                      <p className="text-sm text-gray-500">{email}</p>
                    </div>
                    {loading && mfaMethod === "email" && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="text-center text-sm text-gray-600 mb-4">
                We sent a verification code to {mfaMethod === "phone" ? phone : email}
              </div>

              <div>
                <label htmlFor="verificationCode" className="sr-only">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("select");
                  setVerificationCode("");
                  setError(null);
                  setMfaMethod(null);
                }}
                className="text-sm text-primary-600 hover:text-primary-500 text-center w-full"
              >
                Change method
              </button>

              <SlideIn direction="up" delay={0.3}>
                <div>
                  <AnimatedButton
                    type="submit"
                    disabled={loading}
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </AnimatedButton>
                </div>
              </SlideIn>
            </form>
          )}
        </div>
      </FadeIn>
    </div>
  );
}

