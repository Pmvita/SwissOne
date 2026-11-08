// apps/web/app/api/users/active/route.ts
// API route to get active user sessions (admin/staff only)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sessionTracker } from '@/lib/services/session-tracker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or staff
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.role !== 'admin' && profile.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get active sessions
    const activeSessions = await sessionTracker.getActiveSessions();

    return NextResponse.json({
      sessions: activeSessions,
      count: activeSessions.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get active users';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[Active Users API] Error:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      {
        error: 'An error occurred while fetching active users. Please try again later.',
      },
      { status: 500 }
    );
  }
}

