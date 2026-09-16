import { NextResponse } from "next/server";
import { GOOGLE_STATE_COOKIE, googleAuthUrl, isGoogleConfigured } from "@/lib/google";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(`${origin}/register?error=google_unavailable`);
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(googleAuthUrl(origin, state));
  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
