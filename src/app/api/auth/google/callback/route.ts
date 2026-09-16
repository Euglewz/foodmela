import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, dashboardPathForRole, SESSION_COOKIE } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { GOOGLE_STATE_COOKIE, exchangeCodeForProfile, isGoogleConfigured } from "@/lib/google";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { origin } = url;

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(`${origin}/register?error=google_unavailable`);
  }

  if (url.searchParams.get("error")) {
    return NextResponse.redirect(`${origin}/register?error=google_cancelled`);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${GOOGLE_STATE_COOKIE}=`))
    ?.split("=")[1];

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/register?error=google_failed`);
  }

  let profile;
  try {
    profile = await exchangeCodeForProfile(code, origin);
  } catch {
    return NextResponse.redirect(`${origin}/register?error=google_failed`);
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

  const token = await createSessionToken({ userId: user.id, role: user.role });
  const response = NextResponse.redirect(
    isNewUser ? `${origin}/` : `${origin}${dashboardPathForRole(user.role)}`,
  );
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.delete(GOOGLE_STATE_COOKIE);
  return response;
}
