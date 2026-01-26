import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Debug endpoint to check if user profile exists
 * GET /api/debug/check-profile
 */
export async function GET() {
  try {
    const supabase = await createServerClient();

    // Try standard getUser first
    const {
      data: { user: fetchedUser },
      error: authError,
    } = await supabase.auth.getUser();

    let user = fetchedUser;

    // Fallback: If getUser failed, extract user from cookie directly
    if (!user) {
      const cookieStore = await cookies();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'amjjhdsbvpnjdgdlvoka';
      const authCookieName = `sb-${projectRef}-auth-token`;
      const authCookie = cookieStore.get(authCookieName);

      if (authCookie?.value && authCookie.value.startsWith('{')) {
        try {
          const sessionData = JSON.parse(authCookie.value);
          if (sessionData.user) {
            user = sessionData.user;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        user: null,
        profile: null,
      }, { status: 401 });
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Also check auth.users to see if user exists there (using service role if available)
    let authUserData = null;
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        const adminSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const result = await adminSupabase.auth.admin.getUserById(user.id);
        authUserData = result;
      }
    } catch {
      // Ignore - can't access admin API without service role
    }

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      userEmail: user.email,
      profileExists: !!profile,
      profile: profile,
      profileError: profileError ? {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
      } : null,
      authUserExists: !!authUserData?.data?.user,
      authUser: authUserData?.data?.user ? {
        id: authUserData.data.user.id,
        email: authUserData.data.user.email,
        created_at: authUserData.data.user.created_at,
      } : null,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

