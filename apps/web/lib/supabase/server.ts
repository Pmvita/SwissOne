import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

export async function createClient() {
  const cookieStore = await cookies();

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
  
  // Create a standard Supabase client (not SSR) with custom headers
  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    },
  });
  
  // Try to set the session - this enables RLS
  // If refreshToken is provided, use it; otherwise use accessToken as fallback
  try {
    await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || accessToken,
    });
  } catch (error) {
    // If setSession fails, the token in headers should still work for RLS
    // RLS reads from the Authorization header
    console.warn('[createAuthenticatedClient] setSession failed, using header auth:', error instanceof Error ? error.message : error);
  }
  
  return client;
}


