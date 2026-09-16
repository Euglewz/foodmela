import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { accessibleRestaurantIds } from "@/lib/authz";
import { logActivity } from "@/lib/activity";

const ORDER_INCLUDE = {
  items: true,
  restaurant: { select: { id: true, name: true, slug: true } },
  customer: { select: { id: true, name: true, phone: true } },
  rider: { select: { id: true, name: true, phone: true } },
} as const;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") ?? undefined;
  const scope = searchParams.get("scope") ?? undefined; // "current" | "history"

  let where: Record<string, unknown> = {};

  if (session.role === "ADMIN" || session.role === "MANAGER") {
    const ids = await accessibleRestaurantIds(session);
    where = ids === "all" ? {} : { restaurantId: { in: ids } };
  } else if (session.role === "RIDER") {
    where = { riderId: session.userId };
  } else {
    where = { customerId: session.userId };
  }

  // Managers only confirm orders, so anything past PENDING is history for them.
  const currentStatuses =
    session.role === "MANAGER" ? ["PENDING"] : ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY"];

  if (statusParam) {
    where.status = statusParam;
  } else if (scope === "current") {
    where.status = { in: currentStatuses };
  } else if (scope === "history") {
    where.status = { notIn: currentStatuses };
  }

  const orders = await prisma.order.findMany({
    where,
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Only customers can place orders." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const restaurantId = typeof body?.restaurantId === "string" ? body.restaurantId : "";
  const lines: { id: string; name: string; price: number; qty: number }[] = Array.isArray(body?.lines)
    ? body.lines
    : [];
  const sector = typeof body?.sector === "string" ? body.sector : "";
  const roadNumber = typeof body?.roadNumber === "string" ? body.roadNumber : "";
  const houseDetails = typeof body?.houseDetails === "string" ? body.houseDetails : "";
  const paymentMethod = typeof body?.paymentMethod === "string" ? body.paymentMethod : "";

  if (!restaurantId || lines.length === 0 || !sector || !roadNumber || !houseDetails || !paymentMethod) {
    return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const menuItemIds = lines.map((l) => l.id);
  const existingMenuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true },
  });
  const existingIds = new Set(existingMenuItems.map((m) => m.id));

  const order = await prisma.order.create({
    data: {
      restaurantId,
      customerId: session.userId,
      total,
      sector,
      roadNumber,
      houseDetails,
      paymentMethod,
      items: {
        create: lines.map((line) => ({
          menuItemId: existingIds.has(line.id) ? line.id : null,
          name: line.name,
          price: line.price,
          qty: line.qty,
        })),
      },
    },
    include: ORDER_INCLUDE,
  });

  await logActivity(session.userId, "ORDER_PLACED", `${restaurant.name} — total ${total}`);

  return NextResponse.json({ order }, { status: 201 });
}
