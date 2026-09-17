import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, dashboardPathForRole, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import {
  GOOGLE_RETURN_COOKIE,
  GOOGLE_RETURN_PATHS,
  GOOGLE_STATE_COOKIE,
  exchangeCodeForProfile,
  isGoogleConfigured,
} from "@/lib/google";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { origin } = url;
  const store = await cookies();
  const returnPath = GOOGLE_RETURN_PATHS[store.get(GOOGLE_RETURN_COOKIE)?.value ?? ""];

  function redirectWithCleanup(path: string) {
    const response = NextResponse.redirect(`${origin}${path}`);
    response.cookies.delete(GOOGLE_STATE_COOKIE);
    response.cookies.delete(GOOGLE_RETURN_COOKIE);
    return response;
  }
  const fail = (error: string) => redirectWithCleanup(`${returnPath ?? "/register"}?error=${error}`);

  if (!isGoogleConfigured()) return fail("google_unavailable");
  if (url.searchParams.get("error")) return fail("google_cancelled");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = store.get(GOOGLE_STATE_COOKIE)?.value;
  if (!code || !state || !expectedState || state !== expectedState) return fail("google_failed");

  let profile;
  try {
    profile = await exchangeCodeForProfile(code, origin);
  } catch {
    return fail("google_failed");
  }

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.sub }, { email: profile.email }] },
  });
  const isNewUser = !user;

  if (user) {
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.sub, avatarUrl: user.avatarUrl ?? profile.picture ?? null },
      });
    }
    await logActivity(user.id, "LOGIN", "Signed in with Google");
  } else {
    user = await prisma.user.create({
      data: {
        name: profile.name,
        email: profile.email,
        googleId: profile.sub,
        avatarUrl: profile.picture ?? null,
        role: "CUSTOMER",
      },
    });
    await logActivity(user.id, "REGISTERED", "Registered with Google");
  }

  const response = redirectWithCleanup(returnPath ?? (isNewUser ? "/" : dashboardPathForRole(user.role)));
  response.cookies.set(
    SESSION_COOKIE,
    await createSessionToken({ userId: user.id, role: user.role }),
    SESSION_COOKIE_OPTIONS,
  );
  return response;
}
