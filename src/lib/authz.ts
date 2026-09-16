import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

/** Restaurant ids a session's user is allowed to manage (menu/orders). */
export async function accessibleRestaurantIds(session: SessionPayload): Promise<string[] | "all"> {
  if (session.role === "ADMIN") return "all";
  if (session.role === "MANAGER") {
    const rows = await prisma.managerRestaurant.findMany({
      where: { userId: session.userId },
      select: { restaurantId: true },
    });
    return rows.map((r) => r.restaurantId);
  }
  return [];
}

export async function canManageRestaurant(session: SessionPayload, restaurantId: string): Promise<boolean> {
  const ids = await accessibleRestaurantIds(session);
  if (ids === "all") return true;
  return ids.includes(restaurantId);
}
