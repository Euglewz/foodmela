import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, dashboardPathForRole, hashPassword, SESSION_COOKIE } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { saveAvatarImage } from "@/lib/upload";

export async function POST(request: Request) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const address = String(form.get("address") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const avatar = form.get("avatar");

  if (!name || !phone || !address || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  let avatarUrl: string | null = null;
  if (avatar instanceof File && avatar.size > 0) {
    try {
      avatarUrl = await saveAvatarImage(avatar);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Could not upload image." },
        { status: 400 },
      );
    }
  }

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      address,
      email,
      avatarUrl,
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
    },
  });

  await logActivity(user.id, "REGISTERED");

  const token = await createSessionToken({ userId: user.id, role: user.role });
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    redirectTo: dashboardPathForRole(user.role),
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
