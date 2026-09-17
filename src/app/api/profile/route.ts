import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/activity";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const address = typeof body?.address === "string" ? body.address.trim() : "";

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { name, phone: phone || null, address: address || null },
    select: { id: true, name: true, email: true, phone: true, address: true, avatarUrl: true, role: true },
  });

  await logActivity(user.id, "PROFILE_UPDATED");

  return NextResponse.json({ user });
}
