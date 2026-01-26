import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // If this is a signup flow, create/update the profile with user metadata
      if (type === "signup" && data.user.user_metadata) {
        try {
          const metadata = data.user.user_metadata;
          const fullName = metadata.first_name && metadata.last_name
            ? `${metadata.first_name} ${metadata.last_name}`.trim()
            : metadata.full_name || null;

          await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: data.user.email || metadata.email,
              username: metadata.username,
              first_name: metadata.first_name,
              last_name: metadata.last_name,
              phone: metadata.phone,
              full_name: fullName,
            }, {
              onConflict: "id"
            });
        } catch (profileError) {
          console.error("Profile creation error in callback:", profileError);
          // Don't block the redirect if profile creation fails
        }
      }
      
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/login?error=Could not authenticate", requestUrl.origin));
}

