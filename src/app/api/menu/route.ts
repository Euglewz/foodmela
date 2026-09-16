import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { accessibleRestaurantIds, canManageRestaurant } from "@/lib/authz";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ids = await accessibleRestaurantIds(session);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const restaurantId = searchParams.get("restaurantId") ?? undefined;

  const items = await prisma.menuItem.findMany({
    where: {
      restaurantId: ids === "all" ? restaurantId : { in: restaurantId ? [restaurantId].filter((r) => ids.includes(r)) : ids },
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { restaurant: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ restaurantId: "asc" }, { category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const restaurantId = typeof body?.restaurantId === "string" ? body.restaurantId : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!restaurantId || !name) {
    return NextResponse.json({ error: "restaurantId and name are required." }, { status: 400 });
  }
  if (!(await canManageRestaurant(session, restaurantId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const item = await prisma.menuItem.create({
    data: {
      restaurantId,
      name,
      description: typeof body?.description === "string" ? body.description : "",
      price: typeof body?.price === "number" ? body.price : null,
      category: typeof body?.category === "string" && body.category ? body.category : "General",
      availabilityDays: JSON.stringify(Array.isArray(body?.availabilityDays) ? body.availabilityDays : []),
      availabilityStart: typeof body?.availabilityStart === "string" ? body.availabilityStart : null,
      availabilityEnd: typeof body?.availabilityEnd === "string" ? body.availabilityEnd : null,
      isAvailable: true,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
