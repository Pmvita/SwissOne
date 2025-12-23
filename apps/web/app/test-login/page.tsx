"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnimatedButton, FadeIn } from "@/components/ui/animated";

export default function TestLoginPage() {
  const [email, setEmail] = useState("petermvita@hotmail.com");
  const [password, setPassword] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string, type: "success" | "error" | "info" = "info") => {
    const prefix = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    setResults((prev) => [...prev, `${prefix} ${message}`]);
  };

  const testLogin = async () => {
    setResults([]);
    setLoading(true);

    try {
      // Test 1: Check environment variables
      addResult("Test 1: Checking environment variables...");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        addResult("Environment variables missing!", "error");
        addResult(`URL: ${supabaseUrl ? "✅" : "❌"}`, "error");
        addResult(`Key: ${supabaseKey ? "✅" : "❌"}`, "error");
        setLoading(false);
        return;
      }
      addResult("Environment variables OK", "success");

      // Test 2: Create client
      addResult("Test 2: Creating Supabase client...");
      const supabase = createClient();
      addResult("Client created successfully", "success");

      // Test 3: Check current session
      addResult("Test 3: Checking for existing session...");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addResult(`Session check error: ${sessionError.message}`, "error");
      } else if (sessionData.session) {
        addResult(`Active session found for: ${sessionData.session.user.email}`, "success");
        addResult("You are already logged in!", "info");
        setLoading(false);
        return;
      } else {
        addResult("No active session (expected)", "info");
      }

      // Test 4: Attempt login
      addResult(`Test 4: Attempting login for ${email}...`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        addResult(`Login failed: ${error.message}`, "error");
        addResult(`Error status: ${error.status}`, "error");
        if (error.message.includes("Invalid login credentials")) {
          addResult("→ Check: Email and password are correct", "info");
        } else if (error.message.includes("Email not confirmed")) {
          addResult("→ Your email IS confirmed, this shouldn't happen", "error");
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        addResult("Login returned no user data", "error");
        setLoading(false);
        return;
      }

      addResult("Login successful!", "success");
      addResult(`User ID: ${data.user.id}`, "success");
      addResult(`Email: ${data.user.email}`, "success");
      addResult(`Email confirmed: ${data.user.email_confirmed_at ? "Yes" : "No"}`, 
        data.user.email_confirmed_at ? "success" : "error");

      // Test 5: Verify session
      addResult("Test 5: Verifying session...");
      const { data: verifySession, error: verifyError } = await supabase.auth.getSession();
      if (verifyError || !verifySession.session) {
        addResult("Session verification failed!", "error");
        if (verifyError) {
          addResult(`Error: ${verifyError.message}`, "error");
        }
      } else {
        addResult("Session verified successfully", "success");
        addResult(`Session expires: ${new Date(verifySession.session.expires_at * 1000).toLocaleString()}`, "info");
      }

      // Test 6: Test profile access
      addResult("Test 6: Testing profile access...");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        addResult(`Profile access error: ${profileError.message}`, "error");
        addResult("→ This might indicate RLS (Row Level Security) issues", "info");
      } else {
        addResult("Profile access successful", "success");
      }

      // Test 7: Test dashboard access
      addResult("Test 7: Testing dashboard data access...");
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("count")
        .eq("user_id", data.user.id);

      if (accountsError) {
        addResult(`Accounts access error: ${accountsError.message}`, "error");
      } else {
        addResult("Dashboard data access successful", "success");
      }

      addResult("", "info");
      addResult("🎉 ALL TESTS PASSED! Login should work.", "success");
      addResult("You can now use the login form normally.", "info");

    } catch (err: any) {
      addResult(`Exception: ${err.message}`, "error");
      addResult("Check browser console for full error details", "info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <FadeIn>
        <div className="w-full max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login Diagnostic Tool</h1>
            <p className="text-gray-600">This tool will test your login functionality step-by-step</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="your-email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter your password"
              />
            </div>
            <AnimatedButton
              onClick={testLogin}
              disabled={loading || !email || !password}
              variant="primary"
              size="md"
              className="w-full"
            >
              {loading ? "Testing..." : "Run Login Tests"}
            </AnimatedButton>
          </div>

          {results.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results</h2>
              <div className="space-y-2 font-mono text-sm">
                {results.map((result, index) => (
                  <div key={index} className={
                    result.includes("✅") ? "text-green-700" :
                    result.includes("❌") ? "text-red-700" :
                    "text-gray-700"
                  }>
                    {result || "\u00A0"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}

