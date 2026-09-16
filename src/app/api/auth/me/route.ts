import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS, verifySessionToken } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatarUrl: user.avatarUrl,
      role: user.role,
    },
  });

  // Re-issue the cookie when an admin/manager changed this user's role, so route guards pick it up.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  if (payload && payload.role !== user.role) {
    response.cookies.set(
      SESSION_COOKIE,
      await createSessionToken({ userId: user.id, role: user.role }),
      SESSION_COOKIE_OPTIONS,
    );
  }

  return response;
}
