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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
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
      
      // Format phone number (ensure it starts with +)
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      
      // Use signUp with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12), // Temporary password
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username,
            phone: formattedPhone,
            full_name: `${firstName} ${lastName}`.trim(),
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        setEmailSent(true);
        setLoading(false);
        return;
      }

      // If already confirmed (shouldn't happen but handle it)
      if (data.user && data.session) {
        // Create profile immediately if session exists
        await createProfile(data.user.id, data.user.email || email);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const createProfile = async (userId: string, userEmail: string) => {
    try {
      const supabase = createClient();
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      const fullName = `${firstName} ${lastName}`.trim();
      
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: userEmail,
          username: username,
          first_name: firstName,
          last_name: lastName,
          phone: formattedPhone,
          full_name: fullName,
        }, {
          onConflict: "id"
        });

      if (profileError) {
        console.warn("Profile upsert warning:", profileError);
      } else {
        console.log("Profile created successfully");
      }
    } catch (profileErr) {
      console.warn("Profile creation error:", profileErr);
    }
  };

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
                <Logo size="md" className="mb-6" />
              </FadeIn>
              <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                Create your SwissOne account
              </h2>
            </div>
          </SlideIn>
          {emailSent ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    Check your email
                  </h3>
                  <p className="text-sm text-green-700 mb-4">
                    We sent a confirmation link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-green-600">
                    Click the link in the email to confirm your account and complete signup.
                  </p>
                </div>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false);
                    setError(null);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <div className="space-y-4 rounded-md shadow-sm">
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
                    {loading ? "Creating account..." : "Sign up"}
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
          )}
        </div>
      </FadeIn>
    </div>
  );
}

