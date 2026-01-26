import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * One-time setup endpoint to create dev user
 * Call: POST /api/setup/create-user
 * 
 * This endpoint can be deleted after user is created
 */
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, anonKey);

    const DEV_EMAIL = "petermvita@hotmail.com";
    const DEV_USERNAME = "pmvita";
    const DEV_PASSWORD = "admin123";

    // Step 1: Sign up user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      options: {
        data: {
          username: DEV_USERNAME,
          first_name: "Peter",
          last_name: "Mvita",
        },
      },
    });

    if (signUpError) {
      if (
        signUpError.message.includes("already") ||
        signUpError.message.includes("registered")
      ) {
        // User exists, sign in and update profile
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: DEV_EMAIL,
            password: DEV_PASSWORD,
          });

        if (signInError) {
          return NextResponse.json(
            {
              error: "User exists but sign in failed",
              message: signInError.message,
              sql: `UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`,
            },
            { status: 400 }
          );
        }

        // Update profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            username: DEV_USERNAME,
            role: "admin",
            first_name: "Peter",
            last_name: "Mvita",
            full_name: "Peter Mvita",
          })
          .eq("email", DEV_EMAIL);

        if (profileError) {
          return NextResponse.json(
            {
              error: "Profile update failed",
              message: profileError.message,
              sql: `UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`,
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "User already exists, profile updated",
          email: DEV_EMAIL,
          username: DEV_USERNAME,
          role: "admin",
        });
      }

      return NextResponse.json(
        {
          error: "Signup failed",
          message: signUpError.message,
        },
        { status: 400 }
      );
    }

    if (!signUpData.user) {
      return NextResponse.json(
        { error: "User creation failed - no user returned" },
        { status: 500 }
      );
    }

    // Wait for profile trigger
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Sign in to get session for profile update
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
      });

    if (signInError || !signInData.session) {
      return NextResponse.json(
        {
          success: true,
          warning: "User created but could not sign in automatically",
          message:
            "User created successfully. Please run SQL to update profile.",
          sql: `UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin', first_name = 'Peter', last_name = 'Mvita', full_name = 'Peter Mvita' WHERE email = '${DEV_EMAIL}';`,
          email: DEV_EMAIL,
        },
        { status: 200 }
      );
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        username: DEV_USERNAME,
        role: "admin",
        first_name: "Peter",
        last_name: "Mvita",
        full_name: "Peter Mvita",
      })
      .eq("id", signUpData.user.id);

    if (profileError) {
      return NextResponse.json(
        {
          success: true,
          warning: "User created but profile update failed",
          message: profileError.message,
          sql: `UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`,
          email: DEV_EMAIL,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User created and profile updated successfully",
      email: DEV_EMAIL,
      username: DEV_USERNAME,
      password: DEV_PASSWORD,
      role: "admin",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

