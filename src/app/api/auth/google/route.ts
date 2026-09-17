import { NextResponse } from "next/server";
import { SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import {
  GOOGLE_RETURN_COOKIE,
  GOOGLE_RETURN_PATHS,
  GOOGLE_STATE_COOKIE,
  googleAuthUrl,
  isGoogleConfigured,
} from "@/lib/google";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { origin } = url;
  const returnTo = url.searchParams.get("from") ?? "";
  const returnPath = GOOGLE_RETURN_PATHS[returnTo];

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(`${origin}${returnPath ?? "/register"}?error=google_unavailable`);
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(googleAuthUrl(origin, state));
  const shortLived = { ...SESSION_COOKIE_OPTIONS, maxAge: 60 * 10 };
  response.cookies.set(GOOGLE_STATE_COOKIE, state, shortLived);
  if (returnPath) {
    response.cookies.set(GOOGLE_RETURN_COOKIE, returnTo, shortLived);
  } else {
    response.cookies.delete(GOOGLE_RETURN_COOKIE);
  }
  return response;
}
