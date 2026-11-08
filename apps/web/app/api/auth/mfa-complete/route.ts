import { NextResponse } from "next/server";

/**
 * Marks MFA as completed for this browser session.
 * Sets an httpOnly cookie checked by middleware for dashboard routes.
 */
export async function POST() {
  const response = NextResponse.json({ success: true, redirect: "/dashboard" });
  response.cookies.set("swissone_mfa_ok", "1", {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return response;
}
