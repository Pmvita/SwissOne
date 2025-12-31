import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeFile, appendFile } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0 || password.length === 0) {
      return NextResponse.json(
        { error: "Username and password cannot be empty" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // Create response object for setting cookies
    const response = NextResponse.json({ success: true, redirect: "/dashboard" });

    // Store reference to setAll callback so we can call it manually
    let setAllCallback: ((cookiesToSet: Array<{ name: string; value: string; options?: any }>) => void) | null = null;

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // Store reference for manual calling
            setAllCallback = (cookies) => {
              // This will be called manually below
            };
            // #region agent log
            const logEntry = JSON.stringify({location:'login/route.ts:48',message:'setAll called',data:{cookieCount:cookiesToSet.length,cookieNames:cookiesToSet.map(c=>c.name)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})+'\n';
            appendFile('/Users/petermvita/Desktop/Coding Projects/.cursor/debug.log', logEntry).catch(()=>{});
            // #endregion
            console.log("[LOGIN API] setAll called with", cookiesToSet.length, "cookies");
            // Set cookies on both cookieStore and the response
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions = {
                ...options,
                path: options?.path ?? "/",
                sameSite: (options?.sameSite as "lax" | "strict" | "none") ?? "lax",
                secure: options?.secure ?? (process.env.NODE_ENV === "production"),
                httpOnly: options?.httpOnly ?? true,
                maxAge: options?.maxAge,
                expires: options?.expires,
              };
              // #region agent log
              const logEntry2 = JSON.stringify({location:'login/route.ts:62',message:'Setting cookie',data:{name,hasValue:!!value,options:cookieOptions},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})+'\n';
              appendFile('/Users/petermvita/Desktop/Coding Projects/.cursor/debug.log', logEntry2).catch(()=>{});
              // #endregion
              // Store in cookieStore
              cookieStore.set(name, value, cookieOptions);
              // Set on the response
              response.cookies.set(name, value, cookieOptions);
            });
            // #region agent log
            const logEntry3 = JSON.stringify({location:'login/route.ts:76',message:'After setAll',data:{responseCookieCount:response.cookies.getAll().length,responseCookieNames:response.cookies.getAll().map(c=>c.name)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})+'\n';
            appendFile('/Users/petermvita/Desktop/Coding Projects/.cursor/debug.log', logEntry3).catch(()=>{});
            // #endregion
            console.log("[LOGIN API] Cookies set:", cookiesToSet.map(c => c.name));
          },
        },
      }
    );
    
    // Store reference to setAll for manual calling
    // Note: We can't directly access it, but we'll manually trigger it below if needed

    // Get email from username via RPC
    const { data: profileData, error: profileError } = await supabase.rpc(
      "get_user_credentials_by_username",
      { username_lookup: trimmedUsername }
    );

    console.log("[LOGIN API] RPC result:", { profileData, profileError, username: trimmedUsername });

    if (profileError) {
      console.error("[LOGIN API] RPC error:", profileError);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (!profileData || !Array.isArray(profileData) || profileData.length === 0 || !profileData[0]?.email) {
      console.error("[LOGIN API] No profile data found:", profileData);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const userEmail = profileData[0].email;
    console.log("[LOGIN API] Attempting login for:", userEmail);

    // Sign in with password
    // This will trigger setAll callback, which writes cookies to redirectResponse
    // #region agent log
    const logEntry4 = JSON.stringify({location:'login/route.ts:99',message:'Before signInWithPassword',data:{email:userEmail,responseCookiesBefore:response.cookies.getAll().length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n';
    appendFile('/Users/petermvita/Desktop/Coding Projects/.cursor/debug.log', logEntry4).catch(()=>{});
    // #endregion
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });
    // #region agent log
    const logEntry5 = JSON.stringify({location:'login/route.ts:107',message:'After signInWithPassword',data:{hasSession:!!authData?.session,hasError:!!signInError,responseCookiesAfter:response.cookies.getAll().length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n';
    appendFile('/Users/petermvita/Desktop/Coding Projects/.cursor/debug.log', logEntry5).catch(()=>{});
    // #endregion

    if (signInError) {
      console.error("[LOGIN API] Sign in error:", {
        message: signInError.message,
        status: signInError.status,
        name: signInError.name
      });
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (!authData.session) {
      console.error("[LOGIN API] No session returned:", authData);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // #region agent log
    const logEntry6 = JSON.stringify({location:'login/route.ts:149',message:'Session exists, calling setSession to trigger setAll',data:{sessionUserId:authData.user?.id,responseCookieCount:response.cookies.getAll().length,responseCookieNames:response.cookies.getAll().map(c=>c.name)},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})+'\n';
    appendFile('/Users/petermvita/Desktop/Coding Projects/.cursor/debug.log', logEntry6).catch(()=>{});
    // #endregion

    // CRITICAL FIX: Manually trigger setAll callback with session data
    // Supabase SSR's setSession doesn't trigger setAll in API routes, so we manually call it
    // Extract project ref from Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] || 'default';
    
    // Calculate session expiry
    const expiresAt = authData.session.expires_at 
      ? new Date(authData.session.expires_at * 1000)
      : new Date(Date.now() + 3600 * 1000);
    const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    
    // Build session data in the exact format Supabase SSR expects
    const sessionData = {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at,
      expires_in: authData.session.expires_in,
      token_type: authData.session.token_type,
      user: authData.user,
    };
    
    const sessionJson = JSON.stringify(sessionData);
    
    // #region agent log
    const logEntryBeforeSetAll = JSON.stringify({location:'login/route.ts:160',message:'Manually calling setAll callback',data:{hasAccessToken:!!authData.session.access_token,hasRefreshToken:!!authData.session.refresh_token,sessionJsonLength:sessionJson.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})+'\n';
    appendFile('/Users/petermvita/Desktop/Coding Projects/.cursor/debug.log', logEntryBeforeSetAll).catch(()=>{});
    // #endregion
    
    // Manually trigger the setAll callback that we defined in createServerClient
    // This is the ONLY way to ensure cookies are set in the format Supabase SSR expects
    const cookiesToSet: Array<{ name: string; value: string; options?: any }> = [{
      name: `sb-${projectRef}-auth-token`,
      value: sessionJson,
      options: {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: maxAge,
        expires: expiresAt,
      }
    }];
    
    // Actually call the setAll callback we defined - this ensures cookies are set correctly
    // We need to manually invoke the setAll logic since we can't access the callback directly
    // So we replicate the exact same logic here
    cookiesToSet.forEach(({ name, value, options }) => {
      const cookieOptions = {
        ...options,
        path: options?.path ?? "/",
        sameSite: (options?.sameSite as "lax" | "strict" | "none") ?? "lax",
        secure: options?.secure ?? (process.env.NODE_ENV === "production"),
        httpOnly: options?.httpOnly ?? true,
        maxAge: options?.maxAge,
        expires: options?.expires,
      };
      // This is the exact same logic as in setAll callback
      cookieStore.set(name, value, cookieOptions);
      response.cookies.set(name, value, cookieOptions);
    });
    
    // Log that we're calling setAll logic manually
    console.log("[LOGIN API] Manually calling setAll logic with", cookiesToSet.length, "cookies");
    
    // #region agent log
    const logEntryAfterSetAll = JSON.stringify({location:'login/route.ts:195',message:'After manual setAll',data:{responseCookieCount:response.cookies.getAll().length,responseCookieNames:response.cookies.getAll().map(c=>c.name)},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'A'})+'\n';
    appendFile('/Users/petermvita/Desktop/Coding Projects/.cursor/debug.log', logEntryAfterSetAll).catch(()=>{});
    // #endregion

    // If setAll still wasn't called, manually trigger it with session data
    // Supabase SSR doesn't trigger setAll in API routes, so we must manually call it
    if (response.cookies.getAll().length === 0 && authData.session) {
      // #region agent log
      const logEntry7 = JSON.stringify({location:'login/route.ts:152',message:'Manually triggering setAll callback',data:{hasAccessToken:!!authData.session.access_token,hasRefreshToken:!!authData.session.refresh_token},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})+'\n';
      appendFile('/Users/petermvita/Desktop/Coding Projects/.cursor/debug.log', logEntry7).catch(()=>{});
      // #endregion
      
      // Extract project ref from Supabase URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] || 'default';
      
      // Calculate session expiry
      const expiresAt = authData.session.expires_at 
        ? new Date(authData.session.expires_at * 1000)
        : new Date(Date.now() + 3600 * 1000);
      const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      
      // Manually call setAll with the session data in the format Supabase expects
      // Supabase SSR stores session as: { access_token, refresh_token, expires_at, expires_in, token_type, user }
      const sessionData = {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
        expires_in: authData.session.expires_in,
        token_type: authData.session.token_type,
        user: authData.user,
      };
      
      const sessionJson = JSON.stringify(sessionData);
      const chunkSize = 4000;
      
      // Build cookies array in the format Supabase expects
      const cookiesToSet: Array<{ name: string; value: string; options?: any }> = [];
      
      if (sessionJson.length > chunkSize) {
        // Split into chunks
        for (let i = 0; i < sessionJson.length; i += chunkSize) {
          const chunk = sessionJson.slice(i, i + chunkSize);
          const chunkIndex = Math.floor(i / chunkSize);
          const cookieName = chunkIndex === 0 
            ? `sb-${projectRef}-auth-token`
            : `sb-${projectRef}-auth-token.${chunkIndex}`;
          
          cookiesToSet.push({
            name: cookieName,
            value: chunk,
            options: {
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              httpOnly: true,
              maxAge: maxAge,
              expires: expiresAt,
            }
          });
        }
      } else {
        // Single cookie
        cookiesToSet.push({
          name: `sb-${projectRef}-auth-token`,
          value: sessionJson,
          options: {
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: maxAge,
            expires: expiresAt,
          }
        });
      }
      
      // Manually call setAll by setting cookies directly (same logic as setAll callback)
      // This mimics what Supabase's setAll would do
      cookiesToSet.forEach(({ name, value, options }) => {
        const cookieOptions = {
          ...options,
          path: options?.path ?? "/",
          sameSite: (options?.sameSite as "lax" | "strict" | "none") ?? "lax",
          secure: options?.secure ?? (process.env.NODE_ENV === "production"),
          httpOnly: options?.httpOnly ?? true,
          maxAge: options?.maxAge,
          expires: options?.expires,
        };
        // Store in cookieStore
        cookieStore.set(name, value, cookieOptions);
        // Set on the response
        response.cookies.set(name, value, cookieOptions);
      });
      
      // #region agent log
      const setCookie = response.cookies.get(`sb-${projectRef}-auth-token`);
      const cookieValue = setCookie?.value || null;
      const cookiePreview = cookieValue ? (cookieValue.length > 200 ? cookieValue.substring(0, 200) + '...' : cookieValue) : null;
      const logEntry8 = JSON.stringify({location:'login/route.ts:220',message:'After manual cookie setting',data:{responseCookieCount:response.cookies.getAll().length,responseCookieNames:response.cookies.getAll().map(c=>c.name),cookieValueLength:cookieValue?.length || 0,cookieValuePreview:cookiePreview},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})+'\n';
      appendFile('/Users/petermvita/Desktop/Coding Projects/.cursor/debug.log', logEntry8).catch(()=>{});
      // #endregion
    }

    console.log("[LOGIN API] Login successful");
    console.log("[LOGIN API] Session user:", authData.user?.id);
    console.log("[LOGIN API] Response cookies:", response.cookies.getAll().map(c => c.name));

    // Return JSON response with redirect URL - cookies are already set via setAll
    return response;
  } catch (error) {
    console.error("[LOGIN API] Error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
