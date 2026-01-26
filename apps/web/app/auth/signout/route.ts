// apps/web/app/auth/signout/route.ts
// Sign out route - removes session from database

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sessionTracker } from "@/lib/services/session-tracker";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get user before signing out
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    // Remove session from database
    if (user) {
      try {
        await sessionTracker.removeSession(user.id);
      } catch (error) {
        // Don't fail signout if session removal fails
        console.error('Failed to remove session:', error);
      }
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    return NextResponse.redirect(new URL("/login", request.url));
  } catch (error) {
    console.error('Signout error:', error);
    // Still redirect to login even if there's an error
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

