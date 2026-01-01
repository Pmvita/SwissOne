import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

export async function createClient() {
  const cookieStore = await cookies();
  
  // #region agent log
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find(c => c.name.includes('auth-token'));
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/server.ts:5',message:'createClient called',data:{cookieCount:allCookies.length,hasAuthCookie:!!authCookie,authCookieName:authCookie?.name,authCookieValueLength:authCookie?.value?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,E'})}).catch(()=>{});
  // #endregion

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                path: "/",
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
              });
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create an authenticated Supabase client using access token.
 * This creates a client with the session set, allowing RLS to work correctly.
 */
export async function createAuthenticatedClient(accessToken: string, refreshToken?: string): Promise<SupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Create a standard Supabase client (not SSR) and set the session
  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  
  // Set the session using the access token - this is what RLS needs
  await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken || accessToken, // Use access token as fallback if no refresh token
  });
  
  return client;
}


