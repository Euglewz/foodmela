import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canManageRestaurant } from "@/lib/authz";
import { logActivity } from "@/lib/activity";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const status = typeof body?.status === "string" ? body.status : undefined;
  const riderId = "riderId" in (body ?? {}) ? (body.riderId as string | null) : undefined;

  const data: Record<string, unknown> = {};

  if (session.role === "ADMIN" || session.role === "MANAGER") {
    if (!(await canManageRestaurant(session, order.restaurantId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      data.status = status;
      if (status === "DELIVERED") data.deliveredAt = new Date();
    }
    if (riderId !== undefined) {
      if (riderId) {
        const rider = await prisma.user.findUnique({ where: { id: riderId } });
        if (!rider || rider.role !== "RIDER") {
          return NextResponse.json({ error: "Invalid rider." }, { status: 400 });
        }
      }
      data.riderId = riderId;
    }
  } else if (session.role === "RIDER") {
    if (order.riderId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (status !== "DELIVERED" && status !== "OUT_FOR_DELIVERY") {
      return NextResponse.json({ error: "Riders can only update delivery progress." }, { status: 400 });
    }
    data.status = status;
    if (status === "DELIVERED") data.deliveredAt = new Date();
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data,
    include: {
      items: true,
      restaurant: { select: { id: true, name: true, slug: true } },
      customer: { select: { id: true, name: true, phone: true } },
      rider: { select: { id: true, name: true, phone: true } },
    },
  });

  if (data.status) {
    await logActivity(order.customerId, "ORDER_STATUS_CHANGED", `Order ${order.id} is now ${data.status}`);
  }
  if (data.riderId) {
    await logActivity(data.riderId as string, "ORDER_ASSIGNED", `Assigned order ${order.id}`);
  }

  return NextResponse.json({ order: updated });
}
