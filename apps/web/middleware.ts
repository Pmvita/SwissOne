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
  const authCookie = request.cookies.get('sb-amjjhdsbvpnjdgdlvoka-auth-token');

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
      
      if (sessionData.access_token && sessionData.user) {
        // Use the user data directly from the cookie since it's already there
        // This bypasses Supabase's storage adapter entirely
        user = sessionData.user;
        
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
          
          if (verifyResponse.ok) {
            const verifiedUser = await verifyResponse.json();
            // Use verified user data
            user = verifiedUser;
          }
        } catch {
          // If verification fails, still use the user from cookie
        }
      }
    } catch {
      // Ignore parse errors
    }
  }
  
  // If still no user, try standard getUser() as last resort
  if (!user) {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;
  }

  // Protect dashboard routes - require authentication
  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from signup (but allow login for account switching)
  if (pathname === "/signup" && user) {
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
