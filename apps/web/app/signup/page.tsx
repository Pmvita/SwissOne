"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AnimatedButton, FadeIn, SlideIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"info" | "verify">("info");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName) {
      setError("Please enter your first and last name");
      return;
    }

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!username) {
      setError("Please enter a username");
      return;
    }

    if (!phone) {
      setError("Please enter your phone number");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      // Use email OTP for signup verification
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Send code error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      setStep("verify");
      setLoading(false);
    } catch (err) {
      console.error("Send code error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
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
      
      // Verify email OTP
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

      console.log("Signup successful, session established:", {
        userId: data.user?.id,
        phone: data.user?.phone,
        hasSession: !!session,
        sessionExpiresAt: session?.expires_at
      });

      // Create profile with first and last name, email, and username
      if (data.user) {
        try {
          const fullName = `${firstName} ${lastName}`.trim();
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              phone: formattedPhone,
              email: email,
              username: username,
              first_name: firstName,
              last_name: lastName,
              full_name: fullName,
            }, {
              onConflict: "id"
            });

          if (profileError) {
            console.warn("Profile upsert warning:", profileError);
            // Don't block signup if profile creation fails
          } else {
            console.log("Profile created successfully");
          }
        } catch (profileErr) {
          console.warn("Profile creation error (non-blocking):", profileErr);
        }
      }

      // Successfully signed up - clear states
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
                Create your SwissOne account
              </h2>
            </div>
          </SlideIn>
          <form className="mt-8 space-y-6" onSubmit={step === "info" ? handleSendCode : handleVerifyCode}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            {step === "info" ? (
              <>
                <div>
                  <label htmlFor="firstName" className="sr-only">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="sr-only">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    placeholder="Last Name"
                  />
                </div>
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
                  <label htmlFor="phone" className="sr-only">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    placeholder="Phone Number (e.g., +1234567890)"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-sm text-gray-600 mb-4">
                  We sent a verification code to {email}
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
                    setStep("info");
                    setVerificationCode("");
                    setError(null);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-500 text-center w-full"
                >
                  Change email address
                </button>
              </>
            )}
          </div>

          <SlideIn direction="up" delay={0.4}>
            <div>
              <AnimatedButton
                type="submit"
                disabled={loading}
                variant="primary"
                size="md"
                className="w-full"
              >
                {loading 
                  ? (step === "info" ? "Sending code..." : "Verifying...") 
                  : (step === "info" ? "Send Verification Code" : "Verify Code")}
              </AnimatedButton>
            </div>
          </SlideIn>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </FadeIn>
    </div>
  );
}

