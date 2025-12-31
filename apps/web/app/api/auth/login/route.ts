import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

    // Track cookies that get set
    const cookiesSet: string[] = [];

    // CRITICAL: Create the redirect response FIRST, before creating Supabase client
    // This way, setAll can write cookies directly to this response
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));

    // Create Supabase client with cookie handling
    // The setAll callback will set cookies directly on the redirectResponse
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            console.log("[LOGIN API] setAll called with", cookiesToSet.length, "cookies");
            // Set cookies on BOTH cookieStore and the redirect response
            cookiesToSet.forEach(({ name, value, options }) => {
              cookiesSet.push(name);
              // Preserve Supabase's cookie options, only set defaults if missing
              const cookieOptions = {
                ...options,
                path: options?.path ?? "/",
                sameSite: (options?.sameSite as "lax" | "strict" | "none") ?? "lax",
                secure: options?.secure ?? (process.env.NODE_ENV === "production"),
                // Don't override httpOnly - let Supabase control it
                httpOnly: options?.httpOnly,
                maxAge: options?.maxAge,
                expires: options?.expires,
              };
              // Store in cookieStore
              cookieStore.set(name, value, cookieOptions);
              // CRITICAL: Set on the redirect response so cookies are included in the redirect
              redirectResponse.cookies.set(name, value, cookieOptions);
            });
            console.log("[LOGIN API] Cookies set on redirectResponse:", cookiesSet);
          },
        },
      }
    );

    // Get email from username via RPC
    const { data: profileData, error: profileError } = await supabase.rpc(
      "get_user_credentials_by_username",
      { username_lookup: trimmedUsername }
    );

    if (profileError || !profileData || !profileData[0]?.email) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const userEmail = profileData[0].email;
    console.log("[LOGIN API] Attempting login for:", userEmail);

    // Sign in with password
    // This will trigger setAll callback, which writes cookies to redirectResponse
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });

    if (signInError || !authData.session) {
      console.log("[LOGIN API] Sign in failed:", signInError?.message);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    console.log("[LOGIN API] Login successful. Cookies set:", cookiesSet);
    console.log("[LOGIN API] RedirectResponse cookies:", redirectResponse.cookies.getAll().map(c => c.name));

    // Return the redirect response - it already has cookies set by setAll
    return redirectResponse;
  } catch (error) {
    console.error("[LOGIN API] Error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
