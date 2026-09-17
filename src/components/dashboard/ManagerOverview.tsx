import { prisma } from "@/lib/prisma";

export default async function ManagerOverview({ userId }: { userId: string }) {
  const restaurantIds = (await prisma.managerRestaurant.findMany({ where: { userId } })).map(
    (r) => r.restaurantId,
  );

  const [restaurants, ordersActive, totalItems] = await Promise.all([
    prisma.restaurant.findMany({ where: { id: { in: restaurantIds } } }),
    prisma.order.count({
      where: { restaurantId: { in: restaurantIds }, status: { in: ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY"] } },
    }),
    prisma.menuItem.count({ where: { restaurantId: { in: restaurantIds } } }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-maroon">Manager Overview</h1>
      <p className="mt-1 text-sm text-ink/60">
        You manage: {restaurants.map((r) => r.name).join(", ") || "no restaurants yet"}.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-maroon/15 bg-white/60 p-5 text-center">
          <p className="font-serif text-3xl font-semibold text-maroon">{ordersActive}</p>
          <p className="mt-1 text-xs text-ink/60">Active Orders</p>
        </div>
        <div className="rounded-2xl border border-maroon/15 bg-white/60 p-5 text-center">
          <p className="font-serif text-3xl font-semibold text-maroon">{totalItems}</p>
          <p className="mt-1 text-xs text-ink/60">Menu Items</p>
        </div>
      </div>
    </div>
  );
}
