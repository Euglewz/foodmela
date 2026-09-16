import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/activity";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      managerRestaurants: { select: { restaurant: { select: { id: true, name: true } } } },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "MANAGER" && user.role !== "RIDER" && user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const activity = await prisma.activityLog.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const [ordersPlaced, ordersDelivered] = await Promise.all([
    prisma.order.count({ where: { customerId: id } }),
    prisma.order.count({ where: { riderId: id, status: "DELIVERED" } }),
  ]);

  return NextResponse.json({ user, activity, stats: { ordersPlaced, ordersDelivered } });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const newRole = body?.role;
  const restaurantIds: string[] = Array.isArray(body?.restaurantIds) ? body.restaurantIds : [];

  if (session.role === "MANAGER") {
    if (target.role !== "CUSTOMER" && target.role !== "RIDER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (newRole !== "RIDER" && newRole !== "CUSTOMER") {
      return NextResponse.json({ error: "Managers can only set Rider or Customer." }, { status: 400 });
    }
  } else {
    if (newRole !== "MANAGER" && newRole !== "RIDER" && newRole !== "CUSTOMER") {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (target.role === "ADMIN") {
      return NextResponse.json({ error: "The site admin's role cannot be changed." }, { status: 400 });
    }
    if (newRole === "MANAGER" && restaurantIds.length === 0) {
      return NextResponse.json({ error: "Select at least one restaurant to assign." }, { status: 400 });
    }
  }

  const leavingRiderRole = target.role === "RIDER" && newRole !== "RIDER";
  if (leavingRiderRole) {
    const inTransit = await prisma.order.count({ where: { riderId: id, status: "OUT_FOR_DELIVERY" } });
    if (inTransit > 0) {
      return NextResponse.json(
        { error: "This rider has orders out for delivery. Wait until they are delivered before changing the role." },
        { status: 400 },
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { role: newRole } });
    if (leavingRiderRole) {
      await tx.order.updateMany({
        where: { riderId: id, status: { in: ["PENDING", "CONFIRMED"] } },
        data: { riderId: null },
      });
    }
    await tx.managerRestaurant.deleteMany({ where: { userId: id } });
    if (newRole === "MANAGER" && restaurantIds.length > 0) {
      await tx.managerRestaurant.createMany({
        data: restaurantIds.map((restaurantId) => ({ userId: id, restaurantId })),
      });
    }
  });

  await logActivity(id, "ROLE_CHANGED", `Role changed from ${target.role} to ${newRole} by ${session.userId}`);

  const updated = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      managerRestaurants: { select: { restaurant: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json({ user: updated });
}
