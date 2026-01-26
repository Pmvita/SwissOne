import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Fix admin profile - sets username and role
 * This uses service role key to bypass RLS
 * POST /api/setup/fix-profile
 */
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SUPABASE_URL not configured' },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { 
          error: 'SUPABASE_SERVICE_ROLE_KEY not configured',
          hint: 'Get it from Supabase Dashboard → Settings → API → service_role key'
        },
        { status: 500 }
      );
    }

    // Create admin client with service role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const USER_EMAIL = 'petermvita@hotmail.com';
    const USER_ID = 'b55ef620-c283-48f1-9127-90be294d160e';

    // First, get the user from auth.users to ensure they exist
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(USER_ID);

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Auth user not found', details: authError?.message },
        { status: 404 }
      );
    }

    // Create or update profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: USER_ID,
        email: USER_EMAIL,
        username: 'pmvita',
        role: 'admin',
        first_name: 'Peter',
        last_name: 'Mvita',
        full_name: 'Peter Mvita'
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to update profile', details: profileError.message },
        { status: 500 }
      );
    }

    // Verify it worked
    const { data: verifyProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, username, role, first_name, last_name')
      .eq('username', 'pmvita')
      .single();

    return NextResponse.json({
      success: true,
      message: 'Profile fixed successfully',
      profile: verifyProfile || profile
    });

  } catch (error) {
    console.error('[FIX PROFILE] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

