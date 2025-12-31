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

  // BYPASS AUTH: Allow dashboard access without authentication check
  // This bypasses the redirect back to login
  if (pathname.startsWith("/dashboard")) {
    // Allow access to dashboard without auth check
    return response;
  }

  // Refresh session to ensure cookies are up to date
  // This will update cookies if they're expired or need refreshing
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  // Get user - prefer session user, fallback to getUser
  let user = session?.user;
  if (!user) {
    const {
      data: { user: fetchedUser },
      error: userError,
    } = await supabase.auth.getUser();
    user = fetchedUser;
  }

  // Redirect authenticated users away from login/signup
  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
