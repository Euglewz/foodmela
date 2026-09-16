import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Role } from "@prisma/client";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Cached per request, so a layout and page checking the session share one database lookup.
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  return prisma.user.findUnique({ where: { id: payload.userId } });
});

// The cookie's role can be stale after a promotion or demotion, so the database is the source of truth.
export async function getSession(): Promise<SessionPayload | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { userId: user.id, role: user.role };
}

export async function requireRole(role: Role): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  // Middleware still trusts the stale cookie, so fix the cookie before redirecting to avoid a loop.
  if (session.role !== role) redirect("/api/auth/refresh");
  return session;
}
