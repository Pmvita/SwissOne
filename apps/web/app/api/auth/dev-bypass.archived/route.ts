import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * DEVELOPMENT ONLY: MFA Bypass Route
 * 
 * ⚠️ WARNING: This route ONLY works in development mode.
 * It allows bypassing MFA verification for testing purposes.
 * 
 * NEVER deploy this to production - it will be automatically disabled
 * in production builds.
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and userId are required" },
        { status: 400 }
      );
    }

    // Get service role key (admin access) - only available server-side
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "Supabase URL not configured" },
        { status: 500 }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user by ID to verify they exist
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      console.error("Error getting user:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate a magic link for the user using admin API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    });

    if (linkError || !linkData) {
      console.error("Error generating link:", linkError);
      return NextResponse.json(
        { error: "Failed to generate authentication link" },
        { status: 500 }
      );
    }

    // Extract the token from the action link
    const actionLink = linkData.properties.action_link;
    const url = new URL(actionLink);
    const token = url.searchParams.get("token");
    const type = url.searchParams.get("type") || "email";

    if (!token) {
      return NextResponse.json(
        { error: "Failed to extract token from link" },
        { status: 500 }
      );
    }

    // Exchange the token for a session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
      email: email,
      token: token,
      type: type as "email",
    });

    if (sessionError || !sessionData.session) {
      console.error("Error creating session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session", details: sessionError?.message },
        { status: 500 }
      );
    }

    // Use Supabase SSR client to properly set session cookies
    const cookieStore = await cookies();
    const supabaseClient = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore errors in server components
            }
          },
        },
      }
    );

    // Set the session using Supabase SSR's session management
    await supabaseClient.auth.setSession({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    });

    return NextResponse.json({
      success: true,
      session: sessionData.session,
      user: sessionData.user,
    });
  } catch (error) {
    console.error("Dev bypass error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

