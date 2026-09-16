import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// The cookie's role can be stale after a promotion or demotion, so the database is the source of truth.
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { role: true } });
  if (!user) return null;
  return { userId: payload.userId, role: user.role };
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  return prisma.user.findUnique({ where: { id: payload.userId } });
}

export async function requireRole(role: Role): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  // Middleware still trusts the stale cookie, so fix the cookie before redirecting to avoid a loop.
  if (session.role !== role) redirect("/api/auth/refresh");
  return session;
}
