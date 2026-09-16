import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSessionToken,
  dashboardPathForRole,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  verifySessionToken,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Re-syncs the session cookie with the user's current role, then sends them to the right dashboard.
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  const user = payload
    ? await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, role: true } })
    : null;

  if (!user) {
    const response = NextResponse.redirect(`${origin}/login`);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const response = NextResponse.redirect(`${origin}${dashboardPathForRole(user.role)}`);
  response.cookies.set(
    SESSION_COOKIE,
    await createSessionToken({ userId: user.id, role: user.role }),
    SESSION_COOKIE_OPTIONS,
  );
  return response;
}
