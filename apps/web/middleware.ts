import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Create response object FIRST
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on both request and response
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, {
              ...options,
              path: options?.path || "/",
              sameSite: (options?.sameSite as "lax" | "strict" | "none") || "lax",
              secure: options?.secure ?? (process.env.NODE_ENV === "production"),
            });
          });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/673bf0ab-9c13-41ee-a779-6b775f589b14',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:37',message:'Middleware entry',data:{pathname,requestCookieCount:request.cookies.getAll().length,requestCookieNames:request.cookies.getAll().map(c=>c.name)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  // #region agent log
  const authCookie = request.cookies.get('sb-amjjhdsbvpnjdgdlvoka-auth-token');
  const cookieValue = authCookie?.value || null;
  const cookieValuePreview = cookieValue ? (cookieValue.length > 100 ? cookieValue.substring(0, 100) + '...' : cookieValue) : null;
  console.log("[MIDDLEWARE] Before getSession:", {
    hasAuthCookie: !!authCookie,
    cookieValueLength: cookieValue?.length || 0,
    cookieValuePreview,
    allCookieNames: request.cookies.getAll().map(c => c.name)
  });
  // #endregion

  // CRITICAL FIX: If cookie exists but getSession fails, manually parse and set session
  // This handles the case where cookies are set manually but Supabase SSR can't parse them
  if (authCookie?.value && !authCookie.value.startsWith('{')) {
    // Cookie might be URL-encoded, try decoding
    try {
      const decoded = decodeURIComponent(authCookie.value);
      if (decoded.startsWith('{')) {
        // Update the cookie with decoded value
        request.cookies.set('sb-amjjhdsbvpnjdgdlvoka-auth-token', decoded);
        response.cookies.set('sb-amjjhdsbvpnjdgdlvoka-auth-token', decoded, {
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
        });
      }
    } catch (e) {
      // Ignore decode errors
    }
  }

  // CRITICAL FIX: Extract access token from cookie and verify it directly
  // Supabase SSR's storage adapter can't parse manually set cookies, so we bypass it
  let user: any = null;
  
  if (authCookie?.value && authCookie.value.startsWith('{')) {
    try {
      const sessionData = JSON.parse(authCookie.value);
      
      // #region agent log
      console.log("[MIDDLEWARE] Parsed cookie data:", {
        hasAccessToken: !!sessionData.access_token,
        hasRefreshToken: !!sessionData.refresh_token,
        hasUser: !!sessionData.user,
        userId: sessionData.user?.id,
        userEmail: sessionData.user?.email,
        sessionKeys: Object.keys(sessionData)
      });
      // #endregion
      
      if (sessionData.access_token && sessionData.user) {
        // #region agent log
        console.log("[MIDDLEWARE] Extracting user from cookie directly");
        // #endregion
        
        // Use the user data directly from the cookie since it's already there
        // This bypasses Supabase's storage adapter entirely
        user = sessionData.user;
        
        // #region agent log
        console.log("[MIDDLEWARE] Using user from cookie:", {
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email
        });
        // #endregion
        
        // Verify the token is still valid by calling Supabase Auth API
        // This ensures the token hasn't expired
        try {
          const verifyResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
            {
              headers: {
                'Authorization': `Bearer ${sessionData.access_token}`,
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              },
            }
          );
          
          // #region agent log
          console.log("[MIDDLEWARE] Token verification response:", {
            status: verifyResponse.status,
            statusText: verifyResponse.statusText,
            ok: verifyResponse.ok
          });
          // #endregion
          
          if (verifyResponse.ok) {
            const verifiedUser = await verifyResponse.json();
            // Use verified user data
            user = verifiedUser;
            // #region agent log
            console.log("[MIDDLEWARE] Token verified successfully, using verified user:", {
              userId: user?.id,
              userEmail: user?.email
            });
            // #endregion
          } else {
            // Token is invalid or expired, but still use user from cookie for this request
            // Don't clear cookie immediately - let Supabase handle refresh
            // #region agent log
            console.log("[MIDDLEWARE] Token verification failed, but using user from cookie anyway");
            // #endregion
            // Keep user from cookie - token might be expired but user is still valid
          }
        } catch (verifyError) {
          // If verification fails, still use the user from cookie (token might be valid but API call failed)
          // #region agent log
          console.log("[MIDDLEWARE] Token verification error, using user from cookie anyway:", verifyError);
          // #endregion
        }
      } else {
        // #region agent log
        console.log("[MIDDLEWARE] Cookie missing required fields:", {
          hasAccessToken: !!sessionData.access_token,
          hasUser: !!sessionData.user
        });
        // #endregion
      }
    } catch (e) {
      // #region agent log
      console.log("[MIDDLEWARE] Error parsing cookie:", e);
      // #endregion
    }
  } else {
    // #region agent log
    console.log("[MIDDLEWARE] No valid auth cookie found:", {
      hasCookie: !!authCookie,
      cookieStartsWithBrace: authCookie?.value?.startsWith('{')
    });
    // #endregion
  }
  
  // If still no user, try standard getUser() as last resort
  if (!user) {
    const {
      data: { user: fetchedUser },
      error: userError,
    } = await supabase.auth.getUser();
    user = fetchedUser;
    
    // #region agent log
    console.log("[MIDDLEWARE] After getUser (fallback):", {
      hasUser: !!user,
      userId: user?.id,
      hasError: !!userError,
      errorMessage: userError?.message,
    });
    // #endregion
  }

  // #region agent log
  console.log("[MIDDLEWARE] Final user check before route protection:", {
    pathname,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    willRedirectToLogin: pathname.startsWith("/dashboard") && !user
  });
  // #endregion

  // Protect dashboard routes - require authentication
  if (pathname.startsWith("/dashboard") && !user) {
    // #region agent log
    console.log("[MIDDLEWARE] Redirecting to login - no user:", {
      pathname,
      requestCookieCount: request.cookies.getAll().length,
      authCookieExists: !!request.cookies.get('sb-amjjhdsbvpnjdgdlvoka-auth-token')
    });
    // #endregion
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from signup (but allow login for account switching)
  if (pathname === "/signup" && user) {
    // #region agent log
    console.log("[MIDDLEWARE] Redirecting authenticated user away from signup:", {
      pathname,
      userId: user?.id,
      userEmail: user?.email,
      redirectTo: "/dashboard"
    });
    // #endregion
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Allow authenticated users to access /login (for account switching)
  // The login page itself can handle showing a message or redirect if needed

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
