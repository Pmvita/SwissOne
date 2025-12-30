"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Handle email confirmation callback
    // Use window.location.search to avoid Next.js 15 searchParams issues
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      
      if (code) {
        const handleCallback = async () => {
          const supabase = createClient();
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (!error) {
            router.push("/dashboard");
            router.refresh();
          } else {
            router.push("/login?error=Could not confirm email");
          }
        };
        handleCallback();
        return;
      }
    }

    // Redirect to landing page if no auth callback
    router.replace("/landing");
  }, [router]);

  // Show loading screen while handling redirect
  return <LoadingScreen onComplete={() => {}} minDuration={0} />;
}
