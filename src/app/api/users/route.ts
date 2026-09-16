import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { Role } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const roleFilter = searchParams.get("role") ?? undefined;

  const allowedRoles: Role[] = session.role === "ADMIN" ? ["MANAGER", "RIDER", "CUSTOMER"] : ["RIDER", "CUSTOMER"];

  const users = await prisma.user.findMany({
    where: {
      role: {
        in:
          roleFilter && allowedRoles.includes(roleFilter as Role)
            ? [roleFilter as Role]
            : allowedRoles,
      },
      ...(q
        ? {
            OR: [{ name: { contains: q } }, { email: { contains: q } }],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      managerRestaurants: { select: { restaurant: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
