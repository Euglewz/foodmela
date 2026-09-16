import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [ordersToday, pendingOrders, activeRiders, totalUsers, totalItems] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY"] } } }),
    prisma.user.count({ where: { role: "RIDER" } }),
    prisma.user.count(),
    prisma.menuItem.count(),
  ]);

  const cards = [
    { label: "Orders Today", value: ordersToday },
    { label: "Pending / Active Orders", value: pendingOrders },
    { label: "Riders", value: activeRiders },
    { label: "Total Accounts", value: totalUsers },
    { label: "Menu Items", value: totalItems },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-maroon">Admin Overview</h1>
      <p className="mt-1 text-sm text-ink/60">Welcome back — here&rsquo;s a snapshot of Food Mela right now.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-maroon/15 bg-white/60 p-5 text-center">
            <p className="font-serif text-3xl font-semibold text-maroon">{card.value}</p>
            <p className="mt-1 text-xs text-ink/60">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/menu" className="rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream hover:bg-maroon-dark">
          Manage Menu
        </Link>
        <Link href="/admin/orders" className="rounded-full border border-maroon/20 px-5 py-2.5 text-sm font-semibold text-maroon hover:bg-maroon/5">
          Manage Orders
        </Link>
        <Link href="/admin/profiles" className="rounded-full border border-maroon/20 px-5 py-2.5 text-sm font-semibold text-maroon hover:bg-maroon/5">
          Manage Profiles
        </Link>
      </div>
    </div>
  );
}
